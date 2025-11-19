"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updatePost = exports.getUserPosts = exports.searchPosts = exports.getPostsOrderByTime = exports.removePostcomment = exports.addPostcomment = exports.removePostLike = exports.addPostLike = exports.deletePost = exports.getPost = exports.createPost = void 0;
const db_1 = __importDefault(require("../db"));
const createPost = (postId, userId, content) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'INSERT INTO posts (id, user_id, content) VALUES (?, ?, ?)';
        const [result] = await db_1.default.query(sql, [postId, userId, content]);
        resolve(result.message);
    });
};
exports.createPost = createPost;
const getPost = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT posts.id, posts.user_id, posts.content, posts.like_count, posts.dislike_count, posts.share_count, posts.created_at, posts.comment_count, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.id = ?
    `;
        const [rows] = await db_1.default.query(sql, [postId]);
        resolve(rows[0]);
    });
};
exports.getPost = getPost;
const deletePost = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM posts WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.deletePost = deletePost;
const addPostLike = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET like_count = like_count + 1 WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.addPostLike = addPostLike;
const removePostLike = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET like_count = like_count - 1 WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.removePostLike = removePostLike;
const addPostcomment = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET comment_count = comment_count + 1 WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.addPostcomment = addPostcomment;
const removePostcomment = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET comment_count = comment_count - 1 WHERE id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.removePostcomment = removePostcomment;
const getPostsOrderByTime = (limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT posts.id, posts.user_id, posts.content, posts.like_count, posts.dislike_count, posts.share_count, posts.created_at, posts.comment_count, users.username
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
const searchPosts = (keyWords, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT posts.id, posts.user_id, posts.content, posts.like_count, posts.dislike_count, posts.share_count, posts.created_at, posts.comment_count, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE content LIKE ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.default.query(sql, [`%${keyWords}%`, limit, offset]);
        resolve(rows || null);
    });
};
exports.searchPosts = searchPosts;
const getUserPosts = (userId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT posts.id, posts.user_id, posts.content, posts.like_count, posts.dislike_count, posts.share_count, posts.created_at, posts.comment_count, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.user_id = ?
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.default.query(sql, [userId, limit, offset]);
        resolve(rows || null);
    });
};
exports.getUserPosts = getUserPosts;
const updatePost = (postId, content) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'UPDATE posts SET content = ? WHERE id = ?';
        const [result] = await db_1.default.query(sql, [content, postId]);
        resolve(result.message);
    });
};
exports.updatePost = updatePost;
