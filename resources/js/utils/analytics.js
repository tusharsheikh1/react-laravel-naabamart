// resources/js/utils/analytics.js

const generateEventId = () => {
    return 'evt_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

// Maps standard ecommerce events to Meta Standard Events
const getMetaEventName = (eventName) => {
    const metaEvents = {
        view_item: "ViewContent",
        add_to_cart: "AddToCart",
        begin_checkout: "InitiateCheckout",
        add_shipping_info: "AddPaymentInfo",
        add_payment_info: "AddPaymentInfo",
        purchase: "Purchase",
        search: "Search",
        remove_from_cart: "CustomEvent"
    };
    return metaEvents[eventName] || "CustomEvent";
};

// Formats ecommerce parameters into Meta's custom_data structure
const formatMetaCustomData = (eventName, params) => {
    const customData = {};

    if (params.value !== undefined) customData.value = params.value;
    if (params.currency) customData.currency = params.currency;

    if (params.items && Array.isArray(params.items)) {
        customData.content_ids = params.items.map(item => item.item_id || item.id);
        customData.content_type = "product";

        if (params.items.length === 1 && params.items[0].item_name) {
            customData.content_name = params.items[0].item_name;
            customData.content_category = params.items[0].item_category;
        }
    }

    if (params.transaction_id) customData.order_id = params.transaction_id;

    return customData;
};

const isEcommerceEvent = (eventName) => [
    'view_item', 'view_item_list', 'select_item', 'add_to_cart',
    'remove_from_cart', 'view_cart', 'begin_checkout', 'add_shipping_info',
    'add_payment_info', 'purchase', 'refund'
].includes(eventName);

export const trackEvent = (eventName, params = {}, userData = {}) => {
    if (typeof window === 'undefined') return;

    const eventId = generateEventId();

    // 1. Google Tag Manager (DataLayer)
    window.dataLayer = window.dataLayer || [];

    if (isEcommerceEvent(eventName)) {
        window.dataLayer.push({ ecommerce: null }); // Clear previous ecommerce object
        window.dataLayer.push({ event: eventName, ecommerce: params });
    } else {
        window.dataLayer.push({ event: eventName, ...params });
    }

    // 2. Meta Pixel (Browser Side)
    const metaEventName = getMetaEventName(eventName);
    const metaCustomData = formatMetaCustomData(eventName, params);

    if (typeof window.fbq === 'function') {
        if (metaEventName === "CustomEvent") {
            window.fbq("trackCustom", eventName, metaCustomData, { eventID: eventId });
        } else {
            window.fbq("track", metaEventName, metaCustomData, { eventID: eventId });
        }
    }

    // 3. Meta Conversions API (Server Side)
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content");

    fetch("/tracking/meta-event", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-CSRF-TOKEN": csrfToken
        },
        body: JSON.stringify({
            event_name: metaEventName === "CustomEvent" ? eventName : metaEventName,
            event_id: eventId,
            event_time: Math.floor(Date.now() / 1000),
            event_url: window.location.href,
            user_data: userData,
            custom_data: metaCustomData
        })
    }).catch(error => console.error("CAPI Tracking Error:", error));
};