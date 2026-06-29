import { Link } from 'react-router-dom';
import { getImageUrl, formatDate, getStatusColor, truncateText } from '../utils/helpers';
import { MapPin, Calendar, Tag } from 'lucide-react';

const ItemCard = ({ item, plain = false }) => {
    const imageUrl = getImageUrl(item.images?.[0]);

    const CardContent = (
        <div className={`h-full flex flex-col ${!plain ? 'card hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''}`}>
            {/* Image */}
            <div className="relative h-48 rounded-lg overflow-hidden bg-bg-main mb-4 flex-shrink-0">
                <img
                    src={imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                />
                {/* Type Badge */}
                <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${item.type === 'lost' ? 'bg-brand-danger text-white' : 'bg-brand-success text-white'
                    }`}>
                    {item.type === 'lost' ? 'Lost' : 'Found'}
                </div>
                {/* Match Badge */}
                {item.matchedItems && item.matchedItems.length > 0 && (
                    <div className="absolute top-2 right-2 bg-brand-primary text-white px-2 py-1 rounded-full text-xs font-semibold">
                        {item.matchedItems.length} Match{item.matchedItems.length > 1 ? 'es' : ''}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col">
                <h3 className="text-lg font-semibold text-text-main mb-2 line-clamp-1">
                    {item.title}
                </h3>

                <p className="text-sm text-text-muted mb-3 line-clamp-2 flex-1">
                    {truncateText(item.description, 100)}
                </p>

                <div className="space-y-2 text-sm mt-auto">
                    <div className="flex items-center text-text-muted">
                        <Tag className="w-4 h-4 mr-2 text-brand-primary" />
                        <span>{item.category}</span>
                    </div>

                    <div className="flex items-center text-text-muted">
                        <MapPin className="w-4 h-4 mr-2 text-brand-primary" />
                        <span>{item.location}</span>
                    </div>

                    <div className="flex items-center text-text-muted">
                        <Calendar className="w-4 h-4 mr-2 text-brand-primary" />
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
    );

    if (plain) return CardContent;

    return (
        <Link to={`/items/${item._id}`} className="block h-full">
            {CardContent}
        </Link>
    );
};

export default ItemCard;
