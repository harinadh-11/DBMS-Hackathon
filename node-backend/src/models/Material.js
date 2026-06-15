const mongoose = require('mongoose');

const materialSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    type: { type: String, enum: ['PDF', 'NOTES', 'LINK', 'VIDEO'], default: 'NOTES' },
    url: String,
    content: String,
    courseId: { type: Number, required: true },
    uploadedBy: {
        userId: Number,
        name: String,
        role: String
    },
    tags: [String],
    // For vector search
    embedding: [Number]
}, { timestamps: true });

materialSchema.index({ title: 'text', content: 'text', tags: 'text' });

module.exports = mongoose.model('Material', materialSchema);