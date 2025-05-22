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
    resolve(user.is_verified);
  });
}