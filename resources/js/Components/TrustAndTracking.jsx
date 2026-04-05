import { Link } from '@inertiajs/react';

export default function TrustAndTracking({ order, historySummary, customerHistory }) {
    return (
        <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }} className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
                .tt-card { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; }
                .tt-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding-bottom: 16px;
                    margin-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }
                .tt-icon {
                    width: 32px;
                    height: 32px;
                    background: #0f172a;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }
                .tt-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }
                .tt-subtitle {
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 500;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    margin-top: 1px;
                }
                .tt-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 10px;
                    margin-bottom: 16px;
                }
                .tt-meta-item {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px 12px;
                }
                .tt-meta-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }
                .tt-meta-value {
                    font-family: 'DM Mono', 'Courier New', monospace;
                    font-size: 11px;
                    font-weight: 500;
                    color: #1e293b;
                    word-break: break-all;
                }
                .tt-stats-row {
                    display: grid;
                    grid-template-columns: 1fr 1fr 1fr;
                    gap: 10px;
                    padding-top: 14px;
                    border-top: 1px solid #f1f5f9;
                    margin-bottom: 14px;
                    text-align: center;
                }
                .tt-stat-num {
                    font-size: 22px;
                    font-weight: 700;
                    letter-spacing: -0.03em;
                    line-height: 1;
                    margin-bottom: 4px;
                }
                .tt-stat-label {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.05em;
                    text-transform: uppercase;
                }
                .tt-warning {
                    display: flex;
                    gap: 10px;
                    align-items: flex-start;
                    background: #fef2f2;
                    border: 1px solid #fecaca;
                    border-radius: 8px;
                    padding: 12px 14px;
                    margin-bottom: 14px;
                }
                .tt-warning-text {
                    font-size: 12px;
                    color: #b91c1c;
                    line-height: 1.5;
                }
                .tt-history-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 8px;
                }
                .tt-history-list {
                    max-height: 160px;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .tt-history-list::-webkit-scrollbar { width: 4px; }
                .tt-history-list::-webkit-scrollbar-track { background: #f8fafc; }
                .tt-history-list::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }
                .tt-history-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 7px;
                    padding: 8px 12px;
                }
                .tt-history-link {
                    font-size: 12px;
                    font-weight: 600;
                    color: #3730a3;
                    text-decoration: none;
                    font-family: 'DM Mono', monospace;
                }
                .tt-history-link:hover { text-decoration: underline; }
                .tt-badge {
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.04em;
                    text-transform: uppercase;
                    padding: 2px 8px;
                    border-radius: 4px;
                }
            `}</style>

            <div className="tt-card">
                <div className="tt-header">
                    <div className="tt-icon">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <div>
                        <div className="tt-title">Trust & Tracking</div>
                        <div className="tt-subtitle">Order Intelligence</div>
                    </div>
                </div>

                {/* Tracking Meta */}
                <div className="tt-meta-grid">
                    <div className="tt-meta-item">
                        <div className="tt-meta-label">IP Address</div>
                        <div className="tt-meta-value">{order.ip_address || '—'}</div>
                    </div>
                    <div className="tt-meta-item">
                        <div className="tt-meta-label">Device Match</div>
                        <div className="tt-meta-value">{order.device_fingerprint ? 'Captured' : '—'}</div>
                    </div>
                </div>

                {/* Stats */}
                <div className="tt-stats-row">
                    <div>
                        <div className="tt-stat-num" style={{ color: '#0f172a' }}>{historySummary?.total_orders || 0}</div>
                        <div className="tt-stat-label" style={{ color: '#64748b' }}>Past Orders</div>
                    </div>
                    <div>
                        <div className="tt-stat-num" style={{ color: '#16a34a' }}>{historySummary?.delivered || 0}</div>
                        <div className="tt-stat-label" style={{ color: '#16a34a' }}>Delivered</div>
                    </div>
                    <div>
                        <div className="tt-stat-num" style={{ color: '#dc2626' }}>{historySummary?.cancelled || 0}</div>
                        <div className="tt-stat-label" style={{ color: '#dc2626' }}>Cancelled</div>
                    </div>
                </div>

                {/* Warning */}
                {(historySummary?.cancelled > 0 && historySummary?.delivered === 0) && (
                    <div className="tt-warning">
                        <svg width="16" height="16" style={{ color: '#b91c1c', flexShrink: 0, marginTop: 1 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <p className="tt-warning-text"><strong>High Risk:</strong> This IP/phone has a history of cancelled or fake orders with no successful deliveries.</p>
                    </div>
                )}

                {/* Recent matches */}
                {customerHistory && customerHistory.length > 0 && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                        <div className="tt-history-label">Recent Matches</div>
                        <div className="tt-history-list">
                            {customerHistory.map(hist => {
                                const isBad = ['cancelled', 'number_off', 'vule_order_korche'].includes(hist.order_status);
                                const isGood = hist.order_status === 'delivered';
                                const badgeStyle = isBad
                                    ? { background: '#fef2f2', color: '#b91c1c' }
                                    : isGood
                                    ? { background: '#f0fdf4', color: '#15803d' }
                                    : { background: '#f1f5f9', color: '#475569' };
                                return (
                                    <div key={hist.id} className="tt-history-item">
                                        <Link href={route('admin.orders.show', hist.id)} className="tt-history-link">
                                            {hist.order_number}
                                        </Link>
                                        <span className="tt-badge" style={badgeStyle}>
                                            {hist.order_status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}