"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchUserFromIdName = exports.getAvatar = exports.updateAvatar = exports.updateUser = exports.resetPassword = exports.getUserByResetToken = exports.setResetToken = exports.isUserVerfied = exports.verifyUser = exports.createUser = exports.getUserById = exports.getUserByEmail = exports.Role = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = __importDefault(require("../db"));
var Role;
(function (Role) {
    Role["user"] = "user";
    Role["supervisor"] = "supervisor";
})(Role || (exports.Role = Role = {}));
// Get user by email and return User
const getUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db_1.default.query(sql, [email]);
        resolve(rows[0] || null);
    });
};
exports.getUserByEmail = getUserByEmail;
// Get user by ID and return User with out password
const getUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT id, username, email, create_time, is_verified, verify_token, bio, updated_at FROM users WHERE id = ?';
        const [rows] = await db_1.default.query(sql, [id]);
        resolve(rows[0] || null);
    });
};
exports.getUserById = getUserById;
// Create new user and return user id
const createUser = (id, username, email, hashedPassword, token, avatar) => {
    return new Promise(async (resolve, reject) => {
        if (!id.startsWith('@'))
            id = '@' + id;
        const sql = 'INSERT INTO users (id, username, email, password, verify_token, avatar) VALUES (?, ?, ?, ?, ?, ?)';
        const [result] = await db_1.default.query(sql, [id, username, email, hashedPassword, token, avatar]);
        resolve(result.message);
    });
};
exports.createUser = createUser;
// Verify the specific user
const verifyUser = async (token) => {
    return new Promise(async (resolve, reject) => {
        const [result] = await db_1.default.query('SELECT * FROM users WHERE verify_token = ?', [token]);
        const user = result[0] || null;
        if (!user)
            return resolve(false);
        await db_1.default.query('UPDATE users SET is_verified = ?, verify_token = NULL WHERE id = ?', [true, user.id]);
        resolve(true);
    });
};
exports.verifyUser = verifyUser;
// Check is user verified
const isUserVerfied = (email) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db_1.default.query(sql, [email]);
        const user = rows[0] || null;
        if (!user)
            return resolve(false);
        resolve(user.is_verified);
    });
};
exports.isUserVerfied = isUserVerfied;
// set reset password token and expires date
const setResetToken = (userId, token, expires) => {
    return new Promise(async (resolve, reject) => {
        await db_1.default.query('UPDATE users SET reset_token = ?, reset_token_expires = ? WHERE id = ?', [token, expires, userId]);
        resolve();
    });
};
exports.setResetToken = setResetToken;
// get user by reset token
const getUserByResetToken = (token) => {
    return new Promise(async (resolve, reject) => {
        const [rows] = await db_1.default.query('SELECT * FROM users WHERE reset_token = ? AND reset_token_expires > NOW()', [token]);
        resolve(rows[0] || null);
    });
};
exports.getUserByResetToken = getUserByResetToken;
const resetPassword = (userId, newPassword) => {
    return new Promise(async (resolve, reject) => {
        const hashed = await bcryptjs_1.default.hash(newPassword, 10);
        await db_1.default.query('UPDATE users SET password = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?', [hashed, userId]);
        resolve();
    });
};
exports.resetPassword = resetPassword;
// fields = (ex: ['username = ?', 'bio = ?'])
const updateUser = (fields, values) => {
    return new Promise(async (resolve, reject) => {
        await db_1.default.query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, [values]);
        resolve();
    });
};
exports.updateUser = updateUser;
const updateAvatar = (userId, avatar) => {
    return new Promise(async (resolve, reject) => {
        await db_1.default.query('UPDATE users SET avatar = ? WHERE id = ?', [avatar, userId]);
        resolve();
    });
};
exports.updateAvatar = updateAvatar;
const getAvatar = (userId) => {
    return new Promise(async (resolve, reject) => {
        const [rows] = await db_1.default.query('SELECT avatar FROM users WHERE id = ?', [userId]);
        try {
            resolve(rows[0].avatar);
        }
        catch {
            resolve(null);
        }
    });
};
exports.getAvatar = getAvatar;
const searchUserFromIdName = (keyword, limit, offset) => {
    return new Promise(async (resolve, reject) => {
        const sql = 'SELECT id, username FROM users WHERE id LIKE ? or username LIKE ? LIMIT ? OFFSET ?';
        const [rows] = await db_1.default.query(sql, [`%${keyword}%`, `%${keyword}%`, limit, offset]);
        resolve(rows);
    });
};
exports.searchUserFromIdName = searchUserFromIdName;
