import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

/**
 * ProductCardDigital — Glass-morphism / SaaS aesthetic
 * Deep indigo-to-violet gradients, frosted glass panels, clean whitespace.
 */
export default function ProductCardDigital({ product, priority = false }) {
    const [isAdded, setIsAdded] = useState(false);

    const price = parseFloat(product.price);
    let finalPrice = price;
    let hasDiscount = false;
    let discountPercentage = 0;

    if (product.discount_value > 0) {
        hasDiscount = true;
        if (product.discount_type === 'percent') {
            discountPercentage = Math.round(parseFloat(product.discount_value));
            finalPrice = price - price * (discountPercentage / 100);
        } else {
            const da = parseFloat(product.discount_value);
            finalPrice = price - da;
            discountPercentage = Math.round((da / price) * 100);
        }
    }

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const eventId = crypto?.randomUUID?.() ?? `evt_${Date.now()}`;
        const customData = {
            value: finalPrice, currency: 'BDT',
            content_ids: [product.id], content_type: 'product',
            contents: [{ id: product.id, quantity: 1 }],
        };

        if (window.fbq) window.fbq('track', 'AddToCart', customData, { eventID: eventId });
        axios.post('/tracking/meta-event', {
            event_name: 'AddToCart', event_id: eventId,
            event_url: window.location.href, custom_data: customData,
        }).catch(() => {});

        router.post(route('cart.add'), {
            product_id: product.id, quantity: 1, color_id: null, size_id: null,
        }, {
            preserveScroll: true, preserveState: true,
            onSuccess: () => {
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2200);
                axios.post(route('analytics.track'), {
                    product_id: product.id, event_type: 'add_to_cart',
                }).catch(() => {});
            },
        });
    };

    // Derive a category label to use as "type tag"
    const typeLabel = product.categories?.[0]?.name ?? 'Digital';

    // Generate a deterministic gradient from the product name for cards without images
    const gradients = [
        'linear-gradient(135deg,#4f46e5,#7c3aed)',
        'linear-gradient(135deg,#0ea5e9,#6366f1)',
        'linear-gradient(135deg,#8b5cf6,#ec4899)',
        'linear-gradient(135deg,#14b8a6,#3b82f6)',
        'linear-gradient(135deg,#f59e0b,#ef4444)',
    ];
    const gradientBg = gradients[product.id % gradients.length];

    return (
        <Link href={route('product.show', product.slug)} className="group block h-full" style={{ textDecoration: 'none' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .dicard { background: #fff; border-radius: 16px; height: 100%; display: flex; flex-direction: column; border: 1px solid #e5e7eb; overflow: hidden; transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease; font-family: 'DM Sans', sans-serif; }
                .dicard:hover { transform: translateY(-5px); box-shadow: 0 24px 60px rgba(79,70,229,0.12); border-color: #a5b4fc; }
                .dicard__preview { position: relative; aspect-ratio: 16/9; overflow: hidden; }
                .dicard__preview-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .dicard:hover .dicard__preview-img { transform: scale(1.04); }
                .dicard__preview-fallback { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; }
                .dicard__preview-icon { width: 56px; height: 56px; background: rgba(255,255,255,0.15); border-radius: 14px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.25); }
                .dicard__badge-row { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; align-items: flex-start; }
                .dicard__type-tag { background: rgba(255,255,255,0.92); backdrop-filter: blur(10px); color: #4f46e5; font-size: 10px; font-weight: 600; padding: 3px 10px; border-radius: 20px; border: 1px solid rgba(165,180,252,0.5); letter-spacing: .05em; text-transform: uppercase; }
                .dicard__discount-tag { background: #4f46e5; color: #fff; font-size: 10px; font-weight: 700; padding: 3px 10px; border-radius: 20px; letter-spacing: .04em; }
                .dicard__body { padding: 18px 20px 20px; display: flex; flex-direction: column; flex: 1; }
                .dicard__name { font-size: 15px; font-weight: 600; color: #111827; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 42px; }
                .dicard__meta { display: flex; align-items: center; gap: 12px; margin-top: 10px; }
                .dicard__meta-item { display: flex; align-items: center; gap: 4px; font-size: 11px; color: #9ca3af; font-family: 'DM Mono', monospace; }
                .dicard__meta-dot { width: 5px; height: 5px; border-radius: 50%; background: #a5b4fc; }
                .dicard__divider { border: none; border-top: 1px solid #f3f4f6; margin: 16px 0; }
                .dicard__price-row { display: flex; align-items: center; justify-content: space-between; }
                .dicard__price-stack { display: flex; flex-direction: column; }
                .dicard__price { font-family: 'DM Mono', monospace; font-size: 22px; font-weight: 500; color: #4f46e5; letter-spacing: -.03em; }
                .dicard__price-old { font-family: 'DM Mono', monospace; font-size: 12px; color: #d1d5db; text-decoration: line-through; margin-top: 1px; }
                .dicard__btn { padding: 9px 18px; border-radius: 10px; font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.2s ease; letter-spacing: .02em; white-space: nowrap; }
                .dicard__btn--default { background: #4f46e5; color: #fff; }
                .dicard__btn--default:hover { background: #4338ca; box-shadow: 0 4px 16px rgba(79,70,229,0.35); }
                .dicard__btn--added { background: #dcfce7; color: #15803d; }
                .dicard__instant { margin-top: 12px; display: flex; align-items: center; gap: 6px; font-size: 11px; color: #9ca3af; }
                .dicard__instant svg { flex-shrink: 0; }
            `}</style>

            <div className="dicard">
                {/* Preview */}
                <div className="dicard__preview">
                    {product.thumbnail
                        ? <img src={`/storage/${product.thumbnail}`} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : 'auto'} className="dicard__preview-img" />
                        : (
                            <div className="dicard__preview-fallback" style={{ background: gradientBg }}>
                                <div className="dicard__preview-icon">
                                    <svg width="28" height="28" fill="none" stroke="white" viewBox="0 0 24 24" opacity="0.9">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                            </div>
                        )
                    }
                    <div className="dicard__badge-row">
                        <span className="dicard__type-tag">{typeLabel}</span>
                        {hasDiscount && <span className="dicard__discount-tag">−{discountPercentage}%</span>}
                    </div>
                </div>

                {/* Body */}
                <div className="dicard__body">
                    <h3 className="dicard__name">{product.name}</h3>

                    <div className="dicard__meta">
                        <span className="dicard__meta-item">
                            <span className="dicard__meta-dot" />
                            Instant Access
                        </span>
                        <span className="dicard__meta-item">
                            <span className="dicard__meta-dot" />
                            Digital Product
                        </span>
                    </div>

                    <hr className="dicard__divider" />

                    <div className="dicard__price-row">
                        <div className="dicard__price-stack">
                            <span className="dicard__price">৳{Math.round(finalPrice).toLocaleString()}</span>
                            {hasDiscount && <span className="dicard__price-old">৳{Math.round(price).toLocaleString()}</span>}
                        </div>

                        <button onClick={handleAddToCart} className={`dicard__btn ${isAdded ? 'dicard__btn--added' : 'dicard__btn--default'}`}>
                            {isAdded ? (
                                <>✓ Added</>
                            ) : 'Get Now →'}
                        </button>
                    </div>

                    <div className="dicard__instant">
                        <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Delivered instantly after purchase
                    </div>
                </div>
            </div>
        </Link>
    );
}
