import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Organization } from "../models/organization.model";
import mongoose from "mongoose";

const getOrganizations = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, asc = 1 } = req.query;


        const orgs = await Organization.aggregate([
            {
                $skip: (Number(page) - 1) * Number(limit)
            },
            {
                $limit: Number(limit)
            }
        ]);

        return res.status(201).json(new ApiResponse(201, { data: orgs }));
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
            user.history?.push(new mongoose.Types.ObjectId(_id as string));
            await user.save({ validateBeforeSave: false });
        }

        return res.status(201).json(new ApiResponse(201, { data: org }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getOrganizationByName = async (req: Request, res: Response) => {
    // try {
    //     const { name } = req.query;

    //     if (!name) return res.status(400).json(new ApiError(400, "Invalid name!"));

    //     const orgs = await Organization.aggregate([
    //         {
    //             $match: {
    //                 name: {
    //                     $regex: new RegExp(name as string, 'i')
    //                 }
    //             }
    //         },
    //         {
    //             $limit: 10
    //         },
    //         {
    //             $sort: {
    //                 name: 1
    //             }
    //         }
    //     ]);

    //     const user = req.user;
    //     if (orgs && user) {
    //         const history = await History.create({
    //             historyType: 'search',
    //             searchText: name,
    //         });

    //         user.history?.push(new mongoose.Types.ObjectId(history._id as string));
    //         await user.save({ validateBeforeSave: false });
    //     }

    //     return res.status(201).json(new ApiResponse(201, { data: orgs }));

    // } catch (error) {
    //     return res.status(500).json(new ApiError(500));
    // }
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
                        $slice: ["$allIndustry", 5]
                    }
                }
            }
        ])


        return res.status(201).json(new ApiResponse(201, { industries: industries[0].allIndustry }));

    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError(500));
    }
}


export {
    getOrganizations,
    getOrganizationById,
    getOrganizationByName,
    getCompanyNames,
    getIndustryTypes
}