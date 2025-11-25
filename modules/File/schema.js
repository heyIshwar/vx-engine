const mongoose = require('mongoose');

module.exports = {
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    name: {
        type: String,
        required: false,
    },
    key: {
        type: String,
        required: true,
        index: true,
    },
    size: {
        type: Number,
        required: false,
    },
    extension: {
        type: String,
        required: false,
    },
    meta: {
        type: Map,
        of: String,
        required: false,
    },
    module: {
        type: String,
        required: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true,
    },
    deletedAt: {
        type: Date,
        default: null,
    },
};