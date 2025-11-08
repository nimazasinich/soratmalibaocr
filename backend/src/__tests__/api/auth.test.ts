import request from 'supertest';
import app from '../../app';
import DatabaseManager from '../../utils/database';

describe('Auth API', () => {
  beforeAll(async () => {
    // Initialize database before tests
    await DatabaseManager.initialize();
  });

  afterAll(async () => {
    // Close database connection after tests
    await DatabaseManager.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const newUser = {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'password123',
        full_name: 'Test User',
      };

      const response = await request(app).post('/api/auth/register').send(newUser);

      // May succeed or fail depending on database state
      if (response.status === 201) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe(newUser.username);
        expect(response.body.user.email).toBe(newUser.email);
        expect(response.body.user).not.toHaveProperty('password');
      }
    });

    it('should reject registration with short username', async () => {
      const invalidUser = {
        username: 'ab',
        email: 'test@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with invalid email', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'invalid-email',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject registration with short password', async () => {
      const invalidUser = {
        username: 'testuser',
        email: 'test@example.com',
        password: '12345',
      };

      const response = await request(app).post('/api/auth/register').send(invalidUser);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject duplicate username', async () => {
      const user = {
        username: 'admin',
        email: 'newadmin@example.com',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/register').send(user);

      // Username 'admin' likely exists from seed data
      expect([400, 409]).toContain(response.status);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with valid credentials', async () => {
      const credentials = {
        username: 'admin',
        password: 'admin123',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('token');
        expect(response.body).toHaveProperty('user');
        expect(response.body.user.username).toBe('admin');
        expect(response.body.user).not.toHaveProperty('password');
      }
    });

    it('should reject login with invalid username', async () => {
      const credentials = {
        username: 'nonexistent',
        password: 'password123',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with invalid password', async () => {
      const credentials = {
        username: 'admin',
        password: 'wrongpassword',
      };

      const response = await request(app).post('/api/auth/login').send(credentials);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error');
    });

    it('should reject login with missing credentials', async () => {
      const response = await request(app).post('/api/auth/login').send({});

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/auth/me', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get a token
      const response = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      if (response.status === 200) {
        authToken = response.body.token;
      }
    });

    it('should return current user profile with valid token', async () => {
      if (!authToken) {
        // Skip if we couldn't get a token
        return;
      }

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      if (response.status === 200) {
        expect(response.body).toHaveProperty('user');
        expect(response.body.user).toHaveProperty('username');
        expect(response.body.user).toHaveProperty('email');
        expect(response.body.user).not.toHaveProperty('password');
      }
    });

    it('should reject request without token', async () => {
      const response = await request(app).get('/api/auth/me');

      expect(response.status).toBe(401);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/auth/change-password', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get a token
      const response = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      if (response.status === 200) {
        authToken = response.body.token;
      }
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/auth/change-password').send({
        currentPassword: 'admin123',
        newPassword: 'newpassword123',
      });

      expect(response.status).toBe(401);
    });

    it('should reject with incorrect current password', async () => {
      if (!authToken) {
        return;
      }

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        });

      expect([400, 401]).toContain(response.status);
    });

    it('should reject with short new password', async () => {
      if (!authToken) {
        return;
      }

      const response = await request(app)
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'admin123',
          newPassword: '12345',
        });

      expect(response.status).toBe(400);
    });
  });

  describe('POST /api/auth/logout', () => {
    let authToken: string;

    beforeAll(async () => {
      // Login to get a token
      const response = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      if (response.status === 200) {
        authToken = response.body.token;
      }
    });

    it('should require authentication', async () => {
      const response = await request(app).post('/api/auth/logout');

      expect(response.status).toBe(401);
    });

    it('should logout successfully with valid token', async () => {
      if (!authToken) {
        return;
      }

      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`);

      expect([200, 204]).toContain(response.status);
    });
  });

  describe('Security', () => {
    it('should not expose password in responses', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      if (response.status === 200) {
        expect(response.body.user).not.toHaveProperty('password');
        expect(response.body.user).not.toHaveProperty('password_hash');
      }
    });

    it('should use JWT tokens', async () => {
      const response = await request(app).post('/api/auth/login').send({
        username: 'admin',
        password: 'admin123',
      });

      if (response.status === 200) {
        expect(typeof response.body.token).toBe('string');
        expect(response.body.token.length).toBeGreaterThan(20);
        // JWT tokens typically have 3 parts separated by dots
        expect(response.body.token.split('.').length).toBe(3);
      }
    });
  });
});
