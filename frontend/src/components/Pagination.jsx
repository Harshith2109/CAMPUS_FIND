import { ChevronLeft, ChevronRight } from 'lucide-react';
const Pagination = ({
    currentPage,
    totalPages,
    onPageChange,
    className = ''
}) => {
    const pages = [];
    const maxVisible = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className={`flex items-center justify-center gap-2 ${className}`}>
            {/* Previous Button */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ChevronLeft className="w-4 h-4" />
                Prev
            </button>

            {/* First Page */}
            {startPage > 1 && (
                <>
                    <button
                        onClick={() => onPageChange(1)}
                        className="btn btn-outline btn-sm"
                    >
                        1
                    </button>
                    {startPage > 2 && (
                        <span className="text-gray-500 px-2">...</span>
                    )}
                </>
            )}

            {/* Page Numbers */}
            {pages.map((page) => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`btn btn-sm ${currentPage === page
                            ? 'btn-primary'
                            : 'btn-outline'
                        }`}
                >
                    {page}
                </button>
            ))}

            {/* Last Page */}
            {endPage < totalPages && (
                <>
                    {endPage < totalPages - 1 && (
                        <span className="text-gray-500 px-2">...</span>
                    )}
                    <button
                        onClick={() => onPageChange(totalPages)}
                        className="btn btn-outline btn-sm"
                    >
                        {totalPages}
                    </button>
                </>
            )}

            {/* Next Button */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="btn btn-outline btn-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next
                <ChevronRight className="w-4 h-4" />
            </button>
        </div>
    );
};

export default Pagination;
