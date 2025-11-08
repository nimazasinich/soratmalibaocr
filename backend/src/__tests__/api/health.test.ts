import request from 'supertest';
import app from '../../app';

describe('Health API', () => {
  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app).get('/api/health');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.status).toBe('OK');
    });

    it('should have database status in health check', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('database');
      expect(response.body.database).toHaveProperty('status');
    });

    it('should return uptime information', async () => {
      const response = await request(app).get('/api/health');

      expect(response.body).toHaveProperty('uptime');
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('GET /api/health/db', () => {
    it('should return database health status', async () => {
      const response = await request(app).get('/api/health/db');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('database');
    });

    it('should indicate if database is connected', async () => {
      const response = await request(app).get('/api/health/db');

      expect(response.body.database).toHaveProperty('connected');
      expect(typeof response.body.database.connected).toBe('boolean');
    });
  });

  describe('Root Endpoint', () => {
    it('should return API information', async () => {
      const response = await request(app).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('docs');
      expect(response.body).toHaveProperty('health');
    });

    it('should include correct API paths', async () => {
      const response = await request(app).get('/');

      expect(response.body.docs).toBe('/api/docs');
      expect(response.body.health).toBe('/api/health');
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error');
      expect(response.body).toHaveProperty('message');
    });

    it('should include route information in 404 response', async () => {
      const response = await request(app).get('/api/nonexistent');

      expect(response.body.message).toContain('GET');
      expect(response.body.message).toContain('/api/nonexistent');
    });
  });
});
