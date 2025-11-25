const Joi = require('joi');
const {coordinatesValidator, objectIdValidator} = require("../../lib/validators/validators.lib");

const get = {
	params: Joi.object({
		userId: Joi.custom(objectIdValidator).required(),
	})
}

const search = {
	query: Joi.object({
		query: Joi.string().min(3).required(),
		limit: Joi.number().integer().min(1).default(10),
		page: Joi.number().integer().min(1).default(1),
		sortBy: Joi.string().valid('name', 'createdAt', 'updatedAt').default('createdAt'),
		sortOrder: Joi.string().valid('asc', 'desc').default('desc')
	})
};

const create = {
	body:  Joi.object({
		name: Joi.string().required(),
		email: Joi.string().email().required(),
		password: Joi.string().required(),
		phone: Joi.string().pattern(/^\d{10}$/).required()
	})
};

const update = {
	body:  Joi.object({
		name: Joi.string(),
		gender: Joi.number().integer().min(-1).max(10),
		birthdate: Joi.string().isoDate(),
		// mobile: Joi.number().integer().min(6000000000).max(9999999999),
	})
};

const remove = {
	params: Joi.object({
		id: Joi.string().required()
	})
};

const saveLocation = {
	body:  Joi.object({
		location: Joi.string().custom(coordinatesValidator).required()
	})
}

const updateUsername = {
	body:  Joi.object({
		username: Joi.string()
			.regex(/^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/)
			.required(),
	})
}

const updateSession = {
	params: Joi.object({
		sessionId: Joi.custom(objectIdValidator).required(),
	}),
	body:  Joi.object({
		deviceId: Joi.string(),
		firebaseToken: Joi.string(),
		deviceOS: Joi.string(),
		deviceModel: Joi.string(),
		appVersion: Joi.string()
	})
}

const deleteSession = {
	params: Joi.object({
		sessionId: Joi.custom(objectIdValidator).required(),
	})
}

const relation = {
	params: Joi.object({
		userId: Joi.custom(objectIdValidator).required(),
	})
}

const karma = {
	params: Joi.object({
		userId: Joi.custom(objectIdValidator).required(),
	})
}


const uploadProfilePhoto = {
	body: Joi.object({
		profilePhotoId: Joi.custom(objectIdValidator).required()
	})
}

const deleteProfilePhoto = {

}

const uploadCoverPhoto = {
	body: Joi.object({
		coverPhotoId: Joi.custom(objectIdValidator).required()
	})
}

const deleteCoverPhoto = {

}


const updatePreferences = {
	body: Joi.object({
		bio: Joi.string().max(256).allow(''),
		hideName: Joi.boolean().truthy('true', '1', 'yes').falsy('false', '0', 'no'),
	})
}

module.exports = {
	get,
	search,
	create,
	update,
	remove,
	saveLocation,
	updateUsername,
	updateSession,
	deleteSession,
	relation,
	karma,
	uploadProfilePhoto,
	deleteProfilePhoto,
	uploadCoverPhoto,
	deleteCoverPhoto,
	updatePreferences
};
