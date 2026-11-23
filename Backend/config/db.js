import mongoose from "mongoose";
import env from "./env.js";

export const connectDB = async () => {
    if (!env.mongoUri) {
        console.error("MONGO_URI is missing in Backend/.env");
        process.exit(1);
    }

    try {
        const conn = await mongoose.connect(env.mongoUri);
        console.log(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

        // Legacy status migration
        await mongoose.connection
            .collection("properties")
            .updateMany({ status: "sale" }, { $set: { status: "available" } });
    } catch (error) {
        console.error("MongoDB connection failed:", error.message);
        console.error("Check MONGO_URI and Atlas > Network Access (allow your IP or 0.0.0.0/0).");
        process.exit(1);
    }
};
