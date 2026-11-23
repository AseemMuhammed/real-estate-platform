import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    HiPlus,
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineUserGroup,
    HiOutlineOfficeBuilding,
    HiOutlineCheckCircle,
    HiOutlinePencilAlt,
    HiOutlineTrash,
} from 'react-icons/hi';
import { SellerLayout } from '../../components/common/DashboardLayout';
import PropertyCard from '../../components/common/PropertyCard';
import useSellerProperties from '../../hooks/useSellerProperties';
import api, { ENDPOINTS } from '../../api/endpoints';

const StatCard = ({ icon: Icon, label, value }) => (
    <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center mb-6">
            <Icon className="text-xl text-gray-700" />
        </div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-extrabold text-gray-900">{value}</p>
    </div>
);

const SellerDashboard = () => {
    const navigate = useNavigate();
    const { properties, loading, error, setStatus, remove } = useSellerProperties();

    const [leads, setLeads] = useState({ total: 0, unread: 0 });
    const [query, setQuery] = useState('');

    // Lead stats
    useEffect(() => {
        api.get(ENDPOINTS.SELLER_DASHBOARD)
            .then((res) => setLeads({ total: res.data.stats.totalInquiries, unread: res.data.stats.unreadInquiries }))
            .catch(() => setLeads({ total: 0, unread: 0 }));
    }, []);

    const stats = useMemo(
        () => ({
            views: properties.reduce((sum, p) => sum + (p.views || 0), 0),
            live: properties.filter((p) => p.status !== 'sold').length,
            sold: properties.filter((p) => p.status === 'sold').length,
        }),
        [properties]
    );

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return properties;
        return properties.filter((p) =>
            [p.title, p.city, p.area].filter(Boolean).join(' ').toLowerCase().includes(q)
        );
    }, [properties, query]);

    return (
        <SellerLayout>
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Seller Dashboard</h1>
                    <p className="text-gray-500 mt-1">Manage your property portfolio and track performance.</p>
                </div>
                <Link
                    to="/add-property"
                    className="flex items-center gap-2 bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-2xl shadow transition"
                >
                    <HiPlus /> Add New
                </Link>
            </div>

            {/* Stats */}
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={HiOutlineEye} label="Total Views" value={stats.views} />
                <StatCard icon={HiOutlineUserGroup} label={`Leads${leads.unread ? ` · ${leads.unread} new` : ''}`} value={leads.total} />
                <StatCard icon={HiOutlineOfficeBuilding} label="Live Listings" value={stats.live} />
                <StatCard icon={HiOutlineCheckCircle} label="Properties Sold" value={stats.sold} />
            </div>

            {/* Listings */}
            <div className="mt-12 flex items-center justify-between gap-4 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">Property Listings</h2>
                <div className="relative w-full sm:w-80">
                    <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search listings..."
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-teal-600"
                    />
                </div>
            </div>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            {loading ? (
                <p className="py-20 text-center text-gray-500">Loading your listings...</p>
            ) : filtered.length === 0 ? (
                <p className="py-20 text-center text-gray-500">
                    {properties.length === 0 ? 'You have not listed any property yet.' : 'No listings match your search.'}
                </p>
            ) : (
                <div className="mt-6 grid gap-6 md:grid-cols-2 2xl:grid-cols-3">
                    {filtered.map((p) => {
                        const sold = p.status === 'sold';
                        return (
                            <PropertyCard key={p._id} property={p}>
                                <div className="grid grid-cols-3 text-sm font-semibold">
                                    <button
                                        onClick={() => setStatus(p._id, sold ? 'available' : 'sold')}
                                        className="flex items-center justify-center gap-1.5 text-gray-500 hover:text-teal-700"
                                    >
                                        <HiOutlineCheckCircle /> {sold ? 'Available' : 'Sold'}
                                    </button>
                                    <button
                                        onClick={() => navigate(`/edit-property/${p._id}`)}
                                        className="flex items-center justify-center gap-1.5 text-gray-800 hover:text-teal-700"
                                    >
                                        <HiOutlinePencilAlt /> Edit
                                    </button>
                                    <button
                                        onClick={() => remove(p._id)}
                                        className="flex items-center justify-center gap-1.5 text-red-500 hover:text-red-700"
                                    >
                                        <HiOutlineTrash /> Delete
                                    </button>
                                </div>
                            </PropertyCard>
                        );
                    })}
                </div>
            )}
        </SellerLayout>
    );
};

export default SellerDashboard;
