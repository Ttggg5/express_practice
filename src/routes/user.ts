import { Router, Request, Response, NextFunction } from 'express';
import * as followsModel from '../models/followsModel';
import * as userModel from '../models/usersModel'
const router = Router();

router.get('/search', async (req, res) => {
  const q = (req.query.q as string || '').trim();
  const page = parseInt(req.query.page as string) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;
  if (!q) return res.json([]);

  res.json(await userModel.searchUserFromIdName(q, limit, offset));
});


router.post('/follow', async (req, res) => {
  if (!req.session.userId) return res.status(400).json({ message: 'Login first' });

  const followerId = req.session.userId;
  const { followingId } = req.body;

  if (!followerId || !followingId || followerId === followingId)
    return res.status(400).json({ message: 'Invalid follow request' });

  try {
    await followsModel.follow(followerId, followingId);
    res.json({ isSuccess: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/unfollow', async (req, res) => {
  if (!req.session.userId) return res.status(400).json({ message: 'Login first' });

  const followerId = req.session.userId;
  const { followingId } = req.body;

  try {
    await followsModel.unfollow(followerId, followingId);
    res.json({ isSuccess: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Database error' });
  }
});

router.post('/following-status', async (req, res) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) return res.json({ isFollowing: false });
  const rows = await followsModel.followingStatus(followerId, followingId);

  res.json({ isFollowing: rows.length > 0 });
});

// GET /api/user/:id/follow-count
router.get('/:id/follow-count', async (req, res) => {
  const userId = decodeURIComponent(req.params.id);

  try {
    const followerCount = await followsModel.followerCount(userId);
    const followingCount = await followsModel.followingCount(userId);

    res.json({ followerCount: followerCount, followingCount: followingCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch follow count' });
  }
});

router.get('/:id/followers', async (req, res) => {
  const userId = decodeURIComponent(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  res.json(await followsModel.getFollowers(userId, limit, offset));
});

router.get('/:id/following', async (req, res) => {
  const userId = decodeURIComponent(req.params.id);
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = (page - 1) * limit;
  res.json(await followsModel.getFollowing(userId, limit, offset));
});

export default router;