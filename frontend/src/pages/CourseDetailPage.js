import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, enrollmentAPI } from '../services/api';

export default function CourseDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isStudent, isAdmin, isFaculty } = useAuth();

    const [course,     setCourse]     = useState(null);
    const [enrollment, setEnrollment] = useState(null);
    const [students,   setStudents]   = useState([]);
    const [loading,    setLoading]    = useState(true);
    const [actionMsg,  setActionMsg]  = useState('');

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        setLoading(true);
        try {
            const res = await courseAPI.getById(id);
            setCourse(res.data.data);

            if (isStudent()) {
                const enrRes = await enrollmentAPI.byStudent(user.userId);
                const found  = (enrRes.data.data || []).find(e => e.course?.id === Number(id));
                setEnrollment(found || null);
            }
            if (isAdmin() || isFaculty()) {
                const stuRes = await enrollmentAPI.byCourse(id);
                setStudents(stuRes.data.data || []);
            }
        } catch (e) {
            console.error(e);
        } finally { setLoading(false); }
    };

    const handleEnroll = async () => {
        try {
            await enrollmentAPI.enroll(user.userId, Number(id));
            setActionMsg('✅ Enrolled successfully!');
            loadData();
        } catch (err) {
            setActionMsg('❌ ' + (err.response?.data?.message || 'Enrollment failed'));
        }
    };

    const handleDrop = async () => {
        if (!window.confirm('Drop this course?')) return;
        try {
            await enrollmentAPI.drop(user.userId, Number(id));
            setActionMsg('⚠️ Course dropped.');
            loadData();
        } catch (err) {
            setActionMsg('❌ ' + (err.response?.data?.message || 'Drop failed'));
        }
    };

    const handleGrade = async (enrollmentId) => {
        const grade = window.prompt('Enter grade (A, B+, B, C+, C, F):');
        if (!grade) return;
        try {
            await enrollmentAPI.updateGrade(enrollmentId, grade);
            setActionMsg('✅ Grade updated');
            loadData();
        } catch (err) {
            setActionMsg('❌ Grade update failed');
        }
    };

    if (loading) return <div className="loading">Loading course...</div>;
    if (!course) return <div className="error-state">Course not found.</div>;

    const isFull = (course.enrolledCount || 0) >= course.maxStudents;
    const isEnrolled = enrollment?.status === 'ENROLLED';
    const isDropped  = enrollment?.status === 'DROPPED';

    return (
        <div className="page">
            <button className="btn btn-outline btn-back" onClick={() => navigate(-1)}>← Back</button>

            {actionMsg && (
                <div className={`alert ${actionMsg.startsWith('✅') ? 'alert-success' : 'alert-error'}`}>
                    {actionMsg}
                </div>
            )}

            <div className="course-detail-header">
                <div>
                    <span className="course-code-badge">{course.code}</span>
                    <h1>{course.title}</h1>
                </div>
                <span className={`status status-${course.status?.toLowerCase()}`}>{course.status}</span>
            </div>

            <div className="detail-grid">
                <div className="detail-card">
                    <h3>Course Information</h3>
                    <table className="info-table">
                        <tbody>
                            <tr><td>Credits</td><td><strong>{course.credits}</strong></td></tr>
                            <tr><td>Semester</td><td><strong>{course.semester} {course.academicYear}</strong></td></tr>
                            <tr><td>Schedule</td><td><strong>{course.schedule || '—'}</strong></td></tr>
                            <tr><td>Room</td><td><strong>{course.room || '—'}</strong></td></tr>
                            <tr><td>Capacity</td>
                                <td>
                                    <strong>{course.enrolledCount || 0} / {course.maxStudents}</strong>
                                    {isFull && <span className="badge-full">Full</span>}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    {course.description && (
                        <div className="description">
                            <h4>Description</h4>
                            <p>{course.description}</p>
                        </div>
                    )}
                </div>

                {/* Enrollment Panel (Students) */}
                {isStudent() && (
                    <div className="detail-card">
                        <h3>Enrollment</h3>
                        {isEnrolled ? (
                            <div>
                                <p className="enrolled-msg">✅ You are enrolled in this course.</p>
                                {enrollment.grade && <p>Grade: <strong>{enrollment.grade}</strong></p>}
                                <button className="btn btn-danger btn-full" onClick={handleDrop}>Drop Course</button>
                            </div>
                        ) : isDropped ? (
                            <div>
                                <p className="dropped-msg">⚠️ You dropped this course.</p>
                                {!isFull && (
                                    <button className="btn btn-primary btn-full" onClick={handleEnroll}>Re-Enroll</button>
                                )}
                            </div>
                        ) : (
                            <div>
                                {isFull
                                    ? <p className="full-msg">❌ This course is full.</p>
                                    : <button className="btn btn-primary btn-full" onClick={handleEnroll}>Enroll Now</button>
                                }
                            </div>
                        )}
                    </div>
                )}

                {/* Enrolled Students Panel (Admin/Faculty) */}
                {(isAdmin() || isFaculty()) && (
                    <div className="detail-card">
                        <h3>Enrolled Students ({students.filter(s => s.status === 'ENROLLED').length})</h3>
                        {students.length === 0 ? (
                            <p className="empty-state">No students enrolled yet.</p>
                        ) : (
                            <table className="data-table">
                                <thead>
                                    <tr><th>Name</th><th>Status</th><th>Grade</th><th>Action</th></tr>
                                </thead>
                                <tbody>
                                    {students.map(s => (
                                        <tr key={s.id}>
                                            <td>{s.student?.fullName}</td>
                                            <td><span className={`status status-${s.status?.toLowerCase()}`}>{s.status}</span></td>
                                            <td>{s.grade || '—'}</td>
                                            <td>
                                                {s.status === 'ENROLLED' && (
                                                    <button className="btn btn-sm btn-outline" onClick={() => handleGrade(s.id)}>
                                                        Set Grade
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
