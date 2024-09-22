import { Router } from "express";

const router = Router();

import {
    loginUser,
    logoutUser,
    registerUser,
    updateProfile
} from "../controllers/investor.controller";
import verifyJWT from "../middlewares/auth.middleware";
import { getAllMessages, sendMessage } from "../controllers/message.controller";


router.post("/register", registerUser);
router.post("/login", loginUser);

// Secured routes
router.get("/logout", verifyJWT, logoutUser);
router.post("/update-profile", verifyJWT, updateProfile);

// Secured messaging routes
router.post("/send-message", verifyJWT, sendMessage);
router.get("/get-all-messages", verifyJWT, getAllMessages);

export default router;