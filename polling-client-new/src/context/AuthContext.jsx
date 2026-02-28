import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const checkLoggedIn = async () => {
            try {
                const userData = await authService.getMe();
                setUser(userData);
            } catch (err) {
                // Not logged in or token expired
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkLoggedIn();
    }, []);

    const login = async (email, password) => {
        try {
            setError(null);
            const userData = await authService.login({ email, password });
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
            throw err;
        }
    };

    const register = async (name, email, password, role) => {
        try {
            setError(null);
            const userData = await authService.register({ name, email, password, role });
            setUser(userData);
            return userData;
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
            throw err;
        }
    };

    const logout = async () => {
        try {
            await authService.logout();
            setUser(null);
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    const value = {
        user,
        loading,
        error,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
