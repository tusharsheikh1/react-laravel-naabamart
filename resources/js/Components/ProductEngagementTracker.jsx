import { useEffect, useRef } from 'react';
import axios from 'axios';

const ProductEngagementTracker = ({ productId }) => {
    const scrollMarkers = useRef(new Set());

    useEffect(() => {
        if (!productId) return;
        scrollMarkers.current.clear();

        const sendEvent = (type, value = null, metadata = {}) => {
            axios.post(route('analytics.track'), {
                product_id: productId,
                event_type: type,
                event_value: value,
                metadata: metadata
            }).catch(() => {});
        };

        // --- 1. Intersection Observer for Scroll Depth ---
        // Create invisible markers down the page mathematically
        const bodyHeight = document.body.scrollHeight;
        const depths = [25, 50, 75, 100];
        const observers = [];

        depths.forEach(marker => {
            // Create a temporary anchor element to observe
            const anchor = document.createElement('div');
            anchor.style.position = 'absolute';
            // Position it at the relative percentage of the document
            anchor.style.top = `${marker === 100 ? 98 : marker}%`; 
            anchor.style.height = '1px';
            anchor.style.width = '1px';
            anchor.style.pointerEvents = 'none';
            document.body.appendChild(anchor);

            const observer = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && !scrollMarkers.current.has(marker)) {
                    scrollMarkers.current.add(marker);
                    sendEvent('scroll', marker);
                    observer.disconnect(); // Stop observing once reached
                }
            }, { threshold: 0.1 });

            observer.observe(anchor);
            
            // Store reference to cleanup later
            observers.push({ observer, anchor }); 
        });

        // --- 2. Heatmap/Click Tracking ---
        const handleClick = (e) => {
            const target = e.target;
            sendEvent('heatmap_click', null, {
                tag: target.tagName,
                text: target.innerText?.substring(0, 20),
                id: target.id || null,
                class: target.className || null,
                x: e.pageX,
                y: e.pageY
            });
        };

        window.addEventListener('click', handleClick);

        return () => {
            window.removeEventListener('click', handleClick);
            // Cleanup DOM nodes and observers
            observers.forEach(({ observer, anchor }) => {
                observer.disconnect();
                if (document.body.contains(anchor)) {
                    document.body.removeChild(anchor);
                }
            });
        };
    }, [productId]);

    return null; 
};

export default ProductEngagementTracker;