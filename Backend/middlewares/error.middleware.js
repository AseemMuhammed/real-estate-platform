import multer from "multer";

// Not found
export const notFound = (req, res) => {
    res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.originalUrl}` });
};

// Global error handler
export const errorHandler = (err, req, res, next) => {
    let status = err.statusCode || err.status || 500;
    let message = err.message || "Something went wrong";

    if (err instanceof multer.MulterError) {
        status = 400;
        message = err.code === "LIMIT_FILE_SIZE" ? "Each image must be 5 MB or smaller" : err.field || err.message;
    }

    if (err.name === "ValidationError") {
        status = 400;
        message = Object.values(err.errors).map((e) => e.message).join(", ");
    }

    if (err.name === "CastError") {
        status = 400;
        message = `Invalid ${err.path}`;
    }

    if (err.code === 11000) {
        status = 400;
        const field = Object.keys(err.keyValue || {})[0] || "value";
        message = field === "email" ? "An account with this email already exists" : `Duplicate ${field}`;
    }

    if (err.message === "Not allowed by CORS") status = 403;

    if (status >= 500) console.error(err);

    res.status(status).json({ success: false, message });
};

export class HttpError extends Error {
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
    }
}
