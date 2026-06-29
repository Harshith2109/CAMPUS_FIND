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
        if (filter === 'resolved') {
            return item.status === 'claimed' || item.status === 'returned';
        }

        // For other tabs (all, lost, found), only show active items
        if (item.status !== 'active') return false;

        if (filter === 'all') return true;
        return item.type === filter;
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
                    { id: 'all', label: 'All Active', count: items.filter(i => i.status === 'active').length },
                    { id: 'lost', label: 'Lost Items', count: items.filter(i => i.type === 'lost' && i.status === 'active').length },
                    { id: 'found', label: 'Found Items', count: items.filter(i => i.type === 'found' && i.status === 'active').length },
                    { id: 'resolved', label: 'Resolved', count: items.filter(i => i.status === 'claimed' || i.status === 'returned').length }
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
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredItems.map(item => (
                        <div key={item._id} className="flex flex-col h-full bg-bg-surface border border-border-main rounded-2xl overflow-hidden p-4 hover:shadow-lg transition-all duration-300">
                            <div className="flex-1">
                                <ItemCard item={item} plain />
                            </div>
                            <div className="mt-4 flex gap-3 pt-4 border-t border-border-main/50">
                                <Link
                                    to={`/items/${item._id}`}
                                    className="btn btn-secondary flex-1 text-xs py-2 px-3 shadow-sm hover:shadow-md transition-all font-bold uppercase tracking-wider"
                                >
                                    View
                                </Link>
                                {filter !== 'resolved' && (
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="btn btn-danger flex-1 text-xs py-2 px-3 shadow-sm hover:shadow-md transition-all font-bold uppercase tracking-wider"
                                    >
                                        Delete
                                    </button>
                                )}
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
