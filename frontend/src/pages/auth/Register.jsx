import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { registerStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
    { value: 'buyer', label: 'Buyer', hint: 'Find & save homes' },
    { value: 'seller', label: 'Seller', hint: 'List properties' },
];

const Register = () => {
    const navigate = useNavigate();
    const { register } = useAuth();

    const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', role: 'buyer' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.name.trim() || !form.email.trim() || !form.password) {
            setError('Please fill in all fields.');
            return;
        }
        if (form.password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }
        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        const email = form.email.trim();
        const result = await register({ name: form.name.trim(), email, password: form.password, role: form.role });
        setLoading(false);

        if (!result.success) {
            setError(result.message);
            return;
        }

        if (result.requiresVerification) {
            sessionStorage.setItem('pendingVerifyEmail', email);
            navigate('/verify-email', { state: { email, notice: result.message } });
            return;
        }

        navigate('/login', { state: { email, notice: result.message } });
    };

    return (
        <div className={s.pageWrapper}>
            <Navbar />

            <div className={s.container}>
                <div className={s.formCard}>
                    <h2 className={s.heading}>Create Account</h2>
                    <p className={s.subheading}>Join our community to find or list properties</p>

                    {error && <div className={s.errorMessage}>{error}</div>}

                    <form onSubmit={handleSubmit} className={s.form}>
                        <div>
                            <label htmlFor="name" className={s.label}>Full Name</label>
                            <input
                                id="name" name="name" type="text" value={form.name} onChange={handleChange}
                                placeholder="John Doe" autoComplete="name" className={s.input}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className={s.label}>Email Address</label>
                            <input
                                id="email" name="email" type="email" value={form.email} onChange={handleChange}
                                placeholder="name@company.com" autoComplete="email" className={s.input}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={s.label}>Password</label>
                            <div className="relative">
                                <input
                                    id="password" name="password" type={showPassword ? 'text' : 'password'}
                                    value={form.password} onChange={handleChange} placeholder="At least 6 characters"
                                    autoComplete="new-password" className={`${s.input} pr-12`}
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

                        <div>
                            <label htmlFor="confirm" className={s.label}>Confirm Password</label>
                            <input
                                id="confirm" name="confirm" type={showPassword ? 'text' : 'password'}
                                value={form.confirm} onChange={handleChange} placeholder="Repeat password"
                                autoComplete="new-password" className={s.input}
                            />
                        </div>

                        <div>
                            <label className={s.label}>I want to join as</label>
                            <div className={s.roleContainer}>
                                {ROLES.map(({ value, label, hint }) => (
                                    <label
                                        key={value}
                                        className={`${s.roleLabelBase} ${form.role === value ? s.roleLabelActive : s.roleLabelInactive}`}
                                    >
                                        <input
                                            type="radio" name="role" value={value}
                                            checked={form.role === value} onChange={handleChange}
                                            className={s.hiddenRadio}
                                        />
                                        <span className="flex flex-col items-center">
                                            <span>{label}</span>
                                            <span className="text-[11px] font-medium opacity-70">{hint}</span>
                                        </span>
                                    </label>
                                ))}
                            </div>
                            {form.role === 'seller' && (
                                <p className="text-xs text-text-muted mt-2">Seller accounts are activated after a quick admin approval.</p>
                            )}
                        </div>

                        <button type="submit" disabled={loading} className={s.submitButton}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>
                    </form>

                    <p className={s.footerText}>
                        Already have an account?{' '}
                        <Link to="/login" className={s.loginLink}>Sign in here</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
