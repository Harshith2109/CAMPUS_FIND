
import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getClaims, updateClaimStatus } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';

const VerifyClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('pending');

    const fetchClaims = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getClaims({ status: filter });
            setClaims(data.claims || []);
        } catch (error) {
            console.error('Error fetching claims:', error);
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
            alert(`Claim ${status} successfully`);
        } catch (error) {
            console.error('Error updating claim:', error);
            alert('Failed to update claim');
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
                                    {claim.item?.images?.[0] ? (
                                        <img
                                            src={claim.item.images[0]}
                                            alt={claim.item.name}
                                            className="w-full md:w-64 h-64 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full md:w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Claim Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">
                                                Claim for: {claim.item?.name || 'Unknown Item'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                By: {claim.user?.name} ({claim.user?.email})
                                            </p>
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
                                                        <a key={idx} href={img} target="_blank" rel="noopener noreferrer">
                                                            <img src={img} alt={`Proof ${idx + 1}`} className="w-20 h-20 object-cover rounded border border-gray-200 hover:border-indigo-500" />
                                                        </a>
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
        </div>
    );
};

export default VerifyClaims;
