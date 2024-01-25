const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

// SSL Configuration
const sslConfig = {
  rejectUnauthorized: false, // Important for accepting self-signed certificates
  // You can add more SSL configuration here if needed
};

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT, 
    ssl: sslConfig
};

/**
 * Database connection pool.
 * @type {Pool}
 * @see {@link https://github.com/brianc/node-postgres/wiki/Client#new-pool-object|Pool Documentation}
 */
const pool = new Pool(dbConfig);

module.exports = {
    query: (text, params) => pool.query(text, params),
};
