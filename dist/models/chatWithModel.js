"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsedChatWith = exports.isExists = exports.updateLastChat = exports.insert = void 0;
const db_1 = __importDefault(require("../db"));
const insert = (fromUserId, toUserId) => {
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
        const [result] = await db_1.default.query(sql, [fromUserId, toUserId, fromUserId, toUserId, toUserId, fromUserId]);
        resolve(result.message);
    });
};
exports.insert = insert;
// update the users last chat date
const updateLastChat = (userId1, userId2) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      UPDATE chat_with SET last_chat = CURRENT_TIMESTAMP() 
      WHERE (from_user_id = ? AND to_user_id = ?)
      OR (from_user_id = ? AND to_user_id = ?)
    `;
        const [result] = await db_1.default.query(sql, [userId1, userId2, userId2, userId1]);
        resolve(result.message);
    });
};
exports.updateLastChat = updateLastChat;
const isExists = (userId1, userId2) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT * FROM chat_with
      WHERE (from_user_id = ? AND to_user_id = ?)
      OR (from_user_id = ? AND to_user_id = ?)
    `;
        const [rows] = await db_1.default.query(sql, [userId1, userId2, userId2, userId1]);
        resolve(rows.length > 0 ? true : false);
    });
};
exports.isExists = isExists;
const getUsedChatWith = (userId, limit, offset) => {
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
        const [rows] = await db_1.default.query(sql, [userId, userId, userId, userId, limit, offset]);
        resolve(rows || null);
    });
};
exports.getUsedChatWith = getUsedChatWith;
