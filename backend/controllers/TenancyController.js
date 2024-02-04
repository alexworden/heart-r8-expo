const logger = require('../utils/logger');
const UserService = require('../services/UserService');
const SubjectService = require('../services/SubjectService');
const RatingService = require('../services/RatingService');
require('dotenv').config();

class TenancyController {
  static TENANT_ID_HEADER = 'tenant-id';

  static async deleteTenancy (req, res) {
    const tenantId = TenancyController.getTenantId(req);
    try {
      await UserService.deleteTenancy(tenantId);
      await SubjectService.deleteTenancy(tenantId);
      await RatingService.deleteTenancy(tenantId);
      res.status(200).json(
        { 
          message: `Successfully deleted tenancy with tenantId: ${tenantId}`
        }
      );
    } catch (error) {
      logger.error(`Failed to delete tenancy with tenantId = ${tenantId}`, error);
      res.status(500).json({ message: `Failed to delete tenancy with tenantId = ${tenantId}`});
    }
  }

  static getTenantId(req) {
    return req.headers[TenancyController.TENANT_ID_HEADER] || process.env.DEFAULT_TENANT_ID;
  }

  static async shutdown() {
    await UserService.shutdown();
    // await SubjectService.shutdown();
    // await RatingService.shutdown();
  }
}

module.exports = TenancyController
