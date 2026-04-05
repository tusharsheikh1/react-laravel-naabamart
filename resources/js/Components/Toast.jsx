import { useEffect, useState } from 'react';

export default function Toast({ message, type = 'success', show, onClose }) {
    const [isLeaving, setIsLeaving] = useState(false);

    useEffect(() => {
        if (show) {
            setIsLeaving(false); // Reset state when a new toast arrives
            
            const timer = setTimeout(() => {
                handleClose();
            }, 4000); // 4 seconds before auto close
            
            return () => clearTimeout(timer);
        }
    }, [show]);

    const handleClose = () => {
        setIsLeaving(true); // Trigger exit animation
        setTimeout(() => {
            onClose(); // Triggers parent to change 'show' to false
            setIsLeaving(false); // Reset leaving state
        }, 300); // Wait for the 300ms animation to finish
    };

    // BUG FIX: Unmount immediately if not showing. 
    // Previously the invisible card stayed in the DOM blocking clicks underneath.
    if (!show) return null; 

    const isError = type === 'error';

    return (
        <div 
            // Responsive positioning and smooth transition
            className={`fixed top-4 right-0 sm:top-6 sm:right-6 z-[9999] w-full max-w-[340px] p-4 transition-all duration-300 ease-in-out pointer-events-none ${
                isLeaving ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'
            }`}
            style={{ 
                fontFamily: "'DM Sans', sans-serif",
                // Entrance animation
                animation: isLeaving ? 'none' : 'slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' 
            }}
        >
            {/* Modern Card Design */}
            <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 p-4 flex items-start gap-3 pointer-events-auto">
                
                {/* Soft Icon Container (Theme Matched) */}
                <div className={`shrink-0 p-2.5 rounded-full mt-0.5 ${
                    isError ? 'bg-red-50 text-red-500' : 'bg-[#f4faf0] text-[#2d5a27]'
                }`}>
                    {isError ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                </div>

                {/* Text Content */}
                <div className="flex-1">
                    <p className={`text-sm font-bold ${isError ? 'text-red-800' : 'text-gray-900'}`}>
                        {isError ? 'Error!' : 'Success!'}
                    </p>
                    <p className="text-sm text-gray-500 mt-0.5 leading-snug">
                        {message}
                    </p>
                </div>

                {/* Close Button */}
                <button 
                    onClick={handleClose} 
                    className="shrink-0 text-gray-400 hover:text-gray-800 hover:bg-gray-50 p-1.5 rounded-xl transition-colors focus:outline-none"
                    aria-label="Close"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>

            {/* Entrance Keyframe Animation */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(40px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
            `}} />
        </div>
    );
}