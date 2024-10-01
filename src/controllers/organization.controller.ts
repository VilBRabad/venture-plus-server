import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Organization } from "../models/organization.model";
import { History } from "../models/investorHistory.model";
import mongoose from "mongoose";

const getOrganizations = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, asc = 1 } = req.query;


        const orgs = await Organization.aggregate([
            {
                $sort: {
                    name: asc === 1 ? 1 : -1
                }
            },
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
            const history = await History.create({
                historyType: 'profile',
                company: new mongoose.Types.ObjectId(org._id as string),
                searchText: _id
            })

            user.history?.push(new mongoose.Types.ObjectId(history._id as string));
            await user.save({ validateBeforeSave: false });
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
                $limit: 10
            },
            {
                $sort: {
                    name: 1
                }
            }
        ]);

        const user = req.user;
        if (orgs && user) {
            const history = await History.create({
                historyType: 'search',
                searchText: name,
            });

            user.history?.push(new mongoose.Types.ObjectId(history._id as string));
            await user.save({ validateBeforeSave: false });
        }

        return res.status(201).json(new ApiResponse(201, { data: orgs }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getCompanyNames = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;

        const orgsNames = await Organization.find({
            name: {
                $regex: new RegExp(search as string, 'i')
            }
        }).select("name logo_url -_id");


        console.log(orgsNames);

        return res.status(201).json(new ApiResponse(201, { data: orgsNames }));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getIndustries = async (req: Request, res: Response) => {
    try {
        const { search } = req.body;

        console.log("Conn..");

        const orgsNames = await Organization.find({}).select("industries -_id").lean();

        // console.log(orgsNames);
        const data = new Set<string>();

        orgsNames.filter(org => {
            if (org.industries && org.industries.trim() !== '') {
                const s: string = org.industries
                const inds = s.split(',');
                inds.forEach(ind =>
                    data.add(ind.trim())
                );
                return org.industries;
            }
        });

        // console.log(data);


        return res.status(201).json(new ApiResponse(201, { data: Array.from(data) }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


export {
    getOrganizations,
    getOrganizationById,
    getOrganizationByName,
    getCompanyNames,
    getIndustries
}