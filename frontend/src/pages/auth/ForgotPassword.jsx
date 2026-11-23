import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPasswordStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [devLink, setDevLink] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmed = email.trim();

        if (!trimmed) {
            setError('Please enter your email address.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setSuccess('');
            const res = await api.post(ENDPOINTS.FORGOT_PASSWORD, { email: trimmed });
            setSuccess(res.data.message);
            setDevLink(res.data.resetUrl ? new URL(res.data.resetUrl).pathname : '');
            setEmail('');
        } catch (err) {
            setError(errMsg(err, 'Could not send the reset link. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.container}>
            <Navbar />

            <div className={s.centerWrapper}>
                <div className={s.formCard}>
                    <h2 className={s.title}>Forgot Password</h2>
                    <p className={s.subtitle}>Enter your email address to receive a password reset link</p>

                    {error && <div className={s.errorMessage}>{error}</div>}
                    {success && (
                        <div className={s.successMessage}>
                            {success}
                            {devLink && (
                                <span className="block mt-2">
                                    Email is not configured, so here is your link:{' '}
                                    <Link to={devLink} className={s.link}>Reset password now</Link>
                                </span>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label htmlFor="email" className={s.label}>Email Address</label>
                            <input
                                id="email" type="email" value={email} placeholder="name@company.com"
                                autoComplete="email" className={s.input}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    if (error) setError('');
                                }}
                            />
                        </div>

                        <button type="submit" disabled={loading} className={s.submitButton}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Remembered your password?{' '}
                        <Link to="/login" className={s.link}>Back to Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
