import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage        from './pages/LoginPage';
import RegisterPage     from './pages/RegisterPage';
import DashboardPage    from './pages/DashboardPage';
import CoursesPage      from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyCoursesPage    from './pages/MyCoursesPage';
import AnnouncementsPage from './pages/AnnouncementsPage';
import AdminPage        from './pages/AdminPage';

// Components
import Navbar from './components/Navbar';

function ProtectedRoute({ children, roles }) {
    const { user, loading } = useAuth();
    if (loading) return <div className="loading">Loading...</div>;
    if (!user) return <Navigate to="/login" replace />;
    if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
    return children;
}

function AppRoutes() {
    const { user } = useAuth();

    return (
        <BrowserRouter>
            {user && <Navbar />}
            <div className="main-content">
                <Routes>
                    <Route path="/login"    element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />

                    <Route path="/dashboard" element={
                        <ProtectedRoute><DashboardPage /></ProtectedRoute>
                    } />
                    <Route path="/courses" element={
                        <ProtectedRoute><CoursesPage /></ProtectedRoute>
                    } />
                    <Route path="/courses/:id" element={
                        <ProtectedRoute><CourseDetailPage /></ProtectedRoute>
                    } />
                    <Route path="/my-courses" element={
                        <ProtectedRoute roles={['STUDENT']}><MyCoursesPage /></ProtectedRoute>
                    } />
                    <Route path="/announcements" element={
                        <ProtectedRoute><AnnouncementsPage /></ProtectedRoute>
                    } />
                    <Route path="/admin" element={
                        <ProtectedRoute roles={['ADMIN']}><AdminPage /></ProtectedRoute>
                    } />
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            </div>
        </BrowserRouter>
    );
}

export default function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}
