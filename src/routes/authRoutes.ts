import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getUserByEmail, getUserById, createUser, verifyUser, isUserVerfied } from '../models/userModel';
import { randomBytes } from 'crypto';
import { sendVerificationEmail } from '../utils/mail';


const router = Router();

// Register
router.post('/register', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;

  try {
    const existingUser = await getUserByEmail(email);
    if (existingUser) return res.status(400).json({ message: 'Email already in use' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const token = randomBytes(32).toString('hex') + await bcrypt.hash(email, 5);

    const userId = await createUser(username, email, hashedPassword, token);

    await sendVerificationEmail(email, token); // send email

    res.status(201).json({ message: 'User registered. Please check your email to verify', userId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify user
router.get('/verify', async (req: Request, res: Response) => {
  const { token } = req.query;

  if (typeof token !== 'string' || !await verifyUser(token)) {
    return res.status(400).json({ message: 'Invalid token' });
  }

  res.json({ message: 'Email verified successfully' });
});


// Login
router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await getUserByEmail(email);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: 'Invalid password' });

    const isVerified = await isUserVerfied(email);
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
    const user = await getUserById(req.session.userId);
    res.json({ message: 'User found', user});
  }
  else {
    res.json({ message: 'No user logged in' });
  }
});

export default router;
