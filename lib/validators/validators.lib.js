const Joi = require('joi');
const { Types: { ObjectId } } = require('mongoose');

const coordinatesValidator = (value, helpers) => {
	const coordinates = value.split(',');
	if (coordinates.length !== 2) {
		return helpers.error('any.invalid');
	}

	const [latitude, longitude] = coordinates.map(parseFloat);

	if (isNaN(latitude) || isNaN(longitude)) {
		return helpers.error('any.invalid');
	}

	if (latitude < -90 || latitude > 90) {
		return helpers.error('any.invalid');
	}

	if (longitude < -180 || longitude > 180) {
		return helpers.error('any.invalid');
	}

	return [latitude, longitude];
};


const objectIdValidator = (value, helpers) => {
	const objectId = new ObjectId(value);
	if (objectId.toString() === value) {
		return objectId;
	}
	return helpers.error('any.invalid');
};


module.exports = {
	coordinatesValidator,
	objectIdValidator
}