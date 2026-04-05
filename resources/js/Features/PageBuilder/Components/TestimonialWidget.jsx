import React, { useState, useRef } from 'react';
import { useNode } from '@craftjs/core';
import axios from 'axios';

// --- Sub-components for different Templates ---

const ClassicTemplate = ({ review, starColor, cardClass, showVerified }) => (
    <div className={`flex-none snap-center p-5 md:p-6 rounded-xl flex flex-col transition-all duration-300 hover:-translate-y-1 w-full h-full ${cardClass}`}>
        <div className="flex mb-3 md:mb-4" style={{ color: starColor, fontSize: '18px' }}>
            {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
        </div>
        <p className="text-gray-700 italic flex-1 mb-5 md:mb-6 leading-relaxed text-sm md:text-base">"{review.text}"</p>
        <div className="flex items-center gap-3 mt-auto">
            {review.avatar ? (
                <img src={review.avatar} alt={review.name} className="w-10 h-10 md:w-12 md:h-12 rounded-full object-cover border-2 border-gray-100" />
            ) : (
                <div className="w-10 h-10 md:w-12 md:h-12 bg-indigo-50 text-indigo-700 rounded-full flex items-center justify-center font-bold text-base md:text-lg border-2 border-indigo-100">
                    {review.name.charAt(0)}
                </div>
            )}
            <div>
                <h4 className="font-bold text-sm md:text-base text-gray-900">{review.name}</h4>
                {review.role && <p className="text-[11px] md:text-xs text-gray-500 mb-0.5">{review.role}</p>}
                {showVerified && (
                    <span className="text-[10px] md:text-[11px] text-green-600 font-semibold flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                        Verified
                    </span>
                )}
            </div>
        </div>
    </div>
);

const MinimalCenteredTemplate = ({ review, starColor, showVerified }) => (
    <div className="flex-none snap-center p-4 md:p-6 flex flex-col items-center text-center transition-all duration-300 w-full h-full bg-transparent">
        <div className="flex mb-4 md:mb-5 justify-center" style={{ color: starColor, fontSize: '20px' }}>
            {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
        </div>
        <p className="text-gray-800 text-sm md:text-lg font-medium italic flex-1 mb-6 md:mb-8 leading-relaxed max-w-lg mx-auto">"{review.text}"</p>
        <div className="flex flex-col items-center mt-auto">
            {review.avatar ? (
                <img src={review.avatar} alt={review.name} className="w-14 h-14 md:w-16 md:h-16 rounded-full object-cover shadow-md mb-2 md:mb-3" />
            ) : (
                <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-lg md:text-xl shadow-md mb-2 md:mb-3">
                    {review.name.charAt(0)}
                </div>
            )}
            <h4 className="font-bold text-sm md:text-base text-gray-900">{review.name}</h4>
            {review.role && <p className="text-xs md:text-sm text-gray-500 mb-1">{review.role}</p>}
            {showVerified && (
                <span className="text-[11px] md:text-xs text-green-600 font-semibold flex items-center gap-1 justify-center mt-1">
                    <svg className="w-3 md:w-3.5 h-3 md:h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    Verified Buyer
                </span>
            )}
        </div>
    </div>
);

const ModernQuoteTemplate = ({ review, starColor, cardClass, showVerified }) => (
    <div className={`flex-none snap-center p-6 md:p-8 rounded-2xl flex flex-col relative overflow-hidden transition-all duration-300 hover:shadow-xl w-full h-full ${cardClass}`}>
        {/* Large Background Quote Icon */}
        <svg className="absolute top-3 right-3 md:top-4 md:right-4 w-12 h-12 md:w-16 md:h-16 text-gray-200 opacity-50 transform rotate-180" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
        </svg>
        
        <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex mb-3 md:mb-4" style={{ color: starColor, fontSize: '16px' }}>
                {'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}
            </div>
            <p className="text-gray-800 font-medium flex-1 mb-6 md:mb-8 leading-relaxed text-sm md:text-base">"{review.text}"</p>
            
            <div className="flex items-center gap-3 md:gap-4 mt-auto border-t border-gray-100 pt-4">
                {review.avatar ? (
                    <img src={review.avatar} alt={review.name} className="w-10 h-10 rounded-lg object-cover" />
                ) : (
                    <div className="w-10 h-10 bg-indigo-600 text-white rounded-lg flex items-center justify-center font-bold text-sm">
                        {review.name.charAt(0)}
                    </div>
                )}
                <div className="flex-1">
                    <h4 className="font-bold text-sm md:text-base text-gray-900">{review.name}</h4>
                    {review.role && <p className="text-[11px] md:text-xs text-gray-500">{review.role}</p>}
                </div>
                {showVerified && (
                    <div className="bg-green-50 text-green-700 p-1 md:p-1.5 rounded-md" title="Verified Buyer">
                        <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                    </div>
                )}
            </div>
        </div>
    </div>
);

// --- Main Widget Component ---

export const TestimonialWidget = ({ title, subtitle, bgColor, padding, reviews, layout, starColor, cardStyle, showVerified, theme }) => {
    const { connectors: { connect, drag } } = useNode();
    const scrollContainerRef = useRef(null);

    // Responsive slide widths: 85% on mobile creates a "peek" effect for the next slide
    const slideWidthClass = layout === 'grid' 
        ? 'w-[85%] sm:w-[calc(50%-12px)] md:w-[calc(33.333%-16px)]' 
        : layout === '2col' 
            ? 'w-[85%] sm:w-[calc(50%-12px)]' 
            : 'w-[90%] md:w-full max-w-3xl mx-auto';

    // Card background based on style
    const cardClass = cardStyle === 'shadow' 
        ? 'bg-white shadow-md hover:shadow-lg md:shadow-lg shadow-gray-200/50' 
        : cardStyle === 'bordered' 
            ? 'bg-white border border-gray-200' 
            : 'bg-gray-50';

    const scroll = (direction) => {
        if (scrollContainerRef.current) {
            const { current } = scrollContainerRef;
            const scrollAmount = current.clientWidth > 768 ? current.clientWidth / 2 : current.clientWidth; 
            if (direction === 'left') {
                current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
            } else {
                current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
            }
        }
    };

    return (
        <div ref={ref => connect(drag(ref))} style={{ backgroundColor: bgColor, paddingTop: `${padding}px`, paddingBottom: `${padding}px` }} className="px-4 md:px-8">
            <div className="max-w-6xl mx-auto relative group">
                
                {/* Responsive Typography for Header */}
                <div className="px-2 md:px-0">
                    {title && <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-center mb-2 md:mb-3 text-gray-900">{title}</h2>}
                    {subtitle && <p className="text-center text-gray-500 mb-8 md:mb-12 text-sm md:text-base lg:text-lg max-w-2xl mx-auto">{subtitle}</p>}
                </div>

                <div className="relative">
                    {/* Previous Button (Hidden on Mobile) */}
                    <button 
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -ml-5 lg:-ml-6 bg-white text-gray-800 p-2 lg:p-3 rounded-full shadow-lg z-10 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-gray-100"
                        aria-label="Previous Review"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    </button>

                    {/* Slider Container 
                        Note: -mx-2 and px-2 prevents drop-shadow clipping inside the overflow-hidden container 
                    */}
                    <div 
                        ref={scrollContainerRef}
                        className="flex overflow-x-auto snap-x snap-mandatory gap-4 md:gap-6 pb-8 pt-4 px-2 -mx-2 md:px-4 md:-mx-4 scroll-smooth items-stretch [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
                    >
                        {reviews.map((review, i) => (
                            <div key={i} className={slideWidthClass}>
                                {theme === 'modern' ? (
                                    <ModernQuoteTemplate review={review} starColor={starColor} cardClass={cardClass} showVerified={showVerified} />
                                ) : theme === 'minimal' ? (
                                    <MinimalCenteredTemplate review={review} starColor={starColor} showVerified={showVerified} />
                                ) : (
                                    <ClassicTemplate review={review} starColor={starColor} cardClass={cardClass} showVerified={showVerified} />
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Next Button (Hidden on Mobile) */}
                    <button 
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 -mr-5 lg:-mr-6 bg-white text-gray-800 p-2 lg:p-3 rounded-full shadow-lg z-10 hover:bg-gray-50 transition-all opacity-0 group-hover:opacity-100 hidden md:flex items-center justify-center border border-gray-100"
                        aria-label="Next Review"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Settings Panel ---

const TestimonialSettings = () => {
    const { actions: { setProp }, props } = useNode(n => ({ props: n.data.props }));
    const p = props;
    const [uploadingIndex, setUploadingIndex] = useState(null);

    const updateReview = (i, field, val) => setProp(pr => { pr.reviews[i][field] = val; });
    const addReview = () => setProp(pr => { pr.reviews.push({ name: 'New Customer', role: 'Verified Buyer', text: 'This is an amazing product!', stars: 5, avatar: '' }); });
    const removeReview = (i) => setProp(pr => { pr.reviews.splice(i, 1); });

    const handleImageUpload = async (e, index) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('image', file);

        setUploadingIndex(index);
        try {
            const response = await axios.post('/admin/landing-pages/upload-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (response.data.url) updateReview(index, 'avatar', response.data.url);
        } catch (error) {
            alert("Failed to upload avatar image.");
        } finally {
            setUploadingIndex(null);
            e.target.value = null;
        }
    };

    return (
        <div className="space-y-5 divide-y divide-gray-100 pb-6">
            <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Content</h4>
                <div><label className="text-sm font-medium">Title</label><input type="text" value={p.title} onChange={e => setProp(pr => pr.title = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md" /></div>
                <div><label className="text-sm font-medium">Subtitle</label><input type="text" value={p.subtitle || ''} onChange={e => setProp(pr => pr.subtitle = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md" /></div>
            </div>
            <div className="pt-3 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Appearance</h4>
                
                <div><label className="text-sm font-medium text-indigo-600">Design Template</label>
                    <select value={p.theme} onChange={e => setProp(pr => pr.theme = e.target.value)} className="w-full mt-1 text-sm border-indigo-300 rounded-md bg-indigo-50">
                        <option value="classic">Classic Cards</option>
                        <option value="minimal">Minimal Centered</option>
                        <option value="modern">Modern Quote</option>
                    </select>
                </div>

                <div><label className="text-sm font-medium">Slider Layout</label>
                    <select value={p.layout} onChange={e => setProp(pr => pr.layout = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md">
                        <option value="grid">3 Items per View</option>
                        <option value="2col">2 Items per View</option>
                        <option value="single">Single Item Center</option>
                    </select>
                </div>
                {p.theme !== 'minimal' && (
                    <div><label className="text-sm font-medium">Card Style</label>
                        <select value={p.cardStyle} onChange={e => setProp(pr => pr.cardStyle = e.target.value)} className="w-full mt-1 text-sm border-gray-300 rounded-md">
                            <option value="shadow">Shadow</option><option value="bordered">Bordered</option><option value="filled">Filled</option>
                        </select>
                    </div>
                )}
                <div className="flex gap-2">
                    <div className="flex-1"><label className="text-xs text-gray-500">Star Color</label><input type="color" value={p.starColor} onChange={e => setProp(pr => pr.starColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" /></div>
                    <div className="flex-1"><label className="text-xs text-gray-500">Background</label><input type="color" value={p.bgColor} onChange={e => setProp(pr => pr.bgColor = e.target.value)} className="block w-full h-8 rounded mt-1 cursor-pointer" /></div>
                </div>
                <label className="flex items-center gap-2 mt-2"><input type="checkbox" checked={p.showVerified} onChange={e => setProp(pr => pr.showVerified = e.target.checked)} className="rounded text-indigo-600" /><span className="text-sm">Show "Verified Buyer" badge</span></label>
                <div><label className="text-xs text-gray-500">Section Padding Top/Bottom ({p.padding}px)</label><input type="range" min="20" max="150" value={p.padding} onChange={e => setProp(pr => pr.padding = parseInt(e.target.value))} className="w-full" /></div>
            </div>
            
            <div className="pt-3 space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Reviews</h4>
                {p.reviews.map((review, i) => (
                    <div key={i} className="p-3 bg-gray-50 border border-gray-200 rounded-lg space-y-2">
                        <div className="flex gap-1 items-center">
                            <input type="text" value={review.name} onChange={e => updateReview(i, 'name', e.target.value)} className="flex-1 text-xs border-gray-300 rounded" placeholder="Name" />
                            <select value={review.stars} onChange={e => updateReview(i, 'stars', parseInt(e.target.value))} className="w-14 text-xs border-gray-300 rounded">
                                {[5,4,3,2,1].map(s => <option key={s} value={s}>{s}★</option>)}
                            </select>
                            <button onClick={() => removeReview(i)} className="text-red-400 hover:text-red-600 font-bold text-lg leading-none">×</button>
                        </div>
                        <input type="text" value={review.role || ''} onChange={e => updateReview(i, 'role', e.target.value)} className="w-full text-xs border-gray-300 rounded" placeholder="Role / Info" />
                        <textarea rows={2} value={review.text} onChange={e => updateReview(i, 'text', e.target.value)} className="w-full text-xs border-gray-300 rounded" placeholder="Review text" />
                        
                        <div className="pt-1">
                            <label className="text-[10px] text-gray-500 font-medium mb-1 block uppercase">Avatar Image</label>
                            <input type="text" value={review.avatar || ''} onChange={e => updateReview(i, 'avatar', e.target.value)} className="w-full text-xs border-gray-300 rounded mb-2" placeholder="Avatar URL (optional)" />
                            <input type="file" accept="image/*" onChange={e => handleImageUpload(e, i)} disabled={uploadingIndex === i} className="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                            {uploadingIndex === i && <p className="text-[10px] text-indigo-600 mt-1 font-medium">Uploading...</p>}
                        </div>
                    </div>
                ))}
                <button onClick={addReview} className="w-full py-2 text-sm text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition">+ Add Review</button>
            </div>
        </div>
    );
};

TestimonialWidget.craft = {
    displayName: 'Testimonials',
    props: {
        title: 'What Our Customers Say',
        subtitle: 'Real reviews from real customers.',
        theme: 'classic',
        bgColor: '#ffffff', padding: 60,
        layout: 'grid', cardStyle: 'shadow',
        starColor: '#f59e0b', showVerified: true,
        reviews: [
            { name: 'Rafiqul Islam', role: 'Verified Purchase', text: 'Absolutely loved the quality. The delivery was super fast, highly recommended!', stars: 5, avatar: '' },
            { name: 'Sumaiya Akter', role: 'Verified Purchase', text: 'Customer service was excellent and the product exactly matches the description.', stars: 5, avatar: '' },
            { name: 'Kamrul Hasan', role: 'Verified Purchase', text: 'Good pricing and smooth checkout process. Will order again.', stars: 4, avatar: '' },
            { name: 'Abdur Rahman', role: 'Verified Purchase', text: 'Very satisfied with the purchase. The packaging was top notch!', stars: 5, avatar: '' },
        ]
    },
    related: { settings: TestimonialSettings },
};