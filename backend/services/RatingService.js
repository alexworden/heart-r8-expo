const Rating = require('../models/Rating');
const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class RatingService {

  // Create a new rating - accepts a Rating object, populates the id and createdAt fields, and returns a Rating instance
  static async createRating(tenantId, rating) {
    rating.ratingId = uuidv4();
    rating.createdAt = new Date();

    const query = `
      INSERT INTO Ratings (id, tenant_id, user_id, subject_id, rating_value, dont_care, dont_know, created_at, comment) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *;
    `;
    const values = [rating.ratingId, tenantId, rating.userId, rating.subjectId, rating.ratingValue, rating.dontCare, rating.dontKnow, rating.createdAt, rating.comment];
    const res = await db.query(query, values);
    return this.__createRatingFromDBRow(res.rows[0]);
  }

  // Get a rating by its ID
  static async getRatingById(tenantId, id) {
    const query = `
      SELECT * FROM Ratings WHERE id = $1 AND tenant_id = $2;
    `;
    const res = await db.query(query, [id, tenantId]);
    return this.__createRatingFromDBRow(res.rows[0]);
  }

  // Update a rating
  static async updateRating(tenantId, id, update_rating_value, update_comment, update_dont_care, update_dont_know) {
    let query = 'UPDATE Ratings SET';
    let values = [];
    let index = 1;

    if (update_rating_value !== null) {
      query += ` rating_value = $${index},`;
      values.push(update_rating_value);
      index++;
    }

    if (update_comment !== null) {
      query += ` comment = $${index},`;
      values.push(update_comment);
      index++;
    }

    if (update_dont_care !== null) {
      query += ` dont_care = $${index},`;
      values.push(update_dont_care);
      index++;
    }

    if (update_dont_know !== null) {
      query += ` dont_know = $${index},`;
      values.push(update_dont_know);
      index++;
    }

    // Remove the last comma and add the WHERE clause
    query = query.slice(0, -1) + ` WHERE id = $${index} AND tenant_id = $${index + 1} RETURNING *;`;
    values.push(id, tenantId);
    const res = await db.query(query, values);
    return this.__createRatingFromDBRow(res.rows[0]);
  }

  // Delete a rating
  static async deleteRatingById(tenantId, id) {
    const query = `DELETE FROM Ratings WHERE id = $1 AND tenant_id = $2;`;
    const res = await db.query(query, [id, tenantId]);
    return res.rowCount > 0;
  }

  // Query ratings with optional filters
  static async queryRatings(tenantId, userId, subjectId, startDate, endDate) {
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
    return res.rows.map(row => this.__createRatingFromDBRow(row));
  }

  static async deleteTenancy(tenantId) {
    await db.query(`DELETE FROM Ratings WHERE tenant_id = $1;`, [tenantId]);
  }

  // Create a new rating from a database row
  static __createRatingFromDBRow(dbObj) {
    return new Rating(dbObj.id, dbObj.user_id, dbObj.subject_id, dbObj.rating_value, dbObj.dont_care, dbObj.dont_know, dbObj.created_at, dbObj.comment);
  }
}

module.exports = RatingService;
