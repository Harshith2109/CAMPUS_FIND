import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getImageUrl } from '../utils/helpers';
import { getItemById } from '../services/itemService';
import { createClaim } from '../services/claimService';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import ImageModal from '../components/ImageModal';
import { getSettings } from '../services/adminService';
import toast from '../utils/toast';
import { ChevronLeft, ZoomIn, Info, X } from 'lucide-react';

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
        proofDescription: '',
        proofImages: []
    });
    const [previewImages, setPreviewImages] = useState([]);
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

    const userClaim = item?.claimRequests?.find(claim =>
        (claim.claimedBy?._id || claim.claimedBy) === (user?._id || user?.id) &&
        claim.status === 'pending'
    );


    const handleClaimSubmit = async (e) => {
        e.preventDefault();
        if (!user) {
            navigate('/login');
            return;
        }

        try {
            setSubmitting(true);
            await createClaim({ itemId: id, ...claimData });
            toast.success('Claim submitted successfully!');
            setShowClaimModal(false);
            fetchItem();
        } catch (error) {
            toast.error(error, 'Failed to submit claim. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCancelClaim = async () => {
        if (!userClaim) return;
        if (!window.confirm('Are you sure you want to cancel your claim for this item?')) return;

        try {
            setSubmitting(true);
            const { deleteClaim } = await import('../services/claimService');
            await deleteClaim(userClaim._id);
            toast.success('Claim cancelled successfully');
            fetchItem();
        } catch (error) {
            toast.error(error, 'Failed to cancel claim');
        } finally {
            setSubmitting(false);
        }
    };

    const handleImageChange = (e) => {
        const newFiles = Array.from(e.target.files);
        const currentFiles = claimData.proofImages;

        // Validate number of files
        if (currentFiles.length + newFiles.length > uploadSettings.maxImages) {
            toast.error(`You can only upload a maximum of ${uploadSettings.maxImages} images.`);
            e.target.value = '';
            return;
        }

        // Validate file size
        const oversizedFile = newFiles.find(file => file.size > uploadSettings.maxSizeMB * 1024 * 1024);
        if (oversizedFile) {
            toast.error(`Each image must be smaller than ${uploadSettings.maxSizeMB}MB.`);
            e.target.value = '';
            return;
        }

        const updatedFiles = [...currentFiles, ...newFiles];
        setClaimData(prev => ({ ...prev, proofImages: updatedFiles }));

        // Create previews
        const previews = updatedFiles.map(file => URL.createObjectURL(file));
        previewImages.forEach(url => URL.revokeObjectURL(url));
        setPreviewImages(previews);

        // Reset input
        e.target.value = '';
    };

    const removeImage = (index) => {
        const updatedFiles = claimData.proofImages.filter((_, i) => i !== index);
        const updatedPreviews = previewImages.filter((_, i) => i !== index);

        URL.revokeObjectURL(previewImages[index]);

        setClaimData(prev => ({ ...prev, proofImages: updatedFiles }));
        setPreviewImages(updatedPreviews);
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
            <button onClick={() => navigate(-1)} className="mb-6 text-brand-primary hover:text-brand-primary/80 font-medium flex items-center">
                <ChevronLeft className="w-5 h-5 mr-2" />
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
                                    alt={item.title}
                                    className="w-full h-96 object-cover rounded-lg group-hover:opacity-95 transition-opacity"
                                />
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-lg">
                                    <div className="bg-white bg-opacity-75 p-3 rounded-full shadow-lg text-gray-800">
                                        <ZoomIn className="w-8 h-8" />
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
                                                alt={`${item.title} ${idx + 1}`}
                                                className="w-full h-20 object-cover rounded hover:opacity-80 transition-opacity"
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card overflow-hidden h-96 bg-bg-main flex items-center justify-center">
                            <img
                                src={getImageUrl(null)}
                                alt="No images available"
                                className="w-full h-full object-cover opacity-20"
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

                        <h1 className="text-3xl font-bold text-gray-900 mb-4">{item.title}</h1>

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
                                <div className="flex items-center p-3 bg-bg-main rounded-xl border border-border-main">
                                    <img
                                        src={getImageUrl(item.reportedBy?.profilePicture)}
                                        alt={item.reportedBy?.name}
                                        className="w-12 h-12 rounded-full border-2 border-border-main shadow-sm object-cover bg-bg-surface mr-3"
                                    />
                                    <div>
                                        <p className="text-sm font-bold text-text-main leading-tight">{item.reportedBy?.name || 'Anonymous User'}</p>
                                        <p className="text-xs text-text-muted">{item.reportedBy?.department || 'Member'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Claim Button - Only for found items */}
                        {user && item.status === 'active' && item.type === 'found' && (item.reportedBy?._id || item.reportedBy) !== (user._id || user.id) && !userClaim && (
                            <button
                                onClick={() => setShowClaimModal(true)}
                                className="btn btn-primary w-full"
                            >
                                Claim This Item
                            </button>
                        )}

                        {/* Cancel Claim Button */}
                        {user && userClaim && (
                            <div className="space-y-3">
                                <div className="p-4 bg-brand-warning/10 border border-brand-warning/20 rounded-xl flex items-start gap-3">
                                    <Info className="w-5 h-5 text-brand-warning flex-shrink-0 mt-0.5" />
                                    <div>
                                        <p className="text-sm font-semibold text-brand-warning">Claim Pending</p>
                                        <p className="text-xs text-text-muted">You have already submitted a claim for this item. It is currently under verification.</p>
                                    </div>
                                </div>
                                <button
                                    onClick={handleCancelClaim}
                                    disabled={submitting}
                                    className="btn btn-danger w-full outline outline-1 outline-brand-danger/20"
                                >
                                    {submitting ? 'Cancelling...' : 'Cancel My Claim'}
                                </button>
                            </div>
                        )}


                        {/* If it's a lost item, show a message instead of claim */}
                        {user && item.status === 'active' && item.type === 'lost' && (item.reportedBy?._id || item.reportedBy) !== (user._id || user.id) && (
                            <div className="bg-bg-main p-4 rounded-xl border border-border-main text-center">
                                <p className="text-sm text-text-muted mb-3">If you have found this item, please report it as a found item to help the owner.</p>
                                <Link to="/report-item?type=found" className="btn btn-outline w-full">
                                    Report as Found
                                </Link>
                            </div>
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
                    <div className="bg-bg-surface rounded-2xl max-w-md w-full p-8 shadow-xl border border-border-main relative">
                        <button
                            onClick={() => setShowClaimModal(false)}
                            className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-main transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                        <h2 className="text-2xl font-bold mb-6 text-text-main">Claim Item</h2>
                        <form onSubmit={handleClaimSubmit}>
                            <FormField label="Describe why this is your item" required>
                                <textarea
                                    value={claimData.proofDescription}
                                    onChange={(e) => setClaimData(prev => ({ ...prev, proofDescription: e.target.value }))}
                                    className="input"
                                    rows="4"
                                    required
                                    placeholder="Provide details to verify ownership..."
                                />
                            </FormField>

                            <FormField
                                label="Proof Images"
                                help={`${claimData.proofImages.length}/${uploadSettings.maxImages} selected`}
                            >
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-2">
                                    <div className="flex items-center text-blue-800 text-xs">
                                        <Info className="w-4 h-4 mr-2" />
                                        <span>
                                            Up to <strong>{uploadSettings.maxImages} images</strong> allowed, max <strong>{uploadSettings.maxSizeMB}MB</strong> each.
                                        </span>
                                    </div>
                                </div>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="input mb-4"
                                />

                                {previewImages.length > 0 && (
                                    <div className="grid grid-cols-4 gap-2 mb-4">
                                        {previewImages.map((url, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border-main">
                                                <img src={url} className="w-full h-full object-cover" alt="Proof" />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full shadow-sm hover:bg-red-600 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </FormField>

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
