// ThemeLayout.jsx  (updated)
import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';

// Theme Layouts
import GeneralLayout from './Themes/General/Layout';
import BookLayout from './Themes/Book/Layout';
import FoodLayout from './Themes/Food/Layout';
import GadgetLayout from './Themes/Gadget/Layout';
import DigitalLayout from './Themes/Digital/Layout';

import Toast from '@/Components/Toast';
import GlobalConfirmModal from '@/Components/ConfirmModal';
import FloatingContact from '@/Components/FloatingContact';
import FloatingSidebarCart from '@/Components/FloatingSidebarCart';

export default function ThemeLayout({ children }) {
    const { flash, global_settings } = usePage().props;
    const settings = global_settings || {};
    
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    useEffect(() => {
        if (flash?.success) {
            setToast({ show: true, message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ show: true, message: flash.error, type: 'error' });
        }
    }, [flash?.success, flash?.error]);

    const closeToast = () => setToast({ ...toast, show: false });

    // 1. Get Theme Layout
    const currentTheme = String(settings?.site_theme || 'general').toLowerCase();
    
    // 2. Get Global Theme Color + Background Color
    const themeColor = settings?.primary_color || '#2d5a27';
    const layoutBgColor = settings?.layout_bg_color || '#ffffff';   // ← NEW

    // 3. Render the specific theme layout with background color
    const renderTheme = () => {
        const layoutProps = { layoutBgColor };   // Pass to all themes

        switch (currentTheme) {
            case 'book': return <BookLayout {...layoutProps}>{children}</BookLayout>;
            case 'food': return <FoodLayout {...layoutProps}>{children}</FoodLayout>;
            case 'gadget': return <GadgetLayout {...layoutProps}>{children}</GadgetLayout>;
            case 'digital': return <DigitalLayout {...layoutProps}>{children}</DigitalLayout>;
            case 'general': 
            default: 
                return <GeneralLayout {...layoutProps}>{children}</GeneralLayout>;
        }
    };

    return (
        <>
            {settings?.site_favicon && (
                <Head>
                    <link rel="icon" href={`/storage/${settings.site_favicon}`} />
                </Head>
            )}

            <style dangerouslySetInnerHTML={{
                __html: `:root { 
                    --theme-color: ${themeColor}; 
                    --layout-bg: ${layoutBgColor};
                }`
            }} />

            {renderTheme()}

            <FloatingContact />
            <FloatingSidebarCart />
            
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
            <GlobalConfirmModal />
        </>
    );
}