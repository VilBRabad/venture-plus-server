import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils"
import { Investor } from "../models/investor.model";
import { InvestorProfile } from "../models/investorProfile.model";
import mongoose from "mongoose";


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
            .json(new ApiResponse(200, { user }, "Login successfully"));

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
        const { focus, investmentStage, fundingAmount, geographicPreferences, strategicAlignment } = req.body;
        const user = req.user;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        if (!focus || !investmentStage || !fundingAmount || !geographicPreferences || !strategicAlignment) {
            return res.status(400).json(new ApiError(400, "All fields required!"));
        }

        const existProfile = await InvestorProfile.findOne({ investor: user._id });

        if (existProfile) {
            existProfile.focus = focus;
            existProfile.investmentStage = investmentStage;
            existProfile.fundingAmount = fundingAmount;
            existProfile.geographicPreferences = geographicPreferences;
            existProfile.strategicAlignment = strategicAlignment;

            await existProfile.save();

            return res.status(200).json(new ApiResponse(200, {}));
        }

        //* If profile not created

        const profile = await InvestorProfile.create({
            focus, investmentStage,
            fundingAmount,
            geographicPreferences,
            strategicAlignment,
            investor: new mongoose.Types.ObjectId(user._id as string)
        })

        user.profile = new mongoose.Types.ObjectId(profile._id as string);

        await user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


export {
    registerUser,
    loginUser,
    logoutUser,
    updateProfile
}