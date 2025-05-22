import mysql from 'mysql2/promise';

const createDB = async () => {
  return mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'youruser',
    password: process.env.DB_PASSWORD || 'yourpassword',
    database: process.env.DB_NAME || 'yourdb',
  });
}

export default createDB;