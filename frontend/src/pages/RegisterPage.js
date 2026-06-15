// ============================================================
// FILE: pages/RegisterPage.js
// ============================================================
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        username: '', email: '', password: '', fullName: '', role: 'STUDENT'
    });
    const [error,   setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(form);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🎓 ACP</h1>
                    <p>Academic Course Planning System</p>
                </div>
                <h2>Create Account</h2>
                {error && <div className="error-alert">{error}</div>}
                <form onSubmit={handleSubmit}>
                    {[
                        { name: 'fullName',  label: 'Full Name',  type: 'text',     placeholder: 'Dr. John Smith' },
                        { name: 'username',  label: 'Username',   type: 'text',     placeholder: 'john.smith' },
                        { name: 'email',     label: 'Email',      type: 'email',    placeholder: 'john@university.edu' },
                        { name: 'password',  label: 'Password',   type: 'password', placeholder: 'Min 6 characters' },
                    ].map(f => (
                        <div className="form-group" key={f.name}>
                            <label>{f.label}</label>
                            <input type={f.type} name={f.name} value={form[f.name]}
                                onChange={handleChange} placeholder={f.placeholder} required />
                        </div>
                    ))}
                    <div className="form-group">
                        <label>Role</label>
                        <select name="role" value={form.role} onChange={handleChange}>
                            <option value="STUDENT">Student</option>
                            <option value="FACULTY">Faculty</option>
                        </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Creating...' : 'Create Account'}
                    </button>
                </form>
                <div className="auth-footer">
                    <p>Already have an account? <Link to="/login">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
