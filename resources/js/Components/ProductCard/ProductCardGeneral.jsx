import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import axios from 'axios';

export default function ProductCardGeneral({ product, priority = false }) {
    const [isAdded, setIsAdded] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const price = parseFloat(product.price);
    let finalPrice = price;
    let hasDiscount = false;
    let discountPercentage = 0;

    if (product.discount_value > 0) {
        hasDiscount = true;
        if (product.discount_type === 'percent') {
            discountPercentage = Math.round(parseFloat(product.discount_value));
            finalPrice = price * (1 - discountPercentage / 100);
        } else {
            const discountAmount = parseFloat(product.discount_value);
            finalPrice = price - discountAmount;
            discountPercentage = Math.round((discountAmount / price) * 100);
        }
    }

    const isOutOfStock = product.stock_quantity !== undefined && product.stock_quantity <= 0;

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (isLoading || isAdded) return;

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

        setIsLoading(true);
        router.post(route('cart.add'), {
            product_id: product.id, quantity: 1, color_id: null, size_id: null,
        }, {
            preserveScroll: true, preserveState: true,
            onSuccess: () => {
                setIsLoading(false);
                setIsAdded(true);
                setTimeout(() => setIsAdded(false), 2400);
                // Analytics track removed from here to prevent session locking
            },
            onError: () => setIsLoading(false),
        });
    };

    return (
        <>
            <style>{`
                .pc-wrap {
                    display: flex; flex-direction: column; height: 100%;
                    text-decoration: none; position: relative;
                    font-family: 'DM Sans', sans-serif;
                }

                .pc-card {
                    background: #fff;
                    border: 1.5px solid #e8e4dc;
                    border-radius: 18px; overflow: hidden;
                    display: flex; flex-direction: column; height: 100%;
                    transition: border-color 0.28s, box-shadow 0.28s, transform 0.28s;
                    position: relative;
                }
                .pc-card:hover {
                    border-color: #c8dfc3;
                    box-shadow: 0 12px 40px rgba(45,90,39,.13);
                    transform: translateY(-4px);
                }

                .pc-img-area {
                    position: relative;
                    aspect-ratio: 4/5;
                    background: #f4f1eb;
                    overflow: hidden;
                    flex-shrink: 0;
                }
                .pc-img {
                    width: 100%; height: 100%;
                    object-fit: contain;
                    mix-blend-mode: multiply;
                    transition: transform 0.55s cubic-bezier(.23,1,.32,1);
                    padding: 8px;
                }
                .pc-card:hover .pc-img { transform: scale(1.07); }

                .pc-no-img {
                    width: 100%; height: 100%;
                    display: flex; align-items: center; justify-content: center;
                    color: #c0b8a8; font-size: 11px; letter-spacing: .05em;
                    font-weight: 600;
                }

                .pc-badge-wrap {
                    position: absolute; top: 10px; left: 10px;
                    display: flex; flex-direction: column; gap: 4px; z-index: 10;
                }
                .pc-badge-discount {
                    background: linear-gradient(135deg, #1a3a1a, #2d5a27);
                    color: #a8e063; font-size: 9.5px; font-weight: 800;
                    letter-spacing: .06em; padding: 3px 8px;
                    border-radius: 20px; line-height: 1.4;
                }

                .pc-oos {
                    position: absolute; inset: 0;
                    background: rgba(248,247,244,0.72);
                    display: flex; align-items: center; justify-content: center;
                    backdrop-filter: blur(2px); z-index: 10;
                }
                .pc-oos-label {
                    background: #1a3a1a; color: #fff;
                    font-size: 10px; font-weight: 800; letter-spacing: .12em;
                    text-transform: uppercase; padding: 6px 14px; border-radius: 20px;
                }

                .pc-hover-hint {
                    position: absolute; bottom: 0; left: 0; right: 0;
                    background: linear-gradient(0deg, rgba(26,58,26,.6), transparent);
                    padding: 16px 12px 8px;
                    opacity: 0; transform: translateY(4px);
                    transition: opacity 0.25s, transform 0.25s;
                    display: flex; justify-content: center; z-index: 5;
                }
                .pc-card:hover .pc-hover-hint { opacity: 1; transform: translateY(0); }
                .pc-hint-text {
                    font-size: 10px; font-weight: 700; color: rgba(255,255,255,.9);
                    letter-spacing: .08em; text-transform: uppercase;
                }

                .pc-body {
                    padding: 14px 16px 16px;
                    display: flex; flex-direction: column; flex: 1;
                }

                .pc-cat {
                    font-size: 9.5px; font-weight: 700; letter-spacing: .1em;
                    text-transform: uppercase; color: #7a9c6e; margin-bottom: 5px;
                    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
                }

                .pc-name {
                    font-family: 'Georgia', serif;
                    font-size: 13px; font-weight: 600; color: #1a3a1a;
                    line-height: 1.45; margin: 0;
                    display: -webkit-box; -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical; overflow: hidden;
                    min-height: 38px;
                    transition: color 0.2s;
                }
                .pc-card:hover .pc-name { color: #2d5a27; }

                .pc-price-row {
                    display: flex; align-items: center; gap: 8px;
                    margin-top: 12px; flex-wrap: wrap;
                }
                .pc-price {
                    font-family: 'Georgia', serif;
                    font-size: 19px; font-weight: 700; color: #1a3a1a; line-height: 1;
                }
                .pc-price-old {
                    font-size: 12px; color: #b0a898; text-decoration: line-through;
                    padding-bottom: 1px;
                }
                .pc-savings {
                    margin-left: auto;
                    font-size: 9px; font-weight: 800; letter-spacing: .05em;
                    color: #2d7a1a; background: #e8f5e0; padding: 2px 7px;
                    border-radius: 20px;
                }

                .pc-btn {
                    margin-top: 12px; width: 100%; position: relative; z-index: 30;
                    padding: 10px 12px; border-radius: 10px;
                    font-size: 11.5px; font-weight: 800; letter-spacing: .07em;
                    text-transform: uppercase; border: 1.5px solid;
                    cursor: pointer; transition: all 0.2s ease;
                    display: flex; align-items: center; justify-content: center; gap: 6px;
                    font-family: 'DM Sans', sans-serif;
                }
                .pc-btn--default {
                    background: #fff; border-color: #c8dfc3; color: #2d5a27;
                }
                .pc-btn--default:hover {
                    background: linear-gradient(135deg, #2d5a27, #1a3a1a);
                    color: #fff; border-color: transparent;
                    box-shadow: 0 4px 16px rgba(45,90,39,.25);
                    transform: translateY(-1px);
                }
                .pc-btn--loading {
                    background: #f0faea; border-color: #a8d8a0; color: #5a9a50;
                    cursor: wait;
                }
                .pc-btn--added {
                    background: #e8f5e0; border-color: #7dc46a; color: #2d7a1a;
                }
                .pc-btn--oos {
                    background: #f5f4f2; border-color: #e0dbd0; color: #b0a898;
                    cursor: not-allowed;
                }

                .pc-spinner {
                    width: 12px; height: 12px; border-radius: 50%;
                    border: 2px solid transparent; border-top-color: currentColor;
                    animation: pc-spin 0.6s linear infinite;
                }
                @keyframes pc-spin { to { transform: rotate(360deg); } }
            `}</style>

            <Link href={route('product.show', product.slug)} className="pc-wrap" style={{ textDecoration: 'none' }}>
                <div className="pc-card">
                    {/* Image */}
                    <div className="pc-img-area">
                        <div className="pc-badge-wrap">
                            {hasDiscount && (
                                <span className="pc-badge-discount">−{discountPercentage}%</span>
                            )}
                        </div>

                        {product.thumbnail ? (
                            <img
                                src={`/storage/${product.thumbnail}`}
                                alt={product.name}
                                loading={priority ? 'eager' : 'lazy'}
                                fetchPriority={priority ? 'high' : 'auto'}
                                className="pc-img"
                            />
                        ) : (
                            <div className="pc-no-img">NO IMAGE</div>
                        )}

                        {isOutOfStock && (
                            <div className="pc-oos">
                                <span className="pc-oos-label">Out of Stock</span>
                            </div>
                        )}

                        {!isOutOfStock && (
                            <div className="pc-hover-hint">
                                <span className="pc-hint-text">View Details</span>
                            </div>
                        )}
                    </div>

                    {/* Body */}
                    <div className="pc-body">
                        {product.categories?.[0] && (
                            <p className="pc-cat">{product.categories[0].name}</p>
                        )}
                        <h3 className="pc-name">{product.name}</h3>

                        <div className="pc-price-row">
                            <span className="pc-price">৳{Math.round(finalPrice).toLocaleString()}</span>
                            {hasDiscount && (
                                <span className="pc-price-old">৳{Math.round(price).toLocaleString()}</span>
                            )}
                            {hasDiscount && discountPercentage >= 10 && (
                                <span className="pc-savings">Save {discountPercentage}%</span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={isOutOfStock ? undefined : handleAddToCart}
                            disabled={isOutOfStock || isLoading}
                            className={`pc-btn ${
                                isOutOfStock ? 'pc-btn--oos'
                                : isLoading ? 'pc-btn--loading'
                                : isAdded ? 'pc-btn--added'
                                : 'pc-btn--default'
                            }`}
                        >
                            {isOutOfStock ? (
                                'Out of Stock'
                            ) : isLoading ? (
                                <>
                                    <span className="pc-spinner" />
                                    Adding…
                                </>
                            ) : isAdded ? (
                                <>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                    Added to Cart!
                                </>
                            ) : (
                                <>
                                    <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    Add to Cart
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </Link>
        </>
    );
}