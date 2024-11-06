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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCompanyByCIN = exports.searchCompany = exports.getCompanies = void 0;
const getCompanies = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    //     const page: number = Number(req.query.page) || 1;
    //     const limit: number = Number(req.query.limit) || 10;
    //     const { state, category, capital } = req.query;
    //     const filters: filterType = {};
    //     if (state) filters.CompanyStateCode = state as string;
    //     if (category) filters.CompanyClass = category as string;
    //     if (capital) filters.AuthorizedCapital = capital as string;
    //     // console.log(filters);
    //     const skip: number = (page - 1) * limit;
    //     const companies = await Company.aggregate([
    //         {
    //             $match: filters
    //         },
    //         {
    //             $skip: skip
    //         },
    //         {
    //             $limit: limit
    //         },
    //     ]);
    //     // console.log(companies);
    //     return res.status(200).json(new ApiResponse(200, { companies }));
    // } catch (error) {
    //     return res.status(500).json(new ApiError(500));
    // }
});
exports.getCompanies = getCompanies;
const searchCompany = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    //     const { search } = req.query;
    //     const page: number = Number(req.query.page) || 1;
    //     const limit: number = Number(req.query.limit) || 10;
    //     if (!search) return res.status(400).json(new ApiError(400, "Search input must be!"));
    //     const skip: number = (page - 1) * limit;
    //     const companies = await Company.aggregate([
    //         {
    //             $match: {
    //                 CompanyName: {
    //                     $regex: new RegExp(search as string, 'i')
    //                 }
    //             }
    //         },
    //         {
    //             $skip: skip
    //         },
    //         {
    //             $limit: limit
    //         }
    //     ])
    //     // console.log(companies);
    //     const user = req.user;
    //     if (user) {
    //         const history = await History.create({
    //             historyType: 'search',
    //             searchText: search,
    //         });
    //         user.history?.push(new mongoose.Types.ObjectId(history._id as string));
    //         await user.save({ validateBeforeSave: false });
    //     }
    //     return res.status(200).json(new ApiResponse(200, { companies }))
    // } catch (error) {
    //     console.log(error);
    //     return res.status(500).json(new ApiError(500));
    // }
});
exports.searchCompany = searchCompany;
const getCompanyByCIN = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // try {
    //     const { cin } = req.query;
    //     if (!cin) return res.status(400).json(new ApiError(400, "CIN number required!"));
    //     const company = await Company.findOne({ CIN: cin });
    //     if (!company) return res.status(404).json(new ApiError(404, "Invalid cin number"));
    //     const user = req.user;
    //     if (user) {
    //         const history = await History.create({
    //             historyType: 'profile',
    //             company: new mongoose.Types.ObjectId(company._id as string),
    //             searchText: cin
    //         })
    //         user.history?.push(new mongoose.Types.ObjectId(history._id as string));
    //         await user.save({ validateBeforeSave: false });
    //     }
    //     return res.status(200).json(new ApiResponse(200, { company }));
    // } catch (error) {
    //     return res.status(500).json(new ApiError(500));
    // }
});
exports.getCompanyByCIN = getCompanyByCIN;
