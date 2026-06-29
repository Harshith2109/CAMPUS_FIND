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
        primary: 'bg-brand-primary/10 border-brand-primary/20',
        success: 'bg-brand-success/10 border-brand-success/20',
        warning: 'bg-brand-warning/10 border-brand-warning/20',
        danger: 'bg-brand-danger/10 border-brand-danger/20'
    };

    const iconColorClasses = {
        primary: 'text-brand-primary',
        success: 'text-brand-success',
        warning: 'text-brand-warning',
        danger: 'text-brand-danger'
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
