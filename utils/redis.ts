import { Redis } from 'ioredis';
import 'dotenv/config';

// Function to configure Redis client
const redisClient = () => {
    if (process.env.NODE_ENV === 'test') {
        const RedisMock = require('ioredis-mock');
        return new RedisMock(); // Use ioredis-mock
    }

    if (process.env.REDIS_URL) {
        console.log('Redis connected');
        return process.env.REDIS_URL;
    }
    throw new Error('Redis connection failed');
};

// Initialize Redis client
export const redis = new Redis(redisClient());

// Function to close Redis connection
export const closeRedisConnection = async () => {
    try {
        // Check if it's the mock or real Redis client
        if (redis && redis.quit) {
            // For the real Redis client, check the status and close the connection if it's open
            if (redis.status === 'ready' || redis.status === 'connecting') {
                await redis.pipeline().exec(); // Clear any remaining commands
                await redis.quit(); // Close connection
                // console.log('Real Redis connection closed');
            }
            // For mock Redis, directly quit (it won't actually close a connection, but it's fine)
            else if (redis.status === 'end') {
                await redis.quit(); // Mock will resolve this instantly
                // console.log('Mock Redis connection closed');
            }
        }
    } catch (error) {
        console.error('Error closing Redis connection:', error);
    }
};