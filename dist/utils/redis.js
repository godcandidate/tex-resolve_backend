"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedisConnection = exports.redis = void 0;
const ioredis_1 = require("ioredis");
require("dotenv/config");
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
exports.redis = new ioredis_1.Redis(redisClient());
// Function to close Redis connection
const closeRedisConnection = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Check if it's the mock or real Redis client
        if (exports.redis && exports.redis.quit) {
            // For the real Redis client, check the status and close the connection if it's open
            if (exports.redis.status === 'ready' || exports.redis.status === 'connecting') {
                yield exports.redis.pipeline().exec(); // Clear any remaining commands
                yield exports.redis.quit(); // Close connection
                // console.log('Real Redis connection closed');
            }
            // For mock Redis, directly quit (it won't actually close a connection, but it's fine)
            else if (exports.redis.status === 'end') {
                yield exports.redis.quit(); // Mock will resolve this instantly
                // console.log('Mock Redis connection closed');
            }
        }
    }
    catch (error) {
        console.error('Error closing Redis connection:', error);
    }
});
exports.closeRedisConnection = closeRedisConnection;
