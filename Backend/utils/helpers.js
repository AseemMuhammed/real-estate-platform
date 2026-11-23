import crypto from "crypto";
import jwt from "jsonwebtoken";
import env from "../config/env.js";

export const generateToken = (user) =>
    jwt.sign({ id: user._id, role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const generateCode = () => crypto.randomInt(100000, 1000000).toString();

export const hashToken = (value) => crypto.createHash("sha256").update(String(value)).digest("hex");

export const parseList = (value) => {
    if (value === undefined || value === null || value === "") return [];
    if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);

    const text = String(value).trim();
    if (text.startsWith("[")) {
        try {
            return JSON.parse(text).map((v) => String(v).trim()).filter(Boolean);
        } catch {
            return [];
        }
    }
    return text.split(",").map((v) => v.trim()).filter(Boolean);
};

export const toNumber = (value) => {
    if (value === undefined || value === null || value === "") return undefined;
    const n = Number(value);
    return Number.isNaN(n) ? undefined : n;
};

export const escapeRegex = (value = "") => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const publicUser = (user) => ({
    _id: user._id,
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone || "",
    address: user.address || "",
    profilePic: user.profilePic || "",
    isVerified: user.isVerified,
    isApproved: user.isApproved,
    createdAt: user.createdAt,
});
