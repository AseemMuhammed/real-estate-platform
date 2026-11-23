import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SellerLayout } from '../../components/common/DashboardLayout';
import PropertyForm from '../../components/common/PropertyForm';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const EditProperty = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [property, setProperty] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const load = async () => {
            try {
                const res = await api.get(ENDPOINTS.PROPERTY(id));
                setProperty(res.data.property || res.data);
            } catch (err) {
                setError(errMsg(err, 'Property not found.'));
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [id]);

    const handleSubmit = async (formData) => {
        try {
            setSubmitting(true);
            setError('');
            await api.put(ENDPOINTS.PROPERTY(id), formData);

            navigate('/my-properties');
        } catch (err) {
            setError(errMsg(err, 'Failed to update the property.'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SellerLayout>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">Edit Property</h1>
                    <p className="mt-3 text-gray-600">Update your listing details, amenities and images.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10">
                    {loading ? (
                        <p className="py-16 text-center text-gray-500">Loading property...</p>
                    ) : !property ? (
                        <p className="py-16 text-center text-red-500">{error || 'Property not found.'}</p>
                    ) : (
                        <>
                            {error && (
                                <div className="mb-8 bg-red-50 text-red-600 text-sm font-medium rounded-xl px-4 py-3">{error}</div>
                            )}
                            <PropertyForm
                                initial={property}
                                onSubmit={handleSubmit}
                                onCancel={() => navigate('/my-properties')}
                                submitting={submitting}
                                submitLabel="Save Changes"
                            />
                        </>
                    )}
                </div>
            </div>
        </SellerLayout>
    );
};

export default EditProperty;
