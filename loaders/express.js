require("dotenv").config();
const express = require("express");
const helmet = require("helmet");
const morgan = require("morgan");
const cors = require("cors");

const { IPAddressMiddleware, HeadersMiddleware, NoContentMiddleware } = require("../middlewares/common");
const UserMiddleware = require("../middlewares/user");
const AdminMiddleware = require("../middlewares/admin");
const RequestIdMiddleware = require("../middlewares/request-id");
const { authLimiter, apiLimiter } = require("../middlewares/rate-limiter");
const logger = require("../utils/logger");

const AuthenticationRouter = require('../modules/Authentication/router');
const FileRouter = require('../modules/File/router');
const UserRouter = require('../modules/User/router');
const AdminRouter = require('../modules/Admin/router');

class ExpressApp {
    constructor() {
        this.app = express();

        // Define routes configuration
        this.routesConfig = [
            { path: "/api/v1/auth", router: AuthenticationRouter, isPrivate: false },
            { path: "/api/v1/file", router: FileRouter, isPrivate: true },
            { path: "/api/v1/user", router: UserRouter, isPrivate: true },
            { path: "/api/v1/admin", router: AdminRouter, isPrivate: true, isAdmin: true },
        ];

        this.initializeMiddlewares();
        this.initializeRoutes();
        this.initializeErrorHandling();
    }

    initializeMiddlewares() {
        // Request ID middleware (should be first)
        this.app.use(RequestIdMiddleware);
        
        // Core middlewares
        this.app.use(cors());
        this.app.use(morgan("combined", {
            stream: {
                write: (message) => logger.info(message.trim())
            }
        }));
        this.app.use(express.json({ limit: '50mb' }));
        this.app.use(express.urlencoded({ limit: '50mb', extended: false }));
        this.app.disable('x-powered-by');
        this.app.use(helmet());

        // Custom middlewares
        this.app.use(IPAddressMiddleware);
        this.app.get("/favicon.ico", NoContentMiddleware);
        this.app.use(HeadersMiddleware);
        this.app.disable("etag");
    }

    initializeRoutes() {
        // Health check endpoint
        this.app.get('/health', (req, res) => {
            res.status(200).json({
                status: 'OK',
                timestamp: new Date().toISOString(),
                uptime: process.uptime(),
                environment: process.env.NODE_ENV || 'development',
                version: require('../package.json').version,
                memory: process.memoryUsage()
            });
        });

        // Readiness check endpoint
        this.app.get('/ready', async (req, res) => {
            try {
                const mongoose = require('mongoose');
                const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
                
                res.status(dbStatus === 'connected' ? 200 : 503).json({
                    status: dbStatus === 'connected' ? 'ready' : 'not ready',
                    timestamp: new Date().toISOString(),
                    database: dbStatus,
                    environment: process.env.NODE_ENV || 'development'
                });
            } catch (error) {
                res.status(503).json({
                    status: 'not ready',
                    error: error.message
                });
            }
        });

        this.routesConfig.forEach(route => {
            if (route.isPrivate) {
                // Apply rate limiting for API routes
                const middlewares = [apiLimiter, UserMiddleware.authenticate];
                
                // Apply admin middleware if route requires admin access
                if (route.isAdmin) {
                    middlewares.push(AdminMiddleware);
                }
                
                // Apply route with middlewares
                this.app.use(route.path, ...middlewares, route.router);
            } else {
                // Apply auth rate limiter for public auth routes
                if (route.path.includes('/auth')) {
                    this.app.use(route.path, authLimiter, route.router);
                } else {
                    this.app.use(route.path, route.router);
                }
            }
        });

        // Catch 404 and forward to error handler
        this.app.use((req, res) => {
            res.status(404).json({
                success: false,
                error: {
                    name: "NOT_FOUND",
                    message: "Resource not found"
                },
                timestamp: new Date().toISOString()
            });
        });
    }

    initializeErrorHandling() {
        // Global error handler
        this.app.use((err, req, res, next) => {
            logger.error('Error occurred', {
                requestId: req.id,
                error: err.message,
                stack: err.stack,
                url: req.url,
                method: req.method
            });

            // Default error response
            let errorResponse = {
                success: false,
                error: {
                    name: err.name || "INTERNAL_SERVER_ERROR",
                    message: err.message || "Something went wrong on the server side while handling the request."
                },
                timestamp: new Date().toISOString()
            };

            // Handle different error types
            // Check if err.code is a valid HTTP status code (100-599)
            if (err.code && typeof err.code === 'number' && err.code >= 100 && err.code < 600) {
                res.status(err.code).json(errorResponse);
            } else if (err.name === 'ValidationError') {
                // Mongoose validation error
                errorResponse.error.name = "VALIDATION_ERROR";
                errorResponse.error.details = err.errors;
                res.status(400).json(errorResponse);
            } else if (err.name === 'CastError') {
                // MongoDB cast error (invalid ObjectId)
                errorResponse.error.name = "INVALID_ID";
                errorResponse.error.message = "Invalid ID format";
                res.status(400).json(errorResponse);
            } else if (err.code === 11000) {
                // MongoDB duplicate key error
                errorResponse.error.name = "DUPLICATE_ENTRY";
                errorResponse.error.message = "Duplicate entry found";
                res.status(409).json(errorResponse);
            } else {
                // Generic server error
                res.status(500).json(errorResponse);
            }
        });
    }

    listen(port) {
        this.app.listen(port, () => {
            logger.info(`Server is running on port ${port}`, {
                environment: process.env.NODE_ENV || 'development',
                port
            });
        });
    }

    getApp() {
        return this.app;
    }
}

module.exports = ExpressApp;
