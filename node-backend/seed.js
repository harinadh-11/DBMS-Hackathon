import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/acp_node';

// Define schemas inline to avoid import issues
const announcementSchema = new mongoose.Schema({
    title: String, content: String, type: String,
    targetAudience: String, courseId: Number,
    postedBy: { userId: Number, name: String, role: String },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
    userId: Number, title: String, message: String,
    type: String, isRead: { type: Boolean, default: false },
    referenceId: String, referenceType: String
}, { timestamps: true });

const activitySchema = new mongoose.Schema({
    userId: Number, action: String, resourceType: String,
    resourceId: String, details: Object
}, { timestamps: true });

const materialSchema = new mongoose.Schema({
    title: String, description: String,
    type: { type: String, default: 'NOTES' },
    url: String, content: String, courseId: Number,
    uploadedBy: { userId: Number, name: String, role: String },
    tags: [String], embedding: [Number]
}, { timestamps: true });

materialSchema.index({ title: 'text', content: 'text', tags: 'text' });

const Announcement = mongoose.model('Announcement', announcementSchema);
const Notification = mongoose.model('Notification', notificationSchema);
const Activity = mongoose.model('Activity', activitySchema);
const Material = mongoose.model('Material', materialSchema);

async function seed() {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    await Announcement.deleteMany({});
    await Notification.deleteMany({});
    await Activity.deleteMany({});
    await Material.deleteMany({});

    await Announcement.insertMany([
        {
            title: 'Welcome to Fall Semester 2024-25!',
            content: 'Classes begin on August 5th. Please ensure you have enrolled in all your courses before the deadline.',
            type: 'GENERAL', targetAudience: 'ALL',
            postedBy: { userId: 1, name: 'System Administrator', role: 'ADMIN' }
        },
        {
            title: 'Last Date for Course Enrollment',
            content: 'The last date to enroll in courses for Fall 2024-25 is August 10th.',
            type: 'URGENT', targetAudience: 'STUDENTS',
            postedBy: { userId: 1, name: 'System Administrator', role: 'ADMIN' }
        },
        {
            title: 'DBMS Mid-Semester Exam Schedule',
            content: 'The mid-semester exam for CS201 will be held on September 15th in Room LH-202.',
            type: 'EXAM', targetAudience: 'STUDENTS', courseId: 2,
            postedBy: { userId: 2, name: 'Dr. Rajesh Sharma', role: 'FACULTY' }
        },
        {
            title: 'Diwali Holiday Notice',
            content: 'The college will be closed from October 31st to November 3rd for Diwali.',
            type: 'HOLIDAY', targetAudience: 'ALL',
            postedBy: { userId: 1, name: 'System Administrator', role: 'ADMIN' }
        }
    ]);
    console.log('✅ Announcements seeded');

    await Notification.insertMany([
        {
            userId: 4, title: 'Enrollment Confirmed',
            message: 'You have successfully enrolled in CS101 - Data Structures & Algorithms.',
            type: 'ENROLLMENT', referenceId: '1', referenceType: 'COURSE'
        },
        {
            userId: 5, title: 'New Announcement',
            message: 'A new announcement has been posted: Last Date for Course Enrollment.',
            type: 'ANNOUNCEMENT'
        }
    ]);
    console.log('✅ Notifications seeded');

    await Activity.insertMany([
        { userId: 1, action: 'LOGIN', resourceType: 'USER', details: { username: 'admin' } },
        { userId: 4, action: 'ENROLL', resourceType: 'COURSE', resourceId: '1', details: { courseCode: 'CS101' } },
        { userId: 5, action: 'VIEW_COURSE', resourceType: 'COURSE', resourceId: '1', details: { courseCode: 'CS101' } }
    ]);
    console.log('✅ Activity logs seeded');

    await Material.insertMany([
        {
            title: 'DBMS Normalization Notes',
            description: 'Complete notes on 1NF, 2NF, 3NF and BCNF normalization',
            type: 'NOTES',
            content: 'Normalization is the process of organizing data to reduce redundancy. 1NF removes repeating groups. 2NF removes partial dependencies. 3NF removes transitive dependencies. BCNF is stronger form of 3NF.',
            courseId: 2,
            tags: ['DBMS', 'normalization', 'database', '1NF', '2NF', '3NF', 'BCNF'],
            uploadedBy: { userId: 2, name: 'Dr. Rajesh Sharma', role: 'FACULTY' }
        },
        {
            title: 'Data Structures - Arrays and Linked Lists',
            description: 'Detailed notes on arrays, linked lists, and their operations',
            type: 'NOTES',
            content: 'Arrays are contiguous memory locations. Linked lists use nodes with pointers. Arrays have O(1) access, O(n) insertion. Linked lists have O(n) access, O(1) insertion at head.',
            courseId: 1,
            tags: ['DSA', 'arrays', 'linked list', 'data structures'],
            uploadedBy: { userId: 2, name: 'Dr. Rajesh Sharma', role: 'FACULTY' }
        },
        {
            title: 'SQL Query Complete Guide',
            description: 'Complete SQL reference with joins, subqueries and aggregates',
            type: 'PDF',
            content: 'SQL SELECT FROM WHERE GROUP BY HAVING ORDER BY. JOIN types: INNER, LEFT, RIGHT, FULL. Subqueries in WHERE and FROM clauses.',
            courseId: 2,
            tags: ['SQL', 'database', 'queries', 'joins'],
            uploadedBy: { userId: 2, name: 'Dr. Rajesh Sharma', role: 'FACULTY' }
        },
        {
            title: 'React and Node.js Web Development',
            description: 'Full stack web development guide',
            type: 'LINK',
            url: 'https://reactjs.org/docs',
            content: 'React is a JavaScript library for building user interfaces. Node.js is a runtime for server-side JavaScript.',
            courseId: 3,
            tags: ['React', 'Node.js', 'web development', 'frontend', 'backend'],
            uploadedBy: { userId: 3, name: 'Dr. Priya Nair', role: 'FACULTY' }
        }
    ]);
    console.log('✅ Materials seeded');

    console.log('\n🎉 MongoDB seed complete!');
    process.exit(0);
}

seed().catch(err => { console.error('❌ Seed error:', err); process.exit(1); });