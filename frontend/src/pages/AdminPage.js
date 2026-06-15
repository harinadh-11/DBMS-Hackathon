import React, { useEffect, useState } from 'react';
import { courseAPI, enrollmentAPI } from '../services/api';
import api from '../services/api';

export default function AdminPage() {
    const [stats, setStats] = useState({ courses: 0, students: 0, faculty: 0, enrollments: 0 });
    const [courses, setCourses] = useState([]);
    const [users, setUsers]     = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('overview');

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const coursesRes = await courseAPI.getAll();
            const all = coursesRes.data.data || [];
            setCourses(all);

            // Try to get users from spring admin endpoint
            try {
                const usersRes = await api.get('/api/admin/users');
                const allUsers = usersRes.data.data || [];
                setUsers(allUsers);
                setStats({
                    courses: all.length,
                    students: allUsers.filter(u => u.role?.name === 'STUDENT').length,
                    faculty:  allUsers.filter(u => u.role?.name === 'FACULTY').length,
                    enrollments: all.reduce((sum, c) => sum + (c.enrolledCount || 0), 0)
                });
            } catch {
                setStats({
                    courses: all.length,
                    enrollments: all.reduce((sum, c) => sum + (c.enrolledCount || 0), 0),
                    students: '—', faculty: '—'
                });
            }
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="loading">Loading admin panel...</div>;

    return (
        <div className="page">
            <div className="page-header"><h1>⚙️ Admin Panel</h1></div>

            <div className="stats-grid">
                {[
                    { icon: '📚', value: stats.courses,     label: 'Total Courses' },
                    { icon: '🎓', value: stats.students,    label: 'Students' },
                    { icon: '👨‍🏫', value: stats.faculty,    label: 'Faculty' },
                    { icon: '✅', value: stats.enrollments, label: 'Active Enrollments' },
                ].map(s => (
                    <div key={s.label} className="stat-card">
                        <div className="stat-icon">{s.icon}</div>
                        <div className="stat-value">{s.value}</div>
                        <div className="stat-label">{s.label}</div>
                    </div>
                ))}
            </div>

            <div className="filter-tabs">
                {['overview', 'courses', 'users'].map(t => (
                    <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                ))}
            </div>

            {tab === 'overview' && (
                <div className="section">
                    <h2>System Overview</h2>
                    <div className="info-box">
                        <h4>Architecture</h4>
                        <ul>
                            <li>🌐 <strong>Frontend:</strong> React SPA (Port 3000)</li>
                            <li>🔀 <strong>API Gateway:</strong> FastAPI (Port 8000)</li>
                            <li>☕ <strong>Spring Boot:</strong> Auth, Courses, Enrollments (Port 8080)</li>
                            <li>🟢 <strong>Node.js:</strong> Announcements, Notifications (Port 3001)</li>
                            <li>🐘 <strong>PostgreSQL:</strong> Users, Courses, Enrollments</li>
                            <li>🍃 <strong>MongoDB:</strong> Announcements, Notifications, Activity</li>
                        </ul>
                    </div>
                </div>
            )}

            {tab === 'courses' && (
                <div className="section">
                    <h2>All Courses ({courses.length})</h2>
                    <div className="table-wrapper">
                        <table className="data-table">
                            <thead><tr><th>Code</th><th>Title</th><th>Credits</th><th>Enrolled</th><th>Max</th><th>Status</th></tr></thead>
                            <tbody>
                                {courses.map(c => (
                                    <tr key={c.id}>
                                        <td>{c.code}</td>
                                        <td>{c.title}</td>
                                        <td>{c.credits}</td>
                                        <td>{c.enrolledCount || 0}</td>
                                        <td>{c.maxStudents}</td>
                                        <td><span className={`status status-${c.status?.toLowerCase()}`}>{c.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === 'users' && (
                <div className="section">
                    <h2>Users</h2>
                    {users.length === 0 ? (
                        <p className="empty-state">User data requires the Spring Boot /api/admin/users endpoint.</p>
                    ) : (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Role</th><th>Active</th></tr></thead>
                                <tbody>
                                    {users.map(u => (
                                        <tr key={u.id}>
                                            <td>{u.fullName}</td>
                                            <td>{u.username}</td>
                                            <td>{u.email}</td>
                                            <td><span className={`badge badge-${u.role?.name?.toLowerCase()}`}>{u.role?.name}</span></td>
                                            <td>{u.isActive ? '✅' : '❌'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
