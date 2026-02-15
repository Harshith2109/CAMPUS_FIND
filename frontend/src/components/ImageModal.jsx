import { useState, useEffect, useCallback } from 'react';

const ImageModal = ({ images, initialIndex = 0, isOpen, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [prevInitialIndex, setPrevInitialIndex] = useState(initialIndex);

    if (initialIndex !== prevInitialIndex) {
        setPrevInitialIndex(initialIndex);
        setCurrentIndex(initialIndex);
    }

    const handlePrevious = useCallback((e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback((e) => {
        e?.stopPropagation();
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrevious();
        if (e.key === 'ArrowRight') handleNext();
    }, [onClose, handlePrevious, handleNext]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-90 transition-opacity p-4"
            onClick={onClose}
        >
            {/* Close Button */}
            <button
                className="absolute top-4 right-4 text-white hover:text-gray-300 z-[110] bg-black bg-opacity-50 p-2 rounded-full transition-colors"
                onClick={onClose}
            >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>

            {/* Content Container */}
            <div className="relative max-w-5xl w-full h-full flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                {/* Navigation - Left */}
                {images.length > 1 && (
                    <button
                        className="absolute left-0 text-white hover:text-gray-300 z-[110] bg-black bg-opacity-30 p-4 rounded-r-lg transition-all hover:bg-opacity-50"
                        onClick={handlePrevious}
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>
                )}

                {/* Image */}
                <div className="flex flex-col items-center">
                    <img
                        src={images[currentIndex]}
                        alt={`View ${currentIndex + 1}`}
                        className="max-h-[85vh] max-w-full object-contain select-none"
                    />
                    {images.length > 1 && (
                        <div className="text-white mt-4 font-medium bg-black bg-opacity-50 px-4 py-1 rounded-full">
                            {currentIndex + 1} / {images.length}
                        </div>
                    )}
                </div>

                {/* Navigation - Right */}
                {images.length > 1 && (
                    <button
                        className="absolute right-0 text-white hover:text-gray-300 z-[110] bg-black bg-opacity-30 p-4 rounded-l-lg transition-all hover:bg-opacity-50"
                        onClick={handleNext}
                    >
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ImageModal;
