import Property, { PROPERTY_TYPES } from "../models/property.model.js";
import Inquiry from "../models/inquiry.model.js";
import Wishlist from "../models/wishlist.model.js";
import { deleteImages, uploadImages } from "../utils/uploadImage.js";
import { escapeRegex, parseList, toNumber } from "../utils/helpers.js";

const TYPE_GROUPS = {
    flat: ["flat", "apartment", "studio"],
    apartment: ["flat", "apartment", "studio"],
    villa: ["villa", "house", "townhouse"],
    house: ["villa", "house", "townhouse"],
    penthouse: ["penthouse"],
    commercial: ["commercial", "office"],
};

const SORTS = {
    latest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    price_low: { price: 1 },
    price_high: { price: -1 },
    popular: { views: -1 },
};

const SELLER_FIELDS = "name email phone profilePic";

const buildPayload = (body) => {
    const payload = {};
    const text = ["title", "description", "city", "area", "address", "pincode", "propertyType", "furnishing", "listingType", "status"];

    text.forEach((field) => {
        if (body[field] !== undefined) payload[field] = String(body[field]).trim();
    });

    ["price", "bhk", "bathrooms", "areaSize"].forEach((field) => {
        if (body[field] !== undefined) payload[field] = toNumber(body[field]);
    });

    if (body.amenities !== undefined) payload.amenities = parseList(body.amenities);
    if (payload.propertyType) payload.propertyType = payload.propertyType.toLowerCase();
    if (payload.status === "sale") payload.status = "available";

    return Object.fromEntries(
        Object.entries(payload).filter(([, value]) => value !== undefined && value !== "")
    );
};

const isOwner = (property, user) => property.seller.toString() === user._id.toString();

// Add property
export const addProperty = async (req, res) => {
    const payload = buildPayload(req.body);
    const images = await uploadImages(req.files, "properties");

    const property = await Property.create({
        ...payload,
        images,
        seller: req.user._id,
    });

    res.status(201).json({ success: true, message: "Property added successfully", property });
};

// Update property
export const updateProperty = async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (!isOwner(property, req.user)) {
        return res.status(403).json({ success: false, message: "You can only edit your own listings" });
    }

    Object.assign(property, buildPayload(req.body));

    if (req.body.existingImages !== undefined) {
        const keep = parseList(req.body.existingImages);
        const removed = property.images.filter((img) => !keep.includes(img));
        property.images = property.images.filter((img) => keep.includes(img));
        await deleteImages(removed);
    }

    if (req.files?.length) {
        const added = await uploadImages(req.files, "properties");
        property.images = [...property.images, ...added];
    }

    await property.save();

    res.json({ success: true, message: "Property updated successfully", property });
};

// Update status
export const updatePropertyStatus = async (req, res) => {
    const { status } = req.body;

    if (!["available", "sold"].includes(status)) {
        return res.status(400).json({ success: false, message: "Status must be available or sold" });
    }

    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (!isOwner(property, req.user)) {
        return res.status(403).json({ success: false, message: "Not authorized" });
    }

    property.status = status;
    await property.save();

    res.json({ success: true, message: "Property status updated", property });
};

