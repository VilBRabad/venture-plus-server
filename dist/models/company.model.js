"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Company = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const companySchema = new mongoose_1.default.Schema({
    CIN: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    CompanyName: {
        type: String,
        required: true,
    },
    CompanyROCcode: {
        type: String,
    },
    CompanyCategory: {
        type: String,
        required: true,
    },
    CompanySubCategory: {
        type: String,
    },
    CompanyClass: {
        type: String,
    },
    AuthorizedCapital: {
        type: String,
    },
    PaidupCapital: {
        type: String,
    },
    CompanyRegistrationdate_date: {
        type: String,
    },
    Registered_Office_Address: {
        type: String,
    },
    Listingstatus: {
        type: String,
    },
    CompanyStatus: {
        type: String,
    },
    CompanyStateCode: {
        type: String,
    },
    isIndianCompany: {
        type: String,
    },
    nic_code: {
        type: String,
    },
    CompanyIndustrialClassification: {
        type: String
    }
});
exports.Company = mongoose_1.default.model("Company", companySchema);
