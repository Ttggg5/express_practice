import { Router } from 'express';
import db from '../db';
const router = Router();

// GET /api/notifications?page=1
router.get('/', async (req, res) => {
  const userId = req.session.userId;
  const page = Number(req.query.page) || 1;
  const limit = 10;
  const offset = (page - 1) * limit;

  const [rows] = await db.query(`
    SELECT n.*, u.username AS actor_name
    FROM notifications n
    JOIN users u ON u.id = n.actor_id
    WHERE n.user_id = ?
    ORDER BY n.created_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset]);
  res.json(rows);
});

// PUT /api/notifications/mark-read  { ids: string[] }
router.put('/mark-read', async (req, res) => {
  const { ids = [] } = req.body;
  if (ids.length)
    await db.query(`UPDATE notifications SET is_read = TRUE WHERE id IN (?)`, [ids]);
  res.json({ success: true });
});

export default router;