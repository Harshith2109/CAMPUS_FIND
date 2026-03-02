const SectionHeader = ({
    title,
    subtitle,
    action,
    divided = false,
    className = ''
}) => {
    return (
        <div className={`section-header ${divided ? 'pb-4 border-b border-border-main' : ''} ${className}`}>
            <div className="flex-between">
                <div>
                    <h2 className="section-title">{title}</h2>
                    {subtitle && <p className="section-subtitle">{subtitle}</p>}
                </div>
                {action && (
                    <div className="flex-shrink-0">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SectionHeader;
