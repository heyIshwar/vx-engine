const passport = require('passport');
const router = require('express').Router();

const AuthenticationController = require('./controller');
const { UserMiddleware} = require('../../middlewares');
const { passportLocalLoginStrategy} = require("../../lib/authentication");

const authenticationController = new AuthenticationController();

passport.use("login", passportLocalLoginStrategy);


/*
API to login user into system
*/
router.post("/login",
    passport.authenticate('login', {session: false}),
    authenticationController.login);

/*
API to logout user from system
*/
router.post("/logout",
    UserMiddleware.authenticate,
    authenticationController.logout);

/*
API to check username availability
*/
router.get('/checkUsername/:username',
    authenticationController.checkUsername)

module.exports = router;
