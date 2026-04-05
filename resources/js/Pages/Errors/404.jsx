// resources/js/Pages/Errors/404.jsx
import React from 'react';
import { Link } from '@inertiajs/react';
import { motion } from 'framer-motion';
import FrontendLayout from '@/Layouts/Frontend/Layout';
import SEO from '@/Components/SEO';

export default function NotFound() {
    return (
        <FrontendLayout>
            <SEO title="404 - Even the ghost is lost" description="The page you are looking for does not exist." />
            
            <div className="flex flex-col items-center justify-center min-h-[75vh] px-4 overflow-hidden relative">
                
                {/* Animated Ghost Icon */}
                <motion.div
                    animate={{
                        y: [0, -20, 0],
                        rotate: [0, 5, -5, 0]
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                    className="relative mb-8"
                >
                    {/* The Ghost Body */}
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-gray-200">
                        <path d="M12 2C7.58 2 4 5.58 4 10V22L7 19L10 22L12 20L14 22L17 19L20 22V10C20 5.58 16.42 2 12 2Z" fill="currentColor" />
                        {/* Eyes */}
                        <motion.circle 
                            animate={{ scaleY: [1, 0.1, 1] }} 
                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2] }}
                            cx="9" cy="10" r="1.5" fill="#1a3a1a" 
                        />
                        <motion.circle 
                            animate={{ scaleY: [1, 0.1, 1] }} 
                            transition={{ duration: 3, repeat: Infinity, times: [0, 0.1, 0.2] }}
                            cx="15" cy="10" r="1.5" fill="#1a3a1a" 
                        />
                    </svg>
                    
                    {/* Shadow under ghost */}
                    <motion.div 
                        animate={{ scale: [1, 0.8, 1], opacity: [0.2, 0.1, 0.2] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-2 bg-black rounded-[100%] mx-auto mt-2 blur-sm"
                    />
                </motion.div>

                {/* Big 404 Text */}
                <div className="relative">
                    <h1 className="text-[120px] md:text-[180px] font-black leading-none select-none opacity-10 italic text-gray-400">
                        404
                    </h1>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-xl md:text-2xl font-bold text-gray-800 bg-white px-4">
                            PAGE NOT FOUND
                        </p>
                    </div>
                </div>

                {/* Funny Message */}
                <div className="max-w-lg text-center mt-4">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                        Whoops! You've wandered into the void.
                    </h2>
                    <p className="text-gray-500 mb-8 italic">
                        "I looked everywhere for this page, but then I remembered... I'm a ghost, and I can't even find my own keys."
                    </p>
                </div>

                {/* Modern CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                        <Link
                            href={route('home')}
                            className="block text-center px-10 py-4 rounded-full font-bold text-white transition-all shadow-lg hover:shadow-green-900/20"
                            style={{ background: 'linear-gradient(135deg, #2d5a27 0%, #1a3a1a 100%)' }}
                        >
                            Take Me Home
                        </Link>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                        <Link
                            href={route('shop')}
                            className="block text-center px-10 py-4 rounded-full font-bold transition-all border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                        >
                            Go Shopping
                        </Link>
                    </motion.div>
                </div>

                {/* Background Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 opacity-20 pointer-events-none">
                    <div className="w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-green-50 to-transparent blur-3xl" />
                </div>
            </div>
        </FrontendLayout>
    );
}