import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HiCheck, HiX, HiOutlineCamera, HiOutlineLockClosed, HiOutlineTrash } from 'react-icons/hi';
import { RoleLayout } from '../../components/common/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import api, { ENDPOINTS } from '../../api/endpoints';
import { avatarUrl, errMsg, formatDate } from '../../utils/helpers';

const inputClass =
    'w-full px-5 py-4 rounded-2xl border border-gray-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100 transition';

const Notice = ({ message }) =>
    message ? (
        <p className={`mt-6 text-sm font-medium text-center ${message.type === 'success' ? 'text-teal-700' : 'text-red-500'}`}>
            {message.text}
        </p>
    ) : null;

const Profile = () => {
    const { user, setUser } = useAuth();
    const fileRef = useRef(null);

    const [form, setForm] = useState(() => ({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' }));
    const [photo, setPhoto] = useState(null);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [pwSaving, setPwSaving] = useState(false);
    const [pwMessage, setPwMessage] = useState(null);

    const fillFromUser = () => {
        setForm({ name: user?.name || '', phone: user?.phone || '', address: user?.address || '' });
        setPhoto(null);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: name === 'phone' ? value.replace(/[^\d+\s-]/g, '').slice(0, 16) : value }));
        if (message) setMessage(null);
    };

    const pickPhoto = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'Photo must be 5 MB or smaller.' });
            return;
        }
        setPhoto(file);
    };

    // Save profile
    const saveProfile = async (data) => {
        try {
            setSaving(true);
            const res = await api.put(ENDPOINTS.PROFILE, data);
            setUser(res.data.user);
            setForm({ name: res.data.user.name || '', phone: res.data.user.phone || '', address: res.data.user.address || '' });
            setPhoto(null);
            setMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setMessage({ type: 'error', text: errMsg(err, 'Failed to update profile.') });
        } finally {
            setSaving(false);
        }
    };

    const handleSave = (e) => {
        e.preventDefault();
        if (!form.name.trim()) {
            setMessage({ type: 'error', text: 'Full name is required.' });
            return;
        }
        const data = new FormData();
        data.append('name', form.name.trim());
        data.append('phone', form.phone.trim());
        data.append('address', form.address.trim());
        if (photo) data.append('profilePic', photo);
        saveProfile(data);
    };

    const removePhoto = () => {
        const data = new FormData();
        data.append('removeProfilePic', 'true');
        saveProfile(data);
    };

    // Change password
    const handlePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword.length < 6) {
            setPwMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
            return;
        }
        if (passwords.newPassword !== passwords.confirm) {
            setPwMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }
        try {
            setPwSaving(true);
            const res = await api.put(ENDPOINTS.CHANGE_PASSWORD, {
                currentPassword: passwords.currentPassword,
                newPassword: passwords.newPassword,
            });
            setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
            setPwMessage({ type: 'success', text: res.data.message });
        } catch (err) {
            setPwMessage({ type: 'error', text: errMsg(err, 'Could not change password.') });
        } finally {
            setPwSaving(false);
        }
    };

    const photoUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
    useEffect(() => () => photoUrl && URL.revokeObjectURL(photoUrl), [photoUrl]);
    const preview = photoUrl || avatarUrl(user);

    return (
        <RoleLayout>
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-gray-900">Personal Profile</h1>
                    <p className="mt-3 text-gray-700">Manage your personal information and account settings.</p>
                </div>

                <form onSubmit={handleSave} className="bg-white rounded-[2rem] shadow-md p-6 md:p-10">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-6 mb-10">
                        <div className="relative w-32 h-32 shrink-0">
                            <img src={preview} alt="" className="w-32 h-32 rounded-[2rem] object-cover shadow" />
                            <button
                                type="button"
                                onClick={() => fileRef.current?.click()}
                                className="absolute -bottom-1 -right-1 w-10 h-10 rounded-full bg-teal-700 text-white border-4 border-white flex items-center justify-center hover:bg-teal-800"
                                aria-label="Change photo"
                            >
                                <HiOutlineCamera />
                            </button>
                            <input ref={fileRef} type="file" accept="image/*" hidden onChange={pickPhoto} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900">{user?.name}</h2>
                            <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                            <div className="flex items-center gap-2 mt-3 flex-wrap">
                                <span className="inline-block bg-teal-100 text-teal-700 text-xs font-bold px-4 py-2 rounded-xl uppercase">
                                    {user?.role}
                                </span>
                                <span className="text-xs text-gray-500">Member since {formatDate(user?.createdAt)}</span>
                            </div>
                            {user?.profilePic && !photo && (
                                <button type="button" onClick={removePhoto} className="mt-3 flex items-center gap-1 text-xs font-semibold text-red-500 hover:underline">
                                    <HiOutlineTrash /> Remove photo
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="space-y-7">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                            <input id="name" name="name" value={form.name} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                            <input
                                id="phone" name="phone" inputMode="tel" value={form.phone} onChange={handleChange}
                                placeholder="+971 50 123 4567" className={inputClass}
                            />
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-bold text-gray-900 mb-2">Address</label>
                            <textarea
                                id="address" name="address" rows={4} value={form.address} onChange={handleChange}
                                placeholder="Enter your full address" className={`${inputClass} resize-none`}
                            />
                        </div>
                    </div>

                    <Notice message={message} />

                    <div className="mt-10 grid grid-cols-2 gap-4">
                        <button
                            type="submit" disabled={saving}
                            className="flex items-center justify-center gap-2 bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition"
                        >
                            <HiCheck className="text-xl" /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button
                            type="button" onClick={() => { fillFromUser(); setMessage(null); }}
                            className="flex items-center justify-center gap-2 font-semibold text-gray-800 hover:text-red-500 py-4"
                        >
                            <HiX className="text-xl" /> Cancel
                        </button>
                    </div>
                </form>

                <form onSubmit={handlePassword} className="mt-8 bg-white rounded-[2rem] shadow-md p-6 md:p-10">
                    <h3 className="flex items-center gap-2 text-xl font-extrabold text-gray-900 mb-6">
                        <HiOutlineLockClosed /> Change Password
                    </h3>
                    <div className="grid gap-5 md:grid-cols-3">
                        {[
                            ['currentPassword', 'Current password'],
                            ['newPassword', 'New password'],
                            ['confirm', 'Confirm new'],
                        ].map(([key, label]) => (
                            <input
                                key={key}
                                type="password"
                                placeholder={label}
                                value={passwords[key]}
                                autoComplete={key === 'currentPassword' ? 'current-password' : 'new-password'}
                                onChange={(e) => { setPasswords((p) => ({ ...p, [key]: e.target.value })); setPwMessage(null); }}
                                className={inputClass}
                            />
                        ))}
                    </div>
                    <Notice message={pwMessage} />
                    <button
                        type="submit"
                        disabled={pwSaving || !passwords.currentPassword}
                        className="mt-6 w-full md:w-auto px-8 bg-gray-900 hover:bg-black disabled:opacity-50 text-white font-bold py-4 rounded-2xl transition"
                    >
                        {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                </form>
            </div>
        </RoleLayout>
    );
};

export default Profile;
