import { Router } from 'express';
import * as messageModel from '../models/messageModel';
import * as chatWithModel from '../models/chatWithModel';

const router = Router();

// GET /api/chat/used-chat-with
router.get('/used-chat-with', async (req, res) => {
  if (!req.session.userId) return res.status(400).json({ message: 'Login first' });

  const userId = req.session.userId;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    res.json(await chatWithModel.getUsedChatWith(userId, limit, offset));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// GET /api/chat/history/:userId
router.get('/history/:userId', async (req, res) => {
  if (!req.session.userId) return res.status(400).json({ message: 'Login first' });

  const userId = decodeURIComponent(req.params.userId);
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    res.json(await messageModel.getHistoryMessages(req.session.userId, userId, limit, offset));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// GET /api/chat/read
router.put('/read', async (req, res) => {
  if (!req.session.userId) return res.status(400).json({ message: 'Login first' });

  const fromUserId = req.session.userId;
  const { targetUserId } = req.body;

  try {
    res.json(await chatWithModel.updateRead(fromUserId, targetUserId, true));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to read' });
  }
});

export default router;