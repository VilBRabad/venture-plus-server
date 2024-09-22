import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Company } from "../models/company.model";


const getCompanyData = async (req: Request, res: Response) => {
    try {
        const page: number = Number(req.query.page) || 1;
        const limit: number = Number(req.query.limit) || 10;

        const skip: number = (page - 1) * limit;

        const companies = await Company.aggregate([
            {
                $limit: limit
            },
            {
                $skip: skip
            }
        ]);

        return res.status(200).json(new ApiResponse(200, companies));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


export {
    getCompanyData
}