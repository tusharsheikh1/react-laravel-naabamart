// resources/js/Features/PageBuilder/Templates/helpers.js

/**
 * Helper to generate a standard widget node for Craft.js JSON
 * * @param {string} componentName - The exactly matched name in RESOLVER
 * @param {object} props - The props for the widget
 * @param {string} parentId - The ID of the parent node (Defaults to 'ROOT')
 */
export const node = (componentName, props, parentId = 'ROOT') => {
    return {
        type: { resolvedName: componentName },
        isCanvas: false,
        props: props,
        displayName: componentName,
        custom: {},
        hidden: false,
        nodes: [],
        linkedNodes: {},
        parent: parentId, // 👈 CRITICAL: Tells Craft.js this belongs to a container so it can be moved/deleted
    };
};

/**
 * Helper to generate a Container/Canvas node for Craft.js JSON
 * * @param {object} props - The props for the Container
 * @param {array} childNodes - Array of string IDs for the child widgets
 * @param {string|null} parentId - The ID of the parent node, if nested
 */
export const container = (props, childNodes = [], parentId = null) => {
    return {
        type: { resolvedName: 'Container' },
        isCanvas: true, // 👈 CRITICAL: Tells Craft.js this area accepts drag-and-drop
        props: props,
        displayName: 'Container',
        custom: {},
        hidden: false,
        nodes: childNodes,
        linkedNodes: {},
        ...(parentId ? { parent: parentId } : {}), // Add parent ID only if it's not the absolute root
    };
};