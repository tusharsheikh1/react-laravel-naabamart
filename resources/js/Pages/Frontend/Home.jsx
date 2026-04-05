import React from 'react';
import { usePage } from '@inertiajs/react';
import ThemeLayout from '@/Layouts/Frontend/ThemeLayout';

// Import all theme templates
import GeneralHome from './HomeTemplates/GeneralHome';
import FoodHome from './HomeTemplates/FoodHome';
import GadgetHome from './HomeTemplates/GadgetHome';
import BookHome from './HomeTemplates/BookHome';
import DigitalHome from './HomeTemplates/DigitalHome'; // Added Digital Home

export default function Home(props) {
    // Extract global props (including the featuredCategories from Middleware)
    const { global_settings, featuredCategories } = usePage().props;
    
    // Determine the active layout from the UNIFIED site_theme database setting (fallback to general)
    const activeLayout = String(global_settings?.site_theme || 'general').toLowerCase();

    // Merge the explicit controller props with the global featuredCategories
    const templateProps = {
        ...props,
        featuredCategories: featuredCategories || []
    };

    // Render the specific homepage template based on the active layout
    const renderTemplate = () => {
        switch (activeLayout) {
            case 'food':    return <FoodHome {...templateProps} />;
            case 'gadget':  return <GadgetHome {...templateProps} />;
            case 'book':    return <BookHome {...templateProps} />;
            case 'digital': return <DigitalHome {...templateProps} />;
            case 'general':
            default:        return <GeneralHome {...templateProps} />;
        }
    };

    return renderTemplate();
}

// Attach the universal ThemeLayout to the page
Home.layout = page => <ThemeLayout>{page}</ThemeLayout>;