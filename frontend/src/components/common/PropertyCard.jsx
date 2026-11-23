import React from 'react';
import { Link } from 'react-router-dom';
import {
    HiArrowsExpand,
    HiEye,
    HiHeart,
    HiLocationMarker,
    HiOutlineHeart,
    HiOutlineHome,
    HiOutlineUserGroup,
    HiShieldCheck,
} from 'react-icons/hi';
import { propertyCardStyles as s } from '../../assets/dummyStyles';
import { coverImage, formatPrice, isNew, locationOf, typeLabel } from '../../utils/helpers';

const Spec = ({ icon: Icon, value, label, divider }) => (
    <div className={`${s.specItem} ${divider ? s.specDivider : ''}`}>
        <div className={s.specIcon}><Icon size={20} /></div>
        <div className={s.specValue}>{value ?? '-'}</div>
        <div className={s.specLabel}>{label}</div>
    </div>
);

const PropertyCard = ({
    property,
    isWishlisted = false,
    onToggleWishlist,
    showWishlist = false,
    showStatus = false,
    listView = false,
    children,
}) => {
    if (!property) return null;

    const isCommercial = ['commercial', 'office', 'plot'].includes(property.propertyType);
    const sold = property.status === 'sold';

    const handleWishlist = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onToggleWishlist?.(property._id);
    };

    return (
        <div className={`${s.card} ${listView ? 'md:flex-row max-sm:max-w-none' : ''}`}>
            <Link to={`/property/${property._id}`} className={`${s.link} ${listView ? 'md:flex-row' : ''}`}>
                <div className={`${s.imageSection} ${listView ? 'md:w-[340px] md:h-auto md:min-h-[240px]' : ''}`}>
                    <img src={coverImage(property)} alt={property.title} className={s.image} loading="lazy" />

                    <div className={s.topBadges}>
                        <div className={s.badgesLeft}>
                            {showStatus || sold ? (
                                <span className={s.badgeStatus(property.status)}>{sold ? 'Sold' : 'Available'}</span>
                            ) : (
                                isNew(property.createdAt) && <span className={s.badgeNew}>New</span>
                            )}
                            {property.isVerified && (
                                <span className={s.badgeVerified}>
                                    <HiShieldCheck size={14} /> Verified
                                </span>
                            )}
                        </div>

                        {showWishlist && (
                            <button
                                type="button"
                                className={s.wishlistButton(isWishlisted)}
                                onClick={handleWishlist}
                                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                {isWishlisted ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
                            </button>
                        )}
                    </div>

                    <div className={s.priceOverlay}>
                        <h3 className={s.price}>
                            {formatPrice(property.price)}
                            {property.listingType === 'rent' && <span className="text-sm font-semibold"> / month</span>}
                        </h3>
                    </div>
                </div>

                <div className={s.content}>
                    <div className="flex justify-between items-center">
                        <span className={s.propertyType}>
                            {typeLabel(property.propertyType)} · For {property.listingType === 'rent' ? 'Rent' : 'Sale'}
                        </span>
                        <div className={`${s.views} text-text-muted`}>
                            <HiEye size={16} /> {property.views ?? 0}
                        </div>
                    </div>

                    <h4 className={s.title}>{property.title}</h4>

                    <div className={s.location}>
                        <HiLocationMarker className={s.locationIcon} />
                        <span className="whitespace-nowrap overflow-hidden text-ellipsis">{locationOf(property)}</span>
                    </div>

                    <div className={s.specsGrid}>
                        {isCommercial ? (
                            <>
                                <Spec icon={HiOutlineHome} value={typeLabel(property.propertyType)} label="Type" />
                                <Spec icon={HiArrowsExpand} value={property.areaSize} label="Sq Ft" divider />
                                <Spec icon={HiShieldCheck} value={property.isVerified ? 'Yes' : 'No'} label="Verified" />
                            </>
                        ) : (
                            <>
                                <Spec icon={HiOutlineHome} value={property.bhk} label="Beds" />
                                <Spec icon={HiOutlineUserGroup} value={property.bathrooms} label="Baths" divider />
                                <Spec icon={HiArrowsExpand} value={property.areaSize} label="Sq Ft" />
                            </>
                        )}
                    </div>

                    {!children && (
                        <div className={s.viewDetailsButton}>
                            <span className={s.viewDetailsBtn}>View Details</span>
                        </div>
                    )}
                </div>
            </Link>

            {children && <div className={`${s.actionsContainer} flex-col`}>{children}</div>}
        </div>
    );
};

export default PropertyCard;
