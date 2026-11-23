import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    HiCurrencyDollar,
    HiHome,
    HiLightningBolt,
    HiLocationMarker,
    HiOfficeBuilding,
    HiSearch,
    HiShieldCheck,
    HiVideoCamera,
} from 'react-icons/hi';
import { landingPageStyles as s } from '../../assets/dummyStyles';
import banner from '../../assets/bannerimage.png';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import PropertyCard from '../../components/common/PropertyCard';
import useWishlist from '../../hooks/useWishlist';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const FEATURES = [
    {
        title: 'Verified Trust',
        desc: 'Every listing is audited for ownership, condition, and legality.',
        icon: <HiShieldCheck size={24} />,
    },
    {
        title: 'Smart Search',
        desc: 'Powerful filters help you find the best matches for your preferences.',
        icon: <HiLightningBolt size={24} />,
    },
    {
        title: 'Best Value',
        desc: 'Direct-from-owner listings and zero-commission options for competitive prices.',
        icon: <HiCurrencyDollar size={24} />,
    },
    {
        title: 'Virtual Tours',
        desc: 'High-quality photo galleries let you experience the property from home.',
        icon: <HiVideoCamera size={24} />,
    },
];

const LandingPage = () => {
    const navigate = useNavigate();
    const { isWishlisted, toggle, canWishlist } = useWishlist();

    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [propertyType, setPropertyType] = useState('');
    const [propertyCounts, setPropertyCounts] = useState({ flat: 0, villa: 0, penthouse: 0, commercial: 0, total: 0 });

    // Featured listings
    useEffect(() => {
        const load = async () => {
            try {
                const [list, counts] = await Promise.all([
                    api.get(ENDPOINTS.PROPERTIES, { params: { sort: 'latest', limit: 6 } }),
                    api.get(ENDPOINTS.PROPERTY_COUNTS),
                ]);
                setProperties(list.data.properties || []);
                setPropertyCounts(counts.data.counts || {});
                setError(null);
            } catch (err) {
                setError(errMsg(err, 'Failed to load properties. Please try again.'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // Search
    const handleSearch = (e) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (searchTerm.trim()) params.append('city', searchTerm.trim());
        if (propertyType) params.append('type', propertyType);
        navigate(`/properties?${params.toString()}`);
    };

    const categories = [
        { name: 'Modern Flats', count: propertyCounts.flat || 0, icon: <HiOfficeBuilding size={32} />, type: 'flat' },
        { name: 'Luxury Villas', count: propertyCounts.villa || 0, icon: <HiHome size={32} />, type: 'villa' },
        { name: 'Penthouse', count: propertyCounts.penthouse || 0, icon: <HiOfficeBuilding size={32} />, type: 'penthouse' },
        { name: 'Commercial', count: propertyCounts.commercial || 0, icon: <HiOfficeBuilding size={32} />, type: 'commercial' },
    ];

    return (
        <div className={s.bgMain}>
            <Navbar />

            {/* Hero Section */}
            <section className={s.heroSection}>
                <div className={s.heroContent}>

                    <span className={s.badge}>
                        Trusted by 20,000+ homeowners
                    </span>

                    <h1 className={s.heroTitle}>
                        Find Your{" "}
                        <span className={s.textGradient}>
                            Perfect
                        </span>{" "}
                        Next Chapter
                    </h1>

                    <p className={s.heroSubtitle}>
                        Experience the most advanced real estate search
                        platform. Discover verified listings, connect with
                        top agents, and find a place you'll love.
                    </p>

                    <form
                        onSubmit={handleSearch}
                        className={s.searchForm}
                    >
                        <div className={s.searchField}>
                            <div className={s.textPrimary}>
                                <HiLocationMarker size={26} />
                            </div>

                            <div className={s.flexCol}>
                                <label className={s.labelSmall}>
                                    Location
                                </label>

                                <input
                                    type="text"
                                    placeholder="Where are you looking?"
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className={s.inputTransparent}
                                />
                            </div>
                        </div>
                        <div className={s.searchDivider}></div>
                        <div className={s.searchField}>
                            <div className={s.textPrimary}>
                                <HiHome size={26} />
                            </div>
                            <div className={s.flexCol}>
                                <label className={s.labelSmall}>Property Type</label>
                                <select
                                    value={propertyType}
                                    onChange={(e) => setPropertyType(e.target.value)}
                                    className={`${s.inputTransparent} cursor-pointer`}
                                >
                                    <option value="">Any Type</option>
                                    <option value="flat">Flat/Apartment</option>
                                    <option value="villa">Villa/House</option>
                                    <option value="penthouse">Penthouse</option>
                                    <option value="commercial">Commercial</option>
                                </select>
                            </div>
                        </div>

                        <button className={s.searchButton} type="submit">
                            <HiSearch size={22} /> Search
                        </button>
                    </form>

                            <div className={s.statsContainer}>
                        <div className={s.statItemFlex}>
                            <h3 className={s.statNumber}>{(propertyCounts.total || 0).toLocaleString()}+</h3>
                            <p className={s.statLabel}>Ready Properties</p>
                        </div>
                        <div className={s.statItemBorder}>
                            <h3 className={s.statNumber}>100%</h3>
                            <p className={s.statLabel}>Direct Owners</p>
                        </div>
                        <div className={s.statItemBorder}>
                            <h3 className={s.statNumber}>4.9/5</h3>
                            <p className={s.statLabel}>User Rating</p>
                        </div>
                    </div>
                </div>

                {/* Hero image */}
                <div className={s.heroImageContainer}>
                    <div className={s.imageWrapper}>
                        <img src={banner} alt="banner" className={s.heroImage} />
                        <div className={s.verifiedBadge}>
                            <div className={s.badgeIconWrapper}>
                                <HiShieldCheck size={24} className="text-primary" />
                            </div>
                            <div>
                                <h4 className={s.badgeTitle}>Verified Listing</h4>
                                <p className={s.badgeText}>
                                    Inspected by our professional team
                                </p>
                            </div>
                            <span className={s.preApproved}>Pre-Approved</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className={s.categorySection}>
                <div className={s.container}>
                    <div className={s.categoryHeader}>
                        <div className={s.categoryHeaderText}>
                            <h2 className={s.categoryTitle}>Browse by Category</h2>
                            <p className={s.categoryDesc}>
                                Explore curated collections of properties tailored to your specific lifestyle and needs.
                            </p>
                        </div>
                    </div>
                    <div className={s.categoryGrid}>
                        {categories.map((cat, idx) => (
                            <div className={s.categoryCard} key={idx} onClick={() => navigate(`/properties?type=${cat.type}`)}>
                                <div className={s.categoryIconWrapper}>
                                    {cat.icon}
                                </div>
                                <h3 className={s.categoryName}>{cat.name}</h3>
                                <p className={s.categoryCount}>{cat.count.toLocaleString()} Properties</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className={s.featuredSection}>
                <div className={s.featuresContainer}>
                    <div className={s.featuresList}>
                        {FEATURES.map((f, idx) => (
                            <div className={s.featureCard} key={idx} style={{ animationDelay: `${idx * 0.1}s` }}>
                                <div className={s.featureIconWrapper}>
                                    {f.icon}
                                </div>
                                <h3 className={s.featureTitle}>{f.title}</h3>
                                <p className={s.featureDesc}>{f.desc}</p>
                            </div>
                        ))}
                    </div>
                    <div className={s.featuresContent}>
                        <h2 className={s.featuresHeading}>
                            Why RealEstate <br />
                            is the <span className={s.textGradient}>Preferred Choice</span>
                        </h2>
                        <p className={s.featuresSubtext}>
                            We've reinvented the property search experience from the ground
                            up. By focusing on transparency, technological precision, and
                            user-centric design, we help you find not just a house, but a
                            home.
                        </p>
                        <ul className={s.featuresListItems}>
                            {[
                                "Direct connection with certified agents",
                                "Real-time market valuation data",
                                "Secure document management system",
                                "24/7 Premium customer support",
                            ].map((item, idx) => (
                                <li className={s.listItem} key={idx}>
                                    <HiLightningBolt className="text-primary" /> {item}
                                </li>
                            ))}
                        </ul>
                        <a href="#process" className={s.learnMoreLink}>
                            Learn more about our process &rarr;
                        </a>
                    </div>
                </div>
            </section>

            {/* How it works */}
            <section className={s.processSection} id="process">
                <div className={s.container}>
                    <div className={s.processHeader}>
                        <span className={s.processBadge}>How it Works</span>
                        <h2 className={s.processTitle}>
                            Our seamless <span className={s.textGradient}>Process</span>
                        </h2>
                        <p className={s.processSubtitle}>
                            We've simplified the journey of finding your dream home into three clear,
                            stress-free steps.
                        </p>
                    </div>
                    <div className={s.processGrid}>
                        {[
                            {
                                step: "01",
                                title: "Smart Search",
                                desc: "Leverage our AI-driven Smart Search algorithms to find the best property matches tailored to your specific preferences.",
                                icon: <HiLightningBolt size={32} />,
                            },
                            {
                                step: "02",
                                title: "Virtual Tours",
                                desc: "Experience your future home from anywhere with our high-definition 3D virtual tours and immersive walkthroughs.",
                                icon: <HiVideoCamera size={32} />,
                            },
                            {
                                step: "03",
                                title: "Verified Trust",
                                desc: "Every listing is strictly audited for ownership and condition, ensuring your peace of mind and a secure transaction.",
                                icon: <HiShieldCheck size={32} />,
                            },
                        ].map((p, idx) => (
                            <div key={idx} className={s.processCard}>
                                <div className={s.stepNumber}>{p.step}</div>
                                <div className={s.processIconWrapper}>{p.icon}</div>
                                <div className={s.processCardTitle}>{p.title}</div>
                                <div className={s.processCardDesc}>{p.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured */}
            <section className={s.featuredSection}>
                <div className={s.container}>
                    <div className={s.featuredHeader}>
                        <span className={s.featuredBadge}>Handpicked For You</span>
                        <h2 className={s.featuredTitle}>Featured Collection</h2>
                        <p className={s.featuredSubtitle}>
                            Discover high-value properties created by our experts for their exceptional design, location, and investment potential.
                        </p>
                    </div>

                    {loading ? (
                        <div className={s.loadingContainer}>
                            <div className={s.loader}></div>
                        </div>
                    ) : error ? (
                        <div className={s.errorContainer}>
                            <p>{error}</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className={s.errorContainer}>
                            <p>No properties listed yet. Check back soon!</p>
                        </div>
                    ) : (
                        <div className={s.propertiesGrid}>
                            {properties.map((property) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    showWishlist={canWishlist}
                                    isWishlisted={isWishlisted(property._id)}
                                    onToggleWishlist={toggle}
                                />
                            ))}
                        </div>
                    )}

                    <div className={s.discoverButtonContainer}>
                        <button onClick={() => navigate("/properties")} className={s.discoverButton}>
                            Discover More Properties
                        </button>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
