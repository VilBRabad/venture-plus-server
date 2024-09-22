class ApiError extends Error {
    statusCode: number;
    errors: never[];
    message: string;

    constructor(
        statusCode: number,
        message = "Server error!",
        errors = [],
    ) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
    }
}

export { ApiError };