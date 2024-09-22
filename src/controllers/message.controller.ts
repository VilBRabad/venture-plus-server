import { Request, Response } from "express";
import { ApiError, ApiResponse } from "../utils";
import { Message } from "../models/message.model";
import mongoose from "mongoose";

const sendMessage = async (req: Request, res: Response) => {
    try {
        const { message, company } = req.body;
        const user = req.user;

        if (!message || !company) return res.status(400).json(new ApiError(400, "Message or company details invalid!"));

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        const createdMessage = await Message.create({
            sender: new mongoose.Types.ObjectId(user._id as string),
            receiver: new mongoose.Types.ObjectId(company as string),
            content: message
        });

        if (!createdMessage) return res.status(400).json(new ApiError(400, "Failed to send message"));

        user.messages?.push(new mongoose.Types.ObjectId(createdMessage._id as string));

        user.save({ validateBeforeSave: false });

        return res.status(200).json(new ApiResponse(200, {}));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


const getAllMessages = async (req: Request, res: Response) => {
    try {
        const user = req.user;
        const { page = 1, limit = 10 } = req.query;

        if (!user) return res.status(401).json(new ApiError(401, "Un-authorised request!"));

        const skip: number = (Number(page) - 1) * Number(limit);
        const messages = await Message.aggregate([
            {
                $match: {
                    sender: user._id,
                },
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            }
        ]);

        return res.status(200).json(new ApiResponse(200, { messages }));

    } catch (error) {
        return res.status(500).json(new ApiError(500));
    }
}


export {
    sendMessage,
    getAllMessages
}