import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Organization } from "../models/organization.model";
import mongoose from "mongoose";
import { InvestorProfile } from "../models/investorProfile.model";

interface RequestBody {
    page?: number;
    limit?: number;
    asc?: number;
    industries?: string[];
    countries?: string[];
    revenue?: string;
}

// function suffleArray(array: string[]) {
//     for (let i = array.length - 1; i > 0; i--) {
//         const j = Math.floor(Math.random() * (i + 1));
//         [array[i], array[j]] = [array[j], array[i]];
//     }
//     return array;
// }

const getOrganizations = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 15, asc = 1, industries = [], countries = [], revenue = "" }: RequestBody = req.query;
        // const user = req.user;
        const token = req.headers.authorization; // should be bearer token
        const user = req.user;

        let recommendedCompanies = [];

        if (token && industries.length === 0 && countries.length === 0 && !revenue && page <= 1 && user) {
            try {
                // console.log(process.env.FLASK_SERVER_URL);
                const fetchResponse = await fetch(`${process.env.FLASK_SERVER_URL}/recommend`, {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    method: "POST"
                });
                const resData = await fetchResponse.json();

                const data = resData.data;
                const ids = data.map((id: string) => new mongoose.Types.ObjectId(id));

                // console.log(data);
                const userProfile = await InvestorProfile.findOne({ investor: user._id });

                if (data && Array.isArray(data) && data.length > 0) {
                    // const suffleIds = suffleArray([...ids]);
                    const companies = await Organization.aggregate([
                        {
                            $match: {
                                _id: {
                                    $in: ids
                                }
                            }
                        },
                        {
                            $addFields: {
                                sortKey: {
                                    $cond: {
                                        if: { $eq: ["$Country", userProfile && userProfile.geographicPreferences ? userProfile.geographicPreferences : ""] },
                                        then: 0,
                                        else: 1
                                    }
                                },
                                sortIndex: { $indexOfArray: [ids, "$_id"] }
                            }
                        },
                        {
                            $sort: { sortKey: 1, sortIndex: 1 }
                        },
                        {
                            $project: { sortKey: 0, sortIndex: 0 }
                        },
                        {
                            $limit: 20
                        }
                    ]);

                    // console.log("Companies: ", companies);
                    recommendedCompanies = companies;
                    // console.log("RECO LEN: ", recommendedCompanies.length);

                    if (companies.length > 7) {
                        return res.status(201).json(new ApiResponse(201, { data: companies, totalPages: 2, isRecommendation: true }));
                    }
                }
            } catch (error) {
                console.error("Microservice-1 is offline....!");
            }
        }

        const pipeline = [];

        if (industries && industries.length > 0) {
            pipeline.push({
                $match: {
                    Industry: { $in: industries }
                }
            });
        }

        if (countries && countries.length > 0) {
            pipeline.push({
                $match: {
                    Country: { $in: countries }
                }
            });
        }

        if (revenue && revenue !== "") {
            pipeline.push({
                $match: {
                    Annual_revenue: { $gte: Number(revenue) }
                }
            });
        }

        const countResult = await Organization.aggregate([
            ...pipeline,
            {
                $count: "totalCount"
            }
        ])

        if (pipeline.length === 0 && page <= 1) {
            if (user) {
                const userProfile = await InvestorProfile.findOne({ investor: user._id });

                // console.log((userProfile && userProfile.focus) ? userProfile.focus : "Vilas");
                if (userProfile && userProfile.geographicPreferences && userProfile.focus) {
                    pipeline.push({
                        $match: {
                            $or: [
                                { Country: userProfile.geographicPreferences },
                                { Industry: { $in: [...userProfile.focus] } }
                            ]
                        }
                    })
                }
            }
        }


        const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;

        // Step 2: Calculate number of pages
        const totalPages = Math.ceil(totalCount / limit);

        pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
        pipeline.push({ $limit: Number(limit) });

        const orgs = await Organization.aggregate([
            ...pipeline
        ]);


        return res.status(201).json(new ApiResponse(201, { data: [...recommendedCompanies, ...orgs], totalPages, isRecommendation: recommendedCompanies.length > 0 ? true : false }));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}



const getOrganizationById = async (req: Request, res: Response) => {
    try {
        const { _id } = req.query;

        if (!_id) return res.status(400).json(new ApiError(400, "Invalid details"));

        const org = await Organization.findById(_id);

        if (!org) return res.status(404).json(new ApiError(404, "Company not foudnd!"));

        const user = req.user;
        if (user) {
            let isExists = false;
            if (user.history) {
                for (const histEl of user.history) {
                    if (String(histEl._id) === _id) {
                        isExists = true;
                        break;
                    }
                }
            }
            if (!isExists) {
                user.history?.push(new mongoose.Types.ObjectId(_id as string));
                await user.save({ validateBeforeSave: false });
            }
        }

        return res.status(201).json(new ApiResponse(201, { data: org }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getOrganizationByName = async (req: Request, res: Response) => {
    try {
        const { name } = req.query;

        if (!name) return res.status(400).json(new ApiError(400, "Invalid name!"));

        const orgs = await Organization.aggregate([
            {
                $match: {
                    name: {
                        $regex: new RegExp(name as string, 'i')
                    }
                }
            },
            {
                $limit: 20
            }
        ]);

        return res.status(201).json(new ApiResponse(201, { data: orgs }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getCompanyNames = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        const orgsNames = await Organization.find({
            Company: {
                $regex: new RegExp(search as string, 'i')
            }
        }).limit(5).select("Company logo");


        // console.log(orgsNames);

        return res.status(201).json(new ApiResponse(201, { data: orgsNames }));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getIndustryTypes = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        // console.log(search);
        const searchText = `${search}`;
        const regex = new RegExp(searchText, 'i');

        const industries = await Organization.aggregate([
            {
                $match: {
                    Industry: { $regex: regex }
                }
            },
            {
                $group: {
                    _id: null,
                    allIndustry: { $addToSet: "$Industry" }
                }
            },
            {
                $project: {
                    _id: 0,
                    allIndustry: {
                        $slice: ["$allIndustry", 1000]
                    }
                }
            }
        ])


        return res.status(201).json(new ApiResponse(201, { industries: industries[0].allIndustry }));

    } catch (error) {
        // console.log(error);
        return res.status(500).json(new ApiError(500));
    }
}


const getCompanyLocations = async (req: Request, res: Response) => {
    try {
        const { search = "" } = req.query;
        const searchText = `${search}`;
        const regex = new RegExp(searchText, 'i');

        const locationCountries = await Organization.aggregate([
            {
                $match: {
                    Country: { $regex: regex }
                }
            },
            {
                $group: {
                    _id: null,
                    allLocations: { $addToSet: "$Country" }
                }
            },
            {
                $project: {
                    _id: 0,
                    allLocations: {
                        $slice: ["$allLocations", 1000]
                    }
                }
            }
        ])


        return res.status(201).json(new ApiResponse(201, { industries: locationCountries[0].allLocations }));

    } catch (error) {
        // console.log(error);
        return res.status(500).json(new ApiError(500));
    }
}

export {
    getOrganizations,
    getOrganizationById,
    getOrganizationByName,
    getCompanyNames,
    getIndustryTypes,
    getCompanyLocations
}