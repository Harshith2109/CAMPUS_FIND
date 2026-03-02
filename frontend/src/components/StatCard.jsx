const StatCard = ({
    label,
    value,
    change,
    changeType = 'neutral',
    icon,
    color = 'primary',
    trend,
    className = ''
}) => {
    const colorClasses = {
        primary: 'bg-primary-50 border-primary-100 dark:bg-primary-900/20 dark:border-primary-800',
        success: 'bg-success-50 border-success-100 dark:bg-success-900/20 dark:border-success-800',
        warning: 'bg-warning-50 border-warning-100 dark:bg-warning-900/20 dark:border-warning-800',
        danger: 'bg-danger-50 border-danger-100 dark:bg-danger-900/20 dark:border-danger-800'
    };

    const iconColorClasses = {
        primary: 'text-primary-600 dark:text-primary-400',
        success: 'text-success-600 dark:text-success-400',
        warning: 'text-warning-600 dark:text-warning-400',
        danger: 'text-danger-600 dark:text-danger-400'
    };

    return (
        <div className={`stat-card ${colorClasses[color]} ${className}`}>
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <p className="stat-label">{label}</p>
                    <p className="stat-value">{value}</p>
                    {(change || trend) && (
                        <p className={`stat-change ${changeType}`}>
                            {trend && trend}
                            {change && (
                                <>
                                    {changeType === 'positive' && '↑ '}
                                    {changeType === 'negative' && '↓ '}
                                    {change}
                                </>
                            )}
                        </p>
                    )}
                </div>
                {icon && (
                    <div className={`flex-shrink-0 w-12 h-12 mr-2 flex items-center justify-center ${iconColorClasses[color]}`}>
                        {icon}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StatCard;
