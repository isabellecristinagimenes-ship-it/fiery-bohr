import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Hardcoded backend URL for now (matching App.jsx fix)
// In expected production, this should come from env var
const API_URL = 'https://fiery-bohr-production-b324.up.railway.app';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load user from localStorage on startup
        const storedUser = localStorage.getItem('fiery_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, {
                email,
                password
            });
            const userData = response.data;
            // Ensure we are storing role and agencyId
            console.log('Login successful:', userData);

            setUser(userData);
            localStorage.setItem('fiery_user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            console.error('Login Failed:', error);
            return {
                success: false,
                message: error.response?.data?.error || 'Falha no login'
            };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('fiery_user');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, IsAuthenticated: !!user, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
