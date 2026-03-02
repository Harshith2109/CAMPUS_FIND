import { Sun, Moon } from 'lucide-react';
import useTheme from '../hooks/useTheme';

const ThemeToggle = ({ className = "" }) => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg bg-bg-surface border border-border-main text-text-main hover:bg-bg-main transition-all duration-200 shadow-soft hover:shadow-medium focus:outline-none flex items-center justify-center ${className}`}
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
            {theme === 'light' ? (
                <Moon className="w-5 h-5 text-primary-600" />
            ) : (
                <Sun className="w-5 h-5 text-warning-500" />
            )}
        </button>
    );
};

export default ThemeToggle;
