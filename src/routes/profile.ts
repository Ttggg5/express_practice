import { Router, Request, Response, NextFunction } from 'express';
import * as userModel from '../models/usersModel';
import multer from 'multer';
import db from '../db';

const router = Router();

// Multer config — store file in memory as Buffer
const storage = multer.memoryStorage();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 }, // 16MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and GIF are allowed.'));
    }
  }
});

router.put('/edit', upload.single('avatar'), async (req, res) => {
  const userId = req.session.userId;
  if (!userId) return res.status(401).json({ message: 'Not logged in' });

  const { username, bio } = req.body;
  const avatarBuf = req.file?.buffer ?? null;

  // build query dynamically
  const fields: string[] = [];
  const values: any[] = [];

  if (username !== undefined) { fields.push('username = ?'); values.push(username); }
  if (bio !== undefined) { fields.push('bio = ?'); values.push(bio); }
  if (avatarBuf) { fields.push('avatar = ?'); values.push(avatarBuf); }

  if (fields.length === 0) return res.json({ message: 'Nothing to update' });

  values.push(userId);
  await db.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);

  res.json({ success: true });
});

router.get('/avatar/:id', async (req, res) => {
  const userId = decodeURIComponent(req.params.id);
  const avatar = await userModel.getAvatar(userId);
  if (!avatar) return res.send(null);

  res.set('Content-Type', 'image/jpeg');
  res.send(avatar);
});

router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'File too large. Max size is 16MB.' });
  }
  if (err.message.includes('Invalid file type')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

router.get('/:id', async (req, res) => {
  const userId = req.params.id;
  if (!userId.startsWith('@')) return res.status(400).json({ message: 'Invalid ID' });

  const user = await userModel.getUserById(userId);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const userSafe = {
    id: user.id,
    username: user.username,
    email: user.email,
    create_time: user.create_time,
    bio: user.bio,
  }
  res.json(userSafe);
});

export default router;