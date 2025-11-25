const passportJWT = require('passport-jwt');
const { UnauthenticatedError } = require("../../errors");
const { MESSAGES } = require("../../../utils/globals");
const User = require('../../../modules/User/model');
const Session = require('../../../models/Session');
const { readFileSync } = require("fs");

const PUB_KEY = readFileSync(`${__dirname}/../jwt/pub_key.pem`, "utf8");

const JwtStrategy = passportJWT.Strategy;
const ExtractJwt = passportJWT.ExtractJwt;

// JWT Strategy options
const options = {
    secretOrKey: PUB_KEY,
    algorithms: ['RS256'],
    issuer: "some1",
    passReqToCallback: true,
    jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        ExtractJwt.fromBodyField("token")
    ])
};

const passportJwtStrategy = new JwtStrategy(options, async (req, jwtPayload, done) => {
    try {
        const sessionDoc = await Session.findById(jwtPayload.sessionId).lean();
        if (!sessionDoc) {
            return done(new UnauthenticatedError(MESSAGES.INVALID_SESSION), false);
        }

        const user = await User.findOne({
            _id: jwtPayload.userId,
            isDeleted: false
        }).lean();

        if (!user) {
            return done(null, false);
        }

        if (user.flags && user.flags.blocked) {
            return done(null, false, { message: MESSAGES.ACCOUNT_BLOCKED });
        }

        user.sessionId = jwtPayload.sessionId;

        await Session.findByIdAndUpdate(jwtPayload.sessionId, {
            $set: { updatedAt: Date.now() }
        });

        return done(null, user);
    } catch (err) {
        return done(err, false);
    }
});

module.exports = passportJwtStrategy;
