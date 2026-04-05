// resources/js/Components/FloatingSidebarCart.jsx
import { useState, useEffect } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import axios from 'axios';
import { confirmAction, closeConfirm, setConfirmProcessing } from '@/Components/ConfirmModal';

export default function FloatingSidebarCart() {
    const [isOpen, setIsOpen] = useState(false);
    
    // Get the globally shared cart object from HandleInertiaRequests
    const { cart } = usePage().props; 
    
    // Initialize Inertia form for patching (update) and deleting (remove) items
    const { patch, delete: destroy } = useForm();
    
    // Convert the cart Object into an Array to map over it easily for totals
    const cartItems = Object.values(cart || {});
    
    // Calculate total quantity of items in the cart
    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);

    // Calculate total price based on item price and quantity
    const cartTotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    // Prevent background scrolling when sidebar is open and dispatch global state event
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.dispatchEvent(new CustomEvent('cart-state-changed', { detail: true }));
        } else {
            document.body.style.overflow = 'unset';
            window.dispatchEvent(new CustomEvent('cart-state-changed', { detail: false }));
        }
        return () => {
            document.body.style.overflow = 'unset';
            window.dispatchEvent(new CustomEvent('cart-state-changed', { detail: false }));
        };
    }, [isOpen]);

    // Listen for the custom event to open the cart sidebar triggered by the "Buy Now" button
    useEffect(() => {
        const handleOpenCart = () => {
            setIsOpen(true);
        };
        window.addEventListener('open-cart-sidebar', handleOpenCart);
        
        return () => {
            window.removeEventListener('open-cart-sidebar', handleOpenCart);
        };
    }, []);

    // Function to update quantity directly from sidebar
    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        patch(route('cart.update', { cart_key: cartKey, quantity: newQty }), {
            preserveScroll: true
        });
    };

    // Function to remove item directly from sidebar
    const removeItem = (cartKey, productId) => {
        confirmAction({
            title: 'আইটেম ডিলিট করুন',
            message: 'আপনি কি নিশ্চিত যে কার্ট থেকে এই আইটেমটি মুছে ফেলতে চান?',
            confirmText: 'হ্যাঁ, মুছুন',
            cancelText: 'ক্যান্সেল',
            isDanger: true,
            onConfirm: () => {
                setConfirmProcessing(true);
                
                destroy(route('cart.remove', { cart_key: cartKey }), {
                    preserveScroll: true,
                    onSuccess: () => {
                        if (productId) {
                            axios.post(route('analytics.track'), {
                                product_id: productId,
                                event_type: 'remove_from_cart',
                            }).catch(e => {});
                        }
                        closeConfirm();
                    },
                    onFinish: () => {
                        setConfirmProcessing(false);
                    }
                });
            }
        });
    };

    return (
        <>
            {/* Injecting Custom CSS for the attractive checkout button */}
            <style>{`
                .sp-sidebar-buy-btn { 
                    width: 100%; height: 54px; 
                    background: linear-gradient(135deg, #10b981 0%, #166534 100%); 
                    color: white; border: none; border-radius: 12px; 
                    font-size: 1.15rem; font-weight: 800; letter-spacing: 0.02em; 
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; 
                    position: relative; overflow: hidden; 
                    box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); 
                    transition: all .3s cubic-bezier(0.4, 0, 0.2, 1); 
                    animation: sidebar-btn-pulse 2.5s infinite; 
                    text-shadow: 0 1px 2px rgba(0,0,0,0.2);
                }
                .sp-sidebar-buy-btn::before { 
                    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%; 
                    background: linear-gradient(to right, transparent, rgba(255,255,255,0.4), transparent); 
                    transform: skewX(-25deg); animation: sidebar-btn-shine 3s infinite; pointer-events: none; 
                }
                .sp-sidebar-buy-btn:hover:not(.disabled-btn) { 
                    transform: translateY(-2px) scale(1.01); 
                    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.5); 
                    filter: brightness(1.1); 
                    animation: none; 
                }
                .sp-sidebar-buy-btn:active:not(.disabled-btn) { transform: translateY(0) scale(0.98); }
                .sp-sidebar-buy-btn.disabled-btn { opacity: .7; cursor: not-allowed; filter: grayscale(0.5); animation: none; pointer-events: none; }

                @keyframes sidebar-btn-shine { 0% { left: -100%; } 20% { left: 200%; } 100% { left: 200%; } }
                @keyframes sidebar-btn-pulse { 0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); } 70% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); } 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); } }
            `}</style>

            {/* Background Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-[60] backdrop-blur-sm transition-opacity"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Panel */}
            <div className={`fixed inset-y-0 right-0 z-[70] w-full max-w-md bg-white shadow-2xl transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b bg-[#f8faf7]">
                    <h2 className="text-lg font-bold text-[#2d5a27] flex items-center gap-2">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                        </svg>
                        আপনার কার্ট ({cartCount} আইটেম)
                    </h2>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Object.keys(cart || {}).length > 0 ? (
                        Object.entries(cart).map(([cartKey, item]) => (
                            <div key={cartKey} className="flex gap-4 border-b border-gray-100 pb-4 last:border-0 relative group">
                                {/* Product Image */}
                                <div className="w-20 h-20 bg-[#F0F0F0] rounded-lg flex-shrink-0 overflow-hidden border border-gray-100">
                                    {item.thumbnail ? (
                                        <img src={`/storage/${item.thumbnail}`} alt={item.name} className="w-full h-full object-contain mix-blend-multiply" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                           <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="flex-1 flex flex-col justify-between">
                                    <div className="pr-6">
                                        <h3 className="font-semibold text-gray-800 text-sm line-clamp-2 leading-tight">{item.name}</h3>
                                        <div className="flex gap-2 text-xs text-gray-500 mt-1">
                                            {item.options?.size && <span>সাইজ: {item.options.size}</span>}
                                            {item.options?.color && <span>রঙ: {item.options.color}</span>}
                                        </div>
                                    </div>

                                    {/* Delete Button (Top Right) */}
                                    <button 
                                        type="button" 
                                        onClick={() => removeItem(cartKey, item.id)} 
                                        className="absolute top-0 right-0 text-gray-400 hover:text-[#FF3333] hover:bg-red-50 p-1.5 rounded-md transition-colors" 
                                        title="ডিলিট করুন"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                    </button>
                                    
                                    <div className="flex justify-between items-end mt-3">
                                        <span className="font-bold text-[#2d5a27] text-sm">৳{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                                        
                                        {/* Quantity Controller inside Sidebar */}
                                        <div className="flex items-center bg-[#F0F0F0] rounded-full px-2 py-1 gap-2">
                                            <button 
                                                type="button" 
                                                onClick={() => updateQuantity(cartKey, item.quantity - 1)} 
                                                className="w-6 h-6 flex items-center justify-center text-lg font-medium text-gray-600 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                -
                                            </button>
                                            <span className="font-semibold text-xs w-5 text-center select-none">{item.quantity}</span>
                                            <button 
                                                type="button" 
                                                onClick={() => updateQuantity(cartKey, item.quantity + 1)} 
                                                className="w-6 h-6 flex items-center justify-center text-lg font-medium text-gray-600 hover:text-black hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 opacity-70 space-y-3">
                            <svg className="w-16 h-16 mb-2" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                            </svg>
                            <p className="text-lg font-bold">আপনার কার্ট খালি!</p>
                            <p className="text-sm">পণ্য যোগ করে কেনাকাটা শুরু করুন।</p>
                        </div>
                    )}
                </div>

                {/* Footer / Checkout Actions */}
                <div className="border-t p-5 bg-white shadow-[0_-4px_15px_-3px_rgba(0,0,0,0.05)]">
                    <div className="flex justify-between items-center font-bold text-lg mb-4">
                        <span className="text-gray-700">সর্বমোট:</span>
                        <span className="text-[#2d5a27] text-xl">৳{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="space-y-3">
                        <Link 
                            href={route('checkout.index')} 
                            onClick={() => setIsOpen(false)}
                            className={`sp-sidebar-buy-btn ${cartItems.length === 0 ? 'disabled-btn' : ''}`}
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            অর্ডার সম্পন্ন করুন
                        </Link>
                        
                        <Link 
                            href={route('shop')}
                            onClick={() => setIsOpen(false)}
                            className="w-full flex justify-center items-center gap-2 bg-[#f4faf0] text-[#2d5a27] border border-[#2d5a27] py-3 rounded-xl font-bold hover:bg-[#eaf4e6] transition-colors"
                        >
                            কেনাকাটা চালিয়ে যান
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
}