import mongoose, { Document, Schema } from "mongoose";
import { IInvestor } from "./investor.model";

export interface IReview extends Document {
    star?: number;
    message: string;
    user: IInvestor;
}


const reviewSchema = new Schema<IReview>({
    star: {
        type: Number
    },
    message: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Investor",
        required: true
    }
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);