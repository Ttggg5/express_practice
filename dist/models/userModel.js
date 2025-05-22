"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyUser = exports.createUser = exports.getUserById = exports.getUserByEmail = void 0;
const db_1 = __importDefault(require("../db"));
// Get user by email and return User
const getUserByEmail = (email) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM users WHERE email = ?';
        db_1.default.query(sql, [email], (err, results) => {
            if (err)
                return reject(err);
            resolve(results[0] || null);
        });
    });
};
exports.getUserByEmail = getUserByEmail;
// Get user by ID and return User with out password
const getUserById = (id) => {
    return new Promise((resolve, reject) => {
        const sql = 'SELECT id, username, email, create_time FROM users WHERE id = ?';
        db_1.default.query(sql, [id], (err, results) => {
            if (err)
                return reject(err);
            resolve(results[0] || null);
        });
    });
};
exports.getUserById = getUserById;
// Create new user and return user id
const createUser = (username, email, hashedPassword, token) => {
    return new Promise((resolve, reject) => {
        const sql = 'INSERT INTO users (username, email, password, create_time, verify_token) VALUES (?, ?, ?, NOW(), ?)';
        db_1.default.query(sql, [username, email, hashedPassword, token], (err, result) => {
            if (err)
                return reject(err);
            resolve(result.insertId);
        });
    });
};
exports.createUser = createUser;
const verifyUser = async (token) => {
    const [result] = await db_1.default.query('SELECT * FROM users WHERE verify_token = ?', [token]);
    const user = result[0];
    if (!user)
        return false;
    await db_1.default.query('UPDATE users SET is_verified = ?, verify_token = NULL WHERE id = ?', [true, user.id]);
    return true;
};
exports.verifyUser = verifyUser;
