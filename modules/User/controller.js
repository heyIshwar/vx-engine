const Session = require("../../models/Session");
const User = require("./model");
const File = require("../File/model");

const UserService = require("./service");
const userService = new UserService({model: User});

const FileService = require("../File/service");
const fileService = new FileService({model: File});

class UserController {
	/**
	 * Controller to get full user info
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<*>}
	 */
	async get(req, res, next) {
		try {
			let userId;
			if (req.params?.userId) {
				userId = req.params.userId
			} else {
				userId = req.user._id
			}
			let user = await User.findById(userId).lean();
			user.userId = req.user._id;
			user.includeSensitiveInfo = (req.user._id.toString() === userId.toString())
			if (req.user.isAdmin) user.includeSensitiveInfo = true;
			user = await userService.postProcess({
				user,
				includeSensitiveInfo: user.includeSensitiveInfo,
				requestType: 'view'
			});
			return res.json({data: user});
		} catch (e) {
			return next(e);
		}
	}

	/**
	 * Controller to search users
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<*>}
	 */
	async search(req, res, next) {
		try {

			let query;

			if (req?.body?.query) {
				query = req.body.query
			} else {
				query = req.query
			}


			query.$or = [
				{name: {$regex: query.query, $options: "i"}},
				{username: {$regex: query.query, $options: "i"}},
				{email: {$regex: query.query, $options: "i"}},
				{mobile: {$regex: query.query, $options: "i"}}
			];

			query.$and = [{campusId: {$exists: true}}]

			if (!req.user.isAdmin) {
				delete query.$or.email;
				delete query.$or.mobile;
			}

			delete query.query;

			const users = await userService.list(query);

			const finalUsers = await Promise.all(
				users.map(async (user) => {
					return await userService.postProcess({user});
				})
			);

			return res.json({data: finalUsers});
		} catch (error) {
			next(error);
		}
	}

	/**
	 * Controller to get the active sessions
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async getSessions(req, res, next) {
		try {
			const response = await Session.find(
				{userId: req.user._id},
				{refreshToken: 0}
			).lean();
			const finalResponse = response.map((r) => {
				if (r._id.toString() === req.user.sessionId) {
					r.thisDevice = true;
				}
				return r;
			});
			res.json({data: finalResponse});
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Controller to delete the session
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async deleteSession(req, res, next) {
		try {
			const {sessionId} = req.params;
			const response = await Session.findOneAndDelete(
				{
					userId: req.user._id,
					_id: sessionId,
				},
				{refreshToken: 0}
			);
			res.json({data: response});
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Controller to update the current session
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async updateThisSession(req, res, next) {
		try {
			const {sessionId} = req.user;
			const response = await userService.updateSession({
				userId: req.user._id,
				sessionId,
				data: req.body,
			});
			res.json({data: response});
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Controller to update session
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async updateSession(req, res, next) {
		try {
			const {sessionId} = req.params;

			const response = await userService.updateSession({
				userId: req.user._id,
				sessionId,
				data: req.body,
			});

			res.json({data: response});
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Controller to delete other sessions
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async deleteOthers(req, res, next) {
		try {
			const {sessionId, _id} = req.user;
			await Session.deleteMany({userId: _id, _id: {$ne: sessionId}});
			res.json({data: true});
		} catch (err) {
			next(err);
		}
	}

	/**
	 * Controller to update the user account in the same request
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async updateMyself(req, res, next) {
		try {
			await userService.update(req.user._id, req.body);
			res.json({data: true});
		} catch (err) {
			next(err);
		}
	}

	async updatePreferences(req, res, next) {
		try {
			await userService.updatePreferences({
				userId: req.user._id,
				data: req.body,
			});
			res.json({data: true});
		} catch (error) {
			next(error);
		}
	}


	/**
	 * Controller to update the username
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<void>}
	 */
	async updateUsername(req, res, next) {
		try {
			const {username} = req.body;
			const response = await userService.updateUsername({
				userId: req.user._id,
				username,
			});
			res.json({data: response});
		} catch (error) {
			next(error);
		}
	}

	uploadProfilePhoto = handlePhoto("profile");
	deleteProfilePhoto = handlePhoto("profile", true);

	/**
	 * Controller to logout user
	 * @param req
	 * @param res
	 * @param next
	 * @returns {Promise<*>}
	 */
	async logout(req, res, next) {
		try {
			await Session.findByIdAndDelete(req.user.sessionId);
			return res.send(204).end();
		} catch (error) {
			next(error);
		}
	}

}


/**
 * General controller to handle photo upload or delete operations.
 * @param {String} photoType - The type of photo ("profile" or "cover")
 * @param {Boolean} isDelete - Whether to delete the photo or not
 * @returns {Function}
 */
function handlePhoto(photoType, isDelete = false) {
	return async (req, res, next) => {
		try {
			const userId = req.user._id;
			const preference = await userService.getPreferences({userId});

			if (isDelete) {
				preference[`${photoType}PhotoId`] = undefined;
			} else {
				const photoId = req.body[`${photoType}PhotoId`];
				await fileService.verifyOwnership({fileIds: [photoId], userId});
				preference[`${photoType}PhotoId`] = photoId;
			}

			await preference.save();
			return res.status(isDelete ? 204 : 201).end();
		} catch (error) {
			next(error);
		}
	}
}

module.exports = UserController;
