// controllers/userController.js
const userService = require('../services/UserService');
require('dotenv').config();

const register = async (req, res) => {
  const tenantId = req.headers['tenant-id'] || process.env.DEFAULT_TENANT_ID;
  try {
    const user = await userService.registerUser(req.body, tenantId);
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const user = await userService.loginUser(req.body);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login
};
