const { MESSAGES } = require('../utils/globals');

class BadRequestParameterError extends Error {
    constructor(message = MESSAGES.BAD_REQUEST_PARAMETER_ERROR, params) {
        super(message);
        this.name = 'BAD_REQUEST_PARAMETER_ERROR';
        this.code = 400;
    }
}

class DuplicateRecordFoundError extends Error {
    constructor(message = MESSAGES.DUPLICATE_RECORD_FOUND_ERROR, params) {
        super(message);
        this.name = 'DUPLICATE_RECORD_FOUND_ERROR';
        this.code = 400;
    }
}

class NoRecordFoundError extends Error {
    constructor(message = MESSAGES.NO_RECORD_FOUND_ERROR, params) {
        super(message);
        this.name = 'NO_RECORD_FOUND_ERROR';
        this.code = 400;
    }
}

class TooManyRequestsError extends Error {
    constructor(message = MESSAGES.TOO_MANY_REQUESTS_ERROR, params) {
        super(message);
        this.name = 'TOO_MANY_REQUESTS_ERROR';
        this.code = 429;
    }
}

class UnauthenticatedError extends Error {
    constructor(message = MESSAGES.UNAUTHENTICATED_ERROR, params) {
        super(message);
        this.name = 'UNAUTHENTICATED_ERROR';
        this.code = 401;
    }
}

class UnauthorisedError extends Error {
    constructor(message = MESSAGES.UNAUTHORISED_ERROR, params) {
        super(message);
        this.name = 'UNAUTHORISED_ERROR';
        this.code = 403;
    }
}

module.exports = {
    BadRequestParameterError,
    DuplicateRecordFoundError,
    NoRecordFoundError,
    TooManyRequestsError,
    UnauthenticatedError,
    UnauthorisedError
};
