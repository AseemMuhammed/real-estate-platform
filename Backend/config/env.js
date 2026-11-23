import dotenv from "dotenv";

dotenv.config({ quiet: true });

const env = {
    port: Number(process.env.PORT) || 5000,
    clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
    serverUrl: process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`,
    mongoUri: process.env.MONGO_URI,
    jwtSecret: process.env.JWT_SECRET || "real-estate-dev-secret",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
};

export default env;
