import mongoose, { Document } from "mongoose";

interface IInvestorProfile extends Document {
    focus?: string;
    investmentStage?: string;
    fundingAmount?: string;
    geographicPreferences?: string;
    strategicAlignment?: string;
    investor?: mongoose.Types.ObjectId;
}

const investorProfileSchema = new mongoose.Schema<IInvestorProfile>({
    focus: {
        type: String,
    },
    fundingAmount: {
        type: String,
    },
    geographicPreferences: {
        type: String,
    },
    investor: {
        type: mongoose.Types.ObjectId,
        ref: "Investor"
    }
});


export const InvestorProfile = mongoose.model<IInvestorProfile>("InvestorProfile", investorProfileSchema);