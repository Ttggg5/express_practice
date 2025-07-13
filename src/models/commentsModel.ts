import db from '../db';
import { RowDataPacket, OkPacket, FieldPacket, OkPacketParams } from 'mysql2';

export interface Comment {
  id: string;
  user_id: string;
  post_id: string;
  content: string;
  created_at: Date;
}

export const deleteAllComments = (postId: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    const sql = 'DELETE FROM comments WHERE post_id = ?';
    const [result] = await db.query<OkPacket>(sql, [postId]);
    resolve(result.message);
  });
};