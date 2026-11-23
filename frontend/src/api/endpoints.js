import axios from 'axios';

export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

const A = `${API_URL}/api`;

export const ENDPOINTS = {
    // Auth
    REGISTER: `${A}/auth/register`,
    LOGIN: `${A}/auth/login`,
    ME: `${A}/auth/me`,
    VERIFY_EMAIL: `${A}/auth/verify-email`,
    RESEND_CODE: `${A}/auth/resend-code`,
    FORGOT_PASSWORD: `${A}/auth/forgot-password`,
    RESET_PASSWORD: (token) => `${A}/auth/reset-password/${token}`,

    // Users
    PROFILE: `${A}/users/profile`,
    CHANGE_PASSWORD: `${A}/users/change-password`,
    PUBLIC_PROFILE: (id) => `${A}/users/public/${id}`,

    // Properties
    PROPERTIES: `${A}/properties`,
    PROPERTY_COUNTS: `${A}/properties/counts`,
    PROPERTY: (id) => `${A}/properties/${id}`,
    PROPERTY_STATUS: (id) => `${A}/properties/${id}/status`,
    MY_PROPERTIES: `${A}/properties/seller/my`,
    SELLER_DASHBOARD: `${A}/properties/seller/dashboard`,

    // Inquiries
    INQUIRIES: `${A}/inquiries`,
    MY_INQUIRIES: `${A}/inquiries/my`,
    SELLER_INQUIRIES: `${A}/inquiries/seller`,
    INQUIRY: (id) => `${A}/inquiries/${id}`,
    INQUIRY_READ: (id) => `${A}/inquiries/${id}/read`,

    // Wishlist
    WISHLIST: `${A}/wishlist`,
    WISHLIST_ITEM: (propertyId) => `${A}/wishlist/${propertyId}`,

    // Chat
    CHATS: `${A}/chat`,
    CHAT_START: `${A}/chat/start`,
    CHAT: (chatId) => `${A}/chat/${chatId}`,
    CHAT_MESSAGES: (chatId) => `${A}/chat/${chatId}/messages`,
    CHAT_MESSAGE: (chatId, messageId) => `${A}/chat/${chatId}/messages/${messageId}`,

    // Contact
    CONTACT: `${A}/contact`,

    // Admin
    ADMIN_STATS: `${A}/admin/stats`,
    ADMIN_USERS: `${A}/admin/users`,
    ADMIN_USER: (id) => `${A}/admin/users/${id}`,
    ADMIN_USER_BLOCK: (id) => `${A}/admin/users/${id}/block`,
    ADMIN_PENDING_SELLERS: `${A}/admin/sellers/pending`,
    ADMIN_APPROVE_SELLER: (id) => `${A}/admin/sellers/${id}/approve`,
    ADMIN_REJECT_SELLER: (id) => `${A}/admin/sellers/${id}/reject`,
    ADMIN_PROPERTIES: `${A}/admin/properties`,
    ADMIN_PROPERTY: (id) => `${A}/admin/properties/${id}`,
    ADMIN_PROPERTY_VERIFY: (id) => `${A}/admin/properties/${id}/verify`,
    ADMIN_INQUIRIES: `${A}/admin/inquiries`,
    ADMIN_CONTACTS: `${A}/admin/contacts`,
    ADMIN_CONTACT: (id) => `${A}/admin/contacts/${id}`,
    ADMIN_CONTACT_READ: (id) => `${A}/admin/contacts/${id}/read`,
};

// Axios client
const api = axios.create({ timeout: 30000 });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export default api;
