import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyClaims, deleteClaim } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';

const MyClaims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMyClaims();
    }, []);

    const fetchMyClaims = async () => {
        try {
            const data = await getMyClaims();
            setClaims(data.claims || []);
        } catch (error) {
            console.error('Error fetching claims:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClaim = async (id) => {
        if (!confirm('Are you sure you want to cancel this claim?')) return;

        try {
            await deleteClaim(id);
            setClaims(claims.filter(claim => claim._id !== id));
            alert('Claim cancelled successfully');
        } catch (error) {
            console.error('Error cancelling claim:', error);
            alert('Failed to cancel claim');
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
                                    {claim.item?.images?.[0] ? (
                                        <img
                                            src={claim.item.images[0]}
                                            alt={claim.item.name}
                                            className="w-full md:w-48 h-48 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full md:w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                                            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                                {claim.item?.name || 'Unknown Item'}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`badge ${getStatusBadge(claim.status)}`}>
                                            {claim.status}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Category:</span>
                                            <span className="ml-2 text-gray-900">{claim.item?.category}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Location:</span>
                                            <span className="ml-2 text-gray-900">{claim.item?.location}</span>
                                        </div>
                                        <div>
                                            <span className="text-sm font-medium text-gray-500">Your Description:</span>
                                            <p className="text-gray-900 mt-1">{claim.description}</p>
                                        </div>
                                        {claim.verificationNotes && (
                                            <div>
                                                <span className="text-sm font-medium text-gray-500">Verification Notes:</span>
                                                <p className="text-gray-900 mt-1">{claim.verificationNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            to={`/items/${claim.item?._id}`}
                                            className="btn btn-secondary"
                                        >
                                            View Item
                                        </Link>
                                        {claim.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelClaim(claim._id)}
                                                className="btn btn-danger"
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
        </div>
    );
};

export default MyClaims;
