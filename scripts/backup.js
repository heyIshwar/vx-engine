require('dotenv').config();
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs');
const path = require('path');
const AWS = require('aws-sdk');
const config = require('../lib/config');
const zlib = require('zlib');
const { pipeline } = require('stream');
const { promisify } = require('util');

const execAsync = util.promisify(exec);
const pipelineAsync = promisify(pipeline);

/**
 * MongoDB Backup Script
 * 
 * Backs up MongoDB database to a gzipped file and uploads to S3
 * Run with: npm run backup
 */

class BackupService {
    constructor() {
        this.s3Config = config.get('file:s3') || {};
        this.dbConfig = config.get('database') || {};
        this.s3 = new AWS.S3({
            accessKeyId: this.s3Config.accessKeyId || process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: this.s3Config.secretAccessKey || process.env.AWS_SECRET_ACCESS_KEY,
            region: this.s3Config.region || process.env.AWS_REGION || 'us-east-1'
        });
        this.backupBucket = this.s3Config.backupBucket || process.env.BACKUP_BUCKET || this.s3Config.bucket;
    }

    /**
     * Get MongoDB connection string
     */
    getConnectionString() {
        if (process.env.MONGODB_URI) {
            return process.env.MONGODB_URI;
        }

        const { username, password, host, port, name, authSource } = this.dbConfig;
        
        if (username && password) {
            return `mongodb://${username}:${password}@${host}:${port}/${name}?authSource=${authSource || 'admin'}`;
        }
        
        return `mongodb://${host}:${port}/${name}`;
    }

    /**
     * Create backup directory if it doesn't exist
     */
    ensureBackupDir() {
        const backupDir = path.join(__dirname, '../backups');
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }
        return backupDir;
    }

    /**
     * Generate backup filename with timestamp
     */
    getBackupFilename() {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
        const time = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].split('.')[0];
        return `vx-engine-backup-${timestamp}-${time}.gz`;
    }

    /**
     * Create MongoDB dump
     */
    async createDump(backupDir, filename) {
        const connectionString = this.getConnectionString();
        const dumpPath = path.join(backupDir, filename);
        
        // Escape connection string for shell
        const escapedUri = connectionString.replace(/'/g, "'\"'\"'");
        
        const command = `mongodump --uri='${escapedUri}' --gzip --archive='${dumpPath}'`;
        
        console.log('📦 Creating MongoDB dump...');
        try {
            const { stdout, stderr } = await execAsync(command);
            if (stderr && !stderr.includes('writing') && !stderr.includes('done')) {
                console.warn('Warning:', stderr);
            }
            console.log('✓ Dump created successfully');
            return dumpPath;
        } catch (error) {
            console.error('✗ Error creating dump:', error.message);
            throw error;
        }
    }

    /**
     * Upload backup to S3
     */
    async uploadToS3(filePath, filename) {
        if (!this.backupBucket) {
            console.log('⚠ S3 bucket not configured, skipping upload');
            return null;
        }

        console.log('☁ Uploading to S3...');
        
        try {
            const fileContent = fs.readFileSync(filePath);
            
            const params = {
                Bucket: this.backupBucket,
                Key: `backups/${filename}`,
                Body: fileContent,
                ContentType: 'application/gzip',
                ServerSideEncryption: 'AES256'
            };

            const result = await this.s3.upload(params).promise();
            console.log(`✓ Uploaded to S3: ${result.Location}`);
            return result;
        } catch (error) {
            console.error('✗ Error uploading to S3:', error.message);
            throw error;
        }
    }

    /**
     * Clean up old local backups (keep last 5)
     */
    async cleanupOldBackups(backupDir) {
        try {
            const files = fs.readdirSync(backupDir)
                .filter(f => f.startsWith('vx-engine-backup-') && f.endsWith('.gz'))
                .map(f => ({
                    name: f,
                    path: path.join(backupDir, f),
                    time: fs.statSync(path.join(backupDir, f)).mtime.getTime()
                }))
                .sort((a, b) => b.time - a.time);

            // Keep last 5 backups
            const toDelete = files.slice(5);
            for (const file of toDelete) {
                fs.unlinkSync(file.path);
                console.log(`🗑 Deleted old backup: ${file.name}`);
            }
        } catch (error) {
            console.warn('⚠ Error cleaning up old backups:', error.message);
        }
    }

    /**
     * Run complete backup process
     */
    async backup() {
        try {
            console.log('🚀 Starting backup process...\n');
            
            const backupDir = this.ensureBackupDir();
            const filename = this.getBackupFilename();
            
            // Create dump
            const dumpPath = await this.createDump(backupDir, filename);
            
            // Upload to S3
            await this.uploadToS3(dumpPath, filename);
            
            // Cleanup old backups
            await this.cleanupOldBackups(backupDir);
            
            console.log('\n✅ Backup completed successfully!');
            console.log(`📁 Backup file: ${dumpPath}`);
            
        } catch (error) {
            console.error('\n✗ Backup failed:', error);
            process.exit(1);
        }
    }
}

// Run backup if called directly
if (require.main === module) {
    const backupService = new BackupService();
    backupService.backup();
}

module.exports = BackupService;

