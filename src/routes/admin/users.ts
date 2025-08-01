import express from 'express';
import db from '../../db';
const router = express.Router();

enum SortKey {
  id = 'id',
  username = 'username',
  email = 'email',
  role = 'role'
}

// Get all users
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 20;
    const search = (req.query.search as string || '').trim();
    const sortKey = (req.query.sortKey as string) as SortKey || SortKey.username;
    const sortOrder = (req.query.sortOrder as string)?.toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const offset = page * size;
    const searchQuery = `%${search}%`;

    const [rows] = await db.query(
      `
        SELECT id, username, email, role, is_suspended
        FROM users
        WHERE id LIKE ? OR username LIKE ? OR email LIKE ?
        ORDER BY ${sortKey} ${sortOrder}
        LIMIT ? OFFSET ?
      `,
      [searchQuery, searchQuery, searchQuery, size, offset]
    );

    res.json(rows);
  } catch (err) {
    console.error('User fetch error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user (suspend, promote, etc.)
router.put('/:id', async (req, res) => {
  const { role, isSuspended } = req.body;
  const userId = req.params.id;
  await db.query('UPDATE users SET role = ?, is_suspended = ? WHERE id = ?', [role, isSuspended, userId]);
  res.json({ success: true });
});

// Delete user
router.delete('/:id', async (req, res) => {
  const userId = req.params.id;
  await db.query('DELETE FROM users WHERE id = ?', [userId]);
  res.json({ success: true });
});

export default router;