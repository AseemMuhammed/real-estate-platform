import express from "express";
import cors from "cors";
import http from "http";
import path from "path";
import env from "./config/env.js";
import { connectDB } from "./config/db.js";
import { initSocket } from "./socket.js";
import { ensureAdmin } from "./utils/ensureAdmin.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";

import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import propertyRouter from "./routes/property.routes.js";
import inquiryRouter from "./routes/inquiry.routes.js";
import wishlistRouter from "./routes/wishlist.routes.js";
import contactRouter from "./routes/contact.routes.js";
import adminRouter from "./routes/admin.routes.js";
import chatRouter from "./routes/chat.routes.js";

const app = express();

// CORS
const allowedOrigins = [
    env.clientUrl,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
].filter(Boolean);

app.use(
    cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
            callback(new Error("Not allowed by CORS"));
        },
        credentials: true,
    })
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.set("trust proxy", true);

// Static uploads
app.use("/uploads", express.static(path.resolve("uploads")));

// Health
app.get("/", (req, res) => res.send("Real Estate API is running"));
app.get("/api/health", (req, res) => res.json({ success: true, status: "ok", time: new Date().toISOString() }));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/properties", propertyRouter);
app.use("/api/inquiries", inquiryRouter);
app.use("/api/wishlist", wishlistRouter);
app.use("/api/contact", contactRouter);
app.use("/api/admin", adminRouter);
app.use("/api/chat", chatRouter);

// Errors
app.use(notFound);
app.use(errorHandler);

// Server + socket
const server = http.createServer(app);
app.set("io", initSocket(server, allowedOrigins));

const start = async () => {
    await connectDB();
    await ensureAdmin();
    server.listen(env.port, () => {
        console.log(`Server running on ${env.serverUrl}`);
    });
};

start();

export default app;