// Delete property
export const deleteProperty = async (req, res) => {
    const property = await Property.findById(req.params.id);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (!isOwner(property, req.user) && req.user.role !== "admin") {
        return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await removePropertyCascade(property);

    res.json({ success: true, message: "Property deleted successfully" });
};

export const removePropertyCascade = async (property) => {
    await deleteImages(property.images);
    await Promise.all([
        Wishlist.deleteMany({ property: property._id }),
        Inquiry.deleteMany({ property: property._id }),
        property.deleteOne(),
    ]);
};

// Get all properties
export const getAllProperties = async (req, res) => {
    const {
        search,
        city,
        area,
        pincode,
        propertyType,
        type,
        bhk,
        furnishing,
        listingType,
        minPrice,
        maxPrice,
        amenities,
        seller,
        sort = "latest",
        page = 1,
        limit = 60,
    } = req.query;

    const query = { status: { $ne: "sold" } };

    if (req.query.status === "sold") query.status = "sold";
    if (req.query.status === "all") delete query.status;
    if (seller) query.seller = seller;
    if (city) query.city = new RegExp(escapeRegex(city), "i");
    if (area) query.area = new RegExp(escapeRegex(area), "i");
    if (pincode) query.pincode = pincode;
    if (listingType) query.listingType = listingType;

    if (search) {
        const rx = new RegExp(escapeRegex(search), "i");
        query.$or = [{ title: rx }, { city: rx }, { area: rx }, { pincode: rx }];
    }

    const types = parseList(propertyType || type).map((t) => t.toLowerCase());
    if (types.length) {
        const expanded = [...new Set(types.flatMap((t) => TYPE_GROUPS[t] || [t]))];
        query.propertyType = { $in: expanded.filter((t) => PROPERTY_TYPES.includes(t)) };
    }

    if (bhk) query.bhk = bhk === "5+" ? { $gte: 5 } : toNumber(bhk);

    const furnishingList = parseList(furnishing);
    if (furnishingList.length) query.furnishing = { $in: furnishingList };

    const amenityList = parseList(amenities);
    if (amenityList.length) query.amenities = { $all: amenityList };

    const min = toNumber(minPrice);
    const max = toNumber(maxPrice);
    if (min !== undefined || max !== undefined) {
        query.price = {};
        if (min !== undefined) query.price.$gte = min;
        if (max !== undefined) query.price.$lte = max;
    }

    const pageNum = Math.max(1, toNumber(page) || 1);
    const limitNum = Math.min(100, Math.max(1, toNumber(limit) || 60));

    const [properties, total] = await Promise.all([
        Property.find(query)
            .populate("seller", SELLER_FIELDS)
            .sort(SORTS[sort] || SORTS.latest)
            .skip((pageNum - 1) * limitNum)
            .limit(limitNum),
        Property.countDocuments(query),
    ]);

    res.json({
        success: true,
        count: properties.length,
        total,
        page: pageNum,
        pages: Math.ceil(total / limitNum),
        properties,
    });
};

// Counts by category
export const getPropertyCounts = async (req, res) => {
    const grouped = await Property.aggregate([
        { $match: { status: { $ne: "sold" } } },
        { $group: { _id: "$propertyType", count: { $sum: 1 } } },
    ]);

    const raw = Object.fromEntries(grouped.map((g) => [g._id, g.count]));
    const sum = (keys) => keys.reduce((total, key) => total + (raw[key] || 0), 0);

    res.json({
        success: true,
        counts: {
            flat: sum(TYPE_GROUPS.flat),
            villa: sum(TYPE_GROUPS.villa),
            penthouse: sum(TYPE_GROUPS.penthouse),
            commercial: sum(TYPE_GROUPS.commercial),
            total: sum(PROPERTY_TYPES),
        },
    });
};

// Property details
export const getPropertyById = async (req, res) => {
    const property = await Property.findById(req.params.id)
        .select("+viewedBy")
        .populate("seller", SELLER_FIELDS);

    if (!property) {
        return res.status(404).json({ success: false, message: "Property not found" });
    }

    const visitorId = req.user ? String(req.user._id) : `ip:${req.ip}`;
    const isSeller = String(property.seller?._id) === visitorId;

    if (!isSeller && !property.viewedBy.includes(visitorId)) {
        property.views += 1;
        property.viewedBy.push(visitorId);
        await property.save();
    }

    const similar = await Property.find({
        _id: { $ne: property._id },
        status: { $ne: "sold" },
        $or: [{ city: property.city }, { propertyType: property.propertyType }],
    })
        .sort({ createdAt: -1 })
        .limit(3);

    const data = property.toObject();
    delete data.viewedBy;

    res.json({ success: true, property: data, similarProperties: similar });
};

// Seller properties
export const getMyProperties = async (req, res) => {
    const properties = await Property.find({ seller: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, count: properties.length, properties });
};

// Seller dashboard
export const getSellerDashboard = async (req, res) => {
    const sellerId = req.user._id;

    const [properties, totalInquiries, unreadInquiries] = await Promise.all([
        Property.find({ seller: sellerId }).select("status views"),
        Inquiry.countDocuments({ seller: sellerId }),
        Inquiry.countDocuments({ seller: sellerId, isRead: false }),
    ]);

    res.json({
        success: true,
        stats: {
            totalProperties: properties.length,
            activeProperties: properties.filter((p) => p.status !== "sold").length,
            soldProperties: properties.filter((p) => p.status === "sold").length,
            totalViews: properties.reduce((sum, p) => sum + (p.views || 0), 0),
            totalInquiries,
            unreadInquiries,
        },
    });
};
