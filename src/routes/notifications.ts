import { Router } from 'express';
import db from '../db';
import * as notificationsModel from '../models/notificationsModel';

const router = Router();

// GET /api/notifications?page=1
router.get('/', async (req, res) => {
  if (!req.session.userId) return res.status(400).json({ message: 'Login first' });

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

export default router;