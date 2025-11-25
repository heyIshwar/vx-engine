require("dotenv").config({ path: "./config/config.env" });
const mongoose = require('mongoose');
const config = require("../lib/config");

class MongooseLoader {
    constructor() {
        this.config = config.get("database");
    }

    async connect() {
        try {
            console.log(`ℹ  Attempting database connection...`);

            const { username, name: databaseName, password, host, port, authSource, options } = this.config;
            
            let mongoURI;
            
            // Check if it's a local MongoDB connection or Atlas
            if (host === 'localhost' || host.includes('127.0.0.1')) {
                // Local MongoDB connection
                if (username && password) {
                    mongoURI = `mongodb://${username}:${password}@${host}:${port}/${databaseName}?authSource=${authSource}`;
                } else {
                    mongoURI = `mongodb://${host}:${port}/${databaseName}`;
                }
            } else {
                // MongoDB Atlas connection
                mongoURI = `mongodb+srv://${username}:${password}@${host}/${databaseName}?retryWrites=true&w=majority`;
            }

            console.log(`Connecting to: ${mongoURI.replace(password, '****')}`);

            await mongoose.connect(mongoURI, options);
            console.log(`✅  MongoDB connected to database: ${databaseName}`);
        } catch (error) {
            console.log(`❌  Failed: Error establishing database connection`);
            console.error(error);
            process.exit(1);
        }
    }
}

module.exports = MongooseLoader;
