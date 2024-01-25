const request = require('supertest');
const app = require('./app'); // path to your server.js file

describe('POST /signup', () => {
  it('should create a new user and return a 200 status code', async () => {
    const res = await request(app)
      .post('/signup')
      .send({
        firstName: 'Test',
        lastName: 'User',
        emailAddress: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id');
  });
});

describe('POST /login', () => {
  it('should authenticate a user and return a 200 status code', async () => {
    const res = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');
  });
});

describe('GET /', () => {
  it('should return a greeting for the authenticated user', async () => {
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });

    const res = await request(app)
      .get('/')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.text).toEqual('Hello, Test User!');
  });
});
