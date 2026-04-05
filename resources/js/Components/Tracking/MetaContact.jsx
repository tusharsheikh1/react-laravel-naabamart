import { useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

export default function MetaContact({ trigger = null }) {
    const { global_settings, auth } = usePage().props;
    const lastTrigger = useRef(null);

    useEffect(() => {
        if (global_settings?.enable_meta_tracking === '0') return;

        if (trigger !== null) {
            if (trigger === lastTrigger.current) return;
            lastTrigger.current = trigger;
        } else {
            if (lastTrigger.current === 'mounted') return;
            lastTrigger.current = 'mounted';
        }

        const eventId = typeof crypto !== 'undefined' && crypto.randomUUID 
            ? crypto.randomUUID() 
            : `evt_con_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // 1. Client-Side Pixel
        if (typeof window !== 'undefined' && window.fbq) {
            window.fbq('track', 'Contact', {}, { eventID: eventId });
        }

        // 2. Server-Side CAPI
        axios.post('/tracking/meta-event', {
            event_name: 'Contact',
            event_id: eventId,
            event_url: window.location.href,
            user_data: {
                em: auth?.user?.email || '',
                ph: auth?.user?.phone || '',
            }
        }).catch(() => {});

    }, [trigger, global_settings?.enable_meta_tracking]);

    return null;
}