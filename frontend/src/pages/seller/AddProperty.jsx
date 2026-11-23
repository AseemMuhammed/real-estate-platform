import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SellerLayout } from '../../components/common/DashboardLayout';
import PropertyForm from '../../components/common/PropertyForm';
import api, { ENDPOINTS } from '../../api/endpoints';
import { errMsg } from '../../utils/helpers';

const AddProperty = () => {
    const navigate = useNavigate();
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (formData) => {
        try {
            setSubmitting(true);
            setError('');
            await api.post(ENDPOINTS.PROPERTIES, formData);
            navigate('/dashboard');
        } catch (err) {
            setError(errMsg(err, 'Failed to add the property. Please try again.'));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <SellerLayout>
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">List Your Property</h1>
                    <p className="mt-3 text-gray-600">Fill in the details below to reach thousands of potential buyers.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-sm p-6 md:p-10">
                    {error && (
                        <div className="mb-8 bg-red-50 text-red-600 text-sm font-medium rounded-xl px-4 py-3">{error}</div>
                    )}
                    <PropertyForm
                        onSubmit={handleSubmit}
                        onCancel={() => navigate('/dashboard')}
                        submitting={submitting}
                        submitLabel="Publish Property"
                    />
                </div>
            </div>
        </SellerLayout>
    );
};

export default AddProperty;
