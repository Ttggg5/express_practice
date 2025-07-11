"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.followingStatus = exports.unfollow = exports.follow = void 0;
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
