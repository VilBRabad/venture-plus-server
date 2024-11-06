"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.History = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const historySchema = new mongoose_1.default.Schema({
    historyType: {
        type: String, // it may: search or going on company profile
    },
    company: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Organization"
    },
    searchText: {
        type: String
    }
}, { timestamps: true });
exports.History = mongoose_1.default.model("History", historySchema);
