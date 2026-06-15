import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
    const { user, logout, isAdmin, isStudent } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="navbar">
            <div className="nav-brand">
                <Link to="/dashboard">🎓 ACP</Link>
            </div>
            <div className="nav-links">
                <Link to="/dashboard"     className={isActive('/dashboard')     ? 'active' : ''}>Dashboard</Link>
                <Link to="/courses"       className={isActive('/courses')       ? 'active' : ''}>Courses</Link>
                {isStudent() && (
                    <Link to="/my-courses" className={isActive('/my-courses')   ? 'active' : ''}>My Courses</Link>
                )}
                <Link to="/announcements" className={isActive('/announcements') ? 'active' : ''}>Announcements</Link>
                {isAdmin() && (
                    <Link to="/admin"     className={isActive('/admin')         ? 'active' : ''}>Admin</Link>
                )}
            </div>
            <div className="nav-user">
                <span className={`role-badge badge-${user?.role?.toLowerCase()}`}>{user?.role}</span>
                <span className="username">{user?.fullName}</span>
                <button className="btn btn-outline btn-sm" onClick={handleLogout}>Logout</button>
            </div>
        </nav>
    );
}
