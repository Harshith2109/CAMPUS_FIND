import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                    <div className="text-center">
                        <h1 className="text-5xl md:text-6xl font-bold mb-6">
                            CampusFind
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-primary-100">
                            Smart Lost & Found Management System
                        </p>
                        <p className="text-lg mb-12 max-w-2xl mx-auto text-primary-50">
                            Never lose track of your belongings again. Report lost items, find what you've lost,
                            and help others reunite with their possessions.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                                Get Started
                            </Link>
                            <Link to="/items" className="btn bg-primary-700 text-white hover:bg-primary-800 px-8 py-3 text-lg font-semibold">
                                Browse Items
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="text-center">
                        <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Report Items</h3>
                        <p className="text-gray-600">
                            Quickly report lost or found items with photos and detailed descriptions
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-success-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Auto-Match</h3>
                        <p className="text-gray-600">
                            Our smart algorithm automatically matches lost and found items
                        </p>
                    </div>

                    <div className="text-center">
                        <div className="w-16 h-16 bg-warning-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold mb-2">Claim & Verify</h3>
                        <p className="text-gray-600">
                            Submit claims with proof and get verified by staff for secure returns
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gray-50 py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8 text-center">
                        <div>
                            <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
                            <div className="text-gray-600">Items Reported</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-success-600 mb-2">350+</div>
                            <div className="text-gray-600">Items Returned</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-warning-600 mb-2">70%</div>
                            <div className="text-gray-600">Match Rate</div>
                        </div>
                        <div>
                            <div className="text-4xl font-bold text-purple-600 mb-2">1000+</div>
                            <div className="text-gray-600">Happy Users</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-12 text-center text-white">
                    <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 text-primary-100">
                        Join CampusFind today and never worry about lost items again
                    </p>
                    <Link to="/register" className="btn bg-white text-primary-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold inline-block">
                        Create Free Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Home;
