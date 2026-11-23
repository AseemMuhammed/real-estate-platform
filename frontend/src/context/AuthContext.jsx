import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../api/endpoints';
import { errMsg } from '../utils/helpers';

const AuthContext = createContext(null);

const storage = () => (localStorage.getItem('token') ? localStorage : sessionStorage);

const readStoredUser = () => {
    try {
        const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
};

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();

    const [token, setToken] = useState(() => localStorage.getItem('token') || sessionStorage.getItem('token'));
    const [user, setUserState] = useState(readStoredUser);
    const [loading, setLoading] = useState(Boolean(token));

    const clearSession = useCallback(() => {
        ['token', 'user'].forEach((key) => {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
        });
        setToken(null);
        setUserState(null);
    }, []);

    // Persist user
    const setUser = useCallback((next) => {
        setUserState(next);
        if (next) storage().setItem('user', JSON.stringify(next));
    }, []);

    // Logout
    const logout = useCallback(() => {
        clearSession();
        navigate('/login', { replace: true });
    }, [clearSession, navigate]);

    // Session guard
    useEffect(() => {
        const id = api.interceptors.response.use(
            (res) => res,
            (error) => {
                const status = error.response?.status;
                const message = error.response?.data?.message?.toLowerCase() || '';
                const sessionDead = status === 401 || (status === 403 && message.includes('blocked'));
                if (sessionDead && (localStorage.getItem('token') || sessionStorage.getItem('token'))) {
                    clearSession();
                    navigate('/login', { replace: true, state: { notice: error.response.data.message } });
                }
                return Promise.reject(error);
            }
        );
        return () => api.interceptors.response.eject(id);
    }, [clearSession, navigate]);

    // Refresh user
    const refreshUser = useCallback(async () => {
        if (!(localStorage.getItem('token') || sessionStorage.getItem('token'))) return null;
        try {
            const res = await api.get(ENDPOINTS.ME);
            setUser(res.data.user);
            return res.data.user;
        } catch {
            return null;
        }
    }, [setUser]);

    useEffect(() => {
        if (!token) return;
        api.get(ENDPOINTS.ME)
            .then((res) => setUser(res.data.user))
            .catch(() => null)
            .finally(() => setLoading(false));
    }, [token, setUser]);

    // Login
    const login = async (email, password, remember = true) => {
        try {
            const res = await api.post(ENDPOINTS.LOGIN, { email, password });
            const store = remember ? localStorage : sessionStorage;
            clearSession();
            store.setItem('token', res.data.token);
            store.setItem('user', JSON.stringify(res.data.user));
            setToken(res.data.token);
            setUserState(res.data.user);
            return { success: true, user: res.data.user };
        } catch (err) {
            return {
                success: false,
                code: err.response?.data?.code,
                message: errMsg(err, 'Login failed. Please try again.'),
            };
        }
    };

    // Register
    const register = async (userData) => {
        try {
            const res = await api.post(ENDPOINTS.REGISTER, userData);
            return { success: true, ...res.data };
        } catch (err) {
            console.log(err)
            return { success: false, message: errMsg(err, 'Registration failed. Please try again.') };
        }
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, setUser, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
