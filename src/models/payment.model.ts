import mongoose, { Document } from "mongoose";

interface IPayment extends Document {
    investor?: mongoose.Types.ObjectId;
    company?: mongoose.Types.ObjectId;
    amount?: string;
    status?: string;
}

const paymentSchema = new mongoose.Schema<IPayment>({
    investor: {
        type: mongoose.Types.ObjectId,
        ref: "Investor"
    },
    company: {
        type: mongoose.Types.ObjectId,
        ref: "Organization"
    },
    amount: {
        type: Number
    },
    status: {
        type: String,
    },
}, { timestamps: true });

export const Payment = mongoose.model<IPayment>("Payment", paymentSchema);