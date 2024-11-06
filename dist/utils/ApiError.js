"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message = "Server error!", errors = []) {
        super(message);
        this.statusCode = statusCode;
        this.errors = errors;
        this.name = this.constructor.name;
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, this.constructor);
        }
    }
    // Custom toJSON method to include the message property in the JSON response
    toJSON() {
        return {
            statusCode: this.statusCode,
            message: this.message, // Ensure message is included
            errors: this.errors,
            name: this.name,
        };
    }
}
exports.ApiError = ApiError;
