import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser]       = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const saved = localStorage.getItem('user');
        if (saved) {
            try { setUser(JSON.parse(saved)); } catch (_) {}
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        const res = await authAPI.login({ username, password });
        const data = res.data.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const register = async (payload) => {
        const res = await authAPI.register(payload);
        const data = res.data.data;
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
        return data;
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
    };

    const isAdmin   = () => user?.role === 'ADMIN';
    const isFaculty = () => user?.role === 'FACULTY';
    const isStudent = () => user?.role === 'STUDENT';

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, register, isAdmin, isFaculty, isStudent }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be inside AuthProvider');
    return ctx;
};
