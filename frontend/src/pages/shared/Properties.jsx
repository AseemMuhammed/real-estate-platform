import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { HiFilter, HiMenu, HiOutlineEmojiSad, HiOutlineHome, HiSearch, HiViewGrid, HiX } from 'react-icons/hi';
import { propertiesStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import PropertyCard from '../../components/common/PropertyCard';
import useWishlist from '../../hooks/useWishlist';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg, formatPrice } from '../../utils/helpers';

const MIN_PRICE = 100000;
const MAX_PRICE = 100000000;
const PAGE_SIZE = 12;

const PROPERTY_TYPES = [
    { label: 'Flat / Apartment', value: 'flat' },
    { label: 'Villa / House', value: 'villa' },
    { label: 'Penthouse', value: 'penthouse' },
    { label: 'Commercial / Office', value: 'commercial' },
    { label: 'Plot', value: 'plot' },
];

const BHK_OPTIONS = ['1', '2', '3', '4', '5+'];

const FURNISHING = [
    { label: 'Furnished', value: 'furnished' },
    { label: 'Semi-Furnished', value: 'semi-furnished' },
    { label: 'Unfurnished', value: 'unfurnished' },
];

const AMENITIES = ['Parking', 'Swimming Pool', 'Gym', 'Security', 'Lift', 'Garden'];

const DEFAULT_FILTERS = {
    search: '',
    listingType: '',
    propertyType: [],
    bhk: '',
    maxPrice: MAX_PRICE,
    furnishing: [],
    amenities: [],
    sort: 'latest',
};

const filtersFromUrl = (search) => {
    const q = new URLSearchParams(search);
    return {
        ...DEFAULT_FILTERS,
        search: q.get('city') || q.get('search') || '',
        listingType: q.get('listingType') || '',
        propertyType: q.get('type') ? q.get('type').split(',') : [],
        bhk: q.get('bhk') || '',
    };
};

const toParams = (f, page) => {
    const params = { sort: f.sort, page, limit: PAGE_SIZE };
    if (f.search.trim()) params.search = f.search.trim();
    if (f.listingType) params.listingType = f.listingType;
    if (f.propertyType.length) params.propertyType = f.propertyType.join(',');
    if (f.bhk) params.bhk = f.bhk;
    if (f.maxPrice < MAX_PRICE) params.maxPrice = f.maxPrice;
    if (f.furnishing.length) params.furnishing = f.furnishing.join(',');
    if (f.amenities.length) params.amenities = f.amenities.join(',');
    return params;
};

