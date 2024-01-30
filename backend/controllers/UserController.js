const logger = require('../utils/logger');
const UserService = require('../services/UserService');
const TenancyController = require('./TenancyController');
require('dotenv').config();

class UserController {

  static async register (req, res) {
    const tenantId = TenancyController.getTenantId(req);
    try {
      const user = await UserService.registerUser(tenantId, req.body.username, req.body.password, req.body.firstName, req.body.lastName, req.body.emailAddress, req.body.nickname);
      res.status(201).json(user);
    } catch (error) {
      switch (error.name) {
        case UserService.ERROR_USER_EXISTS:
          res.status(409).json({ message: 'User already exists' });
          break;
        default:
          logger.error(`Failed to register user: ${error.message} | request body: ${JSON.stringify(req.body)}`)
          res.status(500).json({ message: "Failed to register user for request body: " + JSON.stringify(req.body)});
      }
    }
  }

  static async login(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const response = await UserService.loginUser(tenantId, req.body.username, req.body.password);
      res.status(200).json(
        { 
          token: response.token, 
          user: response.userObj
        }
      );
    } catch (error) {
      switch (error.name) {
        case UserService.ERROR_INVALID_CREDENTIALS:
          res.status(401).json({ message: 'Invalid credentials' });
          break;
        default:  
          logger.error(`Failed to login user. Request body: ${JSON.stringify(req.body)} Error:` + error);
          res.status(500).json({ message: "Failed to login user for request body: " + JSON.stringify(req.body)});
      }
    }
  }

  static async getUserById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const user = await UserService.getUserById(tenantId, req.params.userId);
      res.status(200).json(user);
    } catch (error) {
      switch (error.name) {
        case UserService.ERROR_USER_NOT_FOUND:
          res.status(404).json({ message: 'User not found' });
          break;
        default:
          logger.error(`Failed to get user by id: ${error} | request params: ${JSON.stringify(req.params)}`);
          res.status(500).json({ message: "Failed to get user by id for request params: " + JSON.stringify(req.params)});
      }
    }
  } 

  static async updateUserById(req, res) {
    try {
      const tenantId = TenancyController.getTenantId(req);
      const user = await UserService.updateUserById(tenantId, req.params.userId, req.body.firstName, req.body.lastName, req.body.emailAddress, req.body.nickname);
      res.status(200).json(user);
    } catch (error) {
      switch (error.name) {
        case UserService.ERROR_USER_NOT_FOUND:
          res.status(404).json({ message: 'User not found' });
          break;
        default:
          logger.error(`Failed to update user by id: ${error} | request params: ${JSON.stringify(req.params)} | request body: ${JSON.stringify(req.body)}`);
          res.status(500).json({ message: "Failed to update user by id for request params: " + JSON.stringify(req.params) + " and request body: " + JSON.stringify(req.body)});
      }
    }
  }
}

module.exports = UserController
