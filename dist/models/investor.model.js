"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Investor = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const investorSchema = new mongoose_1.default.Schema({
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
        type: mongoose_1.default.Types.ObjectId,
        ref: "InvestorProfile"
    },
    messages: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Message"
        }
    ],
    history: [
        {
            _id: {
                type: mongoose_1.default.Types.ObjectId
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ],
    paymentsForContactDetails: [
        {
            type: mongoose_1.default.Types.ObjectId,
            ref: "Payment"
        }
    ],
    saveList: [
        {
            type: mongoose_1.default.Types.ObjectId,
            createdAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, { timestamps: true });
investorSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("history")) {
            if (this.history && this.history.length > 30) {
                this.history = this.history.slice(-30);
            }
        }
        if (!this.isModified("password")) {
            return next();
        }
        this.password = yield bcrypt_1.default.hash(this.password, 10);
        return next();
    });
});
investorSchema.methods.isPasswordCorrect = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
investorSchema.methods.generateAccessToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jsonwebtoken_1.default.sign({
            _id: this._id,
            email: this.email
        }, process.env.ACCESS_TOKEN_SECRET, {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        });
    });
};
investorSchema.methods.generateRefreshToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        return jsonwebtoken_1.default.sign({
            _id: this._id
        }, process.env.REFRESH_TOKEN_SECRET, {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        });
    });
};
exports.Investor = mongoose_1.default.model("Investor", investorSchema);
