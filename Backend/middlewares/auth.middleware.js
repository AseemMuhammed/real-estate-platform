import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import env from "../config/env.js";

const readToken = (req) => {
    const header = req.headers.authorization || "";
    return header.startsWith("Bearer ") ? header.split(" ")[1] : null;
};

// Protect routes
export const protect = async (req, res, next) => {
    const token = readToken(req);

    if (!token) {
        return res.status(401).json({ success: false, message: "Not authorized, please login" });
    }

    let decoded;
    try {
        decoded = jwt.verify(token, env.jwtSecret);
    } catch {
        return res.status(401).json({ success: false, message: "Session expired, please login again" });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
        return res.status(401).json({ success: false, message: "User no longer exists" });
    }

    if (user.isBlocked) {
        return res.status(403).json({ success: false, message: "Your account has been blocked by an admin" });
    }

    req.user = user;
    next();
};

// Optional auth
export const optionalAuth = async (req, res, next) => {
    const token = readToken(req);
    if (!token) return next();

    try {
        const decoded = jwt.verify(token, env.jwtSecret);
        req.user = await User.findById(decoded.id);
    } catch {
        req.user = null;
    }
    next();
};

// Role based access
export const authorize = (...roles) => (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({
            success: false,
            message: "Access denied: you do not have permission to perform this action",
        });
    }
    next();
};
