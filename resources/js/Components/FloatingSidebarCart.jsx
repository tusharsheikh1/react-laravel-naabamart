// resources/js/Components/FloatingSidebarCart.jsx
import { useState, useEffect } from 'react';
import { Link, usePage, useForm } from '@inertiajs/react';
import axios from 'axios';
import { confirmAction, closeConfirm, setConfirmProcessing } from '@/Components/ConfirmModal';
import useTranslation from '@/Hooks/useTranslation';

// ── Elegant Icons ─────────────────────────────────────────────────────────────
const Icon = {
    Cart: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
        </svg>
    ),
    X: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
        </svg>
    ),
    Trash: () => (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    ArrowRight: () => (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
        </svg>
    ),
    Secure: () => (
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
        </svg>
    )
};

export default function FloatingSidebarCart() {
    const { __ } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const { cart } = usePage().props; 
    const { patch, delete: destroy } = useForm();
    
    const cartItems = Object.values(cart || {});
    const cartCount = cartItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
    const cartTotal = cartItems.reduce((acc, item) => acc + (parseFloat(item.price) * item.quantity), 0);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.dispatchEvent(new CustomEvent('cart-state-changed', { detail: true }));
        } else {
            document.body.style.overflow = 'unset';
            window.dispatchEvent(new CustomEvent('cart-state-changed', { detail: false }));
        }
    }, [isOpen]);

    useEffect(() => {
        const handleOpenCart = () => setIsOpen(true);
        window.addEventListener('open-cart-sidebar', handleOpenCart);
        return () => window.removeEventListener('open-cart-sidebar', handleOpenCart);
    }, []);

    const updateQuantity = (cartKey, newQty) => {
        if (newQty < 1) return;
        patch(route('cart.update', { cart_key: cartKey, quantity: newQty }), {
            preserveScroll: true
        });
    };

    const removeItem = (cartKey, productId) => {
        confirmAction({
            title: __('Remove Item'),
            message: __('Are you sure you want to remove this item from your cart?'),
            confirmText: __('Yes, Remove'),
            cancelText: __('Cancel'),
            isDanger: true,
            onConfirm: () => {
                setConfirmProcessing(true);
                destroy(route('cart.remove', { cart_key: cartKey }), {
                    preserveScroll: true,
                    onSuccess: () => {
                        // Analytics track removed to prevent session locking and freezing
                        closeConfirm();
                    },
                    onFinish: () => setConfirmProcessing(false)
                });
            }
        });
    };

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap');
                
                .cart-sidebar-root {
                    font-family: 'Hind Siliguri', sans-serif;
                }

                .dark-checkout-btn { 
                    width: 100%; height: 58px; 
                    background: #111827; 
                    color: #ffffff; border: none; border-radius: 12px; 
                    font-size: 1.05rem; font-weight: 700; 
                    cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 12px; 
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
                }

                .dark-checkout-btn:hover:not(.disabled) { 
                    background: #000000;
                    transform: translateY(-2px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.2);
                }

                .dark-checkout-btn.disabled {
                    background: #374151; opacity: 0.6; cursor: not-allowed;
                }

                .qty-pill {
                    background: #f3f4f6;
                    border: 1px solid #e5e7eb;
                    border-radius: 99px;
                    display: flex;
                    align-items: center;
                    padding: 2px;
                }

                .qty-action {
                    width: 28px; height: 28px;
                    display: flex; align-items: center; justify-content: center;
                    border-radius: 50%;
                    color: #374151;
                    transition: all 0.2s;
                }

                .qty-action:hover {
                    background: #ffffff;
                    color: #111827;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
                }

                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
            `}</style>

            {/* Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-gray-900/60 z-[60] backdrop-blur-[3px] transition-opacity duration-500"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`cart-sidebar-root fixed inset-y-0 right-0 z-[70] w-full max-w-[420px] bg-white shadow-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                
                {/* Header: Dark Aesthetic */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                            <Icon.Cart />
                            {__('Shopping Cart')}
                        </h2>
                        <p className="text-[11px] uppercase tracking-widest text-emerald-600 font-bold mt-1">
                            {cartCount} {__('Items Selected')}
                        </p>
                    </div>
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <Icon.X />
                    </button>
                </div>
                
                {/* Cart Items */}
                <div className="flex-1 overflow-y-auto px-6 py-4 custom-scrollbar">
                    {cartItems.length > 0 ? (
                        cartItems.map((item, index) => {
                            const cartKey = Object.keys(cart)[index];
                            return (
                                <div key={cartKey} className="flex gap-4 py-5 border-b border-gray-50 last:border-0 group animate-in fade-in slide-in-from-right-5 duration-300">
                                    <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0 p-1">
                                        <img 
                                            src={`/storage/${item.thumbnail}`} 
                                            alt={item.name} 
                                            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" 
                                        />
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                                        <div className="relative pr-8">
                                            <h3 className="text-[14px] font-bold text-gray-800 leading-snug line-clamp-2 uppercase tracking-tight">
                                                {item.name}
                                            </h3>
                                            {(item.options?.size || item.options?.color) && (
                                                <div className="flex gap-2 mt-1.5">
                                                    {item.options?.size && <span className="text-[10px] font-bold text-gray-400 uppercase">Size: {item.options.size}</span>}
                                                    {item.options?.color && <span className="text-[10px] font-bold text-gray-400 uppercase">Color: {item.options.color}</span>}
                                                </div>
                                            )}
                                            
                                            <button 
                                                onClick={() => removeItem(cartKey, item.id)} 
                                                className="absolute top-0 right-0 text-gray-300 hover:text-rose-500 transition-colors"
                                            >
                                                <Icon.Trash />
                                            </button>
                                        </div>

                                        <div className="flex items-center justify-between mt-3">
                                            <span className="text-lg font-black text-gray-900">৳{(parseFloat(item.price) * item.quantity).toLocaleString('en-IN')}</span>
                                            
                                            <div className="qty-pill">
                                                <button onClick={() => updateQuantity(cartKey, item.quantity - 1)} className="qty-action">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path d="M20 12H4" /></svg>
                                                </button>
                                                <span className="text-xs font-bold w-8 text-center text-gray-700">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(cartKey, item.quantity + 1)} className="qty-action">
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path d="M12 4v16m8-8H4" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Icon.Cart />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">{__('Empty Cart')}</h3>
                            <p className="text-sm mt-1">{__('Start adding items to your bag')}</p>
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className="border-t border-gray-100 p-6 bg-gray-50/50">
                    <div className="flex justify-between items-end mb-6">
                        <div>
                            <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{__('Total Amount')}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{__('Taxes and shipping calculated at checkout')}</p>
                        </div>
                        <span className="text-3xl font-black text-gray-900 tracking-tighter">৳{cartTotal.toLocaleString('en-IN')}</span>
                    </div>
                    
                    <div className="space-y-3">
                        <Link 
                            href={route('checkout.index')} 
                            onClick={() => setIsOpen(false)}
                            className={`dark-checkout-btn ${cartItems.length === 0 ? 'disabled' : ''}`}
                        >
                            {__('Complete Order')}
                            <Icon.ArrowRight />
                        </Link>
                        
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                        >
                            {__('Continue Shopping')}
                        </button>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[#c5a05f]">
                        <Icon.Secure />
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-gray-400">
                            {__('Secure Checkout Active')}
                        </span>
                    </div>
                </div>

            </div>
        </>
    );
}