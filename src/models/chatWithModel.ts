import { OkPacket, RowDataPacket } from "mysql2/promise";
import db from "../db";

export interface ChatWith {
  id: number;
  from_user_id: string;
  to_user_id: string;
  created_at: Date;
  target_username: string;
}

export const insert = (fromUserId: string, toUserId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      INSERT INTO chat_with (from_user_id, to_user_id)
      SELECT ?, ?
      WHERE NOT EXISTS (
        SELECT * FROM chat_with
        WHERE (from_user_id = ? AND to_user_id = ?)
        OR (from_user_id = ? AND to_user_id = ?)
      )
    `;
    const [result] = await db.query<OkPacket>(sql, [fromUserId, toUserId, fromUserId, toUserId, toUserId, fromUserId]);
    resolve(result.message);
  });
};

// update the users last chat date
export const updateLastChat = (userId1: string, userId2: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      UPDATE chat_with SET last_chat = CURRENT_TIMESTAMP() 
      WHERE (from_user_id = ? AND to_user_id = ?)
      OR (from_user_id = ? AND to_user_id = ?)
    `;
    const [result] = await db.query<OkPacket>(sql, [userId1, userId2, userId2, userId1]);
    resolve(result.message);
  });
};

export const isExists = (userId1: string, userId2: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT * FROM chat_with
      WHERE (from_user_id = ? AND to_user_id = ?)
      OR (from_user_id = ? AND to_user_id = ?)
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId1, userId2, userId2, userId1]);
    resolve(rows.length > 0 ? true : false);
  });
};

export const getUsedChatWith = (userId: string, limit: number, offset: number): Promise<ChatWith[]> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT id, from_user_id, to_user_id, created_at, 
      CASE
        WHEN from_user_id = ? THEN (SELECT username From users where id = chat_with.to_user_id)
        WHEN to_user_id = ? THEN (SELECT username From users where id = chat_with.from_user_id)
      END as target_username
      FROM chat_with
      WHERE from_user_id = ? OR to_user_id = ?
      ORDER BY last_chat DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId, userId, userId, userId, limit, offset]);
    resolve(rows as ChatWith[] || null);
  });
};
