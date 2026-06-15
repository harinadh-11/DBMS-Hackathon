// ============================================================
// FILE: models/Notification.js
// ============================================================
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    userId: { type: Number, required: true },  // References PostgreSQL user ID
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
        type: String,
        enum: ['ENROLLMENT', 'GRADE', 'ANNOUNCEMENT', 'REMINDER', 'SYSTEM'],
        default: 'SYSTEM'
    },
    isRead: { type: Boolean, default: false },
    referenceId: { type: String, default: null },  // Course ID, enrollment ID, etc.
    referenceType: { type: String, default: null }
}, {
    timestamps: true
});

notificationSchema.index({ userId: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

// ============================================================
// FILE: models/Activity.js
// ============================================================
const activitySchema = new mongoose.Schema({
    userId: { type: Number, required: true },
    action: { type: String, required: true },  // 'LOGIN', 'ENROLL', 'DROP', 'VIEW_COURSE', etc.
    resourceType: String,   // 'COURSE', 'ENROLLMENT', 'USER'
    resourceId: String,
    details: mongoose.Schema.Types.Mixed,
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

activitySchema.index({ userId: 1 });
activitySchema.index({ action: 1 });
activitySchema.index({ createdAt: -1 });

const Activity = mongoose.model('Activity', activitySchema);

module.exports = { Notification, Activity };
