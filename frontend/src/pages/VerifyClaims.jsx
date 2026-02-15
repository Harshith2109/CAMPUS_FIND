import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getClaims, updateClaimStatus } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageModal from '../components/ImageModal';
import toast from '../utils/toast';
import { getImageUrl } from '../utils/helpers';

const VerifyClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');
    const [modalInfo, setModalInfo] = useState({ isOpen: false, index: 0, images: [] });


    const fetchClaims = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getClaims({ status: filter });
            setClaims(data.claims || []);
        } catch (error) {
            toast.error(error, 'Failed to fetch claims for verification');
        } finally {
            setLoading(false);
        }
    }, [filter]);

    useEffect(() => {
        fetchClaims();
    }, [fetchClaims]);

    const handleUpdateStatus = async (id, status, notes = '') => {
        if (!confirm(`Are you sure you want to ${status} this claim?`)) return;

        try {
            await updateClaimStatus(id, { status, verificationNotes: notes });
            setClaims(claims.filter(claim => claim._id !== id));
            toast.success(`Claim ${status} successfully`);
        } catch (error) {
            toast.error(error, 'Failed to update claim');
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
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Verify Claims</h1>
                    <p className="text-gray-600 mt-2">Manage and verify item claims</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-2 mt-4 md:mt-0">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'pending'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'approved'
                            ? 'bg-green-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === 'rejected'
                            ? 'bg-red-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {claims.length > 0 ? (
                <div className="space-y-6">
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
                                            className="w-full md:w-64 h-64 object-cover rounded-lg group-hover:opacity-95 transition-opacity"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-10 rounded-lg">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                Claim for: {claim.item?.name || 'Unknown Item'}
                                            </h3>
                                            <div className="flex items-center mt-1">
                                                <img
                                                    src={getImageUrl(claim.user?.profilePicture)}
                                                    alt={claim.user?.name}
                                                    className="w-8 h-8 rounded-full border border-gray-100 mr-2 bg-gray-50 object-cover"
                                                />
                                                <p className="text-sm text-gray-600">
                                                    By: <span className="font-medium text-gray-900">{claim.user?.name}</span> ({claim.user?.email})
                                                </p>
                                            </div>
                                            <p className="text-sm text-gray-500">
                                                Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`badge ${getStatusBadge(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-900">Item Details</h4>
                                            <div className="text-sm">
                                                <p><span className="font-medium">Category:</span> {claim.item?.category}</p>
                                                <p><span className="font-medium">Location:</span> {claim.item?.location}</p>
                                                <p><span className="font-medium">Date Found:</span> {new Date(claim.item?.dateFound).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-900">Claim Evidence</h4>
                                            <div className="bg-gray-50 p-3 rounded-lg">
                                                <p className="text-gray-700 italic">"{claim.proofDescription}"</p>
                                            </div>
                                            {claim.proofImages?.length > 0 && (
                                                <div className="flex gap-2 overflow-x-auto py-2">
                                                    {claim.proofImages.map((img, idx) => (
                                                        <div key={idx} className="cursor-pointer" onClick={() => setModalInfo({
                                                            isOpen: true,
                                                            index: idx,
                                                            images: claim.proofImages.map(i => getImageUrl(i))
                                                        })}>
                                                            <img src={getImageUrl(img)} alt={`Proof ${idx + 1}`} className="w-20 h-20 object-cover rounded border border-gray-200 hover:border-indigo-500" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {filter === 'pending' && (
                                        <div className="border-t pt-4 flex gap-3 justify-end">
                                            <button
                                                onClick={() => handleUpdateStatus(claim._id, 'rejected')}
                                                className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                                            >
                                                Reject Claim
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(claim._id, 'approved')}
                                                className="btn btn-primary bg-green-600 hover:bg-green-700 border-transparent"
                                            >
                                                Approve Verified
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-16">
                    <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-gray-500 text-lg">No {filter} claims found</p>
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

export default VerifyClaims;
