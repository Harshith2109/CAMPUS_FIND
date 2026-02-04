import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../services/adminService';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-hot-toast';

const AdminSettings = () => {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [newCategory, setNewCategory] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const data = await getSettings();
            setSettings(data.settings);
        } catch (error) {
            console.error('Error fetching settings:', error);
            toast.error('Failed to load settings');
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
        updateSystemSettings({ [field]: !settings[field] });
    };

    const updateSystemSettings = async (updates) => {
        setSaving(true);
        try {
            const data = await updateSettings(updates);
            setSettings(data.settings);
            toast.success('Settings updated successfully');
        } catch (error) {
            console.error('Error updating settings:', error);
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">System Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Category Management */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Item Categories</h2>
                    <p className="text-gray-600 mb-4 text-sm">Manage the list of categories available for items.</p>

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
                            <span key={category} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                                {category}
                                <button
                                    onClick={() => handleRemoveCategory(category)}
                                    className="ml-2 text-gray-500 hover:text-red-500"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* General Settings */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">General Configuration</h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-medium text-gray-900">Allow User Registration</h3>
                                <p className="text-sm text-gray-500">If disabled, only admins can add new users.</p>
                            </div>
                            <button
                                onClick={() => handleToggle('allowRegistration')}
                                disabled={saving}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.allowRegistration ? 'bg-primary-600' : 'bg-gray-200'
                                    }`}
                            >
                                <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.allowRegistration ? 'translate-x-5' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <div className="border-t border-gray-100 pt-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-medium text-gray-900">Maintenance Mode</h3>
                                    <p className="text-sm text-gray-500">Disable detailed access for non-admin users.</p>
                                </div>
                                <button
                                    onClick={() => handleToggle('maintenanceMode')}
                                    disabled={saving}
                                    className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${settings?.maintenanceMode ? 'bg-primary-600' : 'bg-gray-200'
                                        }`}
                                >
                                    <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${settings?.maintenanceMode ? 'translate-x-5' : 'translate-x-0'
                                        }`} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
