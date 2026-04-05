import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function MetaAddToCart({ product, quantity = 1, trigger = null }) {
    const { global_settings, auth } = usePage().props;
    const lastTrigger = useRef(null);

    useEffect(() => {
        // Stop if tracking is disabled or no product is provided
        if (!product || global_settings?.enable_meta_tracking === '0') return;

        // If a trigger is used (like a timestamp from a click), ensure it has changed
        if (trigger !== null) {
            if (trigger === lastTrigger.current) return;
            lastTrigger.current = trigger;
        } else {
            // If no trigger is provided, ensure it only fires once on mount
            if (lastTrigger.current === 'mounted') return;
            lastTrigger.current = 'mounted';
        }

        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `evt_atc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Extract the primary category name safely
        const categoryName = product.categories?.length > 0 
            ? product.categories[product.categories.length - 1].name 
            : '';

        const customData = {
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            content_category: categoryName, // ✅ Added Category to match ViewContent
            value: (product.selling_price || product.price || 0) * quantity,
            currency: 'BDT',
        };

        // 1. Client-Side Pixel
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'AddToCart', customData, { eventID: eventId });
        }

        // 2. Server-Side CAPI
        axios.post('/tracking/meta-event', {
            event_name: 'AddToCart',
            event_id: eventId,
            event_url: window.location.href,
            custom_data: customData,
            user_data: {
                em: auth?.user?.email || '',
                ph: auth?.user?.phone || '',
            }
        }).catch(() => {});

    }, [trigger, product?.id, quantity, global_settings?.enable_meta_tracking]);

    return null; // Headless component
}