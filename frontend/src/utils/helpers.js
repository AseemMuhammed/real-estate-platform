export const formatINR = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`;

export const formatPrice = (value) => {
    const n = Number(value) || 0;
    if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
    if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
    return `₹${n.toLocaleString('en-IN')}`;
};

export const getImageUrl = (img) => (typeof img === 'string' ? img : img?.url || '');

export const PLACEHOLDER_IMAGE =
    'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=900&q=60';

export const coverImage = (property) => getImageUrl(property?.images?.[0]) || PLACEHOLDER_IMAGE;

export const cap = (str = '') => String(str).charAt(0).toUpperCase() + String(str).slice(1);

export const initials = (name = '') =>
    name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join('') || 'NA';

export const avatarUrl = (user) =>
    user?.profilePic ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=0d9488&color=fff`;

export const TYPE_LABELS = {
    flat: 'Flat',
    apartment: 'Apartment',
    villa: 'Villa',
    house: 'House',
    studio: 'Studio',
    penthouse: 'Penthouse',
    office: 'Office',
    townhouse: 'Townhouse',
    plot: 'Plot',
    commercial: 'Commercial',
};

export const typeLabel = (type = '') => TYPE_LABELS[String(type).toLowerCase()] || cap(type) || 'Property';

export const locationOf = (p = {}) => [p.area, p.city].filter(Boolean).join(', ');

export const shortId = (id = '') => String(id).slice(-8).toUpperCase();

export const errMsg = (err, fallback = 'Something went wrong. Please try again.') => {
    if (err?.response?.data?.message) return err.response.data.message;
    if (err?.code === 'ERR_NETWORK') return 'Cannot reach the server. Make sure the backend is running.';
    return fallback;
};

export const unwrapList = (data, key) => (Array.isArray(data) ? data : data?.[key] || []);

export const isNew = (createdAt) => Boolean(createdAt) && Date.now() - new Date(createdAt).getTime() <= 7 * 86400000;

export const formatDate = (date) =>
    date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-';

export const formatDateTime = (date) =>
    date
        ? new Date(date).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
          })
        : '-';

export const formatTime = (date) =>
    date ? new Date(date).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

export const HOME_BY_ROLE = { admin: '/admin-dashboard', seller: '/dashboard', buyer: '/' };
