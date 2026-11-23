import React, { useEffect, useState } from 'react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineClock, HiOutlineTrash, HiOutlineCheck } from 'react-icons/hi';
import { AdminLayout } from '../../components/common/DashboardLayout';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, formatDateTime, unwrapList } from '../../utils/helpers';

const ROLE_STYLES = {
    guest: { badge: 'bg-gray-100 text-gray-600', avatar: 'bg-gray-100 text-gray-600' },
    admin: { badge: 'bg-amber-100 text-amber-700', avatar: 'bg-amber-100 text-amber-700' },
    seller: { badge: 'bg-emerald-100 text-emerald-700', avatar: 'bg-emerald-100 text-emerald-700' },
    buyer: { badge: 'bg-blue-100 text-blue-700', avatar: 'bg-blue-100 text-blue-700' },
};

const AdminContacts = () => {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.ADMIN_CONTACTS);
                setContacts(unwrapList(res.data, 'contacts'));
            } catch (err) {
                setError(errMsg(err, 'Failed to load contact requests.'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const markRead = async (id) => {
        try {
            await api.patch(ENDPOINTS.ADMIN_CONTACT_READ(id));
            setContacts((prev) => prev.map((c) => (c._id === id ? { ...c, isRead: true } : c)));
        } catch (err) {
            setError(errMsg(err, 'Could not update the message.'));
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this message?')) return;
        try {
            await api.delete(ENDPOINTS.ADMIN_CONTACT(id));
            setContacts((prev) => prev.filter((c) => c._id !== id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the message.'));
        }
    };

    const unread = contacts.filter((c) => !c.isRead).length;

    return (
        <AdminLayout>
            <h1 className="text-3xl font-extrabold text-gray-900">Contact Requests</h1>
            <p className="text-gray-600 mt-1">Read and manage inquiries from platform users.</p>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            <div className="mt-8 bg-white rounded-3xl shadow-sm overflow-hidden">
                <h2 className="text-xl font-bold text-gray-900 px-8 py-6 border-b border-gray-100">
                    Inbox ({contacts.length}){unread > 0 && <span className="ml-2 text-sm font-semibold text-teal-700">{unread} unread</span>}
                </h2>

                {loading ? (
                    <p className="py-16 text-center text-gray-500">Loading messages...</p>
                ) : contacts.length === 0 ? (
                    <p className="py-16 text-center text-gray-500">Your inbox is empty.</p>
                ) : (
                    <div className="divide-y divide-gray-100">
                        {contacts.map((c) => {
                            const role = c.role || 'guest';
                            const style = ROLE_STYLES[role] || ROLE_STYLES.buyer;
                            return (
                                <div key={c._id} className={`px-8 py-7 ${c.isRead ? '' : 'bg-teal-50/40'}`}>
                                    <div className="flex items-start gap-5">
                                        <span className={`w-12 h-12 shrink-0 rounded-full font-bold text-lg flex items-center justify-center ${style.avatar}`}>
                                            {(c.name || '?')[0].toUpperCase()}
                                        </span>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-3">
                                                <p className="text-lg font-bold text-gray-900">{c.name}</p>
                                                {role && (
                                                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full uppercase ${style.badge}`}>
                                                        {role}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-gray-600">
                                                <span className="flex items-center gap-1.5"><HiOutlineMail />{c.email}</span>
                                                {c.phone && <span className="flex items-center gap-1.5"><HiOutlinePhone />{c.phone}</span>}
                                                <span className="flex items-center gap-1.5"><HiOutlineClock />{formatDateTime(c.createdAt)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="mt-5 bg-gray-50 rounded-2xl px-6 py-5 text-gray-800 whitespace-pre-line">
                                        {c.message}
                                    </p>
                                    <div className="mt-4 flex gap-3 justify-end">
                                        <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:underline">
                                            <HiOutlineMail /> Reply
                                        </a>
                                        {!c.isRead && (
                                            <button onClick={() => markRead(c._id)} className="flex items-center gap-1.5 text-sm font-semibold text-gray-700 hover:text-teal-700">
                                                <HiOutlineCheck /> Mark read
                                            </button>
                                        )}
                                        <button onClick={() => remove(c._id)} className="flex items-center gap-1.5 text-sm font-semibold text-red-500 hover:text-red-700">
                                            <HiOutlineTrash /> Delete
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminContacts;
