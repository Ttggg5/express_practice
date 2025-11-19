import 'express-session';
import { Role } from '../../models/usersModel';

declare module 'express-session' {
  interface SessionData {
    userId?: string;
    role?: Role;
  }
}

declare module 'express-serve-static-core' {
  interface Request {
    postId?: string;
  }
}