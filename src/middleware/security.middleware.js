const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

/**
 * Security headers middleware
 */
const securityHeaders = helmet();

/**
 * Global API rate limiter
 */
const apiLimiter = rateLimit({
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many requests, please try again later.'
    }
});

module.exports = { securityHeaders, apiLimiter };