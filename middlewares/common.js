const HeadersMiddleware = (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header(
        'Access-Control-Expose-Headers',
        'x-access-token, x-refresh-token'
    );
    next()
}

const IPAddressMiddleware = async (req, res, next) => {
	try {
		req.IPAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
		next();
	}
	catch (err) {
		next(err);
	}
}

const NoContentMiddleware = (req, res) => res.status(204).end();

module.exports = {
    HeadersMiddleware,
    IPAddressMiddleware,
    NoContentMiddleware
}

