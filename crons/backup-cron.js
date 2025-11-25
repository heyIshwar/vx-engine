const BaseCron = require('./base-cron');
const BackupService = require('../scripts/backup');
const logger = require('../utils/logger');

/**
 * Backup Cron Job
 * 
 * Runs daily backup at 2 AM
 * Schedule: '0 2 * * *' (cron format: minute hour day month weekday)
 */
class BackupCron extends BaseCron {
    constructor() {
        const backupService = new BackupService();
        const execute = async () => {
            try {
                logger.info('Starting scheduled backup...');
                await backupService.backup();
                logger.info('Scheduled backup completed');
            } catch (error) {
                logger.error('Scheduled backup failed', { error: error.message, stack: error.stack });
            }
        };
        super('0 2 * * *', execute); // Daily at 2 AM
    }
}

module.exports = BackupCron;

