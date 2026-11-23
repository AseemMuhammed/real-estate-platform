import React, { useEffect, useState } from 'react';
import { HiOutlineCalendar, HiOutlineCheck, HiOutlineMail, HiOutlinePhone, HiOutlineUserCircle, HiOutlineX } from 'react-icons/hi';
import { sellerRequestsStyles as s } from '../../assets/dummyStyles';
import { AdminLayout } from '../../components/common/DashboardLayout';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, formatDate } from '../../utils/helpers';

const AdminSellerRequests = () => {
    const [sellers, setSellers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [busyId, setBusyId] = useState(null);
    const [error, setError] = useState('');
    const [notice, setNotice] = useState('');

    // Load requests
    useEffect(() => {
        api.get(ENDPOINTS.ADMIN_PENDING_SELLERS)
            .then((res) => setSellers(res.data.sellers || []))
            .catch((err) => setError(errMsg(err, 'Failed to load seller requests.')))
            .finally(() => setLoading(false));
    }, []);

    const act = async (seller, approve) => {
        if (!approve && !window.confirm(`Reject and remove ${seller.name}'s request?`)) return;
        try {
            setBusyId(seller._id);
            const res = approve
                ? await api.patch(ENDPOINTS.ADMIN_APPROVE_SELLER(seller._id))
                : await api.delete(ENDPOINTS.ADMIN_REJECT_SELLER(seller._id));
            setSellers((prev) => prev.filter((x) => x._id !== seller._id));
            setNotice(res.data.message);
            setError('');
        } catch (err) {
            setError(errMsg(err, 'Action failed.'));
        } finally {
            setBusyId(null);
        }
    };

    return (
        <AdminLayout>
            <div className={s.headerContainer}>
                <h1 className={s.pageTitle}>Seller Requests</h1>
                <p className={s.pageSubtitle}>Approve new sellers before they can sign in and list properties.</p>
            </div>

            {error && <p className="mb-6 text-sm text-red-500">{error}</p>}
            {notice && <p className="mb-6 text-sm font-semibold text-teal-700">{notice}</p>}

            <div className={s.card}>
                <div className={s.cardInner}>
                    <h2 className={s.sectionTitle}>Pending ({sellers.length})</h2>

                    {loading ? (
                        <div className="loader-container"><span className="loader" /></div>
                    ) : sellers.length === 0 ? (
                        <div className={s.emptyState}>
                            <HiOutlineUserCircle size={64} className={s.emptyStateIcon} />
                            <p>No pending seller requests. You're all caught up!</p>
                        </div>
                    ) : (
                        <div className={s.requestGrid}>
                            {sellers.map((seller) => (
                                <div key={seller._id} className={s.requestCard}>
                                    <div className={s.requestHeader}>
                                        <div className={s.avatar}>{(seller.name || '?')[0].toUpperCase()}</div>
                                        <div>
                                            <p className={s.requestName}>{seller.name}</p>
                                            <p className={s.requestDate}><HiOutlineCalendar /> Requested {formatDate(seller.createdAt)}</p>
                                        </div>
                                    </div>
                                    <div className={s.contactInfo}>
                                        <span className={s.contactItem}><HiOutlineMail className="text-primary" /> {seller.email}</span>
                                        <span className={s.contactItem}><HiOutlinePhone className="text-primary" /> {seller.phone || 'No phone added'}</span>
                                    </div>
                                    <div className="grid grid-cols-[1fr_auto] gap-3">
                                        <button type="button" disabled={busyId === seller._id} onClick={() => act(seller, true)} className={`${s.approveButton} disabled:opacity-60`}>
                                            <HiOutlineCheck /> Approve Seller
                                        </button>
                                        <button
                                            type="button"
                                            disabled={busyId === seller._id}
                                            onClick={() => act(seller, false)}
                                            className="px-4 rounded-xl bg-red-50 text-red-500 hover:bg-red-100 font-bold flex items-center gap-1"
                                        >
                                            <HiOutlineX /> Reject
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminSellerRequests;
