import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClaimStats } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';
import StatCard from '../components/StatCard';
import ActionCard from '../components/ActionCard';
import SectionHeader from '../components/SectionHeader';
import Alert from '../components/Alert';
import toast from '../utils/toast';
import { ClipboardList, ShieldCheck, Timer, XCircle, UserCog, Sliders, SearchCheck, FileText } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getClaimStats();
            setStats(data);
        } catch (error) {
            toast.error(error, 'Failed to fetch claims for verification');
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="section-container px-4 sm:px-6 lg:px-8 py-8">
            <SectionHeader
                title="Admin Dashboard"
                subtitle="Manage system, users, and verify claims"
            />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    label="Total Claims"
                    value={stats?.totalClaims || 0}
                    color="primary"
                    icon={<ClipboardList className="w-6 h-6" />}
                />
                <StatCard
                    label="Approved Claims"
                    value={stats?.approvedClaims || 0}
                    changeType="positive"
                    color="success"
                    icon={<ShieldCheck className="w-6 h-6" />}
                />
                <StatCard
                    label="Pending Claims"
                    value={stats?.pendingClaims || 0}
                    color="warning"
                    icon={<Timer className="w-6 h-6" />}
                />
                <StatCard
                    label="Rejected Claims"
                    value={stats?.rejectedClaims || 0}
                    changeType="negative"
                    color="danger"
                    icon={<XCircle className="w-6 h-6" />}
                />
            </div>

            {/* Quick Actions */}
            <div>
                <SectionHeader title="Quick Actions" divided />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/verify-claims">
                        <ActionCard
                            color="primary"
                            title="Verify Claims"
                            description="Review and approve pending claims from users"
                            icon={<ShieldCheck className="w-8 h-8" />}
                        />
                    </Link>

                    <Link to="/admin/users">
                        <ActionCard
                            color="success"
                            title="Manage Users"
                            description="View, edit user roles and manage permissions"
                            icon={<UserCog className="w-8 h-8" />}
                        />
                    </Link>

                    <Link to="/admin/settings">
                        <ActionCard
                            color="warning"
                            title="System Settings"
                            description="Configure categories and system preferences"
                            icon={<Sliders className="w-8 h-8" />}
                        />
                    </Link>

                    <Link to="/items">
                        <ActionCard
                            color="primary"
                            title="Moderate Items"
                            description="Review and manage reported items"
                            icon={<SearchCheck className="w-8 h-8" />}
                        />
                    </Link>
                </div>
            </div>

            {/* Admin Note Alert */}
            <Alert
                type="info"
                title="Admin Notice"
                message="As an admin, ensure you review pending claims regularly and maintain system integrity. Check the Verification Page for pending claims."
            />
        </div>
    );
};

export default AdminDashboard;
