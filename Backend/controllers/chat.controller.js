import Chat from "../models/chat.model.js";
import User from "../models/user.model.js";
import Property from "../models/property.model.js";

const USER_FIELDS = "name email role profilePic";

const populateChat = (query) =>
    query
        .populate("buyer", USER_FIELDS)
        .populate("seller", USER_FIELDS)
        .populate("property", "title price images city");

const isMember = (chat, userId) =>
    [String(chat.buyer?._id || chat.buyer), String(chat.seller?._id || chat.seller)].includes(String(userId));

const toSummary = (chat, userId) => {
    const isBuyer = String(chat.buyer?._id || chat.buyer) === String(userId);
    return {
        _id: chat._id,
        property: chat.property,
        participant: isBuyer ? chat.seller : chat.buyer,
        lastMessage: chat.lastMessage,
        lastMessageAt: chat.lastMessageAt,
        updatedAt: chat.updatedAt,
    };
};

const emitToMembers = (req, chat, event, payload) => {
    const io = req.app.get("io");
    if (!io) return;
    io.to(`user:${chat.buyer._id || chat.buyer}`)
        .to(`user:${chat.seller._id || chat.seller}`)
        .emit(event, payload);
};

// Start or get chat
export const startChat = async (req, res) => {
    const { sellerId, buyerId, propertyId } = req.body;
    const me = req.user;

    let buyer = me._id;
    let seller = sellerId;

    if (me.role === "seller") {
        buyer = buyerId;
        seller = me._id;
    }

    if (propertyId && !sellerId && me.role !== "seller") {
        const property = await Property.findById(propertyId).select("seller");
        seller = property?.seller;
    }

    if (!buyer || !seller) {
        return res.status(400).json({ success: false, message: "Missing buyer or seller" });
    }

    if (String(buyer) === String(seller)) {
        return res.status(400).json({ success: false, message: "You cannot chat with yourself" });
    }

    const other = await User.exists({ _id: me.role === "seller" ? buyer : seller });
    if (!other) {
        return res.status(404).json({ success: false, message: "User not found" });
    }

    let chat = await Chat.findOne({ buyer, seller });

    if (!chat) {
        chat = await Chat.create({ buyer, seller, property: propertyId || undefined });
    } else if (propertyId && String(chat.property) !== String(propertyId)) {
        chat.property = propertyId;
        await chat.save();
    }

    chat = await populateChat(Chat.findById(chat._id).select("-messages"));

    res.json({ success: true, chat: toSummary(chat, me._id) });
};

// My chats
export const getMyChats = async (req, res) => {
    const userId = req.user._id;
    const chats = await populateChat(
        Chat.find({ $or: [{ buyer: userId }, { seller: userId }] }).select("-messages").sort({ lastMessageAt: -1 })
    );

    res.json({ success: true, chats: chats.map((chat) => toSummary(chat, userId)) });
};

// Chat messages
export const getChatMessages = async (req, res) => {
    const chat = await populateChat(Chat.findById(req.params.chatId));

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (!isMember(chat, req.user._id)) {
        return res.status(403).json({ success: false, message: "You are not part of this chat" });
    }

    res.json({ success: true, chat: toSummary(chat, req.user._id), messages: chat.messages });
};

// Send message
export const sendMessage = async (req, res) => {
    const text = String(req.body.text || "").trim();

    if (!text) {
        return res.status(400).json({ success: false, message: "Message cannot be empty" });
    }

    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (!isMember(chat, req.user._id)) {
        return res.status(403).json({ success: false, message: "Not authorized to send messages in this chat" });
    }

    chat.messages.push({ sender: req.user._id, text });
    chat.lastMessage = text;
    chat.lastMessageAt = new Date();
    await chat.save();

    const message = chat.messages[chat.messages.length - 1];

    emitToMembers(req, chat, "receiveMessage", { chatId: String(chat._id), message });

    res.status(201).json({ success: true, message });
};

// Delete message
export const deleteMessage = async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }

    const message = chat.messages.id(req.params.messageId);

    if (!message) {
        return res.status(404).json({ success: false, message: "Message not found" });
    }

    if (String(message.sender) !== String(req.user._id)) {
        return res.status(403).json({ success: false, message: "You can only delete your own messages" });
    }

    chat.messages = chat.messages.filter((m) => String(m._id) !== String(message._id));
    const last = chat.messages[chat.messages.length - 1];
    chat.lastMessage = last?.text || "";
    await chat.save();

    emitToMembers(req, chat, "messageDeleted", { chatId: String(chat._id), messageId: req.params.messageId });

    res.json({ success: true, message: "Message deleted" });
};

// Delete chat
export const deleteChat = async (req, res) => {
    const chat = await Chat.findById(req.params.chatId);

    if (!chat) {
        return res.status(404).json({ success: false, message: "Chat not found" });
    }

    if (!isMember(chat, req.user._id)) {
        return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await chat.deleteOne();

    emitToMembers(req, chat, "chatDeleted", { chatId: String(chat._id) });

    res.json({ success: true, message: "Conversation deleted" });
};
