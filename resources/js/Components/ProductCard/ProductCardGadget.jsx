import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

/**
 * ProductCardGadget — Dark-tech / Industrial aesthetic
 * Deep charcoal, electric blue accents, sharp corners, scan-line texture.
 */
export default function ProductCardGadget({ product, priority = false }) {
    const [isAdded, setIsAdded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const price = parseFloat(product.price);
    let finalPrice = price;
    let hasDiscount = false;
    let discountAmount = 0;
    let discountPercentage = 0;

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
    const brandName = product.brand?.name ?? null;

    return (
        <Link
            href={route('product.show', product.slug)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className="group block h-full"
            style={{ textDecoration: 'none' }}
        >
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
                .gdcard { background: #0f1117; border-radius: 6px; height: 100%; display: flex; flex-direction: column; border: 1px solid #1e2333; position: relative; overflow: hidden; transition: border-color 0.25s, box-shadow 0.25s; font-family: 'Rajdhani', sans-serif; }
                .gdcard:hover { border-color: #3b82f6; box-shadow: 0 0 0 1px #3b82f6, 0 8px 40px rgba(59,130,246,0.2); }
                /* Corner decorations */
                .gdcard::before, .gdcard::after { content: ''; position: absolute; width: 14px; height: 14px; border-color: #3b82f6; border-style: solid; opacity: 0; transition: opacity 0.25s; z-index: 10; }
                .gdcard::before { top: 8px; left: 8px; border-width: 2px 0 0 2px; }
                .gdcard::after { bottom: 8px; right: 8px; border-width: 0 2px 2px 0; }
                .gdcard:hover::before, .gdcard:hover::after { opacity: 1; }
                .gdcard__img-wrap { position: relative; aspect-ratio: 1/1; background: #161b27; overflow: hidden; }
                /* Scan-line overlay */
                .gdcard__img-wrap::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px); pointer-events: none; }
                .gdcard__img { width: 100%; height: 100%; object-fit: contain; mix-blend-mode: normal; padding: 18px; transition: transform 0.5s cubic-bezier(.23,1,.32,1), filter 0.3s ease; filter: brightness(0.9); }
                .gdcard:hover .gdcard__img { transform: scale(1.07); filter: brightness(1.05) drop-shadow(0 0 16px rgba(59,130,246,0.25)); }
                .gdcard__save { position: absolute; top: 0; left: 0; background: #3b82f6; color: #fff; font-family: 'Share Tech Mono', monospace; font-size: 10px; padding: 4px 10px; letter-spacing: .06em; }
                .gdcard__oos { position: absolute; inset: 0; background: rgba(15,17,23,0.8); display: flex; align-items: center; justify-content: center; }
                .gdcard__oos-label { border: 1px solid #ef4444; color: #ef4444; font-size: 11px; font-weight: 700; padding: 5px 16px; letter-spacing: .15em; text-transform: uppercase; }
                .gdcard__body { padding: 14px 16px 18px; display: flex; flex-direction: column; flex: 1; }
                .gdcard__brand { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #3b82f6; letter-spacing: .15em; text-transform: uppercase; margin-bottom: 6px; }
                .gdcard__name { font-size: 15px; font-weight: 600; color: #e2e8f0; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 41px; }
                .gdcard__specs { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 10px; }
                .gdcard__spec { font-family: 'Share Tech Mono', monospace; font-size: 9px; color: #64748b; border: 1px solid #1e2333; padding: 2px 7px; border-radius: 2px; letter-spacing: .05em; }
                .gdcard__divider { border: none; border-top: 1px solid #1e2333; margin: 14px 0; }
                .gdcard__price-row { display: flex; align-items: baseline; gap: 10px; }
                .gdcard__price { font-family: 'Share Tech Mono', monospace; font-size: 22px; color: #f1f5f9; letter-spacing: -.01em; }
                .gdcard__price-old { font-family: 'Share Tech Mono', monospace; font-size: 13px; color: #475569; text-decoration: line-through; }
                .gdcard__btn { margin-top: 14px; width: 100%; padding: 11px 0; font-family: 'Rajdhani', sans-serif; font-size: 13px; font-weight: 700; letter-spacing: .15em; text-transform: uppercase; border: 1px solid; border-radius: 3px; cursor: pointer; transition: all 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 8px; }
                .gdcard__btn--default { background: transparent; border-color: #3b82f6; color: #3b82f6; }
                .gdcard__btn--default:hover { background: #3b82f6; color: #fff; box-shadow: 0 0 20px rgba(59,130,246,0.4); }
                .gdcard__btn--added { background: rgba(34,197,94,0.1); border-color: #22c55e; color: #22c55e; }
                .gdcard__btn--oos { border-color: #374151; color: #374151; cursor: not-allowed; }
            `}</style>

            <div className="gdcard">
                {/* Image */}
                <div className="gdcard__img-wrap">
                    {hasDiscount && <span className="gdcard__save">SAVE ৳{Math.round(discountAmount).toLocaleString()}</span>}
                    {product.thumbnail
                        ? <img src={`/storage/${product.thumbnail}`} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : 'auto'} className="gdcard__img" />
                        : <div className="gdcard__img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#334155', fontSize: 11, fontFamily: 'monospace' }}>[ NO IMAGE ]</div>
                    }
                    {isOutOfStock && (
                        <div className="gdcard__oos">
                            <span className="gdcard__oos-label">Unavailable</span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="gdcard__body">
                    {brandName && <p className="gdcard__brand">{brandName}</p>}
                    <h3 className="gdcard__name">{product.name}</h3>

                    {/* Optional spec tags from categories */}
                    {product.categories?.length > 0 && (
                        <div className="gdcard__specs">
                            {product.categories.slice(0, 3).map(c => (
                                <span key={c.id} className="gdcard__spec">{c.name}</span>
                            ))}
                        </div>
                    )}

                    <hr className="gdcard__divider" />

                    <div className="gdcard__price-row">
                        <span className="gdcard__price">৳{Math.round(finalPrice).toLocaleString()}</span>
                        {hasDiscount && <span className="gdcard__price-old">৳{Math.round(price).toLocaleString()}</span>}
                    </div>

                    <button
                        onClick={isOutOfStock ? undefined : handleAddToCart}
                        disabled={isOutOfStock}
                        className={`gdcard__btn ${isOutOfStock ? 'gdcard__btn--oos' : isAdded ? 'gdcard__btn--added' : 'gdcard__btn--default'}`}
                    >
                        {isOutOfStock ? 'Out of Stock' : isAdded ? (
                            <>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                Added to Cart
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
