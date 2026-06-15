import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { courseAPI, departmentAPI } from '../services/api';

export default function CoursesPage() {
    const { isAdmin, isFaculty } = useAuth();
    const [courses,     setCourses]     = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search,      setSearch]      = useState('');
    const [loading,     setLoading]     = useState(true);
    const [showForm,    setShowForm]    = useState(false);
    const [editCourse,  setEditCourse]  = useState(null);
    const [form, setForm] = useState({
        title: '', code: '', description: '', credits: 3,
        maxStudents: 60, departmentId: '', semester: 'Fall',
        academicYear: '2024-25', schedule: '', room: ''
    });

    const canManage = isAdmin() || isFaculty();

    useEffect(() => {
        loadCourses();
        loadDepartments();  // ✅ load real departments from DB
    }, []);

    const loadCourses = async () => {
        try {
            const res = await courseAPI.getAll();
            setCourses(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const loadDepartments = async () => {
        try {
            const res = await departmentAPI.getAll();
            const depts = res.data.data || [];
            setDepartments(depts);
            // ✅ set first real department ID as default
            if (depts.length > 0) {
                setForm(f => ({ ...f, departmentId: depts[0].id }));
            }
        } catch (e) { console.error('Dept load error:', e); }
    };

    const handleSearch = async e => {
        e.preventDefault();
        if (!search.trim()) { loadCourses(); return; }
        setLoading(true);
        try {
            const res = await courseAPI.search(search);
            setCourses(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const payload = {
                ...form,
                departmentId: Number(form.departmentId),  // ✅ ensure it's a number
                credits:      Number(form.credits),
                maxStudents:  Number(form.maxStudents)
            };
            if (editCourse) {
                await courseAPI.update(editCourse.id, payload);
                alert('Course updated!');
            } else {
                await courseAPI.create(payload);
                alert('Course created!');
            }
            setShowForm(false);
            setEditCourse(null);
            resetForm();
            loadCourses();
        } catch (err) {
            alert(err.response?.data?.message || err.response?.data?.error || 'Error saving course');
        }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            await courseAPI.delete(id);
            loadCourses();
        } catch (err) {
            alert(err.response?.data?.message || 'Error deleting');
        }
    };

    const openEdit = (c) => {
        setEditCourse(c);
        setForm({
            title:        c.title,
            code:         c.code,
            description:  c.description || '',
            credits:      c.credits,
            maxStudents:  c.maxStudents,
            departmentId: c.departmentId,
            semester:     c.semester,
            academicYear: c.academicYear,
            schedule:     c.schedule || '',
            room:         c.room || ''
        });
        setShowForm(true);
    };

    const resetForm = () => {
        setForm({
            title: '', code: '', description: '', credits: 3,
            maxStudents: 60,
            departmentId: departments.length > 0 ? departments[0].id : '',  // ✅ real ID
            semester: 'Fall', academicYear: '2024-25', schedule: '', room: ''
        });
    };

    return (
        <div className="page">
            <div className="page-header">
                <h1>📚 Courses</h1>
                {canManage && (
                    <button className="btn btn-primary"
                        onClick={() => { resetForm(); setEditCourse(null); setShowForm(true); }}>
                        + Add Course
                    </button>
                )}
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="search-bar">
                <input type="text" value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by title or code..." />
                <button type="submit" className="btn btn-primary">Search</button>
                <button type="button" className="btn btn-outline"
                    onClick={() => { setSearch(''); loadCourses(); }}>Clear</button>
            </form>

            {/* Course Form Modal */}
            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editCourse ? 'Edit Course' : 'Create Course'}</h2>
                            <button onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit} className="form-grid">
                            <div className="form-group">
                                <label>Course Title *</label>
                                <input value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Course Code *</label>
                                <input value={form.code}
                                    onChange={e => setForm({...form, code: e.target.value})}
                                    disabled={!!editCourse} required />
                            </div>
                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea value={form.description}
                                    onChange={e => setForm({...form, description: e.target.value})} />
                            </div>

                            {/* ✅ FIXED: Department dropdown with real IDs from DB */}
                            <div className="form-group full-width">
                                <label>Department *</label>
                                <select
                                    value={form.departmentId}
                                    onChange={e => setForm({...form, departmentId: Number(e.target.value)})}
                                    required>
                                    <option value="">-- Select Department --</option>
                                    {departments.map(d => (
                                        <option key={d.id} value={d.id}>
                                            {d.name} ({d.code})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Credits</label>
                                <input type="number" min="1" max="6" value={form.credits}
                                    onChange={e => setForm({...form, credits: Number(e.target.value)})} />
                            </div>
                            <div className="form-group">
                                <label>Max Students</label>
                                <input type="number" min="1" value={form.maxStudents}
                                    onChange={e => setForm({...form, maxStudents: Number(e.target.value)})} />
                            </div>
                            <div className="form-group">
                                <label>Semester</label>
                                <select value={form.semester}
                                    onChange={e => setForm({...form, semester: e.target.value})}>
                                    <option>Fall</option>
                                    <option>Spring</option>
                                    <option>Summer</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Academic Year</label>
                                <input value={form.academicYear}
                                    onChange={e => setForm({...form, academicYear: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Schedule</label>
                                <input value={form.schedule}
                                    onChange={e => setForm({...form, schedule: e.target.value})}
                                    placeholder="Mon/Wed 10:00-11:30" />
                            </div>
                            <div className="form-group">
                                <label>Room</label>
                                <input value={form.room}
                                    onChange={e => setForm({...form, room: e.target.value})}
                                    placeholder="LH-101" />
                            </div>
                            <div className="form-actions full-width">
                                <button type="button" className="btn btn-outline"
                                    onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editCourse ? 'Update Course' : 'Create Course'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Course Table */}
            {loading ? <div className="loading">Loading...</div> : (
                <div className="table-wrapper">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Code</th><th>Title</th><th>Credits</th>
                                <th>Schedule</th><th>Enrolled</th><th>Status</th>
                                {canManage && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {courses.map(c => (
                                <tr key={c.id}>
                                    <td>
                                        <Link to={`/courses/${c.id}`} className="link">{c.code}</Link>
                                    </td>
                                    <td>{c.title}</td>
                                    <td>{c.credits}</td>
                                    <td>{c.schedule || '—'}</td>
                                    <td>{c.enrolledCount || 0}/{c.maxStudents}</td>
                                    <td>
                                        <span className={`status status-${c.status?.toLowerCase()}`}>
                                            {c.status}
                                        </span>
                                    </td>
                                    {canManage && (
                                        <td className="actions">
                                            <button className="btn btn-sm btn-outline"
                                                onClick={() => openEdit(c)}>Edit</button>
                                            {isAdmin() && (
                                                <button className="btn btn-sm btn-danger"
                                                    onClick={() => handleDelete(c.id, c.title)}>Delete</button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {courses.length === 0 && <p className="empty-state">No courses found.</p>}
                </div>
            )}
        </div>
    );
}