import express from "express";
import { authorize, protect } from "../middlewares/auth.middleware.js";
import {
    approveSeller,
    deletePropertyAdmin,
    deleteUser,
    getAllInquiries,
    getAllPropertiesAdmin,
    getAllUsers,
    getDashboardStats,
    getPendingSellers,
    rejectSeller,
    toggleBlockUser,
    toggleVerifyProperty,
} from "../controllers/admin.controller.js";
import { deleteContact, getAllContacts, markContactRead } from "../controllers/contact.controller.js";

const adminRouter = express.Router();

adminRouter.use(protect, authorize("admin"));

// Overview
adminRouter.get("/stats", getDashboardStats);

// Users
adminRouter.get("/users", getAllUsers);
adminRouter.patch("/users/:id/block", toggleBlockUser);
adminRouter.delete("/users/:id", deleteUser);

// Seller requests
adminRouter.get("/sellers/pending", getPendingSellers);
adminRouter.patch("/sellers/:id/approve", approveSeller);
adminRouter.delete("/sellers/:id/reject", rejectSeller);

// Properties
adminRouter.get("/properties", getAllPropertiesAdmin);
adminRouter.patch("/properties/:id/verify", toggleVerifyProperty);
adminRouter.delete("/properties/:id", deletePropertyAdmin);

// Inquiries & contacts
adminRouter.get("/inquiries", getAllInquiries);
adminRouter.get("/contacts", getAllContacts);
adminRouter.patch("/contacts/:id/read", markContactRead);
adminRouter.delete("/contacts/:id", deleteContact);

export default adminRouter;
