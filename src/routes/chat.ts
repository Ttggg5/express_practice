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
    const rows = await chatWithModel.getUsedChatWith(userId, limit, offset);
    res.json(rows.map((item) => {
      if (item.from_user_id === userId) return {id: item.to_user_id, username: item.target_username};
      else return {id: item.from_user_id, username: item.target_username};
    }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

// GET /api/chat/messages/:userA/:userB
router.get('/messages/:userFrom/:userTo', async (req, res) => {
  const { userFrom, userTo } = req.params;

  try {
    res.json(await messageModel.getHistoryMessages(userFrom, userTo));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to load messages' });
  }
});

export default router;