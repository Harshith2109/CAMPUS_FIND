import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyItems, deleteItem } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';
import { PackageX } from 'lucide-react';

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
                <h1 className="text-3xl font-bold text-text-main">My Items</h1>
                <p className="text-text-muted mt-2">Manage your reported items</p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
                {[
                    { id: 'all', label: 'All', count: items.length },
                    { id: 'active', label: 'Active', count: items.filter(i => i.status === 'active').length },
                    { id: 'claimed', label: 'Claimed', count: items.filter(i => i.status === 'claimed').length },
                    { id: 'resolved', label: 'Resolved', count: items.filter(i => i.status === 'resolved').length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id)}
                        className={`px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 whitespace-nowrap shadow-sm border ${filter === tab.id
                            ? 'bg-brand-primary text-white border-brand-primary shadow-brand-primary/20'
                            : 'bg-bg-surface text-text-muted border-border-main hover:border-brand-primary/50 hover:text-text-main'
                            }`}
                    >
                        {tab.label} <span className={`ml-1.5 text-xs opacity-80 ${filter === tab.id ? 'text-white' : 'text-text-muted'}`}>({tab.count})</span>
                    </button>
                ))}
            </div>

            {/* Items Grid */}
            {filteredItems.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredItems.map(item => (
                        <div key={item._id} className="relative group">
                            <ItemCard item={item} />
                            <div className="mt-3 flex gap-2">
                                <Link
                                    to={`/items/${item._id}`}
                                    className="btn btn-secondary flex-1 text-sm shadow-sm hover:shadow-md transition-all"
                                >
                                    View Details
                                </Link>
                                <button
                                    onClick={() => handleDelete(item._id)}
                                    className="btn btn-danger flex-1 text-sm shadow-sm hover:shadow-md transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card bg-bg-surface border border-border-main text-center py-20 rounded-2xl shadow-sm">
                    <div className="w-20 h-20 bg-bg-main rounded-full flex items-center justify-center mx-auto mb-6">
                        <PackageX className="w-10 h-10 text-text-muted" />
                    </div>
                    <p className="text-text-muted text-lg font-medium mb-6">
                        {filter === 'all' ? 'No items found' : `No ${filter} items`}
                    </p>
                    <Link to="/report-item" className="btn btn-primary px-8">
                        Report an Item
                    </Link>
                </div>
            )}
        </div>
    );
};

export default MyItems;
