// resources/js/Features/PageBuilder/PageTemplates.js

import { BOOK_TEMPLATE } from './Templates/BookTemplate';
import { FOOD_TEMPLATE } from './Templates/FoodTemplate';
import { GADGET_TEMPLATE } from './Templates/GadgetTemplate';
import { FASHION_TEMPLATE } from './Templates/FashionTemplate';
import { HEALTH_TEMPLATE } from './Templates/HealthTemplate';
import { AGRO_TEMPLATE } from './Templates/AgroTemplate';
import { QURAN_TEMPLATE } from './Templates/QuranTemplate';

// ইসলামিক ও বইয়ের টেমপ্লেটগুলো
import { NABIYE_RAHMAT_TEMPLATE } from './Templates/NabiyeRahmatTemplate';
import { SAHIH_BUKHARI_TEMPLATE } from './Templates/SahihBukhariTemplate';
import { ISLAMIC_PACKAGE_TEMPLATE } from './Templates/IslamicPackageTemplate';
import { AL_ADABUL_MUFRAD_TEMPLATE } from './Templates/AlAdabulMufradTemplate';
import { RIYADUS_SALIHIN_TEMPLATE } from './Templates/RiyadusSalihinTemplate';
import { QURAN_SCIENCE_PACKAGE_TEMPLATE } from './Templates/QuranSciencePackageTemplate';
import { FATAWA_HANAFIA_TEMPLATE } from './Templates/FatawaHanafiaTemplate';

// খেজুরের নতুন টেমপ্লেটগুলো
import { AJWA_DATES_TEMPLATE } from './Templates/AjwaDatesTemplate';
import { SUKKARI_ROTAB_TEMPLATE } from './Templates/SukkariRotabTemplate';
import { SUKKARI_MUFATTAL_TEMPLATE } from './Templates/SukkariMufattalTemplate';
import { DATES_COMBO_TEMPLATE } from './Templates/DatesComboTemplate';
import { MABROOM_MARYAM_TEMPLATE } from './Templates/MabroomMaryamTemplate';
import { MASHROOK_MARYAM_TEMPLATE } from './Templates/MashrookMaryamTemplate';
import { KALMI_MARYAM_TEMPLATE } from './Templates/KalmiMaryamTemplate';

// ─────────────────────────────────────────────────────────────────────────────
// Export the template registry
// ─────────────────────────────────────────────────────────────────────────────

