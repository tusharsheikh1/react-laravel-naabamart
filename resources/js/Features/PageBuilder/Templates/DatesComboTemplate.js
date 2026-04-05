// resources/js/Features/PageBuilder/Templates/DatesComboTemplate.js
import { node, container } from './helpers';

export const DATES_COMBO_TEMPLATE = {
    ROOT: container({ bgColor: '#fdfbf7', bgType: 'color', gap: 0, paddingTop: 0, paddingBottom: 0 }, [
        'hero-combo',         // 1. Hero Section
        'problem-combo',      // 2. Problem / Desire Section
        'product-combo',      // 3. Product Introduction & Offer
        'breakdown-combo',    // 4. Product Breakdown
        'benefits-combo',     // 5. Benefits Section
        'testimonials-combo', // 6. Social Proof
        'countdown-combo',    // 7. Offer + Urgency Section
        'checkout-combo',     // 8. Final CTA & Checkout
    ]),

    // 1️⃣ Hero Section
    'hero-combo': {
        ...node('HeroWidget', {
            bgType: 'gradient',
            bgGradientFrom: '#fdfbf7',
            bgGradientTo: '#fef3c7',
            bgGradientDirection: 145,
            minHeight: 520,
            paddingTop: 80, paddingBottom: 80, paddingLeft: 24, paddingRight: 24,
            contentAlign: 'center', contentMaxWidth: 850, contentVerticalAlign: 'center',
            showBadge: true,
            badgeText: '🚀 বেস্ট সেলিং কম্বো প্যাক',
            badgeColor: '#b45309', badgeBgColor: '#fde68a',
            title: 'এক বক্সেই ৪টি প্রিমিয়াম\nসৌদি খেজুর',
            titleSize: 54, titleWeight: '900', titleColor: '#451a03',
            titleLineHeight: 1.15, titleLetterSpacing: -0.02,
            subtitle: 'আজওয়া, সুক্কারি, কলমি মরিয়ম ও মাবরুম মরিয়ম — সৌদি আরবের সেরা খেজুর এখন একসাথে।',
            subtitleSize: 20, subtitleColor: '#78350f', subtitleMaxWidth: 700, subtitleLineHeight: 1.6,
            showPrimaryBtn: true,
            primaryBtnText: '🛒 এখনই অর্ডার করুন',
            primaryBtnUrl: '#checkout',
            primaryBtnStyle: 'solid',
            primaryBtnBgColor: '#b45309', primaryBtnTextColor: '#ffffff',
            primaryBtnBorderColor: '#b45309', primaryBtnBorderRadius: 50, primaryBtnSize: 'xl',
            showSecondaryBtn: false,
            showStats: true,
            stats: [
                { value: '১০০%', label: 'কেমিক্যাল ও ফরমালিন মুক্ত',  show: true },
                { value: 'সৌদি', label: 'ইম্পোর্টেড প্রিমিয়াম কোয়ালিটি',     show: true },
                { value: 'সেরা', label: 'পরিবার ও গিফটের জন্য', show: true },
            ],
            decorShape: 'blob-tr', decorColor: '#fcd34d', decorOpacity: 30,
            animation: 'slideUp', animationDelay: '0',
        }),
    },

    // 2️⃣ Problem / Desire Section
    'problem-combo': {
        ...node('FeaturesWidget', {
            sectionTitle: 'আপনি কি বাজারের খেজুর নিয়ে চিন্তায় আছেন?',
            sectionSubtitle: 'এই সমস্যার চিরস্থায়ী সমাধান হিসেবে আমরা এনেছি Mixed Premium Saudi Dates Box',
            titleColor: '#dc2626', subtitleColor: '#451a03',
            titleSize: 32, subtitleSize: 18, headerAlign: 'center',
            columns: 3, layout: 'vertical', gap: 20,
            bgType: 'color', bgColor: '#fff1f2', // হালকা লালচে ব্যাকগ্রাউন্ড
            paddingTop: 60, paddingBottom: 60, paddingLeft: 24, paddingRight: 24,
            cardBg: '#ffffff', cardBorderColor: '#fecdd3', cardBorderWidth: 1,
            cardRadius: 16, cardShadow: 'sm', cardPadding: 24,
            iconShape: 'circle', iconBg: '#fee2e2', iconColor: '#dc2626', iconSize: 'md',
            itemTitleColor: '#451a03', itemDescColor: '#78350f',
            itemTitleSize: 16, itemDescSize: 15,
            showNumbers: false,
            items: [
                { title: 'কেমিক্যাল যুক্ত খেজুর', description: 'বাজারের অনেক খেজুরেই থাকে ক্ষতিকর কেমিক্যাল ও ফরমালিন।', icon: '❌', iconBg: '', iconColor: '' },
                { title: 'আসল খেজুর পাওয়া কঠিন', description: 'অরিজিনাল সৌদি খেজুর চিনে কেনা সাধারণ ক্রেতার জন্য অনেক কঠিন।', icon: '❌', iconBg: '', iconColor: '' },
                { title: 'এক স্বাদে বিরক্তি', description: 'প্রতিদিন এক ধরনের খেজুর খেতে খেতে বিরক্তি চলে আসে।', icon: '❌', iconBg: '', iconColor: '' },
            ],
            animation: 'fadeUp', staggerDelay: '0.08',
        }),
    },

    // 3️⃣ Product Introduction
    'product-combo': {
        ...node('ProductWidget', {
            layout: 'side-by-side', maxWidth: 1000,
            bgType: 'color', bgColor: '#ffffff',
            paddingTop: 60, paddingBottom: 60, paddingLeft: 24, paddingRight: 24,
            imageRatio: '4:3', imageBorderRadius: 20, imageShadow: 'xl',
            showGallery: true,
            showBadge: true, badgeText: '৩১০ টাকা ছাড়!', badgeBg: '#dc2626', badgeColor: '#ffffff',
            showTitle: true, titleSize: 32, titleWeight: '800', titleColor: '#451a03', titleLineHeight: 1.25,
            showPrice: true, priceColor: '#b45309', priceSize: 42, priceWeight: '900',
            showOriginalPrice: true, originalPrice: 1500, showDiscountBadge: true, currencySymbol: '৳',
            showRating: true, ratingValue: 4.9, reviewCount: 854, starColor: '#f59e0b',
            showDescription: true, descriptionSize: 16, descriptionColor: '#78350f', descriptionLines: 6,
            descriptionText: 'এই প্রিমিয়াম বক্সে থাকছে সৌদি আরবের ৪টি জনপ্রিয় খেজুরের পারফেক্ট কম্বিনেশন। এক বক্সেই পাচ্ছেন ৪ রকম স্বাদ, পুষ্টি ও সুন্নাহর ছোঁয়া।\n\nএটি আপনার পরিবারের জন্য যেমন পারফেক্ট, তেমনি প্রিয়জনকে গিফট করার জন্যও সেরা একটি আইটেম।',
            showSpecs: false,
            showTrust: true,
            trustItems: [
                { icon: '📦', text: '৪ আইটেমের মিক্সড বক্স', bg: '#fef3c7', color: '#b45309', show: true },
                { icon: '💵', text: 'ক্যাশ অন ডেলিভারি', bg: '#f0fdf4', color: '#16a34a', show: true },
            ],
            showStock: true, stockText: '📦 স্টক সীমিত! দ্রুত অর্ডার করুন', stockBg: '#fee2e2', stockColor: '#dc2626',
            showCta: true,
            ctaText: '🛒 ১১৯০ টাকায় অর্ডার করুন',
            ctaUrl: '#checkout', ctaBg: '#b45309', ctaTextColor: '#ffffff',
            ctaRadius: 50, ctaSize: 'lg',
            ctaSubText: 'রেগুলার প্রাইস: ১৫০০৳ | আজকের অফার: ১১৯০৳',
            animation: 'fadeUp',
        }),
    },

    // 4️⃣ Product Breakdown Section
    'breakdown-combo': {
        ...node('FeaturesWidget', {
            sectionTitle: 'বক্সে যা যা থাকছে',
            sectionSubtitle: 'আমাদের মিক্সড বক্সে সৌদি আরবের সেরা ৪টি খেজুরের সমাহার',
            titleColor: '#451a03', subtitleColor: '#78350f',
            titleSize: 32, subtitleSize: 16, headerAlign: 'center',
            columns: 4, layout: 'vertical', gap: 20,
            bgType: 'color', bgColor: '#fdfbf7',
            paddingTop: 60, paddingBottom: 60, paddingLeft: 24, paddingRight: 24,
            cardBg: '#ffffff', cardBorderColor: '#fde68a', cardBorderWidth: 1,
            cardRadius: 16, cardShadow: 'sm', cardPadding: 24,
            iconShape: 'circle', iconBg: '#fef3c7', iconColor: '#b45309', iconSize: 'xl',
            itemTitleColor: '#451a03', itemDescColor: '#78350f',
            itemTitleSize: 18, itemDescSize: 14,
            showNumbers: false,
            items: [
                { title: 'আজওয়া (Ajwa)', description: 'রাসুল (সা.)-এর প্রিয় খেজুর, যা বিষ ও জাদু থেকে রক্ষা করে।', icon: '🥇', iconBg: '', iconColor: '' },
                { title: 'সুক্কারি (Sukkari)', description: 'মুখে দিলেই গলে যায়, ক্যারামেলের মতো অসাধারণ মিষ্টি স্বাদ।', icon: '🥇', iconBg: '', iconColor: '' },
                { title: 'কলমি মরিয়ম', description: 'গাঢ় বাদামী রঙের পুষ্টিকর ও সুস্বাদু (Kalmi Maryam) খেজুর।', icon: '🥇', iconBg: '', iconColor: '' },
                { title: 'মাবরুম মরিয়ম', description: 'দীর্ঘ সাইজ, চিবিয়ে খাওয়ার মতো মজাদার (Mabroom Maryam)।', icon: '🥇', iconBg: '', iconColor: '' },
            ],
            animation: 'fadeUp', staggerDelay: '0.08',
        }),
    },

    // 5️⃣ Benefits Section
    'benefits-combo': {
        ...node('FeaturesWidget', {
            sectionTitle: 'কেন এই কম্বো বক্সটি নিবেন?',
            sectionSubtitle: 'আপনার এবং আপনার পরিবারের সুস্বাস্থ্যের জন্য',
            titleColor: '#451a03', subtitleColor: '#78350f',
            titleSize: 28, subtitleSize: 16, headerAlign: 'center',
            columns: 2, layout: 'horizontal', gap: 20,
            bgType: 'color', bgColor: '#ffffff',
            paddingTop: 40, paddingBottom: 60, paddingLeft: 24, paddingRight: 24,
            cardBg: '#fefaf5', cardBorderColor: '#fde68a', cardBorderWidth: 1,
            cardRadius: 16, cardShadow: 'sm', cardPadding: 24,
            iconShape: 'circle', iconBg: '#fef3c7', iconColor: '#b45309', iconSize: 'md',
            itemTitleColor: '#451a03', itemDescColor: '#78350f',
            itemTitleSize: 16, itemDescSize: 14,
            showNumbers: false,
            items: [
                { title: 'প্রাকৃতিক এনার্জির উৎস', description: 'দ্রুত ক্লান্তি দূর করে এবং শরীরে ইনস্ট্যান্ট এনার্জি সরবরাহ করে।', icon: '⚡', iconBg: '', iconColor: '' },
                { title: 'সুন্নাহ সম্মত খাবার', description: 'খেজুর খাওয়া সুন্নাত, এতে দুনিয়া ও আখিরাত উভয়ের কল্যাণ রয়েছে।', icon: '🕌', iconBg: '', iconColor: '' },
                { title: 'পরিবারের জন্য স্বাস্থ্যকর', description: 'বাচ্চা থেকে বৃদ্ধ, সবার জন্যই এটি অত্যন্ত পুষ্টিকর ও স্বাস্থ্যকর।', icon: '👨‍👩‍👧‍👦', iconBg: '', iconColor: '' },
                { title: 'একসাথে ৪ রকম খেজুর', description: 'এক বক্সেই পাচ্ছেন ৪টি ভিন্ন স্বাদ, যা প্রতিদিন খাওয়ার একঘেয়েমি দূর করবে।', icon: '🎁', iconBg: '', iconColor: '' },
            ],
            animation: 'fadeUp', staggerDelay: '0.08',
        }),
    },

    // 6️⃣ Social Proof Section
    'testimonials-combo': {
        ...node('TestimonialWidget', {
            title: 'গ্রাহকদের রিভিউ',
            subtitle: 'যারা আমাদের মিক্সড বক্স নিয়েছেন তারা কী বলছেন',
            bgColor: '#fdfbf7', padding: 60,
            layout: 'grid', columns: 2, cardStyle: 'border', borderColor: '#fde68a',
            starColor: '#f59e0b', showVerified: true,
            reviews: [
                { name: 'Rahim', role: 'Dhaka', text: 'খুবই ভালো কোয়ালিটি। আজওয়া অসাধারণ ছিল। পরিবারের সবাই খুব পছন্দ করেছে। ৪ আইটেম একসাথে দেওয়ার আইডিয়াটা দারুণ।', stars: 5, avatar: '' },
                { name: 'Tarek Mahmud', role: 'Chittagong', text: 'গিফট করার জন্য নিয়েছিলাম। প্যাকেজিং খুবই প্রিমিয়াম ছিল। সুক্কারি খেজুরটা মুখে দিলেই গলে যায়। ডেলিভারিও ফাস্ট পেয়েছি।', stars: 5, avatar: '' },
            ],
        }),
    },

    // 7️⃣ Offer + Urgency Section
    'countdown-combo': {
        ...node('CountdownWidget', {
            mode: 'daily',
            showDays: false,
            showHeadline: true,
            headline: '🎁 আজকের স্পেশাল অফার!',
            headlineSize: 28, headlineColor: '#dc2626', headlineWeight: '800',
            showSubtitle: true,
            subtitle: 'Mixed Saudi Dates Box - Regular Price: 1500৳ | Today Price: 1190৳',
            subtitleColor: '#451a03', subtitleSize: 18,
            expiredMessage: '⚠️ আজকের স্পেশাল অফার শেষ হয়েছে।',
            displayStyle: 'card', boxSize: 'md',
            boxBg: '#ffffff', boxTextColor: '#b45309',
            labelColor: '#78350f', boxRadius: 16, separatorColor: '#ffffff', showLabels: true,
            showUrgencyBar: true,
            urgencyText: '📦 সীমিত স্টক! সারা বাংলাদেশে হোম ডেলিভারি।',
            urgencyBarBg: '#fee2e2', urgencyBarText: '#dc2626',
            bgType: 'color', bgColor: '#ffffff',
            paddingTop: 40, paddingBottom: 40, paddingLeft: 24, paddingRight: 24,
            contentAlign: 'center',
        }),
    },

    // 8️⃣ Checkout Section
    'checkout-combo': {
        ...node('CheckoutWidget', {
            maxWidth: 600, bgColor: '#ffffff', padding: 32, borderRadius: 20,
            shadow: '2xl', borderWidth: 2, borderColor: '#b45309', 
            showHeader: true, headerText: '🛒 অফার মূল্যে অর্ডার কনফার্ম করুন',
            headerBgColor: '#fef3c7', headerTextColor: '#b45309', headerSize: 22,
            showProductSummary: true, summaryLayout: 'row',
            showRating: true, ratingValue: 4.9, reviewCount: 854,
            showMultiProduct: false,
            showQuantity: true, showAddress: true, showDistrict: true, showNote: false,
            nameLabel: 'আপনার নাম', phoneLabel: 'মোবাইল নাম্বার',
            addressLabel: 'সম্পূর্ণ ঠিকানা', districtLabel: 'জেলা নির্বাচন করুন',
            noteLabel: 'বিশেষ নির্দেশ', quantityLabel: 'বক্সের পরিমাণ',
            formLayout: 'two-col',
            unitLabel: 'বক্স', presetQuantities: '1, 2, 3, 5', showCustomQty: false, defaultQuantity: 1,
            showBundlePricing: true,
            bundles: [
                { qty: 1, price: 1190, highlight: false, badge: '' }, 
                { qty: 2, price: 2300, highlight: true, badge: 'জনপ্রিয় (ডেলিভারি ফ্রি)' }, 
                { qty: 3, price: 3400, highlight: false, badge: 'সুপার সেভার' },
            ],
            showDeliveryInfo: true, insideDhakaCharge: 60, outsideDhakaCharge: 120, showDeliveryBreakdown: true,
            showVariants: false,
            buttonText: 'অর্ডার কনফার্ম করুন ৳১১৯০',
            buttonBgColor: '#b45309', buttonTextColor: '#ffffff',
            buttonBorderRadius: 50, buttonSize: 'xl', buttonFullWidth: true,
            buttonIcon: '✅', buttonSubText: 'সারা বাংলাদেশে ক্যাশ অন ডেলিভারি',
            showTrustBadges: true,
            trustBadges: [
                { icon: '💵', text: 'ক্যাশ অন ডেলিভারি',   show: true },
                { icon: '🔍', text: 'চেক করে নেওয়ার সুযোগ', show: true },
            ],
            showUrgency: true, urgencyText: '⚡ দ্রুত আপনার নাম ও ঠিকানা লিখে অর্ডার কনফার্ম করুন!',
            urgencyBgColor: '#fef3c7', urgencyTextColor: '#b45309',
            showSocialProof: true,
            socialProofText: 'গত ১ ঘণ্টায় ৪২ জন অর্ডার কনফার্ম করেছেন',
            socialProofIcon: '🔥',
            enableSpamPrevention: true, spamIntervalMinutes: 30, whatsappNumber: '',
            showMobileStickyCta: true, 
            mobileStickyText: '🛒 অর্ডার করুন (৳১১৯০)',
            mobileStickyBg: '#ffffff',
            themeColor: '#b45309',
            labelColor: '#451a03', inputBorderColor: '#fde68a', inputBgColor: '#fdfbf7',
        }),
    },
};