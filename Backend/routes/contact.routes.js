import express from "express";
import { createContact } from "../controllers/contact.controller.js";
import { optionalAuth } from "../middlewares/auth.middleware.js";

const contactRouter = express.Router();

contactRouter.post("/", optionalAuth, createContact);

export default contactRouter;
