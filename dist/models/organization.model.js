"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Organization = void 0;
const mongoose_1 = require("mongoose");
const organizationSchema = new mongoose_1.Schema({
    Company: {
        type: String,
        required: true
    },
    Company_name_for_email: {
        type: String,
    },
    Account_stage: {
        type: String,
    },
    Employees: {
        type: Number,
    },
    Industry: {
        type: String,
    },
    Website: {
        type: String,
    },
    Linkedin_url: {
        type: String,
    },
    Facebook_url: {
        type: String,
    },
    Twitter_url: {
        type: String,
    },
    City: {
        type: String,
    },
    State: {
        type: String,
    },
    Country: {
        type: String,
    },
    Postal_code: {
        type: String,
    },
    Address: {
        type: String,
    },
    Keywords: {
        type: [String]
    },
    Phone_number: {
        type: String,
    },
    Technologies: {
        type: [String]
    },
    Total_funding: {
        type: Number,
    },
    Latest_funding: {
        type: String,
    },
    Latest_funding_amount: {
        type: Number,
    },
    Last_raised_at: {
        type: Date,
    },
    Annual_revenue: {
        type: Number,
    },
    SIC_codes: {
        type: String,
    },
    Short_description: {
        type: String,
    },
    Founded_year: {
        type: Number,
    },
    logo: {
        type: String,
    },
    Stock_symbol: {
        type: String
    }
});
exports.Organization = (0, mongoose_1.model)('Organization', organizationSchema);
