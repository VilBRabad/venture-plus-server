import mongoose, { Document } from "mongoose";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export interface IInvestor extends Document {
    name: string;
    email: string;
    password: string;
    refreshToken?: string;
    address?: string;
    profile?: mongoose.Types.ObjectId;
    messages?: mongoose.Types.ObjectId[];
    history?: mongoose.Types.ObjectId[];
    saveList?: mongoose.Types.ObjectId[];
    paymentsForContactDetails?: mongoose.Types.ObjectId[];
    isPasswordCorrect(password: string): Promise<boolean>;
    generateAccessToken(): Promise<string>;
    generateRefreshToken(): Promise<string>;
}

const investorSchema = new mongoose.Schema<IInvestor>({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
    },
    password: {
        type: String,
        trim: true,
        required: true
    },
    refreshToken: {
        type: String,
    },
    address: {
        type: String
    },
    profile: {
        type: mongoose.Types.ObjectId,
        ref: "InvestorProfile"
    },
    messages: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Message"
        }
    ],
    history: [
        {
            _id: {
                type: mongoose.Types.ObjectId
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    paymentsForContactDetails: [
        {
            type: mongoose.Types.ObjectId,
            ref: "Payment"
        }
    ],
    saveList: [
        {
            type: mongoose.Types.ObjectId,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });



investorSchema.pre("save", async function (next) {
    if (this.isModified("history")) {
        if (this.history && this.history.length > 30) {
            this.history = this.history.slice(-30);
        }
    }

    if (!this.isModified("password")) {
        return next();
    }


    this.password = await bcrypt.hash(this.password, 10);
    return next();
});


investorSchema.methods.isPasswordCorrect = async function (password: string) {
    return await bcrypt.compare(password, this.password);
};



investorSchema.methods.generateAccessToken = async function () {
    return jwt.sign(
        {
            _id: this._id,
            email: this.email
        },
        process.env.ACCESS_TOKEN_SECRET as string,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}


investorSchema.methods.generateRefreshToken = async function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET as string,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}


export const Investor = mongoose.model<IInvestor>("Investor", investorSchema);