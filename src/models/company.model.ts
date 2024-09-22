import mongoose, { Document } from "mongoose";

interface ICompany extends Document {
    CIN: string;
    CompanyName: string;
    CompanyROCcode?: string;
    CompanyCategory: string;
    CompanySubCategory?: string;
    CompanyClass?: string;
    AuthorizedCapital?: string;
    PaidupCapital?: string;
    CompanyRegistrationdate_date?: string;
    Registered_Office_Address?: string;
    Listingstatus?: string;
    CompanyStatus?: string;
    CompanyStateCode?: string;
    isIndianCompany?: string;
    nic_code?: string;
    CompanyIndustrialClassification?: string;
}

const companySchema = new mongoose.Schema<ICompany>({
    CIN: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    CompanyName: {
        type: String,
        required: true,
    },
    CompanyROCcode: {
        type: String,
    },
    CompanyCategory: {
        type: String,
        required: true,
    },
    CompanySubCategory: {
        type: String,
    },
    CompanyClass: {
        type: String,
    },
    AuthorizedCapital: {
        type: String,
    },
    PaidupCapital: {
        type: String,
    },
    CompanyRegistrationdate_date: {
        type: String,
    },
    Registered_Office_Address: {
        type: String,
    },
    Listingstatus: {
        type: String,
    },
    CompanyStatus: {
        type: String,
    },
    CompanyStateCode: {
        type: String,
    },
    isIndianCompany: {
        type: String,
    },
    nic_code: {
        type: String,
    },
    CompanyIndustrialClassification: {
        type: String
    }
});


export const Company = mongoose.model<ICompany>("Company", companySchema);