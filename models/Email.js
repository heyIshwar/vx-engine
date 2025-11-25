const mongoose = require('mongoose');
const EmailSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    emailAddress: String,
    subject: String,
    content: String,
}, {strict: false, timestamps: true})

module.exports = EmailSchema