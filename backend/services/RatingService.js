const Rating = require('../models/Rating');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class RatingService {
  
  // Create a new rating - accepts a Rating object, populates the id and createdAt fields, and returns a Rating instance
  async createRating(tenantId, rating) {
    rating.ratingId = uuidv4();
    rating.createdAt = new Date();

    const query = `
      INSERT INTO Ratings (id, tenant_id, user_id, subject_id, rating_value, dont_care, dont_know, created_at, comment) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const values = [rating.ratingId, tenantId, rating.userId, rating.subjectId, rating.rating, rating.comment, rating.dontCare, rating.dontKnow, rating.createdAt];
    const res = await db.query(query, values);
    dbObj = res.rows[0];
    return new Rating(dbObj.id, dbObj.user_id, dbObj.subject_id, dbObj.rating_value, dbObj.dont_care, dbObj.dont_know, dbObj.created_at, dbObj.comment);
  }

  // Get a rating by its ID
  async getRatingById(tenantId, id) {
    const query = `
      SELECT * FROM Ratings WHERE id = $1 AND tenant_id = $2;
    `;
    const res = await db.query(query, [id, tenantId]);
    return res.rows[0];
  }

  // Update a rating
  async updateRating(tenantId, id, rating_value, updated_comment) {
    const query = `
      UPDATE Ratings SET rating = $3, comment = $4 WHERE id = $1 AND tenant_id = $2 RETURNING *;
    `;
    const values = [id, tenantId, rating_value, updated_comment];
    const res = await db.query(query, values);
    return res.rows[0];
  }

  // Delete a rating
  async deleteRating(tenantId, id) {
    const query = `DELETE FROM Ratings WHERE id = $1 AND tenant_id = $2;`;
    const res = await db.query(query, [id, tenantId]);
    return res.rowCount;
  }

  // Query ratings with optional filters
  async queryRatings(tenantId, userId, subjectId, startDate, endDate) {
    let query = `SELECT * FROM Ratings WHERE `;
    const conditions = [];
    const values = [];

    values.push(tenantId);
    conditions.push(`tenant_id = $${tenantId}`);

    if (userId) {
      values.push(userId);
      conditions.push(`user_id = $${userId}`);
    }
    if (subjectId) {
      values.push(subjectId);
      conditions.push(`subject_id = $${subjectId}`);
    }
    if (startDate) {
      values.push(startDate);
      conditions.push(`created_at >= $${startDate}`);
    }
    if (endDate) {
      values.push(endDate);
      conditions.push(`created_at <= $${endDate}`);
    }

    query += conditions.join(' AND ');
    const res = await db.query(query, values);
    return res.rows;
  }
}

module.exports = new RatingService();
