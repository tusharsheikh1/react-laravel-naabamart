// resources/js/Features/PageBuilder/Components/DuplicateButton.jsx
import React from 'react';
import { useEditor, useNode } from '@craftjs/core';

export const DuplicateButton = () => {
    const { id } = useNode();
    const { actions, query } = useEditor();

    const handleDuplicate = () => {
        const node = query.node(id).get();
        
        // Prevent duplicating the absolute root canvas
        if (!node || node.id === 'ROOT' || !node.data.parent) {
            console.warn("Cannot duplicate the root node.");
            return;
        }

        const parentId = node.data.parent;
        const parentNode = query.node(parentId).get();
        
        // Insert right after the current element
        const insertIndex = parentNode.data.nodes.indexOf(id) + 1;

        // Extract tree
        const tree = query.node(id).toNodeTree();

        // 1. Generate fresh, unique IDs for every node in the tree
        const idMap = {};
        Object.keys(tree.nodes).forEach((oldId) => {
            idMap[oldId] = `node-${Math.random().toString(36).substring(2, 10)}`;
        });

        const newNodes = {};

        // 2. Rebuild the tree safely WITHOUT destroying React Component functions
        Object.keys(tree.nodes).forEach((oldId) => {
            const newId = idMap[oldId];
            const oldNode = tree.nodes[oldId];

            // Shallow clone the node object (Preserves the 'type' function)
            const newNode = { ...oldNode, id: newId };

            // Clone the data object, update parent/child mappings, and deep clone props so they don't share state
            newNode.data = {
                ...oldNode.data,
                parent: oldId === tree.rootNodeId 
                            ? parentId // Root of the duplicate attaches to the original's parent
                            : (idMap[oldNode.data.parent] || oldNode.data.parent),
                nodes: oldNode.data.nodes.map(childId => idMap[childId] || childId),
                props: JSON.parse(JSON.stringify(oldNode.data.props)),
                custom: JSON.parse(JSON.stringify(oldNode.data.custom)),
            };

            // Remap linked nodes if any exist
            if (oldNode.data.linkedNodes) {
                const newLinked = {};
                Object.keys(oldNode.data.linkedNodes).forEach((key) => {
                    const linkedOldId = oldNode.data.linkedNodes[key];
                    newLinked[key] = idMap[linkedOldId] || linkedOldId;
                });
                newNode.data.linkedNodes = newLinked;
            }

            newNodes[newId] = newNode;
        });

        const newTree = {
            rootNodeId: idMap[tree.rootNodeId],
            nodes: newNodes,
        };

        // 3. Inject the tree into the editor
        actions.addNodeTree(newTree, parentId, insertIndex);

        // 4. Auto-select the newly created duplicate so the user can edit it immediately
        actions.selectNode(newTree.rootNodeId);
    };

    return (
        <button
            type="button"
            onClick={handleDuplicate}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 mb-4 bg-indigo-50 text-indigo-700 rounded-xl border border-indigo-200 hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all font-semibold text-xs shadow-sm"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
            </svg>
            Duplicate Widget
        </button>
    );
};