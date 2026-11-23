import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
    deleteInquiry,
    getMyInquiries,
    getSellerInquiries,
    markInquiryRead,
    sendInquiry,
} from "../controllers/inquiry.controller.js";

const inquiryRouter = express.Router();

inquiryRouter.use(protect);

inquiryRouter.post("/", authorize("buyer"), sendInquiry);
inquiryRouter.get("/my", authorize("buyer"), getMyInquiries);
inquiryRouter.get("/seller", authorize("seller"), getSellerInquiries);
inquiryRouter.patch("/:id/read", authorize("seller"), markInquiryRead);
inquiryRouter.delete("/:id", deleteInquiry);

export default inquiryRouter;
