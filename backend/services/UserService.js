const User  = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const saltRounds = 10;

class UserService {
  static ERROR_USERNAME_EXISTS = "ERROR_USERNAME_EXISTS";
  static ERROR_INVALID_CREDENTIALS = "ERROR_INVALID_CREDENTIALS";
  static ERROR_USER_NOT_FOUND = "ERROR_USER_NOT_FOUND";
  
    /**
     * Creates a new user and inserts it into the database.
     * @throws Error if username already exists or database operation fails.
     * @returns a User.js instance representing the newly created user. 
     */
    static async registerUser(tenantId, username, password, firstName, lastName, emailAddress, nickname = '') {
      // Check if username exists
      const userExists = await db.query('SELECT * FROM Users WHERE username = $1 AND tenant_id = $2', [username, tenantId]);
      if (userExists.rows.length > 0) {
          const e = new Error(`Username '${username}' already exists for tenant '${tenantId}'`);
          e.name = UserService.ERROR_USERNAME_EXISTS;
          throw e;
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const userId = uuidv4();
      const createdAt = new Date();
      // Insert new user
      const resp = await db.query(
          'INSERT INTO Users (tenant_id, id, username, hashed_pwd, first_name, last_name, email_address, nickname, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
          [tenantId, userId, username, hashedPassword, firstName, lastName, emailAddress, nickname, createdAt]
      );
      const row0 = resp.rows[0];
      return new User(row0.id, row0.username, row0.hashed_pwd, row0.first_name, row0.last_name, row0.email_address,row0.nickname, row0.created_at);
    }

    /**
     * For the given the tenantId, username, and password, verified the user's credentials and returns a JWT token. 
     * 
     * @param {string} tenantId - UUID of the tenant
     * @param {string} username - username of the user
     * @param {string} password - password of the user
     * @returns JWT token if login is successful, otherwise throws an error.
     * @throws Error if user does not exist or password is incorrect.
     */
    static async loginUser(tenantId, username, password) {
      // Retrieve user by username
      const queryResult = await db.query('SELECT * FROM Users WHERE username = $1 AND tenant_id = $2', [username, tenantId]);
      const row0 = queryResult.rows[0];

      if (!row0) {
        const error = new Error(`Failed to login user: username ${username} not found`);
        error.name = UserService.ERROR_INVALID_CREDENTIALS;
        throw error;
      }

      // Compare password
      const match = await bcrypt.compare(password, row0.hashed_pwd);
      if (!match) {
        const error = new Error(`Failed to login user: Invalid password for username ${username}`);
        error.name = UserService.ERROR_INVALID_CREDENTIALS;
        throw error;
      }
      
      // Generate JWT token
      const token = jwt.sign({ tenantId: tenantId, userId: row0.id, username: row0.username }, process.env.JWT_SECRET_KEY, {
        expiresIn: '1000h'
      });

      const userObj = new User(row0.id, row0.username, row0.hashed_pwd, row0.first_name, row0.last_name, row0.email_address,row0.nickname, row0.created_at);

      const response = {
        "token": token, 
        "userObj": userObj
      }

      return response;
    }

    static async getUserById(tenantId, userId) {
      const queryResult = await db.query('SELECT * FROM Users WHERE id = $1 AND tenant_id = $2', [userId, tenantId]);
      const row0 = queryResult.rows[0];

      if (!row0) {
        const error = new Error(`Failed to get user by id: user id ${userId} not found`);
        error.name = UserService.ERROR_USER_NOT_FOUND;
        throw error;
      }

      return new User(row0.id, row0.username, row0.hashed_pwd, row0.first_name, row0.last_name, row0.email_address,row0.nickname, row0.created_at);
    }

    static async updateUserById(tenantId, userId, firstName, lastName, emailAddress, nickname) {
      const updateQuery = 'UPDATE Users SET first_name = $1, last_name = $2, email_address = $3, nickname = $4 WHERE id = $5 AND tenant_id = $6 RETURNING *';
      const updateValues = [firstName, lastName, emailAddress, nickname, userId, tenantId];

      const result = await db.query(updateQuery, updateValues);
      const response = result.rows[0];
      return new User(response.id, response.username, response.hashed_pwd, response.first_name, response.last_name, response.email_address, response.nickname, response.created_at);
    }

    static async deleteTenancy(tenantId) {
      await db.query(`DELETE FROM Users WHERE tenant_id = $1;`, [tenantId]);
    }

    static async shutdown() {
      await db.shutdown();
    }
}

module.exports = UserService;
