import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import SectionHeader from '../components/SectionHeader';
import { CirclePlus, ScanSearch, ShieldCheck } from 'lucide-react';

const Home = () => {
    const features = [
        {
            icon: (
                <CirclePlus className="w-8 h-8" />
            ),
            title: "Report Items",
            description: "Quickly report lost or found items with photos and detailed descriptions",
            color: "primary"
        },
        {
            icon: (
                <ScanSearch className="w-8 h-8" />
            ),
            title: "Auto-Match",
            description: "Our smart algorithm automatically matches lost and found items",
            color: "success"
        },
        {
            icon: (
                <ShieldCheck className="w-8 h-8" />
            ),
            title: "Claim & Verify",
            description: "Submit claims with proof and get verified by staff for secure returns",
            color: "warning"
        }
    ];

    const stats = [
        { label: "Items Reported", value: "500+", color: "primary" },
        { label: "Items Returned", value: "350+", color: "success" },
        { label: "Match Rate", value: "70%", color: "warning" },
        { label: "Happy Users", value: "1000+", color: "primary" }
    ];

    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <div className="section-container px-4 sm:px-6 lg:px-8 py-20 md:py-28">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            CampusFind
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-primary-100">
                            Smart Lost & Found Management System
                        </p>
                        <p className="text-base md:text-lg mb-12 max-w-2xl mx-auto text-primary-50">
                            Never lose track of your belongings again. Report lost items, find what you've lost,
                            and help others reunite with their possessions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
                                Get Started
                            </Link>
                            <Link to="/items" className="btn btn-lg bg-primary-700 text-white hover:bg-primary-800">
                                Browse Items
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="section">
                <div className="section-container">
                    <SectionHeader
                        title="How It Works"
                        subtitle="A simple 3-step process to find your lost items"
                        divided={false}
                    />
                    <div className="grid md:grid-cols-3 gap-8 mt-12">
                        {features.map((feature, index) => (
                            <div key={index} className="card-interactive text-center">
                                <div className={`w-16 h-16 bg-${feature.color}-100 rounded-full flex-center mx-auto mb-4`}>
                                    <div className={`text-${feature.color}-600`}>
                                        {feature.icon}
                                    </div>
                                </div>
                                <h3 className="h5 mb-2">{feature.title}</h3>
                                <p className="text-text-muted">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="section bg-bg-main">
                <div className="section-container">
                    <SectionHeader
                        title="Our Impact"
                        subtitle="Growing platform for campus communities"
                        divided={false}
                    />
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                label={stat.label}
                                value={stat.value}
                                color={stat.color}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section">
                <div className="section-container">
                    <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-8 sm:p-12 text-center text-white">
                        <h2 className="h3 mb-4">Ready to Get Started?</h2>
                        <p className="text-lg mb-8 text-primary-100 max-w-2xl mx-auto">
                            Join CampusFind today and never worry about lost items again
                        </p>
                        <Link to="/register" className="btn btn-lg bg-white text-primary-600 hover:bg-gray-100">
                            Create Free Account
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Home;
