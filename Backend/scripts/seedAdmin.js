import mongoose from "mongoose";
import env from "../config/env.js";
import User from "../models/user.model.js";

const seedAdmin = async () => {
    const name = process.env.ADMIN_NAME || "Super Admin";
    const email = (process.env.ADMIN_EMAIL || "admin@realestate.com").toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "Admin@123";

    await mongoose.connect(env.mongoUri);

    let admin = await User.findOne({ email }).select("+password");

    if (admin) {
        admin.role = "admin";
        admin.isVerified = true;
        admin.isApproved = true;
        admin.isBlocked = false;
        admin.password = password;
        await admin.save();
        console.log(`Admin updated: ${email}`);
    } else {
        admin = await User.create({
            name,
            email,
            password,
            role: "admin",
            isVerified: true,
            isApproved: true,
        });
        console.log(`Admin created: ${email}`);
    }

    console.log(`Password: ${password}`);
    await mongoose.disconnect();
};

seedAdmin().catch(async (error) => {
    console.error("Seed failed:", error.message);
    await mongoose.disconnect();
    process.exit(1);
});
