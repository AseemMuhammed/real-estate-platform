import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiOutlineCalendar,
    HiOutlineChatAlt2,
    HiOutlineCheck,
    HiOutlineHome,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineTrash,
    HiOutlineUser,
} from 'react-icons/hi';
import { myInquiriesStyles as s } from '../../assets/dummyStyles';
import { SellerLayout } from '../../components/common/DashboardLayout';
import useSocket from '../../hooks/useSocket';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, formatDateTime, formatPrice } from '../../utils/helpers';

const FILTERS = ['all', 'new', 'read'];

const Leads = () => {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load leads
    useEffect(() => {
        api.get(ENDPOINTS.SELLER_INQUIRIES)
            .then((res) => setInquiries(res.data.inquiries || []))
            .catch((err) => setError(errMsg(err, 'Failed to load leads.')))
            .finally(() => setLoading(false));
    }, []);

    useSocket({
        newInquiry: (inquiry) => setInquiries((prev) => (prev.some((q) => q._id === inquiry._id) ? prev : [inquiry, ...prev])),
    });

    const visible = useMemo(() => {
        if (filter === 'new') return inquiries.filter((q) => !q.isRead);
        if (filter === 'read') return inquiries.filter((q) => q.isRead);
        return inquiries;
    }, [inquiries, filter]);

    const unread = inquiries.filter((q) => !q.isRead).length;

    const markRead = async (id) => {
        try {
            await api.patch(ENDPOINTS.INQUIRY_READ(id));
            setInquiries((prev) => prev.map((q) => (q._id === id ? { ...q, isRead: true } : q)));
        } catch (err) {
            setError(errMsg(err, 'Could not update the lead.'));
        }
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this lead?')) return;
        try {
            await api.delete(ENDPOINTS.INQUIRY(id));
            setInquiries((prev) => prev.filter((q) => q._id !== id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the lead.'));
        }
    };

    const openChat = (q) => {
        if (!q.isRead) markRead(q._id);
        navigate(`/chat-messages?buyer=${q.buyer?._id}${q.property ? `&property=${q.property._id}` : ''}`);
    };

    return (
        <SellerLayout>
            <div className="flex items-start justify-between gap-4 flex-wrap mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900">Leads</h1>
                    <p className="text-gray-500 mt-1">
                        Buyers interested in your listings{unread ? ` · ${unread} new` : ''}.
                    </p>
                </div>
                <div className="flex gap-1 bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize ${filter === f ? 'bg-primary text-white' : 'text-gray-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {error && <p className={s.textDangerMb4}>{error}</p>}

            {loading ? (
                <div className="loader-container"><span className="loader" /></div>
            ) : visible.length === 0 ? (
                <div className={s.cardPremiumPy24Px8TextCenter}>
                    <div className={s.iconContainer}><HiOutlineChatAlt2 className="text-3xl" /></div>
                    <h3 className={s.mb4}>No leads {filter !== 'all' ? `(${filter})` : 'yet'}</h3>
                    <p className={s.textMutedMb8}>When buyers send inquiries on your listings, they'll show up here.</p>
                </div>
            ) : (
                <div className={s.flexColGap6}>
                    {visible.map((q) => (
                        <div key={q._id} className={s.inquiryCard}>
                            <div className={s.inquiryMain}>
                                <div className={s.iconWrapper}><HiOutlineHome className={s.iconSize} /></div>
                                <div className={s.flex1}>
                                    <div className={s.titleRow}>
                                        <h3 className={s.titleText}>{q.property?.title || 'Property removed'}</h3>
                                        {q.property && <span className="text-primary font-bold text-sm">{formatPrice(q.property.price)}</span>}
                                        <span className={`${s.badge} ${q.isRead ? s.badgeRead : s.badgeNew}`}>{q.isRead ? 'Read' : 'New'}</span>
                                    </div>
                                    <div className={s.buyerInfo}>
                                        <span className={s.infoItem}><HiOutlineUser className={s.textMutedSmall} /> <span className={s.fontSemibold}>{q.buyer?.name || 'Buyer'}</span></span>
                                        {q.buyer?.email && (
                                            <a href={`mailto:${q.buyer.email}`} className={`${s.infoItem} hover:text-primary`}><HiOutlineMail className={s.textMutedSmall} /> {q.buyer.email}</a>
                                        )}
                                        {q.buyer?.phone && (
                                            <a href={`tel:${q.buyer.phone}`} className={`${s.infoItem} hover:text-primary`}><HiOutlinePhone className={s.textMutedSmall} /> {q.buyer.phone}</a>
                                        )}
                                    </div>
                                    <p className={s.message}>"{q.message}"</p>
                                    <div className={s.meta}>
                                        <span className={s.flexItemsCenterGap2}><HiOutlineCalendar /> {formatDateTime(q.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                            <div className={s.actions}>
                                <button type="button" className={s.btnMessage} onClick={() => openChat(q)}>
                                    <HiOutlineChatAlt2 /> Reply in Chat
                                </button>
                                {!q.isRead && (
                                    <button type="button" className={s.btnOutline} onClick={() => markRead(q._id)}>
                                        <HiOutlineCheck /> Mark Read
                                    </button>
                                )}
                                <button type="button" className={`${s.btnOutline} text-red-500`} onClick={() => remove(q._id)}>
                                    <HiOutlineTrash /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </SellerLayout>
    );
};

export default Leads;
