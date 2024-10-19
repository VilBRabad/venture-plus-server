import mongoose, { Document } from "mongoose";

interface linkeInterface {
    title: string;
    link: string;
}

interface IMessage extends Document {
    sender?: mongoose.Types.ObjectId;
    receiver?: mongoose.Types.ObjectId;
    subject: string;
    content: string;
    links?: linkeInterface[];
}

const messageSchema = new mongoose.Schema<IMessage>({
    sender: {
        type: mongoose.Types.ObjectId,
        ref: "Investor"
    },
    receiver: {
        type: String
    },
    subject: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    links: [
        {
            title: {
                type: String
            },
            link: {
                type: String
            }
        }
    ]
}, { timestamps: true });


export const Message = mongoose.model<IMessage>("Message", messageSchema);