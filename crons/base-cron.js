const cron = require('node-cron');
const logger = require('../utils/logger');

class BaseCron {
    constructor(cronTime, onTick) {
        this.cronTime = cronTime;
        this.onTick = onTick;
        this.job = null;
    }

    start() {
        if (!this.job) {
            this.job = cron.schedule(this.cronTime, this.onTick);
            logger.info(`Cron job started: ${this.cronTime}`);
        }
    }

    stop() {
        if (this.job) {
            this.job.stop();
            logger.info(`Cron job stopped: ${this.cronTime}`);
        }
    }

    restart() {
        this.stop();
        this.start();
    }
}

module.exports = BaseCron;
