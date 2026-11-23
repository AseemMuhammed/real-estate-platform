import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import streamifier from "streamifier";
import cloudinary, { isCloudinaryConfigured } from "../config/cloudinary.js";
import env from "../config/env.js";

const UPLOAD_DIR = path.resolve("uploads");

// Cloudinary upload
const uploadToCloudinary = (buffer, folder) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: `real-estate/${folder}`, resource_type: "image" },
            (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });

// Local upload
const uploadToDisk = async (file, folder) => {
    const dir = path.join(UPLOAD_DIR, folder);
    await fs.mkdir(dir, { recursive: true });

    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
    await fs.writeFile(path.join(dir, name), file.buffer);

    return `${env.serverUrl}/uploads/${folder}/${name}`;
};

export const uploadImage = async (file, folder = "properties") => {
    if (isCloudinaryConfigured) {
        try {
            return await uploadToCloudinary(file.buffer, folder);
        } catch (error) {
            console.error("Cloudinary upload failed, saving locally:", error.message);
        }
    }
    return uploadToDisk(file, folder);
};

export const uploadImages = (files = [], folder = "properties") =>
    Promise.all(files.map((file) => uploadImage(file, folder)));

export const deleteImage = async (url) => {
    if (!url) return;

    try {
        if (url.includes("res.cloudinary.com") && isCloudinaryConfigured) {
            const afterUpload = url.split("/upload/")[1];
            if (!afterUpload) return;
            const publicId = afterUpload
                .replace(/^v\d+\//, "")
                .replace(/\.[^/.]+$/, "");
            await cloudinary.uploader.destroy(publicId);
            return;
        }

        const marker = "/uploads/";
        const index = url.indexOf(marker);
        if (index !== -1) {
            const relative = url.slice(index + marker.length);
            const filePath = path.join(UPLOAD_DIR, relative);
            if (filePath.startsWith(UPLOAD_DIR)) await fs.unlink(filePath);
        }
    } catch (error) {
        console.error("Image delete failed:", error.message);
    }
};

export const deleteImages = (urls = []) => Promise.all(urls.map(deleteImage));
