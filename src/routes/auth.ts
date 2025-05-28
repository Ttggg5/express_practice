import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import * as userModel from '../models/userModel';
import { randomBytes } from 'crypto';
import { sendVerificationEmail, sendResetEmail } from '../utils/mail';
import fs from 'fs/promises';
import appRoot from 'app-root-path'

const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { id, username, email, password } = req.body;

  try {
    var existingUser = await userModel.getUserById(id);
    if (existingUser) return res.status(400).json({ message: 'Id already in use' });

    existingUser = await userModel.getUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = randomBytes(32).toString('hex') + await bcrypt.hash(email, 5);

    const publicPath = appRoot.path + '/public';
    const fileBuffer = await fs.readFile(publicPath + '/resource/avatarDefault.png');
    await userModel.createUser(id, username, email, hashedPassword, token, fileBuffer);

    await sendVerificationEmail(email, token); // send email

    res.status(201).json({ message: 'User registered. Please check your email to verify', id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify user
router.get('/verify', async (req: Request, res: Response) => {
  const { token } = req.query;

  if (typeof token !== 'string' || !await userModel.verifyUser(token)) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  res.json({ message: 'Email verified successfully' });
});


// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const isVerified = await userModel.isUserVerfied(email);
    if (!isVerified) return res.status(401).json({ message: 'Email not verified yet' });

    req.session.userId = user.id;
    res.json({ message: 'Login successful', userId: user.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Logout
router.post('/logout', (req: Request, res: Response) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json({ message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ message: 'Logged out' });
  });
});

// check current login user
router.get('/me', async (req: Request, res: Response) => {
  if (req.session.userId) {
    const user = await userModel.getUserById(req.session.userId);
    res.json({ message: 'User found', user});
  }
  else {
    res.json({ message: 'No user logged in' });
  }
});

// forgot password
router.post('/forgot-password', async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await userModel.getUserByEmail(email);
  if (!user) return res.status(200).json({ message: 'Email not regist' });

  const token = randomBytes(32).toString('hex') + await bcrypt.hash(email, 5);
  const expires = new Date(Date.now() + 1000 * 60 * 15); // 15 minutes

  await userModel.setResetToken(user.id, token, expires);

  await sendResetEmail(email, token);

  res.json({ message: 'Reset link sent' });
});

// reset password
router.post('/reset-password', async (req: Request, res: Response) => {
  const { token, password } = req.body;

  const user = await userModel.getUserByResetToken(token);
  if (!user) return res.status(400).json({ message: 'Invalid or expired token.' });

  userModel.resetPassword(user.id, password);

  res.json({ message: 'Password updated.' });
});

export default router;
