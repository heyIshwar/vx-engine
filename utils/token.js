const mongoose = require('mongoose');
const { jsonwebtoken } = require("../lib/authentication");
const Session = require("../models/Session");

const JsonWebToken = new jsonwebtoken();

// Define expiry durations (in milliseconds)
const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60 * 1000; // 30 days
const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes

class Token {
    /**
     * Issues a new access token and optionally stores the session.
     *
     * @param {Object} params - Parameters for issuing a token.
     * @param {ObjectId} params.userId - User ID.
     * @param {String} params.userAgent - User agent string.
     * @param {String} params.IPAddress - IP address of the user.
     * @param {String} params.deviceId - Device ID.
     * @param {String} params.registrationId - Registration ID.
     * @param {String} params.deviceOS - Device OS information.
     * @param {String} params.deviceModel - Device model information.
     * @param {String} params.appVersion - Application version.
     * @param {Boolean} [params.storeSession=false] - Whether to store the session in the database.
     * @param {Number} [params.expiry=ACCESS_TOKEN_EXPIRY] - Expiry time for the access token (in seconds).
     * @returns {Promise<Object>} - Returns an object containing the access token and session document.
     */
    static async issueToken({
                         userId,
                         userAgent,
                         IPAddress,
                         deviceId,
                         registrationId,
                         deviceOS,
                         deviceModel,
                         appVersion,
                         storeSession = false,
                         expiry = ACCESS_TOKEN_EXPIRY
                     }) {
        try {
            const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY).toISOString();
            
            // Generate refresh token first (using session ID as the token)
            const tempSessionId = new mongoose.Types.ObjectId();
            const refreshToken = tempSessionId.toString();

            const tokenDoc = await Session.create({
                userId,
                userAgent,
                ip: IPAddress,
                deviceId,
                registrationId,
                deviceOS,
                deviceModel,
                appVersion,
                expiresAt,
                refreshToken: refreshToken
            });

            const AccessTokenData = {
                payload: { userId, sessionId: tokenDoc._id || '' },
                exp: expiry
            };

            const accessToken = await JsonWebToken.sign(AccessTokenData);

            return { accessToken, refreshToken, tokenDoc };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Token;
