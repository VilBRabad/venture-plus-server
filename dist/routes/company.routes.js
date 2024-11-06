"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const company_controller_1 = require("../controllers/company.controller");
const getUser_1 = __importDefault(require("../middlewares/getUser"));
router.get("/get-companies", company_controller_1.getCompanies);
router.get("/search-company", getUser_1.default, company_controller_1.searchCompany);
router.get("/get-company-by-cin", getUser_1.default, company_controller_1.getCompanyByCIN);
exports.default = router;
