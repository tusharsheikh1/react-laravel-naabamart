import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function MetaInitiateCheckout({ cart, cartDetails }) {
    const { global_settings, auth } = usePage().props;

    useEffect(() => {
        // Stop if cart is empty or tracking is disabled
        if (!cart || Object.keys(cart).length === 0 || global_settings?.enable_meta_tracking === '0') return;

        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `evt_ic_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const cartItems = Object.values(cart);
        
        // Safely extract the category from the first item in the cart
        const firstItem = cartItems[0];
        const categoryName = firstItem?.categories?.length > 0 
            ? firstItem.categories[firstItem.categories.length - 1].name 
            : (firstItem?.category?.name || '');

        const customData = {
            value: cartDetails?.subtotal || 0,
            currency: 'BDT',
            content_ids: cartItems.map(item => item.id || item.product_id),
            content_type: 'product',
            content_category: categoryName, // ✅ Added Category
            num_items: cartItems.length,
        };

        // 1. Client-Side
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'InitiateCheckout', customData, { eventID: eventId });
        }

        // 2. Server-Side
        axios.post('/tracking/meta-event', {
            event_name: 'InitiateCheckout',
            event_id: eventId,
            event_url: window.location.href,
            custom_data: customData,
            user_data: {
                em: auth?.user?.email || '',
                ph: auth?.user?.phone || '',
            }
        }).catch(() => {});

    }, []); // Only run once when checkout page mounts

    return null;
}