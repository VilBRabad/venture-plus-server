"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const investor_controller_1 = require("../controllers/investor.controller");
const auth_middleware_1 = __importDefault(require("../middlewares/auth.middleware"));
const message_controller_1 = require("../controllers/message.controller");
router.post("/register", investor_controller_1.registerUser);
router.post("/login", investor_controller_1.loginUser);
// Secured routes
router.get("/logout", auth_middleware_1.default, investor_controller_1.logoutUser);
router.get("/get-user-history", auth_middleware_1.default, investor_controller_1.getUserHistory);
router.post("/update-profile", auth_middleware_1.default, investor_controller_1.updateProfile);
// SaveList secured routes
router.post("/save-to-list", auth_middleware_1.default, investor_controller_1.saveToList);
router.post("/remove-from-list", auth_middleware_1.default, investor_controller_1.removeFromSaveList);
router.get("/get-save-list-data", auth_middleware_1.default, investor_controller_1.getAllSaveListData);
router.post("/remove-all-from-savelist", auth_middleware_1.default, investor_controller_1.removeAllSaveListItems);
// Secured messaging routes
router.post("/send-message", auth_middleware_1.default, message_controller_1.sendMessage);
router.get("/get-all-messages", auth_middleware_1.default, message_controller_1.getAllMessages);
router.post("/add-in-savelist", auth_middleware_1.default, investor_controller_1.addInSaveList);
router.get("/get-current-user", auth_middleware_1.default, investor_controller_1.getCurrentUser);
exports.default = router;
