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
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const utils_1 = require("../utils");
const investor_model_1 = require("../models/investor.model");
const verifyJWT = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // console.log("Checkpoint 1");
        const token = req.cookies.accessToken || ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.replace("Bearer ", ""));
        if (!token)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorized request!"));
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decodedToken)
            return res.status(401).json(new utils_1.ApiError(401, "Un-authorized request!"));
        // console.log(decodedToken._id);
        const user = yield investor_model_1.Investor.findOne({ _id: decodedToken._id });
        if (!user)
            return res.status(404).json(new utils_1.ApiError(404, "Unable to find user, Please login again.."));
        // console.log("Checkpoint 1");
        req.user = user;
        next();
    }
    catch (error) {
        // console.log("ERROR: ", error);
        return res.status(500).json(new utils_1.ApiError(500));
    }
});
exports.default = verifyJWT;