export const TEMPLATES = [
    {
        id: 'book',
        name: 'বই বিক্রয়',
        nameEn: 'Book Selling',
        emoji: '📚',
        description: 'সাহিত্য, শিক্ষামূলক বা যেকোনো বইয়ের জন্য। লাইট আইভরি এবং গোল্ড থিম।',
        descriptionEn: 'Light ivory theme with elegant gold accents. Perfect for any book.',
        palette: ['#f9f6f0', '#ffffff', '#d4a853'],
        json: JSON.stringify(BOOK_TEMPLATE),
    },
    {
        id: 'islamic-book',
        name: 'ইসলামিক বই / সীরাত',
        nameEn: 'Islamic Books & Seerah',
        emoji: '🕌',
        description: 'সীরাত গ্রন্থ, ইসলামিক বই বা নবীয়ে রহমত বিক্রয়ের জন্য। প্রিমিয়াম ডার্ক গ্রিন থিম।',
        descriptionEn: 'Premium dark green emerald theme. Perfect for Seerah and Islamic books.',
        palette: ['#fcfbf9', '#ffffff', '#047857'],
        json: JSON.stringify(NABIYE_RAHMAT_TEMPLATE),
    },
    {
        id: 'bukhari',
        name: 'হাদীস / বুখারী শরীফ',
        nameEn: 'Hadith Collection',
        emoji: '📚',
        description: 'সহীহ বুখারী বা অন্যান্য হাদীস সংকলনের জন্য। প্রিমিয়াম নেভি ব্লু ও গোল্ড থিম।',
        descriptionEn: 'Premium navy blue and gold theme. Highly converting for Hadith sets.',
        palette: ['#f8fafc', '#ffffff', '#1e3a8a'],
        json: JSON.stringify(SAHIH_BUKHARI_TEMPLATE),
    },
    {
        id: 'islamic-package',
        name: 'ইসলামিক বই প্যাকেজ',
        nameEn: 'Islamic Book Package',
        emoji: '🎁',
        description: 'একাধিক বই এবং উপহারের কম্বো প্যাকেজ বিক্রির জন্য। হাই-কনভার্টিং স্পেশাল টেমপ্লেট।',
        descriptionEn: 'High-converting template for selling combo packages with free gifts.',
        palette: ['#f8fafc', '#ffffff', '#064e3b'],
        json: JSON.stringify(ISLAMIC_PACKAGE_TEMPLATE),
    },
    {
        id: 'adabul-mufrad',
        name: 'আদাবুল মুফরাদ / শিষ্টাচার',
        nameEn: 'Manners & Adab',
        emoji: '🌿',
        description: 'চরিত্র গঠন ও শিষ্টাচার বিষয়ক বইয়ের জন্য। স্নিগ্ধ টিল (Teal) ও প্রশান্তিদায়ক থিম।',
        descriptionEn: 'Soothing teal and amber theme. Best for books related to character building and adab.',
        palette: ['#f8fafc', '#ffffff', '#0f766e'],
        json: JSON.stringify(AL_ADABUL_MUFRAD_TEMPLATE),
    },
    {
        id: 'riyadus-salihin',
        name: 'রিয়াদুস সালেহীন / হাদিস',
        nameEn: 'Riyadus Salihin',
        emoji: '🌙',
        description: 'পারিবারিক তালিম ও হাদিসের বইয়ের জন্য। রমজান স্পেশাল ইন্ডিগো ও গোল্ড থিম।',
        descriptionEn: 'Ramadan special indigo and gold theme. Highly emotional and converting for family-oriented Islamic books.',
        palette: ['#f8fafc', '#ffffff', '#312e81'],
        json: JSON.stringify(RIYADUS_SALIHIN_TEMPLATE),
    },
    {
        id: 'quran-science',
        name: 'বিজ্ঞান ও কুরআন প্যাকেজ',
        nameEn: 'Quran & Science Combo',
        emoji: '🌌',
        description: 'কুরআন ও আধুনিক বিজ্ঞান বিষয়ক বই বা প্যাকেজ বিক্রির জন্য। মিডনাইট ব্লু এবং সায়ান থিম।',
        descriptionEn: 'Midnight blue and cyan theme. Perfect for books combining religion, science, and logic.',
        palette: ['#f8fafc', '#ffffff', '#0f172a'],
        json: JSON.stringify(QURAN_SCIENCE_PACKAGE_TEMPLATE),
    },
    {
        id: 'fatawa',
        name: 'ফতোয়া / মাসআলা',
        nameEn: 'Fatawa & Masala',
        emoji: '⚖️',
        description: 'ফতোয়া, মাসআলা বা রেফারেন্স বইয়ের জন্য। নির্ভরযোগ্য ও অথেনটিক মেরুন এবং গোল্ড থিম।',
        descriptionEn: 'Authoritative maroon and gold theme. Best for Fatawa, Masala, and reference books.',
        palette: ['#f8fafc', '#ffffff', '#7f1d1d'],
        json: JSON.stringify(FATAWA_HANAFIA_TEMPLATE),
    },
    {
        id: 'food',
        name: 'খাবার / রেস্তোরাঁ',
        nameEn: 'Food & Restaurant',
        emoji: '🍽️',
        description: 'হোম ফুড, রেস্তোরাঁ বা যেকোনো খাদ্যপণ্যের জন্য। ব্রাইট এবং ফ্রেশ অরেঞ্জ থিম।',
        descriptionEn: 'Fresh bright whites with vibrant orange accents. Makes mouths water.',
        palette: ['#fffdfa', '#ffffff', '#ea580c'],
        json: JSON.stringify(FOOD_TEMPLATE),
    },
    {
        id: 'gadget',
        name: 'গ্যাজেট / টেক',
        nameEn: 'Gadget & Tech',
        emoji: '⚡',
        description: 'মোবাইল, ইলেকট্রনিক্স ও যেকোনো প্রযুক্তি পণ্যের জন্য। ক্লিন টেক মিনিমাল থিম।',
        descriptionEn: 'Clean tech minimal — white and cool gray with sky blue accents.',
        palette: ['#f8fafc', '#ffffff', '#0284c7'],
        json: JSON.stringify(GADGET_TEMPLATE),
    },
    {
        id: 'fashion',
        name: 'ফ্যাশন / পোশাক',
        nameEn: 'Fashion & Clothing',
        emoji: '✨',
        description: 'পোশাক, জুয়েলারি ও ফ্যাশন পণ্যের জন্য। এলিগ্যান্ট ব্লাশ পিংক লাক্সারি থিম।',
        descriptionEn: 'Vogue BD — elegant blush pink on crisp white. Stops scrollers in their tracks.',
        palette: ['#fdf8fa', '#ffffff', '#be185d'],
        json: JSON.stringify(FASHION_TEMPLATE),
    },
    {
        id: 'health',
        name: 'স্বাস্থ্য / সৌন্দর্য',
        nameEn: 'Health & Beauty',
        emoji: '🌿',
        description: 'স্কিনকেয়ার, হেলথ সাপ্লিমেন্ট ও বিউটি পণ্যের জন্য। সেজ গ্রিন ওয়েলনেস থিম।',
        descriptionEn: 'Pure glow — sage green & warm cream. Clean wellness confidence.',
        palette: ['#faf9f6', '#ffffff', '#2d5240'],
        json: JSON.stringify(HEALTH_TEMPLATE),
    },
    {
        id: 'agro',
        name: 'অ্যাগ্রো / অর্গানিক',
        nameEn: 'Agro & Organic Food',
        emoji: '🌿',
        description: 'মধু, ঘি, বা যেকোনো খাঁটি কৃষিজ পণ্যের জন্য। ন্যাচারাল গ্রিন এবং ট্রাস্ট-বিল্ডিং ডিজাইন।',
        descriptionEn: 'Earthy pure theme — deep greens with warm amber. Highlights organic trust.',
        palette: ['#fdfbf7', '#ffffff', '#166534'],
        json: JSON.stringify(AGRO_TEMPLATE),
    },
    {
        id: 'quran',
        name: 'কালার কোডেড কুরআন',
        nameEn: 'Color Coded Quran',
        emoji: '📖',
        description: 'শুদ্ধ তিলাওয়াত ও তাজউইদ শিক্ষার জন্য কালার কোডেড কুরআন। ইসলামিক গ্রিন ও গোল্ড থিম।',
        descriptionEn: 'Elegant deep emerald green and gold theme. Perfect for Color Coded Tajweed Quran.',
        palette: ['#f8fafc', '#ffffff', '#064e3b'],
        json: JSON.stringify(QURAN_TEMPLATE),
    },
    {
        id: 'ajwa-dates',
        name: 'আজওয়া খেজুর',
        nameEn: 'Ajwa Dates',
        emoji: '🌴',
        description: 'মদিনার অরিজিনাল আজওয়া খেজুর বিক্রয়ের জন্য। প্রিমিয়াম এবং ন্যাচারাল থিম। মেটা অ্যাডস অপ্টিমাইজড।',
        descriptionEn: 'Premium and natural theme for selling original Madinah Ajwa Dates. Meta ads optimized.',
        palette: ['#fffdfa', '#ffffff', '#b45309'],
        json: JSON.stringify(AJWA_DATES_TEMPLATE),
    },
    {
        id: 'sukkari-rotab',
        name: 'সুক্কারি রোতাব',
        nameEn: 'Sukkari Rotab',
        emoji: '🍯',
        description: 'সৌদি সুক্কারি রোতাব খেজুর বিক্রয়ের জন্য। সোনালী অ্যাম্বার থিম এবং মেটা অ্যাডস অপ্টিমাইজড।',
        descriptionEn: 'Golden amber theme optimized for Meta ads to sell Sukkari Rotab dates.',
        palette: ['#fffbeb', '#ffffff', '#d97706'],
        json: JSON.stringify(SUKKARI_ROTAB_TEMPLATE),
    },
    {
        id: 'sukkari-mufattal',
        name: 'সুক্কারি মুফাত্তাল',
        nameEn: 'Sukkari Mufattal',
        emoji: '⚡',
        description: 'এনার্জি বুস্টার সৌদি সুক্কারি মুফাত্তাল খেজুর বিক্রয়ের জন্য স্পেশাল ল্যান্ডিং পেজ।',
        descriptionEn: 'Special landing page optimized for selling Sukkari Mufattal dates with energy-boosting features.',
        palette: ['#fffcf7', '#ffffff', '#c2410c'],
        json: JSON.stringify(SUKKARI_MUFATTAL_TEMPLATE),
    },
    {
        id: 'dates-combo',
        name: 'খেজুর কম্বো (৪ আইটেম)',
        nameEn: '4 Dates Combo Box',
        emoji: '🎁',
        description: 'আজওয়া, সুক্কারি, কলমি ও মাবরুম—৪ ধরনের খেজুরের কম্বো প্যাক বিক্রির জন্য ৮-সেকশন বিশিষ্ট হাই-কনভার্টিং টেমপ্লেট।',
        descriptionEn: 'Ultra high-converting 8-section template for selling a 4-item mixed premium Saudi dates combo box.',
        palette: ['#fdfbf7', '#ffffff', '#b45309'],
        json: JSON.stringify(DATES_COMBO_TEMPLATE),
    },
    {
        id: 'mabroom-maryam',
        name: 'মাবরুম মরিয়ম',
        nameEn: 'Mabroom Maryam',
        emoji: '🌴',
        description: 'অরিজিনাল সৌদি মাবরুম মরিয়ম খেজুর বিক্রয়ের জন্য। ডিপ মেহগনি রেড থিম সহ ৮-সেকশন বিশিষ্ট হাই-কনভার্টিং টেমপ্লেট।',
        descriptionEn: 'High-converting 8-section template with a deep mahogany red theme for selling Saudi Mabroom Maryam dates.',
        palette: ['#fdf8f6', '#ffffff', '#991b1b'],
        json: JSON.stringify(MABROOM_MARYAM_TEMPLATE),
    },
    {
        id: 'mashrook-maryam',
        name: 'মাশরুক মরিয়ম',
        nameEn: 'Mashrook Maryam',
        emoji: '👑',
        description: 'অরিজিনাল সৌদি মাশরুক মরিয়ম খেজুর বিক্রয়ের জন্য। রয়্যাল রুবি রেড থিম সহ ৮-সেকশন বিশিষ্ট হাই-কনভার্টিং টেমপ্লেট।',
        descriptionEn: 'High-converting 8-section template with a royal ruby red theme for selling Saudi Mashrook Maryam dates.',
        palette: ['#fff1f2', '#ffffff', '#9f1239'],
        json: JSON.stringify(MASHROOK_MARYAM_TEMPLATE),
    },
    {
        id: 'kalmi-maryam',
        name: 'কলমি মরিয়ম',
        nameEn: 'Kalmi Maryam (Safawi)',
        emoji: '⭐',
        description: 'অরিজিনাল সৌদি কলমি মরিয়ম (সাফাউই) খেজুর বিক্রয়ের জন্য। ডিপ এসপ্রেসো ও ওয়ার্ম অ্যাম্বার থিম সহ ৮-সেকশন বিশিষ্ট হাই-কনভার্টিং টেমপ্লেট।',
        descriptionEn: 'High-converting 8-section template with a deep espresso and warm amber theme for selling Saudi Kalmi Maryam (Safawi) dates.',
        palette: ['#fefce8', '#ffffff', '#78350f'],
        json: JSON.stringify(KALMI_MARYAM_TEMPLATE),
    },
];