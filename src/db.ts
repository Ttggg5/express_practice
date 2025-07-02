import mysql from 'mysql2/promise';

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'youruser',
  password: process.env.DB_PASSWORD || 'yourpassword',
  database: process.env.DB_NAME || 'yourdb',
  waitForConnections: true,
  connectionLimit: 10, // adjust as needed
  queueLimit: 0
});

export default db;