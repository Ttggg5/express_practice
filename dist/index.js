"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/index.ts
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const express_session_1 = __importDefault(require("express-session"));
const auth_1 = __importDefault(require("./routes/auth"));
const profile_1 = __importDefault(require("./routes/profile"));
const posts_1 = __importDefault(require("./routes/posts"));
const user_1 = __importDefault(require("./routes/user"));
const notifications_1 = __importDefault(require("./routes/notifications"));
const chat_1 = __importDefault(require("./routes/chat"));
const users_1 = __importDefault(require("./routes/admin/users"));
const auth_2 = __importDefault(require("./routes/admin/auth"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const os_1 = __importDefault(require("os"));
const http_1 = require("http");
const socketIoServer_1 = require("./socketIoServer");
dotenv_1.default.config({ path: path_1.default.join(app_root_path_1.default.path, '.env') });
const app = (0, express_1.default)();
const PORT = process.env.BACKEND_PORT || 8000;
const httpServer = (0, http_1.createServer)(app);
const socketIoServer = new socketIoServer_1.SocketIoServer(httpServer);
socketIoServer.startServer();
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // frontend URL
    credentials: true // allow cookies from frontend
}));
app.use(express_1.default.json());
app.use('/uploads', express_1.default.static(path_1.default.join(app_root_path_1.default.path, 'public', 'uploads')));
// 🔐 Session config
app.use((0, express_session_1.default)({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true in production with HTTPS
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 12 // 12 hours
    }
}));
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/posts', posts_1.default);
app.use('/api/user', user_1.default);
app.use('/api/notifications', notifications_1.default);
app.use('/api/chat', chat_1.default);
app.use('/api/admin/users', users_1.default);
app.use('/api/admin/auth', auth_2.default);
// Root test route
app.get('/', (req, res) => {
    res.send('Backend running with TypeScript');
});
// Start HTTP + WebSocket server
httpServer.listen(PORT, async () => {
    const networkInterfaces = os_1.default.networkInterfaces();
    for (const interfaceName in networkInterfaces) {
        const addresses = networkInterfaces[interfaceName];
        for (const addr of addresses) {
            if ((addr.family === 'IPv4') && !addr.internal) {
                console.log(`Interface: ${interfaceName}, IP Address: ${addr.address}`);
                console.log(`🚀 Server running on http://${addr.address}:${PORT}`);
                process.env.FRONTEND_BASE_URL = `http://${addr.address}:3000`;
            }
        }
    }
});
