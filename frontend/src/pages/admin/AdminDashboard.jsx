import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    HiOutlineUsers,
    HiOutlineOfficeBuilding,
    HiOutlineTicket,
    HiOutlineCheckCircle,
    HiOutlineUserCircle,
    HiOutlineMail,
    HiOutlineChatAlt,
    HiChevronRight,
    HiOutlineRefresh,
} from 'react-icons/hi';
import { AdminLayout } from '../../components/common/DashboardLayout';
import api, { API_URL, ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, tint }) => (
    <div className="bg-white rounded-3xl shadow-sm p-6">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-6 ${tint}`}>
            <Icon className="text-2xl" />
        </div>
        <p className="text-sm text-gray-600">{label}</p>
        <p className="mt-1 text-4xl font-extrabold text-gray-900">{value}</p>
    </div>
);

const HealthRow = ({ label, online }) => (
    <div className="flex items-center justify-between py-3">
        <span className="font-medium text-gray-900">{label}</span>
        <span className={`flex items-center gap-2 text-sm font-bold ${online ? 'text-emerald-600' : 'text-red-500'}`}>
            <span className={`w-2 h-2 rounded-full ${online ? 'bg-emerald-500' : 'bg-red-500'}`} />
            {online ? 'Online' : 'Offline'}
        </span>
    </div>
);

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [health, setHealth] = useState({ api: false, db: false });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load overview
    const load = useCallback(
        () =>
            Promise.allSettled([api.get(ENDPOINTS.ADMIN_STATS), api.get(`${API_URL}/api/health`)]).then(
                ([statsRes, healthRes]) => {
                    if (statsRes.status === 'fulfilled') {
                        setStats(statsRes.value.data.stats);
                        setError('');
                    } else {
                        setError(errMsg(statsRes.reason, 'Failed to load dashboard data.'));
                    }
                    setHealth({ api: healthRes.status === 'fulfilled', db: statsRes.status === 'fulfilled' });
                    setLoading(false);
                }
            ),
        []
    );

    useEffect(() => {
        load();
    }, [load]);

    const v = (n) => (loading ? '…' : n ?? 0);

    const tools = [
        { to: '/admin/seller-requests', label: 'Seller Requests', icon: HiOutlineUserCircle, count: stats?.pendingSellers },
        { to: '/admin/contacts', label: 'Contact Inbox', icon: HiOutlineMail, count: stats?.unreadContacts },
        { to: '/admin/inquiries', label: 'Platform Inquiries', icon: HiOutlineChatAlt, count: stats?.totalInquiries },
        { to: '/admin/users', label: 'Manage Users', icon: HiOutlineUsers },
    ];

    return (
        <AdminLayout>
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Admin Overview</h1>
                    <p className="text-gray-600 mt-1">Welcome back, administrator. Here's today's summary.</p>
                </div>
                <button onClick={() => { setLoading(true); load(); }} className="flex items-center gap-2 font-semibold text-gray-800 hover:text-teal-700">
                    <HiOutlineRefresh className={loading ? 'animate-spin' : ''} /> Refresh Data
                </button>
            </div>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={HiOutlineUsers} label={`Total Users · ${v(stats?.totalBuyers)} buyers / ${v(stats?.totalSellers)} sellers`} value={v(stats?.totalUsers)} tint="bg-teal-100 text-teal-700" />
                <StatCard icon={HiOutlineOfficeBuilding} label="Total Properties" value={v(stats?.totalProperties)} tint="bg-amber-100 text-amber-600" />
                <StatCard icon={HiOutlineTicket} label="Active Listings" value={v(stats?.activeListings)} tint="bg-blue-100 text-blue-600" />
                <StatCard icon={HiOutlineCheckCircle} label="Sold Properties" value={v(stats?.soldProperties)} tint="bg-emerald-100 text-emerald-600" />
            </div>

            <div className="mt-10 grid gap-8 lg:grid-cols-2">
                <div className="bg-white rounded-3xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">System Health</h2>
                    <div className="divide-y divide-gray-50">
                        <HealthRow label="API Server" online={health.api} />
                        <HealthRow label="Database" online={health.db} />
                        <HealthRow label="Auth Service" online={health.db} />
                    </div>
                </div>

                <div className="bg-teal-700 text-white rounded-3xl shadow-lg p-8">
                    <h2 className="text-xl font-bold">Admin Tools</h2>
                    <p className="text-sm opacity-90 mt-2">Quickly manage platform resources and tasks.</p>
                    <div className="mt-6 space-y-3">
                        {tools.map(({ to, label, icon: Icon, count }) => (
                            <Link
                                key={to}
                                to={to}
                                className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 rounded-xl px-5 py-4 font-semibold transition"
                            >
                                <span className="flex items-center gap-3"><Icon className="text-xl" /> {label}</span>
                                <span className="flex items-center gap-2">
                                    {count > 0 && <span className="bg-white text-teal-800 text-xs font-bold px-2.5 py-1 rounded-full">{count}</span>}
                                    <HiChevronRight />
                                </span>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
