import { Request, Response, NextFunction } from "express";
import { Investor } from "../models/investor.model";
import jwt from "jsonwebtoken";


const fetchUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const token = req.cookies.accessToken || req.headers.authorization?.replace("Bearer ", "");
        console.log(token);
        if (!token) throw new Error("User not login");

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string) as jwtInterface;
        if (!decodedToken) throw new Error("User not login");

        const user = await Investor.findOne({ _id: decodedToken._id });
        if (!user) throw new Error("User not login");

        req.user = user;
        next();
    } catch (error) {
        next();
    }
}

export default fetchUser;