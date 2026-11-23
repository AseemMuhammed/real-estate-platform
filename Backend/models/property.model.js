import mongoose from "mongoose";

export const PROPERTY_TYPES = [
    "flat",
    "apartment",
    "villa",
    "house",
    "studio",
    "penthouse",
    "office",
    "townhouse",
    "plot",
    "commercial",
];

export const FURNISHING_TYPES = ["furnished", "semi-furnished", "unfurnished"];

const propertySchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: [true, "Title is required"],
            trim: true,
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        listingType: {
            type: String,
            enum: ["sale", "rent"],
            default: "sale",
        },
        city: {
            type: String,
            required: [true, "City is required"],
            trim: true,
        },
        area: {
            type: String,
            required: [true, "Area / locality is required"],
            trim: true,
        },
        address: { type: String, trim: true, default: "" },
        pincode: {
            type: String,
            required: [true, "Pincode is required"],
            trim: true,
        },
        propertyType: {
            type: String,
            enum: PROPERTY_TYPES,
            required: [true, "Property type is required"],
        },
        bhk: { type: Number, min: 0 },
        bathrooms: { type: Number, min: 0 },
        areaSize: { type: Number, min: 0 },
        furnishing: {
            type: String,
            enum: FURNISHING_TYPES,
            default: "unfurnished",
        },
        amenities: [{ type: String, trim: true }],
        status: {
            type: String,
            enum: ["available", "sold"],
            default: "available",
        },
        images: [{ type: String }],
        seller: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        isVerified: { type: Boolean, default: false },
        views: { type: Number, default: 0 },
        viewedBy: { type: [String], default: [], select: false },
    },
    { timestamps: true }
);

propertySchema.index({ city: 1, propertyType: 1, status: 1 });
propertySchema.index({ seller: 1, createdAt: -1 });

const Property = mongoose.model("Property", propertySchema);

export default Property;
