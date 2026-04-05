import { useEffect, useState } from 'react';

// ১. গ্লোবাল হেল্পার ফাংশন (যেকোনো কম্পোনেন্ট থেকে এগুলো কল করা যাবে)
export const confirmAction = (options) => {
    window.dispatchEvent(new CustomEvent('show-confirm-modal', { detail: options }));
};

export const closeConfirm = () => {
    window.dispatchEvent(new CustomEvent('close-confirm-modal'));
};

export const setConfirmProcessing = (isProcessing) => {
    window.dispatchEvent(new CustomEvent('set-confirm-processing', { detail: isProcessing }));
};

// ২. মেইন গ্লোবাল কম্পোনেন্ট (যা লেআউটে থাকবে)
export default function GlobalConfirmModal() {
    const [config, setConfig] = useState({
        show: false,
        title: 'আপনি কি নিশ্চিত?',
        message: 'এই অ্যাকশনটি সম্পন্ন করার পর আর পরিবর্তন করা সম্ভব নাও হতে পারে।',
        confirmText: 'হ্যাঁ, নিশ্চিত',
        cancelText: 'বাতিল করুন',
        isDanger: false,
        onConfirm: () => {},
        processing: false
    });

    useEffect(() => {
        // ইভেন্ট লিসেনারগুলো সেট করা হচ্ছে
        const showHandler = (e) => setConfig(prev => ({ ...prev, ...e.detail, show: true, processing: false }));
        const closeHandler = () => setConfig(prev => ({ ...prev, show: false }));
        const processingHandler = (e) => setConfig(prev => ({ ...prev, processing: e.detail }));

        window.addEventListener('show-confirm-modal', showHandler);
        window.addEventListener('close-confirm-modal', closeHandler);
        window.addEventListener('set-confirm-processing', processingHandler);

        return () => {
            window.removeEventListener('show-confirm-modal', showHandler);
            window.removeEventListener('close-confirm-modal', closeHandler);
            window.removeEventListener('set-confirm-processing', processingHandler);
        };
    }, []);

    // ব্যাকগ্রাউন্ড স্ক্রল বন্ধ করার জন্য
    useEffect(() => {
        if (config.show) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [config.show]);

    if (!config.show) return null;

    return (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 backdrop-blur-sm p-4 md:p-0 transition-opacity">
            <div 
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 md:p-8 transform transition-all animate-modal-pop"
                style={{ fontFamily: "'Hind Siliguri', 'DM Sans', sans-serif" }}
            >
                <div className="flex items-center justify-center mb-5">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center ${config.isDanger ? 'bg-red-50' : 'bg-green-50'}`}>
                        {config.isDanger ? (
                            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                            </svg>
                        ) : (
                            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        )}
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{config.title}</h3>
                    <p className="text-gray-500 text-sm md:text-base leading-relaxed">{config.message}</p>
                </div>

                <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-center">
                    <button
                        type="button"
                        onClick={closeConfirm}
                        disabled={config.processing}
                        className="w-full sm:w-auto px-6 py-2.5 bg-white text-gray-700 font-bold rounded-xl border border-gray-300 hover:bg-gray-50 hover:text-gray-900 transition-all disabled:opacity-50 focus:outline-none"
                    >
                        {config.cancelText}
                    </button>
                    
                    <button
                        type="button"
                        onClick={config.onConfirm}
                        disabled={config.processing}
                        className={`w-full sm:w-auto px-6 py-2.5 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 focus:outline-none ${
                            config.isDanger 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-[#2d5a27] hover:bg-[#1a3a1a]'
                        } disabled:opacity-70`}
                    >
                        {config.processing && (
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        )}
                        {config.confirmText}
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{__html: `
                @keyframes modal-pop {
                    0% { opacity: 0; transform: scale(0.95) translateY(10px); }
                    100% { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-modal-pop { animation: modal-pop 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}} />
        </div>
    );
}