import "dotenv/config";
import { app } from "./app";
import connectDb from "./db";

const PORT = process.env.PORT || 8000;

connectDb()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is runnig on PORT: ${PORT}`);
        })
    })
    .catch((error) => {
        console.log("Database connection error: ", error);
    })