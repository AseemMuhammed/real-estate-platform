import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineCheckCircle, HiOutlinePencilAlt, HiOutlineTrash } from 'react-icons/hi';
import { SellerLayout } from '../../components/common/DashboardLayout';
import PropertyCard from '../../components/common/PropertyCard';
import useSellerProperties from '../../hooks/useSellerProperties';

const MyProperties = () => {
    const navigate = useNavigate();
    const { properties, loading, error, setStatus, remove } = useSellerProperties();

    return (
        <SellerLayout>
            <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">My Listings</h1>
                    <p className="text-gray-500 mt-1">Manage your listed properties and their status.</p>
                </div>
                <Link
                    to="/add-property"
                    className="bg-teal-700 hover:bg-teal-800 text-white font-bold px-6 py-3 rounded-2xl shadow transition"
                >
                    Add New Listing
                </Link>
            </div>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            {loading ? (
                <p className="py-24 text-center text-gray-500">Loading your listings...</p>
            ) : properties.length === 0 ? (
                <div className="py-24 text-center text-gray-500">
                    You have no listings yet.{' '}
                    <Link to="/add-property" className="text-teal-700 font-semibold underline">
                        Add your first property
                    </Link>
                </div>
            ) : (
                <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {properties.map((p) => (
                        <PropertyCard key={p._id} property={p}>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <select
                                        value={p.status === 'sold' ? 'sold' : 'available'}
                                        onChange={(e) => setStatus(p._id, e.target.value)}
                                        className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-teal-700 bg-white focus:outline-none focus:border-teal-600"
                                    >
                                        <option value="available">Available</option>
                                        <option value="sold">Sold</option>
                                    </select>
                                    <HiOutlineCheckCircle className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                </div>
                                <button
                                    onClick={() => navigate(`/edit-property/${p._id}`)}
                                    className="flex items-center gap-1.5 text-sm font-semibold text-gray-800 hover:text-teal-700"
                                >
                                    <HiOutlinePencilAlt /> Edit
                                </button>
                                <button
                                    onClick={() => remove(p._id)}
                                    aria-label="Delete property"
                                    className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center"
                                >
                                    <HiOutlineTrash />
                                </button>
                            </div>
                        </PropertyCard>
                    ))}
                </div>
            )}
        </SellerLayout>
    );
};

export default MyProperties;
