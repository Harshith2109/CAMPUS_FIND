import { Link } from 'react-router-dom';
import { Settings, Hammer, Clock, ShieldCheck } from 'lucide-react';

const Maintenance = () => {
    return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-bg-main relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-5%] w-72 h-72 bg-brand-primary/10 rounded-full blur-3xl" />
                <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 bg-brand-secondary/10 rounded-full blur-3xl" />
            </div>

            <div className="max-w-md w-full text-center relative z-10">
                {/* Icon Animation Container */}
                <div className="relative inline-block mb-8">
                    <div className="p-6 bg-bg-surface border border-border-main rounded-3xl shadow-xl relative z-10">
                        <Hammer className="w-16 h-16 text-brand-primary animate-pulse" />
                    </div>
                    <div className="absolute -top-4 -right-4 p-3 bg-brand-secondary text-white rounded-2xl shadow-lg animate-bounce">
                        <Settings className="w-6 h-6" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-text-main mb-4 tracking-tight">
                    Under Maintenance
                </h1>

                <p className="text-lg text-text-muted mb-8 leading-relaxed">
                    CampusFind is currently undergoing scheduled maintenance to improve your experience. We'll be back shortly!
                </p>

                <div className="grid gap-4 mb-10">
                    <div className="flex items-center gap-4 p-4 bg-bg-surface border border-border-main/50 rounded-2xl transition-all hover:border-brand-primary/50">
                        <div className="p-2 bg-brand-primary/10 rounded-lg">
                            <Clock className="w-5 h-5 text-brand-primary" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text-main">Estimated Downtime</p>
                            <p className="text-xs text-text-muted">Less than 30 minutes</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-bg-surface border border-border-main/50 rounded-2xl transition-all hover:border-brand-secondary/50">
                        <div className="p-2 bg-brand-secondary/10 rounded-lg">
                            <ShieldCheck className="w-5 h-5 text-brand-secondary" />
                        </div>
                        <div className="text-left">
                            <p className="text-sm font-semibold text-text-main">Data Protection</p>
                            <p className="text-xs text-text-muted">Your records and claims are safe</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <p className="text-sm text-text-muted">
                        Are you an administrator?
                    </p>
                    <Link
                        to="/login"
                        className="btn btn-secondary w-full py-3 rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        Login as Admin
                    </Link>
                </div>

                <footer className="mt-12">
                    <p className="text-xs text-text-muted uppercase tracking-widest font-semibold opacity-50">
                        CampusFind &copy; {new Date().getFullYear()}
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default Maintenance;
