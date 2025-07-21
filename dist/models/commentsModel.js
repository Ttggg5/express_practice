"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createComment = exports.deleteAllComments = exports.deleteComment = exports.getCommentById = exports.getComments = void 0;
const db_1 = __importDefault(require("../db"));
const getComments = (postId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT comments.id, comments.user_id, comments.post_id, comments.content, comments.created_at, users.username
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
const getCommentById = (commentId) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT comments.id, comments.user_id, comments.post_id, comments.content, comments.created_at, users.username
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE comments.id = ?
    `;
        const [rows] = await db_1.default.query(sql, [commentId]);
        resolve(rows[0] || null);
    });
};
exports.getCommentById = getCommentById;
const deleteComment = (commentId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM comments WHERE id = ?';
        const [result] = await db_1.default.query(sql, [commentId]);
        resolve(result.message);
    });
};
exports.deleteComment = deleteComment;
const deleteAllComments = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM comments WHERE post_id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.deleteAllComments = deleteAllComments;
const createComment = (commentId, postId, userId, content) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'INSERT INTO comments (id, post_id, user_id, content) VALUES(?, ?, ?, ?)';
        const [result] = await db_1.default.query(sql, [commentId, postId, userId, content]);
        resolve(result.message);
    });
};
exports.createComment = createComment;
