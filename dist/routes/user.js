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
const followsModelModel = __importStar(require("../models/followsModel"));
const userModel = __importStar(require("../models/usersModel"));
const router = (0, express_1.Router)();
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    if (!q)
        return res.json([]);
    res.json(await userModel.searchUserId(q, limit, offset));
});
router.post('/follow', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'Login first' });
    const followerId = req.session.userId;
    const { followingId } = req.body;
    if (!followerId || !followingId || followerId === followingId)
        return res.status(400).json({ message: 'Invalid follow request' });
    try {
        await followsModelModel.follow(followerId, followingId);
        res.json({ isSuccess: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
router.post('/unfollow', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'Login first' });
    const followerId = req.session.userId;
    const { followingId } = req.body;
    try {
        await followsModelModel.unfollow(followerId, followingId);
        res.json({ isSuccess: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Database error' });
    }
});
router.post('/following-status', async (req, res) => {
    const { followerId, followingId } = req.body;
    if (!followerId || !followingId)
        return res.json({ isFollowing: false });
    const rows = await followsModelModel.followingStatus(followerId, followingId);
    res.json({ isFollowing: rows.length > 0 });
});
// GET /api/user/:id/follow-count
router.get('/:id/follow-count', async (req, res) => {
    const userId = decodeURIComponent(req.params.id);
    try {
        const followerCount = await followsModelModel.followerCount(userId);
        const followingCount = await followsModelModel.followingCount(userId);
        res.json({ followerCount: followerCount, followingCount: followingCount });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to fetch follow count' });
    }
});
router.get('/:id/followers', async (req, res) => {
    const userId = decodeURIComponent(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    res.json(await followsModelModel.getFollowers(userId, limit, offset));
});
router.get('/:id/following', async (req, res) => {
    const userId = decodeURIComponent(req.params.id);
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    res.json(await followsModelModel.getFollowing(userId, limit, offset));
});
exports.default = router;
