// resources/js/Components/FeaturedCategories/index.jsx
import { usePage } from '@inertiajs/react';
import GeneralFeaturedCategories from './GeneralFeaturedCategories';
import FoodFeaturedCategories from './FoodFeaturedCategories';
import GadgetFeaturedCategories from './GadgetFeaturedCategories';
import BookFeaturedCategories from './BookFeaturedCategories';
import DigitalFeaturedCategories from './DigitalFeaturedCategories';

export default function FeaturedCategories({ featuredCategories = [] }) {
    const { global_settings } = usePage().props;
    const theme = String(global_settings?.site_theme || 'general').toLowerCase();

    if (!featuredCategories || featuredCategories.length === 0) return null;

    const props = { featuredCategories };

    switch (theme) {
        case 'food':    return <FoodFeaturedCategories    {...props} />;
        case 'gadget':  return <GadgetFeaturedCategories  {...props} />;
        case 'book':    return <BookFeaturedCategories    {...props} />;
        case 'digital': return <DigitalFeaturedCategories {...props} />;
        default:        return <GeneralFeaturedCategories {...props} />;
    }
}