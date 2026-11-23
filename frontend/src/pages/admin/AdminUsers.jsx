import React, { useEffect, useMemo, useState } from 'react';
import {
    HiOutlineFilter,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineLockClosed,
    HiOutlineLockOpen,
    HiOutlineTrash,
} from 'react-icons/hi';
import { AdminLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, shortId, unwrapList } from '../../utils/helpers';

const ROLE_STYLES = {
    admin: 'bg-amber-100 text-amber-700',
    buyer: 'bg-blue-100 text-blue-700',
    seller: 'bg-emerald-100 text-emerald-700',
};

const AdminUsers = () => {
    const { user: me } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [showFilter, setShowFilter] = useState(false);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.ADMIN_USERS);
                setUsers(unwrapList(res.data, 'users'));
            } catch (err) {
                setError(errMsg(err, 'Failed to load users.'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const visible = useMemo(() => {
        const q = search.trim().toLowerCase();
        return users
            .filter((u) => filter === 'all' || u.role === filter)
            .filter((u) => !q || `${u.name} ${u.email}`.toLowerCase().includes(q));
    }, [users, filter, search]);

    const toggleBlock = async (u) => {
        try {
            await api.patch(ENDPOINTS.ADMIN_USER_BLOCK(u._id));
            setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isBlocked: !x.isBlocked } : x)));
        } catch (err) {
            setError(errMsg(err, 'Could not update the user.'));
        }
    };

    const removeUser = async (u) => {
        if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
        try {
            await api.delete(ENDPOINTS.ADMIN_USER(u._id));
            setUsers((prev) => prev.filter((x) => x._id !== u._id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the user.'));
        }
    };

    return (
        <AdminLayout>
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">User Management</h1>
                    <p className="text-gray-600 mt-1">Monitor platform users and access levels.</p>
                </div>

                <div className="relative">
                    <button
                        onClick={() => setShowFilter((s) => !s)}
                        className="flex items-center gap-2 bg-white border border-gray-200 rounded-xl px-5 py-3 font-semibold shadow-sm"
                    >
                        <HiOutlineFilter /> {filter === 'all' ? 'Filter' : filter}
                    </button>
                    {showFilter && (
                        <div className="absolute right-0 mt-2 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-10 overflow-hidden">
                            {['all', 'admin', 'buyer', 'seller'].map((r) => (
                                <button
                                    key={r}
                                    onClick={() => {
                                        setFilter(r);
                                        setShowFilter(false);
                                    }}
                                    className={`block w-full text-left px-4 py-2.5 text-sm capitalize hover:bg-gray-50 ${filter === r ? 'text-teal-700 font-bold' : 'text-gray-700'}`}
                                >
                                    {r === 'all' ? 'All roles' : r}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            <div className="mt-8 bg-white rounded-3xl shadow-sm overflow-hidden">
                <div className="flex items-center justify-between gap-4 flex-wrap px-8 py-6">
                    <h2 className="text-xl font-bold text-gray-900">Platform Users</h2>
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search name or email..."
                        className="flex-1 min-w-[200px] max-w-sm px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-teal-600"
                    />
                    <span className="text-sm font-semibold text-gray-700">Showing {visible.length} users</span>
                </div>

                {loading ? (
                    <p className="py-16 text-center text-gray-500">Loading users...</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[760px]">
                            <thead className="bg-gray-50 text-xs tracking-wider text-gray-500 uppercase">
                                <tr>
                                    <th className="px-8 py-4 font-semibold">User Info</th>
                                    <th className="px-4 py-4 font-semibold">Role</th>
                                    <th className="px-4 py-4 font-semibold">Contact Details</th>
                                    <th className="px-4 py-4 font-semibold text-center">Account Status</th>
                                    <th className="px-8 py-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {visible.map((u) => {
                                    const protectedUser = u.role === 'admin' || u._id === (me?._id || me?.id);
                                    const pending = u.role === 'seller' && !u.isApproved;
                                    return (
                                        <tr key={u._id} className="hover:bg-gray-50/60">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-11 h-11 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center">
                                                        {(u.name || '?')[0].toUpperCase()}
                                                    </span>
                                                    <div>
                                                        <p className="font-bold text-gray-900">{u.name}</p>
                                                        <p className="text-xs text-gray-500">ID: {shortId(u._id)}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-5">
                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full uppercase ${ROLE_STYLES[u.role] || 'bg-gray-100 text-gray-600'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-4 py-5 text-sm text-gray-700 space-y-1">
                                                <p className="flex items-center gap-2"><HiOutlineMail className="text-gray-400" />{u.email}</p>
                                                {u.phone && <p className="flex items-center gap-2"><HiOutlinePhone className="text-gray-400" />{u.phone}</p>}
                                            </td>
                                            <td className="px-4 py-5 text-center">
                                                <span className={`inline-flex items-center gap-1.5 text-sm font-bold px-4 py-1.5 rounded-lg ${u.isBlocked ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                                                    {u.isBlocked ? <HiOutlineLockClosed /> : <HiOutlineLockOpen />}
                                                    {u.isBlocked ? 'Blocked' : 'Active'}
                                                </span>
                                                {pending && <p className="mt-1 text-[11px] font-bold text-amber-600 uppercase">Pending approval</p>}
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex items-center justify-end gap-2">
                                                    <button
                                                        disabled={protectedUser}
                                                        onClick={() => toggleBlock(u)}
                                                        title={u.isBlocked ? 'Unblock user' : 'Block user'}
                                                        className="w-9 h-9 rounded-lg border border-gray-100 text-amber-500 hover:bg-amber-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        {u.isBlocked ? <HiOutlineLockOpen /> : <HiOutlineLockClosed />}
                                                    </button>
                                                    <button
                                                        disabled={protectedUser}
                                                        onClick={() => removeUser(u)}
                                                        title="Delete user"
                                                        className="w-9 h-9 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                                                    >
                                                        <HiOutlineTrash />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminUsers;
