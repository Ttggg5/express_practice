"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mysql2_1 = __importDefault(require("mysql2"));
const db = mysql2_1.default.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'youruser',
    password: process.env.DB_PASSWORD || 'yourpassword',
    database: process.env.DB_NAME || 'yourdb',
});
db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err.message);
        process.exit(1);
    }
    else {
        console.log('Connected to MySQL database');
    }
});
exports.default = db;
