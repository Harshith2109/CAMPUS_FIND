import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { getSettings } from '../services/adminService';
import ImageModal from '../components/ImageModal';
import toast from '../utils/toast';

const ReportItem = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [uploadSettings, setUploadSettings] = useState({
        maxImages: 5,
        maxSizeMB: 1
    });
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
    const [modalInfo, setModalInfo] = useState({ isOpen: false, index: 0 });

    useEffect(() => {
        const fetchCategoriesAndSettings = async () => {
            try {
                const data = await getSettings();
                if (data.settings) {
                    if (data.settings.categories) {
                        setCategories(data.settings.categories);
                    }
                    setUploadSettings({
                        maxImages: data.settings.maxImagesPerItem || 5,
                        maxSizeMB: data.settings.maxImageSize || 1
                    });
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setCategories(['Electronics', 'Wallet/Purse', 'Keys', 'ID Card', 'Other']);
            }
        };
        fetchCategoriesAndSettings();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);

        // Validate number of files
        if (files.length > uploadSettings.maxImages) {
            toast.error(`You can only upload a maximum of ${uploadSettings.maxImages} images.`);
            e.target.value = '';
            return;
        }

        // Validate file size
        const oversizedFile = files.find(file => file.size > uploadSettings.maxSizeMB * 1024 * 1024);
        if (oversizedFile) {
            toast.error(`Each image must be smaller than ${uploadSettings.maxSizeMB} MB.`);
            e.target.value = '';
            return;
        }

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
            toast.success('Item reported successfully!');
            navigate('/dashboard');
        } catch (error) {
            toast.error(error, 'Failed to report item. Please try again.');
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
                                <svg className={`w-10 h-10 mx-auto mb-2 ${formData.type === 'lost' ? 'text-danger-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                <svg className={`w-10 h-10 mx-auto mb-2 ${formData.type === 'found' ? 'text-success-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

                {/* Images */}
                <div className="mb-6">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                        <div className="flex items-center text-blue-800 text-sm">
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>
                                You can upload up to <strong>{uploadSettings.maxImages} images</strong>.
                                Each image must be under <strong>{uploadSettings.maxSizeMB}MB</strong>.
                            </span>
                        </div>
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Upload Images
                        </label>
                        <span className="text-xs text-gray-500">{formData.images.length}/{uploadSettings.maxImages} selected</span>
                    </div>
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
                                <div key={idx} className="relative group cursor-pointer" onClick={() => setModalInfo({ isOpen: true, index: idx })}>
                                    <img
                                        src={url}
                                        alt={`Preview ${idx + 1} `}
                                        className="w-full h-24 object-cover rounded hover:opacity-90 transition-opacity"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-20 rounded">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                        </svg>
                                    </div>
                                </div>
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

            <ImageModal
                isOpen={modalInfo.isOpen}
                onClose={() => setModalInfo(prev => ({ ...prev, isOpen: false }))}
                images={previewImages}
                initialIndex={modalInfo.index}
            />
        </div>


    );
};

export default ReportItem;
