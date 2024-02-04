const logger = require('../utils/logger');
const RatingService = require('../services/RatingService');
const TenancyController = require('./TenancyController');
const Rating = require('../models/Rating');
require('dotenv').config();

class RatingController {

  static async createRating(req, res) {
    const tenantId = TenancyController.getTenantId(req);
    const loggedInUserId = req.jwtContext.userId;
    const currentTime = new Date();
    try {
      const initRating = new Rating('TEMP_ID', loggedInUserId, req.body.subjectId, req.body.ratingValue, req.body.dontCare, req.body.dontKnow, req.body.comment, currentTime);
      const createdRating = await RatingService.createRating(tenantId, initRating);
      logger.debug(`Rating created: ${JSON.stringify(createdRating)}`);
      res.status(201).json(createdRating);
    } catch (error) {
      logger.error(`Failed to create rating for request body: ${JSON.stringify(req.body)}, error: ${error}`, error.stack);
      res.status(500).json({ message: "Failed to create rating for request body: " + JSON.stringify(req.body)});
    }
  }

  static async getRatingById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const rating = await RatingService.getRatingById(tenantId, req.params.ratingId);
      res.status(200).json(rating);
    } catch (error) {
      logger.error(`Failed to get rating by id: ${error} | request params: ${JSON.stringify(req.params)}`, error.stack);
      res.status(500).json({ message: "Failed to get rating by id for request params: " + JSON.stringify(req.params)});
    }
  }

  static async updateRatingById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const loggedInUserId = req.jwtContext.userId;
      const ratingId = req.params.ratingId;
      const rating = await RatingService.getRatingById(tenantId, ratingId);
      if (rating.userId !== loggedInUserId) {
        logger.debug(`User does not have permission to update rating. Logged In UserId = ${loggedInUserId} | Rating: ${JSON.stringify(rating)}`);
        res.status(403).json({ message: 'Forbidden' });
        return;
      }

      const updatedRating = await RatingService.updateRating(tenantId, ratingId, req.body.ratingValue, req.body.comment, req.body.dontCare, req.body.dontKnow);
      res.status(200).json(updatedRating);
    } catch (error) {
      logger.error(`Failed to update rating by id: ${error} | request params: ${JSON.stringify(req.params)}`);
      res.status(500).json({ message: "Failed to update rating by id for request params: " + JSON.stringify(req.params)});
    }
  }

  static async deleteRatingById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const loggedInUserId = req.jwtContext.userId;
      const ratingId = req.params.ratingId;
      const rating = await RatingService.getRatingById(tenantId, ratingId);
      if (rating.userId !== loggedInUserId) {
        res.status(403).json({ message: 'Forbidden' });
        return;
      }
      await RatingService.deleteRatingById(tenantId, ratingId);
      res.status(200).json({ message: 'Rating deleted' });
    } catch (error) {
      logger.error(`Failed to delete rating by id: ${error} | request params: ${JSON.stringify(req.params)}`);
      res.status(500).json({ message: "Failed to delete rating by id for request params: " + JSON.stringify(req.params)});
    }
  }

  /* Query ratings with optional filters: userId, subjectId, startDate, endDate */
  static async queryRatings(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const ratings = await RatingService.queryRatings(tenantId, req.params.userId, req.params.subjectId, req.query.startDate, req.query.endDate);
      res.status(200).json(ratings);
    } catch (error) {
      logger.error(`Failed to get ratings by user id: ${error} | request params: ${JSON.stringify(req.params)}`);
      res.status(500).json({ message: "Failed to get ratings by user id for request params: " + JSON.stringify(req.params)});
    }
  }

}

module.exports = RatingController;
