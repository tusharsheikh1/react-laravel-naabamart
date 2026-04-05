// resources/js/Pages/Admin/Orders/Invoice.jsx
import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

// Sub-component: renders a labelled QR box
function QRBox({ refProp }) {
    return (
        <div
            ref={refProp}
            className="w-[90px] h-[90px] bg-white border border-slate-200 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0"
        >
            {/* Placeholder icon — replaced once qrcode.js loads */}
            <svg className="w-7 h-7 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        </div>
    );
}

export default function Invoice({ order, orderItems }) {
    const { global_settings } = usePage().props;
    const consignmentQrRef = useRef(null);
    const trackingQrRef    = useRef(null);

    const formatBDT = (amount) =>
        new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit',
        });

    const paymentMethodTranslate = (method) => {
        if (method === 'cod')    return 'ক্যাশ অন ডেলিভারি (COD)';
        if (method === 'online') return 'অনলাইন পেমেন্ট';
        return method;
    };

    const statusTranslate = (status) =>
        ({ pending: 'পেন্ডিং', processing: 'প্রসেসিং', shipped: 'শিপড', delivered: 'ডেলিভারড', cancelled: 'ক্যানসেলড' }[status] ?? status);

    // Load qrcodejs once, then render both QR codes
    useEffect(() => {
        if (!order.consignment_id && !order.tracking_code) return;

        const renderAll = () => {
            if (!window.QRCode) return;

            const make = (ref, text) => {
                if (!ref?.current || !text) return;
                ref.current.innerHTML = '';
                new window.QRCode(ref.current, {
                    text: String(text),
                    width: 90, height: 90,
                    colorDark: '#0f172a', colorLight: '#ffffff',
                    correctLevel: window.QRCode.CorrectLevel.M,
                });
            };

            make(consignmentQrRef, order.consignment_id);
            make(trackingQrRef,    order.tracking_code);
        };

        if (window.QRCode) {
            renderAll();
        } else {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            s.onload = renderAll;
            document.head.appendChild(s);
        }
    }, [order.consignment_id, order.tracking_code]);

    const hasCourierInfo = order.consignment_id || order.tracking_code;
    const subtotal = orderItems?.reduce((t, i) => t + i.price * i.quantity, 0) ?? 0;

    return (
        <>
            <Head title={`Invoice #${order.order_number}`} />

            {/* A4 print styles */}
            <style>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 10mm 12mm;
                    }
                    html, body {
                        width: 210mm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .invoice-sheet {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 0 !important;
                        margin: 0 !important;
                    }
                }
                @media screen {
                    .no-print-bg { background-color: #f3f4f6; }
                }
            `}</style>

            <div className="no-print-bg min-h-screen py-10" style={{ fontFamily: "'Hind Siliguri', sans-serif" }}>

                {/* Print button */}
                <div className="no-print max-w-[794px] mx-auto mb-5 flex justify-end px-4">
                    <button
                        onClick={() => window.print()}
                        className="bg-black text-white px-8 py-2.5 rounded shadow-lg flex items-center gap-2 hover:bg-gray-800 font-bold"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Print Invoice
                    </button>
                </div>

                {/* ── A4 sheet: 210mm × 297mm at 96 dpi = 794px × 1123px ── */}
                <div
                    className="invoice-sheet mx-auto bg-white text-gray-800 shadow-2xl rounded-lg"
                    style={{ width: '794px', minHeight: '1123px', padding: '44px 52px', boxSizing: 'border-box' }}
                >

                    {/* ── HEADER ── */}
                    <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-6">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2 mb-1.5">
                                {global_settings?.site_logo ? (
                                    <img src={`/storage/${global_settings.site_logo}`} alt="Logo" className="h-10 object-contain" />
                                ) : (
                                    <>
                                        <div className="w-9 h-9 bg-black rounded flex items-center justify-center">
                                            <span className="text-white font-black text-lg">{global_settings?.site_name?.[0] ?? 'S'}</span>
                                        </div>
                                        <h1 className="text-2xl font-black tracking-tighter uppercase">{global_settings?.site_name || 'Shop'}</h1>
                                    </>
                                )}
                            </div>
                            <p className="text-gray-400 text-xs">{global_settings?.top_banner_text || 'সর্বোত্তম পণ্যের নিশ্চয়তা'}</p>
                            <div className="mt-2.5 text-xs text-gray-500 space-y-0.5">
                                {global_settings?.site_address && <p>{global_settings.site_address}</p>}
                                <p>
                                    {global_settings?.site_email}
                                    {global_settings?.site_email && global_settings?.site_phone && ' | '}
                                    {global_settings?.site_phone}
                                </p>
                            </div>
                        </div>

                        {/* Invoice meta */}
                        <div className="text-right">
                            <h2 className="text-5xl font-light text-gray-200 uppercase tracking-widest mb-4">Invoice</h2>
                            <div className="grid grid-cols-2 gap-x-5 gap-y-1.5 text-sm text-left">
                                <span className="text-gray-400">অর্ডার নম্বর:</span>
                                <span className="font-bold text-gray-900">{order.order_number}</span>

                                <span className="text-gray-400">তারিখ:</span>
                                <span className="font-semibold text-gray-700">{formatDate(order.created_at)}</span>

                                <span className="text-gray-400">পেমেন্ট মেথড:</span>
                                <span className="font-semibold text-gray-700">{paymentMethodTranslate(order.payment_method)}</span>

                                <span className="text-gray-400">অর্ডার স্ট্যাটাস:</span>
                                <span className="bg-gray-100 px-2 py-0.5 rounded text-xs uppercase border border-gray-200 font-semibold inline-block">
                                    {statusTranslate(order.order_status)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── DELIVERY ADDRESS — single horizontal row ── */}
                    <div className="bg-gray-50 border border-gray-100 rounded-lg px-5 py-3.5 mb-6">
                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                            ডেলিভারি ঠিকানা (Billed &amp; Shipped To)
                        </p>
                        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                            {/* Name */}
                            <span className="font-bold text-gray-900 text-sm">{order.customer_name}</span>

                            {/* Address */}
                            {(order.shipping_address || order.shipping_area) && (
                                <span className="text-gray-500 text-sm">
                                    <span className="text-gray-400 text-xs mr-1">ঠিকানা:</span>
                                    {[order.shipping_address, order.shipping_area].filter(Boolean).join(', ')}
                                </span>
                            )}

                            {/* Phone */}
                            {order.customer_phone && (
                                <span className="flex items-center gap-1 text-gray-700 text-sm font-medium">
                                    <svg className="w-3 h-3 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {order.customer_phone}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* ── ITEMS TABLE ── */}
                    <div className="mb-6 overflow-hidden rounded-lg border border-gray-200">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-900 text-white text-xs">
                                    <th className="py-2.5 px-3.5 font-semibold w-10 text-center">নং</th>
                                    <th className="py-2.5 px-3.5 font-semibold">পণ্যের বিবরণ</th>
                                    <th className="py-2.5 px-3.5 font-semibold text-center w-20">পরিমাণ</th>
                                    <th className="py-2.5 px-3.5 font-semibold text-right w-28">ইউনিট মূল্য</th>
                                    <th className="py-2.5 px-3.5 font-semibold text-right w-28">মোট মূল্য</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orderItems?.map((item, index) => (
                                    <tr key={item.id || index} className="hover:bg-gray-50">
                                        <td className="py-3 px-3.5 text-center text-gray-400 text-sm">{index + 1}</td>
                                        <td className="py-3 px-3.5">
                                            <p className="font-bold text-gray-900 text-sm">{item.product?.name || `Product ID: ${item.product_id}`}</p>
                                            {(item.color || item.size) && (
                                                <div className="flex gap-2 mt-0.5 text-xs text-gray-500">
                                                    {item.color && <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">রং: {item.color}</span>}
                                                    {item.size  && <span className="bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">সাইজ: {item.size}</span>}
                                                </div>
                                            )}
                                        </td>
                                        <td className="py-3 px-3.5 text-center font-semibold text-gray-800 text-sm">{item.quantity}</td>
                                        <td className="py-3 px-3.5 text-right text-gray-500 text-sm">৳ {formatBDT(item.price)}</td>
                                        <td className="py-3 px-3.5 text-right font-bold text-gray-900 text-sm">৳ {formatBDT(item.price * item.quantity)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* ── SUMMARY ── */}
                    <div className="flex justify-between items-start gap-8 mb-6">
                        {/* Notes */}
                        <div className="flex-1">
                            {order.notes && (
                                <div className="bg-blue-50/60 rounded-lg p-3.5 border border-blue-100">
                                    <h4 className="text-[9px] font-bold text-blue-700 uppercase mb-1 flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        নোটস / চার্জ:
                                    </h4>
                                    <p className="text-sm text-blue-900 font-medium">{order.notes}</p>
                                </div>
                            )}
                        </div>

                        {/* Totals */}
                        <div className="w-52 flex-shrink-0 space-y-2 text-sm">
                            <div className="flex justify-between text-gray-500">
                                <span>সাবটোটাল:</span>
                                <span>৳ {formatBDT(subtotal)}</span>
                            </div>
                            <div className="border-t border-gray-200 pt-2 flex justify-between items-center">
                                <span className="font-bold text-gray-800">সর্বমোট (Total):</span>
                                <span className="text-green-600 font-black text-xl">৳ {formatBDT(order.total_amount)}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pt-0.5">
                                <span className="text-gray-400">পেমেন্ট স্ট্যাটাস:</span>
                                <span className={`font-bold px-2 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                    {order.payment_status === 'paid' ? 'পেইড (Paid)' : 'আনপেইড (Unpaid)'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* ── COURIER & TRACKING — two separate QR codes ── */}
                    {hasCourierInfo && (
                        <div className="border-t border-dashed border-gray-200 pt-5">
                            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                </svg>
                                কুরিয়ার ও ট্র্যাকিং তথ্য (Courier &amp; Tracking Info)
                            </p>

                            <div className="flex items-center gap-6 bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">

                                {/* QR 1 — Consignment ID */}
                                {order.consignment_id && (
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <QRBox refProp={consignmentQrRef} />
                                        <div className="text-center">
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Consignment ID</p>
                                            <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 tracking-wide">
                                                {order.consignment_id}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Vertical divider */}
                                {order.consignment_id && order.tracking_code && (
                                    <div className="self-stretch w-px bg-slate-200 flex-shrink-0" />
                                )}

                                {/* QR 2 — Tracking Code */}
                                {order.tracking_code && (
                                    <div className="flex flex-col items-center gap-2 flex-shrink-0">
                                        <QRBox refProp={trackingQrRef} />
                                        <div className="text-center">
                                            <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Tracking Code</p>
                                            <p className="font-mono font-bold text-slate-800 text-[11px] mt-0.5 tracking-wide">
                                                {order.tracking_code}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Vertical divider */}
                                <div className="self-stretch w-px bg-slate-200 flex-shrink-0" />

                                {/* Courier label */}
                                <div className="flex flex-col justify-center gap-2">
                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">কুরিয়ার সার্ভিস</p>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center flex-shrink-0">
                                            <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-slate-700 text-sm">Steadfast Courier</span>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed">
                                        QR স্ক্যান করে ডেলিভারি<br />স্ট্যাটাস ট্র্যাক করুন।
                                    </p>
                                </div>

                            </div>
                        </div>
                    )}

                    {/* ── FOOTER ── */}
                    <div className="mt-10 pt-5 border-t-2 border-gray-100 text-center">
                        <p className="text-gray-700 font-bold text-base">Thank you for your business!</p>
                    </div>

                </div>{/* /invoice-sheet */}
            </div>
        </>
    );
}