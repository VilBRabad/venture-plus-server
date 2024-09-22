import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils";
import { Investor } from "../models/investor.model";

interface jwtInterface extends jwt.JwtPayload {
    _id: string;
    email: string;
}

const verifyJWT = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // console.log("Checkpoint 1");
        const token = req.cookies.accessToken || req.headers.authorization?.replace("Bearer ", "");

        if (!token) throw new ApiError(401, "Un-authorized request!");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwtInterface;

        if (!decodedToken) throw new ApiError(401, "Un-authorized request!");
        // console.log(decodedToken._id);
        const user = await Investor.findOne({ _id: decodedToken._id });
        if (!user) throw new ApiError(404, "Unable to find user, Please login again..");

        // console.log("Checkpoint 1");
        // req.user = user;
        next();
    } catch (error) {
        console.log("ERROR: ", error);
        return res.status(500).json(new ApiError(500));
    }
}

export default verifyJWT;