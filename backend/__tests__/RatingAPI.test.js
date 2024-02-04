const app = require('../app'); // path to your server.js file
const logger = require('../utils/logger');
const TENANCY_ID_HEADER = require('../controllers/TenancyController').TENANT_ID_HEADER;
const request = require('supertest');

const testTenantId = `test_${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14)}`;

// Tests for the Rating APIs declared in app.js under the /ratings route

describe('Test Rating APIs', () => {
  let u1Token;
  let u1Id;
  let u2Token;
  let u2Id;

  beforeAll(async () => {
    logger.debug('SubjectAPI beforeAll: Registering a user and logging in...');
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
    u1Token = loginRes.body.token;
    u1Id = loginRes.body.user.id;
    logger.debug(`SubjectAPI beforeAll: User registered and logged in. userId: ${u1Id} | token: ${u1Token}`);

    // Create a second user

    // Create a new user
    const user2Res = await request(app)
      .post('/users/signup')
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        username: 'test2_username',
        password: 'test2_password',
        firstName: 'Test2_First_Name',
        lastName: 'Test2_Last_Name',
        emailAddress: 'test2@email.com',
        nickname: 'test2_nickname'
      });
    // Login the new user and get the token
    const newUserLoginRes = await request(app)
      .post('/users/login')
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        username: 'test2_username',
        password: 'test2_password'
      });
    u2Token = newUserLoginRes.body.token;
    u2Id = newUserLoginRes.body.user.id;
    logger.debug(`SubjectAPI beforeAll: Second user registered and logged in. userId: ${u2Id} | token: ${u2Token}`);
  });

  afterAll(async () => {
    // Delete the test tenancy
    await request(app)
      .delete('/tenancy')
      .set('Authorization', `Bearer ${u1Token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send();

    await app.shutdown();
  });

  it('should create a new rating by a logged in user and then update it', async () => {
    let response = await request(app)
      .post('/ratings')
      .set('Authorization', `Bearer ${u1Token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        subjectId: 'TEMP_SUBJECT_ID',
        ratingValue: 5,
        dontCare: false,
        dontKnow: false,
        comment: 'Test comment'
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
    const ratingId = response.body.id;

    response = await request(app)
      .post(`/ratings/${ratingId}`)
      .set('Authorization', `Bearer ${u1Token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        ratingValue: 4,
        comment: 'Updated test comment',
        dontCare: true,
        dontKnow: true
      });

    expect(response.statusCode).toEqual(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.ratingValue).toEqual(4);
    expect(response.body.comment).toEqual('Updated test comment');
    expect(response.body.dontCare).toEqual(true);
    expect(response.body.dontKnow).toEqual(true);
  });

  it('should not update a rating by a different user', async () => {
    let response = await request(app)
      .post('/ratings')
      .set('Authorization', `Bearer ${u1Token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        subjectId: 'TEMP_SUBJECT_ID',
        ratingValue: 5,
        dontCare: false,
        dontKnow: false,
        comment: 'Test comment'
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
    const ratingId = response.body.id;

    // Try to update the rating with the new user
    response = await request(app)
      .post(`/ratings/${ratingId}`)
      .set('Authorization', `Bearer ${u2Token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        ratingValue: 4,
        comment: 'Updated test comment',
        dontCare: true,
        dontKnow: true
      });
    // Expect a 403 Forbidden response
    expect(response.statusCode).toEqual(403);
  });
});
