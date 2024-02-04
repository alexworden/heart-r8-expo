const app = require('../app'); // path to your server.js file
const logger = require('../utils/logger');
const TENANCY_ID_HEADER = require('../controllers/TenancyController').TENANT_ID_HEADER;
const request = require('supertest');

const testTenantId = `test_${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14)}`;

describe('UserAPI Tests', () => {
  let token;
  let userId;

  beforeAll(async () => {
    logger.debug('beforeAll: Registering a user and logging in...');
    // Create a user for the tests
    const res = await request(app)
      .post('/users/signup')
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        username: 'test_username',
        password: 'password123',
        firstName: 'Test_First_Name',
        lastName: 'Test_Last_Name',
        emailAddress: 'test@email.com',
        nickname: 'test_nickname'
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');

    // Login the user and get the token
    const loginRes = await request(app)
      .post('/users/login')
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        username: 'test_username',
        password: 'password123'
      });
      
    expect(loginRes.statusCode).toEqual(200);
    expect(loginRes.body).toHaveProperty('token');
    token = loginRes.body.token;
    userId = loginRes.body.user.id;
    logger.debug(`beforeAll: User registered and logged in. userId: ${userId} | token: ${token}`);
  });
  
  it('Verify that /users/login authenticates valid credentials and returns a 200 status code', async () => {
    let res = await request(app)
      .post('/users/login')
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        username: 'test_username',
        password: 'password123'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('token');

    const userId = res.body.user.id;
    const token = res.body.token;

    res = await request(app)
    .get(`/users/${userId}`)
    .set('Authorization', `Bearer ${token}`)
    .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
    .send();

    expect(res.statusCode).toEqual(200);
    const fetchedUser = res.body;
    // verify the user details are as expected
    expect(fetchedUser.firstName).toEqual('Test_First_Name');
    expect(fetchedUser.lastName).toEqual('Test_Last_Name');
    expect(fetchedUser.emailAddress).toEqual('test@email.com');
    expect(fetchedUser.nickname).toEqual('test_nickname');

    res = await request(app)
    .post(`/users/${userId}`)
    .set('Authorization', `Bearer ${token}`)
    .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
    .send({
      firstName: 'Update_First_Name',
      lastName: 'Update_Last_Name',
      emailAddress: 'updated@email.com',
      nickname: 'Update_Nickname'
    });

    expect(res.statusCode).toEqual(200);
    const updatedUser = res.body;
    // verify the user details are as expected
    expect(updatedUser.firstName).toEqual('Update_First_Name');
    expect(updatedUser.lastName).toEqual('Update_Last_Name');
    expect(updatedUser.emailAddress).toEqual('updated@email.com');
    expect(updatedUser.nickname).toEqual('Update_Nickname');

  });

  afterAll(async () => {
    // Delete the test tenancy
    await request(app)
      .delete('/tenancy')
      .set('Authorization', `Bearer ${token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send();

      await app.shutdown();
  });
});
