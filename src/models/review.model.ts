import mongoose, { Document, Schema } from "mongoose";
import { IInvestor } from "./investor.model";

export interface IReview extends Document {
    star: number;
    message: string;
    user: IInvestor;
    isPositive: boolean;
}


const reviewSchema = new Schema<IReview>({
    star: {
        type: Number,
        required: true,
        min: [1, "Minimum rating must be 1!"],
        max: [5, "Maximum rating must be 5!"]
    },
    message: {
        type: String,
        required: [true, "Message is required!"]
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Investor",
        required: [true, "User reference required!"]
    },
    isPositive: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Review = mongoose.model("Review", reviewSchema);