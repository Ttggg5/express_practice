import { OkPacket, RowDataPacket } from "mysql2/promise";
import db from "../db";

export interface Message {
  id: string;
  from_user_id: string;
  to_user_id: string;
  content: string;
  created_at: Date;
}

export const insertMessage = (id: string, fromUserId: string, toUserId: string, content: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'INSERT INTO messages (id, from_user_id, to_user_id, content) VALUES (?, ?, ?, ?)';
    const [result] = await db.query<OkPacket>(sql, [id, fromUserId, toUserId, content]);
    resolve(result.message);
  });
};

export const getHistoryMessages = (fromUserId: string, toUserId: string): Promise<Message[]> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT * FROM messages
      WHERE (from_user_id = ? AND to_user_id = ?)
      OR (from_user_id = ? AND to_user_id = ?)
      ORDER BY created_at
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [fromUserId, toUserId, toUserId, fromUserId]);
    resolve(rows as Message[] || null);
  });
};