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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const messageModel = __importStar(require("../models/messageModel"));
const chatWithModel = __importStar(require("../models/chatWithModel"));
const router = (0, express_1.Router)();
// GET /api/chat/used-chat-with
router.get('/used-chat-with', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'Login first' });
    const userId = req.session.userId;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        const rows = await chatWithModel.getUsedChatWith(userId, limit, offset);
        res.json(rows.map((item) => {
            if (item.from_user_id === userId)
                return { id: item.to_user_id, username: item.target_username };
            else
                return { id: item.from_user_id, username: item.target_username };
        }));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load messages' });
    }
});
// GET /api/chat/history/:userId
router.get('/history/:userId', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'Login first' });
    const userId = decodeURIComponent(req.params.userId);
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    try {
        res.json(await messageModel.getHistoryMessages(req.session.userId, userId, limit, offset));
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to load messages' });
    }
});
exports.default = router;
