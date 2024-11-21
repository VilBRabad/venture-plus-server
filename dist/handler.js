"use strict";

const serverlessHttp = require("serverless-http"); // Correct import
const { app } = require("./app.js"); // Ensure app.js exports your Express app

module.exports.hello = serverlessHttp(app);
