import { Redis } from 'ioredis';
import 'dotenv/config';

// Function to configure Redis client
const redisClient = () => {
    if (process.env.NODE_ENV === 'test') {
        const RedisMock = require('ioredis-mock');
        return new RedisMock();
    }

    if (process.env.REDIS_URL) {
        const options = {
            maxRetriesPerRequest: 3,
            enableReadyCheck: true,
            retryStrategy(times: number) {
                const delay = Math.min(times * 50, 2000);
                return delay;
            },
            reconnectOnError(err: Error) {
                const targetError = 'READONLY';
                if (err.message.includes(targetError)) {
                    return true;
                }
                return false;
            }
        };

        const client = new Redis(process.env.REDIS_URL, options);
        
        client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        client.on('connect', () => {
            console.log('Redis connected');
        });

        return client;
    }
    throw new Error('Redis connection failed');
};

// Initialize Redis client
export const redis = redisClient();

// Function to close Redis connection
export const closeRedisConnection = async () => {
    try {
        if (redis && typeof redis.disconnect === 'function') {
            await redis.quit();
            console.log('Redis connection closed');
        }
    } catch (error) {
        console.error('Error closing Redis connection:', error);
    }
};