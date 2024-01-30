const db = require('./db');
const { v4: uuidv4 } = require('uuid');
const Subject = require('../models/Subject');

class SubjectService {
    static ERROR_SUBJECT_NOT_FOUND = "ERROR_SUBJECT_NOT_FOUND";

    static async createSubject(tenantId, subject) {
        // initialize the uuid and createdAt fields
        subject.id = uuidv4();
        subject.createdAt = new Date();

        const result = await db.query('INSERT INTO Subjects (tenant_id, id, title, image_url, description, created_at, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *', 
            [tenantId, subject.id, subject.title, subject.imageUrl, subject.description, subject.createdAt, subject.createdBy]);
        const response = result.rows[0];
        return new Subject(response.id, response.title, response.image_url, response.description, response.created_at, response.created_by);
    }

    static async getSubject(tenantId, subjectId) {
        const result = await db.query('SELECT * FROM subjects WHERE id = $1 AND tenant_id = $2', [subjectId, tenantId]);
        const response = result.rows[0];
        if (!response) {
            const error = new Error(`Failed to get subject: subjectId ${subjectId} not found`);
            error.name = SubjectService.ERROR_SUBJECT_NOT_FOUND;
            throw error;
        }
        return new Subject(response.id, response.title, response.image_url, response.description, response.created_at, response.created_by);
    }

    static async updateSubject(tenantId, subject) {
        const updateQuery = 'UPDATE subjects SET title = $1, image_url = $2, description = $3 WHERE id = $4 AND tenant_id = $5 RETURNING *';
        const updateValues = [subject.title, subject.imageUrl, subject.description, subject.id, tenantId];

        const result = await db.query(updateQuery, updateValues);
        const response = result.rows[0];
        return new Subject(response.id, response.title, response.image_url, response.description, response.created_at, response.created_by);
    }

    static async deleteSubject(tenantId, subjectId) {
        await db.query('DELETE FROM subjects WHERE id = $1 AND tenant_id = $2', [subjectId, tenantId]);
        return;
    }

    static async findSubjectsByUserId(tenantId, userId) {
        const result = await db.query('SELECT * FROM subjects WHERE created_by = $1 AND tenant_id = $2', [userId, tenantId]);
        const response = result.rows;
        return response.map(row => new Subject(row.id, row.title, row.image_url, row.description, row.created_at, row.created_by));
    }

    static async deleteTenancy(tenantId) {
        await db.query(`DELETE FROM Subjects WHERE tenant_id = $1;`, [tenantId]);
    }
}

module.exports = SubjectService;
