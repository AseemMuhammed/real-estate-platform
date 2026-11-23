import React, { Suspense, lazy, useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import Loader from './components/common/Loader';
import ErrorBoundary from './components/common/ErrorBoundary';

import LandingPage from './pages/shared/LandingPage';
const Properties = lazy(() => import('./pages/shared/Properties'));
const PropertyDetails = lazy(() => import('./pages/shared/PropertyDetails'));
const Profile = lazy(() => import('./pages/shared/Profile'));
const Contact = lazy(() => import('./pages/shared/Contact'));
const ChatMessages = lazy(() => import('./pages/shared/ChatMessages'));
const NotFound = lazy(() => import('./pages/shared/NotFound'));

const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const VerifyEmail = lazy(() => import('./pages/auth/VerifyEmail'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/auth/ResetPassword'));

const Wishlist = lazy(() => import('./pages/buyer/Wishlist'));
const MyInquiries = lazy(() => import('./pages/buyer/MyInquiries'));

const SellerDashboard = lazy(() => import('./pages/seller/SellerDashboard'));
const MyProperties = lazy(() => import('./pages/seller/MyProperties'));
const AddProperty = lazy(() => import('./pages/seller/AddProperty'));
const EditProperty = lazy(() => import('./pages/seller/EditProperty'));
const Leads = lazy(() => import('./pages/seller/Leads'));

const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSellerRequests = lazy(() => import('./pages/admin/AdminSellerRequests'));
const AdminProperties = lazy(() => import('./pages/admin/AdminProperties'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminContacts = lazy(() => import('./pages/admin/AdminContacts'));

const ScrollToTop = () => {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0 });
    }, [pathname]);
    return null;
};

const App = () => (
    <>
        <ScrollToTop />
        <ErrorBoundary>
            <Suspense fallback={<Loader fullPage />}>
                <Routes>
                    {/* Public */}
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/properties" element={<Properties />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/properties/:id" element={<PropertyDetails />} />
                    <Route path="/contact" element={<Contact />} />

                    {/* Guest only */}
                    <Route element={<PublicRoute />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/forgot-password" element={<ForgotPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                    </Route>

                    {/* Any signed-in user */}
                    <Route element={<ProtectedRoute />}>
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/chat-messages" element={<ChatMessages />} />
                    </Route>

                    {/* Buyer */}
                    <Route element={<ProtectedRoute allowedRoles={['buyer']} />}>
                        <Route path="/wishlist" element={<Wishlist />} />
                        <Route path="/my-inquiries" element={<MyInquiries />} />
                    </Route>

                    {/* Seller */}
                    <Route element={<ProtectedRoute allowedRoles={['seller']} />}>
                        <Route path="/dashboard" element={<SellerDashboard />} />
                        <Route path="/my-properties" element={<MyProperties />} />
                        <Route path="/add-property" element={<AddProperty />} />
                        <Route path="/edit-property/:id" element={<EditProperty />} />
                        <Route path="/leads" element={<Leads />} />
                    </Route>

                    {/* Admin */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                        <Route path="/admin-dashboard" element={<AdminDashboard />} />
                        <Route path="/admin" element={<Navigate to="/admin-dashboard" replace />} />
                        <Route path="/admin/users" element={<AdminUsers />} />
                        <Route path="/admin/seller-requests" element={<AdminSellerRequests />} />
                        <Route path="/admin/properties" element={<AdminProperties />} />
                        <Route path="/admin/inquiries" element={<AdminInquiries />} />
                        <Route path="/admin/contacts" element={<AdminContacts />} />
                    </Route>

                    <Route path="*" element={<NotFound />} />
                </Routes>
            </Suspense>
        </ErrorBoundary>
    </>
);

export default App;
