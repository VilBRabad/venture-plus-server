import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Company } from "../models/company.model";


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

        return res.status(200).json(new ApiResponse(200, { companies }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const searchCompany = async (req: Request, res: Response) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        if (!search) return res.status(400).json(new ApiError(400, "Search input must be!"));

        const skip: number = (Number(page) - 1) * Number(limit);

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
                $limit: limit as number
            }
        ])


        return res.status(200).json(new ApiResponse(200, { companies }))

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const getCompanyByCIN = async (req: Request, res: Response) => {
    try {
        const { cin } = req.query;

        if (!cin) return res.status(400).json(new ApiError(400, "CIN number required!"));

        const company = await Company.findOne({ CIN: cin });

        if (!company) return res.status(404).json(new ApiError(404, "Invalid cin number"));



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