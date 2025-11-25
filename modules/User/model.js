const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        index: true
    },
    username: {
        type: String,
        index: true,
    },
    email: {
        type: String,
        index: true
    },
    mobile: {
        type: Number,
        index: true
    },
    gender: Number,
    campusId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Campus",
        index: true
    },
    flags: [{

    }],
    isAdmin: {
        type: Boolean,
        default: false,
        index: true
    },
    password: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    strict: false,
    timestamps: true,
    toJSON: {
        select: {
            email: 0,
            mobile: 0,
            gender: 0,
        }
    }
});

// Add soft delete methods
UserSchema.methods.softDelete = async function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    await this.save();
};

UserSchema.methods.restore = async function() {
    this.isDeleted = false;
    this.deletedAt = null;
    await this.save();
};

// Override find methods to exclude soft-deleted by default
UserSchema.statics.find = function(conditions = {}, ...args) {
    if (!('isDeleted' in conditions)) {
        conditions.isDeleted = false;
    }
    return mongoose.Model.find.call(this, conditions, ...args);
};

UserSchema.statics.findOne = function(conditions = {}, ...args) {
    if (!('isDeleted' in conditions)) {
        conditions.isDeleted = false;
    }
    return mongoose.Model.findOne.call(this, conditions, ...args);
};

UserSchema.statics.findById = function(id, ...args) {
    return this.findOne({ _id: id, isDeleted: false }, ...args);
};

// Create and export the model
const User = mongoose.models.User || mongoose.model('User', UserSchema);

module.exports = User;