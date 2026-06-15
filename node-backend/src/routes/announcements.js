const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { authMiddleware } = require('../middleware/auth');

// GET all announcements
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

// POST create announcement
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('📢 Body received:', req.body);
        console.log('👤 User from token:', req.user);

        const {
            title,
            content,
            body,          // frontend might send 'body' instead of 'content'
            type,
            targetAudience,
            targetRole,    // frontend might send 'targetRole' instead of 'targetAudience'
            courseId
        } = req.body;

        // Validate required fields manually with clear errors
        if (!title) {
            return res.status(400).json({ success: false, message: 'Title is required' });
        }
        const finalContent = content || body;
        if (!finalContent) {
            return res.status(400).json({ success: false, message: 'Content is required' });
        }

        const ann = new Announcement({
            title:          title.trim(),
            content:        finalContent,
            type:           type || 'GENERAL',
            targetAudience: targetAudience || targetRole || 'ALL',
            courseId:       courseId ? Number(courseId) : null,
            isActive:       true,
            postedBy: {
                userId: req.user?.id || req.user?.userId || null,
                name:   req.user?.fullName || req.user?.name || req.user?.sub || 'Faculty',
                role:   req.user?.role || 'FACULTY'
            }
        });

        await ann.save();
        res.status(201).json({ success: true, message: 'Announcement created', data: ann });

    } catch (err) {
        console.error('❌ Announcement save error:', err.message);
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