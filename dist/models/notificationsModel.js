"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNotificationsByIds = exports.getNotifications = exports.markReadAll = exports.markRead = exports.sendNotifications = exports.UserAction = void 0;
const db_1 = __importDefault(require("../db"));
var UserAction;
(function (UserAction) {
    UserAction["posted"] = "posted";
    UserAction["commented"] = "commented";
})(UserAction || (exports.UserAction = UserAction = {}));
// return the id that have been inserted
const sendNotifications = (actorId, postId, commentId, action) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      INSERT INTO notifications (user_id, actor_id, verb, post_id, comment_id)
      SELECT follower_id, ?, '${action}', ?, ?
      FROM follows
      WHERE following_id = ?;
    `;
        const [result] = await db_1.default.query(sql, [actorId, postId, commentId, actorId]);
        resolve(result.message);
    });
};
exports.sendNotifications = sendNotifications;
const markRead = (notificationId) => {
    return new Promise(async (resolve, reject) => {
        const sql = `UPDATE notifications SET is_read = TRUE WHERE id = ?`;
        const [result] = await db_1.default.query(sql, [notificationId]);
        resolve(result.message);
    });
};
exports.markRead = markRead;
const markReadAll = (userId) => {
    return new Promise(async (resolve, reject) => {
        const sql = `UPDATE notifications SET is_read = TRUE WHERE user_id = ?`;
        const [result] = await db_1.default.query(sql, [userId]);
        resolve(result.message);
    });
};
exports.markReadAll = markReadAll;
const getNotifications = (userId, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = `
      SELECT n.*, u.username AS actor_name
      FROM notifications n
      JOIN users u ON u.id = n.actor_id
      WHERE n.user_id = ?
      ORDER BY n.created_at DESC
      LIMIT ? OFFSET ?
    `;
        const [rows] = await db_1.default.query(sql, [userId, limit, offset]);
        resolve(rows || null);
    });
};
exports.getNotifications = getNotifications;
const getNotificationsByIds = (id) => {
    return new Promise(async (resolve, reject) => {
        const sql = `SELECT * FROM notifications WHERE id in (?)`;
        const [rows] = await db_1.default.query(sql, [id]);
        resolve(rows || null);
    });
};
exports.getNotificationsByIds = getNotificationsByIds;
