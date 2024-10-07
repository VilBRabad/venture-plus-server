import { Document, Schema, model } from 'mongoose';


interface IOrganization extends Document {
    Company: string;
    Company_name_for_email?: string;
    Account_stage?: string;
    Employees?: number;
    Industry?: string;
    Website?: string;
    Linkedin_url?: string;
    Facebook_url?: string;
    Twitter_url?: string;
    City?: string;
    State?: string;
    Country?: string;
    Postal_code?: string;
    Address?: string;
    Keywords?: string[];
    Phone_number?: string;
    Technologies?: string[];
    Total_funding?: number;
    Latest_funding?: string;
    Latest_funding_amount?: number;
    Last_raised_at?: Date;
    Annual_revenue?: number;
    SIC_codes?: string;
    Short_description?: string;
    Founded_year?: number;
    logo?: string;
    Stock_symbol?: string
}


const organizationSchema = new Schema<IOrganization>({
    Company: {
        type: String,
        required: true

    },
    Company_name_for_email: {
        type: String,
    },
    Account_stage: {
        type: String,
    },
    Employees: {
        type: Number,
    },
    Industry: {
        type: String,
    },
    Website: {
        type: String,
    },
    Linkedin_url: {
        type: String,
    },
    Facebook_url: {
        type: String,
    },
    Twitter_url: {
        type: String,
    },
    City: {
        type: String,
    },
    State: {
        type: String,
    },
    Country: {
        type: String,
    },
    Postal_code: {
        type: String,
    },
    Address: {
        type: String,
    },
    Keywords: {
        type: [String]
    },
    Phone_number: {
        type: String,
    },
    Technologies: {
        type: [String]
    },
    Total_funding: {
        type: Number,
    },
    Latest_funding: {
        type: String,
    },
    Latest_funding_amount: {
        type: Number,
    },
    Last_raised_at: {
        type: Date,
    },
    Annual_revenue: {
        type: Number,
    },
    SIC_codes: {
        type: String,
    },
    Short_description: {
        type: String,
    },
    Founded_year: {
        type: Number,
    },
    logo: {
        type: String,
    },
    Stock_symbol: {
        type: String
    }
});


export const Organization = model<IOrganization>('Organization', organizationSchema);

