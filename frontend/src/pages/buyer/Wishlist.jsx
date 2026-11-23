import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineHeart, HiOutlineTrash } from 'react-icons/hi';
import { wishlistStyles as s } from '../../assets/dummyStyles';
import Navbar from '../../components/common/Navbar';
import PropertyCard from '../../components/common/PropertyCard';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const Wishlist = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load wishlist
    useEffect(() => {
        api.get(ENDPOINTS.WISHLIST)
            .then((res) => setItems(res.data.wishlist || []))
            .catch((err) => setError(errMsg(err, 'Failed to load your wishlist.')))
            .finally(() => setLoading(false));
    }, []);

    // Remove item
    const remove = async (propertyId) => {
        try {
            await api.delete(ENDPOINTS.WISHLIST_ITEM(propertyId));
            setItems((prev) => prev.filter((i) => String(i.property._id) !== String(propertyId)));
        } catch (err) {
            setError(errMsg(err, 'Could not remove the property.'));
        }
    };

    return (
        <div className={s.pageContainer}>
            <Navbar />

            {loading ? (
                <div className="loader-container"><div className={s.loader} /></div>
            ) : (
                <div className={s.mainContainer}>
                    <div className={s.headingWrapper}>
                        <h1 className={s.heading}>Your Wishlist</h1>
                        <p className={s.subheading}>
                            {items.length} {items.length === 1 ? 'property' : 'properties'} saved for later.
                        </p>
                    </div>

                    {error && <p className="mb-6 text-sm text-red-500">{error}</p>}

                    {items.length === 0 ? (
                        <div className={s.emptyCard}>
                            <div className={s.emptyIconWrapper}><HiOutlineHeart className="text-4xl" /></div>
                            <h3 className={s.emptyTitle}>Your wishlist is empty</h3>
                            <p className={s.emptyText}>Tap the heart on any property to save it here.</p>
                            <Link to="/properties" className={s.browseButton}>Browse Properties</Link>
                        </div>
                    ) : (
                        <div className={s.gridContainer}>
                            {items.map(({ property }) => (
                                <PropertyCard
                                    key={property._id}
                                    property={property}
                                    showStatus
                                    showWishlist
                                    isWishlisted
                                    onToggleWishlist={remove}
                                >
                                    <button type="button" className={s.removeButton} onClick={() => remove(property._id)}>
                                        <HiOutlineTrash /> Remove From Wishlist
                                    </button>
                                </PropertyCard>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Wishlist;
