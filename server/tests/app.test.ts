// tests/app.test.ts
import request from 'supertest';
import { app } from '../app'; 
import { closeRedisConnection } from '../utils/redis';

jest.mock('ioredis', () => {
  return {
      Redis: jest.fn(() => ({
          status: 'ready',
          quit: jest.fn().mockResolvedValue('OK'),
          pipeline: jest.fn(() => ({
              exec: jest.fn().mockResolvedValue([]),
          })),
      })),
  };
});

describe('Test API Endpoints', () => {
  it('should respond with 200 and success message for /test route', async () => {
    const response = await request(app).get('/test');
    expect(response.status).toBe(200); // Check if status is 200
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('API is working');  
  });

  it('should respond with 404 for unknown routes', async () => {
    const response = await request(app).get('/nonexistent');
    expect(response.status).toBe(404);
  });
});



afterAll(async () => {
    await closeRedisConnection();
});