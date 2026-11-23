import { useCallback, useEffect, useState } from 'react';
import api, { ENDPOINTS } from '../api/endpoints';
import { errMsg } from '../utils/helpers';

const useSellerProperties = () => {
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Load listings
    const load = useCallback(
        () =>
            api.get(ENDPOINTS.MY_PROPERTIES)
                .then((res) => {
                    setProperties(res.data.properties || []);
                    setError('');
                })
                .catch((err) => setError(errMsg(err, 'Failed to load your listings.')))
                .finally(() => setLoading(false)),
        []
    );

    useEffect(() => {
        api.get(ENDPOINTS.MY_PROPERTIES)
            .then((res) => setProperties(res.data.properties || []))
            .catch((err) => setError(errMsg(err, 'Failed to load your listings.')))
            .finally(() => setLoading(false));
    }, []);

    // Change status
    const setStatus = async (id, status) => {
        try {
            const res = await api.patch(ENDPOINTS.PROPERTY_STATUS(id), { status });
            setProperties((prev) => prev.map((p) => (p._id === id ? res.data.property : p)));
        } catch (err) {
            setError(errMsg(err, 'Could not update the status.'));
        }
    };

    // Delete listing
    const remove = async (id) => {
        if (!window.confirm('Delete this listing permanently?')) return;
        try {
            await api.delete(ENDPOINTS.PROPERTY(id));
            setProperties((prev) => prev.filter((p) => p._id !== id));
        } catch (err) {
            setError(errMsg(err, 'Could not delete the listing.'));
        }
    };

    const reload = () => {
        setLoading(true);
        return load();
    };

    return { properties, loading, error, setStatus, remove, reload };
};

export default useSellerProperties;
