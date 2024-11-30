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
exports.getCompanyLocations = exports.getIndustryTypes = exports.getCompanyNames = exports.getOrganizationByName = exports.getOrganizationById = exports.getOrganizations = void 0;
const utils_1 = require("../utils");
const organization_model_1 = require("../models/organization.model");
const mongoose_1 = __importDefault(require("mongoose"));
const investorProfile_model_1 = require("../models/investorProfile.model");
function suffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
const getOrganizations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { page = 1, limit = 15, asc = 1, industries = [], countries = [], revenue = "" } = req.query;
        // const user = req.user;
        const token = req.headers.authorization; // should be bearer token
        const user = req.user;
        let recommendedCompanies = [];
        if (token && industries.length === 0 && countries.length === 0 && !revenue && page <= 1) {
            try {
                const fetchResponse = yield fetch(`${process.env.FLASK_SERVER_URL}/recommend`, {
                    headers: {
                        'Authorization': token,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    method: "POST"
                });
                const resData = yield fetchResponse.json();
                const data = resData.data;
                const ids = data.map((id) => new mongoose_1.default.Types.ObjectId(id));
                // console.log(data);
                if (data && Array.isArray(data) && data.length > 0) {
                    const suffleIds = suffleArray([...ids]);
                    const companies = yield organization_model_1.Organization.aggregate([
                        {
                            $match: {
                                _id: {
                                    $in: suffleIds
                                }
                            }
                        },
                        {
                            $limit: 20
                        }
                    ]);
                    // console.log("Companies: ", companies);
                    recommendedCompanies = companies;
                    console.log("RECO LEN: ", recommendedCompanies.length);
                    if (companies.length > 7) {
                        return res.status(201).json(new utils_1.ApiResponse(201, { data: companies, totalPages: 2, isRecommendation: true }));
                    }
                }
            }
            catch (error) {
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
        const countResult = yield organization_model_1.Organization.aggregate([
            ...pipeline,
            {
                $count: "totalCount"
            }
        ]);
        if (pipeline.length === 0 && page <= 1) {
            if (user) {
                const userProfile = yield investorProfile_model_1.InvestorProfile.findOne({ investor: user._id });
                // console.log((userProfile && userProfile.focus) ? userProfile.focus : "Vilas");
                if (userProfile && userProfile.geographicPreferences && userProfile.focus) {
                    pipeline.push({
                        $match: {
                            $or: [
                                { Country: userProfile.geographicPreferences },
                                { Industry: { $in: [...userProfile.focus] } }
                            ]
                        }
                    });
                }
            }
        }
        const totalCount = countResult.length > 0 ? countResult[0].totalCount : 0;
        // Step 2: Calculate number of pages
        const totalPages = Math.ceil(totalCount / limit);
        pipeline.push({ $skip: (Number(page) - 1) * Number(limit) });
        pipeline.push({ $limit: Number(limit) });
        const orgs = yield organization_model_1.Organization.aggregate([
            ...pipeline
        ]);
        return res.status(201).json(new utils_1.ApiResponse(201, { data: [...recommendedCompanies, ...orgs], totalPages, isRecommendation: recommendedCompanies.length > 0 ? true : false }));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getOrganizations = getOrganizations;
const getOrganizationById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { _id } = req.query;
        if (!_id)
            return res.status(400).json(new utils_1.ApiError(400, "Invalid details"));
        const org = yield organization_model_1.Organization.findById(_id);
        if (!org)
            return res.status(404).json(new utils_1.ApiError(404, "Company not foudnd!"));
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
                (_a = user.history) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(_id));
                yield user.save({ validateBeforeSave: false });
            }
        }
        return res.status(201).json(new utils_1.ApiResponse(201, { data: org }));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getOrganizationById = getOrganizationById;
const getOrganizationByName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.query;
        if (!name)
            return res.status(400).json(new utils_1.ApiError(400, "Invalid name!"));
        const orgs = yield organization_model_1.Organization.aggregate([
            {
                $match: {
                    name: {
                        $regex: new RegExp(name, 'i')
                    }
                }
            },
            {
                $limit: 20
            }
        ]);
        return res.status(201).json(new utils_1.ApiResponse(201, { data: orgs }));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getOrganizationByName = getOrganizationByName;
const getCompanyNames = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        const orgsNames = yield organization_model_1.Organization.find({
            Company: {
                $regex: new RegExp(search, 'i')
            }
        }).limit(5).select("Company logo");
        // console.log(orgsNames);
        return res.status(201).json(new utils_1.ApiResponse(201, { data: orgsNames }));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getCompanyNames = getCompanyNames;
const getIndustryTypes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        // console.log(search);
        const searchText = `${search}`;
        const regex = new RegExp(searchText, 'i');
        const industries = yield organization_model_1.Organization.aggregate([
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
        ]);
        return res.status(201).json(new utils_1.ApiResponse(201, { industries: industries[0].allIndustry }));
    }
    catch (error) {
        // console.log(error);
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getIndustryTypes = getIndustryTypes;
const getCompanyLocations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "" } = req.query;
        const searchText = `${search}`;
        const regex = new RegExp(searchText, 'i');
        const locationCountries = yield organization_model_1.Organization.aggregate([
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
        ]);
        return res.status(201).json(new utils_1.ApiResponse(201, { industries: locationCountries[0].allLocations }));
    }
    catch (error) {
        // console.log(error);
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getCompanyLocations = getCompanyLocations;
