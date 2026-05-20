const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const pool = mysql.createPool({
  host:     process.env.DB_HOST || 'localhost',
  user:     process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD, // Don't fallback to empty string if it might be undefined
  database: process.env.DB_NAME || 'smart_parking',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Debug connection
pool.query('SELECT 1').catch(err => {
  console.error('❌ Database Connection Error:', err.message);
});

module.exports = pool;
