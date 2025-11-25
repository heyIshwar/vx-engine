const { MESSAGES } = require('../utils/globals');

class BaseController {
    constructor(service) {
        this.service = service;
    }

    async create(req, res, next) {
        try {
            const data = req.body;
            const result = await this.service.create(data);
            return res.status(201).json({ success: true, message: MESSAGES.CREATE_SUCCESS, data: result });
        } catch (error) {
            next(error);
        }
    }

    async get(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.service.get(id);
            if (!result) {
                return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
            }
            return res.status(200).json({ success: true, data: result });
        } catch (error) {
            next(error);
        }
    }

    async list(req, res, next) {
        try {
            const query = req.query;
            const results = await this.service.list(query);
            return res.status(200).json({ success: true, data: results });
        } catch (error) {
            next(error);
        }
    }

    async update(req, res, next) {
        try {
            const { id } = req.params;
            const data = req.body;
            const result = await this.service.update(id, data);
            if (!result) {
                return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
            }
            return res.status(200).json({ success: true, message: MESSAGES.UPDATE_SUCCESS, data: result });
        } catch (error) {
            next(error);
        }
    }

    async delete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.service.update(id, { isDeleted: true });
            if (!result) {
                return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
            }
            return res.status(200).json({ success: true, message: MESSAGES.DELETE_SUCCESS });
        } catch (error) {
            next(error);
        }
    }

    async hardDelete(req, res, next) {
        try {
            const { id } = req.params;
            const result = await this.service.delete({ _id: id });
            if (!result) {
                return res.status(404).json({ success: false, message: MESSAGES.NOT_FOUND });
            }
            return res.status(200).json({ success: true, message: MESSAGES.HARD_DELETE_SUCCESS });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = BaseController;

/*
Usage Examples:

// Initialize the User Service using BaseService
const UserService = new BaseService({ model: User });
const userService = new UserService();

// Initialize the User Controller using BaseController
const UserController = new BaseController(userService);
const userController = new UserController();

// Express routes for User resource
const express = require('express');
const router = express.Router();

// Create a new user
router.post('/users', (req, res, next) => userController.create(req, res, next));

// Get a user by ID
router.get('/users/:id', (req, res, next) => userController.get(req, res, next));

// List users with query filters
router.get('/users', (req, res, next) => userController.list(req, res, next));

// Update a user by ID
router.put('/users/:id', (req, res, next) => userController.update(req, res, next));

// Soft delete a user by ID
router.delete('/users/:id', (req, res, next) => userController.delete(req, res, next));

// Hard delete a user by ID
router.delete('/users/:id/hard', (req, res, next) => userController.hardDelete(req, res, next));

module.exports = router;
 */
