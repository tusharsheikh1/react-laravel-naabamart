// resources/js/Pages/Frontend/Invoice.jsx
import { Head, usePage } from '@inertiajs/react';

export default function Invoice({ order, orderItems }) {
    const { global_settings } = usePage().props;

    const formatBDT = (amount) => {
        return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('bn-BD', options);
    };

    const paymentMethodTranslate = (method) => {
        if (method === 'cod') return 'ক্যাশ অন ডেলিভারি (COD)';
        if (method === 'online') return 'অনলাইন পেমেন্ট';
        return method;
    };

    const statusTranslate = (status) => {
        const map = {
            pending: 'পেন্ডিং',
            processing: 'প্রসেসিং',
            shipped: 'শিপড',
            delivered: 'ডেলিভারড',
            cancelled: 'ক্যানসেলড',
        };
        return map[status] || status;
    };

    const statusColor = (status) => {
        const map = {
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            processing: 'bg-blue-50 text-blue-700 border-blue-200',
            shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
            delivered: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            cancelled: 'bg-red-50 text-red-700 border-red-200',
        };
        return map[status] || 'bg-gray-50 text-gray-700 border-gray-200';
    };

    const subtotal = orderItems?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@300;400;500;600;700&family=DM+Serif+Display:ital@0;1&display=swap');
                
                .invoice-root { font-family: 'Hind Siliguri', sans-serif; }
                
                .invoice-paper {
                    background: #ffffff;
                    position: relative;
                }
                .invoice-paper::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0;
                    height: 6px;
                    background: linear-gradient(90deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #e94560 100%);
                }

                .watermark-text {
                    font-family: 'DM Serif Display', serif;
                    font-size: 120px;
                    color: rgba(0,0,0,0.025);
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-30deg);
                    white-space: nowrap;
                    pointer-events: none;
                    user-select: none;
                    z-index: 0;
                }

                .section-label {
                    font-size: 10px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    text-transform: uppercase;
                    color: #9ca3af;
                    margin-bottom: 10px;
                }

                .invoice-table thead tr {
                    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                }

                .item-row:nth-child(even) { background: #fafafa; }
                .item-row:hover { background: #f0f4ff; }

                .total-box {
                    background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
                    border-radius: 12px;
                    padding: 20px 24px;
                    color: white;
                }

                .print-btn {
                    background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%);
                    color: white;
                    border: none;
                    padding: 12px 28px;
                    border-radius: 8px;
                    font-family: 'Hind Siliguri', sans-serif;
                    font-weight: 600;
                    font-size: 15px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 15px rgba(15, 52, 96, 0.3);
                    transition: all 0.2s ease;
                }
                .print-btn:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 20px rgba(15, 52, 96, 0.4);
                }

                .divider-ornament {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 8px 0;
                }
                .divider-ornament::before,
                .divider-ornament::after {
                    content: '';
                    flex: 1;
                    height: 1px;
                    background: linear-gradient(90deg, transparent, #e5e7eb);
                }
                .divider-ornament::before { background: linear-gradient(90deg, #e5e7eb, transparent); }

                @media print {
                    body { margin: 0; }
                    .print-hidden { display: none !important; }
                    .invoice-root { background: white !important; padding: 0 !important; }
                    .invoice-paper { box-shadow: none !important; margin: 0 !important; border-radius: 0 !important; max-width: 100% !important; }
                }
            `}</style>

            <div className="invoice-root min-h-screen py-10" style={{ background: '#f1f5f9' }}>
                <Head title={`Invoice #${order.order_number}`} />

                {/* Action Bar */}
                <div className="print-hidden max-w-4xl mx-auto mb-5 flex justify-between items-center px-4">
                    <div style={{ fontFamily: 'Hind Siliguri', color: '#64748b', fontSize: '14px' }}>
                        অর্ডার #{order.order_number}
                    </div>
                    <button className="print-btn" onClick={() => window.print()}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        ইনভয়েস প্রিন্ট করুন
                    </button>
                </div>

                {/* Invoice Paper */}
                <div className="invoice-paper max-w-4xl mx-auto shadow-2xl rounded-xl overflow-hidden" style={{ position: 'relative' }}>
                    <div className="watermark-text">INVOICE</div>
                    
                    <div style={{ padding: '48px 56px', position: 'relative', zIndex: 1 }}>

                        {/* Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                            {/* Brand */}
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                    {global_settings?.site_logo ? (
                                        <img src={`/storage/${global_settings.site_logo}`} alt="Logo" style={{ height: '48px', objectFit: 'contain' }} />
                                    ) : (
                                        <>
                                            <div style={{
                                                width: '44px', height: '44px',
                                                background: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
                                                borderRadius: '10px',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                boxShadow: '0 4px 12px rgba(15,52,96,0.3)'
                                            }}>
                                                <span style={{ color: 'white', fontWeight: 900, fontSize: '20px' }}>
                                                    {global_settings?.site_name?.[0] || 'S'}
                                                </span>
                                            </div>
                                            <h1 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '28px', color: '#1a1a2e', margin: 0, letterSpacing: '-0.5px' }}>
                                                {global_settings?.site_name || 'Shop'}
                                            </h1>
                                        </>
                                    )}
                                </div>
                                <p style={{ color: '#94a3b8', fontSize: '12px', margin: '0 0 12px 0', letterSpacing: '0.05em' }}>
                                    {global_settings?.top_banner_text || 'সর্বোত্তম পণ্যের নিশ্চয়তা'}
                                </p>
                                {(global_settings?.site_address || global_settings?.site_email || global_settings?.site_phone) && (
                                    <div style={{ fontSize: '12px', color: '#64748b', lineHeight: '1.8' }}>
                                        {global_settings?.site_address && <div>{global_settings.site_address}</div>}
                                        <div>
                                            {global_settings?.site_email}
                                            {global_settings?.site_email && global_settings?.site_phone && ' · '}
                                            {global_settings?.site_phone}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Invoice Meta */}
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '48px', color: '#e2e8f0', lineHeight: 1, marginBottom: '16px', letterSpacing: '-2px' }}>
                                    INVOICE
                                </div>
                                <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '16px 20px', border: '1px solid #e2e8f0' }}>
                                    <table style={{ fontSize: '13px', borderSpacing: '0 6px', borderCollapse: 'separate' }}>
                                        <tbody>
                                            <tr>
                                                <td style={{ color: '#94a3b8', paddingRight: '20px', whiteSpace: 'nowrap' }}>অর্ডার নম্বর</td>
                                                <td style={{ fontWeight: 700, color: '#1a1a2e', textAlign: 'right' }}>{order.order_number}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ color: '#94a3b8' }}>তারিখ</td>
                                                <td style={{ fontWeight: 600, color: '#334155', textAlign: 'right' }}>{formatDate(order.created_at)}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ color: '#94a3b8' }}>পেমেন্ট</td>
                                                <td style={{ fontWeight: 600, color: '#334155', textAlign: 'right' }}>{paymentMethodTranslate(order.payment_method)}</td>
                                            </tr>
                                            <tr>
                                                <td style={{ color: '#94a3b8' }}>স্ট্যাটাস</td>
                                                <td style={{ textAlign: 'right' }}>
                                                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColor(order.order_status)}`}>
                                                        {statusTranslate(order.order_status)}
                                                    </span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* Thin separator */}
                        <div style={{ height: '1px', background: 'linear-gradient(90deg, #1a1a2e, #0f3460 50%, transparent)', marginBottom: '32px', opacity: 0.15 }} />

                        {/* Billing Info */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '36px' }}>
                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e2e8f0' }}>
                                <div className="section-label">ডেলিভারি ঠিকানা</div>
                                <p style={{ fontWeight: 700, fontSize: '17px', color: '#1a1a2e', margin: '0 0 4px' }}>{order.customer_name}</p>
                                <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 2px' }}>{order.shipping_address}</p>
                                <p style={{ color: '#64748b', fontSize: '13px', fontWeight: 600, margin: '0 0 10px' }}>{order.shipping_area}</p>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#1a1a2e', fontWeight: 600 }}>
                                    <svg width="14" height="14" fill="none" stroke="#94a3b8" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                    </svg>
                                    {order.customer_phone}
                                </div>
                            </div>

                            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '20px 24px', border: '1px solid #e2e8f0' }}>
                                <div className="section-label">পেমেন্ট তথ্য</div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#94a3b8' }}>পদ্ধতি:</span>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>{paymentMethodTranslate(order.payment_method)}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#94a3b8' }}>স্ট্যাটাস:</span>
                                        <span style={{
                                            fontWeight: 700,
                                            fontSize: '12px',
                                            padding: '2px 10px',
                                            borderRadius: '20px',
                                            background: order.payment_status === 'paid' ? '#ecfdf5' : '#fff7ed',
                                            color: order.payment_status === 'paid' ? '#059669' : '#d97706',
                                            border: `1px solid ${order.payment_status === 'paid' ? '#a7f3d0' : '#fed7aa'}`
                                        }}>
                                            {order.payment_status === 'paid' ? '✓ পেইড' : '⏳ আনপেইড'}
                                        </span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                                        <span style={{ color: '#94a3b8' }}>তারিখ:</span>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>{formatDate(order.created_at)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div style={{ borderRadius: '12px', overflow: 'hidden', border: '1px solid #e2e8f0', marginBottom: '32px' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr className="invoice-table">
                                        <th style={{ padding: '14px 16px', textAlign: 'center', width: '48px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#cbd5e1', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>নং</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#cbd5e1', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>পণ্যের বিবরণ</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'center', width: '80px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#cbd5e1', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>পরিমাণ</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'right', width: '110px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#cbd5e1', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>ইউনিট মূল্য</th>
                                        <th style={{ padding: '14px 16px', textAlign: 'right', width: '110px', fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: 'white', background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)' }}>মোট</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orderItems?.map((item, index) => (
                                        <tr key={item.id || index} className="item-row" style={{ borderBottom: '1px solid #f1f5f9' }}>
                                            <td style={{ padding: '14px 16px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>{index + 1}</td>
                                            <td style={{ padding: '14px 16px' }}>
                                                <div style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '14px', marginBottom: '4px' }}>
                                                    {item.product?.name || `Product ID: ${item.product_id}`}
                                                </div>
                                                {(item.color || item.size) && (
                                                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                                        {item.color && (
                                                            <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                                                রং: {item.color}
                                                            </span>
                                                        )}
                                                        {item.size && (
                                                            <span style={{ background: '#f1f5f9', color: '#64748b', fontSize: '11px', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, border: '1px solid #e2e8f0' }}>
                                                                সাইজ: {item.size}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '14px 16px', textAlign: 'center', fontWeight: 700, color: '#334155' }}>{item.quantity}</td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right', color: '#64748b', fontSize: '13px' }}>৳ {formatBDT(item.price)}</td>
                                            <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: '#1a1a2e', fontSize: '14px' }}>৳ {formatBDT(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Summary */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '24px' }}>
                            {/* Notes */}
                            <div style={{ flex: 1 }}>
                                {order.notes && (
                                    <div style={{ background: '#eff6ff', borderRadius: '10px', padding: '16px 20px', border: '1px solid #bfdbfe' }}>
                                        <div style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#3b82f6', textTransform: 'uppercase', marginBottom: '8px' }}>
                                            📝 নোটস
                                        </div>
                                        <p style={{ fontSize: '13px', color: '#1e40af', margin: 0, lineHeight: '1.6' }}>{order.notes}</p>
                                    </div>
                                )}
                            </div>

                            {/* Totals */}
                            <div style={{ width: '260px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '8px 0', borderBottom: '1px dashed #e2e8f0', marginBottom: '4px' }}>
                                    <span style={{ color: '#94a3b8' }}>সাবটোটাল</span>
                                    <span style={{ fontWeight: 600, color: '#334155' }}>৳ {formatBDT(subtotal)}</span>
                                </div>
                                {order.total_amount !== subtotal && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '6px 0', borderBottom: '1px dashed #e2e8f0', marginBottom: '4px' }}>
                                        <span style={{ color: '#94a3b8' }}>অতিরিক্ত চার্জ</span>
                                        <span style={{ fontWeight: 600, color: '#334155' }}>৳ {formatBDT(order.total_amount - subtotal)}</span>
                                    </div>
                                )}
                                <div className="total-box" style={{ marginTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '13px', fontWeight: 600, opacity: 0.85 }}>সর্বমোট</span>
                                    <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '26px', fontWeight: 400, color: '#7dd3fc' }}>
                                        ৳ {formatBDT(order.total_amount)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <p style={{ fontWeight: 700, color: '#1a1a2e', fontSize: '15px', margin: '0 0 4px' }}>
                                    আমাদের সাথে কেনাকাটা করার জন্য ধন্যবাদ!
                                </p>
                                <p style={{ color: '#94a3b8', fontSize: '12px', margin: 0 }}>
                                    পণ্য সংক্রান্ত কোনো অভিযোগ থাকলে এই রিসিটটি সংরক্ষণ করুন।
                                </p>
                            </div>
                            <div style={{ textAlign: 'right', fontSize: '11px', color: '#cbd5e1' }}>
                                <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '18px', color: '#e2e8f0', marginBottom: '2px' }}>
                                    {global_settings?.site_name || 'Shop'}
                                </div>
                                <div>#{order.order_number}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}