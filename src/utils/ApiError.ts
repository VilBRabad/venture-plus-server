class ApiError {
    statusCode: number;
    errors: never[];
    message: string;

    constructor(
        statusCode: number,
        message = "Server error!",
        errors = [],
    ) {
        this.statusCode = statusCode;
        this.message = message;
        this.errors = errors;
    }
}

export { ApiError };