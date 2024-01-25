const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

const saltRounds = 10;

class UserService {
    /**
     * Creates a new user and inserts it into the database.
     * @throws Error if username already exists or database operation fails.
     * @returns a User.js instance representing the newly created user. 
     */
    static async registerUser(tenantId, username, password, nickname = '') {
        try {
            // Check if username exists
            const userExists = await db.query('SELECT * FROM Users WHERE username = $1 AND tenant_id = $2', [username, tenantId]);
            if (userExists.rows.length > 0) {
                throw new Error('Username already exists');
            }
            
            // Hash password
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const uuid = uuidv4();
            const createdAt = new Date();
            // Insert new user
            const resp = await db.query(
                'INSERT INTO Users (tenant_id, id, username, hashedPwd, nickname, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
                [tenantId, uuid, username, hashedPassword, nickname, createdAt]
            );
            const row0 = resp.rows[0];
            return new User(row0.id, row0.username, row0.hashed_pwd, row0.nickname, row0.created_at);
        } catch (error) {
          throw new Error(`Database operation failed: ${error.message}`);
        }
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
      try {
        // Retrieve user by username
        const result = await db.query('SELECT * FROM Users WHERE username = $1 AND tenant_id = $2', [username, tenantId]);
        const user = result.rows[0];

        if (!user) {
          throw new Error('User not found');
        }

        // Compare password
        const match = await bcrypt.compare(password, user.hashedPwd);
        if (!match) {
          throw new Error('Invalid credentials');
        }

        // Generate JWT token
        const token = jwt.sign({ tenantId: tenantId, userId: user.id, username: user.username }, process.env.JWT_SECRET, {
          expiresIn: '1h'
        });

        return token;
      } catch (error) {
        throw new Error(`Failed to log in: ${error.message}`);
      }
    }
}

module.exports = UserService;
