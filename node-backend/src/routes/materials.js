const express = require('express');
const router = express.Router();
const Material = require('../models/Material');

// GET all materials (optionally filter by courseId)
router.get('/', async (req, res) => {
    try {
        const filter = req.query.courseId ? { courseId: Number(req.query.courseId) } : {};
        const materials = await Material.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: materials });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST create material
router.post('/', async (req, res) => {
    try {
        const material = new Material(req.body);
        await material.save();
        res.status(201).json({ success: true, data: material });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE material
router.delete('/:id', async (req, res) => {
    try {
        await Material.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Material deleted' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// VECTOR SEARCH — Smart Search
router.get('/search', async (req, res) => {
    try {
        const { q } = req.query;
        if (!q) return res.json({ success: true, data: [] });

        // Text search using MongoDB text index
        const results = await Material.find(
            { $text: { $search: q } },
            { score: { $meta: 'textScore' } }
        ).sort({ score: { $meta: 'textScore' } }).limit(10);

        // If no text results, do keyword search as fallback
        if (results.length === 0) {
            const fallback = await Material.find({
                $or: [
                    { title: { $regex: q, $options: 'i' } },
                    { description: { $regex: q, $options: 'i' } },
                    { tags: { $regex: q, $options: 'i' } },
                    { content: { $regex: q, $options: 'i' } }
                ]
            }).limit(10);
            return res.json({ success: true, data: fallback, searchType: 'keyword' });
        }

        res.json({ success: true, data: results, searchType: 'vector' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;