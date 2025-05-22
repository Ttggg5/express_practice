"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel_1 = require("../models/userModel");
const crypto_1 = require("crypto");
const mail_1 = require("../utils/mail");
const router = (0, express_1.Router)();
// Register
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const existingUser = await (0, userModel_1.getUserByEmail)(email);
        if (existingUser)
            return res.status(400).json({ message: 'Email already in use' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const token = (0, crypto_1.randomBytes)(32).toString('hex') + await bcryptjs_1.default.hash(email, 5);
        const userId = await (0, userModel_1.createUser)(username, email, hashedPassword, token);
        await (0, mail_1.sendVerificationEmail)(email, token); // send email
        res.status(201).json({ message: 'User registered. Please check your email to verify', userId });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Verify user
router.get('/verify', async (req, res) => {
    const { token } = req.query;
    if (typeof token !== 'string' || !await (0, userModel_1.verifyUser)(token)) {
        return res.status(400).json({ message: 'Invalid token' });
    }
    res.json({ message: 'Email verified successfully' });
});
// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await (0, userModel_1.getUserByEmail)(email);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ message: 'Invalid password' });
        req.session.userId = user.id;
        res.json({ message: 'Login successful', userId: user.id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err)
            return res.status(500).json({ message: 'Logout failed' });
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out' });
    });
});
// check current login user
router.get('/me', async (req, res) => {
    if (req.session.userId) {
        const user = await (0, userModel_1.getUserById)(req.session.userId);
        res.json({ message: 'User found', user });
    }
    else {
        res.json({ message: 'No user logged in' });
    }
});
exports.default = router;
