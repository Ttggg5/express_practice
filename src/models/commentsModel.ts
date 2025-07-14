import db from '../db';
import { RowDataPacket, OkPacket, FieldPacket, OkPacketParams } from 'mysql2';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: Date;
  username: string;
}

export const getComments = (postId: string, limit: number, offset: number): Promise<Comment[] | null> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT comments.id, comments.user_id, comments.post_id, comments.content, comments.created_at, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const [result] = await db.query<RowDataPacket[]>(sql, [postId, limit, offset]);
    resolve(result as Comment[] || null);
  });
};

export const getCommentById = (commentId: string): Promise<Comment | null> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT comments.id, comments.user_id, comments.post_id, comments.content, comments.created_at, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [commentId]);
    resolve(rows[0] as Comment || null);
  });
};


export const deleteAllComments = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'DELETE FROM comments WHERE post_id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};

export const createComment = (commentId: string, postId: string, userId: string, content: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'INSERT INTO comments (id, post_id, user_id, content) VALUES(?, ?, ?, ?)';
    const [result] = await db.query<OkPacket>(sql, [commentId, postId, userId, content]);
    resolve(result.message);
  });
};