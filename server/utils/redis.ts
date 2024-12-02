import { Redis } from 'ioredis';
import 'dotenv/config';

// Function to configure Redis client
const redisClient = () => {
    if (process.env.REDIS_URL) {
        //console.log('Redis connected');
        return process.env.REDIS_URL;
    }
    throw new Error('Redis connection failed');
};

// Initialize Redis client
export const redis = new Redis(redisClient());

// Function to close Redis connection
export const closeRedisConnection = async () => {
    if (redis.status === 'ready' || redis.status === 'connecting') {
        try {
            // Clear any remaining commands
            await redis.pipeline().exec();
            await redis.quit(); 
            //console.log('Redis connection closed');
        } catch (error) {
            console.error('Error closing Redis connection:', error);
        }
    }
};
