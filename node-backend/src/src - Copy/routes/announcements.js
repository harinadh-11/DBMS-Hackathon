const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { authMiddleware, requireRole } = require('../middleware/auth');

// GET all announcements (public-ish, but token required)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { type, audience, courseId } = req.query;
        const filter = { isActive: true };
        if (type) filter.type = type;
        if (audience) filter.targetAudience = { $in: [audience, 'ALL'] };
        if (courseId) filter.courseId = Number(courseId);

        const announcements = await Announcement.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: announcements, count: announcements.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// GET single announcement
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const ann = await Announcement.findById(req.params.id);
        if (!ann) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, data: ann });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create announcement (Admin/Faculty only)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const ann = new Announcement({
            ...req.body,
            postedBy: {
                userId: req.user.id,
                name: req.user.fullName || req.user.sub,
                role: req.user.role
            }
        });
        await ann.save();
        res.status(201).json({ success: true, message: 'Announcement created', data: ann });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// PUT update announcement
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const ann = await Announcement.findByIdAndUpdate(
            req.params.id,
            { ...req.body, updatedAt: new Date() },
            { new: true, runValidators: true }
        );
        if (!ann) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Updated', data: ann });
    } catch (err) {
        res.status(400).json({ success: false, message: err.message });
    }
});

// DELETE announcement
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const ann = await Announcement.findByIdAndDelete(req.params.id);
        if (!ann) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
