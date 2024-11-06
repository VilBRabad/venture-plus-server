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
exports.getAllMessages = exports.sendMessage = void 0;
const utils_1 = require("../utils");
const message_model_1 = require("../models/message.model");
const mongoose_1 = __importDefault(require("mongoose"));
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { message, company, subject, links = [] } = req.body;
        const user = req.user;
        if (!message || !company || !subject)
            return res.status(400).json(new utils_1.ApiError(400, "Message or company details invalid!"));
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        const createdMessage = yield message_model_1.Message.create({
            sender: new mongoose_1.default.Types.ObjectId(user._id),
            receiver: company,
            subject: subject,
            content: message,
            links: links && links.length > 0 ? links : undefined
        });
        if (!createdMessage)
            return res.status(400).json(new utils_1.ApiError(400, "Failed to send message"));
        (_a = user.messages) === null || _a === void 0 ? void 0 : _a.push(new mongoose_1.default.Types.ObjectId(createdMessage._id));
        user.save({ validateBeforeSave: false });
        return res.status(200).json(new utils_1.ApiResponse(200, {}));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.sendMessage = sendMessage;
const getAllMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const { page = 1, limit = 20 } = req.query;
        if (!user)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorised request!"));
        const skip = (Number(page) - 1) * Number(limit);
        const messages = yield message_model_1.Message.aggregate([
            {
                $match: {
                    sender: user._id,
                },
            },
            {
                $sort: {
                    createdAt: -1
                }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            }
        ]);
        return res.status(200).json(new utils_1.ApiResponse(200, { messages }));
    }
    catch (error) {
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.getAllMessages = getAllMessages;
