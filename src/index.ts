// src/index.ts
import express, { Request, Response } from 'express';
import cors from 'cors';
import session from 'express-session';
import authRoute from './routes/auth';
import profileRoute from './routes/profile';
import postRoutes from './routes/posts';
import userRoutes from './routes/user';
import notificationsRoutes from './routes/notifications';
import chatRoutes from './routes/chat';
import dotenv from 'dotenv';
import path from 'path';
import appRoot from 'app-root-path';
import os from 'os';
import { createServer } from 'http';
import { SocketIoServer } from './chatSocket';


dotenv.config({path: path.join(appRoot.path, '.env')});

const app = express();
const PORT = process.env.BACKEND_PORT || 8000;

const httpServer = createServer(app);
const socketIoServer = new SocketIoServer(httpServer);
socketIoServer.startChatServer();

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
    secure: false, // true in production with HTTPS
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 12 // 12 hours
  }
}));

// Routes
app.use('/api/auth', authRoute);
app.use('/api/profile', profileRoute);
app.use('/api/posts', postRoutes);
app.use('/api/user', userRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/chat', chatRoutes);

// Root test route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend running with TypeScript');
});

// Start HTTP + WebSocket server
httpServer.listen(PORT, async () => {
  const networkInterfaces = os.networkInterfaces();

  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const addr of addresses as any) {
      if ((addr.family === 'IPv4') && !addr.internal) {
        console.log(`Interface: ${interfaceName}, IP Address: ${addr.address}`);
        console.log(`🚀 Server running on http://${addr.address}:${PORT}`);
        process.env.FRONTEND_BASE_URL = `http://${addr.address}:3000`;
      }
    }
  }
});