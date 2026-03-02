import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyItems } from '../services/itemService';
import { getMyClaims } from '../services/claimService';
import { getNotifications } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemCard from '../components/ItemCard';
import ActionCard from '../components/ActionCard';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import toast from '../utils/toast';
import {
    CirclePlus,
    ScanSearch,
    PackageOpen,
    Sparkles,
    ClipboardList,
    Bell,
    ChevronRight,
    Package
} from 'lucide-react';

const Dashboard = () => {
    const { user } = useAuth();
    const [myItems, setMyItems] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            const [itemsData, claimsData, notifData] = await Promise.all([
                getMyItems(),
                getMyClaims(),
                getNotifications(5)
            ]);

            setMyItems(itemsData.items || []);
            setMyClaims(claimsData.claims || []);
            setNotifications(notifData.notifications || []);
        } catch (error) {
            toast.error(error, 'Failed to load items');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    const matchedItemsCount = myItems.filter(item => item.matchedItems?.length > 0).length;
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="section-container px-4 sm:px-6 lg:px-8 py-8 space-y-10">
            {/* Welcome Section */}
            <SectionHeader
                title={`Welcome back, ${user?.name}! 👋`}
                subtitle="Here's what's happening with your items and claims"
            />

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
                <Link to="/report-item">
                    <ActionCard
                        color="primary"
                        title="Report an Item"
                        description="Lost or found something? Post it now"
                        icon={<CirclePlus className="w-8 h-8" />}
                    />
                </Link>

                <Link to="/items">
                    <ActionCard
                        color="success"
                        title="Browse Items"
                        description="Search through all reported items"
                        icon={<ScanSearch className="w-8 h-8" />}
                    />
                </Link>
            </div>

            {/* Stats Cards */}
            <div>
                <SectionHeader title="Quick Overview" />
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
                    <StatCard
                        label="My Items"
                        value={myItems.length}
                        color="primary"
                        icon={<PackageOpen className="w-6 h-6" />}
                    />
                    <StatCard
                        label="Matches Found"
                        value={matchedItemsCount}
                        changeType="positive"
                        color="success"
                        icon={<Sparkles className="w-6 h-6" />}
                    />
                    <StatCard
                        label="My Claims"
                        value={myClaims.length}
                        color="warning"
                        icon={<ClipboardList className="w-6 h-6" />}
                    />
                    <StatCard
                        label="Unread Notifications"
                        value={unreadCount}
                        color="primary"
                        icon={<Bell className="w-6 h-6" />}
                    />
                </div>
            </div>

            {/* Recent Items */}
            <section className="mb-8">
                <SectionHeader
                    title="My Recent Items"
                    action={
                        <Link to="/my-items" className="text-brand-primary hover:text-brand-primary-hover font-medium flex items-center gap-1">
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    }
                    divided
                />
                {myItems.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {myItems.slice(0, 3).map(item => (
                            <ItemCard key={item._id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <div className="w-20 h-20 bg-bg-main rounded-full flex-center mx-auto mb-4 border border-border-main">
                            <PackageOpen className="w-10 h-10 text-text-muted" />
                        </div>
                        <p className="text-text-muted mb-4 font-medium">You haven't reported any items yet</p>
                        <Link to="/report-item" className="btn btn-primary">
                            Report Your First Item
                        </Link>
                    </div>
                )}
            </section>

            {/* Recent Notifications */}
            <section>
                <SectionHeader
                    title="Recent Notifications"
                    action={
                        <Link to="/notifications" className="text-brand-primary hover:text-brand-primary-hover font-medium flex items-center gap-1">
                            View All
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    }
                    divided
                />
                {notifications.length > 0 ? (
                    <div className="card divide-y divide-border-main">
                        {notifications.map(notif => (
                            <div key={notif._id} className={`py-4 px-6 ${!notif.read ? 'bg-brand-primary/10' : 'hover:bg-bg-main'} transition-colors`}>
                                <div className="flex items-start gap-4">
                                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex-center ${notif.type === 'match' ? 'bg-brand-success/20 text-brand-success' :
                                        notif.type === 'claim' ? 'bg-brand-warning/20 text-brand-warning' :
                                            'bg-brand-primary/20 text-brand-primary'
                                        }`}>
                                        <Bell className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-text-main">{notif.title}</h4>
                                        <p className="text-sm text-text-muted mt-1">{notif.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-8">
                        <p className="text-gray-500">No notifications yet</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default Dashboard;
