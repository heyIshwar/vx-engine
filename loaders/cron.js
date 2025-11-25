const BackupCron = require('../crons/backup-cron');
const logger = require('../utils/logger');

class CronLoader {
    constructor() {
        this.crons = [];
    }

    register(cronInstance) {
        this.crons.push(cronInstance);
    }

    startAll() {
        this.crons.forEach(cron => cron.start());
        logger.info('All cron jobs started');
    }

    stopAll() {
        this.crons.forEach(cron => cron.stop());
        logger.info('All cron jobs stopped');
    }

    restartAll() {
        this.crons.forEach(cron => cron.restart());
        logger.info('All cron jobs restarted');
    }

    loadCrons() {
        // Register all your cron jobs here
        this.register(new BackupCron());
        // Add more crons as needed
    }

    initialize() {
        this.loadCrons();
        this.startAll();
    }
}

module.exports = CronLoader;
