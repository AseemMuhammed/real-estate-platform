import Wishlist from "../models/wishlist.model.js";
import Property from "../models/property.model.js";

// Get wishlist
export const getWishlist = async (req, res) => {
    const items = await Wishlist.find({ user: req.user._id })
        .populate({ path: "property", populate: { path: "seller", select: "name phone profilePic" } })
        .sort({ createdAt: -1 });

    const valid = items.filter((item) => item.property);

    res.json({
        success: true,
        count: valid.length,
        ids: valid.map((item) => String(item.property._id)),
        wishlist: valid,
    });
};

// Add to wishlist
export const addWishlist = async (req, res) => {
    const { propertyId } = req.params;
    const exists = await Property.exists({ _id: propertyId });

    if (!exists) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    await Wishlist.updateOne(
        { user: req.user._id, property: propertyId },
        { $setOnInsert: { user: req.user._id, property: propertyId } },
        { upsert: true }
    );

    res.status(201).json({ success: true, message: "Added to wishlist" });
};

// Remove from wishlist
export const removeWishlist = async (req, res) => {
    const result = await Wishlist.findOneAndDelete({ user: req.user._id, property: req.params.propertyId });

    if (!result) {
        return res.status(404).json({ success: false, message: "Wishlist item not found" });
    }

    res.json({ success: true, message: "Removed from wishlist" });
};
