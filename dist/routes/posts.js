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
const commentsModel = __importStar(require("../models/commentsModel"));
const notificationsModel = __importStar(require("../models/notificationsModel"));
const followsModel = __importStar(require("../models/followsModel"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const uuid_1 = require("uuid");
const app_root_path_1 = __importDefault(require("app-root-path"));
const notificationQueue_1 = require("../notificationQueue");
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        const postId = req.postId;
        const dir = path_1.default.join(app_root_path_1.default.path, 'public', 'uploads', 'posts', postId);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 300 * 1024 * 1024 }, // 300MB
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpg', 'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm'];
        if (allowed.includes(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Unsupported file type'));
    }
});
router.post('/create', async (req, res, next) => {
    try {
        if (!req.session.userId)
            return res.status(400).json({ message: 'User not login' });
        const postId = (0, uuid_1.v4)();
        req.postId = postId; // custom prop for multer
        upload.array('files')(req, res, async function (err) {
            if (err) {
                const dir = path_1.default.join(app_root_path_1.default.path, 'public', 'uploads', 'posts', postId);
                fs_1.default.mkdirSync(dir);
                return res.status(400).json({ message: err.message });
            }
            const { content } = req.body;
            if (!req.session.userId)
                return res.status(400).json({ message: 'Post create filed' });
            await postsModel.createPost(postId, req.session.userId, content);
            const notificationId = `noti-${(0, uuid_1.v4)()}`;
            await notificationsModel.sendNotifications(notificationId, req.session.userId, postId, null, notificationsModel.UserAction.posted);
            (await followsModel.getFollowers(req.session.userId, 0, 0)).forEach((u) => {
                notificationQueue_1.NotificationQueue.enqueue({
                    id: notificationId,
                    user_id: u.id,
                    actor_id: req.session.userId || '',
                    verb: notificationsModel.UserAction.posted
                });
            });
            res.json({ message: 'Post created', postId });
        });
    }
    catch (err) {
        next(err);
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
router.get('/search', async (req, res) => {
    const q = (req.query.q || '').trim();
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    if (!q)
        return res.json([]);
    res.json(await postsModel.searchPosts(q, limit, offset));
});
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    if (!userId)
        return res.json([]);
    res.json(await postsModel.getUserPosts(userId, limit, offset));
});
router.get('/:postId', async (req, res) => {
    const { postId } = req.params;
    res.json(await postsModel.getPost(postId));
});
/**
 * DELETE /api/posts/:id
 * Requires:   session.user.id  ===  post.user_id   (owner‑only)
 * Deletes:    post row, related likes/comments, media folder
 */
router.delete('/:postId', async (req, res) => {
    const postId = req.params.postId;
    const sessionUserId = req.session.userId;
    try {
        // Verify ownership
        const post = await postsModel.getPost(postId);
        if (!post)
            return res.status(404).json({ message: 'Post not found' });
        if (post.user_id !== sessionUserId)
            return res.status(403).json({ message: 'Not your post' });
        // Delete related tables (likes, comments, follows share etc.)
        await postLikesModel.deletePostAllLikes(postId);
        await commentsModel.deleteAllComments(postId);
        // Delete post row
        await postsModel.deletePost(postId);
        // Delete media folder (if exists)
        const dir = path_1.default.join(app_root_path_1.default.path, 'public', 'uploads', 'posts', postId);
        if (fs_1.default.existsSync(dir))
            fs_1.default.rmSync(dir, { recursive: true, force: true });
        res.json({ success: true });
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Deletion failed' });
    }
});
router.put('/:postId', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'User not login' });
    const postId = req.params.postId;
    const userId = req.session.userId;
    let deletedMedia = [];
    try {
        // Verify ownership
        const post = await postsModel.getPost(postId);
        if (!post || post.user_id !== userId)
            return res.status(403).json({ message: 'Unauthorized or not found' });
        // Save new uploaded media
        req.postId = postId;
        upload.array('files')(req, res, async function (err) {
            if (err) {
                const dir = path_1.default.join(app_root_path_1.default.path, 'public', 'uploads', 'posts', postId);
                fs_1.default.mkdirSync(dir);
                return res.status(400).json({ message: err.message });
            }
            const { content } = req.body;
            // Update post content
            await postsModel.updatePost(postId, content);
            // Delete old media files (by URL or filename)
            if (req.body.deletedMedia) {
                deletedMedia = Array.isArray(req.body.deletedMedia)
                    ? req.body.deletedMedia
                    : [req.body.deletedMedia];
            }
            for (const url of deletedMedia) {
                const filename = path_1.default.basename(url);
                const filePath = path_1.default.join(app_root_path_1.default.path, 'public', 'uploads', 'posts', postId, filename);
                fs_1.default.unlink(filePath, err => {
                    if (err)
                        console.warn('Failed to delete file:', filename, err.message);
                });
            }
            res.json({ success: true });
        });
    }
    catch (err) {
        console.error('Edit Post Error', err);
        res.status(500).json({ message: 'Server error' });
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
            await postsModel.removePostLike(req.params.postId);
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
router.get('/:postId/media', (req, res) => {
    const { postId } = req.params;
    const dirPath = path_1.default.join(app_root_path_1.default.path, 'public', 'uploads', 'posts', postId);
    if (!fs_1.default.existsSync(dirPath)) {
        return res.json({ message: 'No media found for this post' });
    }
    const files = fs_1.default.readdirSync(dirPath);
    const fileUrls = files.map(file => `/uploads/posts/${postId}/${file}`);
    res.json({ urls: fileUrls }); // e.g., ["/uploads/abc123/image-1.jpg", ...]
});
router.get('/:postId/comments', async (req, res) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 20;
    const offset = (page - 1) * limit;
    res.json(await commentsModel.getComments(postId, limit, offset));
});
router.get('/comment/:commentId', async (req, res) => {
    const commentId = req.params.commentId;
    res.json(await commentsModel.getCommentById(commentId));
});
router.delete('/comment/:commentId', async (req, res) => {
    const commentId = req.params.commentId;
    const userId = req.session.userId;
    const comment = await commentsModel.getCommentById(commentId);
    if (!comment)
        return res.status(404).json({ message: 'Comment not found' });
    if (comment.user_id !== userId)
        return res.status(403).json({ message: 'Not your comment' });
    await commentsModel.deleteComment(commentId);
    await postsModel.removePostcomment(comment.post_id);
    res.json({ isSuccess: true });
});
router.post('/:postId/create-comment', async (req, res) => {
    if (!req.session.userId)
        return res.status(400).json({ message: 'User not login' });
    const { postId } = req.params;
    const { content } = req.body;
    const commentId = (0, uuid_1.v4)();
    try {
        await commentsModel.createComment(commentId, postId, req.session.userId, content);
        await postsModel.addPostcomment(postId);
        const notificationId = `noti-${(0, uuid_1.v4)()}`;
        await notificationsModel.sendNotifications(notificationId, req.session.userId, postId, commentId, notificationsModel.UserAction.commented);
        (await followsModel.getFollowers(req.session.userId, 0, 0)).forEach((u) => {
            notificationQueue_1.NotificationQueue.enqueue({
                id: notificationId,
                user_id: u.id,
                actor_id: req.session.userId || '',
                verb: notificationsModel.UserAction.commented
            });
        });
        res.json(await commentsModel.getCommentById(commentId));
    }
    catch (err) {
        res.status(400).json(err);
    }
});
exports.default = router;
