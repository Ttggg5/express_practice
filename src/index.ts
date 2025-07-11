// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import authRoute from './routes/auth';
import profileRoute from './routes/profile';
import postRoutes from './routes/post';
import userRoutes from './routes/user';
import dotenv from 'dotenv';
dotenv.config();
import db from './db';
import path from 'path';
import appRoot from 'app-root-path'

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

// Middleware
app.use(cors({
  origin: true, // frontend URL
  credentials: true // allow cookies from frontend
}));
app.use(express.json());

app.use('/uploads', express.static(path.join(appRoot.path, 'public', 'uploads')));

// 🔐 Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,    // true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12 // 12 hours
  }
}));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);

// Root test route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend running with TypeScript');
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
