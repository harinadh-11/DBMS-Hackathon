// ============================================================
// FILE: pages/MyCoursesPage.js
// ============================================================
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { enrollmentAPI } from '../services/api';

export default function MyCoursesPage() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        enrollmentAPI.byStudent(user.userId)
            .then(res => setEnrollments(res.data.data || []))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const filtered = filter === 'ALL' ? enrollments : enrollments.filter(e => e.status === filter);

    const totalCredits = enrollments
        .filter(e => e.status === 'ENROLLED')
        .reduce((sum, e) => sum + (e.course?.credits || 0), 0);

    if (loading) return <div className="loading">Loading your courses...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>📋 My Courses</h1>
                <div className="stat-pill">Total Credits: <strong>{totalCredits}</strong></div>
            </div>

            <div className="filter-tabs">
                {['ALL', 'ENROLLED', 'DROPPED', 'COMPLETED'].map(s => (
                    <button key={s}
                        className={`tab ${filter === s ? 'active' : ''}`}
                        onClick={() => setFilter(s)}>
                        {s}
                    </button>
                ))}
            </div>

            {filtered.length === 0 ? (
                <div className="empty-state">
                    <p>No courses found.</p>
                    <Link to="/courses" className="btn btn-primary">Browse Courses</Link>
                </div>
            ) : (
                <div className="course-grid">
                    {filtered.map(e => (
                        <div key={e.id} className="course-card">
                            <div className="course-code">{e.course?.code}</div>
                            <div className="course-title">{e.course?.title}</div>
                            <div className="course-meta">
                                <span>{e.course?.credits} credits</span>
                                <span>{e.course?.semester} {e.course?.academicYear}</span>
                            </div>
                            <div className="course-card-footer">
                                <span className={`status status-${e.status?.toLowerCase()}`}>{e.status}</span>
                                {e.grade && <span className="grade-badge">Grade: {e.grade}</span>}
                                <Link to={`/courses/${e.course?.id}`} className="btn btn-sm btn-outline">View</Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
