import express from 'express';
import db from '../db';
import * as postsModel from '../models/postsModel';
import * as postLikesModel from '../models/postLikesModel';
import multer from 'multer';
import path from 'path';
import { uuid } from 'uuidv4';

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'public/uploads/posts/'),
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const uploadPostImage = multer({
  storage,
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files allowed'));
  }
});

router.post('/create', uploadPostImage.single('image'), async (req, res) => {
  const { content, userId, postType } = req.body;
  const postId = uuid();

  await postsModel.createPost(postId, userId, content, postType);

  res.json({ message: 'Post created', postId });
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
      await postsModel.rmovePostLike(req.params.postId);

      res.json({ isSuccessed: true, message: 'Unliked post' });
    } catch (err) {
      res.status(500).json({ isSuccessed: false, message: 'Unlike failed' });
    }
  }
  else {
    res.json({ isSuccessed: false, message: 'Login first' });
  }
});


// fetch latest posts by any user
router.get('/recommended', async (req, res) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;

  try {
    res.json(await postsModel.getPostsOrderByTime(limit, offset));
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch posts' });
  }
});

export default router;