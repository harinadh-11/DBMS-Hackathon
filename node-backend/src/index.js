require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// ✅ Create app FIRST before anything else
const app = express();

// ─── Middleware ───────────────────────────────────────────
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// ─── Import Routes AFTER app is created ──────────────────
const announcementRoutes = require('./routes/announcements');
const notificationRoutes = require('./routes/notifications');
const activityRoutes     = require('./routes/activity');
const materialsRouter    = require('./routes/materials');

// ─── Health Check ─────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({ status: 'OK', service: 'ACP Node Backend v1.0', timestamp: new Date() });
});

// ─── Routes ───────────────────────────────────────────────
app.use('/api/announcements', announcementRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/activity',      activityRoutes);
app.use('/api/materials',     materialsRouter);

// ─── Global Error Handler ─────────────────────────────────
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// ─── 404 Handler ──────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.path} not found` });
});

// ─── MongoDB & Server Start ───────────────────────────────
const PORT = process.env.PORT || 3001;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/acp_node';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('✅ MongoDB connected:', MONGO_URI);
        app.listen(PORT, () => {
            console.log(`🚀 Node.js backend running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ MongoDB connection error:', err.message);
        process.exit(1);
    });

module.exports = app;