import { Router } from "express";
const router = Router();

import {
    getCompanies,
    getCompanyByCIN,
    searchCompany
} from "../controllers/company.controller";

router.get("/get-companies", getCompanies);
router.get("/search-company", searchCompany);
router.get("/get-company-by-cin", getCompanyByCIN);

export default router;