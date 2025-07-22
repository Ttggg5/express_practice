import { OkPacket, RowDataPacket } from "mysql2/promise";
import db from "../db";

export interface ChatWith {
  id: string;
  from_user_id: string;
  to_user_id: string;
  is_read: boolean;
  last_chat: Date;
  created_at: Date;
  target_username: string;
}

export const insert = (fromUserId: string, toUserId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    let chatWithId =`${fromUserId}${toUserId}`;
    let sql = `INSERT INTO chat_with (id, from_user_id, to_user_id, is_read) VALUES (?, ?, ?, TRUE)`;
    await db.query<OkPacket>(sql, [chatWithId, fromUserId, toUserId]);

    chatWithId =`${toUserId}${fromUserId}`;
    sql = `INSERT INTO chat_with (id, from_user_id, to_user_id, last_chat) VALUES (?, ?, ?, null)`;
    const [result] = await db.query<OkPacket>(sql, [chatWithId, toUserId, fromUserId]);
    resolve(result.message);
  });
};

// update the users last chat date
export const updateLastChat = (fromUserId: string, toUserId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      UPDATE chat_with SET last_chat = CURRENT_TIMESTAMP() 
      WHERE from_user_id = ? AND to_user_id = ?
    `;
    const [result] = await db.query<OkPacket>(sql, [fromUserId, toUserId]);
    resolve(result.message);
  });
};

export const isExists = (fromUserId: string, toUserId: string): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT * FROM chat_with
      WHERE from_user_id = ? AND to_user_id = ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [fromUserId, toUserId]);
    resolve(rows.length > 0 ? true : false);
  });
};

export const getUsedChatWith = (userId: string, limit: number, offset: number): Promise<ChatWith[]> => {
  return new Promise(async (resolve, reject) => {
    const sql = `
      SELECT *,
      CASE
        WHEN TRUE THEN (SELECT username From users where id = chat_with.to_user_id)
      END as target_username
      FROM chat_with
      WHERE from_user_id = ?
      ORDER BY last_chat DESC
      LIMIT ? OFFSET ?
    `;
    const [rows] = await db.query<RowDataPacket[]>(sql, [userId, limit, offset]);
    resolve(rows as ChatWith[] || null);
  });
};

export const updateRead = (fromUserId: string, toUserId: string, is_read: boolean): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const chatWithId =`${fromUserId}${toUserId}`;
    const tmp = is_read ? 'TRUE' : 'FALSE';
    const sql = `UPDATE chat_with SET is_read = ${tmp} WHERE id = ?`;
    const [result] = await db.query<OkPacket>(sql, [chatWithId]);
    resolve(result.message);
  });
};