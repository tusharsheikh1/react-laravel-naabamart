import React, { useState, useEffect } from 'react';
import { usePage, Head } from '@inertiajs/react';

import GeneralLayout from './Themes/General/Layout';
import BookLayout from './Themes/Book/Layout';
import FoodLayout from './Themes/Food/Layout';

import Toast from '@/Components/Toast';
import GlobalConfirmModal from '@/Components/ConfirmModal';
import FloatingContact from '@/Components/FloatingContact';
import FloatingSidebarCart from '@/Components/FloatingSidebarCart';

export default function ThemeLayout({ children }) {
    const { flash, global_settings } = usePage().props;
    const settings = global_settings || {};
    
    const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

    // FIX: Depend strictly on the string values to prevent infinite re-render loops
    useEffect(() => {
        if (flash?.success) {
            setToast({ show: true, message: flash.success, type: 'success' });
        } else if (flash?.error) {
            setToast({ show: true, message: flash.error, type: 'error' });
        }
    }, [flash?.success, flash?.error]);

    const closeToast = () => setToast({ ...toast, show: false });

    // 1. Get Theme Layout (safely fallback)
    const currentTheme = String(settings?.site_theme || 'general').toLowerCase();
    
    // 2. Get Global Theme Color (Fallback to green)
    const themeColor = settings?.primary_color || '#2d5a27';

    const renderTheme = () => {
        switch (currentTheme) {
            case 'book': return <BookLayout>{children}</BookLayout>;
            case 'food': return <FoodLayout>{children}</FoodLayout>;
            case 'general': 
            default: 
                return <GeneralLayout>{children}</GeneralLayout>;
        }
    };

    return (
        <>
            {settings?.site_favicon && (
                <Head>
                    <link rel="icon" href={`/storage/${settings.site_favicon}`} />
                </Head>
            )}

            {/* FIX: Use dangerouslySetInnerHTML to prevent React parsing errors with raw CSS injection */}
            <style dangerouslySetInnerHTML={{
                __html: `:root { --theme-color: ${themeColor}; }`
            }} />

            {renderTheme()}

            <FloatingContact />
            <FloatingSidebarCart />
            
            <Toast show={toast.show} message={toast.message} type={toast.type} onClose={closeToast} />
            <GlobalConfirmModal />
        </>
    );
}