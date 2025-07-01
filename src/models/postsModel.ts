import createDB from '../db';
import { RowDataPacket, OkPacket, FieldPacket, OkPacketParams } from 'mysql2';

enum PostType {
  text = 'text',
  image = 'image',
  video = 'video'
}

export interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: PostType;
  like_count: number;
  dislike_count: number;
  share_count: number;
  view_count: number;
  created_at: Date;
}

export const createPost = (postId: string, userId: string, content: string, postType: PostType): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'INSERT INTO posts (id, user_id, content, post_type) VALUES (?, ?, ?, ?)';
    const [result] = await db.query<OkPacket>(sql, [postId, userId, content, postType]);
    resolve(result.message);
  });
};

export const addPostLike = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};

export const rmovePostLike = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};

export const getPostsOrderByTime = (limit: number, offset: number): Promise<Post[] | null> => {
  return new Promise(async (resolve, reject) => {
    const db = await createDB();
    const sql = `
      SELECT posts.id, posts.content, posts.post_type, posts.created_at, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [limit, offset]);
    resolve(rows as Post[] || null);
  });
};