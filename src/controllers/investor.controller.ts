import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils"
import { Investor } from "../models/investor.model";
import { InvestorProfile } from "../models/investorProfile.model";
import mongoose from "mongoose";
import { Organization } from "../models/organization.model";
import { Review } from "../models/review.model";
import { OrgsReview } from "../models/orgsReview.model";

const options = {
    httpOnly: true,
    secure: true,
    path: '/',
}

function isValidEmail(email: string) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(email);
}

function isValidPassword(password: string): { isValid: boolean; message: string } {
    const passwordLenRegex = /^.{8,}$/;
    const lowercaseRegex = /[a-z]/;
    const uppercaseRegex = /[A-Z]/;
    const digitRegex = /[0-9]/;
    const specialCharRegex = /[@$!%*?&]/;

    if (!passwordLenRegex.test(password)) {
        return { isValid: false, message: "Password must be at least 8 characters long." };
    }
    if (!lowercaseRegex.test(password)) {
        return { isValid: false, message: "Password must contain at least one lowercase letter." };
    }
    if (!uppercaseRegex.test(password)) {
        return { isValid: false, message: "Password must contain at least one uppercase." };
    }
    if (!digitRegex.test(password)) {
        return { isValid: false, message: "Password must contain at least one digit." };
    }
    if (!specialCharRegex.test(password)) {
        return { isValid: false, message: "Password must contain at least one special character [@, $, !, %, *, ?, &]." };
    }

    return { isValid: true, message: "Password is valid." };
}

const registerUser = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;


        if (!name || !email || !password) return res.status(400).json(new ApiError(400, "All fields required!"));

        const isEmailValid = isValidEmail(email);
        if (!isEmailValid) return res.status(400).json(new ApiError(400, "Invalid email address"));

        const passwordValid = isValidPassword(password);
        if (!passwordValid.isValid) {
            return res.status(400).json(new ApiError(400, passwordValid.message));
        }
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
            // const focusSet = new Set()
            // if (existProfile.focus && Array.isArray(existProfile.focus) && existProfile.focus.length > 0) {
            //     existProfile.focus.forEach((item) => focusSet.add(item));
            // }

            // console.log(focusSet);

            // if (Array.isArray(focus) && focus.length > 0) {
            //     focus.forEach((item) => focusSet.add(item));
            // }

            // const uniqueFocus = Array.from(focusSet) as string[];
            // console.log(uniqueFocus);

            existProfile.focus = focus;
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

const reviewToApp = async (req: Request, res: Response) => {
    try {
        const { star, message } = req.body;
        const user = req.user;

        if (!user) return res.status(402).json(new ApiError(402, "Un-authorised request"));

        if (!message || !star) {
            return res.status(401).json(new ApiError(401, "message must be!"));
        }

        try {
            const fetchResponse = await fetch(`${process.env.FLASK_SERVER_URL}/analyze-review`, {
                body: JSON.stringify({
                    text: message
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
                method: "POST"
            });
            const resData = await fetchResponse.json();
            const isPositive = resData.sentiment === 1 ? true : false;

            const review = await Review.create({
                star,
                message,
                user: new mongoose.Types.ObjectId(user._id as string),
                isPositive
            });

            if (!review) throw new Error("Error while sending review");

            return res.status(201).json(new ApiResponse(201, {}));
        } catch (error) {
            return res.status(401).json(new ApiError(401, "Error while sentiment analysis!"));
        }
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const reviewToCompany = async (req: Request, res: Response) => {
    try {
        const { companyId, star = undefined, message } = req.body;
        const user = req.user;

        if (!companyId || !message) return res.status(402).json(new ApiError(402, "Message & company Id requies!"));

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request"));

        const review = await OrgsReview.create({
            star,
            message,
            user: new mongoose.Types.ObjectId(user._id as string),
            organization: new mongoose.Types.ObjectId(companyId as string)
        });

        if (!review) throw new Error("Error while creating review!");

        return res.status(201).json(new ApiResponse(201, {}));
    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}

const getLatestComapnyReviews = async (req: Request, res: Response) => {
    try {
        const { page = 1, limit = 10, companyId } = req.query;

        console.log(companyId);
        if (!companyId) return res.status(401).json(new ApiError(401, "Company Id required!"));

        const skip = (Number(page) - 1) * Number(limit);
        const reviews = await OrgsReview.aggregate([
            {
                $match: {
                    organization: new mongoose.Types.ObjectId(companyId as string)
                }
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $lookup: {
                    from: "investors",
                    localField: "user",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: "$userDetails"
            },
            {
                $project: {
                    star: 1,
                    message: 1,
                    createdAt: 1,
                    "userDetails.name": 1,
                    "userDetails.address": 1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            }
        ])
        console.log(reviews);

        return res.status(201).json(new ApiResponse(201, reviews));
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
    removeAllSaveListItems,
    reviewToApp,
    reviewToCompany,
    getLatestComapnyReviews
}