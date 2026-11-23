import nodemailer from "nodemailer";
import "../config/env.js";

const PLACEHOLDERS = ["youremail@gmail.com", "your-gmail-app-password"];

const isReal = (value) => Boolean(value && !PLACEHOLDERS.includes(value.trim()));

const hasGmail = () => isReal(process.env.EMAIL_USER) && isReal(process.env.EMAIL_PASS);
const hasBrevo = () => isReal(process.env.BREVO_API_KEY) && isReal(process.env.EMAIL_USER);

export const isEmailConfigured = () => hasGmail() || hasBrevo();

let transporter;

// Gmail transport
const sendWithGmail = async ({ email, subject, html }) => {
    if (!transporter) {
        transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASS.trim(),
            },
        });
    }

    await transporter.sendMail({
        from: `"RealEstate" <${process.env.EMAIL_USER.trim()}>`,
        to: email,
        subject,
        html,
    });
};

// Brevo transport
const sendWithBrevo = async ({ email, subject, html }) => {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: {
            "api-key": process.env.BREVO_API_KEY.trim(),
            "Content-Type": "application/json",
            Accept: "application/json",
        },
        body: JSON.stringify({
            sender: { name: "RealEstate", email: process.env.EMAIL_USER.trim() },
            to: [{ email }],
            subject,
            htmlContent: html,
        }),
    });

    if (!response.ok) {
        const result = await response.json().catch(() => ({}));
        throw new Error(result.message || "Brevo could not send the email");
    }
};

const sendEmail = async ({ email, subject, html }) => {
    if (hasBrevo()) return sendWithBrevo({ email, subject, html });
    if (hasGmail()) return sendWithGmail({ email, subject, html });

    console.log(`[email skipped: not configured] to=${email} subject="${subject}"`);
    return null;
};

export default sendEmail;
