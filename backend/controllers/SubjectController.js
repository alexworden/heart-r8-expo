const logger = require('../utils/logger');
const SubjectService = require('../services/SubjectService');
const TenancyController = require('./TenancyController');
const Subject = require('../models/Subject');
require('dotenv').config();

class SubjectController {

  static async createSubject (req, res) {
    const tenantId = TenancyController.getTenantId(req);
    const loggedInUserId = req.jwtContext.userId;
    const currentTime = new Date();
    try {
      const initSubject = new Subject('TEMP_ID', req.body.title, req.body.imageUrl, req.body.description, currentTime, loggedInUserId);
      const createdSubject = await SubjectService.createSubject(tenantId, initSubject);
      res.status(201).json(createdSubject);
    } catch (error) {
      logger.error(`Failed to create subject for request body: ${JSON.stringify(req.body)}, error: ${error}`, error.stack);
      res.status(500).json({ message: "Failed to create subject for request body: " + JSON.stringify(req.body)});
    }
  }

  static async getSubjectById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const subject = await SubjectService.getSubject(tenantId, req.params.subjectId);
      res.status(200).json(subject);
    } catch (error) {
      switch (error.name) {
        case SubjectService.ERROR_SUBJECT_NOT_FOUND:
          res.status(404).json({ message: 'Subject not found' });
          break;
        default:
          logger.error(`Failed to get subject by id: ${error} | request params: ${JSON.stringify(req.params)}`);
          res.status(500).json({ message: "Failed to get subject by id for request params: " + JSON.stringify(req.params)});
      }
    }
  }

  static async updateSubjectById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const loggedInUserId = req.jwtContext.userId;
      const subject = await SubjectService.getSubject(tenantId, req.params.subjectId);
      if (subject.createdBy !== loggedInUserId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      // For each field in the request, update the subject
      if (req.body.title) {
        subject.title = req.body.title;
      }
      if (req.body.imageUrl) {
        subject.imageUrl = req.body.imageUrl;
      }
      if (req.body.description) {
        subject.description = req.body.description;
      }
      const updatedSubject = await SubjectService.updateSubject(tenantId, subject);
      res.status(200).json(updatedSubject);
    } catch (error) {
      switch (error.name) {
        case SubjectService.ERROR_SUBJECT_NOT_FOUND:
          res.status(404).json({ message: 'Subject not found' });
          break;
        default:
          logger.error(`Failed to update subject by id: ${error} | request body: ${JSON.stringify(req.body)}`);
          res.status(500).json({ message: "Failed to update subject by id for request body: " + JSON.stringify(req.body)});
      }
    }
  }

  static async deleteSubjectById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const loggedInUserId = req.jwtContext.userId;
      const subject = await SubjectService.getSubject(tenantId, req.params.subjectId);
      if (subject.createdBy !== loggedInUserId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      await SubjectService.deleteSubject(tenantId, req.params.subjectId);
      res.status(200).json();
    } catch (error) {
      switch (error.name) {
        case SubjectService.ERROR_SUBJECT_NOT_FOUND:
          res.status(204).json({ message: 'Subject not found' });
          break;
        default:
          logger.error(`Failed to delete subject by id: ${error} | request params: ${JSON.stringify(req.params)}`);
          res.status(500).json({ message: "Failed to delete subject by id for request params: " + JSON.stringify(req.params)});
      }
    }
  }

  static async getSubjectsByUserId(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const subjects = await SubjectService.findSubjectsByUserId(tenantId, req.params.userId);
      res.status(200).json(subjects);
    } catch (error) {
      logger.error(`Failed to get subjects by user id: ${error} | request params: ${JSON.stringify(req.params)}`);
      res.status(500).json({ message: "Failed to get subjects by user id for request params: " + JSON.stringify(req.params)});
    }
  }

}

module.exports = SubjectController
