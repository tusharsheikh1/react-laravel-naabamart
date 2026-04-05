import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

function QRBox({ refProp }) {
    return (
        <div
            ref={refProp}
            className="w-[60px] h-[60px] bg-white border border-gray-400 rounded flex items-center justify-center overflow-hidden flex-shrink-0"
        >
            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
        </div>
    );
}

export default function Label({ order, orderItems }) {
    const { global_settings } = usePage().props;
    const consignmentQrRef = useRef(null);

    const formatBDT = (amount) =>
        new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);

    const formatDate = (dateString) =>
        new Date(dateString).toLocaleDateString('bn-BD', {
            year: 'numeric', month: 'long', day: 'numeric',
        });

    useEffect(() => {
        const renderAll = () => {
            if (!window.QRCode || !order.consignment_id) return;

            if (consignmentQrRef.current) {
                consignmentQrRef.current.innerHTML = '';
                new window.QRCode(consignmentQrRef.current, {
                    text: String(order.consignment_id),
                    width: 60,
                    height: 60,
                    colorDark: '#0f172a',
                    colorLight: '#ffffff',
                    correctLevel: window.QRCode.CorrectLevel.M,
                });
            }
        };

        if (window.QRCode) {
            renderAll();
        } else {
            const s = document.createElement('script');
            s.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
            s.onload = renderAll;
            document.head.appendChild(s);
        }
    }, [order.consignment_id]);

    return (
        <>
            <Head title={`Label #${order.order_number}`} />

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&display=swap');

                @media print {
                    @page {
                        size: 100mm auto;
                        margin: 0;
                    }
                    html, body {
                        width: 100mm;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    .no-print { display: none !important; }
                    .label-sheet {
                        width: 100% !important;
                        box-shadow: none !important;
                        border-radius: 0 !important;
                        padding: 4mm !important;
                        border: none !important;
                    }
                }
                .label-sheet {
                    width: 100mm;
                    box-sizing: border-box;
                    font-family: 'Hind Siliguri', sans-serif;
                }
            `}</style>

            <div className="no-print bg-gray-100 min-h-screen py-10 flex flex-col items-center">
                <button
                    onClick={() => window.print()}
                    className="mb-6 bg-black text-white px-8 py-2.5 rounded shadow-lg flex items-center gap-2 hover:bg-gray-800 font-bold"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Print Label
                </button>

                <div className="label-sheet bg-white shadow-2xl rounded-lg overflow-hidden border border-gray-300">
                    <LabelBody order={order} orderItems={orderItems} global_settings={global_settings} consignmentQrRef={consignmentQrRef} formatBDT={formatBDT} formatDate={formatDate} />
                </div>
            </div>

            <div className="hidden print:block">
                <div className="label-sheet bg-white">
                    <LabelBody order={order} orderItems={orderItems} global_settings={global_settings} consignmentQrRef={consignmentQrRef} formatBDT={formatBDT} formatDate={formatDate} />
                </div>
            </div>
        </>
    );
}

function LabelBody({ order, orderItems, global_settings, consignmentQrRef, formatBDT, formatDate }) {
    const subtotal = orderItems?.reduce((t, i) => t + (i.price * i.quantity), 0) ?? 0;
    const deliveryCharge = Math.max(0, order.total_amount - subtotal);

    return (
        <div className="flex flex-col h-full p-3">

            {/* Header — outline logo, no filled black box */}
            <div className="flex justify-between items-start border-b-2 border-gray-800 pb-2 mb-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                        {/* Outline badge instead of filled black square */}
                        <div className="w-6 h-6 border-2 border-gray-900 rounded flex items-center justify-center">
                            <span className="text-gray-900 font-black text-xs leading-none">
                                {global_settings?.site_name?.[0] ?? 'S'}
                            </span>
                        </div>
                        <h1 className="text-base font-black tracking-tighter uppercase text-gray-900">
                            {global_settings?.site_name || 'Shop'}
                        </h1>
                    </div>
                    <p className="text-[9px] text-gray-500 font-bold tracking-tight">#{order.order_number}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-light text-gray-400 uppercase tracking-widest leading-none">Label</h2>
                    <p className="text-[8px] font-semibold text-gray-600 mt-0.5">{formatDate(order.created_at)}</p>
                </div>
            </div>

            {/* Recipient — light outline border, no filled background */}
            <div className="border border-gray-300 rounded-lg px-2.5 py-1.5 mb-3">
                <p className="text-[7px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">প্রাপক (To)</p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-0.5">
                    <span className="font-bold text-gray-900 text-sm leading-tight">{order.customer_name}</span>
                    <span className="text-gray-700 text-xs font-bold leading-tight">{order.customer_phone}</span>
                    <p className="text-gray-600 text-[10px] leading-snug">{order.shipping_address}</p>
                </div>
            </div>

            {/* Items Table — outline header, no filled dark background */}
            <div className="overflow-hidden rounded border border-gray-300 mb-2">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-gray-300 text-[8px]">
                            <th className="py-1 px-2 font-bold text-gray-800 uppercase tracking-wide">পণ্য (Product)</th>
                            <th className="py-1 px-2 font-bold text-gray-800 uppercase tracking-wide text-center w-8">পরিমাণ</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {orderItems?.map((item, index) => (
                            <tr key={item.id || index} className="text-[9px]">
                                <td className="py-1 px-2">
                                    <p className="font-bold text-gray-900 truncate max-w-[60mm]">
                                        {item.product?.name || `Product ID: ${item.product_id}`}
                                    </p>
                                    {(item.color || item.size) && (
                                        <p className="text-[7px] text-gray-400 italic">
                                            {[item.color, item.size].filter(Boolean).join(' / ')}
                                        </p>
                                    )}
                                </td>
                                <td className="py-1 px-2 text-center font-bold text-gray-800">{item.quantity}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* COD Total — outline box instead of filled black bar */}
            <div className="border-t border-dashed border-gray-300 pt-2 mb-3">
                <div className="flex justify-between items-center text-[10px] text-gray-600 mb-1 px-1">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-bold">৳ {formatBDT(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between items-center border-2 border-gray-800 rounded px-2 py-1.5">
                    <span className="text-[8px] font-black uppercase tracking-widest text-gray-800">ক্যাশ কালেকশন (COD)</span>
                    <span className="text-lg font-black text-gray-900">৳ {formatBDT(order.total_amount)}</span>
                </div>
            </div>

            {/* Footer with QR — outline only, no filled slate background */}
            <div className="border border-gray-300 rounded-lg p-2 flex items-center justify-between">
                <div className="flex flex-col justify-center">
                    <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider mb-1">Courier Service</p>
                    <span className="font-bold text-gray-700 text-[10px]">Steadfast Courier</span>
                    <p className="text-[8px] text-gray-400 leading-tight">স্ক্যান করে স্ট্যাটাস ট্র্যাক করুন।</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="text-right">
                        <p className="text-[7px] text-gray-400 font-bold uppercase tracking-wider">Consignment ID</p>
                        <p className="text-[9px] font-bold text-gray-800 font-mono">{order.consignment_id || 'N/A'}</p>
                    </div>
                    <QRBox refProp={consignmentQrRef} />
                </div>
            </div>

            {/* Minimal Footer */}
            <div className="mt-2 text-[7px] text-gray-400 flex justify-between items-center italic">
                <span className="truncate max-w-[70%]">ফেরত: {global_settings?.site_address}</span>
                <span className="font-bold">{global_settings?.site_phone}</span>
            </div>
        </div>
    );
}