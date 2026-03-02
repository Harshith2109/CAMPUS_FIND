import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const PasswordField = ({
    id,
    name,
    value,
    onChange,
    placeholder = "••••••••",
    required = false,
    label,
    className = "",
    autoComplete
}) => {
    const [showPassword, setShowPassword] = useState(false);

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className={`space-y-2 transition-colors duration-200 ${className}`}>
            {label && (
                <label htmlFor={id} className="block text-sm font-medium text-text-main">
                    {label}
                </label>
            )}
            <div className="relative group">
                <input
                    id={id}
                    name={name}
                    type={showPassword ? "text" : "password"}
                    required={required}
                    className="input pr-12 transition-all duration-200"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    autoComplete={autoComplete}
                />
                {value && (
                    <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-text-muted hover:text-brand-primary transition-colors duration-200 focus:outline-none"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PasswordField;
