import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { ENDPOINTS } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';

const useWishlist = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [ids, setIds] = useState([]);
    const isBuyer = user?.role === 'buyer';

    // Load ids
    const load = useCallback(() => {
        if (!isBuyer) return Promise.resolve();
        return api.get(ENDPOINTS.WISHLIST)
            .then((res) => setIds(res.data.ids || []))
            .catch(() => null);
    }, [isBuyer]);

    useEffect(() => {
        if (!isBuyer) return;
        api.get(ENDPOINTS.WISHLIST)
            .then((res) => setIds(res.data.ids || []))
            .catch(() => null);
    }, [isBuyer]);

    const savedIds = isBuyer ? ids : [];
    const isWishlisted = (id) => savedIds.includes(String(id));

    // Toggle item
    const toggle = async (propertyId) => {
        if (!user) {
            navigate('/login');
            return;
        }
        if (!isBuyer) return;

        const id = String(propertyId);
        const saved = ids.includes(id);
        setIds((prev) => (saved ? prev.filter((x) => x !== id) : [...prev, id]));

        try {
            if (saved) await api.delete(ENDPOINTS.WISHLIST_ITEM(id));
            else await api.post(ENDPOINTS.WISHLIST_ITEM(id));
        } catch {
            setIds((prev) => (saved ? [...prev, id] : prev.filter((x) => x !== id)));
        }
    };

    return { ids: savedIds, isWishlisted, toggle, reload: load, canWishlist: !user || isBuyer };
};

export default useWishlist;
