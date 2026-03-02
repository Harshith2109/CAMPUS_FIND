const FormField = ({
    label,
    error,
    help,
    children,
    required = false,
    className = ''
}) => {
    return (
        <div className={`form-group ${className}`}>
            {label && (
                <label className="form-label">
                    {label}
                    {required && <span className="text-danger-500 ml-1">*</span>}
                </label>
            )}
            {children}
            {error && <p className="form-error">{error}</p>}
            {help && !error && <p className="form-help">{help}</p>}
        </div>
    );
};

export default FormField;
