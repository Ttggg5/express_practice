"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateRead = exports.getUsedChatWith = exports.isExists = exports.updateLastChat = exports.insert = void 0;
const db_1 = __importDefault(require("../db"));
const insert = (fromUserId, toUserId) => {
    return new Promise(async (resolve, reject) => {
        let chatWithId = `${fromUserId}${toUserId}`;
        let sql = `INSERT INTO chat_with (id, from_user_id, to_user_id, is_read) VALUES (?, ?, ?, TRUE)`;
        await db_1.default.query(sql, [chatWithId, fromUserId, toUserId]);
        chatWithId = `${toUserId}${fromUserId}`;
        sql = `INSERT INTO chat_with (id, from_user_id, to_user_id, last_chat) VALUES (?, ?, ?, null)`;
        const [result] = await db_1.default.query(sql, [chatWithId, toUserId, fromUserId]);
        resolve(result.message);
    });
};
exports.insert = insert;
// update the users last chat date
const updateLastChat = (fromUserId, toUserId) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      UPDATE chat_with SET last_chat = CURRENT_TIMESTAMP() 
      WHERE from_user_id = ? AND to_user_id = ?
    `;
        const [result] = await db_1.default.query(sql, [fromUserId, toUserId]);
        resolve(result.message);
    });
};
exports.updateLastChat = updateLastChat;
const isExists = (fromUserId, toUserId) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT * FROM chat_with
      WHERE from_user_id = ? AND to_user_id = ?
    `;
        const [rows] = await db_1.default.query(sql, [fromUserId, toUserId]);
        resolve(rows.length > 0 ? true : false);
    });
};
exports.isExists = isExists;
const getUsedChatWith = (userId, limit, offset) => {
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
        const [rows] = await db_1.default.query(sql, [userId, limit, offset]);
        resolve(rows || null);
    });
};
exports.getUsedChatWith = getUsedChatWith;
const updateRead = (fromUserId, toUserId, is_read) => {
    return new Promise(async (resolve, reject) => {
        const chatWithId = `${fromUserId}${toUserId}`;
        const sql = 'UPDATE chat_with SET is_read = ? WHERE id = ?';
        const [result] = await db_1.default.query(sql, [is_read ? 'TRUE' : 'FALSE', chatWithId]);
        resolve(result.message);
    });
};
exports.updateRead = updateRead;
