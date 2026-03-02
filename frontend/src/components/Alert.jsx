import { CircleCheck, CircleX, TriangleAlert, Info, X } from 'lucide-react';

const Alert = ({
    type = 'info',
    title,
    message,
    onClose,
    action,
    icon
}) => {
    const typeClasses = {
        success: 'alert-success',
        error: 'alert-error',
        warning: 'alert-warning',
        info: 'alert-info'
    };

    const icons = {
        success: (
            <CircleCheck className="w-5 h-5" />
        ),
        error: (
            <CircleX className="w-5 h-5" />
        ),
        warning: (
            <TriangleAlert className="w-5 h-5" />
        ),
        info: (
            <Info className="w-5 h-5" />
        )
    };

    return (
        <div className={`alert ${typeClasses[type]} flex gap-3`}>
            <div className="flex-shrink-0">
                {icon || icons[type]}
            </div>
            <div className="flex-1">
                {title && <h3 className="font-semibold">{title}</h3>}
                {message && <p className={title ? 'text-sm mt-1' : ''}>{message}</p>}
            </div>
            <div className="flex-shrink-0 flex items-start gap-2">
                {action && <div>{action}</div>}
                {onClose && (
                    <button
                        onClick={onClose}
                        className="text-current opacity-50 hover:opacity-75 transition-opacity focus:outline-none"
                    >
                        <X className="w-5 h-5" />
                    </button>
                )}
            </div>
        </div>
    );
};

export default Alert;
