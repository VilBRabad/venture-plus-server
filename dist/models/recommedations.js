"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Recommendations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const recommendationsSchema = new mongoose_1.default.Schema({
    user: {
        type: mongoose_1.default.Types.ObjectId,
        ref: "Investor",
        unique: true
    },
    companies: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Organization"
        }
    ]
});
exports.Recommendations = mongoose_1.default.model("Recommendations", recommendationsSchema);
