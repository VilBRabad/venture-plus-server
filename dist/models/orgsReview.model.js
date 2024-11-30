"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrgsReview = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const orgsReviewSchema = new mongoose_1.default.Schema({
    star: {
        type: Number
    },
    message: {
        type: String,
        required: [true, "message is required!"]
    },
    user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Investor",
        required: [true, "User reference required!"]
    },
    organization: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Organization",
        required: [true, "Organizations reference required!"]
    }
}, { timestamps: true });
exports.OrgsReview = mongoose_1.default.model("OrgsReview", orgsReviewSchema);
