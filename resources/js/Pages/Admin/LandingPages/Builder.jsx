import React, { useState, useEffect } from 'react';
import { Head, router } from '@inertiajs/react';
import { Editor, Frame, Element } from '@craftjs/core';

// Builder chrome
import { Topbar }  from '@/Features/PageBuilder/Topbar';
import { Sidebar } from '@/Features/PageBuilder/Sidebar';

// All widgets — every one MUST be in the resolver or Craft.js crashes silently
import { Container }            from '@/Features/PageBuilder/Components/Container';
import { HeadlineWidget }       from '@/Features/PageBuilder/Components/HeadlineWidget';
import { TextWidget }           from '@/Features/PageBuilder/Components/TextWidget';
import { ImageWidget }          from '@/Features/PageBuilder/Components/ImageWidget';
import { ImageSliderWidget }    from '@/Features/PageBuilder/Components/ImageSliderWidget';
import { BookWidget }           from '@/Features/PageBuilder/Components/Book/BookWidget';
import { HeroWidget }           from '@/Features/PageBuilder/Components/Hero/HeroWidget';
import { CheckoutWidget }       from '@/Features/PageBuilder/Components/Checkout/CheckoutWidget';
import { ProductWidget }        from '@/Features/PageBuilder/Components/Product/ProductWidget';
import { ProductVariantWidget } from '@/Features/PageBuilder/Components/ProductVariantWidget';
import { FeaturesWidget }       from '@/Features/PageBuilder/Components/Features/FeaturesWidget';
import { CountdownWidget }      from '@/Features/PageBuilder/Components/Countdown/CountdownWidget';
import { FaqWidget }            from '@/Features/PageBuilder/Components/FaqWidget';
import { TestimonialWidget }    from '@/Features/PageBuilder/Components/TestimonialWidget';
import { ButtonWidget }         from '@/Features/PageBuilder/Components/ButtonWidget';
import { VideoWidget }          from '@/Features/PageBuilder/Components/VideoWidget';
import { DividerWidget }        from '@/Features/PageBuilder/Components/DividerWidget';
import { CustomCodeWidget }     from '@/Features/PageBuilder/Components/CustomCodeWidget';

/**
 * Resolver map: keys MUST match the component function names exactly.
 */
const RESOLVER = {
    Container,
    HeadlineWidget,
    TextWidget,
    ImageWidget,
    ImageSliderWidget,
    BookWidget,
    HeroWidget,
    CheckoutWidget,
    ProductWidget,
    ProductVariantWidget,
    FeaturesWidget,
    CountdownWidget,
    FaqWidget,
    TestimonialWidget,
    ButtonWidget,
    VideoWidget,
    DividerWidget,
    CustomCodeWidget,
};

const DEVICE_WIDTHS = {
    desktop : '100%',
    tablet  : '768px',
    mobile  : '390px',
};

export default function Builder({ page }) {
    const [mounted,    setMounted]    = useState(false);
    const [device,     setDevice]     = useState('desktop');
    const [saving,     setSaving]     = useState(false);
    const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error' | null

    useEffect(() => { setMounted(true); }, []);

    const handleSave = (contentJson) => {
        setSaving(true);
        setSaveStatus(null);
        router.put(
            route('admin.landing-pages.save', page.id),
            { content_json: contentJson },
            {
                preserveState: true, preserveScroll: true,
                onSuccess : () => { setSaveStatus('success'); setTimeout(() => setSaveStatus(null), 3000); },
                onError   : () => setSaveStatus('error'),
                onFinish  : () => setSaving(false),
            }
        );
    };

    const handleSaveTracking = (trackingScripts) => {
        router.put(
            route('admin.landing-pages.save-tracking', page.id),
            { tracking_scripts: trackingScripts },
            { preserveState: true, preserveScroll: true }
        );
    };

    const savedJson = (() => {
        if (!page?.content_json) return null;
        if (typeof page.content_json === 'string') return page.content_json;
        return JSON.stringify(page.content_json);
    })();

    if (!mounted) {
        return (
            <div className="flex flex-col h-screen items-center justify-center bg-gray-100">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4" />
                <p className="text-gray-600 font-medium">Loading Page Builder…</p>
            </div>
        );
    }

    return (
        <Editor resolver={RESOLVER}>
            <Head>
                <title>{`Builder — ${page?.title || 'Loading'}`}</title>
                {/* Hind Siliguri Font Import for Builder Preview */}
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </Head>

            {/* In-editor Styles for Bangla Support */}
            <style dangerouslySetInnerHTML={{ __html: `
                .builder-canvas-font {
                    font-family: 'Hind Siliguri', sans-serif !important;
                }
                /* Ensures Google Font works within the Craft.js Editor context */
                .builder-canvas-font * {
                    font-family: 'Hind Siliguri', sans-serif;
                }
            `}} />

            <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">

                <Topbar
                    onSave={handleSave}
                    device={device}
                    setDevice={setDevice}
                    saving={saving}
                    saveStatus={saveStatus}
                    pageTitle={page.title}
                    pageSlug={page.slug}
                    page={page}
                    onSaveTracking={handleSaveTracking}
                />

                <div className="flex flex-1 overflow-hidden">

                    {/* Page canvas */}
                    <div className="flex-1 overflow-y-auto flex justify-center bg-gray-200 p-6">
                        <div
                            className="bg-white shadow-xl transition-all duration-300 builder-canvas-font"
                            style={{ width: DEVICE_WIDTHS[device], maxWidth: '100%', minHeight: '100vh' }}
                        >
                            <Frame data={savedJson}>
                                <Element
                                    is={Container}
                                    canvas
                                    bgColor="#ffffff"
                                    bgType="color"
                                    bgImage=""
                                    bgGradientFrom="#6366f1"
                                    bgGradientTo="#8b5cf6"
                                    bgGradientDirection={135}
                                    paddingTop={20}
                                    paddingBottom={20}
                                    paddingLeft={20}
                                    paddingRight={20}
                                    marginTop={0}
                                    marginBottom={0}
                                    flexDirection="column"
                                    alignItems="center"
                                    justifyContent="flex-start"
                                    borderWidth={0}
                                    borderColor="#e5e7eb"
                                    borderRadius={0}
                                    borderStyle="none"
                                    maxWidth={null}
                                    shadow="none"
                                />
                            </Frame>
                        </div>
                    </div>

                    <Sidebar />
                </div>
            </div>
        </Editor>
    );
}