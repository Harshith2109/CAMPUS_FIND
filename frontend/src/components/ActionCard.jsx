const ActionCard = ({
    icon,
    title,
    description,
    action,
    color = 'primary',
    interactive = true,
    className = ''
}) => {
    const colorClasses = {
        primary: 'from-brand-primary to-brand-primary-hover',
        success: 'from-brand-success to-brand-success-hover',
        warning: 'from-brand-warning to-brand-warning-hover',
        danger: 'from-brand-danger to-brand-danger-hover'
    };

    const cardClass = interactive ? 'card-interactive' : 'card';

    return (
        <div className={`${cardClass} bg-gradient-to-br ${colorClasses[color]} text-white ${className}`}>
            <div className="flex items-start gap-4">
                {icon && (
                    <div className="flex-shrink-0 w-24 h-24 mr-4 flex items-center justify-center">
                        {icon}
                    </div>
                )}
                <div className="flex-1">
                    {title && <h3 className="text-lg font-semibold mb-1">{title}</h3>}
                    {description && <p className="text-white text-opacity-90 text-sm mb-3">{description}</p>}
                    {action && (
                        <div className="mt-4">
                            {action}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
