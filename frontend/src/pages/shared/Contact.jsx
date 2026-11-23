import React, { useState } from 'react';
import { HiOutlineMail, HiOutlinePhone, HiOutlineUser, HiOutlineChatAlt, HiCheckCircle } from 'react-icons/hi';
import { contactStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const Contact = () => {
    const { user } = useAuth();

    const [form, setForm] = useState(() => ({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        message: '',
    }));
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
            setError('Name, email and message are required.');
            return;
        }

        try {
            setSending(true);
            await api.post(ENDPOINTS.CONTACT, form);
            setSent(true);
        } catch (err) {
            setError(errMsg(err, 'Could not send your message. Please try again.'));
        } finally {
            setSending(false);
        }
    };

    return (
        <div className={s.container}>
            <Navbar />

            <div className={s.mainContainer}>
                <div className={s.header}>
                    <h1 className={s.heading}>Get In Touch</h1>
                    <p className={s.subheading}>
                        Have questions or feedback? We'd love to hear from you. Our team is here to help you with anything you need.
                    </p>
                </div>

                <div className={s.grid}>
                    <div className={s.contactInfoContainer}>
                        <div className={s.contactInfoCard}>
                            <div className={`${s.contactItem} ${s.contactItemMarginBottom}`}>
                                <div className={s.contactIconWrapper}><HiOutlineMail className="text-xl" /></div>
                                <div>
                                    <h4 className={s.contactTitle}>Email Us</h4>
                                    <p className={s.contactDetail}>support@realestate.com</p>
                                </div>
                            </div>
                            <div className={s.contactItem}>
                                <div className={s.contactIconWrapperAlt}><HiOutlinePhone className="text-xl" /></div>
                                <div>
                                    <h4 className={s.contactTitle}>Call Us</h4>
                                    <p className={s.contactDetail}>+971 50 123 4567</p>
                                </div>
                            </div>
                        </div>

                        <div className={s.quickSupportCard}>
                            <h3 className={s.quickSupportTitle}>Quick Support</h3>
                            <p className={s.quickSupportText}>
                                Available 24/7 for our premium members. Your satisfaction is our priority.
                            </p>
                        </div>
                    </div>

                    <div className={s.formCard}>
                        {sent ? (
                            <div className={s.successContainer}>
                                <HiCheckCircle className={`${s.successIcon} text-6xl`} />
                                <h3 className={s.successTitle}>Message Sent!</h3>
                                <p className={s.successMessage}>Thank you for reaching out. We'll get back to you soon.</p>
                                <button
                                    type="button" className={s.successButton}
                                    onClick={() => { setSent(false); setForm((f) => ({ ...f, message: '' })); }}
                                >
                                    Send Another Message
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className={s.form}>
                                <div className={s.formTwoColGrid}>
                                    <div className={s.inputGroup}>
                                        <label htmlFor="name" className={s.label}>
                                            <HiOutlineUser className="inline mr-1" /> Name
                                        </label>
                                        <input id="name" name="name" value={form.name} onChange={handleChange} className={s.input} />
                                    </div>
                                    <div className={s.inputGroup}>
                                        <label htmlFor="email" className={s.label}>
                                            <HiOutlineMail className="inline mr-1" /> Email
                                        </label>
                                        <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={s.input} />
                                    </div>
                                </div>

                                <div className={s.inputGroup}>
                                    <label htmlFor="phone" className={s.label}>
                                        <HiOutlinePhone className="inline mr-1" /> Phone
                                    </label>
                                    <input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+971 50 123 4567" className={s.input} />
                                </div>

                                <div className={s.inputGroup}>
                                    <label htmlFor="message" className={s.label}>
                                        <HiOutlineChatAlt className="inline mr-1" /> Message
                                    </label>
                                    <textarea
                                        id="message" name="message" rows={6} value={form.message} onChange={handleChange}
                                        placeholder="Tell us how we can help..." className={`${s.input} ${s.textarea}`}
                                    />
                                </div>

                                {error && <div className={s.errorMessage}>{error}</div>}

                                <button type="submit" disabled={sending} className={s.submitButton}>
                                    {sending ? 'Sending...' : 'Send Message'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Contact;
