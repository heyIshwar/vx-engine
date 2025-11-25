const mongoose = require('mongoose');
const UserCredentialHistorySchema = new mongoose.Schema({
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'User',
		index: true
	},
	type: {
		type: String,
		enum: ['password', 'mobile', 'email'],
	},
	oldValue: mongoose.Schema.Types.Mixed,
	newValue: mongoose.Schema.Types.Mixed,
}, {strict: false, timestamps: true});

module.exports = UserCredentialHistorySchema