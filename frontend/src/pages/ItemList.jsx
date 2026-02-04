import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';

const ItemList = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        category: '',
        status: '',
        location: ''
    });

    const fetchItems = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getItems(filters);
            setItems(data.items || []);
        } catch (error) {
            console.error('Error fetching items:', error);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchItems();
    }, [fetchItems]);

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const clearFilters = () => {
        setFilters({
            search: '',
            type: '',
            category: '',
            status: '',
            location: ''
        });
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Browse Items</h1>
                <p className="text-gray-600 mt-2">Search through lost and found items</p>
            </div>

            {/* Filters */}
            <div className="card mb-8">
                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={filters.search}
                            onChange={(e) => handleFilterChange('search', e.target.value)}
                            className="input"
                        />
                    </div>

                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type
                        </label>
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="input"
                        >
                            <option value="">All Types</option>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category
                        </label>
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="input"
                        >
                            <option value="">All Categories</option>
                            <option value="Electronics">Electronics</option>
                            <option value="Clothing">Clothing</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Books">Books</option>
                            <option value="ID Cards">ID Cards</option>
                            <option value="Keys">Keys</option>
                            <option value="Bags">Bags</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    {/* Status */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                        </label>
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="input"
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="claimed">Claimed</option>
                            <option value="resolved">Resolved</option>
                        </select>
                    </div>
                </div>

                {/* Clear Filters */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={clearFilters}
                        className="text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Results */}
            {loading ? (
                <LoadingSpinner />
            ) : items.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <ItemCard key={item._id} item={item} />
                    ))}
                </div>
            ) : (
                <div className="card text-center py-12">
                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <p className="text-gray-600 mb-4">No items found matching your criteria</p>
                    <button onClick={clearFilters} className="btn btn-primary">
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemList;
