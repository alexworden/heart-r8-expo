const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');

const app = express();

app.use(cors());
app.use(express.json());

// User routes
app.post('/signup', userController.register);
app.post('/login', userController.login);

app.get('/', (req, res) => {
  const token = req.headers.authorization.split(' ')[1];
  const decodedToken = jwt.verify(token, 'your-secret-key');

  const firstName = decodedToken.firstName;
  const lastName = decodedToken.lastName;

  res.send(`Hello, ${firstName} ${lastName}!`);
});

export default app;
