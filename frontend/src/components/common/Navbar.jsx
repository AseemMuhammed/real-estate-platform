import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { navbarStyles as s } from '../../assets/dummyStyles';
import Logo from './Logo';
import { useAuth } from '../../context/AuthContext';
import { avatarUrl } from '../../utils/helpers';

const LINKS = {
    guest: [
        { to: '/', label: 'Home', end: true },
        { to: '/properties', label: 'Browse Properties' },
        { to: '/contact', label: 'Contact Us' },
    ],
    buyer: [
        { to: '/', label: 'Home', end: true },
        { to: '/properties', label: 'Properties' },
        { to: '/wishlist', label: 'Wishlist' },
        { to: '/my-inquiries', label: 'My Inquiries' },
        { to: '/chat-messages', label: 'Messages' },
        { to: '/contact', label: 'Contact Us' },
    ],
    seller: [
        { to: '/properties', label: 'Browse Properties' },
        { to: '/dashboard', label: 'Dashboard' },
    ],
    admin: [
        { to: '/properties', label: 'Browse Properties' },
        { to: '/admin-dashboard', label: 'Admin Panel' },
    ],
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout } = useAuth();

    const close = () => setIsOpen(false);
    const links = LINKS[user?.role] || LINKS.guest;

    const linkClass = ({ isActive }) => `${s.navLink} ${isActive ? 'text-primary bg-primary/10' : ''}`;

    const navLinks = (
        <>
            {links.map(({ to, label, end }) => (
                <NavLink key={to} to={to} end={end} className={linkClass} onClick={close}>
                    {label}
                </NavLink>
            ))}
            {!user && (
                <>
                    <NavLink to="/login" className={linkClass} onClick={close}>Login</NavLink>
                    <NavLink to="/register" className={linkClass} onClick={close}>Register</NavLink>
                </>
            )}
        </>
    );

    return (
        <>
            <nav className={s.nav}>
                <div className={s.container}>
                    <div className={s.grid}>
                        <div className="justify-self-start">
                            <Logo />
                        </div>

                        <div className={s.desktopMenu}>{navLinks}</div>

                        <div className={s.rightSection}>
                            {user ? (
                                <div className={s.userSection}>
                                    <Link to="/profile" className="flex items-center" title="My profile">
                                        <img src={avatarUrl(user)} alt="Profile" className={s.avatar} />
                                    </Link>
                                    <button type="button" className={s.logoutButton} onClick={logout}>
                                        Logout
                                    </button>
                                </div>
                            ) : (
                                <Link to="/register" className="btn btn-primary hidden lg:inline-flex py-2 px-5 text-sm">
                                    Get Started
                                </Link>
                            )}

                            <button type="button" className={s.mobileToggle} onClick={() => setIsOpen((v) => !v)} aria-label="Toggle menu">
                                {isOpen ? <HiX size={28} /> : <HiMenuAlt3 size={28} />}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className={s.backdrop(isOpen)} onClick={close} />

            <div className={s.drawer(isOpen)}>
                <div className={s.drawerHeader}>
                    <Logo onClick={close} />
                    <HiX size={28} onClick={close} className={s.drawerCloseIcon} />
                </div>

                <div className={s.drawerNavLinks}>{navLinks}</div>

                {user && (
                    <div className={s.drawerUserSection}>
                        <Link to="/profile" onClick={close} className={s.drawerUserInfo}>
                            <img src={avatarUrl(user)} alt="Profile" className={s.drawerAvatar} />
                            <div>
                                <div className={s.drawerUserName}>{user.name}</div>
                                <div className={s.drawerUserEmail}>{user.email}</div>
                            </div>
                        </Link>
                        <button type="button" className={s.drawerLogoutButton} onClick={() => { close(); logout(); }}>
                            Logout
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default Navbar;
