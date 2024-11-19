import { app } from "./dist/app.js";
import ServerlessHttp from "serverless-http";

module.exports.hello = ServerlessHttp(app);
