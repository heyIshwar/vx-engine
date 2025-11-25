const passport = require("passport")
const GoogleStrategy = require('passport-google-oauth2').Strategy;

passport.serializeUser(function (user, done) {
	done(null, user);
});

passport.deserializeUser(function (user, done) {
	done(null, user);
});

passport.use(new GoogleStrategy({
		clientID: "391632203174-rp4q0mb5vsl06ousvadnaiq2nj8obek4.apps.googleusercontent.com",
		clientSecret: "ehOwi2__DG5rRqRHCCFMlfGq",
		callbackURL: "http://localhost:3000/auth/google/callback",
		passReqToCallback: true
	},
	function (request, accessToken, refreshToken, profile, done) {
		return done(null, profile);
	}
));