import { OkPacket, RowDataPacket } from "mysql2/promise";
import db from "../db";

export enum UserAction{
  posted = 'posted',
  commented = 'commented'
}

export interface Notification {
  id: string;
  user_id: string;
  actor_id: string;
  verb: UserAction;
  post_id: string;
  comment_id: string;
  is_read: boolean;
  created_at: Date;
  actor_name: string;
}

// return the id that have been inserted
export const sendNotifications = (id: string, actorId: string, postId: string, commentId: string | null, action: UserAction): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      INSERT INTO notifications (id, user_id, actor_id, verb, post_id, comment_id)
      SELECT concat(?, '-', follower_id) AS id, follower_id, ?, '${action}', ?, ?
      FROM follows
      WHERE following_id = ?;
    `;
    const [result] = await db.query<OkPacket>(sql, [id, actorId, postId, commentId, actorId]);
    resolve(result.message);
  });
};

export const markRead = (notificationId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = `UPDATE notifications SET is_read = TRUE WHERE id = ?`;
    const [result] = await db.query<OkPacket>(sql, [notificationId]);
    resolve(result.message);
  });
};

export const markReadAll = (userId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`;
    const [result] = await db.query<OkPacket>(sql, [userId]);
    resolve(result.message);
  });
};

export const getNotifications = (userId: string, limit: number, offset: number): Promise<Notification[] | null> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT n.*, u.username AS actor_name
      FROM notifications n
      JOIN users u ON u.id = n.actor_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId, limit, offset]);
    resolve(rows as Notification[] || null);
  });
};

export const getNotificationsByIds = (id: number[]): Promise<Notification[] | null> => {
  return new Promise(async (resolve, reject) => {
    const sql = `SELECT * FROM notifications WHERE id in (?)`;
    const [rows] = await db.query<RowDataPacket[]>(sql, [id]);
    resolve(rows as Notification[] || null);
  });
};

export const getUnreadCount = (userId: string): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    const sql = `SELECT COUNT(is_read) as count FROM notifications WHERE user_id = ? and is_read = FALSE`;
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId]);
    resolve(Number(rows[0].count));
  });
};