"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAllComments = void 0;
const db_1 = __importDefault(require("../db"));
const deleteAllComments = (postId) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'DELETE FROM comments WHERE post_id = ?';
        const [result] = await db_1.default.query(sql, [postId]);
        resolve(result.message);
    });
};
exports.deleteAllComments = deleteAllComments;
