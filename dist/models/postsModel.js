"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPostsOrderByTime = exports.rmovePostLike = exports.addPostLike = exports.createPost = void 0;
const db_1 = __importDefault(require("../db"));
var PostType;
(function (PostType) {
    PostType["text"] = "text";
    PostType["image"] = "image";
    PostType["video"] = "video";
})(PostType || (PostType = {}));
const createPost = (postId, userId, content, postType) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'INSERT INTO posts (id, user_id, content, post_type) VALUES (?, ?, ?, ?)';
        const [result] = await db_1.default.query(sql, [postId, userId, content, postType]);
        resolve(result.message);
    });
};
exports.createPost = createPost;
const addPostLike = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.addPostLike = addPostLike;
const rmovePostLike = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.rmovePostLike = rmovePostLike;
const getPostsOrderByTime = (limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT posts.id, posts.user_id, posts.content, posts.post_type, posts.like_count, posts.dislike_count, posts.share_count, posts.created_at, posts.comment_count, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.default.query(sql, [limit, offset]);
        resolve(rows || null);
    });
};
exports.getPostsOrderByTime = getPostsOrderByTime;
