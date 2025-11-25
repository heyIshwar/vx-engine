const BaseController = require('../base-controller');
const AdminService = require('./service');

class AdminController extends BaseController {
    constructor() {
        const adminService = new AdminService();
        super(adminService);
        // Bind methods
        this.getAllUsers = this.getAllUsers.bind(this);
        this.getUserById = this.getUserById.bind(this);
        this.setUserActiveStatus = this.setUserActiveStatus.bind(this);
        this.hardDeleteUser = this.hardDeleteUser.bind(this);
        this.restoreUser = this.restoreUser.bind(this);
        this.getSystemStats = this.getSystemStats.bind(this);
    }

    /**
     * Get all users (including soft-deleted)
     */
    async getAllUsers(req, res, next) {
        try {
            const users = await this.service.getAllUsers(req.query);
            return res.status(200).json({
                success: true,
                data: users,
                count: users.length
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get user by ID
     */
    async getUserById(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await this.service.getUserById(userId);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'User not found' }
                });
            }
            return res.status(200).json({
                success: true,
                data: user
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Activate or deactivate user
     */
    async setUserActiveStatus(req, res, next) {
        try {
            const { userId } = req.params;
            const { isActive } = req.body;
            const user = await this.service.setUserActiveStatus(userId, isActive);
            return res.status(200).json({
                success: true,
                data: user,
                message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Hard delete user
     */
    async hardDeleteUser(req, res, next) {
        try {
            const { userId } = req.params;
            const result = await this.service.hardDeleteUser(userId);
            if (result.deletedCount === 0) {
                return res.status(404).json({
                    success: false,
                    error: { message: 'User not found or not soft-deleted' }
                });
            }
            return res.status(200).json({
                success: true,
                message: 'User permanently deleted'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Restore soft-deleted user
     */
    async restoreUser(req, res, next) {
        try {
            const { userId } = req.params;
            const user = await this.service.restoreUser(userId);
            return res.status(200).json({
                success: true,
                data: user,
                message: 'User restored successfully'
            });
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get system statistics
     */
    async getSystemStats(req, res, next) {
        try {
            const stats = await this.service.getSystemStats();
            return res.status(200).json({
                success: true,
                data: stats
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = AdminController;

