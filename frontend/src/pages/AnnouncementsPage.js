import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { announcementAPI } from '../services/api';

export default function AnnouncementsPage() {
    const { user, isAdmin, isFaculty } = useAuth();
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({
        title: '', content: '', type: 'GENERAL', targetAudience: 'ALL'
    });
    const [editId, setEditId] = useState(null);

    const canPost = isAdmin() || isFaculty();

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const res = await announcementAPI.getAll();
            setAnnouncements(res.data.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            if (editId) {
                await announcementAPI.update(editId, form);
            } else {
                await announcementAPI.create(form);
            }
            setShowForm(false);
            setEditId(null);
            setForm({ title: '', content: '', type: 'GENERAL', targetAudience: 'ALL' });
            load();
        } catch (err) { alert(err.response?.data?.message || 'Error saving'); }
    };

    const handleDelete = async (id, title) => {
        if (!window.confirm(`Delete "${title}"?`)) return;
        try {
            await announcementAPI.delete(id);
            load();
        } catch (err) { alert('Error deleting'); }
    };

    const openEdit = (a) => {
        setEditId(a._id);
        setForm({ title: a.title, content: a.content, type: a.type, targetAudience: a.targetAudience });
        setShowForm(true);
    };

    const typeColor = { GENERAL: '#6c757d', COURSE: '#0d6efd', EXAM: '#dc3545', HOLIDAY: '#198754', URGENT: '#fd7e14' };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="page">
            <div className="page-header">
                <h1>📢 Announcements</h1>
                {canPost && (
                    <button className="btn btn-primary"
                        onClick={() => { setShowForm(true); setEditId(null); setForm({ title: '', content: '', type: 'GENERAL', targetAudience: 'ALL' }); }}>
                        + New Announcement
                    </button>
                )}
            </div>

            {showForm && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h2>{editId ? 'Edit Announcement' : 'New Announcement'}</h2>
                            <button onClick={() => setShowForm(false)}>✕</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label>Title *</label>
                                <input value={form.title} onChange={e => setForm({...form, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label>Content *</label>
                                <textarea rows="4" value={form.content} onChange={e => setForm({...form, content: e.target.value})} required />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Type</label>
                                    <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                        {['GENERAL','COURSE','EXAM','HOLIDAY','URGENT'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Target Audience</label>
                                    <select value={form.targetAudience} onChange={e => setForm({...form, targetAudience: e.target.value})}>
                                        {['ALL','STUDENTS','FACULTY','ADMIN'].map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">
                                    {editId ? 'Update' : 'Post'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="announcements-list">
                {announcements.length === 0 ? (
                    <div className="empty-state"><p>No announcements yet.</p></div>
                ) : announcements.map(a => (
                    <div key={a._id} className="announcement-item">
                        <div className="ann-left">
                            <span className="ann-type-dot" style={{ background: typeColor[a.type] || '#6c757d' }}></span>
                        </div>
                        <div className="ann-body">
                            <div className="ann-header">
                                <h3>{a.title}</h3>
                                <div className="ann-meta">
                                    <span className="ann-badge" style={{ background: typeColor[a.type] }}>{a.type}</span>
                                    <span className="ann-audience">{a.targetAudience}</span>
                                    <span className="ann-date">{new Date(a.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <p>{a.content}</p>
                            {a.postedBy?.name && <span className="ann-author">Posted by {a.postedBy.name}</span>}
                        </div>
                        {canPost && (
                            <div className="ann-actions">
                                <button className="btn btn-sm btn-outline" onClick={() => openEdit(a)}>Edit</button>
                                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a._id, a.title)}>Delete</button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
