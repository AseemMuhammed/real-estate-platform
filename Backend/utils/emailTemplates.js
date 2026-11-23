const layout = (title, body) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b;">
        <h2 style="color: #0d9488; margin-bottom: 16px;">${title}</h2>
        ${body}
        <p style="margin-top: 32px; font-size: 12px; color: #94a3b8;">RealEstate Platform</p>
    </div>
`;

export const verificationEmail = (name, code) =>
    layout(
        "Verify your email",
        `<p>Hi ${name},</p>
         <p>Your verification code is:</p>
         <p style="font-size: 32px; font-weight: 700; letter-spacing: 8px; color: #0f766e;">${code}</p>
         <p>This code expires in 15 minutes.</p>`
    );

export const resetPasswordEmail = (name, url) =>
    layout(
        "Reset your password",
        `<p>Hi ${name},</p>
         <p>Click the button below to set a new password. The link expires in 15 minutes.</p>
         <p><a href="${url}" style="display: inline-block; background: #0d9488; color: #fff; padding: 12px 24px; border-radius: 10px; text-decoration: none; font-weight: 600;">Reset Password</a></p>
         <p style="font-size: 13px; color: #64748b;">${url}</p>`
    );

export const contactEmail = ({ name, email, phone, role, message }) =>
    layout(
        "New contact request",
        `<div style="background: #f8fafc; padding: 20px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone || "N/A"}</p>
            <p><strong>Role:</strong> ${role}</p>
            <p style="margin-top: 15px;"><strong>Message:</strong></p>
            <p style="font-style: italic; color: #475569;">${message}</p>
        </div>`
    );
