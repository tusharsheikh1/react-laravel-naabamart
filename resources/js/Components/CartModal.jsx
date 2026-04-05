// resources/js/Components/CartModal.jsx
import { memo } from 'react';
import { Link } from '@inertiajs/react';

const IconCheck = (
    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
    </svg>
);

const IconCart = (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
    </svg>
);

const CartModal = memo(({ onClose, cartTotal, threshold, isFree }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        style={{ fontFamily: "'Hind Siliguri', sans-serif" }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
    >
        <div className="bg-white rounded-[20px] w-full max-w-md p-6 shadow-2xl reveal">
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    {IconCheck}
                </div>
                <h3 className="text-xl font-bold">সফলভাবে কার্টে যোগ করা হয়েছে!</h3>
                <p className="text-gray-500 text-sm mt-1">আপনি কি চেকআউট করতে চান নাকি আরও কেনাকাটা করতে চান?</p>
            </div>

            {/* Dynamic Free Shipping Progress Bar */}
            {threshold > 0 && (
                <div className="mb-6 bg-gray-50 border border-gray-100 rounded-2xl p-4">
                    {!isFree ? (
                        <>
                            <p className="text-xs text-gray-600 font-medium mb-2 text-center">
                                আর মাত্র <span className="font-bold text-[#2d5a27]">৳{(threshold - cartTotal).toLocaleString()}</span> টাকার কেনাকাটা করলে পাচ্ছেন <span className="font-bold">ফ্রি ডেলিভারি!</span>
                            </p>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                <div
                                    className="bg-[#2d5a27] h-full rounded-full transition-all duration-700"
                                    style={{ width: `${Math.min((cartTotal / threshold) * 100, 100)}%` }}
                                />
                            </div>
                        </>
                    ) : (
                        <p className="text-xs text-green-700 font-bold text-center">
                            🎉 অভিনন্দন! আপনি ফ্রি ডেলিভারি উপভোগ করছেন।
                        </p>
                    )}
                </div>
            )}

            <div className="space-y-3">
                <Link
                    href={route('checkout.index')}
                    style={{ background: 'linear-gradient(90deg, #2d5a27, #3a7a30)' }}
                    className="w-full flex justify-center items-center gap-2 text-white rounded-xl font-bold py-3.5 hover:opacity-90 transition-opacity"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                    অর্ডার সম্পন্ন করুন
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                </Link>
                
                <button
                    onClick={onClose}
                    className="w-full flex justify-center items-center gap-2 bg-[#f4faf0] text-[#2d5a27] border border-[#2d5a27] rounded-xl font-bold py-3.5 hover:bg-[#eaf4e6] transition-colors"
                >
                    {IconCart} আরও কেনাকাটা করুন
                </button>
            </div>
        </div>
    </div>
));

export default CartModal;