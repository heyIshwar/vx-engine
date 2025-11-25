const rateLimit = require('express-rate-limit');
const config = require('../lib/config');

/**
 * Rate Limiter Middleware
 * 
 * Provides rate limiting for different route types
 */

// Rate limit configuration
const rateLimitConfig = config.get('rateLimit') || {};

// Authentication routes rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: rateLimitConfig.auth?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: rateLimitConfig.auth?.max || 5, // 5 requests per window
    message: {
        success: false,
        error: {
            name: 'TOO_MANY_REQUESTS',
            message: 'Too many login attempts, please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// API routes rate limiter
const apiLimiter = rateLimit({
    windowMs: rateLimitConfig.api?.windowMs || 15 * 60 * 1000, // 15 minutes
    max: rateLimitConfig.api?.max || 100, // 100 requests per window
    message: {
        success: false,
        error: {
            name: 'TOO_MANY_REQUESTS',
            message: 'Too many requests, please try again later.'
        }
    },
    standardHeaders: true,
    legacyHeaders: false,
});

module.exports = {
    authLimiter,
    apiLimiter
};

