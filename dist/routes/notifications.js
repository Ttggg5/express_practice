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
const notificationsModel = __importStar(require("../models/notificationsModel"));
const router = (0, express_1.Router)();
// GET /api/notifications?page=1
router.get('/', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'Login first' });
    const userId = req.session.userId;
    const page = Number(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const rows = await notificationsModel.getNotifications(userId, limit, offset);
    res.json(rows);
});
// PUT /api/notifications/mark-read  { id: string }
router.put('/mark-read', async (req, res) => {
    const { id } = req.body;
    await notificationsModel.markRead(id);
    res.json({ isSuccess: true });
});
// PUT /api/notifications/mark-read-all  { userId: string }
router.put('/mark-read-all', async (req, res) => {
    const { userId } = req.body;
    await notificationsModel.markReadAll(userId);
    res.json({ isSuccess: true });
});
exports.default = router;
