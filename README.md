# 👗 Smart Wardrobe & AI Stylist

[![Live Demo](https://img.shields.io/badge/Live_Demo-Vercel-black?style=for-the-badge&logo=vercel)](https://personal-wardrobe-fawn.vercel.app)
[![API Server](https://img.shields.io/badge/API_Status-Live-46E3B7?style=for-the-badge&logo=render)](https://personal-wardrobe.onrender.com)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB_Atlas-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
[![Gemini AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?style=for-the-badge&logo=googlegemini)](https://ai.google.dev/)
[![React 19](https://img.shields.io/badge/Frontend-React_19-61DAFB?style=for-the-badge&logo=react)](https://react.dev/)

> An intelligent, full-stack digital wardrobe manager and AI-powered fashion stylist. Upload and organize your real clothes with automatic in-browser background removal, and get tailored outfit recommendations based on weather, occasion, and color theory powered by Google Gemini AI.

---

## 🌐 Live Deployments

| Component | Platform | URL |
| :--- | :--- | :--- |
| **Frontend Web App** | Vercel | [personal-wardrobe-fawn.vercel.app](https://personal-wardrobe-fawn.vercel.app) |
| **Backend REST API** | Render | [personal-wardrobe.onrender.com](https://personal-wardrobe.onrender.com) |
| **Database** | MongoDB Atlas | Cluster0 (Active & Cloud Monitored) |

---

## ✨ Key Features

- **📸 In-Browser AI Background Removal:** Automatically removes backgrounds from clothing photos directly on the client side using `@imgly/background-removal` before uploading, resulting in studio-quality closet assets.
- **🧠 AI Stylist Assistant (Google Gemini 2.5 Flash):** Evaluates wardrobe pieces using fashion color theory and style heuristics to recommend cohesive, complete outfits for any selected occasion.
- **🌤️ Weather-Aware Outfit Generation:** Integrates real-time weather conditions to intelligently factor in temperature, rain, or heat when assembling daily outfits.
- **🏷️ Smart Tagging & Wardrobe Filtering:** Organize items by category (Tops, Bottoms, Footwear, Outerwear, Accessories), formality, color palette, and season with instant search and multi-tag filtering.
- **🔐 Secure JWT Dual-Token Authentication:** Robust user authentication with short-lived Access Tokens, long-lived Refresh Tokens stored in secure HTTP-only cookies, and bcrypt password hashing.
- **☁️ Cloud Image Delivery:** Optimized image processing, CDN distribution, and secure media storage via Cloudinary.
- **📱 Modern Responsive UI:** Polished glassmorphism aesthetics, fluid transitions, and mobile-friendly design built with React 19 and Tailwind CSS.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React 19 + Vite 8
- **Styling:** Tailwind CSS + Vanilla CSS Modules
- **Routing:** React Router DOM v7
- **AI Processing:** `@imgly/background-removal` (WebAssembly-based client-side background removal)
- **HTTP Client:** Axios (with credential interceptors)

### **Backend**
- **Runtime:** Node.js + Express 5
- **Database ODM:** Mongoose 9 + MongoDB Atlas
- **AI Model:** Google Gemini AI API (`gemini-2.5-flash`)
- **Security & Middleware:** Helmet, CORS, Morgan, Cookie-Parser, Zod validation
- **Image Pipeline:** Multer + Streamifier + Cloudinary SDK

---

## 📂 Project Architecture

```plaintext
outfit/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, Environment & DNS setup
│   │   ├── middleware/      # Auth verification & error handlers
│   │   ├── modules/
│   │   │   ├── auth/        # Register, Login, Refresh tokens, User model
│   │   │   ├── outfit/      # Stylist service, AI rules, Outfit controller
│   │   │   ├── wardrobe/    # Clothes CRUD, filters, upload handlers
│   │   │   └── weather/     # Weather API integration
│   │   ├── services/        # Gemini AI & Cloudinary integrations
│   │   ├── utils/           # Async handlers, API responses, validators
│   │   ├── app.js           # Express app setup & route registration
│   │   └── server.js        # Server bootstrapper & DB connection
│   └── tests/               # Test suites
│
└── frontend/
    └── src/
        ├── api/             # Axios API client instances
        ├── components/      # Reusable UI cards, modals, navbars
        ├── context/         # Auth and Wardrobe global context
        ├── pages/
        │   ├── HomePage.jsx         # Landing page & features showcase
        │   ├── LoginPage.jsx        # User login
        │   ├── RegisterPage.jsx     # User registration
        │   ├── WardrobePage.jsx     # Virtual closet viewer & filters
        │   ├── UploadPage.jsx       # Photo upload & AI background cutter
        │   └── OutfitStudioPage.jsx # AI Stylist & outfit generator
        └── utils/           # Helper functions
```

---

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- MongoDB Atlas account (or local MongoDB)
- Cloudinary free account
- Google Gemini API key

### 1. Clone the repository
```bash
git clone https://github.com/Madhusmitasen2002/personal-wardrobe.git
cd personal-wardrobe
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file inside the `backend/` folder:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# MongoDB Connection
MONGO_URI=your_mongodb_connection_string

# Secrets
ACCESS_TOKEN_SECRET=your_access_token_secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your_refresh_token_secret
REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_SECRET=your_cookie_secret
BCRYPT_SALT_ROUNDS=12

# Cloudinary Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# AI Engine
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
```

Start the backend development server:
```bash
npm run dev
```

### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 📡 Core API Endpoints

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/register` | Register a new user | No |
| `POST` | `/api/v1/auth/login` | Login and receive tokens in HTTP cookies | No |
| `POST` | `/api/v1/auth/refresh` | Refresh access token | Yes (Cookie) |
| `GET` | `/api/v1/wardrobe` | Fetch all clothing items for authenticated user | Yes |
| `POST` | `/api/v1/wardrobe` | Upload new clothing item (with image & tags) | Yes |
| `DELETE`| `/api/v1/wardrobe/:id`| Remove an item from the wardrobe | Yes |
| `POST` | `/api/v1/outfits/suggest` | Request AI-generated outfit recommendations | Yes |
| `GET` | `/api/v1/weather` | Retrieve current weather for location | Yes |

---

## 🛡️ Production & Reliability Architecture

- **Permanent Uptime:** Kept alive with automated heartbeat monitors via `cron-job.org` to eliminate cold starts on free tiers.
- **Fail-Safe DNS:** Enhanced DNS resolver configured with Google and Cloudflare DNS fallback (`8.8.8.8`, `1.1.1.1`) ensuring high-availability SRV lookups.
- **Input Sanitization:** Every request payload validated strictly using Zod schemas to reject malformed inputs before reaching business logic.

---

## 👩‍💻 Author

**Madhushmita Sen**
- GitHub: [@Madhusmitasen2002](https://github.com/Madhusmitasen2002)
- Project Repository: [personal-wardrobe](https://github.com/Madhusmitasen2002/personal-wardrobe)
