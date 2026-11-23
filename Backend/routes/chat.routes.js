import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
    deleteChat,
    deleteMessage,
    getChatMessages,
    getMyChats,
    sendMessage,
    startChat,
} from "../controllers/chat.controller.js";

const chatRouter = express.Router();

chatRouter.use(protect);

chatRouter.get("/", getMyChats);
chatRouter.post("/start", startChat);
chatRouter.get("/:chatId", getChatMessages);
chatRouter.post("/:chatId/messages", sendMessage);
chatRouter.delete("/:chatId", deleteChat);
chatRouter.delete("/:chatId/messages/:messageId", deleteMessage);

export default chatRouter;
