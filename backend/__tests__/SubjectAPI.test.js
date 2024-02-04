const app = require('../app'); // path to your server.js file
const logger = require('../utils/logger');
const TENANCY_ID_HEADER = require('../controllers/TenancyController').TENANT_ID_HEADER;
const request = require('supertest');

const testTenantId = `test_${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 14)}`;

// Tests for the Subject APIs declared in app.js under the /subjects route
describe('Test Subject APIs', () => {
  let token;
  let userId;

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
    token = loginRes.body.token;
    userId = loginRes.body.user.id;
    logger.debug(`SubjectAPI beforeAll: User registered and logged in. userId: ${userId} | token: ${token}`);
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

  it('should create a new subject by a logged in user and then update it', async () => {
    let response = await request(app)
      .post('/subjects')
      .set('Authorization', `Bearer ${token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        title: 'test_subject',
        description: 'test_description',
        imageUrl: 'test_image_url',
      });

    expect(response.statusCode).toEqual(201);
    expect(response.body).toHaveProperty('id');
    const createdSubjectId = response.body.id;

    // Verify that we can retrieve the created subject
    response = await request(app)
      .get(`/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send();

    expect(response.statusCode).toEqual(200);
    const fetchedSubject = response.body;
    // verify the subject details are as expected
    expect(fetchedSubject.title).toEqual('test_subject');
    expect(fetchedSubject.description).toEqual('test_description');
    expect(fetchedSubject.createdBy).toEqual(userId);

    // Verify that we can update the created subject
    response = await request(app)
      .post(`/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send({
        title: 'updated_subject',
        description: 'updated_description'
      });

    expect(response.statusCode).toEqual(200);
    const updatedSubject = response.body;
    // verify the subject details are as expected
    expect(updatedSubject.title).toEqual('updated_subject');
    expect(updatedSubject.description).toEqual('updated_description');
    
    // Verify that we can delete the created subject
    const res = await request(app)
      .delete(`/subjects/${createdSubjectId}`)
      .set('Authorization', `Bearer ${token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send();

    expect(res.statusCode).toEqual(200);
  });

  it('should fetch all subjects created by the logged in user and return a 200 status code', async () => {
    const res = await request(app)
      .get('/subjects')
      .set('Authorization', `Bearer ${token}`)
      .set(TENANCY_ID_HEADER, testTenantId) // Add the header for test tenantId
      .send();

    expect(res.statusCode).toEqual(200);
    const fetchedSubjects = res.body;
    expect(fetchedSubjects.length).toEqual(0);
  }
  );
});

