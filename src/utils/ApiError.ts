class ApiError extends Error {
    statusCode: number;
    errors: never[];

    constructor(
        statusCode: number,
        message = "Server error!",
        errors: never[] = []
    ) {
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
            message: this.message,  // Ensure message is included
            errors: this.errors,
            name: this.name,
        };
    }
}

export { ApiError };
