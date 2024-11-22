"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeAllSaveListItems = exports.getAllSaveListData = exports.removeFromSaveList = exports.saveToList = exports.getUserHistory = exports.getCurrentUser = exports.addInSaveList = exports.updateProfile = exports.logoutUser = exports.loginUser = exports.registerUser = void 0;
const utils_1 = require("../utils");
const investor_model_1 = require("../models/investor.model");
const investorProfile_model_1 = require("../models/investorProfile.model");
const mongoose_1 = __importDefault(require("mongoose"));
const organization_model_1 = require("../models/organization.model");
const options = {
    httpOnly: true,
    secure: true,
    path: '/',
};
function isValidEmail(email) {
    const emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
    return emailRegex.test(email);
}
function isValidPassword(password) {
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
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password)
            return res.status(400).json(new utils_1.ApiError(400, "All fields required!"));
        const isEmailValid = isValidEmail(email);
        if (!isEmailValid)
            return res.status(400).json(new utils_1.ApiError(400, "Invalid email address"));
        const passwordValid = isValidPassword(password);
        if (!passwordValid.isValid) {
            return res.status(400).json(new utils_1.ApiError(400, passwordValid.message));
        }
        //existance checking
        const existedUser = yield investor_model_1.Investor.findOne({ email });
        if (existedUser)
            return res.status(400).json(new utils_1.ApiError(400, "User with email id already exists!"));
        const user = yield investor_model_1.Investor.create({
            name, email, password
        });
        if (!user)
            throw new Error("Server error, user not created");
        return res.status(201).json(new utils_1.ApiResponse(201, {}));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.registerUser = registerUser;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if ([email, password].some((field) => field.trim() === ""))
            return res.status(400).json(new utils_1.ApiError(400, "All fields required!"));
        const existedUser = yield investor_model_1.Investor.findOne({ email });
        if (!existedUser)
            return res.status(404).json(new utils_1.ApiError(404, "User not found!"));
        const isPasswordCorrect = yield existedUser.isPasswordCorrect(password);
        if (!isPasswordCorrect)
            return res.status(400).json(new utils_1.ApiError(400, "Wrong credentials"));
        const accessToken = yield existedUser.generateAccessToken();
        const refreshToken = yield existedUser.generateRefreshToken();
        if (!accessToken || !refreshToken)
            return res.status(500).json(new utils_1.ApiError(500, "Error while generating tokens"));
        existedUser.refreshToken = refreshToken;
        existedUser.save({ validateBeforeSave: false });
        const user = yield investor_model_1.Investor.findOne({ _id: existedUser._id }).select("-password -refreshToken");
        return res.status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", refreshToken, options)
            .json(new utils_1.ApiResponse(200, { user, token: { accessToken, refreshToken } }, "Login successfully"));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.loginUser = loginUser;
const logoutUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(new utils_1.ApiResponse(200, {}, "logout successfully"));
});
exports.logoutUser = logoutUser;
const updateProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { address, focus, fundingAmount, geographicPreferences } = req.body;
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        if (!focus || !fundingAmount || !geographicPreferences || !address) {
            return res.status(400).json(new utils_1.ApiError(400, "All fields required!"));
        }
        const existProfile = yield investorProfile_model_1.InvestorProfile.findOne({ investor: user._id });
        if (existProfile) {
            (_a = existProfile.focus) === null || _a === void 0 ? void 0 : _a.push(...focus);
            existProfile.fundingAmount = fundingAmount;
            existProfile.geographicPreferences = geographicPreferences;
            yield existProfile.save();
            return res.status(200).json(new utils_1.ApiResponse(200, {}));
        }
        //* If profile not created
        const profile = yield investorProfile_model_1.InvestorProfile.create({
            focus,
            fundingAmount,
            geographicPreferences,
            investor: new mongoose_1.default.Types.ObjectId(user._id)
        });
        user.profile = new mongoose_1.default.Types.ObjectId(profile._id);
        user.address = address;
        yield user.save({ validateBeforeSave: false });
        return res.status(200).json(new utils_1.ApiResponse(200, {}));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.updateProfile = updateProfile;
const addInSaveList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        const { company } = req.body;
        (_a = user.saveList) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(company));
        user.save({ validateBeforeSave: false });
        return res.status(201).json(new utils_1.ApiResponse(201, {}));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.addInSaveList = addInSaveList;
const getCurrentUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        const userProfile = yield investorProfile_model_1.InvestorProfile.findOne({ investor: user._id });
        const resUser = {
            name: user.name,
            email: user.email,
            messages: user.messages,
            address: user.address,
            history: user.history,
            saveList: user.saveList,
            paymentsForContactDetails: user.paymentsForContactDetails
        };
        return res.status(200).json(new utils_1.ApiResponse(200, { user: resUser, userProfile }));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getCurrentUser = getCurrentUser;
const getUserHistory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        if (!user.history || ((_a = user.history) === null || _a === void 0 ? void 0 : _a.length) === 0)
            throw new Error("Erro");
        const history = yield investor_model_1.Investor.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(user._id)
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
        return res.status(201).json(new utils_1.ApiResponse(201, history[0].historyCompanies));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getUserHistory = getUserHistory;
const saveToList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { company } = req.query;
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        const dbCompany = yield organization_model_1.Organization.findById(company);
        if (!dbCompany)
            return res.status(404).json(new utils_1.ApiError(404, "Company not found!"));
        const objCompany = new mongoose_1.default.Types.ObjectId(dbCompany._id);
        if ((_a = user.saveList) === null || _a === void 0 ? void 0 : _a.includes(objCompany)) {
            return res.status(400).json(new utils_1.ApiError(400, "Already in savelist"));
        }
        (_b = user.saveList) === null || _b === void 0 ? void 0 : _b.push(objCompany);
        user.save({ validateBeforeSave: false });
        return res.status(201).json(new utils_1.ApiResponse(201, {}, "Added to savelist!"));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.saveToList = saveToList;
const removeFromSaveList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.body;
        const user = req.user;
        if (!id)
            return res.status(400).json(new utils_1.ApiError(400, "Inalid id!"));
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        const mongoId = new mongoose_1.default.Types.ObjectId(`${id}`);
        if (!((_a = user.saveList) === null || _a === void 0 ? void 0 : _a.includes(mongoId))) {
            return res.status(400).json(new utils_1.ApiError(400, "Inalid id!"));
        }
        user.saveList = user.saveList.filter((item) => item.toString() !== mongoId.toString());
        user.save({ validateBeforeSave: false });
        return res.status(200).json(new utils_1.ApiResponse(200, {}, "Remove from savelist!"));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.removeFromSaveList = removeFromSaveList;
const getAllSaveListData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        if (!user.saveList || ((_a = user.saveList) === null || _a === void 0 ? void 0 : _a.length) === 0)
            return res.status(400).json(new utils_1.ApiError(400, "Empty savelist!"));
        const orgs = yield organization_model_1.Organization.find({
            _id: {
                $in: user.saveList
            }
        }).select("Company Industry City State Country Keywords logo");
        return res.status(200).json(new utils_1.ApiResponse(200, orgs));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getAllSaveListData = getAllSaveListData;
const removeAllSaveListItems = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        if (!user.saveList || user.saveList.length === 0)
            return res.status(400).json(new utils_1.ApiError(400, "You have not items in the savelist!"));
        user.saveList = [];
        user.save({ validateBeforeSave: false });
        return res.status(200).json(new utils_1.ApiResponse(200, {}, "Removed all items!"));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.removeAllSaveListItems = removeAllSaveListItems;
