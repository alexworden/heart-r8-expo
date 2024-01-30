// Load environment variables from .env file based upon NODE_ENV
const ENV = process.env.NODE_ENV || "development";
console.log(`Starting Heart-R8 App for environment: .env.${ENV}`);
require('dotenv').config({ path: `.env.${ENV}` });

// eslint-disable-next-line no-unused-vars
const logger = require('./utils/logger');
const express = require('express');
const cors = require('cors');
const { expressjwt: jwt } = require('express-jwt');

const UserController = require('./controllers/UserController');
const SubjectController = require('./controllers/SubjectController');
const TenancyController = require('./controllers/TenancyController');

const app = express();
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

// JWT Middleware
app.use(jwt({ 
  secret: JWT_SECRET_KEY, 
  algorithms: ['HS256'],
  requestProperty: 'jwtContext' 
}).unless({ path: ['/users/signup', '/users/login'] }));

app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// CORS Middleware
app.use(cors());
app.use(express.json());

// User routes
app.post('/users/signup', UserController.register);
app.post('/users/login', UserController.login);
app.get('/users/:userId', UserController.getUserById);
app.post('/users/:userId', UserController.updateUserById);
app.delete('/tenancy', TenancyController.deleteTenancy);

// Subject routes
app.post('/subjects', SubjectController.createSubject);
// Get Subjects created by userId
app.get('/subjects', SubjectController.getSubjectsByUserId);
// Get Subject by subjectId
app.get('/subjects/:subjectId', SubjectController.getSubjectById);
// Update Subject by subjectId
app.post('/subjects/:subjectId', SubjectController.updateSubjectById);
// Delete Subject by subjectId
app.delete('/subjects/:subjectId', SubjectController.deleteSubjectById);
// // Get next Subject to Rate for the logged in user
// app.get('/subjects/next-to-rate', SubjectController.getNextSubjectToRateForLoggedInUser);

module.exports = app;
