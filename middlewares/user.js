const passport = require("passport");

const {UnauthenticatedError} = require("../lib/errors");
const {passportJwtStrategy} = require("../lib/authentication");
passport.use("jwt", passportJwtStrategy);

const authenticate = (req, res, next) => {
	passport.authenticate("jwt", {session: false}, async (err, user, info) => {
		if (err) {
			return next(err);
		}
		if (!user) {
			return next(new UnauthenticatedError());
		}
		req.user = user;

		return next();
	})(req, res, next);
};


module.exports = { authenticate };
