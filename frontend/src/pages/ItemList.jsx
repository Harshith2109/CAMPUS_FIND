import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getItems } from '../services/itemService';
import ItemCard from '../components/ItemCard';
import LoadingSpinner from '../components/LoadingSpinner';
import SectionHeader from '../components/SectionHeader';
import FormField from '../components/FormField';
import { Filter, X, Search, SearchX } from 'lucide-react';

const ItemList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        search: '',
        type: '',
        category: '',
        status: '',
        location: ''
    });

    // Debounce search input
    useEffect(() => {
        const timer = setTimeout(() => {
            setFilters(prev => ({ ...prev, search: searchTerm }));
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

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
        setSearchTerm('');
        setFilters({
            search: '',
            type: '',
            category: '',
            status: '',
            location: ''
        });
    };

    const categories = ['Electronics', 'Wallet/Purse', 'Keys', 'ID Card', 'Books', 'Clothing', 'Accessories', 'Other'];
    const locationOptions = ['Library', 'Cafeteria', 'Classroom', 'Lab', 'Sports Complex', 'Entrance', 'Parking', 'Other'];

    return (
        <div className="section-container px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <SectionHeader
                title="Browse Items"
                subtitle="Search through all reported lost and found items"
            />

            {/* Filters Card */}
            <div className="card mb-8">
                <h3 className="h5 mb-6 flex items-center gap-2 text-text-main">
                    <Filter className="w-5 h-5 text-brand-primary" />
                    Filters
                </h3>

                <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                    {/* Search */}
                    <FormField label="Search" className="lg:col-span-2">
                        <input
                            type="text"
                            placeholder="Search items..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input"
                        />
                    </FormField>

                    {/* Type */}
                    <FormField label="Type">
                        <select
                            value={filters.type}
                            onChange={(e) => handleFilterChange('type', e.target.value)}
                            className="input"
                        >
                            <option value="">All Types</option>
                            <option value="lost">Lost</option>
                            <option value="found">Found</option>
                        </select>
                    </FormField>

                    {/* Category */}
                    <FormField label="Category">
                        <select
                            value={filters.category}
                            onChange={(e) => handleFilterChange('category', e.target.value)}
                            className="input"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </FormField>

                    {/* Location */}
                    <FormField label="Location">
                        <select
                            value={filters.location}
                            onChange={(e) => handleFilterChange('location', e.target.value)}
                            className="input"
                        >
                            <option value="">All Locations</option>
                            {locationOptions.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </FormField>

                    {/* Status */}
                    <FormField label="Status">
                        <select
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                            className="input"
                        >
                            <option value="">Available</option>
                            <option value="active">Active</option>
                            <option value="claimed">Claimed</option>
                            <option value="returned">Returned</option>
                        </select>
                    </FormField>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-2 pt-4 border-t border-border-main">
                    <button
                        onClick={clearFilters}
                        className="btn btn-outline"
                    >
                        <X className="w-4 h-4" />
                        Clear Filters
                    </button>
                    <button
                        onClick={fetchItems}
                        className="btn btn-primary"
                    >
                        <Search className="w-4 h-4" />
                        Search
                    </button>
                </div>
            </div>

            {/* Items Grid */}
            {loading ? (
                <LoadingSpinner fullScreen />
            ) : items.length > 0 ? (
                <div>
                    <div className="mb-4 text-sm text-text-muted">
                        Showing <span className="font-semibold text-text-main">{items.length}</span> item(s)
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                            <ItemCard key={item._id} item={item} />
                        ))}
                    </div>
                </div>
            ) : (
                <div className="card text-center py-16">
                    <div className="w-20 h-20 bg-bg-main rounded-full flex-center mx-auto mb-6 border border-border-main">
                        <SearchX className="w-10 h-10 text-text-muted" />
                    </div>
                    <h3 className="h5 mb-2 text-text-main">No items found</h3>
                    <p className="text-text-muted mb-6">Try adjusting your filters or search term</p>
                    <button
                        onClick={clearFilters}
                        className="btn btn-primary"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
};

export default ItemList;
