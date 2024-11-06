"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Payment = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const paymentSchema = new mongoose_1.default.Schema({
    investor: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Investor"
    },
    company: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Organization"
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
    },
}, { timestamps: true });
exports.Payment = mongoose_1.default.model("Payment", paymentSchema);
