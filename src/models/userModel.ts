import bcrypt from 'bcryptjs';
import createDB from '../db';
import { RowDataPacket, OkPacket, FieldPacket, OkPacketParams } from 'mysql2';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  create_time: Date;
  is_verified: boolean;
  verify_token: string;
}

// Get user by email and return User
export const getUserByEmail = (email: string): Promise<User | null> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query<RowDataPacket[]>(sql, [email]);
    resolve(rows[0] as User || null);
  });
};

// Get user by ID and return User with out password
export const getUserById = (id: number): Promise<Omit<User, 'password'> | null> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'SELECT id, username, email, create_time FROM users WHERE id = ?';
    const [rows] = await db.query<RowDataPacket[]>(sql, [id]);
    resolve(rows[0] as Omit<User, 'password'> || null);
  });
};

// Create new user and return user id
export const createUser = (username: string, email: string, hashedPassword: string, token: string): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'INSERT INTO users (username, email, password, create_time, verify_token) VALUES (?, ?, ?, NOW(), ?)';
    const [result] = await db.query<OkPacket>(sql, [username, email, hashedPassword, token]);
    resolve(result.insertId);
  });
};

// Verify the specific user
export const verifyUser = async (token: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const [result]: any = await db.query('SELECT * FROM users WHERE verify_token = ?', [token]);
    const user = result[0] as User || null;

    if (!user) return resolve(false);

    await db.query('UPDATE users SET is_verified = ?, verify_token = NULL WHERE id = ?', [true, user.id]);
    resolve(true);
  });
}

// Check is user verified
export const isUserVerfied = (email: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.query<RowDataPacket[]>(sql, [email]);
    const user = rows[0] as User || null
    if (!user) return resolve(false);
    resolve(user.is_verified);
  });
}

// set reset password token and expires date
export const setResetToken = (userId: number, token: string, expires: Date): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    await db.query(
      'UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?',
      [token, expires, userId]
    );
    resolve();
  });
}

// get user by reset token
export const getUserByResetToken = (token: string): Promise<User | null> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const [rows]: any = await db.query(
      'SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()',
      [token]
    );
    resolve(rows[0] as User || null);
  });
}

export const resetPassword = (userId: number, newPassword: string): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?',
      [hashed, userId]
    );
    resolve();
  });
}
