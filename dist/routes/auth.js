"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const userModel = __importStar(require("../models/usersModel"));
const crypto_1 = require("crypto");
const mail_1 = require("../utils/mail");
const promises_1 = __importDefault(require("fs/promises"));
const app_root_path_1 = __importDefault(require("app-root-path"));
const router = (0, express_1.Router)();
// Register
router.post('/register', async (req, res) => {
    const { id, username, email, password } = req.body;
    try {
        var existingUser = await userModel.getUserById(id);
        if (existingUser)
            return res.status(400).json({ message: 'Id already in use' });
        existingUser = await userModel.getUserByEmail(email);
        if (existingUser)
            return res.status(400).json({ message: 'Email already in use' });
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const token = (0, crypto_1.randomBytes)(64).toString('hex');
        const publicPath = app_root_path_1.default.path + '/public';
        const fileBuffer = await promises_1.default.readFile(publicPath + '/resource/avatarDefault.png');
        await userModel.createUser(id, username, email, hashedPassword, token, fileBuffer);
        await (0, mail_1.sendVerificationEmail)(email, token); // send email
        res.status(201).json({ message: 'User registered. Please check your email to verify', id });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});
// Verify user
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;
    if (typeof token !== 'string' || !await userModel.verifyUser(token)) {
        return res.status(400).json({ message: 'Invalid token' });
    }
    res.json({ message: 'Email verified successfully' });
});
// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.getUserByEmail(email);
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        const valid = await bcryptjs_1.default.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ message: 'Invalid password' });
        const isVerified = await userModel.isUserVerfied(email);
        if (!isVerified)
            return res.status(401).json({ message: 'Email not verified yet' });
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
        const user = await userModel.getUserById(req.session.userId);
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
// forgot password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const user = await userModel.getUserByEmail(email);
    if (!user)
        return res.status(200).json({ message: 'Email not regist' });
    const token = (0, crypto_1.randomBytes)(64).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 5); // 5 minutes
    await userModel.setResetToken(user.id, token, expires);
    await (0, mail_1.sendResetEmail)(email, token);
    res.json({ message: 'Reset link sent' });
});
// reset password
router.post('/reset-password', async (req, res) => {
    const { token, password } = req.body;
    const user = await userModel.getUserByResetToken(token);
    if (!user)
        return res.status(400).json({ message: 'Invalid or expired token.' });
    userModel.resetPassword(user.id, password);
    res.json({ message: 'Password updated.' });
});
exports.default = router;
