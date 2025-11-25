// Load environment variables
require('dotenv').config();

// Try to load dotenv-safe for validation, but don't fail if .env doesn't exist
try {
    require('dotenv-safe').config({
        allowEmptyValues: true,
        example: '.env.example'
    });
} catch (error) {
    // If .env doesn't exist, that's okay for development
    if (error.code !== 'ENOENT') {
        console.warn('Environment validation warning:', error.message);
    }
}

const AppLoader = require('./AppLoader');
const MongooseLoader = require('./loaders/mongoose');
const ExpressLoader = require('./loaders/express');
const CronLoader = require('./loaders/cron');
const config = require('./lib/config');
const logger = require('./utils/logger');

async function startServer() {
    try {
        logger.info('Starting VX Engine server...');
        
        const appLoader = new AppLoader();

        // Register the MongooseLoader
        appLoader.register(async () => {
            const dbLoader = new MongooseLoader();
            await dbLoader.connect();
        });

        // Register the ExpressLoader
        appLoader.register(() => {
            const expressLoader = new ExpressLoader();
            const port = process.env.PORT || config.get('express:port') || 3008;
            expressLoader.listen(port);
            return expressLoader;
        });

        // Register the CronLoader
        appLoader.register(() => {
            const cronLoader = new CronLoader();
            cronLoader.initialize();  // Initialize and start all cron jobs
            return cronLoader;
        });

        // Initialize all registered loaders
        await appLoader.initialize();
        
        logger.info('VX Engine server started successfully');
    } catch (error) {
        logger.error('Failed to start the server', { error: error.message, stack: error.stack });
        process.exit(1);
    }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', { error: error.message, stack: error.stack });
    process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', { reason, promise });
    process.exit(1);
});

startServer();
