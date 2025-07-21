"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHistoryMessages = exports.insertMessage = void 0;
const db_1 = __importDefault(require("../db"));
const insertMessage = (id, fromUserId, toUserId, content) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'INSERT INTO messages (id, from_user_id, to_user_id, content) VALUES (?, ?, ?, ?)';
        const [result] = await db_1.default.query(sql, [id, fromUserId, toUserId, content]);
        resolve(result.message);
    });
};
exports.insertMessage = insertMessage;
const getHistoryMessages = (fromUserId, toUserId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT * FROM messages
      WHERE (from_user_id = ? AND to_user_id = ?)
      OR (from_user_id = ? AND to_user_id = ?)
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.default.query(sql, [fromUserId, toUserId, toUserId, fromUserId, limit, offset]);
        resolve(rows || null);
    });
};
exports.getHistoryMessages = getHistoryMessages;
