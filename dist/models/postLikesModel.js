"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deletePostAllLikes = exports.isLikedPost = exports.unlikePost = exports.likePost = void 0;
const db_1 = __importDefault(require("../db"));
const likePost = (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'INSERT IGNORE INTO post_likes (user_id, post_id) VALUES (?, ?)';
        const [result] = await db_1.default.query(sql, [userId, postId]);
        resolve(result.message);
    });
};
exports.likePost = likePost;
const unlikePost = (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM post_likes WHERE user_id = ? AND post_id = ?';
        const [result] = await db_1.default.query(sql, [userId, postId]);
        resolve(result.message);
    });
};
exports.unlikePost = unlikePost;
const isLikedPost = (userId, postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT * from post_likes where user_id = ? AND post_id = ?';
        const [row] = await db_1.default.query(sql, [userId, postId]);
        resolve(row[0] ? true : false);
    });
};
exports.isLikedPost = isLikedPost;
const deletePostAllLikes = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM post_likes WHERE post_id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.deletePostAllLikes = deletePostAllLikes;
