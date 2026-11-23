import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineExternalLink, HiOutlineTrash, HiShieldCheck } from 'react-icons/hi';
import { AdminLayout } from '../../components/common/DashboardLayout';
import PropertyCard from '../../components/common/PropertyCard';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, unwrapList } from '../../utils/helpers';

const AdminProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.ADMIN_PROPERTIES);
                setProperties(unwrapList(res.data, 'properties'));
            } catch (err) {
                setError(errMsg(err, 'Failed to load properties.'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const toggleVerify = async (id) => {
        try {
            const res = await api.patch(ENDPOINTS.ADMIN_PROPERTY_VERIFY(id));
            setProperties((prev) => prev.map((p) => (p._id === id ? { ...p, isVerified: res.data.isVerified } : p)));
        } catch (err) {
            setError(errMsg(err, 'Could not update verification.'));
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Remove this listing from the platform?')) return;
        try {
            await api.delete(ENDPOINTS.ADMIN_PROPERTY(id));
            setProperties((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the property.'));
        }
    };

    return (
        <AdminLayout>
            <h1 className="text-3xl font-extrabold text-gray-900">Property Moderation</h1>
            <p className="text-gray-600 mt-1">Review and manage all property listings across the platform.</p>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            {loading ? (
                <p className="py-24 text-center text-gray-500">Loading properties...</p>
            ) : properties.length === 0 ? (
                <p className="py-24 text-center text-gray-500">No properties have been listed yet.</p>
            ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {properties.map((p) => {
                        const seller = p.seller || {};
                        return (
                            <PropertyCard key={p._id} property={p} showStatus>
                                <div className="flex items-end justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-xs font-bold text-gray-700">Seller: {seller.name || 'Unknown'}</p>
                                        <p className="text-[11px] text-gray-400 truncate">{seller.email}</p>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => toggleVerify(p._id)}
                                            title={p.isVerified ? 'Remove verification' : 'Mark as verified'}
                                            className={`w-9 h-9 rounded-lg flex items-center justify-center ${p.isVerified ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500 hover:text-teal-700'}`}
                                        >
                                            <HiShieldCheck />
                                        </button>
                                        <Link to={`/property/${p._id}`} target="_blank" aria-label="Open listing" className="text-gray-500 hover:text-teal-700">
                                            <HiOutlineExternalLink className="text-lg" />
                                        </Link>
                                        <button
                                            onClick={() => remove(p._id)}
                                            aria-label="Delete listing"
                                            className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                                        >
                                            <HiOutlineTrash />
                                        </button>
                                    </div>
                                </div>
                            </PropertyCard>
                        );
                    })}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminProperties;
