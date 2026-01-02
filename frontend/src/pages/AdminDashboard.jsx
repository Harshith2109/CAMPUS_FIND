
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getClaimStats } from '../services/claimService';
import LoadingSpinner from '../components/LoadingSpinner';

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
            console.error('Error fetching admin stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-gray-500 text-sm font-medium uppercase">Total Claims</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.totalClaims || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-green-600 text-sm font-medium uppercase">Approved</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.approvedClaims || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-yellow-600 text-sm font-medium uppercase">Pending</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.pendingClaims || 0}</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-red-600 text-sm font-medium uppercase">Rejected</div>
                    <div className="text-3xl font-bold text-gray-900 mt-2">{stats?.rejectedClaims || 0}</div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
                    <p className="text-gray-600 mb-4">Manage users, roles, and permissions.</p>
                    <Link to="/admin/users" className="btn btn-outline w-full justify-center">Manage Users</Link>
                </div>

                <div className="card hover:shadow-md transition-shadow cursor-pointer">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">System Settings</h2>
                    <p className="text-gray-600 mb-4">Configure system preferences and categories.</p>
                    <Link to="/admin/settings" className="btn btn-outline w-full justify-center">Settings</Link>
                </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                <div className="flex items-start">
                    <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <h3 className="text-lg font-medium text-blue-900">Admin Note</h3>
                        <p className="mt-2 text-blue-700">
                            As an admin, you have full access to manage the system. Ensure you review pending claims regularly in the <Link to="/verify-claims" className="underline font-medium hover:text-blue-800">Verification Page</Link>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
