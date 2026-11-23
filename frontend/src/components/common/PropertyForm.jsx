import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HiOutlineCloudUpload, HiOutlinePlus, HiX } from 'react-icons/hi';
import { addPropertyStyles as s } from '../../assets/dummyStyles';
import { TYPE_LABELS, getImageUrl } from '../../utils/helpers';

const AMENITIES = [
    'Parking',
    'Swimming Pool',
    'Gym',
    'Garden',
    'Security',
    'Lift',
    'Power Backup',
    'WiFi',
    'Balcony',
    'Air Conditioning',
    'Clubhouse',
    'Pet Friendly',
];

const MAX_IMAGES = 10;

const EMPTY = {
    title: '',
    description: '',
    price: '',
    listingType: 'sale',
    propertyType: '',
    city: '',
    area: '',
    address: '',
    pincode: '',
    bhk: '',
    bathrooms: '',
    areaSize: '',
    furnishing: 'unfurnished',
    status: 'available',
    amenities: [],
};

const fromProperty = (p) => ({
    ...EMPTY,
    ...Object.fromEntries(Object.keys(EMPTY).map((key) => [key, p?.[key] ?? EMPTY[key]])),
    status: p?.status === 'sold' ? 'sold' : 'available',
    amenities: p?.amenities || [],
});

const Section = ({ title, children, large }) => (
    <div className={s.section}>
        <div className={`${s.sectionHeader} ${large ? s.sectionHeaderLargeMargin : s.sectionHeaderSmallMargin}`}>
            <span className={s.sectionBar} />
            <h3 className={s.sectionTitle}>{title}</h3>
        </div>
        {children}
    </div>
);

const Field = ({ label, children }) => (
    <div>
        <label className={s.label}>{label}</label>
        {children}
    </div>
);

