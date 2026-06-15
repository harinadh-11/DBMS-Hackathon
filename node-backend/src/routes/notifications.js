// ============================================================
// FILE: routes/notifications.js
// ============================================================
const express = require('express');
const router = express.Router();
const { Notification } = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// GET notifications for a user
router.get('/:userId', authMiddleware, async (req, res) => {
    try {
        const { unread } = req.query;
        const filter = { userId: Number(req.params.userId) };
        if (unread === 'true') filter.isRead = false;

        const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
        const unreadCount = await Notification.countDocuments({ userId: Number(req.params.userId), isRead: false });

        res.json({ success: true, data: notifications, unreadCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create notification
router.post('/', authMiddleware, async (req, res) => {
    try {
        const notif = new Notification(req.body);
        await notif.save();
        res.status(201).json({ success: true, data: notif });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT mark as read
router.put('/:id/read', authMiddleware, async (req, res) => {
    try {
        const notif = await Notification.findByIdAndUpdate(
            req.params.id,
            { isRead: true },
            { new: true }
        );
        if (!notif) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: notif });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// PUT mark all read for user
router.put('/user/:userId/read-all', authMiddleware, async (req, res) => {
    try {
        await Notification.updateMany(
            { userId: Number(req.params.userId), isRead: false },
            { isRead: true }
        );
        res.json({ success: true, message: 'All notifications marked as read' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
