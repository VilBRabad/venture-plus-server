"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
const db_1 = __importDefault(require("./db"));
const PORT = process.env.PORT || 8000;
(0, db_1.default)()
    .then(() => {
    app_1.app.listen(PORT, () => {
        console.log(`Server is runnig on PORT: ${PORT}`);
    });
})
    .catch((error) => {
    console.log("ERROR:", error);
    console.log("Database connection error: ", error);
});
