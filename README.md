# RealEstate — Full-Stack Property Marketplace

A full-stack real estate platform where **buyers** discover and save properties, chat with sellers in real time and send inquiries, **sellers** list and manage properties with photo galleries and track leads, and **admins** moderate users, listings and seller approvals.

Built with **React 19 · Vite · Tailwind CSS v4 · Node.js · Express 5 · MongoDB (Mongoose) · Socket.io · Cloudinary · JWT**.

---

## Features

**Buyers**
- Search and filter by location, buy/rent, price, type, BHK, furnishing and amenities, with grid/list view, sorting and pagination
- Property details with photo lightbox, similar listings, view counter and share link
- Wishlist, inquiries to sellers, and real-time chat (Socket.io)

**Sellers**
- Dashboard with views, leads, live and sold listing stats
- Add or edit listings with drag-and-drop multi-image upload (up to 10)
- Mark listings sold or available, delete listings
- Leads inbox with read/unread filter, reply in chat, email or call

**Admins**
- Platform overview with live stats and system health
- Approve or reject seller sign-ups
- Block, unblock or delete users (related data is cleaned up automatically)
- Verify or remove listings, and review all inquiries and contact messages

**Platform**
- JWT auth with role-based routes on the API and in the UI
- Email verification and password reset (Gmail or Brevo; works without email in development)
- Images upload to Cloudinary, with automatic fallback to local storage
- Central error handling, input validation, and code-split routes

---

## Project Structure

```
Real-Estate/
├── Backend/
│   ├── config/          env, MongoDB, Cloudinary
│   ├── controllers/     auth, user, property, inquiry, wishlist, chat, contact, admin
│   ├── middlewares/     auth (protect/authorize), upload (multer), error handler
│   ├── models/          User, Property, Inquiry, Wishlist, Chat, Contact
│   ├── routes/          REST routes per resource
│   ├── scripts/         seedAdmin.js
│   ├── utils/           email, image upload, helpers
│   ├── socket.js        authenticated Socket.io server
│   └── server.js
└── frontend/
    └── src/
        ├── api/endpoints.js     single API page (all endpoints + axios client)
        ├── components/common/   Navbar, Footer, PropertyCard, PropertyForm, layouts, guards
        ├── context/             AuthContext
        ├── hooks/               useWishlist, useSellerProperties, useSocket
        ├── pages/               auth · shared · buyer · seller · admin
        └── utils/helpers.js
```

---

## Getting Started

### 1. Requirements
- Node.js 20 or newer
- A MongoDB Atlas cluster (or local MongoDB)

### 2. MongoDB Atlas setup
1. Atlas → **Database Access** → make sure the database user exists and its password matches `MONGO_URI`.
2. Atlas → **Network Access** → **Add IP Address** → add your current IP (or `0.0.0.0/0` for development).
   If this step is skipped, the server cannot connect and nothing is saved.
3. Collections (`users`, `properties`, `inquiries`, `wishlists`, `chats`, `contacts`) are created automatically in the `RealState` database.

### 3. Backend
```bash
cd Backend
npm install
cp .env.example .env     # skip if .env already exists, then fill in values
npm run dev              # http://localhost:5000
```

On first start a default admin is created from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`.
To reset the admin password at any time, run `npm run seed:admin`.

### 4. Frontend
```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

`frontend/.env` → `VITE_API_URL=http://localhost:5000`

### 5. Default login
| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@realestate.com   | Admin@123 |

Register buyers and sellers from the UI. A new seller signs in after the admin approves them under **Admin → Seller Requests**.

---

## Environment Variables (Backend)

| Key | Purpose |
|-----|---------|
| `PORT`, `CLIENT_URL`, `SERVER_URL` | Server port, allowed frontend origin, public API URL |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET`, `JWT_EXPIRES_IN` | Token signing |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Default admin account |
| `EMAIL_USER`, `EMAIL_PASS` | Gmail address + App Password (optional) |
| `BREVO_API_KEY` | Brevo transactional email (optional) |
| `CLOUDINARY_*` | Image hosting (optional; falls back to `/uploads`) |

When email is not configured, new accounts are auto-verified and the reset link is shown on the Forgot Password page during development.

---

## API Reference

| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` · `/login` · `/verify-email` · `/resend-code` · `/forgot-password` | Public |
| POST | `/api/auth/reset-password/:token` | Public |
| GET | `/api/auth/me` | Auth |
| GET / PUT | `/api/users/profile` (multipart `profilePic`) | Auth |
| PUT | `/api/users/change-password` | Auth |
| GET | `/api/properties` (filters: `search, city, type, bhk, minPrice, maxPrice, furnishing, amenities, listingType, sort, page`) | Public |
| GET | `/api/properties/counts` · `/api/properties/:id` | Public |
| POST / PUT | `/api/properties` · `/api/properties/:id` (multipart `images[]`) | Seller |
| PATCH | `/api/properties/:id/status` | Seller |
| DELETE | `/api/properties/:id` | Seller / Admin |
| GET | `/api/properties/seller/my` · `/seller/dashboard` | Seller |
| GET / POST / DELETE | `/api/wishlist` · `/api/wishlist/:propertyId` | Auth |
| POST | `/api/inquiries` · GET `/api/inquiries/my` | Buyer |
| GET | `/api/inquiries/seller` · PATCH `/api/inquiries/:id/read` | Seller |
| GET / POST | `/api/chat` · `/api/chat/start` · `/api/chat/:chatId` · `/api/chat/:chatId/messages` | Auth |
| DELETE | `/api/chat/:chatId` · `/api/chat/:chatId/messages/:messageId` | Auth |
| POST | `/api/contact` | Public |
| GET | `/api/admin/stats` · `/users` · `/sellers/pending` · `/properties` · `/inquiries` · `/contacts` | Admin |
| PATCH | `/api/admin/users/:id/block` · `/sellers/:id/approve` · `/properties/:id/verify` · `/contacts/:id/read` | Admin |
| DELETE | `/api/admin/users/:id` · `/sellers/:id/reject` · `/properties/:id` · `/contacts/:id` | Admin |

**Socket.io events** (client authenticates with `auth: { token }`): `receiveMessage`, `messageDeleted`, `chatDeleted`, `newInquiry`.

---

## Author

**Hanan** — Frontend Engineer
