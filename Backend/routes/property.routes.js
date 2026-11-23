import express from "express";
import upload from "../middlewares/upload.middleware.js";
import { authorize, optionalAuth, protect } from "../middlewares/auth.middleware.js";
import {
    addProperty,
    deleteProperty,
    getAllProperties,
    getMyProperties,
    getPropertyById,
    getPropertyCounts,
    getSellerDashboard,
    updateProperty,
    updatePropertyStatus,
} from "../controllers/property.controller.js";

const propertyRouter = express.Router();

// Public
propertyRouter.get("/", getAllProperties);
propertyRouter.get("/counts", getPropertyCounts);

// Seller
propertyRouter.get("/seller/my", protect, authorize("seller"), getMyProperties);
propertyRouter.get("/seller/dashboard", protect, authorize("seller"), getSellerDashboard);
propertyRouter.post("/", protect, authorize("seller"), upload.array("images", 10), addProperty);
propertyRouter.put("/:id", protect, authorize("seller"), upload.array("images", 10), updateProperty);
propertyRouter.patch("/:id/status", protect, authorize("seller"), updatePropertyStatus);
propertyRouter.delete("/:id", protect, authorize("seller", "admin"), deleteProperty);

// Details
propertyRouter.get("/:id", optionalAuth, getPropertyById);

export default propertyRouter;
