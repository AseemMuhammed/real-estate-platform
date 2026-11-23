import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
    HiMenu,
    HiX,
    HiOutlineViewGrid,
    HiOutlineClipboardList,
    HiOutlineChartBar,
    HiOutlineChatAlt2,
    HiOutlineUser,
    HiOutlineSupport,
    HiOutlineLogout,
    HiOutlineUsers,
    HiOutlineUserCircle,
    HiOutlineOfficeBuilding,
    HiOutlineChatAlt,
    HiOutlineMail,
    HiOutlinePlusCircle,
    HiOutlineGlobeAlt,
} from 'react-icons/hi';
import Navbar from './Navbar';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { avatarUrl } from '../../utils/helpers';

const SELLER_LINKS = [
    { to: '/dashboard', label: 'Dashboard', icon: HiOutlineViewGrid, end: true },
    { to: '/my-properties', label: 'My Listings', icon: HiOutlineClipboardList },
    { to: '/add-property', label: 'Add Property', icon: HiOutlinePlusCircle },
    { to: '/leads', label: 'Leads', icon: HiOutlineChartBar },
    { to: '/chat-messages', label: 'Messages', icon: HiOutlineChatAlt2 },
    { to: '/profile', label: 'Profile', icon: HiOutlineUser },
    { to: '/contact', label: 'Support', icon: HiOutlineSupport },
];

const ADMIN_LINKS = [
    { to: '/admin-dashboard', label: 'Overview', icon: HiOutlineViewGrid, end: true },
    { to: '/admin/users', label: 'Users', icon: HiOutlineUsers },
    { to: '/admin/seller-requests', label: 'Seller Requests', icon: HiOutlineUserCircle },
    { to: '/admin/properties', label: 'Properties', icon: HiOutlineOfficeBuilding },
    { to: '/admin/inquiries', label: 'Inquiries', icon: HiOutlineChatAlt },
    { to: '/admin/contacts', label: 'Contact Inbox', icon: HiOutlineMail },
    { to: '/profile', label: 'Profile', icon: HiOutlineUser },
];

const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
        isActive ? 'bg-primary-light text-primary-dark' : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
    }`;

const SidebarBody = ({ links, onNavigate }) => {
    const { user, logout } = useAuth();

    return (
        <div className="flex flex-col h-full">
            <Logo className="mb-10" onClick={onNavigate} />

            <nav className="space-y-1.5 flex-1 overflow-y-auto scrollbar-hide">
                {links.map(({ to, label, icon: Icon, end }) => (
                    <NavLink key={to} to={to} end={end} onClick={onNavigate} className={linkClass}>
                        <Icon className="text-xl" />
                        {label}
                    </NavLink>
                ))}
                <Link to="/properties" onClick={onNavigate} className={linkClass({ isActive: false })}>
                    <HiOutlineGlobeAlt className="text-xl" />
                    Browse Site
                </Link>
            </nav>

            <div className="mt-4 pt-5 border-t border-gray-100">
                <Link to="/profile" onClick={onNavigate} className="flex items-center gap-3 px-2 mb-3">
                    <img src={avatarUrl(user)} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                    </div>
                </Link>
                <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                    <HiOutlineLogout className="text-xl" />
                    Logout
                </button>
            </div>
        </div>
    );
};

const DashboardLayout = ({ links, children }) => {
    const [open, setOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-50">
            <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-100 px-6 py-8 z-30">
                <SidebarBody links={links} />
            </aside>

            <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <Logo fontSize="1.2rem" iconSize={18} />
                <button type="button" onClick={() => setOpen(true)} aria-label="Open menu">
                    <HiMenu className="text-2xl text-gray-700" />
                </button>
            </div>

            {open && (
                <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
                    <aside className="w-72 h-full bg-white px-6 py-8 relative" onClick={(e) => e.stopPropagation()}>
                        <button type="button" onClick={() => setOpen(false)} className="absolute top-4 right-4 text-gray-500" aria-label="Close menu">
                            <HiX className="text-2xl" />
                        </button>
                        <SidebarBody links={links} onNavigate={() => setOpen(false)} />
                    </aside>
                </div>
            )}

            <main className="lg:ml-64 p-4 sm:p-6 lg:p-10 fade-in">{children}</main>
        </div>
    );
};

export const SellerLayout = ({ children }) => <DashboardLayout links={SELLER_LINKS}>{children}</DashboardLayout>;

export const AdminLayout = ({ children }) => <DashboardLayout links={ADMIN_LINKS}>{children}</DashboardLayout>;

// Role based shell
export const RoleLayout = ({ children, bare = false }) => {
    const { user } = useAuth();

    if (user?.role === 'admin') return <AdminLayout>{children}</AdminLayout>;
    if (user?.role === 'seller') return <SellerLayout>{children}</SellerLayout>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <div className={bare ? 'pt-24' : 'pt-28 pb-16 px-4 sm:px-6'}>{children}</div>
        </div>
    );
};

export default DashboardLayout;
