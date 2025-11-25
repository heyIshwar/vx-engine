const { UnauthorizedError } = require('../lib/errors');

/**
 * Admin Middleware
 * 
 * Verifies that the authenticated user has admin privileges
 * Must be used after authentication middleware
 */
const adminMiddleware = (req, res, next) => {
    try {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!req.user.isAdmin) {
            return next(new UnauthorizedError('Admin access required'));
        }

        next();
    } catch (error) {
        next(error);
    }
};

module.exports = adminMiddleware;

