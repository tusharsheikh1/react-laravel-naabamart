import React, { useState } from 'react';
import { useNode } from '@craftjs/core';
import axios from 'axios';

export const ImageWidget = ({ imageUrl, altText, width, borderRadius, shadow }) => {
    const { connectors: { connect, drag } } = useNode();

    return (
        <div ref={ref => connect(drag(ref))} className="w-full flex justify-center p-2">
            {imageUrl ? (
                <img 
                    src={imageUrl} 
                    alt={altText} 
                    style={{ 
                        width: `${width}%`, 
                        borderRadius: `${borderRadius}px` 
                    }}
                    className={`object-cover ${shadow ? 'shadow-xl' : ''}`}
                    loading="lazy"
                />
            ) : (
                <div className="w-full h-48 bg-gray-200 border-2 border-dashed border-gray-400 flex items-center justify-center text-gray-500 rounded-lg">
                    Select or upload an image in settings
                </div>
            )}
        </div>
    );
};

export const ImageSettings = () => {
    const { actions: { setProp }, imageUrl, altText, width, borderRadius, shadow } = useNode((node) => ({
        imageUrl: node.data.props.imageUrl,
        altText: node.data.props.altText,
        width: node.data.props.width,
        borderRadius: node.data.props.borderRadius,
        shadow: node.data.props.shadow,
    }));

    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setIsUploading(true);
        try {
            const response = await axios.post('/admin/landing-pages/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            
            if (response.data.url) {
                setProp(p => p.imageUrl = response.data.url);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please ensure it is a valid image file under 5MB.");
        } finally {
            setIsUploading(false);
            e.target.value = null; // Reset the input after upload
        }
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="text-sm font-medium">Image URL / Path</label>
                <input type="text" value={imageUrl} onChange={e => setProp(p => p.imageUrl = e.target.value)} placeholder="https://..." className="w-full mt-1 text-sm border-gray-300 rounded" />
                
                {/* New Upload Area */}
                <div className="mt-3 p-3 border border-gray-200 rounded bg-gray-50">
                    <label className="text-sm font-medium text-gray-700 block mb-1">Upload Image</label>
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" 
                    />
                    {isUploading && <p className="text-xs text-indigo-600 mt-2 font-medium">Uploading image...</p>}
                </div>
            </div>
            
            <div>
                <label className="text-sm font-medium">Alt Text (SEO)</label>
                <input type="text" value={altText} onChange={e => setProp(p => p.altText = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded" />
            </div>
            <div>
                <label className="text-sm font-medium flex justify-between">
                    <span>Width (%)</span> <span>{width}%</span>
                </label>
                <input type="range" min="10" max="100" value={width} onChange={e => setProp(p => p.width = e.target.value)} className="w-full mt-1" />
            </div>
            <div>
                <label className="text-sm font-medium flex justify-between">
                    <span>Border Radius</span> <span>{borderRadius}px</span>
                </label>
                <input type="range" min="0" max="100" value={borderRadius} onChange={e => setProp(p => p.borderRadius = e.target.value)} className="w-full mt-1" />
            </div>
            <div className="flex items-center">
                <input type="checkbox" id="shadow" checked={shadow} onChange={e => setProp(p => p.shadow = e.target.checked)} className="rounded border-gray-300" />
                <label htmlFor="shadow" className="ml-2 text-sm text-gray-700">Add Drop Shadow</label>
            </div>
        </div>
    );
};

ImageWidget.craft = {
    displayName: 'Image',
    props: {
        imageUrl: '',
        altText: 'Image description',
        width: 100,
        borderRadius: 0,
        shadow: false,
    },
    related: { settings: ImageSettings }
};