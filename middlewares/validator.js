const validate = (schema) => {
	
	return async (req, res, next) => {
		const options = {
			abortEarly: true,
			allowUnknown: true,
			// stripUnknown: true
		};

		const queryResult = schema.query ? schema.query.validate(req.query, { ...options }) : {};
		const bodyResult = schema.body ? schema.body.validate(req.body, { ...options }) : {};
		const paramsResult = schema.params ? schema.params.validate(req.params, { ...options }) : {};

		if (queryResult.error || bodyResult.error || paramsResult.error) {
			const errors = {
				...queryResult.error && { query: queryResult.error.details },
				...bodyResult.error && { body: bodyResult.error.details },
				...paramsResult.error && { params: paramsResult.error.details }
			};
			return res.status(400).json({ errors });
			next()
			
		} else {
			// Replace to array if location is found in query
			req.query.location && (req.query.location = req.query.location.split(','));
			req.body.location && (req.body.location = req.body.location.split(','));

			// parse radius to float
			req.query.radius && (req.query.radius = parseFloat(req.query.radius));

			req.query = queryResult.value
			req.body = bodyResult.value
			req.params = paramsResult.value
			next();
		}
	};
};

module.exports = {validate}