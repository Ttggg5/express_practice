"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
const PORT = process.env.BACKEND_PORT || 5000;
// Middleware
app.use((0, cors_1.default)({
    origin: 'http://localhost:3000', // frontend URL
    credentials: true // allow cookies from frontend
}));
app.use(express_1.default.json());
// 🔐 Session config
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 // 1 hour
    }
}));
// Routes
app.use('/api/auth', authRoutes_1.default);
// Root test route
app.get('/', (req, res) => {
    res.send('Backend running with TypeScript');
});
// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
