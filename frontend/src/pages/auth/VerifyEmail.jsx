import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { verifyEmailStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const VerifyEmail = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const email = location.state?.email || sessionStorage.getItem('pendingVerifyEmail') || '';

    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [info, setInfo] = useState(location.state?.notice || '');
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (!email) navigate('/register', { replace: true });
    }, [email, navigate]);

    useEffect(() => {
        if (cooldown <= 0) return undefined;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleVerify = async (e) => {
        e.preventDefault();

        if (code.length !== 6) {
            setError('Please enter the 6-digit code.');
            return;
        }

        try {
            setLoading(true);
            setError('');
            const res = await api.post(ENDPOINTS.VERIFY_EMAIL, { email, code });
            sessionStorage.removeItem('pendingVerifyEmail');
            navigate('/login', { replace: true, state: { email, notice: res.data.message } });
        } catch (err) {
            setError(errMsg(err, 'Invalid or expired code. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (cooldown > 0) return;
        try {
            setError('');
            const res = await api.post(ENDPOINTS.RESEND_CODE, { email });
            setInfo(res.data.message);
            setCooldown(30);
        } catch (err) {
            setError(errMsg(err, 'Could not resend the code.'));
        }
    };

    return (
        <div className={s.pageContainer}>
            <Navbar />

            <div className={s.containerCenter}>
                <div className={s.card}>
                    <h2 className={s.title}>Verify Your Email</h2>
                    <p className={s.subtitle}>
                        Enter the 6-digit code sent to <span className="font-semibold text-text-main">{email}</span>
                    </p>

                    {error && <div className={s.errorAlert}>{error}</div>}
                    {info && !error && <div className={s.successAlert}>{info}</div>}

                    <form onSubmit={handleVerify} className={s.form}>
                        <div>
                            <label htmlFor="code" className={s.label}>Verification Code</label>
                            <input
                                id="code" type="text" inputMode="numeric" autoComplete="one-time-code"
                                maxLength={6} value={code} placeholder="000000" className={s.codeInput}
                                onChange={(e) => {
                                    setCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                    if (error) setError('');
                                }}
                            />
                        </div>

                        <button type="submit" disabled={loading} className={s.submitButton}>
                            {loading ? 'Verifying...' : 'Verify Email'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-text-muted text-sm">
                        Didn't get the code?{' '}
                        <button
                            type="button" onClick={handleResend} disabled={cooldown > 0}
                            className="text-primary font-semibold hover:underline disabled:opacity-50"
                        >
                            {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend'}
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;
