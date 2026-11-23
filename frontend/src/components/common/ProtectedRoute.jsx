import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HOME_BY_ROLE } from '../../utils/helpers';
import Loader from './Loader';

// Private routes
export const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) return <Loader fullPage />;

    if (!user) return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />;
    }

    return <Outlet />;
};

// Guest-only routes
export const PublicRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <Loader fullPage />;
    if (user) return <Navigate to={HOME_BY_ROLE[user.role] || '/'} replace />;

    return <Outlet />;
};
