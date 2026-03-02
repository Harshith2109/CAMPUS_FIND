const Tabs = ({
    tabs,
    activeTab,
    onTabChange,
    variant = 'default'
}) => {
    const variantClasses = {
        default: 'border-b',
        underline: 'border-b',
        pills: 'gap-2'
    };

    const tabButtonClasses = {
        default: (isActive) =>
            `px-4 py-3 font-medium transition-colors border-b-2 ${isActive
                ? 'border-primary-600 text-primary-600'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`,
        pills: (isActive) =>
            `px-4 py-2 rounded-lg font-medium transition-colors ${isActive
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`
    };

    return (
        <div>
            <div className={`flex gap-1 ${variantClasses[variant]} ${variant === 'pills' ? 'flex-wrap' : ''}`}>
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={tabButtonClasses[variant](activeTab === tab.id)}
                    >
                        {tab.icon && <span className="mr-2">{tab.icon}</span>}
                        {tab.label}
                    </button>
                ))}
            </div>
            <div className="mt-4">
                {tabs.find(t => t.id === activeTab)?.content}
            </div>
        </div>
    );
};

export default Tabs;
