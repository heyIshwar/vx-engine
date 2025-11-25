const passport = require("passport");

const User = require("../User/model");

const AuthenticationService = require("./service")

const {UnauthenticatedError} = require("../../lib/errors");
const {passportLocalLoginStrategy} = require("../../lib/authentication");

const MESSAGES = require("../../utils/globals");

passport.use("login", passportLocalLoginStrategy)

const UserService = require("../User/service");

const userService = new UserService({model: User});

const authenticationService = new AuthenticationService();

class AuthenticationController {

    /**
     * Controller to log in a user
     * @param {Object} req - http request object
     * @param {Object} res - http response object
     * @param {Function} next - next handler
     * @returns {Promise<*>}
     */
    async login(req, res, next) {
        try {
            if (!req.user) return next(new UnauthenticatedError());
            if (req.user.flags.blocked) return next(new UnauthenticatedError(MESSAGES.ACCOUNT_BLOCKED))


            const result = await authenticationService.login({req});

            return res.json(result.data);
        } catch (error) {
            next(error);
        }
    };

    /**
     * Controller to logout an user
     * @param {Object} req - http request object
     * @param {Object} res - http response object
     * @param {Function} next - next handler
     * @returns {Promise<*>}
     */
    async logout(req, res, next) {
        try {
            await authenticationService.logout(req.user._id, req.user.sessionId);
            return res.json({message: MESSAGES.LOGOUT_MESSAGE});
        } catch (error) {
            next(error);
        }
    };

    /**
     * Controller to check if username exists
     * @param {object} req - http request object
     * @param {object} res - http response object
     * @param {Function} next - next handler
     * @returns {Promise<*>} - true if username exists
     */
    async checkUsername(req, res, next) {
        try {
            const result = await userService.checkUsername(req.params.username);
            return res.json({status: result});
        } catch (error) {
            next(error);
        }
    };
}

module.exports = AuthenticationController;