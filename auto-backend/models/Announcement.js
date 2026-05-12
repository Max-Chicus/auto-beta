// models/Announcement.js
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    isActive: {
        type: Boolean,
        default: false
    },
    title: {
        type: String,
        default: '',
        trim: true
    },
    message: {
        type: String,
        default: '',
        trim: true
    },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'danger', 'vacation'],
        default: 'info'
    },
    expiresAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);