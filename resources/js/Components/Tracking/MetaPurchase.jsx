import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function MetaPurchase({ order }) {
    const { global_settings } = usePage().props;
    const hasTracked = useRef(false); // Prevents duplicate firing in React Strict Mode

    useEffect(() => {
        if (!order || global_settings?.enable_meta_tracking === '0' || hasTracked.current) return;

        // Use the actual database order ID to ensure deduplication if page is refreshed
        const eventId = `evt_pur_${order.id}`; 

        // Safely extract product IDs
        const contentIds = order.items ? order.items.map(item => item.product_id) : [];

        // Safely extract category from the first order item's product (if eager loaded)
        const firstItem = order.items && order.items.length > 0 ? order.items[0] : null;
        const categoryName = firstItem?.product?.categories?.length > 0 
            ? firstItem.product.categories[firstItem.product.categories.length - 1].name 
            : (firstItem?.product?.category?.name || '');

        const customData = {
            value: order.grand_total || order.total_amount,
            currency: 'BDT',
            content_ids: contentIds,
            content_type: 'product',
            content_category: categoryName, // ✅ Added Category
            order_id: order.order_number || order.id,
            num_items: order.items ? order.items.length : 1, // ✅ Added num_items (Meta best practice)
        };

        // 1. Client-Side
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Purchase', customData, { eventID: eventId });
        }

        // 2. Server-Side
        axios.post('/tracking/meta-event', {
            event_name: 'Purchase',
            event_id: eventId,
            event_url: window.location.href,
            custom_data: customData,
            user_data: {
                ph: order.shipping_phone || order.customer_phone || '',
                em: order.customer_email || '',
                // Meta CAPI likes names hashed too if available
                fn: order.shipping_name || order.customer_name || '', 
            }
        }).catch(() => {});

        hasTracked.current = true;

    }, [order?.id]);

    return null;
}