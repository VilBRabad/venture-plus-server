import { Router } from "express";

const router = Router();

import {
    getOrganizations,
    getOrganizationById,
    getOrganizationByName,
    getCompanyNames,
    getIndustryTypes,
    getCompanyLocations
} from "../controllers/organization.controller";
import fetchUser from "../middlewares/getUser";
// import fetchUser from "../middlewares/getUser";

//TODO: Add middleware in  get-org-by-id

router.get("/get-organization", fetchUser, getOrganizations);
router.get("/get-organization-by-id", fetchUser, getOrganizationById);
router.get("/get-organization-by-name", getOrganizationByName);
router.get("/get-organization-names", getCompanyNames);
router.get("/get-industries-titles", getIndustryTypes);
router.get("/get-location-countries", getCompanyLocations);


export default router;