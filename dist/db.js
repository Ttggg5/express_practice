"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = __importDefault(require("mysql2/promise"));
const createDB = async () => {
    return promise_1.default.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'youruser',
        password: process.env.DB_PASSWORD || 'yourpassword',
        database: process.env.DB_NAME || 'yourdb',
    });
};
exports.default = createDB;
