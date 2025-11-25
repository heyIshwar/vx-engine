const router = require("express").Router()

const {ValidatorMiddleware} = require("../../middlewares");
const UserValidator = require("./validator")

const UserController = require("./controller");
const userController = new UserController();

// Set up a route to handle GET and PATCH requests at the root path ("/").
router.route("/")
	.get(userController.get)
	.patch(ValidatorMiddleware.validate(UserValidator.update), userController.updateMyself)

// Set up a route to handle PATCH requests at the "/preference" path.
router.route("/preference")
	.patch(ValidatorMiddleware.validate(UserValidator.updatePreferences), userController.updatePreferences)

// Set up a route to handle GET and PATCH requests at the "/username" path.
router.route("/username")
	.patch(ValidatorMiddleware.validate(UserValidator.updateUsername), userController.updateUsername)

// sessions
router.route("/session")
	.get(userController.getSessions)
	.patch(userController.updateThisSession)
	.delete(userController.deleteOthers)

// Set up a route to handle PATCH and DELETE requests at the "/session/:sessionId" path.
router.route("/session/:sessionId")
	.patch(ValidatorMiddleware.validate(UserValidator.updateSession), userController.updateSession)
	.delete(ValidatorMiddleware.validate(UserValidator.deleteSession), userController.deleteSession)


/** profile photo */
router.route("/profilePhoto")
	.post(
		ValidatorMiddleware.validate(UserValidator.uploadProfilePhoto),
		userController.uploadProfilePhoto)
	.delete(
		ValidatorMiddleware.validate(UserValidator.deleteProfilePhoto),
		userController.deleteProfilePhoto)


/** preference */
router.route("/preference")
	.patch(
		ValidatorMiddleware.validate(UserValidator.updatePreferences),
		userController.updatePreferences)

/** Logout */
router.route("/logout")
	.delete(userController.logout)

/*
	Set up a route to handle GET requests with a specific user ID.
*/
router.route("/:userId")
	.get(ValidatorMiddleware.validate(UserValidator.get), userController.get)

module.exports = router;
