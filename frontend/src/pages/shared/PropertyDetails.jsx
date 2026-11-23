import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
    HiChevronRight,
    HiChevronLeft,
    HiX,
    HiHeart,
    HiOutlineHeart,
    HiLocationMarker,
    HiOutlineHome,
    HiOutlineUserGroup,
    HiOutlineViewGrid,
    HiOutlineCollection,
    HiOutlineOfficeBuilding,
    HiCheckCircle,
    HiChatAlt2,
    HiPhone,
    HiMail,
    HiShieldCheck,
    HiOutlineShare,
    HiOutlineEye,
    HiOutlinePencilAlt,
} from 'react-icons/hi';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import Loader from '../../components/common/Loader';
import { useAuth } from '../../context/AuthContext';
import useWishlist from '../../hooks/useWishlist';
import api, { ENDPOINTS } from '../../api/endpoints';
import {
    cap,
    coverImage,
    errMsg,
    formatDate,
    formatINR,
    formatPrice,
    getImageUrl,
    initials,
    locationOf,
    shortId,
    typeLabel,
} from '../../utils/helpers';

const StatBox = ({ icon: Icon, value, label }) => (
    <div className="flex flex-col items-center gap-1 bg-white rounded-2xl shadow-sm py-5 px-3 text-center">
        <Icon className="text-xl text-teal-700" />
        <span className="font-bold text-gray-900 mt-1">{value}</span>
        <span className="text-[10px] tracking-wider text-gray-400 uppercase">
            {label}
        </span>
    </div>
);

