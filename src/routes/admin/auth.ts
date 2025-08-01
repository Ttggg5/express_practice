import express from 'express';
import db from '../../db';
import bcrypt from 'bcryptjs';
import { RowDataPacket } from 'mysql2';

export enum Role {
  user = 'user',
  supervisor = 'supervisor'
}

const router = express.Router();

router.post('/supervisor-login', async (req, res) => {
  const { email, password } = req.body;

  const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE email = ?', [email]);
  const user = rows[0];

  if (!user || user.role !== Role.supervisor)
    return res.status(403).json({ message: 'Access denied' });

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

  req.session.userId = user.id;
  req.session.role = user.role;

  res.json({ success: true });
});

// check current login user
router.get('/me', async (req, res) => {
  if (req.session.userId) {
    const [rows] = await db.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [req.session.userId]);
    const user = rows[0];

    if (!user || user.role !== Role.supervisor)
      return res.json({ isLoggedIn: false });

    res.json({ 
      isLoggedIn: true,
      userId: user?.id,
      username: user?.username,
      email: user?.email,
      bio: user?.bio
    });
  }
  else {
    res.json({ isLoggedIn: false });
  }
});

export default router;
