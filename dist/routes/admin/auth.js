"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const db_1 = __importDefault(require("../../db"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const usersModel_1 = require("../../models/usersModel");
const router = express_1.default.Router();
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const [rows] = await db_1.default.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || user.role !== usersModel_1.Role.supervisor)
        return res.status(403).json({ message: 'Access denied' });
    const isMatch = await bcryptjs_1.default.compare(password, user.password);
    if (!isMatch)
        return res.status(401).json({ message: 'Invalid credentials' });
    req.session.userId = user.id;
    req.session.role = user.role;
    res.json({ success: true });
});
// check current login user
router.get('/me', async (req, res) => {
    if (req.session.userId) {
        const [rows] = await db_1.default.query('SELECT * FROM users WHERE id = ?', [req.session.userId]);
        const user = rows[0];
        if (!user || user.role !== usersModel_1.Role.supervisor)
            return res.json({ isLoggedIn: false });
        res.json({
            isLoggedIn: true,
            userId: user?.id,
            username: user?.username,
            email: user?.email,
            bio: user?.bio
        });
    }
    else {
        res.json({ isLoggedIn: false });
    }
});
exports.default = router;
