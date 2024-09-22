import mongoose from "mongoose";

const connectDb = async()=>{
    try {
        await mongoose.connect(`${process.env.DATABASE_URI}/${process.env.DB_NAME}`);
        console.log("Database Connected...!!");
    } catch (error) {
        console.log("Error to connect database...!")
        process.exit(1);
    }
}

export default connectDb;