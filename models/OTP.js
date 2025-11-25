const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true, // Assuming an OTP should always be linked to a user
    },
    type: {
        type: mongoose.Schema.Types.Mixed, // Can be used for different OTP types (e.g., email, phone)
        required: true, // If OTP type is always expected
    },
    creation: {
        type: Date,
        default: Date.now, // Removed parentheses to pass the function reference
    },
    count: {
        type: Number,
        default: 0, // Assuming count should have a default value of 0
    },
    value: {
        type: mongoose.Schema.Types.Mixed, // The actual OTP or any associated value
        required: true, // Assuming that an OTP should always have a value
    },
}, {
    strict: false, // Allows saving fields that are not defined in the schema
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

// The third parameter 'OTPs' is the collection name in the database
module.exports = mongoose.model('OTP', OtpSchema, 'OTPs');
