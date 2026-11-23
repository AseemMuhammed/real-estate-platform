import User from "../models/user.model.js";
import Property from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import Contact from "../models/contact.model.js";
import Wishlist from "../models/wishlist.model.js";
import Chat from "../models/chat.model.js";
import { removePropertyCascade } from "./property.controller.js";

const findManagedUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        res.status(404).json({ success: false, message: "User not found" });
        return null;
    }

    if (user.role === "admin" || String(user._id) === String(req.user._id)) {
        res.status(400).json({ success: false, message: "Admin accounts cannot be modified here" });
        return null;
    }

    return user;
};

// Dashboard stats
export const getDashboardStats = async (req, res) => {
    const [
        totalUsers,
        totalBuyers,
        totalSellers,
        pendingSellers,
        totalProperties,
        soldProperties,
        totalInquiries,
        unreadContacts,
    ] = await Promise.all([
        User.countDocuments({ role: { $ne: "admin" } }),
        User.countDocuments({ role: "buyer" }),
        User.countDocuments({ role: "seller" }),
        User.countDocuments({ role: "seller", isApproved: false }),
        Property.countDocuments(),
        Property.countDocuments({ status: "sold" }),
        Inquiry.countDocuments(),
        Contact.countDocuments({ isRead: false }),
    ]);

    res.json({
        success: true,
        stats: {
            totalUsers,
            totalBuyers,
            totalSellers,
            pendingSellers,
            totalProperties,
            activeListings: totalProperties - soldProperties,
            soldProperties,
            totalInquiries,
            unreadContacts,
        },
    });
};

// All users
export const getAllUsers = async (req, res) => {
    const filter = req.query.role ? { role: req.query.role } : {};
    const users = await User.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, users });
};

// Block / unblock user
export const toggleBlockUser = async (req, res) => {
    const user = await findManagedUser(req, res);
    if (!user) return;

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.json({
        success: true,
        message: user.isBlocked ? "User blocked" : "User unblocked",
        isBlocked: user.isBlocked,
    });
};

// Delete user
export const deleteUser = async (req, res) => {
    const user = await findManagedUser(req, res);
    if (!user) return;

    const properties = await Property.find({ seller: user._id });
    for (const property of properties) {
        await removePropertyCascade(property);
    }

    await Promise.all([
        Wishlist.deleteMany({ user: user._id }),
        Inquiry.deleteMany({ $or: [{ buyer: user._id }, { seller: user._id }] }),
        Chat.deleteMany({ $or: [{ buyer: user._id }, { seller: user._id }] }),
        user.deleteOne(),
    ]);

    res.json({ success: true, message: "User and related data deleted" });
};

// Pending sellers
export const getPendingSellers = async (req, res) => {
    const sellers = await User.find({ role: "seller", isApproved: false }).sort({ createdAt: -1 });
    res.json({ success: true, count: sellers.length, sellers });
};

// Approve seller
export const approveSeller = async (req, res) => {
    const seller = await User.findOne({ _id: req.params.id, role: "seller" });

    if (!seller) {
        return res.status(404).json({ success: false, message: "Seller not found" });
    }

    seller.isApproved = true;
    await seller.save();

    res.json({ success: true, message: `${seller.name} approved as seller` });
};

// Reject seller
export const rejectSeller = async (req, res) => {
    const seller = await User.findOneAndDelete({ _id: req.params.id, role: "seller", isApproved: false });

    if (!seller) {
        return res.status(404).json({ success: false, message: "Pending seller not found" });
    }

    res.json({ success: true, message: "Seller request rejected" });
};

// All properties
export const getAllPropertiesAdmin = async (req, res) => {
    const properties = await Property.find().populate("seller", "name email phone").sort({ createdAt: -1 });
    res.json({ success: true, count: properties.length, properties });
};

// Verify property
export const toggleVerifyProperty = async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    property.isVerified = !property.isVerified;
    await property.save();

    res.json({
        success: true,
        message: property.isVerified ? "Property verified" : "Verification removed",
        isVerified: property.isVerified,
    });
};

// Delete property
export const deletePropertyAdmin = async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    await removePropertyCascade(property);
    res.json({ success: true, message: "Property removed from the platform" });
};

// All inquiries
export const getAllInquiries = async (req, res) => {
    const inquiries = await Inquiry.find()
        .populate("buyer", "name email phone")
        .populate("seller", "name email phone")
        .populate("property", "title price city")
        .sort({ createdAt: -1 });

    res.json({ success: true, count: inquiries.length, inquiries });
};
