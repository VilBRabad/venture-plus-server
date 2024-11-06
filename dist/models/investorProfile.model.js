"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestorProfile = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const investorProfileSchema = new mongoose_1.default.Schema({
    focus: {
        type: [String],
    },
    fundingAmount: {
        type: String,
    },
    geographicPreferences: {
        type: String,
    },
    investor: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Investor"
    }
});
exports.InvestorProfile = mongoose_1.default.model("InvestorProfile", investorProfileSchema);
