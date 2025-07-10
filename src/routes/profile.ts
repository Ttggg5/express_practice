import { Router, Request, Response, NextFunction } from 'express';
import * as userModel from '../models/usersModel';
import multer from 'multer';

const router = Router();

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

router.get('/avatar/:id', async (req, res) => {
  const avatar = await userModel.getAvatar(req.params.id);
  if (!avatar) return res.sendStatus(404);

  res.set('Content-Type', 'image/jpeg');
  res.send(avatar);
});

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

router.post('/avatar/upload/:id', upload.single('avatar'), async (req, res) => {
  const userId = req.params.id;
  const file = req.file;

  if (!file) return res.status(400).json({ message: 'No file uploaded' });

  try {
    await userModel.updateAvatar(userId, file.buffer);
    res.json({ message: 'Avatar updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error uploading avatar' });
  }
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
export default router;