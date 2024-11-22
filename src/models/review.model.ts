import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
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