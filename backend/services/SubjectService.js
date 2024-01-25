const db = require('./db');
const { v4: uuidv4 } = require('uuid');

class SubjectService {
    async createSubject(tenantId, subject) {
        // initialize the uuid and createdAt fields
        subject.id = uuidv4();
        subject.createdAt = new Date();

        const result = await db.query('INSERT INTO Subjects (tenant_id, id, title, image_url, description, created_at, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
          [tenantId, subject.id, subject.title, subject.imageUrl, subject.description, subject.createdAt, subject.createdBy]);
        response = result.rows[0];
        return new Subject(response.id, response.title, response.imageUrl, response.description, response.createdAt, response.createdBy);
    }

    async getSubject(tenantId, subjectId) {
        const result = await db.query('SELECT * FROM subjects WHERE id = $1 AND tenant_id = $2', [subjectId, tenantId]);
        response = result.rows[0];
        return new Subject(response.id, response.title, response.imageUrl, response.description, response.createdAt, response.createdBy);
    }

    async updateSubject(tenantId, subject) {
      const updateQuery = 'UPDATE subjects SET title = $1, image_url = $2, description = $3 WHERE id = $4 AND tenant_id = $5 RETURNING *';
      const updateValues = [subject.title, subject.imageUrl, subject.description, id, tenantId];

      const result = await db.query(updateQuery, updateValues);
      const response = result.rows[0];
      return new Subject(response.id, response.title, response.imageUrl, response.description, response.createdAt, response.createdBy);
    }

    async deleteSubject(tenantId, subjectId) {
        await db.query('DELETE FROM subjects WHERE id = $1 AND tenant_id = $2', [subjectId, tenantId]);
        return;
    }

    async findSubjectsByUserId(tenantId, userId) {
        const result = await db.query('SELECT * FROM subjects WHERE user_id = $1 AND tenant_id = $2', [userId, tenantId]);
        response = result.rows;
        return response.map(row => new Subject(row.id, row.title, row.imageUrl, row.description, row.createdAt, row.createdBy));
    }
}

module.exports = new SubjectService();
