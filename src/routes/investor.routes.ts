import { Router } from "express";

const router = Router();

import {
    loginUser,
    logoutUser,
    registerUser
} from "../controllers/investor.controller";
import verifyJWT from "../middlewares/auth.middleware";


router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", verifyJWT, logoutUser);

export default router;