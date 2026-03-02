import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createItem } from '../services/itemService';
import { getSettings } from '../services/adminService';
import ImageModal from '../components/ImageModal';
import toast from '../utils/toast';
import {
    PackageSearch,
    Info,
    ZoomIn,
    PackagePlus,
    CirclePlus
} from 'lucide-react';

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
                <h1 className="text-3xl font-bold text-text-main text-center">Report an Item</h1>
                <p className="text-text-muted mt-2 text-center">Help us reunite lost items with their owners</p>
            </div>

            <form onSubmit={handleSubmit} className="card bg-bg-surface border border-border-main shadow-xl rounded-2xl p-6 md:p-8">
                {/* Type Selection */}
                <div className="mb-8">
                    <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-4">
                        What happened? *
                    </label>
                    <div className="grid grid-cols-2 gap-6">
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'lost' }))}
                            className={`p-6 border-2 rounded-2xl transition-all duration-300 group ${formData.type === 'lost'
                                ? 'border-brand-danger bg-brand-danger/10 shadow-lg shadow-brand-danger/5'
                                : 'border-border-main bg-bg-main hover:border-text-muted'
                                }`}
                        >
                            <div className="text-center">
                                <PackageSearch className={`w-12 h-12 mx-auto mb-3 transition-colors ${formData.type === 'lost' ? 'text-brand-danger' : 'text-text-muted group-hover:text-text-main'}`} />
                                <h3 className={`font-bold text-lg mb-1 ${formData.type === 'lost' ? 'text-brand-danger' : 'text-text-main'}`}>Lost Item</h3>
                                <p className="text-sm text-text-muted">I lost something</p>
                            </div>
                        </button>
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, type: 'found' }))}
                            className={`p-6 border-2 rounded-2xl transition-all duration-300 group ${formData.type === 'found'
                                ? 'border-brand-success bg-brand-success/10 shadow-lg shadow-brand-success/5'
                                : 'border-border-main bg-bg-main hover:border-text-muted'
                                }`}
                        >
                            <div className="text-center">
                                <PackagePlus className={`w-12 h-12 mx-auto mb-3 transition-colors ${formData.type === 'found' ? 'text-brand-success' : 'text-text-muted group-hover:text-text-main'}`} />
                                <h3 className={`font-bold text-lg mb-1 ${formData.type === 'found' ? 'text-brand-success' : 'text-text-main'}`}>Found Item</h3>
                                <p className="text-sm text-text-muted">I found something</p>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Item Name */}
                    <div>
                        <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                            Item Name *
                        </label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input focus:ring-brand-primary/20"
                            required
                            placeholder="e.g., iPhone 13 Pro"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Category */}
                        <div>
                            <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                                Category *
                            </label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="input focus:ring-brand-primary/20"
                                required
                            >
                                <option value="">Select a category</option>
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>

                        {/* Date */}
                        <div>
                            <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                                Date {formData.type === 'lost' ? 'Lost' : 'Found'} *
                            </label>
                            <input
                                type="date"
                                name="date"
                                value={formData.date}
                                onChange={handleChange}
                                className="input focus:ring-brand-primary/20"
                                required
                                max={new Date().toISOString().split('T')[0]}
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                            Location *
                        </label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className="input focus:ring-brand-primary/20"
                            required
                            placeholder="e.g., Library, Building A, Room 101"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                            Description *
                        </label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="input focus:ring-brand-primary/20"
                            rows="4"
                            required
                            placeholder="Provide detailed description..."
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-bold text-text-muted uppercase tracking-wider mb-2">
                            Color
                        </label>
                        <input
                            type="text"
                            name="color"
                            value={formData.color}
                            onChange={handleChange}
                            className="input focus:ring-brand-primary/20"
                            placeholder="e.g., Black, Blue"
                        />
                    </div>

                    {/* Images */}
                    <div className="pt-4 border-t border-border-main">
                        <div className="bg-brand-primary/5 border border-brand-primary/10 rounded-2xl p-4 mb-6">
                            <div className="flex items-center text-brand-primary text-sm font-medium">
                                <Info className="w-5 h-5 mr-3 flex-shrink-0" />
                                <span>
                                    You can upload up to <strong>{uploadSettings.maxImages} images</strong>.
                                    Each image must be under <strong>{uploadSettings.maxSizeMB}MB</strong>.
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-bold text-text-muted uppercase tracking-wider">
                                Upload Images
                            </label>
                            <span className="text-xs font-bold text-text-muted bg-bg-main px-2 py-1 rounded-md border border-border-main">
                                {formData.images.length}/{uploadSettings.maxImages}
                            </span>
                        </div>
                        <div className="relative group">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-primary/10 file:text-brand-primary hover:file:bg-brand-primary/20 cursor-pointer"
                            />
                        </div>

                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                                {previewImages.map((url, idx) => (
                                    <div key={idx} className="relative group cursor-pointer aspect-square rounded-xl overflow-hidden border-2 border-border-main hover:border-brand-primary transition-all" onClick={() => setModalInfo({ isOpen: true, index: idx })}>
                                        <img
                                            src={url}
                                            alt={`Preview ${idx + 1} `}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 backdrop-blur-[2px]">
                                            <ZoomIn className="w-6 h-6 text-white" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="btn btn-secondary flex-1 py-4 text-base font-bold shadow-sm"
                            disabled={submitting}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1 py-4 text-base font-bold shadow-lg shadow-brand-primary/20"
                            disabled={submitting}
                        >
                            {submitting ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <CirclePlus className="w-5 h-5 mr-2" />
                                    Report Item
                                </span>
                            )}
                        </button>
                    </div>
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
