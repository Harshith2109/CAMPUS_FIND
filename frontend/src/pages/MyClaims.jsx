import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyClaims, deleteClaim } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import ImageModal from '../components/ImageModal';
import toast from '../utils/toast';
import { getImageUrl } from '../utils/helpers';
import { ZoomIn, ClipboardX } from 'lucide-react';

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
            <SectionHeader
                title="My Claims"
                subtitle="Track your item claims"
                className="mb-8"
                divided
            />

            {/* Claims List */}
            {claims.length > 0 ? (
                <div className="space-y-6">
                    {claims.map(claim => (
                        <div key={claim._id} className="card bg-bg-surface border border-border-main shadow-sm rounded-2xl overflow-hidden p-6 transition-all hover:shadow-md">
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
                                            className="w-full md:w-48 h-48 object-cover rounded-xl group-hover:opacity-95 transition-all bg-bg-main"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] rounded-xl">
                                            <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                </div>

                                {/* Claim Details */}
                                <div className="flex-1">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-2xl font-bold text-text-main">
                                                {claim.item?.name || 'Unknown Item'}
                                            </h3>
                                            <p className="text-sm text-text-muted mt-1">
                                                Claimed on {new Date(claim.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <span className={`badge ${getStatusBadge(claim.status)} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                                            {claim.status}
                                        </span>
                                    </div>

                                    <div className="space-y-6 mb-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-bg-main/50 p-4 rounded-xl border border-border-main/50">
                                            <div>
                                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Category</span>
                                                <span className="text-text-main font-medium">{claim.item?.category}</span>
                                            </div>
                                            <div>
                                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-1">Location</span>
                                                <span className="text-text-main font-medium">{claim.item?.location}</span>
                                            </div>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-2">Claim Description</span>
                                            <p className="text-text-main bg-bg-main p-4 rounded-xl border border-border-main italic">"{claim.description}"</p>
                                        </div>

                                        {claim.proofImages && claim.proofImages.length > 0 && (
                                            <div>
                                                <span className="text-xs font-bold text-text-muted uppercase tracking-wider block mb-3">Proof Documentation</span>
                                                <div className="flex flex-wrap gap-3">
                                                    {claim.proofImages.map((img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative group cursor-pointer transition-transform hover:scale-105"
                                                            onClick={() => setModalInfo({
                                                                isOpen: true,
                                                                index: idx,
                                                                images: claim.proofImages.map(i => getImageUrl(i))
                                                            })}
                                                        >
                                                            <img
                                                                src={getImageUrl(img)}
                                                                alt={`Proof ${idx + 1} `}
                                                                className="w-16 h-16 object-cover rounded-lg border border-border-main group-hover:border-brand-primary transition-colors bg-bg-main"
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {claim.verificationNotes && (
                                            <div className="bg-brand-warning/10 p-4 rounded-xl border border-brand-warning/20">
                                                <span className="text-xs font-bold text-brand-warning uppercase tracking-wider block mb-2">Verification Feedback</span>
                                                <p className="text-text-main text-sm leading-relaxed">{claim.verificationNotes}</p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-4">
                                        <Link
                                            to={`/items/${claim.item?._id}`}
                                            className="btn btn-secondary flex-1 md:flex-none px-8 shadow-sm transition-all hover:shadow-md"
                                        >
                                            View Item
                                        </Link>
                                        {claim.status === 'pending' && (
                                            <button
                                                onClick={() => handleCancelClaim(claim._id)}
                                                className="btn btn-danger flex-1 md:flex-none px-8 shadow-sm transition-all hover:shadow-md"
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
                <div className="card bg-bg-surface border border-border-main text-center py-20 rounded-2xl shadow-sm">
                    <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardX className="w-10 h-10 text-text-muted" />
                    </div>
                    <p className="text-text-muted text-lg font-medium mb-6">You haven't made any claims yet</p>
                    <Link to="/items" className="btn btn-primary px-8">
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
