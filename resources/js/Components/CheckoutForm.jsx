import React, { useState } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import axios from 'axios';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

/**
 * @param {number} productId - The ID of the product being purchased
 * @param {string} submitText - Custom text for the button (e.g., "Order Now")
 * @param {function} onSuccess - Callback for tracking or redirection
 */
export default function CheckoutForm({ productId, submitText = "Confirm Order", onSuccess }) {
    // Access global settings or auth status if needed
    const { auth, shipping_methods } = usePage().props;

    // Initialize form with essential high-conversion fields
    const { data, setData, post, processing, errors, reset } = useForm({
        product_id: productId,
        customer_name: auth?.user?.name || '',
        customer_phone: auth?.user?.phone || '',
        customer_address: '',
        quantity: 1,
        shipping_method_id: shipping_methods?.[0]?.id || '', // Default to first available method
        order_source: 'landing_page', // Helpful for analytics
    });

    // State to ensure we only fire the ATC event once
    const [hasTrackedATC, setHasTrackedATC] = useState(false);

    // Fire Add to Cart event when the user starts filling out the form
    const handleFirstInteraction = () => {
        if (!hasTrackedATC && productId) {
            setHasTrackedATC(true);
            
            // Fire add_to_cart event for analytics silently
            axios.post(route('analytics.track'), {
                product_id: productId,
                event_type: 'add_to_cart',
                metadata: { quantity: data.quantity }
            }).catch(() => {
                // Silently fail if tracking is blocked by adblockers
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        post(route('checkout.store'), {
            preserveScroll: true,
            onSuccess: (page) => {
                reset();
                if (onSuccess) onSuccess(page.props.order_id);
            },
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-4">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">
                    Shipping Information
                </h3>
                
                {/* Catch focus events on any inputs inside this div */}
                <div className="space-y-3" onFocusCapture={handleFirstInteraction}>
                    {/* Name Field */}
                    <div>
                        <InputLabel htmlFor="customer_name" value="Full Name" />
                        <TextInput
                            id="customer_name"
                            className="mt-1 block w-full"
                            value={data.customer_name}
                            onChange={(e) => {
                                handleFirstInteraction();
                                setData('customer_name', e.target.value);
                            }}
                            placeholder="Type your name"
                            required
                        />
                        <InputError message={errors.customer_name} className="mt-1" />
                    </div>

                    {/* Phone Field */}
                    <div>
                        <InputLabel htmlFor="customer_phone" value="Phone Number" />
                        <TextInput
                            id="customer_phone"
                            type="tel"
                            className="mt-1 block w-full"
                            value={data.customer_phone}
                            onChange={(e) => {
                                handleFirstInteraction();
                                setData('customer_phone', e.target.value);
                            }}
                            placeholder="017XXXXXXXX"
                            required
                        />
                        <InputError message={errors.customer_phone} className="mt-1" />
                    </div>

                    {/* Address Field */}
                    <div>
                        <InputLabel htmlFor="customer_address" value="Full Address" />
                        <textarea
                            id="customer_address"
                            className="mt-1 block w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm"
                            rows="2"
                            value={data.customer_address}
                            onChange={(e) => {
                                handleFirstInteraction();
                                setData('customer_address', e.target.value);
                            }}
                            placeholder="House, Road, Area..."
                            required
                        ></textarea>
                        <InputError message={errors.customer_address} className="mt-1" />
                    </div>
                </div>
            </div>

            {/* Quantity & Order Details */}
            <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-gray-600">Quantity:</span>
                    <div className="flex items-center border rounded">
                        <button 
                            type="button"
                            className="px-3 py-1 hover:bg-gray-100"
                            onClick={() => {
                                handleFirstInteraction();
                                setData('quantity', Math.max(1, data.quantity - 1));
                            }}
                        >-</button>
                        <span className="px-3 py-1 font-bold border-x">{data.quantity}</span>
                        <button 
                            type="button"
                            className="px-3 py-1 hover:bg-gray-100"
                            onClick={() => {
                                handleFirstInteraction();
                                setData('quantity', data.quantity + 1);
                            }}
                        >+</button>
                    </div>
                </div>
                
                <div className="text-right">
                    <span className="text-xs text-gray-500 block">Payment Method</span>
                    <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                         💵 Cash on Delivery
                    </span>
                </div>
            </div>

            {/* Submit Button */}
            <PrimaryButton 
                className="w-full justify-center py-4 text-lg font-bold shadow-lg transform active:scale-95 transition-transform"
                disabled={processing}
            >
                {processing ? 'Processing...' : submitText}
            </PrimaryButton>

            <p className="text-[11px] text-center text-gray-400">
                🔒 Safe & Secure Checkout. Pay when you receive the product.
            </p>
        </form>
    );
}