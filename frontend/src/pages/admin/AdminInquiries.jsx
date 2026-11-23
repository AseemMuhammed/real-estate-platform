import React, { useEffect, useState } from 'react';
import { HiOutlineCalendar, HiOutlineChatAlt, HiOutlineHome } from 'react-icons/hi';
import { AdminLayout } from '../../components/common/DashboardLayout';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, formatDate, unwrapList } from '../../utils/helpers';

const PartyBox = ({ title, person }) => (
    <div className="bg-gray-50 rounded-2xl p-5 min-h-[104px]">
        <p className="text-xs font-bold tracking-wider text-gray-600 uppercase">{title}</p>
        {person?.name && (
            <>
                <p className="mt-2 text-lg font-bold text-gray-900">{person.name}</p>
                <p className="text-sm text-gray-600">{person.email}</p>
            </>
        )}
    </div>
);

const AdminInquiries = () => {
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.ADMIN_INQUIRIES);
                setInquiries(unwrapList(res.data, 'inquiries'));
            } catch (err) {
                setError(errMsg(err, 'Failed to load inquiries.'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    return (
        <AdminLayout>
            <h1 className="text-3xl font-extrabold text-gray-900">Platform Inquiries</h1>
            <p className="text-gray-600 mt-1">Review communication between buyers and sellers.</p>

            {error && <p className="mt-6 text-sm text-red-500">{error}</p>}

            {loading ? (
                <p className="py-24 text-center text-gray-500">Loading inquiries...</p>
            ) : inquiries.length === 0 ? (
                <p className="py-24 text-center text-gray-500">No inquiries yet.</p>
            ) : (
                <div className="mt-8 space-y-8">
                    {inquiries.map((q) => (
                        <div key={q._id} className="bg-white rounded-3xl shadow-sm p-8">
                            <div className="flex items-start justify-between gap-4 pb-5 border-b border-gray-100">
                                <div className="flex items-center gap-4">
                                    <span className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                                        <HiOutlineHome className="text-2xl" />
                                    </span>
                                    <div>
                                        <p className="font-bold text-gray-900">{q.property?.title || 'Unknown Property'}</p>
                                        <p className="text-xs text-gray-600">Property ID: {q.property?._id || ''}</p>
                                    </div>
                                </div>
                                <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                    <HiOutlineCalendar /> {formatDate(q.createdAt)}
                                </span>
                            </div>

                            <div className="mt-6 grid gap-5 md:grid-cols-2">
                                <PartyBox title="Buyer Details" person={q.buyer} />
                                <PartyBox title="Seller Details" person={q.seller} />
                            </div>

                            <div className="mt-6 border-l-4 border-teal-600 pl-5 py-2">
                                <p className="flex items-center gap-2 text-sm font-bold text-teal-700 uppercase">
                                    <HiOutlineChatAlt /> Message
                                </p>
                                <p className="mt-2 italic text-gray-800">"{q.message}"</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminInquiries;
