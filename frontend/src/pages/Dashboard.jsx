import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getMyItems } from '../services/itemService';
import { getMyClaims } from '../services/claimService';
import { getNotifications } from '../services/notificationService';
import LoadingSpinner from '../components/LoadingSpinner';
import ItemCard from '../components/ItemCard';

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
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Welcome Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">
                    Welcome back, {user?.name}!
                </h1>
                <p className="text-gray-600 mt-2">
                    Here's what's happening with your items and claims
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-4 mb-8">
                <Link to="/report-item" className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-primary-500 to-primary-600 text-white">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-semibold">Report an Item</h3>
                            <p className="text-primary-100">Lost or found something?</p>
                        </div>
                    </div>
                </Link>

                <Link to="/items" className="card hover:shadow-lg transition-shadow bg-gradient-to-br from-success-500 to-success-600 text-white">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <div className="ml-4">
                            <h3 className="text-xl font-semibold">Browse Items</h3>
                            <p className="text-success-100">Search for your lost items</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
                <div className="card bg-primary-50">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-primary-600">{myItems.length}</div>
                        <div className="text-sm text-gray-600 mt-1">My Items</div>
                    </div>
                </div>
                <div className="card bg-success-50">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-success-600">
                            {myItems.filter(item => item.matchedItems?.length > 0).length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Matches Found</div>
                    </div>
                </div>
                <div className="card bg-warning-50">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-warning-600">{myClaims.length}</div>
                        <div className="text-sm text-gray-600 mt-1">My Claims</div>
                    </div>
                </div>
                <div className="card bg-purple-50">
                    <div className="text-center">
                        <div className="text-3xl font-bold text-purple-600">
                            {notifications.filter(n => !n.read).length}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">Unread Notifications</div>
                    </div>
                </div>
            </div>

            {/* Recent Items */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">My Recent Items</h2>
                    <Link to="/my-items" className="text-primary-600 hover:text-primary-700 font-medium">
                        View All →
                    </Link>
                </div>
                {myItems.length > 0 ? (
                    <div className="grid md:grid-cols-3 gap-6">
                        {myItems.slice(0, 3).map(item => (
                            <ItemCard key={item._id} item={item} />
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-12">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-gray-600 mb-4">You haven't reported any items yet</p>
                        <Link to="/report-item" className="btn btn-primary">
                            Report Your First Item
                        </Link>
                    </div>
                )}
            </div>

            {/* Recent Notifications */}
            <div>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-900">Recent Notifications</h2>
                    <Link to="/notifications" className="text-primary-600 hover:text-primary-700 font-medium">
                        View All →
                    </Link>
                </div>
                {notifications.length > 0 ? (
                    <div className="card divide-y">
                        {notifications.map(notif => (
                            <div key={notif._id} className={`py-4 ${!notif.read ? 'bg-primary-50' : ''}`}>
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${notif.type === 'match' ? 'bg-success-100 text-success-600' :
                                                notif.type === 'claim' ? 'bg-warning-100 text-warning-600' :
                                                    'bg-primary-100 text-primary-600'
                                            }`}>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <h4 className="font-semibold text-gray-900">{notif.title}</h4>
                                        <p className="text-sm text-gray-600">{notif.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card text-center py-8">
                        <p className="text-gray-600">No notifications yet</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
