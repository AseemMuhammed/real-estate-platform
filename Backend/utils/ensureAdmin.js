import User from "../models/user.model.js";

export const ensureAdmin = async () => {
    const email = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD;
    if (!email || !password) return;

    const exists = await User.exists({ role: "admin" });
    if (exists) return;

    await User.create({
        name: process.env.ADMIN_NAME || "Super Admin",
        email,
        password,
        role: "admin",
        isVerified: true,
        isApproved: true,
    });

    console.log(`Default admin created: ${email}`);
};
