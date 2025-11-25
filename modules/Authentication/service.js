const Session = require('../../models/Session');
const User = require('../User/model');
const UserService = require("../User/service");
const TokenUtil = require('../../utils/token');
const { MESSAGES } = require("../../utils/globals");

const userService = new UserService({ model: User });

class AuthenticationService {
    /**
     * Service to log in a user.
     * @param {Object} req - HTTP request object containing user and device details.
     * @returns {Promise<Object>} - Returns an object containing user details, access token, and refresh token.
     */
    async login({ req }) {
        try {
            const { deviceId, registrationId, deviceModel, deviceOS, appVersion } = req.body;
            const currentUserDetails = await userService.get(req.user._id.toString(), { lean: true });
            const tokenData = {
                userId: currentUserDetails._id,
                IPAddress: req.IPAddress,
                userAgent: req.headers["user-agent"],
                deviceId,
                registrationId,
                deviceModel,
                deviceOS,
                appVersion
            };

            const { accessToken, refreshToken } = await TokenUtil.issueToken(tokenData);

            return {
                data: {
                    user: currentUserDetails,
                    accessToken,
                    refreshToken
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Service to log out a user and delete the session.
     * @param {Object} params - Parameters object.
     * @param {ObjectId} params.userId - User ID.
     * @param {ObjectId} params.sessionId - Session ID.
     * @returns {Promise<Boolean>} - Returns true if the session is successfully deleted.
     */
    async logout({ userId, sessionId }) {
        try {
            const result = await Session.findOneAndDelete({ _id: sessionId, userId });
            if (!result) {
                throw new Error(MESSAGES.SOMETHING_WENT_WRONG);
            }
            return true;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AuthenticationService;
