import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyItems, deleteItem } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';

const MyItems = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        fetchMyItems();
    }, []);

    const fetchMyItems = async () => {
        try {
            const data = await getMyItems();
            setItems(data.items || []);
        } catch (error) {
            toast.error(error, 'Failed to load your items');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this item?')) return;

        try {
            await deleteItem(id);
            setItems(items.filter(item => item._id !== id));
            toast.success('Item deleted successfully');
        } catch (error) {
            toast.error(error, 'Failed to delete item');
        }
    };

    const filteredItems = items.filter(item => {
        if (filter === 'all') return true;
        if (filter === 'active') return item.status === 'active';
        if (filter === 'claimed') return item.status === 'claimed';
        if (filter === 'resolved') return item.status === 'resolved';
        return true;
    });

    if (loading) {
        return <LoadingSpinner fullScreen />;
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">My Items</h1>
                <p className="text-gray-600 mt-2">Manage your reported items</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 border-b">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 font-medium transition-colors ${filter === 'all'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    All ({items.length})
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 font-medium transition-colors ${filter === 'active'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Active ({items.filter(i => i.status === 'active').length})
                </button>
                <button
                    onClick={() => setFilter('claimed')}
                    className={`px-4 py-2 font-medium transition-colors ${filter === 'claimed'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Claimed ({items.filter(i => i.status === 'claimed').length})
                </button>
                <button
                    onClick={() => setFilter('resolved')}
                    className={`px-4 py-2 font-medium transition-colors ${filter === 'resolved'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900'
                        }`}
                >
                    Resolved ({items.filter(i => i.status === 'resolved').length})
                </button>
            </div>

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item._id} className="relative">
                            <ItemCard item={item} />
                            <div className="mt-2 flex gap-2">
                                <Link
                                    to={`/items/${item._id}`}
                                    className="btn btn-secondary flex-1 text-sm"
                                >
                                    View Details
                                </Link>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="btn btn-danger flex-1 text-sm"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    <p className="text-gray-600 mb-4">
                        {filter === 'all' ? 'No items found' : `No ${filter} items`}
                    </p>
                    <Link to="/report-item" className="btn btn-primary">
                        Report an Item
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyItems;
