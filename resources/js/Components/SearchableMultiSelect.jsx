import React, { useState, useRef, useEffect } from 'react';

export default function SearchableMultiSelect({ 
    options, 
    selectedIds, 
    onAdd, 
    onRemove, 
    placeholder = "Search...",
    color = "indigo" // Supports 'indigo', 'blue', 'green'
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    // Filter out already selected items and match search term
    const filteredOptions = options.filter(option => 
        !selectedIds.includes(option.id) &&
        option.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Close dropdown when clicking outside of it
    useEffect(() => {
        function handleClickOutside(event) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [wrapperRef]);

    // Theme dictionaries
    const colorClasses = {
        indigo: "bg-indigo-100 text-indigo-800",
        blue: "bg-blue-100 text-blue-800",
        green: "bg-green-100 text-green-800",
    };

    const buttonColorClasses = {
        indigo: "text-indigo-500 hover:bg-indigo-200 hover:text-indigo-900",
        blue: "text-blue-500 hover:bg-blue-200 hover:text-blue-900",
        green: "text-green-500 hover:bg-green-200 hover:text-green-900",
    };

    return (
        <div className="relative w-full" ref={wrapperRef}>
            <input
                type="text"
                className="w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder={placeholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onFocus={() => setIsOpen(true)}
            />
            
            {/* Dropdown Menu */}
            {isOpen && (
                <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map(option => (
                            <li
                                key={option.id}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm text-gray-700"
                                onClick={() => {
                                    onAdd(option.id);
                                    setSearchTerm('');
                                    setIsOpen(false); // Close on selection or keep open by removing this line
                                }}
                            >
                                {option.name}
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-2 text-sm text-gray-500 italic">No matching results.</li>
                    )}
                </ul>
            )}
            
            {/* Selected Item Tags */}
            <div className="flex flex-wrap gap-2 mt-3 min-h-[30px]">
                {selectedIds.map(id => {
                    const option = options.find(o => o.id == id);
                    if (!option) return null;
                    return (
                        <span key={id} className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color] || colorClasses.indigo}`}>
                            {option.name}
                            <button
                                type="button"
                                onClick={() => onRemove(id)}
                                className={`ml-2 flex-shrink-0 inline-flex h-4 w-4 items-center justify-center rounded-full focus:outline-none ${buttonColorClasses[color] || buttonColorClasses.indigo}`}
                            >
                                <span className="sr-only">Remove</span>
                                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </span>
                    );
                })}
            </div>
        </div>
    );
}