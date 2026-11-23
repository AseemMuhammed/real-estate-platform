import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { addWishlist, getWishlist, removeWishlist } from "../controllers/wishlist.controller.js";

const wishlistRouter = express.Router();

wishlistRouter.use(protect);

wishlistRouter.get("/", getWishlist);
wishlistRouter.post("/:propertyId", addWishlist);
wishlistRouter.delete("/:propertyId", removeWishlist);

export default wishlistRouter;
