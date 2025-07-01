import createDB from '../db';
import { RowDataPacket, OkPacket, FieldPacket, OkPacketParams } from 'mysql2';

export interface PostLike {
  user_id: string;
  post_id: string;
  created_at: Date;
}

export const likePost = (userId: string, postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)';
    const [result] = await db.query<OkPacket>(sql, [userId, postId]);
    resolve(result.message);
  });
};

export const unlikePost = (userId: string, postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?';
    const [result] = await db.query<OkPacket>(sql, [userId, postId]);
    resolve(result.message);
  });
};