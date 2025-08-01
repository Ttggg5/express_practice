import 'express-session';
import { Role } from '../../routes/admin/auth';

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