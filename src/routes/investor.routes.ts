import { Router } from "express";

const router = Router();

import {
    loginUser,
    logoutUser,
    registerUser,
    updateProfile,
    addInSaveList,
    getCurrentUser,
    getUserHistory,
    saveToList,
    removeFromSaveList,
    getAllSaveListData,
    removeAllSaveListItems,
    reviewToApp,
    reviewToCompany
} from "../controllers/investor.controller";
import verifyJWT from "../middlewares/auth.middleware";
import { getAllMessages, sendMessage } from "../controllers/message.controller";


router.post("/register", registerUser);
router.post("/login", loginUser);

// Secured routes
router.get("/logout", verifyJWT, logoutUser);
router.get("/get-user-history", verifyJWT, getUserHistory);
router.post("/update-profile", verifyJWT, updateProfile);

// SaveList secured routes
router.post("/save-to-list", verifyJWT, saveToList);
router.post("/remove-from-list", verifyJWT, removeFromSaveList);
router.get("/get-save-list-data", verifyJWT, getAllSaveListData);
router.post("/remove-all-from-savelist", verifyJWT, removeAllSaveListItems);

// Secured messaging routes
router.post("/send-message", verifyJWT, sendMessage);
router.get("/get-all-messages", verifyJWT, getAllMessages);
router.post("/add-in-savelist", verifyJWT, addInSaveList);
router.get("/get-current-user", verifyJWT, getCurrentUser);

//Reviews
router.post("/send-review", verifyJWT, reviewToApp);
router.post("/send-review-to-company", verifyJWT, reviewToCompany);

export default router;