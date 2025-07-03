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
const express_1 = __importDefault(require("express"));
const postsModel = __importStar(require("../models/postsModel"));
const postLikesModel = __importStar(require("../models/postLikesModel"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const postId = req.postId;
        const dir = path_1.default.join(__dirname, '..', 'public', 'uploads', postId);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Unsupported file type'));
    }
});
router.post('/create', async (req, res, next) => {
    const { userId, content, postType } = req.body;
    try {
        if (req.session.userId != userId)
            throw new Error('User not login');
        const postId = (0, uuid_1.v4)();
        req.postId = postId; // custom prop for multer
        upload.array('files')(req, res, async function (err) {
            if (err)
                return res.status(400).json({ message: err.message });
            // Save post info to DB (with basic sample logic)
            await postsModel.createPost(postId, userId, content, postType);
            res.json({ message: 'Post created', postId });
        });
    }
    catch (err) {
        next(err);
    }
});
router.post('/:postId/like', async (req, res) => {
    if (req.session.userId) {
        try {
            await postLikesModel.likePost(req.session.userId, req.params.postId);
            await postsModel.addPostLike(req.params.postId);
            res.json({ isSuccessed: true, message: 'Liked post' });
        }
        catch (err) {
            res.status(500).json({ isSuccessed: false, message: 'Like failed' });
        }
    }
    else {
        res.json({ isSuccessed: false, message: 'Login first' });
    }
});
router.post('/:postId/unlike', async (req, res) => {
    if (req.session.userId) {
        try {
            await postLikesModel.unlikePost(req.session.userId, req.params.postId);
            await postsModel.rmovePostLike(req.params.postId);
            res.json({ isSuccessed: true, message: 'Unliked post' });
        }
        catch (err) {
            res.status(500).json({ isSuccessed: false, message: 'Unlike failed' });
        }
    }
    else {
        res.json({ isSuccessed: false, message: 'Login first' });
    }
});
router.get('/:postId/isLiked', async (req, res) => {
    if (req.session.userId) {
        try {
            res.json({ isLiked: await postLikesModel.isLikedPost(req.session.userId, req.params.postId) });
        }
        catch (err) {
            res.status(500).json({ isLiked: false, message: 'Search failed' });
        }
    }
    else {
        res.json({ isLiked: false, message: 'Login first' });
    }
});
// fetch latest posts by any user
router.get('/newest', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    try {
        res.json(await postsModel.getPostsOrderByTime(limit, offset));
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});
router.get('/:postId/media', async (req, res) => {
    try {
        res.json();
    }
    catch (err) {
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});
exports.default = router;
