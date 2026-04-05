import { usePage } from '@inertiajs/react';

export default function useTranslation() {
    // Retrieve the language dictionary passed globally from HandleInertiaRequests.php
    const { language } = usePage().props;

    /**
     * Translate a given key.
     * * @param {string} key - The text to translate (e.g., "Home").
     * @param {object} replace - Dynamic variables to replace (e.g., { name: 'John' }).
     * @returns {string} - The translated string, or the original key if no translation exists.
     */
    const __ = (key, replace = {}) => {
        // Fallback to the original key if the language dictionary is missing or the key isn't found
        let translation = language?.[key] || key;

        // Replace any dynamic variables in the string (e.g., "Welcome :name" -> "Welcome John")
        if (Object.keys(replace).length > 0) {
            Object.keys(replace).forEach(placeholder => {
                translation = translation.replace(
                    new RegExp(`:${placeholder}`, 'g'), 
                    replace[placeholder]
                );
            });
        }

        return translation;
    };

    return { __ };
}