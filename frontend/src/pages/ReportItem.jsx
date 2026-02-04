import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { getSettings } from '../services/adminService';

const ReportItem = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        type: 'lost',
        title: '',
        category: '',
        description: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        color: '',
        brand: '',
        images: []
    });
    const [submitting, setSubmitting] = useState(false);
    const [previewImages, setPreviewImages] = useState([]);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getSettings();
                if (data.settings && data.settings.categories) {
                    setCategories(data.settings.categories);
                }
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Fallback categories if fetch fails
                setCategories(['Electronics', 'Wallet/Purse', 'Keys', 'ID Card', 'Other']);
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: files }));

        // Create preview URLs
        const previews = files.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setSubmitting(true);
            await createItem(formData);
            alert('Item reported successfully!');
            navigate('/dashboard');
        } catch (error) {
            console.error('Error reporting item:', error);
            alert('Failed to report item. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Report an Item</h1>
                <p className="text-gray-600 mt-2">Help us reunite lost items with their owners</p>
            </div>

            <form onSubmit={handleSubmit} className="card">
                {/* Type Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Type *
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.type === 'lost'
                                ? 'border-danger-500 bg-danger-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <svg className={`w-12 h-12 mx-auto mb-2 ${formData.type === 'lost' ? 'text-danger-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="font-semibold">Lost Item</h3>
                                <p className="text-sm text-gray-600">I lost something</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                            className={`p-4 border-2 rounded-lg transition-all ${formData.type === 'found'
                                ? 'border-success-500 bg-success-50'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <svg className={`w-12 h-12 mx-auto mb-2 ${formData.type === 'found' ? 'text-success-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <h3 className="font-semibold">Found Item</h3>
                                <p className="text-sm text-gray-600">I found something</p>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Item Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Item Name *
                    </label>
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className="input"
                        required
                        placeholder="e.g., iPhone 13 Pro"
                    />
                </div>

                {/* Category */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Category *
                    </label>
                    <select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        className="input"
                        required
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        className="input"
                        rows="4"
                        required
                        placeholder="Provide detailed description..."
                    />
                </div>

                {/* Location */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Location *
                    </label>
                    <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        className="input"
                        required
                        placeholder="e.g., Library, Building A, Room 101"
                    />
                </div>

                {/* Date */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
                    </label>
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        className="input"
                        required
                        max={new Date().toISOString().split('T')[0]}
                    />
                </div>

                {/* Color */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Color
                    </label>
                    <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Black, Blue"
                    />
                </div>

                {/* Brand */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Brand
                    </label>
                    <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleChange}
                        className="input"
                        placeholder="e.g., Apple, Samsung"
                    />
                </div>

                {/* Images */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Images
                    </label>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="input"
                    />
                    {previewImages.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-4">
                            {previewImages.map((url, idx) => (
                                <img
                                    key={idx}
                                    src={url}
                                    alt={`Preview ${idx + 1}`}
                                    className="w-full h-24 object-cover rounded"
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="btn btn-secondary flex-1"
                        disabled={submitting}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn btn-primary flex-1"
                        disabled={submitting}
                    >
                        {submitting ? 'Submitting...' : 'Report Item'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ReportItem;
