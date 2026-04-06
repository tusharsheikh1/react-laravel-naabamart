import React, { useState } from 'react';
import Layout from '@/Layouts/Admin/Layout';
import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';

import GeneralTab from './Tabs/GeneralTab';
import NavbarTab from './Tabs/NavbarTab';
import FooterTab from './Tabs/FooterTab';
import SeoTab from './Tabs/SeoTab';
import MailTab from './Tabs/MailTab';
import CourierTab from './Tabs/CourierTab';
import SmsTab from './Tabs/SmsTab';
import SocialTab from './Tabs/SocialTab';
import FloatingTab from './Tabs/FloatingTab';
import ScriptsTab from './Tabs/ScriptsTab';

const TABS = [
    { id: 'general',  name: 'General Information' },
    { id: 'navbar',   name: 'Navbar Settings' },
    { id: 'footer',   name: 'Footer Settings' },
    { id: 'seo',      name: 'SEO Settings' },
    { id: 'mail',     name: 'Mail Configuration' },
    { id: 'courier',  name: 'Courier APIs' },
    { id: 'sms',      name: 'SMS & Templates' },
    { id: 'social',   name: 'Social Links' },
    { id: 'floating', name: 'Floating Contact' },
    { id: 'scripts',  name: 'Tracking & Scripts' },
];

