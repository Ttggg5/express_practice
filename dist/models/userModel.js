"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUserVerfied = exports.verifyUser = exports.createUser = exports.getUserById = exports.getUserByEmail = void 0;
const db_1 = __importDefault(require("../db"));
// Get user by email and return User
const getUserByEmail = (email) => {
    return new Promise(async (resolve, reject) => {
        const db = await (0, db_1.default)();
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);
        resolve(rows[0] || null);
    });
};
exports.getUserByEmail = getUserByEmail;
// Get user by ID and return User with out password
const getUserById = (id) => {
    return new Promise(async (resolve, reject) => {
        const db = await (0, db_1.default)();
        const sql = 'SELECT id, username, email, create_time FROM users WHERE id = ?';
        const [rows] = await db.query(sql, [id]);
        resolve(rows[0] || null);
    });
};
exports.getUserById = getUserById;
// Create new user and return user id
const createUser = (username, email, hashedPassword, token) => {
    return new Promise(async (resolve, reject) => {
        const db = await (0, db_1.default)();
        const sql = 'INSERT INTO users (username, email, password, create_time, verify_token) VALUES (?, ?, ?, NOW(), ?)';
        const [result] = await db.query(sql, [username, email, hashedPassword, token]);
        resolve(result.insertId);
    });
};
exports.createUser = createUser;
// Verify the specific user
const verifyUser = async (token) => {
    return new Promise(async (resolve, reject) => {
        const db = await (0, db_1.default)();
        const [result] = await db.query('SELECT * FROM users WHERE verify_token = ?', [token]);
        const user = result[0] || null;
        if (!user)
            return resolve(false);
        await db.query('UPDATE users SET is_verified = ?, verify_token = NULL WHERE id = ?', [true, user.id]);
        resolve(true);
    });
};
exports.verifyUser = verifyUser;
// Check is user verified
const isUserVerfied = (email) => {
    return new Promise(async (resolve, reject) => {
        const db = await (0, db_1.default)();
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await db.query(sql, [email]);
        const user = rows[0] || null;
        resolve(user.is_verified);
    });
};
exports.isUserVerfied = isUserVerfied;
