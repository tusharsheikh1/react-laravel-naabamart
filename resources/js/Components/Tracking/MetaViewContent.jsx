import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function MetaViewContent({ product }) {
    const { global_settings, auth } = usePage().props;

    useEffect(() => {
        // Stop if no product or if tracking is explicitly disabled in settings
        if (!product || global_settings?.enable_meta_tracking === '0') return;

        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `evt_vc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Extract the primary category name safely
        const categoryName = product.categories?.length > 0 
            ? product.categories[product.categories.length - 1].name 
            : '';

        const customData = {
            content_name: product.name,
            content_ids: [product.id],
            content_type: 'product',
            content_category: categoryName, // ✅ Added Category
            value: product.selling_price || product.price || 0,
            currency: 'BDT',
        };

        // 1. Client-Side
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'ViewContent', customData, { eventID: eventId });
        }

        // 2. Server-Side
        axios.post('/tracking/meta-event', {
            event_name: 'ViewContent',
            event_id: eventId,
            event_url: window.location.href,
            custom_data: customData,
            user_data: {
                em: auth?.user?.email || '',
                ph: auth?.user?.phone || '',
            }
        }).catch(() => {});

    }, [product?.id]); // Re-run if the product ID changes (e.g., related products)

    return null; // Headless component, renders nothing
}