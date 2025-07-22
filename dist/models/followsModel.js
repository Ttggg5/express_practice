"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFollowing = exports.getFollowers = exports.followingCount = exports.followerCount = exports.followingStatus = exports.unfollow = exports.follow = void 0;
const db_1 = __importDefault(require("../db"));
const follow = (followerId, followingId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'INSERT IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)';
        const [result] = await db_1.default.query(sql, [followerId, followingId]);
        resolve(result.message);
    });
};
exports.follow = follow;
const unfollow = (followerId, followingId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?';
        const [result] = await db_1.default.query(sql, [followerId, followingId]);
        resolve(result.message);
    });
};
exports.unfollow = unfollow;
const followingStatus = (followerId, followingId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ? LIMIT 1';
        const [rows] = await db_1.default.query(sql, [followerId, followingId]);
        resolve(rows || null);
    });
};
exports.followingStatus = followingStatus;
const followerCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT COUNT(*) AS followCount FROM follows WHERE following_id = ?';
        const [row] = await db_1.default.query(sql, [userId]);
        resolve(Number(row[0].followCount));
    });
};
exports.followerCount = followerCount;
const followingCount = (userId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT COUNT(*) AS followCount FROM follows WHERE follower_id = ?';
        const [rows] = await db_1.default.query(sql, [userId]);
        resolve(Number(rows[0].followCount));
    });
};
exports.followingCount = followingCount;
// limit = 0 means get all data
const getFollowers = (userId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const limitOffset = limit === 0 ? '' : `limit ${limit} offset ${offset}`;
        const sql = `
      SELECT users.id, users.username
      FROM follows JOIN users ON users.id = follows.follower_id
      WHERE following_id = ? ${limitOffset}
    `;
        const [rows] = await db_1.default.query(sql, [userId, limit, offset]);
        resolve(rows);
    });
};
exports.getFollowers = getFollowers;
// limit = 0 means get all data
const getFollowing = (userId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const limitOffset = limit === 0 ? '' : `limit ${limit} offset ${offset}`;
        const sql = `
      SELECT users.id, users.username
      FROM follows JOIN users ON users.id = follows.following_id
      WHERE follower_id = ? ${limitOffset}
    `;
        const [rows] = await db_1.default.query(sql, [userId, limit, offset]);
        resolve(rows);
    });
};
exports.getFollowing = getFollowing;
