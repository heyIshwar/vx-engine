const express = require('express');
const router = express.Router();
const AdminController = require('./controller');
const adminController = new AdminController();

/**
 * Admin Routes
 * All routes require admin authentication (use adminMiddleware)
 */

// System statistics
router.get('/stats', adminController.getSystemStats.bind(adminController));

// User management
router.get('/users', adminController.getAllUsers.bind(adminController));
router.get('/users/:userId', adminController.getUserById.bind(adminController));
router.patch('/users/:userId/activate', adminController.setUserActiveStatus.bind(adminController));
router.patch('/users/:userId/restore', adminController.restoreUser.bind(adminController));
router.delete('/users/:userId/hard', adminController.hardDeleteUser.bind(adminController));

module.exports = router;

