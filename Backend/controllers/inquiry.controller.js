import Inquiry from "../models/inquiry.model.js";
import Property from "../models/property.model.js";

const POPULATE = [
    { path: "buyer", select: "name email phone profilePic" },
    { path: "seller", select: "name email phone profilePic" },
    { path: "property", select: "title price city area images status" },
];

// Send inquiry
export const sendInquiry = async (req, res) => {
    const { propertyId, message } = req.body;

    if (!propertyId || !message?.trim()) {
        return res.status(400).json({ success: false, message: "Property and message are required" });
    }

    const property = await Property.findById(propertyId);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (property.seller.toString() === req.user._id.toString()) {
        return res.status(400).json({ success: false, message: "You cannot inquire about your own listing" });
    }

    const inquiry = await Inquiry.create({
        property: property._id,
        buyer: req.user._id,
        seller: property.seller,
        message: message.trim(),
    });

    await inquiry.populate(POPULATE);

    req.app.get("io")?.to(`user:${property.seller}`).emit("newInquiry", inquiry);

    res.status(201).json({ success: true, message: "Inquiry sent to the seller", inquiry });
};

// Seller inquiries
export const getSellerInquiries = async (req, res) => {
    const inquiries = await Inquiry.find({ seller: req.user._id }).populate(POPULATE).sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
};

// Buyer inquiries
export const getMyInquiries = async (req, res) => {
    const inquiries = await Inquiry.find({ buyer: req.user._id }).populate(POPULATE).sort({ createdAt: -1 });
    res.json({ success: true, count: inquiries.length, inquiries });
};

// Mark as read
export const markInquiryRead = async (req, res) => {
    const inquiry = await Inquiry.findOne({ _id: req.params.id, seller: req.user._id });

    if (!inquiry) {
        return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    inquiry.isRead = true;
    await inquiry.save();

    res.json({ success: true, message: "Inquiry marked as read", inquiry });
};

// Delete inquiry
export const deleteInquiry = async (req, res) => {
    const inquiry = await Inquiry.findOneAndDelete({
        _id: req.params.id,
        $or: [{ seller: req.user._id }, { buyer: req.user._id }],
    });

    if (!inquiry) {
        return res.status(404).json({ success: false, message: "Inquiry not found" });
    }

    res.json({ success: true, message: "Inquiry deleted" });
};
