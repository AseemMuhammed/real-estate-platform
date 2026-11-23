import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { loginStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';
import { HOME_BY_ROLE } from '../../utils/helpers';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const [form, setForm] = useState({ email: location.state?.email || '', password: '' });
    const [remember, setRemember] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const notice = location.state?.notice;

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const email = form.email.trim();

        if (!email || !form.password) {
            setError('Please enter your email and password.');
            return;
        }

        setLoading(true);
        setError('');
        const result = await login(email, form.password, remember);
        setLoading(false);

        if (!result.success) {
            if (result.code === 'EMAIL_NOT_VERIFIED') {
                sessionStorage.setItem('pendingVerifyEmail', email);
                navigate('/verify-email', { state: { email } });
                return;
            }
            setError(result.message);
            return;
        }

        const from = location.state?.from;
        const home = HOME_BY_ROLE[result.user.role] || '/';
        navigate(from && result.user.role === 'buyer' ? from : home, { replace: true });
    };

    return (
        <div className={s.pageContainer}>
            <Navbar />

            <div className={s.containerCenter}>
                <div className={s.card}>
                    <h2 className={s.title}>Welcome Back</h2>
                    <p className={s.subtitle}>Please enter your details to sign in</p>

                    {notice && !error && (
                        <div className="p-4 rounded-xl bg-primary-light text-primary-dark text-sm font-medium mb-6">{notice}</div>
                    )}
                    {error && <div className={s.errorAlert}>{error}</div>}

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label htmlFor="email" className={s.label}>Email Address</label>
                            <input
                                id="email" name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="name@company.com" autoComplete="email" className={s.input}
                            />
                        </div>

                        <div>
                            <div className={s.passwordHeader}>
                                <label htmlFor="password" className={s.label.replace('mb-2', 'mb-0')}>Password</label>
                                <Link to="/forgot-password" className={s.forgotLink}>Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                                    value={form.password} onChange={handleChange} placeholder="••••••"
                                    autoComplete="current-password" className={`${s.input} pr-12`}
                                />
                                <button
                                    type="button" onClick={() => setShowPassword((v) => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted"
                                >
                                    {showPassword ? <HiEyeOff className="text-xl" /> : <HiEye className="text-xl" />}
                                </button>
                            </div>
                        </div>

                        <label className="flex items-center gap-2 text-sm text-text-muted cursor-pointer select-none">
                            <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} className="accent-primary w-4 h-4" />
                            Keep me signed in
                        </label>

                        <button type="submit" disabled={loading} className={s.submitButton}>
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Don't have an account?{' '}
                        <Link to="/register" className={s.registerLink}>Create an Account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
