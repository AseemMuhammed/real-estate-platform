import User from "../models/user.model.js";
import { deleteImage, uploadImage } from "../utils/uploadImage.js";
import { publicUser } from "../utils/helpers.js";

// Get profile
export const getProfile = async (req, res) => {
    res.json({ success: true, user: publicUser(req.user) });
};

// Public profile
export const getPublicProfile = async (req, res) => {
    const user = await User.findById(req.params.id).select("name role profilePic createdAt");

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user });
};

// Update profile
export const updateProfile = async (req, res) => {
    const { name, phone, address, removeProfilePic } = req.body;
    const user = req.user;

    if (name !== undefined) {
        if (!String(name).trim()) {
            return res.status(400).json({ success: false, message: "Full name is required" });
        }
        user.name = String(name).trim();
    }

    if (phone !== undefined) user.phone = String(phone).trim();
    if (address !== undefined) user.address = String(address).trim();

    if (req.file) {
        const previous = user.profilePic;
        user.profilePic = await uploadImage(req.file, "profiles");
        await deleteImage(previous);
    } else if (removeProfilePic === "true" || removeProfilePic === true) {
        await deleteImage(user.profilePic);
        user.profilePic = "";
    }

    await user.save();

    res.json({ success: true, message: "Profile updated successfully", user: publicUser(user) });
};

// Change password
export const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword || newPassword.length < 6) {
        return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!(await user.matchPassword(currentPassword))) {
        return res.status(400).json({ success: false, message: "Current password is incorrect" });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password changed successfully" });
};
