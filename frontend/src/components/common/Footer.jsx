import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiLocationMarker, HiMail, HiPhone } from 'react-icons/hi';
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from 'react-icons/fa';
import { landingPageStyles as s } from '../../assets/dummyStyles';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const SOCIALS = [
    { Icon: FaFacebookF, href: 'https://facebook.com' },
    { Icon: FaTwitter, href: 'https://x.com' },
    { Icon: FaInstagram, href: 'https://instagram.com' },
    { Icon: FaLinkedinIn, href: 'https://linkedin.com' },
];

const Footer = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState(null);

    // Newsletter
    const subscribe = async (e) => {
        e.preventDefault();
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            setStatus({ type: 'error', text: 'Enter a valid email.' });
            return;
        }
        try {
            await api.post(ENDPOINTS.CONTACT, {
                name: 'Newsletter Subscriber',
                email,
                message: 'Please subscribe me to the RealEstate newsletter.',
            });
            setEmail('');
            setStatus({ type: 'success', text: 'Subscribed! Watch your inbox.' });
        } catch (err) {
            setStatus({ type: 'error', text: errMsg(err, 'Could not subscribe.') });
        }
    };

    return (
        <footer className={s.footer}>
            <div className={s.container}>
                <div className={s.footerMainGrid}>
                    <div className={s.footerBrand}>
                        <div className={s.brandLogo}>
                            <div className={s.brandIcon}>RE</div>
                            RealEstate
                        </div>
                        <p className={s.brandDesc}>
                            The trusted platform for buying, selling and renting premium real estate. We make property hunting seamless.
                        </p>
                        <div className={s.socialIcons}>
                            {SOCIALS.map(({ Icon, href }) => (
                                <a key={href} href={href} target="_blank" rel="noreferrer" className={s.socialIcon}>
                                    <Icon size={16} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className={s.footerHeading}>Company</h4>
                        <ul className={s.footerLinks}>
                            <li><Link to="/" className={s.footerLink}>Home</Link></li>
                            <li><Link to="/properties" className={s.footerLink}>Properties</Link></li>
                            <li><Link to="/wishlist" className={s.footerLink}>Wishlist</Link></li>
                            <li><Link to="/contact" className={s.footerLink}>Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={s.footerHeading}>Support</h4>
                        <ul className={s.footerLinks}>
                            <li className={s.contactInfo}>
                                <HiMail className="text-primary text-xl" /> support@realestate.com
                            </li>
                            <li className={s.contactInfo}>
                                <HiPhone className="text-primary text-xl" /> +971 50 123 4567
                            </li>
                            <li className={s.contactInfoStart}>
                                <HiLocationMarker className={`text-primary ${s.contactIcon}`} /> Business Bay, Dubai, UAE
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h4 className={s.footerHeading}>Newsletter</h4>
                        <p className={s.newsletterDesc}>
                            Subscribe to get the latest listings and market insights directly in your inbox.
                        </p>
                        <form onSubmit={subscribe} className={s.newsletterInputWrapper}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setStatus(null); }}
                                placeholder="Enter your email"
                                className={s.newsletterInput}
                            />
                            <button type="submit" className={s.newsletterButton}>Join Now</button>
                        </form>
                        {status && (
                            <p className={`mt-3 text-sm ${status.type === 'success' ? 'text-primary' : 'text-red-500'}`}>
                                {status.text}
                            </p>
                        )}
                    </div>
                </div>

                <div className={s.bottomBar}>
                    <div className={s.bottomBarFlex}>
                        <p>&copy; {new Date().getFullYear()} RealEstate. All rights reserved.</p>
                        <div className={s.footerLegalLinks}>
                            <Link to="/contact" className={s.footerLink}>Privacy Policy</Link>
                            <Link to="/contact" className={s.footerLink}>Terms of Service</Link>
                            <Link to="/contact" className={s.footerLink}>Support</Link>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
