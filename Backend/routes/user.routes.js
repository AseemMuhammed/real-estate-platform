import express from "express";
import { changePassword, getProfile, getPublicProfile, updateProfile } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";

const userRouter = express.Router();

userRouter.get("/profile", protect, getProfile);
userRouter.put("/profile", protect, upload.single("profilePic"), updateProfile);
userRouter.put("/change-password", protect, changePassword);
userRouter.get("/public/:id", getPublicProfile);

export default userRouter;
