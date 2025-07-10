import express from 'express';
import * as postsModel from '../models/postsModel';
import * as postLikesModel from '../models/postLikesModel';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import appRoot from 'app-root-path'

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const postId = req.postId as string;
    const dir = path.join(appRoot.path, 'public', 'uploads', 'posts', postId);

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Unsupported file type'));
  }
});

router.post('/create', async (req, res, next) => {
  try {
    if (!req.session.userId)
      return res.status(400).json({ message: 'User not login' });

    const postId = uuidv4();
    req.postId = postId; // custom prop for multer

    upload.array('files')(req, res, async function (err) {
      if (err) {
        const dir = path.join(appRoot.path, 'public', 'uploads', 'posts', postId);
        fs.rmdirSync(dir);
        return res.status(400).json({ message: err.message });
      }

      const { content } = req.body;
      if (!req.session.userId)
        return res.status(400).json({ message: 'Post create filed' });

      // Save post info to DB (with basic sample logic)
      await postsModel.createPost(postId, req.session.userId, content);

      res.json({ message: 'Post created', postId });
    });
  } catch (err) {
    next(err);
  }
});

router.post('/:postId/like', async (req, res) => {
  if (req.session.userId) {
    try {
      await postLikesModel.likePost(req.session.userId, req.params.postId);
      await postsModel.addPostLike(req.params.postId);
      res.json({ isSuccessed: true, message: 'Liked post' });
    } catch (err) {
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
    } catch (err) {
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
      res.json({ isLiked: await postLikesModel.isLikedPost(req.session.userId, req.params.postId)});
    } catch (err) {
      res.status(500).json({ isLiked: false, message: 'Search failed' });
    }
  }
  else {
    res.json({ isLiked: false, message: 'Login first' });
  }
});

// fetch latest posts by any user
router.get('/newest', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    res.json(await postsModel.getPostsOrderByTime(limit, offset));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

router.get('/:postId/media', (req, res) => {
  const { postId } = req.params;
  const dirPath = path.join(appRoot.path, 'public', 'uploads', 'posts', postId);

  if (!fs.existsSync(dirPath)) {
    return res.json({ message: 'No media found for this post' });
  }

  const files = fs.readdirSync(dirPath);
  const fileUrls = files.map(file => `/uploads/posts/${postId}/${file}`);

  res.json({ urls: fileUrls }); // e.g., ["/uploads/abc123/image-1.jpg", ...]
});

router.get('/search', async (req, res) => {
  const q = (req.query.q as string || '').trim();
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  if (!q) return res.json([]);

  res.json(await postsModel.searchPosts(q, limit, offset));
});

router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  if (!userId) return res.json([]);

  res.json(await postsModel.getUserPosts(userId, limit, offset));
});

export default router;