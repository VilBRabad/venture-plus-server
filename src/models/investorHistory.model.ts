import mongoose, { Document } from "mongoose";

interface IHistory extends Document {
    historyType?: string;
    company?: mongoose.Types.ObjectId;
    searchText?: string;
    filtersBySearched?: string[];
}

const historySchema = new mongoose.Schema<IHistory>({
    historyType: {
        type: String, // it may: search or going on company profile
    },
    company: {
        type: mongoose.Types.ObjectId,
        ref: "Organization"
    },
    searchText: {
        type: String
    }
}, { timestamps: true });


export const History = mongoose.model<IHistory>("History", historySchema);
