const mongoose = require('mongoose');
const UserPreferenceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    profilePhotoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
    coverPhotoId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File',
    },
    bio: {
        type: String,
    },
    hideName: {
        type: Boolean,
    }
}, {
    strict: false,
    timestamps: true
})

// Create and export the model
const UserPreference = mongoose.models.UserPreference || mongoose.model('UserPreference', UserPreferenceSchema);

module.exports = UserPreference;