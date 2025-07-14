"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.deleteAllComments = exports.getComments = void 0;
const db_1 = __importDefault(require("../db"));
const getComments = (postId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT comments.id, comments.user_id, comments.post_id, comments.created_at, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.post_id = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
        const [result] = await db_1.default.query(sql, [postId, limit, offset]);
        resolve(result || null);
    });
};
exports.getComments = getComments;
const deleteAllComments = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM comments WHERE post_id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.deleteAllComments = deleteAllComments;
const createComment = (commentId, userId, postId, content) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      INSERT INTO comments VALUES(?, ?, ?, ?);
      UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?;
    `;
        const [result] = await db_1.default.query(sql, [commentId, userId, postId, content, postId]);
        resolve(result.message);
    });
};
exports.createComment = createComment;