const PropertyForm = ({ initial, onSubmit, onCancel, submitting, submitLabel = 'Publish Property' }) => {
    const [form, setForm] = useState(() => fromProperty(initial));
    const [existing, setExisting] = useState(() => (initial?.images || []).map(getImageUrl).filter(Boolean));
    const [files, setFiles] = useState([]);
    const [error, setError] = useState('');
    const fileInput = useRef(null);

    const previews = useMemo(() => files.map((file) => ({ file, url: URL.createObjectURL(file) })), [files]);

    useEffect(() => () => previews.forEach((p) => URL.revokeObjectURL(p.url)), [previews]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
        if (error) setError('');
    };

    const toggleAmenity = (item) =>
        setForm((f) => ({
            ...f,
            amenities: f.amenities.includes(item) ? f.amenities.filter((a) => a !== item) : [...f.amenities, item],
        }));

    // Image picking
    const addFiles = (list) => {
        const picked = Array.from(list || []).filter((file) => file.type.startsWith('image/'));
        const tooBig = picked.find((file) => file.size > 5 * 1024 * 1024);
        if (tooBig) {
            setError(`${tooBig.name} is larger than 5 MB.`);
            return;
        }
        setFiles((prev) => [...prev, ...picked].slice(0, MAX_IMAGES - existing.length));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
    };

    // Submit
    const handleSubmit = (e) => {
        e.preventDefault();

        const required = ['title', 'description', 'price', 'propertyType', 'city', 'area', 'pincode'];
        const missing = required.find((key) => !String(form[key]).trim());
        if (missing) {
            setError('Please fill in all required fields marked with *.');
            return;
        }
        if (Number(form.price) <= 0) {
            setError('Price must be greater than zero.');
            return;
        }
        if (existing.length + files.length === 0) {
            setError('Please add at least one photo of the property.');
            return;
        }

        const data = new FormData();
        Object.entries(form).forEach(([key, value]) => {
            if (key === 'amenities') data.append('amenities', JSON.stringify(value));
            else data.append(key, value);
        });
        if (initial) data.append('existingImages', JSON.stringify(existing));
        files.forEach((file) => data.append('images', file));

        onSubmit(data);
    };

    const totalImages = existing.length + files.length;

    return (
        <form onSubmit={handleSubmit} noValidate>
            {error && <div className={s.error}>{error}</div>}

            <Section title="Basic Information" large>
                <div className={s.contentGroupLarge}>
                    <Field label="Property Title *">
                        <input name="title" value={form.title} onChange={handleChange} placeholder="e.g. Modern 2BHK in Dubai Marina" className={s.input} />
                    </Field>
                    <Field label="Description *">
                        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the property, views, nearby landmarks..." className={`${s.input} ${s.textarea}`} />
                    </Field>
                    <div className={s.gridThreeCol}>
                        <Field label="Price (₹) *">
                            <input type="number" min="0" name="price" value={form.price} onChange={handleChange} placeholder="5000000" className={s.input} />
                        </Field>
                        <Field label="Listing For">
                            <select name="listingType" value={form.listingType} onChange={handleChange} className={`${s.input} ${s.select}`}>
                                <option value="sale">Sale</option>
                                <option value="rent">Rent</option>
                            </select>
                        </Field>
                        <Field label="Property Type *">
                            <select name="propertyType" value={form.propertyType} onChange={handleChange} className={`${s.input} ${s.select}`}>
                                <option value="">Select type</option>
                                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                                    <option key={value} value={value}>{label}</option>
                                ))}
                            </select>
                        </Field>
                    </div>
                </div>
            </Section>

            <div className={s.twoColumnGrid}>
                <Section title="Location">
                    <div className={s.contentGroupMedium}>
                        <div className={s.gridTwoCol}>
                            <Field label="City *">
                                <input name="city" value={form.city} onChange={handleChange} placeholder="Dubai" className={s.input} />
                            </Field>
                            <Field label="Area / Locality *">
                                <input name="area" value={form.area} onChange={handleChange} placeholder="Marina" className={s.input} />
                            </Field>
                        </div>
                        <Field label="Street Address">
                            <input name="address" value={form.address} onChange={handleChange} placeholder="Building, street" className={s.input} />
                        </Field>
                        <Field label="Pincode / ZIP *">
                            <input name="pincode" value={form.pincode} onChange={handleChange} placeholder="00000" className={s.input} />
                        </Field>
                    </div>
                </Section>

                <Section title="Specifications">
                    <div className={s.contentGroupSmall}>
                        <div className={s.gridTwoCol}>
                            <Field label="Bedrooms (BHK)">
                                <input type="number" min="0" name="bhk" value={form.bhk} onChange={handleChange} placeholder="2" className={s.input} />
                            </Field>
                            <Field label="Bathrooms">
                                <input type="number" min="0" name="bathrooms" value={form.bathrooms} onChange={handleChange} placeholder="2" className={s.input} />
                            </Field>
                        </div>
                        <Field label="Area Size (sq ft)">
                            <input type="number" min="0" name="areaSize" value={form.areaSize} onChange={handleChange} placeholder="1200" className={s.input} />
                        </Field>
                        <div className={s.gridTwoCol}>
                            <Field label="Furnishing">
                                <select name="furnishing" value={form.furnishing} onChange={handleChange} className={`${s.input} ${s.select}`}>
                                    <option value="furnished">Furnished</option>
                                    <option value="semi-furnished">Semi-Furnished</option>
                                    <option value="unfurnished">Unfurnished</option>
                                </select>
                            </Field>
                            <Field label="Status">
                                <select name="status" value={form.status} onChange={handleChange} className={`${s.input} ${s.select}`}>
                                    <option value="available">Available</option>
                                    <option value="sold">Sold</option>
                                </select>
                            </Field>
                        </div>
                    </div>
                </Section>
            </div>

            <Section title="Amenities">
                <div className={s.amenitiesGrid}>
                    {AMENITIES.map((item) => {
                        const active = form.amenities.includes(item);
                        return (
                            <label key={item} className={`${s.amenityLabelBase} ${active ? s.amenityLabelActive : s.amenityLabelInactive}`}>
                                <input type="checkbox" checked={active} onChange={() => toggleAmenity(item)} className={s.amenityCheckbox} />
                                <span className={`${s.amenityTextBase} ${active ? s.amenityTextActive : s.amenityTextInactive}`}>{item}</span>
                            </label>
                        );
                    })}
                </div>
            </Section>

            <Section title={`Photos (${totalImages}/${MAX_IMAGES})`}>
                <div
                    className={s.uploadArea}
                    onClick={() => fileInput.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <div className={s.uploadIconWrapper}>
                        <HiOutlineCloudUpload className="text-5xl text-primary" />
                    </div>
                    <p className={s.uploadTitle}>Click or drag photos here</p>
                    <p className={s.uploadSubtext}>JPG, PNG or WEBP · up to 5 MB each · max {MAX_IMAGES} photos</p>
                    <input
                        ref={fileInput}
                        type="file"
                        accept="image/*"
                        multiple
                        hidden
                        onChange={(e) => { addFiles(e.target.files); e.target.value = ''; }}
                    />
                </div>

                {totalImages > 0 && (
                    <div className={s.previewsGrid}>
                        {existing.map((url) => (
                            <div key={url} className={s.previewItem}>
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button type="button" className={s.removeButton} onClick={() => setExisting((prev) => prev.filter((u) => u !== url))} aria-label="Remove photo">
                                    <HiX size={12} />
                                </button>
                            </div>
                        ))}
                        {previews.map(({ file, url }) => (
                            <div key={url} className={s.previewItem}>
                                <img src={url} alt="" className="w-full h-full object-cover" />
                                <button type="button" className={s.removeButton} onClick={() => setFiles((prev) => prev.filter((f) => f !== file))} aria-label="Remove photo">
                                    <HiX size={12} />
                                </button>
                            </div>
                        ))}
                        {totalImages < MAX_IMAGES && (
                            <div className={s.addMoreBox} onClick={() => fileInput.current?.click()}>
                                <HiOutlinePlus className="text-xl text-[#64748b]" />
                                <span className={s.addMoreText}>Add more</span>
                            </div>
                        )}
                    </div>
                )}
            </Section>

            <div className={s.footerButtons}>
                <button type="button" onClick={onCancel} className={s.cancelButton}>Cancel</button>
                <button type="submit" disabled={submitting} className={`${s.submitButton} disabled:opacity-60`}>
                    {submitting ? 'Saving...' : submitLabel}
                </button>
            </div>
        </form>
    );
};

export default PropertyForm;
