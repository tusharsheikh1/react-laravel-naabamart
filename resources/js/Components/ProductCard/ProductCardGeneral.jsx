import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

/**
 * ProductCardGeneral — Organic / Natural aesthetic
 * Earthy greens, warm whites, soft shadows, botanical feel.
 */
export default function ProductCardGeneral({ product, priority = false }) {
    const [isAdded, setIsAdded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const price = parseFloat(product.price);
    let finalPrice = price;
    let hasDiscount = false;
    let discountPercentage = 0;
    let discountAmount = 0;

    if (product.discount_value > 0) {
        hasDiscount = true;
        if (product.discount_type === 'percent') {
            discountPercentage = Math.round(parseFloat(product.discount_value));
            discountAmount = price * (discountPercentage / 100);
            finalPrice = price - discountAmount;
        } else {
            discountAmount = parseFloat(product.discount_value);
            finalPrice = price - discountAmount;
            discountPercentage = Math.round((discountAmount / price) * 100);
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

    const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

    return (
        <Link
            href={route('product.show', product.slug)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group relative flex flex-col h-full"
            style={{ textDecoration: 'none' }}
        >
            <style>{`
                .pgcard { background: #faf9f6; border-radius: 20px; overflow: hidden; border: 1.5px solid #e8e4dc; transition: box-shadow 0.35s ease, transform 0.35s ease; }
                .pgcard:hover { box-shadow: 0 16px 48px rgba(45,80,40,0.13); transform: translateY(-4px); }
                .pgcard__img-wrap { position: relative; aspect-ratio: 4/5; background: #f0ede6; overflow: hidden; }
                .pgcard__img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: multiply; transition: transform 0.6s cubic-bezier(.23,1,.32,1); }
                .pgcard:hover .pgcard__img { transform: scale(1.06); }
                .pgcard__badge { position: absolute; top: 12px; left: 12px; background: #2d5a27; color: #fff; font-size: 10px; font-weight: 700; letter-spacing: .06em; padding: 4px 9px; border-radius: 20px; font-family: 'Georgia', serif; }
                .pgcard__oos { position: absolute; inset: 0; background: rgba(250,249,246,0.7); display: flex; align-items: center; justify-content: center; }
                .pgcard__oos-label { background: #1a3a1a; color: #fff; font-size: 11px; font-weight: 700; letter-spacing: .1em; padding: 6px 18px; border-radius: 20px; }
                .pgcard__body { padding: 16px 18px 18px; display: flex; flex-direction: column; flex: 1; }
                .pgcard__cat { font-size: 10px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: #7a9c6e; margin-bottom: 6px; font-family: 'Georgia', serif; }
                .pgcard__name { font-size: 14px; font-weight: 600; line-height: 1.4; color: #1a3a1a; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 40px; font-family: 'Georgia', serif; }
                .pgcard__price-row { display: flex; align-items: flex-end; gap: 8px; margin-top: 14px; }
                .pgcard__price { font-size: 20px; font-weight: 700; color: #1a3a1a; font-family: 'Georgia', serif; line-height: 1; }
                .pgcard__price-old { font-size: 12px; color: #aaa; text-decoration: line-through; padding-bottom: 2px; }
                .pgcard__btn { margin-top: 14px; width: 100%; padding: 11px 0; border-radius: 12px; font-size: 12px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; border: 1.5px solid; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; font-family: 'Georgia', serif; }
                .pgcard__btn--default { background: #fff; border-color: #c8dfc3; color: #2d5a27; }
                .pgcard__btn--default:hover { background: #2d5a27; color: #fff; border-color: #2d5a27; }
                .pgcard__btn--added { background: #f0faea; border-color: #7dc46a; color: #2d7a1a; }
                .pgcard__btn--oos { background: #f5f5f5; border-color: #ddd; color: #999; cursor: not-allowed; }
            `}</style>

            <div className="pgcard h-full flex flex-col">
                {/* Image */}
                <div className="pgcard__img-wrap">
                    {hasDiscount && (
                        <span className="pgcard__badge">−{discountPercentage}%</span>
                    )}
                    {product.thumbnail
                        ? <img src={`/storage/${product.thumbnail}`} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : 'auto'} className="pgcard__img" />
                        : <div className="pgcard__img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12 }}>NO IMAGE</div>
                    }
                    {isOutOfStock && (
                        <div className="pgcard__oos">
                            <span className="pgcard__oos-label">OUT OF STOCK</span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="pgcard__body">
                    {product.categories?.[0] && (
                        <p className="pgcard__cat">{product.categories[0].name}</p>
                    )}
                    <h3 className="pgcard__name">{product.name}</h3>

                    <div className="pgcard__price-row">
                        <span className="pgcard__price">৳{Math.round(finalPrice).toLocaleString()}</span>
                        {hasDiscount && <span className="pgcard__price-old">৳{Math.round(price).toLocaleString()}</span>}
                    </div>

                    <button
                        onClick={isOutOfStock ? undefined : handleAddToCart}
                        disabled={isOutOfStock}
                        className={`pgcard__btn ${isOutOfStock ? 'pgcard__btn--oos' : isAdded ? 'pgcard__btn--added' : 'pgcard__btn--default'}`}
                    >
                        {isOutOfStock ? 'Out of Stock' : isAdded ? (
                            <>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                Added!
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}
