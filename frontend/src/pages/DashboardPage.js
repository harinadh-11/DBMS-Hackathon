import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, enrollmentAPI, announcementAPI } from '../services/api';

export default function DashboardPage() {
    const { user, isStudent, isFaculty, isAdmin } = useAuth();
    const [stats,   setStats]   = useState({ courses: 0, enrolled: 0, announcements: 0 });
    const [courses, setCourses] = useState([]);
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const [coursesRes, annRes] = await Promise.all([
                    courseAPI.getAll(),
                    announcementAPI.getAll()
                ]);
                const allCourses = coursesRes.data.data || [];
                const allAnns    = annRes.data.data || [];

                setCourses(allCourses.slice(0, 4));
                setAnnouncements(allAnns.slice(0, 3));

                let enrolled = 0;
                if (isStudent()) {
                    const enrollRes = await enrollmentAPI.byStudent(user.userId);
                    enrolled = (enrollRes.data.data || []).filter(e => e.status === 'ENROLLED').length;
                }

                setStats({
                    courses: allCourses.length,
                    enrolled,
                    announcements: allAnns.length
                });
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return <div className="loading">Loading dashboard...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>Welcome, {user.fullName} 👋</h1>
                <span className={`badge badge-${user.role.toLowerCase()}`}>{user.role}</span>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-value">{stats.courses}</div>
                    <div className="stat-label">Total Courses</div>
                </div>
                {isStudent() && (
                    <div className="stat-card">
                        <div className="stat-icon">✅</div>
                        <div className="stat-value">{stats.enrolled}</div>
                        <div className="stat-label">Enrolled Courses</div>
                    </div>
                )}
                <div className="stat-card">
                    <div className="stat-icon">📢</div>
                    <div className="stat-value">{stats.announcements}</div>
                    <div className="stat-label">Announcements</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="section">
                <h2>Quick Actions</h2>
                <div className="action-grid">
                    <Link to="/courses" className="action-card">
                        <span className="action-icon">🔍</span>
                        <span>Browse Courses</span>
                    </Link>
                    {isStudent() && (
                        <Link to="/my-courses" className="action-card">
                            <span className="action-icon">📋</span>
                            <span>My Enrollments</span>
                        </Link>
                    )}
                    <Link to="/announcements" className="action-card">
                        <span className="action-icon">📢</span>
                        <span>Announcements</span>
                    </Link>
                    {(isAdmin() || isFaculty()) && (
                        <Link to="/courses" className="action-card">
                            <span className="action-icon">➕</span>
                            <span>Manage Courses</span>
                        </Link>
                    )}
                    {isAdmin() && (
                        <Link to="/admin" className="action-card">
                            <span className="action-icon">⚙️</span>
                            <span>Admin Panel</span>
                        </Link>
                    )}
                </div>
            </div>

            {/* Recent Courses */}
            <div className="section">
                <div className="section-header">
                    <h2>Available Courses</h2>
                    <Link to="/courses" className="btn btn-outline">View All →</Link>
                </div>
                <div className="course-grid">
                    {courses.map(c => (
                        <Link key={c.id} to={`/courses/${c.id}`} className="course-card">
                            <div className="course-code">{c.code}</div>
                            <div className="course-title">{c.title}</div>
                            <div className="course-meta">
                                <span>{c.credits} credits</span>
                                <span>{c.semester} {c.academicYear}</span>
                            </div>
                            <div className="course-progress">
                                <span>{c.enrolledCount || 0}/{c.maxStudents} enrolled</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Recent Announcements */}
            {announcements.length > 0 && (
                <div className="section">
                    <h2>Recent Announcements</h2>
                    {announcements.map(a => (
                        <div key={a._id} className={`announcement-card type-${a.type?.toLowerCase()}`}>
                            <div className="ann-header">
                                <strong>{a.title}</strong>
                                <span className="ann-badge">{a.type}</span>
                            </div>
                            <p>{a.content}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
