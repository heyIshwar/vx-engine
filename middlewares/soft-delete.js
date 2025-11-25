/**
 * Soft Delete Middleware
 * 
 * This middleware ensures that soft-deleted records are filtered out from queries
 * unless the user is an admin and explicitly requests to include deleted records.
 * 
 * The BaseModel already handles this automatically, but this middleware provides
 * additional control for admin users to view deleted records when needed.
 */

/**
 * Middleware to add includeDeleted flag for admin users
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const softDeleteMiddleware = (req, res, next) => {
    // If user is admin and explicitly requests deleted records
    if (req.user && req.user.isAdmin && req.query.includeDeleted === 'true') {
        req.query.includeDeleted = true;
    } else {
        // Ensure deleted records are excluded by default
        req.query.includeDeleted = false;
    }
    next();
};

module.exports = softDeleteMiddleware;

