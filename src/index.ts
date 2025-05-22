// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import authRoutes from './routes/authRoutes';
import dotenv from 'dotenv';
dotenv.config();
import createDB from './db';

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_BASE_URL, // frontend URL
  credentials: true               // allow cookies from frontend
}));
app.use(express.json());

// 🔐 Session config
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,    // true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 // 1 hour
  }
}));

// Routes
app.use('/api/auth', authRoutes);

// Root test route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend running with TypeScript');
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  const db = await createDB();
  db.connect()
    .then(() => console.log('✅ Connected to MySQL database'))
    .catch((err) => {
      console.error('❌ Database connection failed:', err.message);
      process.exit(1);
    });
});
