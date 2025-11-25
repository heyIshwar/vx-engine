const BaseService = require('../base-service');
const User = require('../User/model');
const mongoose = require('mongoose');

class AdminService extends BaseService {
    constructor() {
        super({ model: User });
    }

    /**
     * Get all users including soft-deleted (admin only)
     * @param {Object} query - Query parameters
     * @returns {Promise<Array>} List of users
     */
    async getAllUsers(query = {}) {
        try {
            query.includeDeleted = true; // Include soft-deleted users
            return await this.list(query);
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user by ID (including soft-deleted)
     * @param {String} userId - User ID
     * @returns {Promise<Object>} User object
     */
    async getUserById(userId) {
        try {
            const user = await User.findOne({ _id: userId }).lean();
            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Activate or deactivate a user
     * @param {String} userId - User ID
     * @param {Boolean} isActive - Active status
     * @returns {Promise<Object>} Updated user
     */
    async setUserActiveStatus(userId, isActive) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { 'flags.active': isActive },
                { new: true }
            );
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Hard delete a user (permanent deletion)
     * @param {String} userId - User ID
     * @returns {Promise<Object>} Deletion result
     */
    async hardDeleteUser(userId) {
        try {
            const result = await User.deleteOne({ _id: userId, isDeleted: true });
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Restore a soft-deleted user
     * @param {String} userId - User ID
     * @returns {Promise<Object>} Restored user
     */
    async restoreUser(userId) {
        try {
            const user = await User.findByIdAndUpdate(
                userId,
                { isDeleted: false, deletedAt: null },
                { new: true }
            );
            if (!user) {
                throw new Error('User not found');
            }
            return user;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get system statistics
     * @returns {Promise<Object>} System stats
     */
    async getSystemStats() {
        try {
            const [
                totalUsers,
                activeUsers,
                deletedUsers,
                adminUsers
            ] = await Promise.all([
                User.countDocuments({}),
                User.countDocuments({ 'flags.active': true, isDeleted: false }),
                User.countDocuments({ isDeleted: true }),
                User.countDocuments({ isAdmin: true, isDeleted: false })
            ]);

            return {
                users: {
                    total: totalUsers,
                    active: activeUsers,
                    deleted: deletedUsers,
                    admins: adminUsers
                },
                timestamp: new Date().toISOString()
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AdminService;

