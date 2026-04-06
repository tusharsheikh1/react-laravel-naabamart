import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

/**
 * ProductCardFood — Street-market / Appetizing aesthetic
 * Saffron & chili palette, bold rounded shapes, big appetite-driving imagery.
 */
export default function ProductCardFood({ product, priority = false }) {
    const [isAdded, setIsAdded] = useState(false);
    const [ripple, setRipple] = useState(false);

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
        setRipple(true);
        setTimeout(() => setRipple(false), 500);

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
        <Link href={route('product.show', product.slug)} className="group block h-full" style={{ textDecoration: 'none' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');
                .fdcard { background: #fff; border-radius: 24px; height: 100%; display: flex; flex-direction: column; box-shadow: 0 2px 12px rgba(200,80,0,0.07); border: 1.5px solid #fde8cc; transition: transform 0.3s cubic-bezier(.34,1.56,.64,1), box-shadow 0.3s ease; font-family: 'Nunito', sans-serif; }
                .fdcard:hover { transform: translateY(-6px) scale(1.01); box-shadow: 0 20px 50px rgba(200,80,0,0.14); }
                .fdcard__img-wrap { position: relative; aspect-ratio: 1/1; border-radius: 20px; overflow: hidden; margin: 10px 10px 0; background: #fff8f0; }
                .fdcard__img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.55s cubic-bezier(.23,1,.32,1); }
                .fdcard:hover .fdcard__img { transform: scale(1.08); }
                .fdcard__badge-hot { position: absolute; top: 10px; left: 10px; background: linear-gradient(135deg, #e63b0a, #ff7043); color: #fff; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 20px; letter-spacing: .05em; text-transform: uppercase; }
                .fdcard__badge-sale { position: absolute; top: 10px; right: 10px; background: #fff; color: #e63b0a; font-size: 10px; font-weight: 900; padding: 4px 10px; border-radius: 20px; border: 1.5px solid #e63b0a; }
                .fdcard__oos-overlay { position: absolute; inset: 0; background: rgba(255,255,255,0.65); backdrop-filter: blur(2px); display: flex; align-items: center; justify-content: center; border-radius: 20px; }
                .fdcard__oos-label { background: #333; color: #fff; font-size: 11px; font-weight: 800; padding: 6px 16px; border-radius: 20px; letter-spacing: .1em; text-transform: uppercase; }
                .fdcard__body { padding: 14px 16px 18px; display: flex; flex-direction: column; flex: 1; }
                .fdcard__tag { font-size: 10px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: .1em; margin-bottom: 5px; }
                .fdcard__name { font-size: 15px; font-weight: 800; color: #1c0a00; line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; min-height: 41px; }
                .fdcard__footer { margin-top: auto; padding-top: 14px; display: flex; align-items: center; gap: 10px; }
                .fdcard__prices { display: flex; flex-direction: column; }
                .fdcard__price { font-size: 22px; font-weight: 900; color: #e63b0a; line-height: 1; }
                .fdcard__price-old { font-size: 12px; color: #bbb; text-decoration: line-through; font-weight: 600; margin-top: 2px; }
                .fdcard__btn { margin-left: auto; width: 46px; height: 46px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.2s cubic-bezier(.34,1.56,.64,1), background 0.2s ease; position: relative; overflow: hidden; }
                .fdcard__btn--default { background: linear-gradient(135deg, #ff7043, #e63b0a); color: #fff; box-shadow: 0 4px 14px rgba(230,59,10,0.4); }
                .fdcard__btn--default:hover { transform: scale(1.12); }
                .fdcard__btn--added { background: linear-gradient(135deg, #66bb6a, #388e3c); color: #fff; box-shadow: 0 4px 14px rgba(56,142,60,0.35); }
                .fdcard__btn--oos { background: #eee; color: #aaa; cursor: not-allowed; }
                .fdcard__btn .ripple { position: absolute; inset: 0; border-radius: 50%; background: rgba(255,255,255,0.4); animation: rippleAnim 0.5s ease-out forwards; }
                @keyframes rippleAnim { from { transform: scale(0); opacity: 1; } to { transform: scale(2.5); opacity: 0; } }
            `}</style>

            <div className="fdcard">
                {/* Image */}
                <div className="fdcard__img-wrap">
                    {hasDiscount && <span className="fdcard__badge-sale">−{discountPercentage}%</span>}
                    {product.is_popular && <span className="fdcard__badge-hot">🔥 Hot</span>}
                    {product.thumbnail
                        ? <img src={`/storage/${product.thumbnail}`} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : 'auto'} className="fdcard__img" />
                        : <div className="fdcard__img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: 13 }}>NO IMAGE</div>
                    }
                    {isOutOfStock && (
                        <div className="fdcard__oos-overlay">
                            <span className="fdcard__oos-label">Sold Out</span>
                        </div>
                    )}
                </div>

                {/* Body */}
                <div className="fdcard__body">
                    {product.categories?.[0] && <p className="fdcard__tag">{product.categories[0].name}</p>}
                    <h3 className="fdcard__name">{product.name}</h3>

                    <div className="fdcard__footer">
                        <div className="fdcard__prices">
                            <span className="fdcard__price">৳{Math.round(finalPrice).toLocaleString()}</span>
                            {hasDiscount && <span className="fdcard__price-old">৳{Math.round(price).toLocaleString()}</span>}
                        </div>

                        <button
                            onClick={isOutOfStock ? undefined : handleAddToCart}
                            disabled={isOutOfStock}
                            className={`fdcard__btn ${isOutOfStock ? 'fdcard__btn--oos' : isAdded ? 'fdcard__btn--added' : 'fdcard__btn--default'}`}
                        >
                            {ripple && <span className="ripple" />}
                            {isOutOfStock
                                ? <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                : isAdded
                                    ? <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                    : <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                            }
                        </button>
                    </div>
                </div>
            </div>
        </Link>
    );
}
