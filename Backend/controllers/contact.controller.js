import Contact from "../models/contact.model.js";
import sendEmail, { isEmailConfigured } from "../utils/sendEmail.js";
import { contactEmail } from "../utils/emailTemplates.js";

const escapeHtml = (value = "") =>
    String(value).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Create contact
export const createContact = async (req, res) => {
    const { name, email, phone, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
        return res.status(400).json({ success: false, message: "Name, email and message are required" });
    }

    const contact = await Contact.create({
        name,
        email,
        phone,
        message,
        role: req.user?.role || "guest",
    });

    if (isEmailConfigured()) {
        sendEmail({
            email: process.env.EMAIL_USER,
            subject: `New contact message from ${escapeHtml(contact.name)}`,
            html: contactEmail({
                name: escapeHtml(contact.name),
                email: escapeHtml(contact.email),
                phone: escapeHtml(contact.phone),
                role: contact.role,
                message: escapeHtml(contact.message),
            }),
        }).catch((error) => console.error("Admin notification failed:", error.message));
    }

    res.status(201).json({ success: true, message: "Message sent successfully!", contact });
};

// Get all contacts
export const getAllContacts = async (req, res) => {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, count: contacts.length, contacts });
};

// Mark contact read
export const markContactRead = async (req, res) => {
    const contact = await Contact.findByIdAndUpdate(req.params.id, { isRead: true }, { returnDocument: "after" });

    if (!contact) {
        return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, contact });
};

// Delete contact
export const deleteContact = async (req, res) => {
    const contact = await Contact.findByIdAndDelete(req.params.id);

    if (!contact) {
        return res.status(404).json({ success: false, message: "Message not found" });
    }

    res.json({ success: true, message: "Message deleted" });
};
