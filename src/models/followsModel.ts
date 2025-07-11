import { FieldPacket, OkPacket, ResultSetHeader, RowDataPacket } from 'mysql2';
import db from '../db';

export interface Follow {
  id: number;
  follower_id: string;
  following_id: string;
  updated_at: Date;
}

interface Count {
  followCount: string;
}

export const follow = (followerId: string, followingId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)';
    const [result] = await db.query<OkPacket>(sql, [followerId, followingId]);
    resolve(result.message);
  });
};

export const unfollow = (followerId: string, followingId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?';
    const [result] = await db.query<OkPacket>(sql, [followerId, followingId]);
    resolve(result.message);
  });
};

export const followingStatus = (followerId: string, followingId: string): Promise<string[]> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1';
    const [rows] = await db.query<RowDataPacket[]>(sql, [followerId, followingId]);
    resolve(rows as unknown as string[] || null);
  });
};

export const followerCount = (userId: string): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'SELECT COUNT(*) AS followCount FROM follows WHERE following_id = ?';
    const [row] = await db.query<RowDataPacket[]>(sql, [userId]);
    resolve(Number((row[0] as Count).followCount));
  });
};

export const followingCount = (userId: string): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'SELECT COUNT(*) AS followCount FROM follows WHERE follower_id = ?';
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId]);
    resolve(Number((rows[0] as Count).followCount));
  });
};

export const getFollowers = (userId: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'SELECT users.id, users.username FROM follows JOIN users ON users.id = follows.follower_id WHERE following_id = ?';
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId]);
    resolve(rows);
  });
};

export const getFollowing = (userId: string): Promise<any> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'SELECT users.id, users.username FROM follows JOIN users ON users.id = follows.following_id WHERE follower_id = ?';
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId]);
    resolve(rows);
  });
};