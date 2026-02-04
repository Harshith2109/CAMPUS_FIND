import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';
import { getItemById } from '../services/itemService';
import { createClaim } from '../services/claimService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [claimData, setClaimData] = useState({
        description: '',
        proofImages: []
    });
    const [submitting, setSubmitting] = useState(false);

    const fetchItem = useCallback(async () => {
        try {
            const data = await getItemById(id);
            setItem(data.item);
        } catch (error) {
            console.error('Error fetching item:', error);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchItem();
    }, [fetchItem]);

    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setSubmitting(true);
            await createClaim(id, claimData);
            alert('Claim submitted successfully!');
            setShowClaimModal(false);
            fetchItem();
        } catch (error) {
            console.error('Error submitting claim:', error);
            alert('Failed to submit claim. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        setClaimData(prev => ({ ...prev, proofImages: Array.from(e.target.files) }));
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    if (!item) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="card text-center py-12">
                    <p className="text-gray-600">Item not found</p>
                    <Link to="/items" className="btn btn-primary mt-4">
                        Back to Items
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Back Button */}
            <button onClick={() => navigate(-1)} className="mb-6 text-primary-600 hover:text-primary-700 font-medium flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
            </button>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Images */}
                <div>
                    {item.images && item.images.length > 0 ? (
                        <div className="card">
                            <img
                                src={getImageUrl(item.images[0])}
                                alt={item.name}
                                className="w-full h-96 object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.src = 'https://via.placeholder.com/800x600?text=Image+Not+Found';
                                }}
                            />
                            {item.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {item.images.slice(1).map((img, idx) => (
                                        <img
                                            key={idx}
                                            src={img}
                                            alt={`${item.name} ${idx + 2}`}
                                            className="w-full h-20 object-cover rounded"
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card bg-gray-100 h-96 flex items-center justify-center">
                            <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Details */}
                <div>
                    <div className="card">
                        {/* Type Badge */}
                        <span className={`badge ${item.type === 'lost' ? 'badge-danger' : 'badge-success'} mb-4`}>
                            {item.type === 'lost' ? 'Lost Item' : 'Found Item'}
                        </span>

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.name}</h1>

                        <div className="space-y-4 mb-6">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Category</h3>
                                <p className="text-gray-900">{item.category}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Description</h3>
                                <p className="text-gray-900">{item.description}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Location</h3>
                                <p className="text-gray-900">{item.location}</p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Date</h3>
                                <p className="text-gray-900">
                                    {new Date(item.date).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500">Status</h3>
                                <span className={`badge ${item.status === 'active' ? 'badge-primary' :
                                    item.status === 'claimed' ? 'badge-warning' :
                                        'badge-success'
                                    }`}>
                                    {item.status}
                                </span>
                            </div>

                            {item.color && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Color</h3>
                                    <p className="text-gray-900">{item.color}</p>
                                </div>
                            )}

                            {item.brand && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                                    <p className="text-gray-900">{item.brand}</p>
                                </div>
                            )}
                        </div>

                        {/* Claim Button */}
                        {user && item.status === 'active' && (item.reportedBy?._id || item.reportedBy) !== (user._id || user.id) && (
                            <button
                                onClick={() => setShowClaimModal(true)}
                                className="btn btn-primary w-full"
                            >
                                Claim This Item
                            </button>
                        )}

                        {!user && (
                            <Link to="/login" className="btn btn-primary w-full">
                                Login to Claim
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Claim Modal */}
            {showClaimModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold mb-4">Claim Item</h2>
                        <form onSubmit={handleClaimSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Describe why this is your item *
                                </label>
                                <textarea
                                    value={claimData.description}
                                    onChange={(e) => setClaimData(prev => ({ ...prev, description: e.target.value }))}
                                    className="input"
                                    rows="4"
                                    required
                                    placeholder="Provide details to verify ownership..."
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Proof Images (Optional)
                                </label>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="input"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowClaimModal(false)}
                                    className="btn btn-secondary flex-1"
                                    disabled={submitting}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="btn btn-primary flex-1"
                                    disabled={submitting}
                                >
                                    {submitting ? 'Submitting...' : 'Submit Claim'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ItemDetail;