export default function Index({ settings }) {
    const [activeTab, setActiveTab] = useState('general');

    const { data, setData, post, processing, errors, transform } = useForm({
        // General
        site_language: settings.site_language || 'en',
        general_product_layout: settings.general_product_layout || 'ShowGeneral',
        site_name: settings.site_name || '',
        site_email: settings.site_email || '',
        site_phone: settings.site_phone || '',
        site_address: settings.site_address || '',
        site_logo: null,
        site_favicon: null,

        // Navbar
        top_banner_text: settings.top_banner_text || '',
        top_banner_link_text: settings.top_banner_link_text || '',
        search_placeholder: settings.search_placeholder || '',

        // Footer
        newsletter_title: settings.newsletter_title || '',
        newsletter_subtitle: settings.newsletter_subtitle || '',
        site_description: settings.site_description || '',
        copyright_text: settings.copyright_text || '',

        // SEO
        seo_meta_title: settings.seo_meta_title || '',
        seo_homepage_title: settings.seo_homepage_title || '',
        seo_meta_description: settings.seo_meta_description || '',
        seo_meta_keywords: settings.seo_meta_keywords || '',
        seo_meta_image: null,

        // Mail (SMTP)
        mail_mailer: settings.mail_mailer || 'smtp',
        mail_host: settings.mail_host || '',
        mail_port: settings.mail_port || '',
        mail_username: settings.mail_username || '',
        mail_password: settings.mail_password || '',
        mail_encryption: settings.mail_encryption || 'tls',
        mail_from_address: settings.mail_from_address || '',
        mail_from_name: settings.mail_from_name || '',

        // Social Links
        social_facebook: settings.social_facebook || '',
        social_twitter: settings.social_twitter || '',
        social_instagram: settings.social_instagram || '',
        social_linkedin: settings.social_linkedin || '',

        // Floating Contact Widget
        floating_whatsapp: settings.floating_whatsapp || '',
        floating_messenger: settings.floating_messenger || '',
        floating_phone: settings.floating_phone || '',

        // Scripts & Tracking
        enable_google_analytics: settings.enable_google_analytics ?? '1',
        enable_meta_tracking: settings.enable_meta_tracking ?? '1',
        script_gtm_head: settings.script_gtm_head || '',
        script_gtm_body: settings.script_gtm_body || '',
        script_google_analytics: settings.script_google_analytics || '',
        script_meta_pixel: settings.script_meta_pixel || '',
        script_tiktok_pixel: settings.script_tiktok_pixel || '',
        script_custom_head: settings.script_custom_head || '',
        script_custom_body: settings.script_custom_body || '',

        // Courier API
        courier_steadfast_api_key: settings.courier_steadfast_api_key || '',
        courier_steadfast_secret_key: settings.courier_steadfast_secret_key || '',
        courier_steadfast_base_url: settings.courier_steadfast_base_url || 'https://portal.packzy.com/api/v1',
        courier_bdcourier_api_key: settings.courier_bdcourier_api_key || '',

        // SMS API
        sms_bulksmsbd_url: settings.sms_bulksmsbd_url || 'http://bulksmsbd.net/api',
        sms_bulksmsbd_api_key: settings.sms_bulksmsbd_api_key || '',
        sms_bulksmsbd_sender_id: settings.sms_bulksmsbd_sender_id || '',

        // SMS Toggles (Safeguarding defaults based on explicit string checks)
        sms_notify_order_placed: settings.sms_notify_order_placed !== '0',
        sms_notify_order_shipped: settings.sms_notify_order_shipped !== '0',
        sms_notify_order_delivered: settings.sms_notify_order_delivered !== '0',
        sms_notify_order_cancelled: settings.sms_notify_order_cancelled !== '0',
        sms_notify_order_dispatched: settings.sms_notify_order_dispatched !== '0',

        // SMS Templates
        sms_template_order_placed: settings.sms_template_order_placed ?? 'Dear {name}, your order ({order_number}) has been placed successfully. Total amount: ৳{amount}. Thank you for shopping with us!',
        sms_template_order_shipped: settings.sms_template_order_shipped ?? 'Dear {name}, your order {order_number} has been shipped and is on its way to you.',
        sms_template_order_delivered: settings.sms_template_order_delivered ?? 'Dear {name}, your order {order_number} has been delivered successfully. Thank you for staying with us!',
        sms_template_order_cancelled: settings.sms_template_order_cancelled ?? 'Dear {name}, your order {order_number} has been cancelled. If you have any queries, please contact our support.',
        sms_template_order_dispatched: settings.sms_template_order_dispatched ?? 'Dear {name}, your order {order_number} has been handed over to Steadfast Courier. Tracking Code: {tracking_code}.',
    });

    const submit = (e) => {
        e.preventDefault();

        transform((currentData) => ({
            ...currentData,
            sms_notify_order_placed: currentData.sms_notify_order_placed ? '1' : '0',
            sms_notify_order_shipped: currentData.sms_notify_order_shipped ? '1' : '0',
            sms_notify_order_delivered: currentData.sms_notify_order_delivered ? '1' : '0',
            sms_notify_order_cancelled: currentData.sms_notify_order_cancelled ? '1' : '0',
            sms_notify_order_dispatched: currentData.sms_notify_order_dispatched ? '1' : '0',
        }));

        post(route('admin.settings.update'), { 
            preserveScroll: true 
        });
    };

    const tabProps = { data, setData, errors, settings };

    const renderTab = () => {
        switch (activeTab) {
            case 'general':  return <GeneralTab  {...tabProps} />;
            case 'navbar':   return <NavbarTab   {...tabProps} />;
            case 'footer':   return <FooterTab   {...tabProps} />;
            case 'seo':      return <SeoTab      {...tabProps} />;
            case 'mail':     return <MailTab     {...tabProps} />;
            case 'courier':  return <CourierTab  {...tabProps} />;
            case 'sms':      return <SmsTab      {...tabProps} />;
            case 'social':   return <SocialTab   {...tabProps} />;
            case 'floating': return <FloatingTab {...tabProps} />;
            case 'scripts':  return <ScriptsTab  {...tabProps} />;
            default:         return null;
        }
    };

    return (
        <Layout>
            <Head title="System Settings" />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-8">
                <div className="bg-white shadow-sm sm:rounded-lg overflow-hidden border border-gray-100">
                    <form onSubmit={submit} className="flex flex-col md:flex-row min-h-[70vh]">

                        {/* SIDEBAR */}
                        <div className="w-full md:w-64 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-200 flex-shrink-0">
                            <nav
                                className="flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-1 p-4 overflow-x-auto md:overflow-visible custom-scrollbar"
                                aria-label="Tabs"
                            >
                                {TABS.map((tab) => (
                                    <button
                                        key={tab.id}
                                        type="button"
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`${
                                            activeTab === tab.id
                                                ? 'bg-white border-b-2 md:border-b-0 md:border-l-4 border-indigo-500 text-indigo-700 shadow-sm'
                                                : 'border-b-2 md:border-b-0 md:border-l-4 border-transparent text-gray-600 hover:bg-gray-200 hover:text-gray-900'
                                        } whitespace-nowrap md:whitespace-normal flex items-center px-4 py-3 text-sm font-medium transition-all w-full text-left md:rounded-r-md`}
                                    >
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* MAIN CONTENT AREA */}
                        <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                            <div>{renderTab()}</div>

                            {/* SAVE BUTTON */}
                            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-end">
                                <PrimaryButton className="ml-4 px-6 py-2" disabled={processing}>
                                    Save Settings
                                </PrimaryButton>
                            </div>
                        </div>

                    </form>
                </div>
            </div>
        </Layout>
    );
}