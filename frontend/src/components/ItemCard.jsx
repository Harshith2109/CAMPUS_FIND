import { Link } from 'react-router-dom';
import { getImageUrl, formatDate, getStatusColor, truncateText } from '../utils/helpers';

const ItemCard = ({ item }) => {
    const imageUrl = getImageUrl(item.images?.[0]);

    return (
        <Link to={`/items/${item._id}`} className="block">
            <div className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer h-full flex flex-col">
                {/* Image */}
                <div className="relative h-48 rounded-lg overflow-hidden bg-gray-200 mb-4 flex-shrink-0">
                    <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                    />
                    {/* Type Badge */}
                    <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${item.type === 'lost' ? 'bg-danger-500 text-white' : 'bg-success-500 text-white'
                        }`}>
                        {item.type === 'lost' ? 'Lost' : 'Found'}
                    </div>
                    {/* Match Badge */}
                    {item.matchedItems && item.matchedItems.length > 0 && (
                        <div className="absolute top-2 right-2 bg-primary-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            {item.matchedItems.length} Match{item.matchedItems.length > 1 ? 'es' : ''}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
                        {item.title}
                    </h3>

                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
                        {truncateText(item.description, 100)}
                    </p>

                    <div className="space-y-2 text-sm mt-auto">
                        <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            <span>{item.category}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{item.location}</span>
                        </div>

                        <div className="flex items-center text-gray-600">
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(item.date)}</span>
                        </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mt-4">
                        <span className={`badge ${getStatusColor(item.status)} capitalize`}>
                            {item.status}
                        </span>
                    </div>
                </div>
            </div>
        </Link>
    );
};

export default ItemCard;
