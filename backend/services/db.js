// eslint-disable-next-line no-unused-vars
const logger = require('../utils/logger');
const { Pool } = require('pg');
const fs = require('fs');

const caCert = fs.readFileSync('./aws-global-bundle.pem')

// SSL Configuration
const sslConfig = {
  rejectUnauthorized: false, // Important for accepting self-signed certificates
  // You can add more SSL configuration here if needed
  ca: caCert
};

const dbConfig = {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT, 
    ssl: sslConfig
};

const pool = new Pool(dbConfig);

module.exports = {
    query: (text, params) => pool.query(text, params),
    shutdown: () => pool.end()
};
