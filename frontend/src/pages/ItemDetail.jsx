import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';
import { getItemById } from '../services/itemService';
import { createClaim } from '../services/claimService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageModal from '../components/ImageModal';
import { getSettings } from '../services/adminService';
import toast from '../utils/toast';

const ItemDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [item, setItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showClaimModal, setShowClaimModal] = useState(false);
    const [uploadSettings, setUploadSettings] = useState({
        maxImages: 5,
        maxSizeMB: 1
    });
    const [claimData, setClaimData] = useState({
        description: '',
        proofImages: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, index: 0, images: [] });

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
        const fetchUploadSettings = async () => {
            try {
                const data = await getSettings();
                if (data.settings) {
                    setUploadSettings({
                        maxImages: data.settings.maxImagesPerItem || 5,
                        maxSizeMB: data.settings.maxImageSize || 1
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        fetchUploadSettings();
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
            toast.success('Claim submitted successfully!');
            setShowClaimModal(false);
            fetchItem();
        } catch (error) {
            toast.error(error, 'Failed to submit claim. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate number of files
        if (files.length > uploadSettings.maxImages) {
            toast.error(`You can only upload a maximum of ${uploadSettings.maxImages} images.`);
            e.target.value = '';
            return;
        }

        // Validate file size
        const oversizedFile = files.find(file => file.size > uploadSettings.maxSizeMB * 1024 * 1024);
        if (oversizedFile) {
            toast.error(`Each image must be smaller than ${uploadSettings.maxSizeMB}MB.`);
            e.target.value = '';
            return;
        }

        setClaimData(prev => ({ ...prev, proofImages: files }));
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
                            <div className="relative group cursor-pointer" onClick={() => setModalInfo({
                                isOpen: true,
                                index: 0,
                                images: item.images.map(img => getImageUrl(img))
                            })}>
                                <img
                                    src={getImageUrl(item.images[0])}
                                    alt={item.name}
                                    className="w-full h-96 object-cover rounded-lg group-hover:opacity-95 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-lg">
                                    <div className="bg-white bg-opacity-75 p-3 rounded-full shadow-lg text-gray-800">
                                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                            {item.images.length > 1 && (
                                <div className="grid grid-cols-4 gap-2 mt-4">
                                    {item.images.map((img, idx) => (
                                        <div key={idx} className="relative group cursor-pointer" onClick={() => setModalInfo({
                                            isOpen: true,
                                            index: idx,
                                            images: item.images.map(i => getImageUrl(i))
                                        })}>
                                            <img
                                                src={getImageUrl(img)}
                                                alt={`${item.name} ${idx + 1}`}
                                                className="w-full h-20 object-cover rounded hover:opacity-80 transition-opacity"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card overflow-hidden h-96">
                            <img
                                src={getImageUrl(null)}
                                alt="No images available"
                                className="w-full h-full object-cover opacity-50"
                            />
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

                            <hr className="border-gray-100 my-6" />

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-3">Reported By</h3>
                                <div className="flex items-center p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <img
                                        src={getImageUrl(item.reportedBy?.profilePicture)}
                                        alt={item.reportedBy?.name}
                                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover bg-gray-200 mr-3"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-gray-900 leading-tight">{item.reportedBy?.name || 'Anonymous User'}</p>
                                        <p className="text-xs text-gray-500">{item.reportedBy?.department || 'Member'}</p>
                                    </div>
                                </div>
                            </div>
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
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                                    <div className="flex items-center text-blue-800 text-xs">
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>
                                            Up to <strong>{uploadSettings.maxImages} images</strong> allowed, max <strong>{uploadSettings.maxSizeMB}MB</strong> each.
                                        </span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Proof Images
                                    </label>
                                    <span className="text-xs text-gray-500">{claimData.proofImages.length}/{uploadSettings.maxImages} selected</span>
                                </div>
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

            <ImageModal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))}
                images={modalInfo.images}
                initialIndex={modalInfo.index}
            />
        </div>

    );
};

export default ItemDetail;
