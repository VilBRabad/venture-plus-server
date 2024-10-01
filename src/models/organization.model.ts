import mongoose, { Schema, Document } from 'mongoose';

interface IOrganization extends Document {
    name: string;
    type?: string;
    primary_role?: string;
    cb_url?: string;
    domain?: string;
    homepage_url?: string;
    logo_url?: string;
    facebook_url?: string;
    twitter_url?: string;
    linkedin_url?: string;
    city?: string;
    region?: string;
    country_code?: string;
    short_description: string;
    industries?: string;
    founded_date?: Date;
    founders?: string;
    no_emp?: string;
}

const OrganizationSchema = new Schema<IOrganization>({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
    },
    primary_role: {
        type: String,
    },
    cb_url: {
        type: String,
    },
    domain: {
        type: String,
    },
    homepage_url: {
        type: String,
    },
    logo_url: {
        type: String,
    },
    facebook_url: {
        type: String,
    },
    twitter_url: {
        type: String,
    },
    linkedin_url: {
        type: String,
    },
    city: {
        type: String,
    },
    region: {
        type: String,
    },
    country_code: {
        type: String,
    },
    short_description: {
        type: String,
        required: true
    },
    industries: {
        type: String,
    },
    founded_date: {
        type: Date,
    },
    founders: {
        type: String,
    },
    no_emp: {
        type: String
    },
});


export const Organization = mongoose.model<IOrganization>('Organization', OrganizationSchema);
