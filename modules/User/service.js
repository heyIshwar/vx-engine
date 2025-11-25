const mongoose = require("mongoose");

const User = require("./model");
const UserPreference = require("../../models/UserPreference");
const Session = require("../../models/Session");


const FileService = require("../File/service");
const fileService = new FileService();

const {NoRecordFoundError, BadRequestParameterError, DuplicateRecordFoundError} = require("../../lib/errors");

const { MESSAGES } = require('../../utils/globals');
const BaseService = require("../base-service");

const userPreferenceService = new BaseService({model: UserPreference});

class UserService extends BaseService {

	constructor({model = User}) {
		super({model});
	}

	/**
	 * Service to process the user object
	 * @param user
	 * @param userId
	 * @param includeSensitiveInfo
	 * @returns {Promise<{includeSensitiveInfo}|*>}
	 */
	async postProcess({user, userId, includeSensitiveInfo = false}) {
		try {

		if (user instanceof mongoose.model) {
			user = user.toObject();
		}

		// remove campusId for admin
			const sensitiveFields = [ "mobile", "gender", "googleId", "appleId", "waId", "updatedAt", "__v"]

			const preferences = await this.getPreferences({userId: user._id});

			user.profilePhoto = null;
			user.coverPhoto = null;



			if (preferences?.profilePhotoId) {
				user.profilePhoto = await fileService.getPhotoURLById({fileId: preferences.profilePhotoId, width: 400});
			}

			if (preferences?.coverPhotoId) {
				user.coverPhoto = await fileService.getPhotoURLById({fileId: preferences.coverPhotoId, width: 1080});

			}

			preferences.hideName && (sensitiveFields.push("name"));
			user.bio = preferences.bio || "";

			if (!user.includeSensitiveInfo || !includeSensitiveInfo) {
				sensitiveFields.forEach(field => {
					delete user[field];
				})
			}

			// add stats (if method exists)
			// user.stats = await this.stats({userId: user._id})


			return user;
		} catch (error) {
			throw (error);
		}
	}

	/**
	 * Service to update user
	 * @param userId
	 * @param data
	 * @returns {Promise<Query<Document<any, any, unknown>, Document<any, any, unknown>, {}, unknown>>}
	 */
	async update(userId, data) {
		try {
			return await User.findByIdAndUpdate(userId, data, {new: true})
		} catch (error) {
			throw new BadRequestParameterError();
		}
	}

	/**
	 * Service to check username availability
	 * @param username {String} - user's username
	 */
	async checkUsername({username}) {
		try {
			const user = await User.findOne({username}).lean()

			if (user) {
				throw new DuplicateRecordFoundError(MESSAGES.USERNAME_EXISTS);
			} else {
				return true
			}
		} catch (error) {
			throw new BadRequestParameterError(MESSAGES.USERNAME_EXISTS)
		}
	}

	/**
	 * Service to update username
	 * @param userId
	 * @param username
	 * @returns {Promise<boolean>}
	 */
	async updateUsername({userId, username}) {
		try {
			const user = await User.findById(userId);

			if (!user) {
				throw new NoRecordFoundError(MESSAGES.USER_NOT_EXISTS);
			}

			if (user.username === username) {
				return true
			}

			const anotherUser = await User.findOne({username}).lean()

			if (anotherUser) {
				throw new DuplicateRecordFoundError(MESSAGES.USERNAME_EXISTS);
			}

			user.username = username;
			await user.save();

			return true;

		} catch (error) {
			throw error;
		}
	}

	/**
	 * Service to get user preferences
	 * @param userId
	 * @returns {Promise<unknown>}
	 */
	async getPreferences({userId}) {
		try {
			const record = await UserPreference.findOne({ userId });

			if (record) {
				return record
			} else {
				return await UserPreference.create({userId});
			}

		} catch (error) {
			throw (error)
		}
	}

	/**
	 * @param userId {ObjectId} - user's id
	 * @param data {Object} - main preferences values
	 */
	async updatePreferences({userId, data}) {
		try {
			return await UserPreference.findOneAndUpdate({userId}, data, {
				upsert: true, new: true
			});
		} catch (error) {
			throw error
		}
	}

	/**
	 * Service to update user session
	 * @param userId
	 * @param sessionId
	 * @param data
	 * @returns {Promise<unknown>}
	 */
	updateSession({userId, sessionId, data}) {
		return new Promise(async (resolve, reject) => {
			try {
				const allowedKeys = ["deviceId", "firebaseToken", "deviceOS", "deviceModel", "appVersion"];
				let isInvalid = false;
				Object.keys(data).map(key => {
					if (!allowedKeys.includes(key)) isInvalid = true;
				})
				if (isInvalid) {
					return reject(new BadRequestParameterError("Invalid keys in data"));
				}
				const response = await Session.findOneAndUpdate({_id: sessionId, userId}, data)
				return resolve(response);
			} catch (error) {
				return reject(error)
			}
		})
	}

}

module.exports = UserService
