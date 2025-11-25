const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const config = require("../../lib/config");
const { NoRecordFoundError, BadRequestParameterError } = require("../../lib/errors");
const File = require("./model");
const { RESOURCES, MESSAGES } = require("../../utils/globals");

class FileService {
    constructor() {
        this.fileConfig = config.get('file');
        this.S3 = new AWS.S3(this.fileConfig.s3);
        this.bucketParams = {
            Bucket: this.fileConfig.s3.bucket
        };
    }

    /**
     * Service to upload a file to AWS S3
     * @param {String} key
     * @param {Buffer} file
     * @returns {Promise<Object>}
     */
    async upload({ key, file }) {
        try {
            const uploadParams = {
                Bucket: this.bucketParams.Bucket,
                Key: key,
                Body: file
            };

            const data = await this.S3.upload(uploadParams).promise();
            return data;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to get a signed URL for accessing a file from AWS S3
     * @param {String} key
     * @param {Number} time
     * @returns {String} Signed URL
     */
    generateURL({ key, time = 3600 }) {
        return this.S3.getSignedUrl("getObject", {
            Bucket: this.bucketParams.Bucket,
            Key: key,
            Expires: time
        });
    }

    /**
     * Service to get a signed URL for a file by its ID from AWS S3
     * @param {String} fileId
     * @param {Number} time
     * @returns {Promise<String>}
     */
    async generateURLByFileId({ fileId, time = 3600 }) {
        try {
            const file = await File.findById(fileId);
            if (!file) throw new NoRecordFoundError(MESSAGES.RECORD_NOT_EXIST);

            const url = this.generateURL({ key: file.key, time });
            return url;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to get a public signed URL from CloudFront distribution
     * @param {String} key
     * @param {Number} width
     * @param {String} bucket
     * @returns {String} Public signed URL
     */
    getPhotoURL(key, width = 1080, bucket = RESOURCES.COMMON_BUCKET_NAME) {
        const payload = {
            bucket,
            key,
            edits: {
                resize: {
                    width,
                    fit: "cover"
                }
            }
        };

        const stringified = JSON.stringify(payload);
        const base64Path = Buffer.from(stringified, 'utf-8').toString('base64');
        return `${RESOURCES.CLOUDFRONT_CDN_LINK}/${base64Path}`;
    }

    /**
     * Service to get a public signed URL by file ID from CloudFront distribution
     * @param {ObjectId} fileId
     * @param {Number} width
     * @param {String} bucket
     * @returns {Promise<String>}
     */
    async getPhotoURLById({ fileId, width = 1800, bucket = RESOURCES.COMMON_BUCKET_NAME }) {
        try {
            const fileResult = await File.findById(fileId).lean();
            if (!fileResult || !fileResult.key) {
                return RESOURCES.PLACEHOLDER_PHOTO;
            }

            const url = this.getPhotoURL(fileResult.key, width, bucket);
            return url;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to store file document to the database
     * @param {Object} data
     * @returns {Promise<Object>}
     */
    async store({ name, extension, key, size, meta, userId, module }) {
        try {
            const fileModel = new File({ name, extension, key, size, meta, userId, module });
            const result = await fileModel.save();
            return result;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to delete a file from AWS S3 and the database
     * @param {String} key
     * @returns {Promise<Boolean>}
     */
    async delete({ key }) {
        try {
            const params = { Bucket: this.bucketParams.Bucket, Key: key };

            await this.S3.deleteObject(params).promise();
            await File.findOneAndDelete({ key });

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to get file details by file ID
     * @param {ObjectId} fileId
     * @param {Boolean} generateURL
     * @returns {Promise<Object>}
     */
    async getById({ fileId, generateURL = false }) {
        try {
            const file = await File.findOne({ _id: fileId });
            if (!file) throw new NoRecordFoundError(MESSAGES.RECORD_NOT_EXIST);

            if (generateURL) {
                file.url = this.generateURL({ key: file.key });
            }
            return file;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to get a presigned URL from a requirement
     * @param {Array} requirement
     * @param {String} module
     * @param {ObjectId} userId
     * @returns {Promise<Array>}
     */
    async request({ requirement, module, userId }) {
        try {
            if (requirement.length === 0) {
                return [];
            }

            const response = [];
            const keyPrefix = uuidv4();

            await Promise.all(requirement.map(async (r, index) => {
                const key = `${keyPrefix}_${index + 1}.${r.extension}`;
                const preSignedPUTURL = this.S3.getSignedUrl('putObject', {
                    Bucket: RESOURCES.COMMON_BUCKET_NAME,
                    Key: key,
                    ACL: 'public-read',
                    Expires: this.fileConfig.preSignedUrlExpiry,
                });

                const record = await this.store({
                    key,
                    order: r.order || 0,
                    extension: r.extension,
                    module,
                    name: r.name,
                    userId,
                });

                response.push({
                    id: record._id,
                    url: preSignedPUTURL,
                    key,
                    order: r.order || 0,
                    name: r.name,
                    extension: r.extension || "png",
                });
            }));

            return response;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to verify file ownership
     * @param {ObjectId} userId
     * @param {Array} fileIds
     * @returns {Promise<Boolean>}
     */
    async verifyOwnership({ userId, fileIds }) {
        try {
            await Promise.all(fileIds.map(async (fileId) => {
                const file = await this.getById({ fileId });
                if (userId.toString() !== file.userId.toString()) {
                    throw new BadRequestParameterError(MESSAGES.FILE_OWNERSHIP_VERIFICATION_FAILED);
                }
            }));

            return true;
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to mark files as uploaded from a requirement
     * @param {ObjectId} userId
     * @param {Array} fileIds
     * @returns {Promise<Boolean>}
     */
    async markUploaded({ userId, fileIds }) {
        try {
            await this.verifyOwnership({ userId, fileIds });

            await Promise.all(fileIds.map(async (fileId) => {
                await File.findByIdAndUpdate(fileId, {
                    $set: { hasUploaded: true }
                });
            }));

            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FileService;
