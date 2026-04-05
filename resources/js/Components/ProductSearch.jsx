import { useState, useRef, useEffect } from 'react';
import { router } from '@inertiajs/react';

export default function ProductSearch({ 
    className = '', 
    placeholder = "Search products...", 
    onSearchSuccess, 
    autoFocus = false 
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const inputRef = useRef(null);

    // Automatically focus the input when the autoFocus prop becomes true
    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') performSearch();
    };

    const performSearch = () => {
        if (searchTerm.trim()) {
            router.get(route('shop'), { search: searchTerm }, {
                preserveState: true,
            });
            if (onSearchSuccess) onSearchSuccess();
        }
    };

    const clearSearch = () => {
        setSearchTerm('');
        inputRef.current?.focus();
    };

    return (
        <div className={`relative flex items-center group ${className}`}>
            {/* Search Icon / Submit Button */}
            <button 
                onClick={performSearch}
                className="absolute left-3 p-1 text-emerald-600 hover:scale-110 transition-transform z-10"
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </button>

            <input
                ref={inputRef}
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full pl-10 pr-10 py-3 bg-emerald-50/50 border border-emerald-100 rounded-full text-sm focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all placeholder:text-gray-400 shadow-sm"
                placeholder={placeholder}
            />

            {/* Clear Button (X) - Only shows when there is text */}
            {searchTerm && (
                <button
                    onClick={clearSearch}
                    className="absolute right-3 p-1 text-gray-400 hover:text-emerald-600 transition-colors"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}