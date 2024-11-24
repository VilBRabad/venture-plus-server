import mongoose, { Document } from "mongoose";
import { IInvestor } from "./investor.model";
import { IOrganization } from "./organization.model";

export interface IOrgsReview extends Document {
    star?: number;
    message: string;
    user: IInvestor;
    organization: IOrganization;
}

const orgsReviewSchema = new mongoose.Schema<IOrgsReview>({
    star: {
        type: Number
    },
    message: {
        type: String,
        required: [true, "message is required!"]
    },
    user: {
        type: mongoose.Types.ObjectId,
        ref: "Investor",
        required: true
    },
    organization: {
        type: mongoose.Types.ObjectId,
        ref: "Organization",
        required: true
    }
}, { timestamps: true });

export const OrgsReview = mongoose.model("OrgsReview", orgsReviewSchema);