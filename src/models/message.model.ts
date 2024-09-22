import mongoose, { Document } from "mongoose";

interface IMessage extends Document {
    sender?: mongoose.Types.ObjectId;
    receiver?: mongoose.Types.ObjectId;
    content: string;
}

const messageSchema = new mongoose.Schema<IMessage>({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "Investor"
    },
    receiver: {
        type: mongoose.Types.ObjectId,
        ref: "Company"
    },
    content: {
        type: String,
        required: true
    },
}, { timestamps: true });


export const Message = mongoose.model<IMessage>("Message", messageSchema);