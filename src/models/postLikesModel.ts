import db from '../db';
import { RowDataPacket, OkPacket, FieldPacket, OkPacketParams } from 'mysql2';

export interface PostLike {
  user_id: string;
  post_id: string;
  created_at: Date;
}

export const likePost = (userId: string, postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)';
    const [result] = await db.query<OkPacket>(sql, [userId, postId]);
    resolve(result.message);
  });
};

export const unlikePost = (userId: string, postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?';
    const [result] = await db.query<OkPacket>(sql, [userId, postId]);
    resolve(result.message);
  });
};

export const isLikedPost = (userId: string, postId: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'SELECT * from post_likes where user_id = ? AND post_id = ?';
    const [row] = await db.query<RowDataPacket[]>(sql, [userId, postId]);
    resolve(row[0] ? true : false);
  });
};

export const deletePostAllLikes = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'DELETE FROM post_likes WHERE post_id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};