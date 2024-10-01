import { Router } from "express";

const router = Router();

import {
    getOrganizations,
    getOrganizationById,
    getOrganizationByName,
    getCompanyNames,
    getIndustries
} from "../controllers/organization.controller";


router.get("/get-organization", getOrganizations);
router.get("/get-organization-by-id", getOrganizationById);
router.get("/get-organization-by-name", getOrganizationByName);
router.get("/get-organization-names", getCompanyNames);
router.get("/get-industries-titles", getIndustries);


export default router;