import React, { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { resetPasswordStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const PasswordField = ({ id, label, value, onChange }) => {
    const [show, setShow] = useState(false);
    return (
        <div>
            <label htmlFor={id} className={s.label}>{label}</label>
            <div className="relative">
                <input
                    id={id} type={show ? 'text' : 'password'} value={value} onChange={onChange}
                    placeholder="••••••" autoComplete="new-password" className={`${s.input} pr-12`}
                />
                <button
                    type="button" onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'Hide password' : 'Show password'}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                >
                    {show ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                </button>
            </div>
        </div>
    );
};

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password || !confirm) return setError('Please fill in both fields.');
        if (password.length < 6) return setError('Password must be at least 6 characters.');
        if (password !== confirm) return setError('Passwords do not match.');

        try {
            setLoading(true);
            setError('');
            const res = await api.post(ENDPOINTS.RESET_PASSWORD(token), { password });
            setSuccess(res.data.message);
            setTimeout(() => navigate('/login', { replace: true, state: { notice: 'Password updated. Please sign in.' } }), 1800);
        } catch (err) {
            setError(errMsg(err, 'This reset link is invalid or has expired. Please request a new one.'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={s.container}>
            <Navbar />

            <div className={s.centerWrapper}>
                <div className={s.formCard}>
                    <h2 className={s.title}>Reset Password</h2>
                    <p className={s.subtitle}>Create a new password for your account</p>

                    {error && (
                        <div className={s.errorMessage}>
                            {error}{' '}
                            {error.toLowerCase().includes('expired') && (
                                <Link to="/forgot-password" className={s.link}>Request new link</Link>
                            )}
                        </div>
                    )}
                    {success && <div className={s.successMessage}>{success}</div>}

                    <form onSubmit={handleSubmit} className={s.form}>
                        <PasswordField
                            id="password" label="New Password" value={password}
                            onChange={(e) => { setPassword(e.target.value); if (error) setError(''); }}
                        />
                        <PasswordField
                            id="confirm" label="Confirm New Password" value={confirm}
                            onChange={(e) => { setConfirm(e.target.value); if (error) setError(''); }}
                        />

                        <button type="submit" disabled={loading || !!success} className={s.submitButton}>
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Back to <Link to="/login" className={s.link}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