const SimilarCard = ({ property }) => {
    const image = coverImage(property);
    return (
        <Link
            to={`/property/${property._id}`}
            className="bg-white rounded-3xl shadow-md overflow-hidden block hover:shadow-lg transition"
        >
            <div className="h-48 bg-gray-100">
                {image && (
                    <img
                        src={image}
                        alt={property.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                )}
            </div>
            <div className="p-4">
                <p className="text-lg font-extrabold text-teal-700">
                    {formatPrice(property.price)}
                </p>
                <h4 className="font-bold text-gray-900 line-clamp-1 mt-1">
                    {property.title}
                </h4>
                <p className="text-sm text-gray-500 mt-1 line-clamp-1">
                    {locationOf(property)}
                </p>
            </div>
        </Link>
    );
};

const PropertyDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, token } = useAuth();
    const { isWishlisted, toggle, canWishlist } = useWishlist();

    const [property, setProperty] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [inquiryStatus, setInquiryStatus] = useState(null);
    const [copied, setCopied] = useState(false);

    // Load property
    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoading(true);
                setError(null);
                const res = await api.get(ENDPOINTS.PROPERTY(id));
                if (cancelled) return;
                setProperty(res.data.property);
                setSimilar(res.data.similarProperties || []);
                setMessage(`Hi, I'm interested in "${res.data.property.title}". Is it still available?`);
            } catch (err) {
                if (!cancelled) setError(errMsg(err, 'Property not found or failed to load.'));
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [id]);

    // Lightbox
    const images = (property?.images || []).map(getImageUrl).filter(Boolean);

    const openLightbox = (index) => {
        setActiveIndex(index);
        setLightboxOpen(true);
    };
    const closeLightbox = () => setLightboxOpen(false);
    const next = useCallback(() => setActiveIndex((i) => (images.length ? (i + 1) % images.length : 0)), [images.length]);
    const prev = useCallback(
        () => setActiveIndex((i) => (images.length ? (i - 1 + images.length) % images.length : 0)),
        [images.length]
    );

    useEffect(() => {
        if (!lightboxOpen) return undefined;
        const onKey = (e) => {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') next();
            if (e.key === 'ArrowLeft') prev();
        };
        window.addEventListener('keydown', onKey);
        document.body.style.overflow = 'hidden';
        return () => {
            window.removeEventListener('keydown', onKey);
            document.body.style.overflow = '';
        };
    }, [lightboxOpen, next, prev]);

    // Inquiry
    const sendInquiry = async () => {
        if (!message.trim()) return;
        try {
            setSending(true);
            setInquiryStatus(null);
            await api.post(ENDPOINTS.INQUIRIES, { propertyId: id, message: message.trim() });
            setMessage('');
            setInquiryStatus({ type: 'success', text: 'Inquiry sent! The seller will contact you soon.' });
        } catch (err) {
            setInquiryStatus({ type: 'error', text: errMsg(err, 'Failed to send inquiry. Try again.') });
        } finally {
            setSending(false);
        }
    };

    const startChat = () => {
        if (!token) {
            navigate('/login', { state: { from: `/property/${id}` } });
            return;
        }
        const sellerId = property.seller?._id;
        navigate(`/chat-messages?seller=${sellerId}&property=${id}`);
    };

    const share = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="pt-32"><Loader label="Loading property..." /></div>
            </div>
        );
    }

    if (error || !property) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="py-40 text-center">
                    <p className="text-red-500 mb-4">{error || 'Property not found.'}</p>
                    <Link to="/properties" className="text-teal-700 font-semibold underline">Back to listings</Link>
                </div>
            </div>
        );
    }

    const seller = property.seller || {};
    const sellerName = seller.name || 'Seller';
    const addressLine = [property.address, property.area, property.city, property.pincode].filter(Boolean).join(', ');
    const amenities = property.amenities || [];
    const isBuyer = user?.role === 'buyer';
    const isOwner = user && String(seller._id) === String(user._id || user.id);
    const isSold = property.status === 'sold';
    const saved = isWishlisted(property._id);

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-28 pb-20">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                    <Link to="/" className="hover:text-teal-700">Home</Link>
                    <HiChevronRight />
                    <Link to="/properties" className="hover:text-teal-700">Listings</Link>
                    <HiChevronRight />
                    <span className="text-gray-800 font-medium line-clamp-1">
                        {property.title}
                    </span>
                </nav>

                {/* Gallery */}
                {images.length === 0 && (
                    <div className="rounded-3xl overflow-hidden h-64 md:h-[380px]">
                        <img src={coverImage(property)} alt={property.title} className="w-full h-full object-cover" />
                    </div>
                )}
                {images.length > 0 && (
                    <div className={`grid gap-4 ${images.length > 1 ? 'md:grid-cols-[1.4fr_1fr]' : ''}`}>
                        <button
                            type="button"
                            onClick={() => openLightbox(0)}
                            className="rounded-3xl overflow-hidden h-64 md:h-[420px] min-h-0"
                        >
                            <img
                                src={images[0]}
                                alt={property.title}
                                className="w-full h-full object-cover hover:scale-105 transition duration-500"
                            />
                        </button>

                        {images.length > 1 && (
                            <div className={`grid gap-4 h-64 md:h-[420px] min-h-0 ${images.length > 2 ? 'grid-rows-2' : ''}`}>
                                {images.slice(1, 3).map((img, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => openLightbox(i + 1)}
                                        className="rounded-3xl overflow-hidden relative min-h-0"
                                    >
                                        <img
                                            src={img}
                                            alt={`${property.title} ${i + 2}`}
                                            className="w-full h-full object-cover hover:scale-105 transition duration-500"
                                        />
                                        {i === 1 && images.length > 3 && (
                                            <span className="absolute inset-0 bg-black/50 text-white text-xl font-bold flex items-center justify-center">
                                                +{images.length - 3} more
                                            </span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Overview */}
                <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_400px]">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-block border border-teal-700 text-teal-700 text-xs font-bold px-3 py-1.5 rounded-lg uppercase">
                                For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                            </span>
                            {property.isVerified && (
                                <span className="inline-flex items-center gap-1 bg-teal-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                                    <HiShieldCheck /> VERIFIED
                                </span>
                            )}
                            {isSold && (
                                <span className="inline-block bg-gray-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg">SOLD</span>
                            )}
                        </div>

                        <h1 className="mt-4 text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
                            {property.title}
                        </h1>

                        <p className="mt-3 flex items-center gap-2 text-gray-600">
                            <HiLocationMarker className="text-teal-700 shrink-0" />
                            {addressLine}
                        </p>

                        <div className="mt-4 flex items-center gap-3 flex-wrap">
                            {canWishlist && (
                                <button
                                    type="button"
                                    onClick={() => toggle(property._id)}
                                    aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
                                    className="w-12 h-12 rounded-full bg-white shadow flex items-center justify-center hover:scale-105 transition"
                                >
                                    {saved ? <HiHeart className="text-red-500 text-2xl" /> : <HiOutlineHeart className="text-gray-700 text-2xl" />}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={share}
                                className="h-12 px-5 rounded-full bg-white shadow flex items-center gap-2 font-semibold text-gray-700 hover:text-teal-700 transition"
                            >
                                <HiOutlineShare /> {copied ? 'Link copied!' : 'Share'}
                            </button>
                            <span className="h-12 px-5 rounded-full bg-white shadow flex items-center gap-2 font-semibold text-gray-700">
                                <HiOutlineEye /> {property.views || 0} views
                            </span>
                        </div>

                        {/* Stats */}
                        <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4">
                            <StatBox
                                icon={HiOutlineHome}
                                value={property.bhk ?? '-'}
                                label="Bedrooms"
                            />
                            <StatBox
                                icon={HiOutlineUserGroup}
                                value={property.bathrooms ?? '-'}
                                label="Bathrooms"
                            />
                            <StatBox
                                icon={HiOutlineCollection}
                                value={cap(property.furnishing || '-')}
                                label="Furnishing"
                            />
                            <StatBox
                                icon={HiOutlineViewGrid}
                                value={property.areaSize ? `${property.areaSize} Sqft` : '-'}
                                label="Living Area"
                            />
                            <StatBox
                                icon={HiOutlineOfficeBuilding}
                                value={typeLabel(property.propertyType)}
                                label="Type"
                            />
                        </div>

                        {/* Description */}
                        <section className="mt-12">
                            <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-line max-w-3xl">
                                {property.description || 'No description provided.'}
                            </p>
                        </section>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                            <section className="mt-12">
                                <h2 className="text-xl font-bold text-gray-900 mb-4">Amenities</h2>
                                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-y-4 gap-x-6">
                                    {amenities.map((item) => (
                                        <div
                                            key={item}
                                            className="flex items-center gap-2 text-gray-700"
                                        >
                                            <HiCheckCircle className="text-teal-700 text-xl shrink-0" />
                                            <span className="capitalize">{item}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    <aside className="space-y-6">
                        <div className="bg-teal-700 text-white rounded-3xl p-7 shadow-lg">
                            <p className="text-sm font-semibold tracking-wide opacity-90">
                                LISTING PRICE
                            </p>
                            <p className="mt-4 text-4xl font-extrabold">
                                {formatINR(property.price)}
                                {property.listingType === 'rent' && <span className="text-lg font-semibold"> / month</span>}
                            </p>
                            <p className="mt-2 text-sm opacity-90">
                                {isSold ? 'This property has been sold' : property.listingType === 'rent' ? 'Available for Rent' : 'Available for Sale'}
                            </p>
                        </div>

                        <div className="bg-white rounded-3xl shadow-md p-6">
                            <div className="flex items-center gap-4">
                                {seller.profilePic ? (
                                    <img src={seller.profilePic} alt="" className="w-14 h-14 rounded-full object-cover" />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-teal-800 text-white text-lg font-bold flex items-center justify-center">
                                        {initials(sellerName)}
                                    </div>
                                )}
                                <div>
                                    <p className="font-bold text-gray-900">{sellerName}</p>
                                    <p className="flex items-center gap-1 text-sm font-medium text-teal-700">
                                        <HiCheckCircle /> Verified Seller
                                    </p>
                                </div>
                            </div>

                            {isOwner ? (
                                <button
                                    type="button"
                                    onClick={() => navigate(`/edit-property/${property._id}`)}
                                    className="mt-6 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-teal-700 font-semibold text-teal-700 hover:bg-teal-50"
                                >
                                    <HiOutlinePencilAlt /> Edit this listing
                                </button>
                            ) : (
                                <div className="mt-6 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={startChat}
                                        className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 font-semibold text-gray-800 hover:text-teal-700 hover:border-teal-700"
                                    >
                                        <HiChatAlt2 /> Chat
                                    </button>
                                    {seller.phone ? (
                                        <a
                                            href={`tel:${seller.phone}`}
                                            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 font-semibold text-gray-800 hover:text-teal-700 hover:border-teal-700"
                                        >
                                            <HiPhone /> Call
                                        </a>
                                    ) : (
                                        <a
                                            href={seller.email ? `mailto:${seller.email}` : undefined}
                                            className="flex items-center justify-center gap-2 py-3 rounded-2xl border border-gray-200 font-semibold text-gray-800 hover:text-teal-700 hover:border-teal-700"
                                        >
                                            <HiMail /> Email
                                        </a>
                                    )}
                                </div>
                            )}

                            <div className="mt-4">
                                {isOwner ? null : isBuyer ? (
                                    <>
                                        <h3 className="font-bold text-gray-900 mb-3">Inquire</h3>
                                        <textarea
                                            rows={4}
                                            value={message}
                                            onChange={(e) => setMessage(e.target.value)}
                                            placeholder="Your Message..."
                                            className="w-full rounded-2xl border border-gray-200 p-4 text-sm resize-none focus:outline-none focus:border-teal-600"
                                        />
                                        {inquiryStatus && (
                                            <p
                                                className={`mt-2 text-sm ${
                                                    inquiryStatus.type === 'success'
                                                        ? 'text-teal-700'
                                                        : 'text-red-500'
                                                }`}
                                            >
                                                {inquiryStatus.text}
                                            </p>
                                        )}
                                        <button
                                            type="button"
                                            onClick={sendInquiry}
                                            disabled={sending || !message.trim()}
                                            className="mt-4 w-full bg-teal-700 hover:bg-teal-800 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl transition"
                                        >
                                            {sending ? 'Sending...' : 'Send Inquiry'}
                                        </button>
                                    </>
                                ) : (
                                    <div className="bg-gray-50 rounded-2xl p-4 text-center">
                                        <p className="text-sm text-gray-500 mb-3">
                                            {token ? 'Only buyer accounts can send inquiries.' : 'Please login as a buyer to send inquiries.'}
                                        </p>
                                        {!token && (
                                            <button
                                                type="button"
                                                onClick={() => navigate('/login', { state: { from: `/property/${id}` } })}
                                                className="w-full bg-teal-700 hover:bg-teal-800 text-white font-bold py-3 rounded-2xl transition"
                                            >
                                                Login
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                {/* Details */}
                <section className="mt-14 bg-white rounded-3xl shadow-sm p-8">
                    <h2 className="text-xl font-bold text-gray-900 pb-4 border-b border-gray-100">
                        Property Details
                    </h2>
                    <div className="mt-6 grid gap-x-16 gap-y-6 md:grid-cols-2">
                        {[
                            ['Property ID', shortId(property._id)],
                            ['Added On', formatDate(property.createdAt)],
                            ['Property Type', typeLabel(property.propertyType)],
                            ['Status', isSold ? 'Sold' : 'Available'],
                            ['Listing For', property.listingType === 'rent' ? 'Rent' : 'Sale'],
                            ['Pincode', property.pincode || '-'],
                            ['Area Size', property.areaSize ? `${property.areaSize} sq ft` : '-'],
                            ['Furnishing', cap(property.furnishing || '-')],
                        ].map(([label, value]) => (
                            <div key={label} className="flex items-center justify-between">
                                <span className="font-semibold text-gray-900">{label}</span>
                                <span className="text-gray-600">{value}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Similar */}
                {similar.length > 0 && (
                    <section className="mt-14">
                        <div className="flex items-end justify-between mb-6">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900">
                                    Similar Properties
                                </h2>
                                <p className="text-gray-500 text-sm mt-1">
                                    Listings you might like in {property.city}.
                                </p>
                            </div>
                            <Link
                                to="/properties"
                                className="flex items-center gap-1 text-sm font-semibold text-gray-800 hover:text-teal-700"
                            >
                                All Listings <HiChevronRight />
                            </Link>
                        </div>
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {similar.map((p) => (
                                <SimilarCard key={p._id} property={p} />
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Footer />

            {/* Lightbox */}
            {lightboxOpen && images.length > 0 && (
                <div
                    className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={closeLightbox}
                >
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={closeLightbox}
                        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white flex items-center justify-center shadow"
                    >
                        <HiX className="text-teal-700 text-2xl" />
                    </button>

                    <div
                        className="relative bg-white rounded-3xl p-3 max-w-4xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={images[activeIndex]}
                            alt={`${property.title} ${activeIndex + 1}`}
                            className="w-full max-h-[70vh] object-cover rounded-2xl"
                        />

                        {images.length > 1 && (
                            <>
                                <button
                                    type="button"
                                    aria-label="Previous image"
                                    onClick={prev}
                                    className="absolute left-[-20px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center"
                                >
                                    <HiChevronLeft className="text-teal-700 text-2xl" />
                                </button>
                                <button
                                    type="button"
                                    aria-label="Next image"
                                    onClick={next}
                                    className="absolute right-[-20px] top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white shadow flex items-center justify-center"
                                >
                                    <HiChevronRight className="text-teal-700 text-2xl" />
                                </button>
                            </>
                        )}
                    </div>

                    <p className="absolute bottom-6 text-white font-semibold">
                        {activeIndex + 1} / {images.length}
                    </p>
                </div>
            )}
        </div>
    );
};

export default PropertyDetails;