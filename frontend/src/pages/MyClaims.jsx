import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyClaims, deleteClaim } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageModal from '../components/ImageModal';
import toast from '../utils/toast';
import { getImageUrl } from '../utils/helpers';

const MyClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalInfo, setModalInfo] = useState({ isOpen: false, index: 0, images: [] });


    useEffect(() => {
        fetchMyClaims();
    }, []);

    const fetchMyClaims = async () => {
        try {
            const data = await getMyClaims();
            setClaims(data.claims || []);
        } catch (error) {
            toast.error(error, 'Failed to load your claims');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClaim = async (id) => {
        if (!confirm('Are you sure you want to cancel this claim?')) return;

        try {
            await deleteClaim(id);
            setClaims(claims.filter(claim => claim._id !== id));
            toast.success('Claim cancelled successfully');
        } catch (error) {
            toast.error(error, 'Failed to cancel claim');
        }
    };

    const getStatusBadge = (status) => {
        const badges = {
            pending: 'badge-warning',
            approved: 'badge-success',
            rejected: 'badge-danger',
            verified: 'badge-primary'
        };
        return badges[status] || 'badge-secondary';
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Claims</h1>
                <p className="text-gray-600 mt-2">Track your item claims</p>
            </div>

            {/* Claims List */}
            {claims.length > 0 ? (
                <div className="space-y-4">
                    {claims.map(claim => (
                        <div key={claim._id} className="card">
                            <div className="flex flex-col md:flex-row gap-6">
                                {/* Item Image */}
                                <div className="flex-shrink-0">
                                    <div className="relative group cursor-pointer" onClick={() => setModalInfo({
                                        isOpen: true,
                                        index: 0,
                                        images: (claim.item?.images?.length > 0 ? claim.item.images : [null]).map(img => getImageUrl(img))
                                    })}>
                                        <img
                                            src={getImageUrl(claim.item?.images?.[0])}
                                            alt={claim.item?.name}
                                            className="w-full md:w-48 h-48 object-cover rounded-lg group-hover:opacity-95 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Claim Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                {claim.item?.name || 'Unknown Item'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`badge ${getStatusBadge(claim.status)} `}>
                                            {claim.status}
                                        </span>
                                    </div>

                                    <div className="space-y-4 mb-4">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Category:</span>
                                                <span className="ml-2 text-gray-900">{claim.item?.category}</span>
                                            </div>
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Location:</span>
                                                <span className="ml-2 text-gray-900">{claim.item?.location}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500 block mb-1">Your Description:</span>
                                            <p className="text-gray-900 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">"{claim.description}"</p>
                                        </div>

                                        {claim.proofImages && claim.proofImages.length > 0 && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500 block mb-2">Proof Images:</span>
                                                <div className="flex flex-wrap gap-2">
                                                    {claim.proofImages.map((img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative group cursor-pointer"
                                                            onClick={() => setModalInfo({
                                                                isOpen: true,
                                                                index: idx,
                                                                images: claim.proofImages.map(i => getImageUrl(i))
                                                            })}
                                                        >
                                                            <img
                                                                src={getImageUrl(img)}
                                                                alt={`Proof ${idx + 1} `}
                                                                className="w-16 h-16 object-cover rounded border border-gray-200 hover:border-primary-500 transition-colors"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {claim.verificationNotes && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Verification Notes:</span>
                                                <p className="text-gray-900 mt-1 bg-yellow-50 p-2 rounded text-sm">{claim.verificationNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/ items / ${claim.item?._id} `}
                                            className="btn btn-secondary py-2"
                                        >
                                            View Item
                                        </Link>
                                        {claim.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelClaim(claim._id)}
                                                className="btn btn-danger py-2"
                                            >
                                                Cancel Claim
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-600 mb-4">You haven't made any claims yet</p>
                    <Link to="/items" className="btn btn-primary">
                        Browse Items
                    </Link>
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

export default MyClaims;
