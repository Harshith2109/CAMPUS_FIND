import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import toast from '../utils/toast';
import { X, Tags, LayoutGrid, FileUp } from 'lucide-react';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [saving, setSaving] = useState(false);
    const [formValues, setFormValues] = useState({
        maxImagesPerItem: '',
        maxImageSize: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data.settings);
            setFormValues({
                maxImagesPerItem: data.settings.maxImagesPerItem,
                maxImageSize: data.settings.maxImageSize
            });
        } catch (error) {
            toast.error(error, 'Failed to load settings');
        } finally {
            setLoading(false);
        }
    };

    const handleAddCategory = () => {
        if (!newCategory.trim()) return;
        if (settings.categories.includes(newCategory.trim())) {
            toast.error('Category already exists');
            return;
        }

        const updatedCategories = [...settings.categories, newCategory.trim()];
        updateSystemSettings({ categories: updatedCategories });
        setNewCategory('');
    };

    const handleRemoveCategory = (categoryToRemove) => {
        if (window.confirm(`Are you sure you want to remove "${categoryToRemove}"? Items with this category will remain unchanged.`)) {
            const updatedCategories = settings.categories.filter(c => c !== categoryToRemove);
            updateSystemSettings({ categories: updatedCategories });
        }
    };

    const handleToggle = (field) => {
        const newValue = !settings[field];
        updateSystemSettings({ [field]: newValue });
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveFileSettings = () => {
        const updates = {};
        if (formValues.maxImagesPerItem !== '') {
            updates.maxImagesPerItem = parseInt(formValues.maxImagesPerItem);
        }
        if (formValues.maxImageSize !== '') {
            updates.maxImageSize = parseFloat(formValues.maxImageSize);
        }

        if (Object.keys(updates).length > 0) {
            updateSystemSettings(updates);
        }
    };

    const updateSystemSettings = async (updates) => {
        setSaving(true);
        try {
            const data = await updateSettings(updates);
            setSettings(data.settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            toast.error(error, 'Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-text-main mb-8">System Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category Management */}
                <div className="bg-bg-surface rounded-xl shadow-sm border border-border-main p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-primary/10 rounded-lg text-brand-primary">
                            <Tags className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-text-main">Item Categories</h2>
                    </div>
                    <p className="text-text-muted mb-4 text-sm">Manage the list of categories available for items.</p>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            placeholder="New category name"
                            className="input"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                        />
                        <button
                            onClick={handleAddCategory}
                            disabled={saving || !newCategory.trim()}
                            className="btn btn-primary"
                        >
                            Add
                        </button>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {settings?.categories?.map((category) => (
                            <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-bg-main text-text-main border border-border-main">
                                {category}
                                <button
                                    onClick={() => handleRemoveCategory(category)}
                                    className="ml-2 text-text-muted hover:text-brand-danger"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* General Settings */}
                <div className="bg-bg-surface rounded-xl shadow-sm border border-border-main p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-success/10 rounded-lg text-brand-success">
                            <LayoutGrid className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-text-main">General Configuration</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-text-main">Allow User Registration</h3>
                                <p className="text-sm text-text-muted">If disabled, only admins can add new users.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('allowRegistration')}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.allowRegistration ? 'bg-brand-primary' : 'bg-border-main'
                                    }`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.allowRegistration ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <div className="border-t border-border-main/50 pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-text-main">Maintenance Mode</h3>
                                    <p className="text-sm text-text-muted">Disable detailed access for non-admin users.</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('maintenanceMode')}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.maintenanceMode ? 'bg-brand-primary' : 'bg-border-main'
                                        }`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* File Management Settings */}
                <div className="bg-bg-surface rounded-xl shadow-sm border border-border-main p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-brand-warning/10 rounded-lg text-brand-warning">
                            <FileUp className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold text-text-main">File Management</h2>
                    </div>
                    <p className="text-text-muted mb-4 text-sm">Configure upload limits for images.</p>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                Maximum Images per Item
                            </label>
                            <input
                                type="number"
                                name="maxImagesPerItem"
                                min="1"
                                max="20"
                                value={formValues.maxImagesPerItem}
                                onChange={handleFormChange}
                                className="input"
                                disabled={saving}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-text-muted mb-1">
                                Maximum Image Size (MB)
                            </label>
                            <input
                                type="number"
                                name="maxImageSize"
                                min="0.1"
                                step="0.1"
                                max="10"
                                value={formValues.maxImageSize}
                                onChange={handleFormChange}
                                className="input"
                                disabled={saving}
                            />
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSaveFileSettings}
                                disabled={saving || (!formValues.maxImagesPerItem && !formValues.maxImageSize)}
                                className="btn btn-primary w-full"
                            >
                                {saving ? 'Saving...' : 'Save File Settings'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
};

export default AdminSettings;
