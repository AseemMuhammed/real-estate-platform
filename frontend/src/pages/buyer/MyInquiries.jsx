import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiOutlineCalendar, HiOutlineChatAlt2, HiOutlineHome, HiOutlineMail, HiOutlineTrash, HiOutlineUser } from 'react-icons/hi';
import { myInquiriesStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, formatDateTime, formatPrice } from '../../utils/helpers';

const MyInquiries = () => {
    const navigate = useNavigate();
    const [inquiries, setInquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load inquiries
    useEffect(() => {
        api.get(ENDPOINTS.MY_INQUIRIES)
            .then((res) => setInquiries(res.data.inquiries || []))
            .catch((err) => setError(errMsg(err, 'Failed to load your inquiries.')))
            .finally(() => setLoading(false));
    }, []);

    const remove = async (id) => {
        if (!window.confirm('Delete this inquiry?')) return;
        try {
            await api.delete(ENDPOINTS.INQUIRY(id));
            setInquiries((prev) => prev.filter((q) => q._id !== id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the inquiry.'));
        }
    };

    return (
        <div className={`${s.bgBgAltMinH} pt-28`}>
            <Navbar />

            <div className={`${s.containerFadeIn} ${s.py12Pt12}`}>
                <div className={s.mb12}>
                    <h1 className={s.heading}>My Inquiries</h1>
                    <p className={s.textMuted}>Track the messages you've sent to property sellers.</p>
                </div>

                {error && <p className={s.textDangerMb4}>{error}</p>}

                {loading ? (
                    <div className="loader-container"><span className="loader" /></div>
                ) : inquiries.length === 0 ? (
                    <div className={s.cardPremiumPy24Px8TextCenter}>
                        <div className={s.iconContainer}><HiOutlineChatAlt2 className="text-3xl" /></div>
                        <h3 className={s.mb4}>No inquiries yet</h3>
                        <p className={s.textMutedMb8}>Find a property you love and send the seller a message.</p>
                        <Link to="/properties" className={s.btnPrimary}>Browse Properties</Link>
                    </div>
                ) : (
                    <div className={s.flexColGap6}>
                        {inquiries.map((q) => (
                            <div key={q._id} className={s.inquiryCard}>
                                <div className={s.inquiryMain}>
                                    <div className={s.iconWrapper}><HiOutlineHome className={s.iconSize} /></div>
                                    <div className={s.flex1}>
                                        <div className={s.titleRow}>
                                            <h3 className={s.titleText}>{q.property?.title || 'Property removed'}</h3>
                                            {q.property && <span className="text-primary font-bold text-sm">{formatPrice(q.property.price)}</span>}
                                            <span className={`${s.badge} ${q.isRead ? s.badgeRead : s.badgeNew}`}>{q.isRead ? 'Seen' : 'Sent'}</span>
                                        </div>
                                        <div className={s.buyerInfo}>
                                            <span className={s.infoItem}><HiOutlineUser className={s.textMutedSmall} /> <span className={s.fontSemibold}>{q.seller?.name}</span></span>
                                            <span className={s.infoItem}><HiOutlineMail className={s.textMutedSmall} /> {q.seller?.email}</span>
                                        </div>
                                        <p className={s.message}>"{q.message}"</p>
                                        <div className={s.meta}>
                                            <span className={s.flexItemsCenterGap2}><HiOutlineCalendar /> {formatDateTime(q.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className={s.actions}>
                                    {q.property && (
                                        <button type="button" className={s.btnOutline} onClick={() => navigate(`/property/${q.property._id}`)}>
                                            <HiOutlineHome /> View
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className={s.btnMessage}
                                        onClick={() => navigate(`/chat-messages?seller=${q.seller?._id}${q.property ? `&property=${q.property._id}` : ''}`)}
                                    >
                                        <HiOutlineChatAlt2 /> Chat
                                    </button>
                                    <button type="button" className={`${s.btnOutline} text-red-500`} onClick={() => remove(q._id)}>
                                        <HiOutlineTrash /> Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyInquiries;
