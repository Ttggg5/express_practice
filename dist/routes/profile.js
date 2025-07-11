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
const userModel = __importStar(require("../models/usersModel"));
const multer_1 = __importDefault(require("multer"));
const router = (0, express_1.Router)();
router.get('/:id', async (req, res) => {
    const userId = req.params.id;
    if (!userId.startsWith('@'))
        return res.status(400).json({ message: 'Invalid ID' });
    const user = await userModel.getUserById(userId);
    if (!user)
        return res.status(404).json({ message: 'User not found' });
    const userSafe = {
        id: user.id,
        username: user.username,
        email: user.email,
        create_time: user.create_time,
        bio: user.bio,
    };
    res.json(userSafe);
});
router.get('/avatar/:id', async (req, res) => {
    const avatar = await userModel.getAvatar(req.params.id);
    if (!avatar)
        return res.sendStatus(404);
    res.set('Content-Type', 'image/jpeg');
    res.send(avatar);
});
// Multer config — store file in memory as Buffer
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only PNG, JPG, and GIF are allowed.'));
        }
    }
});
router.post('/avatar/upload/:id', upload.single('avatar'), async (req, res) => {
    const userId = req.params.id;
    const file = req.file;
    if (!file)
        return res.status(400).json({ message: 'No file uploaded' });
    try {
        await userModel.updateAvatar(userId, file.buffer);
        res.json({ message: 'Avatar updated successfully' });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error uploading avatar' });
    }
});
router.use((err, req, res, next) => {
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({ message: 'File too large. Max size is 16MB.' });
    }
    if (err.message.includes('Invalid file type')) {
        return res.status(400).json({ message: err.message });
    }
    next(err);
});
exports.default = router;
