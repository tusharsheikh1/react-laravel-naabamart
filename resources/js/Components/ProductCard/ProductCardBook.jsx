import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

/**
 * ProductCardBook — Editorial / Literary aesthetic
 * Cream pages, ink blacks, serif typography, shadow-box feel like a real book.
 */
export default function ProductCardBook({ product, priority = false }) {
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

    // Derive author and publication from relationships
    const authorName = product.authors?.[0]?.name ?? product.author?.name ?? null;
    const pubName = product.publications?.[0]?.name ?? product.publication?.name ?? null;

    return (
        <Link href={route('product.show', product.slug)} className="group block h-full" style={{ textDecoration: 'none' }}>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=EB+Garamond:wght@400;500&display=swap');
                .bkcard { background: #fffdf8; border-radius: 4px; height: 100%; display: flex; flex-direction: column; border: 1px solid #e2ddd5; position: relative; transition: transform 0.3s ease, box-shadow 0.3s ease; }
                .bkcard:hover { transform: translateY(-6px) rotate(0.5deg); box-shadow: -6px 10px 40px rgba(30,20,10,0.15); }
                /* Spine effect on left */
                .bkcard::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 6px; background: linear-gradient(180deg, #8b6f47 0%, #5c4a2a 100%); border-radius: 4px 0 0 4px; }
                .bkcard__cover { position: relative; aspect-ratio: 3/4; overflow: hidden; background: #f5f0e8; margin-left: 6px; }
                .bkcard__cover-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
                .bkcard:hover .bkcard__cover-img { transform: scale(1.04); }
                .bkcard__discount { position: absolute; top: 10px; right: 10px; background: #c0392b; color: #fff; font-family: 'EB Garamond', serif; font-size: 11px; font-weight: 500; padding: 3px 8px; border-radius: 2px; letter-spacing: .05em; }
                .bkcard__body { padding: 16px 18px 18px 22px; display: flex; flex-direction: column; flex: 1; }
                .bkcard__author { font-family: 'EB Garamond', serif; font-size: 11px; color: #8b6f47; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 6px; }
                .bkcard__title { font-family: 'Playfair Display', serif; font-size: 15px; font-weight: 700; line-height: 1.35; color: #1a1208; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; min-height: 60px; }
                .bkcard__pub { font-family: 'EB Garamond', serif; font-size: 11px; color: #b0a090; margin-top: 8px; font-style: italic; }
                .bkcard__divider { border: none; border-top: 1px solid #e8e2d8; margin: 14px 0; }
                .bkcard__price-row { display: flex; align-items: baseline; gap: 8px; }
                .bkcard__price { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 700; color: #1a1208; }
                .bkcard__price-old { font-family: 'EB Garamond', serif; font-size: 14px; color: #bbb; text-decoration: line-through; }
                .bkcard__btn { margin-top: 14px; width: 100%; padding: 11px 0; background: #1a1208; color: #fffdf8; font-family: 'EB Garamond', serif; font-size: 13px; font-weight: 500; letter-spacing: .12em; text-transform: uppercase; border: none; border-radius: 2px; cursor: pointer; transition: background 0.2s ease; display: flex; align-items: center; justify-content: center; gap: 6px; }
                .bkcard__btn:hover { background: #8b6f47; }
                .bkcard__btn--added { background: #2e7d32; }
                .bkcard__btn--added:hover { background: #2e7d32; }
            `}</style>

            <div className="bkcard">
                {/* Cover image */}
                <div className="bkcard__cover">
                    {hasDiscount && <span className="bkcard__discount">−{discountPercentage}%</span>}
                    {product.thumbnail
                        ? <img src={`/storage/${product.thumbnail}`} alt={product.name} loading={priority ? 'eager' : 'lazy'} fetchpriority={priority ? 'high' : 'auto'} className="bkcard__cover-img" />
                        : <div className="bkcard__cover-img" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#bbb', fontSize: 12, fontFamily: 'serif' }}>NO COVER</div>
                    }
                </div>

                {/* Details */}
                <div className="bkcard__body">
                    {authorName && <p className="bkcard__author">{authorName}</p>}
                    <h3 className="bkcard__title">{product.name}</h3>
                    {pubName && <p className="bkcard__pub">Published by {pubName}</p>}

                    <hr className="bkcard__divider" />

                    <div className="bkcard__price-row">
                        <span className="bkcard__price">৳{Math.round(finalPrice).toLocaleString()}</span>
                        {hasDiscount && <span className="bkcard__price-old">৳{Math.round(price).toLocaleString()}</span>}
                    </div>

                    <button onClick={handleAddToCart} className={`bkcard__btn ${isAdded ? 'bkcard__btn--added' : ''}`}>
                        {isAdded ? (
                            <>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                                Added to Cart
                            </>
                        ) : (
                            <>
                                <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                Buy This Book
                            </>
                        )}
                    </button>
                </div>
            </div>
        </Link>
    );
}
