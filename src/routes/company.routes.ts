import { Router } from "express";
const router = Router();

import {
    getCompanies,
    getCompanyByCIN,
    searchCompany
} from "../controllers/company.controller";
import fetchUser from "../middlewares/getUser";

router.get("/get-companies", getCompanies);
router.get("/search-company", fetchUser, searchCompany);
router.get("/get-company-by-cin", fetchUser, getCompanyByCIN);

export default router;