const Properties = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { isWishlisted, toggle, canWishlist } = useWishlist();

    const [filters, setFilters] = useState(() => filtersFromUrl(location.search));
    const [query, setQuery] = useState(() => ({ filters: filtersFromUrl(location.search), page: 1, nonce: 0 }));
    const [result, setResult] = useState({ key: null, properties: [], total: 0, pages: 1, error: null });
    const [lastSearch, setLastSearch] = useState(location.search);
    const [viewMode, setViewMode] = useState('grid');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const timer = useRef(null);

    // Sync with URL
    if (location.search !== lastSearch) {
        const next = filtersFromUrl(location.search);
        setLastSearch(location.search);
        setFilters(next);
        setQuery({ filters: next, page: 1, nonce: 0 });
    }

    const params = toParams(query.filters, query.page);
    const key = `${JSON.stringify(params)}#${query.nonce}`;
    const loading = result.key !== key;
    const page = query.page;

    // Fetch properties
    useEffect(() => {
        let cancelled = false;
        api.get(ENDPOINTS.PROPERTIES, { params: JSON.parse(key.split('#')[0]) })
            .then((res) => {
                if (cancelled) return;
                setResult({
                    key,
                    properties: res.data.properties || [],
                    total: res.data.total || 0,
                    pages: res.data.pages || 1,
                    error: null,
                });
            })
            .catch((err) => {
                if (cancelled) return;
                setResult({ key, properties: [], total: 0, pages: 1, error: errMsg(err, 'Failed to load properties. Please try again later.') });
            });
        return () => {
            cancelled = true;
        };
    }, [key]);

    useEffect(() => () => clearTimeout(timer.current), []);

    const { properties, error } = result;
    const meta = { total: result.total, pages: result.pages };

    const update = (patch, debounce = false) => {
        const next = { ...filters, ...patch };
        setFilters(next);
        clearTimeout(timer.current);
        const apply = () => setQuery((q) => ({ ...q, filters: next, page: 1 }));
        if (debounce) timer.current = setTimeout(apply, 450);
        else apply();
    };

    const toggleIn = (field, value) => {
        const list = filters[field];
        update({ [field]: list.includes(value) ? list.filter((v) => v !== value) : [...list, value] });
    };

    const goToPage = (next) => {
        setQuery((q) => ({ ...q, page: next }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const retry = () => setQuery((q) => ({ ...q, nonce: q.nonce + 1 }));

    const resetFilters = () => {
        clearTimeout(timer.current);
        if (location.search) {
            navigate('/properties');
            return;
        }
        setFilters(DEFAULT_FILTERS);
        setQuery({ filters: DEFAULT_FILTERS, page: 1, nonce: 0 });
    };

    return (
        <div className={s.pageContainer}>
            <Navbar />

            <div className={s.container}>
                <div className={s.mobileFilterButtonWrapper}>
                    <button type="button" className={s.mobileFilterButton} onClick={() => setShowMobileFilters(true)}>
                        <HiFilter /> Show Filters & Search
                    </button>
                </div>

                {showMobileFilters && <div className={`${s.mobileOverlay} lg:hidden`} onClick={() => setShowMobileFilters(false)} />}

                <div className={s.layout}>
                    {/* Filters */}
                    <aside className={`${s.sidebar} ${showMobileFilters ? s.sidebarVisible : s.sidebarHidden}`}>
                        <div className={s.sidebarHeader}>
                            <div className={s.sidebarTitleWrapper}>
                                <HiFilter className={s.sidebarTitleIcon} />
                                <h2 className={s.sidebarTitle}>Filters</h2>
                            </div>
                            <div className={s.sidebarHeaderActions}>
                                <button type="button" className={s.resetButton} onClick={resetFilters}>Reset</button>
                                <button type="button" className={s.closeMobileFilters} onClick={() => setShowMobileFilters(false)}>
                                    <HiX />
                                </button>
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <label className={s.filterLabel}>Location</label>
                            <div className={s.searchInputWrapper}>
                                <HiSearch className={s.searchIcon} />
                                <input
                                    type="text"
                                    value={filters.search}
                                    onChange={(e) => update({ search: e.target.value }, true)}
                                    placeholder="City, area or title..."
                                    className={s.searchInput}
                                />
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <label className={s.filterLabel}>Looking to</label>
                            <div className={s.bhkGroup}>
                                {[['', 'All'], ['sale', 'Buy'], ['rent', 'Rent']].map(([value, label]) => (
                                    <button
                                        key={label}
                                        type="button"
                                        onClick={() => update({ listingType: value })}
                                        className={`${s.bhkButton} ${filters.listingType === value ? s.bhkButtonActive : s.bhkButtonInactive}`}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <div className={s.priceHeader}>
                                <label className={`${s.filterLabel} mb-0`}>Max Price</label>
                                <span className={s.priceValue}>
                                    {filters.maxPrice >= MAX_PRICE ? 'Any' : formatPrice(filters.maxPrice)}
                                </span>
                            </div>
                            <input
                                type="range"
                                min={MIN_PRICE}
                                max={MAX_PRICE}
                                step={100000}
                                value={filters.maxPrice}
                                onChange={(e) => update({ maxPrice: Number(e.target.value) }, true)}
                                className={s.priceSlider}
                            />
                            <div className={s.priceLabels}>
                                <span>₹1L</span>
                                <span>₹10Cr+</span>
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <label className={s.filterLabel}>Property Type</label>
                            <div className={s.checkboxGroup}>
                                {PROPERTY_TYPES.map((type) => (
                                    <label key={type.value} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={s.checkbox}
                                            checked={filters.propertyType.includes(type.value)}
                                            onChange={() => toggleIn('propertyType', type.value)}
                                        />
                                        {type.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <label className={s.filterLabel}>BHK (Bedrooms)</label>
                            <div className={s.bhkGroup}>
                                {BHK_OPTIONS.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        onClick={() => update({ bhk: filters.bhk === option ? '' : option })}
                                        className={`${s.bhkButton} ${filters.bhk === option ? s.bhkButtonActive : s.bhkButtonInactive}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <label className={s.filterLabel}>Furnishing</label>
                            <div className={s.checkboxGroup}>
                                {FURNISHING.map((option) => (
                                    <label key={option.value} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={s.checkbox}
                                            checked={filters.furnishing.includes(option.value)}
                                            onChange={() => toggleIn('furnishing', option.value)}
                                        />
                                        {option.label}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className={s.filterSection}>
                            <label className={s.filterLabel}>Amenities</label>
                            <div className={s.checkboxGroup}>
                                {AMENITIES.map((item) => (
                                    <label key={item} className={s.checkboxLabel}>
                                        <input
                                            type="checkbox"
                                            className={s.checkbox}
                                            checked={filters.amenities.includes(item)}
                                            onChange={() => toggleIn('amenities', item)}
                                        />
                                        {item}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <button type="button" onClick={() => setShowMobileFilters(false)} className="btn btn-primary w-full lg:hidden">
                            Show {meta.total} Results
                        </button>
                    </aside>

                    {/* Results */}
                    <main className={s.mainContent}>
                        <div className={s.contentHeader}>
                            <p className={s.resultCount}>
                                Showing <strong className={s.resultCountStrong}>{meta.total}</strong> properties
                            </p>

                            <div className={s.headerControls}>
                                <div className={s.viewModeToggle}>
                                    <button
                                        type="button"
                                        aria-label="Grid view"
                                        onClick={() => setViewMode('grid')}
                                        className={`${s.viewModeButton} ${viewMode === 'grid' ? s.viewModeActive : s.viewModeInactive}`}
                                    >
                                        <HiViewGrid className="text-xl" />
                                    </button>
                                    <button
                                        type="button"
                                        aria-label="List view"
                                        onClick={() => setViewMode('list')}
                                        className={`${s.viewModeButton} ${viewMode === 'list' ? s.viewModeActive : s.viewModeInactive}`}
                                    >
                                        <HiMenu className="text-xl" />
                                    </button>
                                </div>

                                <div className={s.sortControl}>
                                    <label htmlFor="sort" className={s.sortLabel}>Sort:</label>
                                    <select id="sort" value={filters.sort} onChange={(e) => update({ sort: e.target.value })} className={s.sortSelect}>
                                        <option value="latest">Latest</option>
                                        <option value="price_low">Price: Low to High</option>
                                        <option value="price_high">Price: High to Low</option>
                                        <option value="popular">Most Viewed</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className={s.skeletonGrid}>
                                {Array.from({ length: 6 }).map((_, i) => <div key={i} className={s.skeletonCard} />)}
                            </div>
                        ) : error ? (
                            <div className={s.errorContainer}>
                                <HiOutlineEmojiSad size={48} className={s.errorIcon} />
                                <h3 className={s.errorTitle}>{error}</h3>
                                <button type="button" className={s.errorButton} onClick={retry}>Try Again</button>
                            </div>
                        ) : properties.length === 0 ? (
                            <div className={s.emptyContainer}>
                                <div className={s.emptyIconWrapper}>
                                    <HiOutlineHome size={36} className={s.emptyIcon} />
                                </div>
                                <h3 className={s.emptyTitle}>No properties found</h3>
                                <p className={s.emptyText}>Try adjusting the filters or searching a different location.</p>
                                <button type="button" className={s.emptyButton} onClick={resetFilters}>Reset Filters</button>
                            </div>
                        ) : (
                            <>
                                <div className={`${s.propertyList} ${viewMode === 'grid' ? s.propertyListGrid : s.propertyListList}`}>
                                    {properties.map((property) => (
                                        <PropertyCard
                                            key={property._id}
                                            property={property}
                                            listView={viewMode === 'list'}
                                            showWishlist={canWishlist}
                                            isWishlisted={isWishlisted(property._id)}
                                            onToggleWishlist={toggle}
                                        />
                                    ))}
                                </div>

                                {meta.pages > 1 && (
                                    <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                                        <button type="button" disabled={page <= 1} onClick={() => goToPage(page - 1)} className="btn btn-outline bg-white py-2 px-4 disabled:opacity-40">
                                            Prev
                                        </button>
                                        {Array.from({ length: meta.pages }, (_, i) => i + 1).map((n) => (
                                            <button
                                                key={n}
                                                type="button"
                                                onClick={() => goToPage(n)}
                                                className={`w-10 h-10 rounded-xl font-bold text-sm ${n === page ? 'bg-primary text-white' : 'bg-white border border-border text-text-main'}`}
                                            >
                                                {n}
                                            </button>
                                        ))}
                                        <button type="button" disabled={page >= meta.pages} onClick={() => goToPage(page + 1)} className="btn btn-outline bg-white py-2 px-4 disabled:opacity-40">
                                            Next
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Properties;
