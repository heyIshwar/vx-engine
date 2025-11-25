
const { IPAddressMiddleware, NoContentMiddleware, HeadersMiddleware } = require("./common");

const UserMiddleware = require("./user");
const ValidatorMiddleware = require("./validator");
const AdminMiddleware = require("./admin");
const SoftDeleteMiddleware = require("./soft-delete");

module.exports = {
    IPAddressMiddleware,
    NoContentMiddleware,
    HeadersMiddleware,
    UserMiddleware,
    ValidatorMiddleware,
    AdminMiddleware,
    SoftDeleteMiddleware
};