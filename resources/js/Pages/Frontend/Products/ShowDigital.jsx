// resources/js/Pages/Frontend/Products/ShowDigital.jsx
import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import FrontendLayout from '@/Layouts/Frontend/Layout';
import ProductCard from '@/Components/ProductCard';
import { Link, useForm, usePage } from '@inertiajs/react'; // Imported usePage
import SEO from '@/Components/SEO';
import { trackEvent } from '@/utils/analytics'; // Unified Tracking Utility

export default function ShowDigital({ product, relatedProducts }) {
    const { auth, global_settings } = usePage().props; // Extract auth and settings
    const viewTrackedRef = useRef(false);

    const { post, processing } = useForm({
        product_id: product.id,
        quantity: 1,
        color_id: null,
        size_id: null,
        color_name: null,
        size_name: null,
    });

    const price = parseFloat(product.price);
    let finalPrice = price;
    if (product.discount_value > 0) {
        finalPrice = product.discount_type === 'percent' 
            ? price - (price * (parseFloat(product.discount_value) / 100))
            : price - parseFloat(product.discount_value);
    }

    // --- Product View Tracking (GA4 view_item + Meta ViewContent) ---
    useEffect(() => {
        if (product && product.id && !viewTrackedRef.current) {
            // Internal Tracking
            axios.post(route('analytics.track'), { 
                product_id: product.id, 
                event_type: 'view' 
            }).catch(() => {});

            // Unified GA4 & Meta Tracking with Master Switch
            if (global_settings?.enable_meta_tracking !== '0') {
                trackEvent('view_item', {
                    currency: 'BDT',
                    value: finalPrice,
                    items: [{
                        item_id: product.sku || product.id.toString(),
                        item_name: product.name,
                        price: finalPrice,
                        quantity: 1,
                        item_category: product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized'
                    }]
                }, {
                    // User data for Meta CAPI Matching
                    em: auth?.user?.email || '',
                    ph: auth?.user?.phone || ''
                });
            }

            viewTrackedRef.current = true;
        }
    }, [product, finalPrice, global_settings, auth]);

    // --- Add to Cart Tracking (GA4 add_to_cart + Meta AddToCart) ---
    const handleAddToCart = () => {
        // Unified GA4 & Meta Tracking with Master Switch
        if (global_settings?.enable_meta_tracking !== '0') {
            trackEvent('add_to_cart', {
                currency: 'BDT',
                value: finalPrice,
                items: [{
                    item_id: product.sku || product.id.toString(),
                    item_name: product.name,
                    price: finalPrice,
                    quantity: 1,
                    item_category: product.categories?.length > 0 ? product.categories[0].name : 'Uncategorized'
                }]
            }, {
                // User data for Meta CAPI Matching
                em: auth?.user?.email || '',
                ph: auth?.user?.phone || ''
            });
        }

        // Internal Tracking
        axios.post(route('analytics.track'), { 
            product_id: product.id, 
            event_type: 'add_to_cart' 
        }).catch(() => {});

        post(route('cart.add'), { preserveScroll: true });
    };

    return (
        <FrontendLayout>
            <SEO 
                title={`${product.name} | Digital`} 
                description={product.short_description || product.description} 
                image={product.thumbnail ? `/storage/${product.thumbnail}` : undefined} 
            />

            <div className="py-12 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     {/* UI logic goes here. 
                         Ensure your "Add to Cart" button calls handleAddToCart.
                     */}
                </div>
            </div>
        </FrontendLayout>
    );
}