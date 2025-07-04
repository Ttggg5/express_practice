import { off } from 'process';
import db from '../db';
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
  created_at: Date;
  comment_count: number;
  username: string;
}

export const createPost = (postId: string, userId: string, content: string, postType: PostType): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'INSERT INTO posts (id, user_id, content, post_type) VALUES (?, ?, ?, ?)';
    const [result] = await db.query<OkPacket>(sql, [postId, userId, content, postType]);
    resolve(result.message);
  });
};

export const addPostLike = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};

export const removePostLike = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};

export const getPostsOrderByTime = (limit: number, offset: number): Promise<Post[] | null> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT posts.id, posts.user_id, posts.content, posts.post_type, posts.like_count, posts.dislike_count, posts.share_count, posts.created_at, posts.comment_count, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [limit, offset]);
    resolve(rows as Post[] || null);
  });
};

export const searchPosts = (keyWords: string, limit: number, offset:number): Promise<Post[] | null> => {
  return new Promise(async (resolve, reject) => {
    const sql = `SELECT * FROM posts WHERE content LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const [rows] = await db.query<RowDataPacket[]>(sql, [`%${keyWords}%`, limit, offset]);
    resolve(rows as Post[] || null);
  });
};