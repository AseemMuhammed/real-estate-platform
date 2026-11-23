import jwt from "jsonwebtoken";
import { Server } from "socket.io";
import env from "./config/env.js";

export const initSocket = (server, allowedOrigins) => {
    const io = new Server(server, {
        cors: { origin: allowedOrigins, credentials: true },
    });

    // Socket auth
    io.use((socket, next) => {
        try {
            const { token } = socket.handshake.auth || {};
            const decoded = jwt.verify(token, env.jwtSecret);
            socket.userId = String(decoded.id);
            next();
        } catch {
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        socket.join(`user:${socket.userId}`);

        socket.on("typing", ({ to, chatId }) => {
            if (to) socket.to(`user:${to}`).emit("typing", { chatId, from: socket.userId });
        });
    });

    return io;
};
