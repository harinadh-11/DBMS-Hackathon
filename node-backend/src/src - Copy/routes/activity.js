const express = require('express');
const router = express.Router();
const { Activity } = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

// GET all activity logs (admin)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { userId, action, limit = 100 } = req.query;
        const filter = {};
        if (userId) filter.userId = Number(userId);
        if (action) filter.action = action;

        const logs = await Activity.find(filter)
            .sort({ createdAt: -1 })
            .limit(Number(limit));

        res.json({ success: true, data: logs, count: logs.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST log an activity
router.post('/', authMiddleware, async (req, res) => {
    try {
        const log = new Activity({
            ...req.body,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        await log.save();
        res.status(201).json({ success: true, data: log });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

module.exports = router;
