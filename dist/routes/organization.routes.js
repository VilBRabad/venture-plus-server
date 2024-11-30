"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
const organization_controller_1 = require("../controllers/organization.controller");
const getUser_1 = __importDefault(require("../middlewares/getUser"));
// import fetchUser from "../middlewares/getUser";
//TODO: Add middleware in  get-org-by-id
router.get("/get-organization", getUser_1.default, organization_controller_1.getOrganizations);
router.get("/get-organization-by-id", getUser_1.default, organization_controller_1.getOrganizationById);
router.get("/get-organization-by-name", organization_controller_1.getOrganizationByName);
router.get("/get-organization-names", organization_controller_1.getCompanyNames);
router.get("/get-industries-titles", organization_controller_1.getIndustryTypes);
router.get("/get-location-countries", organization_controller_1.getCompanyLocations);
exports.default = router;
