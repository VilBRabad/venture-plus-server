import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Company } from "../models/company.model";
import { History } from "../models/investorHistory.model";
import mongoose from "mongoose";

type filterType = {
    CompanyStateCode?: string;
    CompanyClass?: string;
    AuthorizedCapital?: string;
}

const getCompanies = async (req: Request, res: Response) => {

    try {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;

        const { state, category, capital } = req.query;

        const filters: filterType = {};

        if (state) filters.CompanyStateCode = state as string;
        if (category) filters.CompanyClass = category as string;
        if (capital) filters.AuthorizedCapital = capital as string;


        // console.log(filters);
        const skip: number = (page - 1) * limit;

        const companies = await Company.aggregate([
            {
                $match: filters
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            },
        ]);

        // console.log(companies);

        return res.status(200).json(new ApiResponse(200, { companies }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const searchCompany = async (req: Request, res: Response) => {
    try {
        const { search } = req.query;
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;

        if (!search) return res.status(400).json(new ApiError(400, "Search input must be!"));

        const skip: number = (page - 1) * limit;

        const companies = await Company.aggregate([
            {
                $match: {
                    CompanyName: {
                        $regex: new RegExp(search as string, 'i')
                    }
                }
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ])
        // console.log(companies);

        const user = req.user;
        if(user){
            const history = await History.create({
                historyType: 'search',
                searchText: search,
            });

            user.history?.push(new mongoose.Types.ObjectId(history._id as string));
            await user.save({validateBeforeSave: false});
        }
        
        return res.status(200).json(new ApiResponse(200, { companies }))

    } catch (error) {
        console.log(error);
        return res.status(500).json(new ApiError(500));
    }
}

const getCompanyByCIN = async (req: Request, res: Response) => {
    try {
        const { cin } = req.query;

        if (!cin) return res.status(400).json(new ApiError(400, "CIN number required!"));

        const company = await Company.findOne({ CIN: cin });

        if (!company) return res.status(404).json(new ApiError(404, "Invalid cin number"));

        const user = req.user;
        if(user){
            const history = await History.create({
                historyType: 'profile',
                company: new mongoose.Types.ObjectId(company._id as string),
                searchText: cin
            })

            user.history?.push(new mongoose.Types.ObjectId(history._id as string));
            await user.save({validateBeforeSave: false});
        }

        return res.status(200).json(new ApiResponse(200, { company }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


export {
    getCompanies,
    searchCompany,
    getCompanyByCIN
}