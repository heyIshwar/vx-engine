const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true, // A session should always be linked to a user
    },
    expiresAt: {
        type: Date,
        default: () => Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days from now
    },
    deviceId: {
        type: String,
        required: true, // Assuming every session is tied to a device
    },
    registrationId: {
        type: String,
        required: true, // Registration ID for push notifications, etc.
    },
    refreshToken: {
        type: String,
        required: true, // Assuming the session needs a refresh token
    },
    deviceOS: {
        type: String,
        required: true, // OS of the device used for the session
    },
    deviceModel: {
        type: String,
        required: true, // Device model (e.g., iPhone 12, Samsung S21)
    },
    appVersion: {
        type: String,
        required: true, // App version at the time of session creation
    },
    ip: {
        type: String,
        required: true, // IP address from which the session was created
    },
    userAgent: {
        type: String,
        required: true, // User-Agent string of the client
    },
    isActive: {
        type: Boolean,
        default: true, // Indicates if the session is currently active
    },
    isRevoked: {
        type: Boolean,
        default: false, // Indicates if the session has been manually revoked
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now, // Timestamp of the last access
    },
}, {strict: false, timestamps: true});

module.exports = mongoose.model('Session', SessionSchema);
