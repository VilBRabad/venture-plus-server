import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils"
import { Investor } from "../models/investor.model";
import { InvestorProfile } from "../models/investorProfile.model";
import mongoose from "mongoose";
import { Organization } from "../models/organization.model";

const options = {
    httpOnly: true,
    secure: true,
    path: '/',
}

const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) return res.status(400).json(new ApiError(400, "All fields required!"));

        //existance checking
        const existedUser = await Investor.findOne({ email });

        if (existedUser) return res.status(400).json(new ApiError(400, "User with email id already exists!"));

        const user = await Investor.create({
            name, email, password
        })

        if (!user) throw new Error("Server error, user not created");

        return res.status(201).json(new ApiResponse(201, {}));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        if ([email, password].some((field) => field.trim() === "")) return res.status(400).json(new ApiError(400, "All fields required!"));

        const existedUser = await Investor.findOne({ email });

        if (!existedUser) return res.status(404).json(new ApiError(404, "User not found!"));

        const isPasswordCorrect = await existedUser.isPasswordCorrect(password);

        if (!isPasswordCorrect) return res.status(400).json(new ApiError(400, "Wrong credentials"));

        const accessToken = await existedUser.generateAccessToken();
        const refreshToken = await existedUser.generateRefreshToken();

        if (!accessToken || !refreshToken) return res.status(500).json(new ApiError(500, "Error while generating tokens"));

        existedUser.refreshToken = refreshToken;

        existedUser.save({ validateBeforeSave: false });

        const user = await Investor.findOne({ _id: existedUser._id }).select("-password -refreshToken");

        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new ApiResponse(200, { user, token: { accessToken, refreshToken } }, "Login successfully"));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const logoutUser = async (req: Request, res: Response) => {
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "logout successfully")
        );
}

const updateProfile = async (req: Request, res: Response) => {
    try {
        const { address, focus, fundingAmount, geographicPreferences } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        if (!focus || !fundingAmount || !geographicPreferences || !address) {
            return res.status(400).json(new ApiError(400, "All fields required!"));
        }

        const existProfile = await InvestorProfile.findOne({ investor: user._id });

        if (existProfile) {
            existProfile.focus?.push(...focus);
            existProfile.fundingAmount = fundingAmount;
            existProfile.geographicPreferences = geographicPreferences;

            await existProfile.save();

            return res.status(200).json(new ApiResponse(200, {}));
        }

        //* If profile not created

        const profile = await InvestorProfile.create({
            focus,
            fundingAmount,
            geographicPreferences,
            investor: new mongoose.Types.ObjectId(user._id as string)
        })

        user.profile = new mongoose.Types.ObjectId(profile._id as string);
        user.address = address;

        await user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const addInSaveList = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        const { company } = req.body;

        user.saveList?.push(new mongoose.Types.ObjectId(company as string));

        user.save({ validateBeforeSave: false });

        return res.status(201).json(new ApiResponse(201, {}));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getCurrentUser = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        const userProfile = await InvestorProfile.findOne({ investor: user._id });

        const resUser = {
            name: user.name,
            email: user.email,
            messages: user.messages,
            address: user.address,
            history: user.history,
            saveList: user.saveList,
            paymentsForContactDetails: user.paymentsForContactDetails
        }

        return res.status(200).json(new ApiResponse(200, { user: resUser, userProfile }));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getUserHistory = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        if (!user.history || user.history?.length === 0) throw new Error("Erro");

        const history = await Investor.aggregate([
            {
                $match: {
                    _id: new mongoose.Types.ObjectId(user._id as string)
                }
            },
            {
                $unwind: '$history'
            },
            {
                $sort: {
                    'history.createdAt': -1
                }
            },
            {
                $limit: 10
            },
            {
                $lookup: {
                    from: 'organizations',
                    localField: 'history._id',
                    foreignField: '_id',
                    as: 'historyCompanies'
                }
            },
            {
                $unwind: '$historyCompanies'
            },
            {
                $group: {
                    _id: '$_id',
                    historyCompanies: {
                        $push: '$historyCompanies'
                    }
                }
            }
        ]);

        // const history = await Organization.find({ _id: { $in: user.history } }).select("Company Industry City State Country Keywords logo");

        return res.status(201).json(new ApiResponse(201, history[0].historyCompanies));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const saveToList = async (req: Request, res: Response) => {
    try {
        const { company } = req.query;
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        const dbCompany = await Organization.findById(company as string);

        if (!dbCompany) return res.status(404).json(new ApiError(404, "Company not found!"));


        const objCompany = new mongoose.Types.ObjectId(dbCompany._id as string);
        if (user.saveList?.includes(objCompany)) {
            return res.status(400).json(new ApiError(400, "Already in savelist"));
        }

        user.saveList?.push(objCompany);
        user.save({ validateBeforeSave: false });

        return res.status(201).json(new ApiResponse(201, {}, "Added to savelist!"));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const removeFromSaveList = async (req: Request, res: Response) => {
    try {
        const { id } = req.body;
        const user = req.user;

        if (!id) return res.status(400).json(new ApiError(400, "Inalid id!"));
        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        const mongoId = new mongoose.Types.ObjectId(`${id}`);
        if (!user.saveList?.includes(mongoId)) {
            return res.status(400).json(new ApiError(400, "Inalid id!"));
        }

        user.saveList = user.saveList.filter((item) => item.toString() !== mongoId.toString());
        user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}, "Remove from savelist!"));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const getAllSaveListData = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        if (!user.saveList || user.saveList?.length === 0) return res.status(400).json(new ApiError(400, "Empty savelist!"));

        const orgs = await Organization.find({
            _id: {
                $in: user.saveList
            }
        }).select("Company Industry City State Country Keywords logo");

        return res.status(200).json(new ApiResponse(200, orgs));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const removeAllSaveListItems = async (req: Request, res: Response) => {
    try {
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));
        if (!user.saveList || user.saveList.length === 0) return res.status(400).json(new ApiError(400, "You have not items in the savelist!"));

        user.saveList = [];
        user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}, "Removed all items!"));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


export {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile,
    addInSaveList,
    getCurrentUser,
    getUserHistory,
    saveToList,
    removeFromSaveList,
    getAllSaveListData,
    removeAllSaveListItems
}