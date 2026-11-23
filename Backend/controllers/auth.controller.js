import crypto from "crypto";
import User from "../models/user.model.js";
import env from "../config/env.js";
import sendEmail, { isEmailConfigured } from "../utils/sendEmail.js";
import { resetPasswordEmail, verificationEmail } from "../utils/emailTemplates.js";
import { generateCode, generateToken, hashToken, publicUser } from "../utils/helpers.js";

const CODE_TTL = 15 * 60 * 1000;

const sendVerificationCode = async (user) => {
    // const code = generateCode();
    const code = "000000"
    user.verificationCode = code;
    user.verificationExpire = Date.now() + CODE_TTL;
    await user.save();

    await sendEmail({
        email: user.email,
        subject: "Verify your email - RealEstate",
        html: verificationEmail(user.name, code),
    });
};

// Register
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    console.log(req.body)
    if (!name?.trim() || !email?.trim() || !password) {
        return res.status(400).json({ success: false, message: "Name, email and password are required" });
    }

    if (password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const safeRole = role === "seller" ? "seller" : "buyer";
    const exists = await User.findOne({ email: email.trim().toLowerCase() });

    if (exists) {
        return res.status(400).json({ success: false, message: "An account with this email already exists" });
    }

    const requiresVerification = true
    const user = await User.create({
        name: name.trim(),
        email: email.trim(),
        password,
        role: safeRole,
        isApproved: safeRole !== "seller",
        isVerified: !requiresVerification,
    });

    if (requiresVerification) {
        try {
            await sendVerificationCode(user);
        } catch (error) {
            console.error("Verification email failed:", error.message);
            user.isVerified = true;
            await user.save();
        }
    }

    const needsCode = !user.isVerified;
    const approvalNote = safeRole === "seller" ? " Your seller account will be active after admin approval." : "";

   
    res.status(201).json({
        success: true,
        requiresVerification: needsCode,
        requiresApproval: safeRole === "seller",
        message: needsCode
            ? `Account created. We sent a 6-digit code to ${user.email}.${approvalNote}`
            : `Account created successfully. You can now sign in.${approvalNote}`,
        user: publicUser(user),
    });
};

// Login
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
        return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");

    if (!user || !(await user.matchPassword(password))) {
        return res.status(400).json({ success: false, message: "Invalid email or password" });
    }

    if (user.isBlocked) {
        return res.status(403).json({ success: false, message: "Your account has been blocked by an admin. Please contact support." });
    }

    if (!user.isVerified) {
        return res.status(403).json({
            success: false,
            code: "EMAIL_NOT_VERIFIED",
            message: "Please verify your email before signing in",
        });
    }

    if (user.role === "seller" && !user.isApproved) {
        return res.status(403).json({
            success: false,
            code: "PENDING_APPROVAL",
            message: "Your seller account is awaiting admin approval",
        });
    }

    res.status(200).json({
        success: true,
        message: "Login successful",
        token: generateToken(user),
        user: publicUser(user),
    });
};

// Current user
export const getMe = async (req, res) => {
    res.json({ success: true, user: publicUser(req.user) });
};

// Verify email
export const verifyEmail = async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ success: false, message: "Email and code are required" });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+verificationCode +verificationExpire");

    if (!user) {
        return res.status(404).json({ success: false, message: "Account not found" });
    }

    if (user.isVerified) {
        return res.json({ success: true, message: "Email already verified. You can sign in." });
    }
    const valid =
    user.verificationCode === code &&
    user.verificationExpire &&
    user.verificationExpire.getTime() > Date.now();
    
    if (!valid) {
        return res.status(400).json({ success: false, message: "Invalid or expired code" });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Email verified successfully. You can now sign in." });
};

// Resend code
export const resendCode = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase() });

    if (!user) {
        return res.status(404).json({ success: false, message: "Account not found" });
    }

    if (user.isVerified) {
        return res.json({ success: true, message: "Email already verified. You can sign in." });
    }

    await sendVerificationCode(user);
    res.json({ success: true, message: "A new code has been sent to your email" });
};

// Forgot password
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: String(email || "").trim().toLowerCase() });

    const genericMessage = "If this email is registered, a password reset link has been sent.";

    if (!user) return res.json({ success: true, message: genericMessage });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = hashToken(resetToken);
    user.resetPasswordExpire = Date.now() + CODE_TTL;
    await user.save();

    const resetUrl = `${env.clientUrl}/reset-password/${resetToken}`;

    if (!isEmailConfigured()) {
        console.log(`[password reset link] ${resetUrl}`);
        const devLink = process.env.NODE_ENV !== "production" ? { resetUrl } : {};
        return res.json({ success: true, message: genericMessage, ...devLink });
    }

    try {
        await sendEmail({
            email: user.email,
            subject: "Reset your password - RealEstate",
            html: resetPasswordEmail(user.name, resetUrl),
        });
        res.json({ success: true, message: genericMessage });
    } catch (error) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
        console.error("Reset email failed:", error.message);
        res.status(500).json({ success: false, message: "Could not send the reset email. Please try again." });
    }
};

// Reset password
export const resetPassword = async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 6) {
        return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
        resetPasswordToken: hashToken(token),
        resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
        return res.status(400).json({ success: false, message: "This reset link is invalid or has expired" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successfully. Redirecting to login..." });
};
