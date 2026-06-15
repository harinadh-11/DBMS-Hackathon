// ============================================================
// FILE: models/Announcement.js
// ============================================================
const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'Content is required']
    },
    type: {
        type: String,
        enum: ['GENERAL', 'COURSE', 'EXAM', 'HOLIDAY', 'URGENT'],
        default: 'GENERAL'
    },
    courseId: {
        type: Number,     // References PostgreSQL course ID
        default: null
    },
    targetAudience: {
        type: String,
        enum: ['ALL', 'STUDENTS', 'FACULTY', 'ADMIN'],
        default: 'ALL'
    },
    postedBy: {
        userId: Number,   // References PostgreSQL user ID
        name: String,
        role: String
    },
    isActive: { type: Boolean, default: true },
    expiresAt: { type: Date, default: null }
}, {
    timestamps: true
});

module.exports = mongoose.model('Announcement', announcementSchema);
