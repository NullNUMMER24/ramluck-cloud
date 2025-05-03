// js/auth.js
const API_BASE = 'http://localhost:8088/api';

// Token management
export const getAuthToken = () => localStorage.getItem('authToken');
export const setAuthToken = (token) => localStorage.setItem('authToken', token);
export const removeAuthToken = () => localStorage.removeItem('authToken');

// Authentication check middleware
export const checkAuth = () => {
    const token = getAuthToken();
    const isLoginPage = window.location.pathname.includes('index.html');
    
    if (!token && !isLoginPage) {
        window.location.href = 'index.html';
        return false;
    }
    
    if (token && isLoginPage) {
        window.location.href = 'dashboard.html';
        return false;
    }
    
    return !!token;
};

// Login function
export const login = async (username, password) => {
    try {
        const response = await fetch(`${API_BASE}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Login failed');
        }

        const { token } = await response.json();
        setAuthToken(token);
        return true;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

// Registration function
export const register = async (username, email, password) => {
    try {
        const response = await fetch(`${API_BASE}/login/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

// Token validation
export const validateToken = async () => {
    try {
        const response = await fetch(`${API_BASE}/validate`, {
            headers: { 'Authorization': `Bearer ${getAuthToken()}` }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
};

// Logout function
export const logout = () => {
    removeAuthToken();
    window.location.href = 'index.html';
};

// Initialize auth check on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    
    // Auto-redirect if logged in
    if (getAuthToken() && window.location.pathname.includes('index.html')) {
        window.location.href = 'dashboard.html';
    }
});