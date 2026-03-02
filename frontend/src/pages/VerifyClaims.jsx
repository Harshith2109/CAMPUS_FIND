import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getClaims, updateClaimStatus } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import ImageModal from '../components/ImageModal';
import toast from '../utils/toast';
import { getImageUrl } from '../utils/helpers';
import { ZoomIn, ClipboardList } from 'lucide-react';

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
                    <h1 className="text-3xl font-bold text-text-main">Verify Claims</h1>
                    <p className="text-text-muted mt-2">Manage and verify item claims</p>
                </div>

                {/* Filter Tabs */}
                <div className="flex space-x-2 mt-4 md:mt-0 p-1 bg-bg-surface border border-border-main rounded-xl">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'pending'
                            ? 'bg-brand-primary text-white shadow-sm'
                            : 'text-text-muted hover:text-text-main hover:bg-bg-main'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setFilter('approved')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'approved'
                            ? 'bg-brand-success text-white shadow-sm'
                            : 'text-text-muted hover:text-text-main hover:bg-bg-main'
                            }`}
                    >
                        Approved
                    </button>
                    <button
                        onClick={() => setFilter('rejected')}
                        className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${filter === 'rejected'
                            ? 'bg-brand-danger text-white shadow-sm'
                            : 'text-text-muted hover:text-text-main hover:bg-bg-main'
                            }`}
                    >
                        Rejected
                    </button>
                </div>
            </div>

            {claims.length > 0 ? (
                <div className="space-y-6">
                    {claims.map(claim => (
                        <div key={claim._id} className="card bg-bg-surface border border-border-main shadow-sm rounded-2xl overflow-hidden">
                            <div className="flex flex-col md:flex-row gap-6 p-6">
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
                                            className="w-full md:w-64 h-64 object-cover rounded-xl group-hover:opacity-95 transition-all bg-bg-main"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] rounded-xl">
                                            <ZoomIn className="w-8 h-8 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Claim Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-text-main">
                                                Claim for: {claim.item?.name || 'Unknown Item'}
                                            </h3>
                                            <div className="flex items-center mt-3">
                                                <img
                                                    src={getImageUrl(claim.user?.profilePicture)}
                                                    alt={claim.user?.name}
                                                    className="w-10 h-10 rounded-full border border-border-main mr-3 bg-bg-main object-cover shadow-sm"
                                                />
                                                <div>
                                                    <p className="text-sm font-semibold text-text-main leading-none">{claim.user?.name}</p>
                                                    <p className="text-xs text-text-muted mt-1">{claim.user?.email}</p>
                                                </div>
                                            </div>
                                            <p className="text-xs text-text-muted mt-3 flex items-center gap-1">
                                                <ClipboardList className="w-3 h-3" />
                                                Submitted on {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`badge ${getStatusBadge(claim.status)} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                                            {claim.status}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-text-main text-sm uppercase tracking-wider">Item Details</h4>
                                            <div className="text-sm space-y-2 text-text-muted bg-bg-main/50 p-4 rounded-xl border border-border-main/50">
                                                <p><span className="font-semibold text-text-main">Category:</span> {claim.item?.category}</p>
                                                <p><span className="font-semibold text-text-main">Location:</span> {claim.item?.location}</p>
                                                <p><span className="font-semibold text-text-main">Date Found:</span> {new Date(claim.item?.dateFound).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-text-main text-sm uppercase tracking-wider">Claim Evidence</h4>
                                            <div className="bg-bg-main p-4 rounded-xl border border-border-main/50 relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 w-1 h-full bg-brand-primary/30"></div>
                                                <p className="text-text-main italic line-clamp-4">"{claim.proofDescription}"</p>
                                            </div>
                                            {claim.proofImages?.length > 0 && (
                                                <div className="flex gap-2 overflow-x-auto py-2">
                                                    {claim.proofImages.map((img, idx) => (
                                                        <div key={idx} className="cursor-pointer transition-transform hover:scale-105" onClick={() => setModalInfo({
                                                            isOpen: true,
                                                            index: idx,
                                                            images: claim.proofImages.map(i => getImageUrl(i))
                                                        })}>
                                                            <img src={getImageUrl(img)} alt={`Proof ${idx + 1}`} className="w-20 h-20 object-cover rounded-lg border border-border-main hover:border-brand-primary" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {filter === 'pending' && (
                                        <div className="border-t border-border-main pt-6 flex gap-4 justify-end">
                                            <button
                                                onClick={() => handleUpdateStatus(claim._id, 'rejected')}
                                                className="btn btn-outline text-brand-danger border-brand-danger/20 hover:bg-brand-danger/10 hover:border-brand-danger/40 px-6"
                                            >
                                                Reject Claim
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(claim._id, 'approved')}
                                                className="btn btn-primary bg-brand-success hover:bg-brand-success-hover text-white px-8 shadow-sm"
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
                <div className="card bg-bg-surface border border-border-main text-center py-20 rounded-2xl">
                    <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardList className="w-10 h-10 text-text-muted" />
                    </div>
                    <p className="text-text-muted text-lg font-medium">No {filter} claims found</p>
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
