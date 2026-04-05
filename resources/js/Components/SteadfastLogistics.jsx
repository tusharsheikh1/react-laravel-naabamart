export default function SteadfastLogistics({ order, liveStatus, fetchingStatus, fetchLiveStatus, handleSendToSteadfast }) {
    return (
        <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }} className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=DM+Mono:wght@400;500&display=swap');

                .sf-card { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; }

                .sf-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 20px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #f1f5f9;
                }

                .sf-logo-mark {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .sf-icon {
                    width: 32px;
                    height: 32px;
                    background: #0f172a;
                    border-radius: 7px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .sf-title {
                    font-size: 14px;
                    font-weight: 600;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }

                .sf-subtitle {
                    font-size: 11px;
                    color: #94a3b8;
                    font-weight: 500;
                    letter-spacing: 0.03em;
                    text-transform: uppercase;
                    margin-top: 1px;
                }

                .sf-pulse {
                    width: 7px;
                    height: 7px;
                    background: #22c55e;
                    border-radius: 50%;
                    position: relative;
                }
                .sf-pulse::after {
                    content: '';
                    position: absolute;
                    inset: -3px;
                    border-radius: 50%;
                    background: #22c55e;
                    opacity: 0.3;
                    animation: sf-ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
                }
                @keyframes sf-ping {
                    0% { transform: scale(0.8); opacity: 0.4; }
                    70% { transform: scale(1.8); opacity: 0; }
                    100% { transform: scale(1.8); opacity: 0; }
                }

                .sf-status-card {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 14px 16px;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .sf-status-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 4px;
                }

                .sf-status-value {
                    font-size: 13px;
                    font-weight: 600;
                    color: #0f172a;
                    letter-spacing: -0.01em;
                }

                .sf-refresh-btn {
                    background: none;
                    border: 1px solid #e2e8f0;
                    border-radius: 6px;
                    padding: 6px;
                    cursor: pointer;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.15s ease;
                }
                .sf-refresh-btn:hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #0f172a;
                }

                @keyframes sf-spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .sf-spinning { animation: sf-spin 0.8s linear infinite; }

                .sf-meta-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }

                .sf-meta-item {
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 12px 14px;
                }

                .sf-meta-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 5px;
                }

                .sf-meta-value {
                    font-family: 'DM Mono', 'Courier New', monospace;
                    font-size: 12px;
                    font-weight: 500;
                    color: #1e293b;
                    letter-spacing: -0.01em;
                }

                .sf-empty-text {
                    font-size: 13px;
                    color: #64748b;
                    line-height: 1.5;
                    margin-bottom: 16px;
                }

                .sf-dispatch-btn {
                    width: 100%;
                    background: #0f172a;
                    color: #fff;
                    border: none;
                    border-radius: 8px;
                    padding: 12px 16px;
                    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
                    font-size: 13px;
                    font-weight: 600;
                    letter-spacing: -0.01em;
                    cursor: pointer;
                    transition: all 0.15s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }
                .sf-dispatch-btn:hover {
                    background: #1e293b;
                }
                .sf-dispatch-btn:active {
                    transform: scale(0.99);
                }
            `}</style>

            <div className="sf-card">
                {/* Header */}
                <div className="sf-header">
                    <div className="sf-logo-mark">
                        <div className="sf-icon">
                            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
                            </svg>
                        </div>
                        <div>
                            <div className="sf-title">Steadfast Logistics</div>
                            <div className="sf-subtitle">Courier Service</div>
                        </div>
                    </div>
                    {fetchingStatus && <div className="sf-pulse" />}
                </div>

                {order.consignment_id ? (
                    <div>
                        {/* Live Status */}
                        <div className="sf-status-card">
                            <div>
                                <div className="sf-status-label">Delivery Status</div>
                                <div className="sf-status-value">
                                    {liveStatus ? liveStatus.replace(/_/g, ' ') : '—'}
                                </div>
                            </div>
                            <button className="sf-refresh-btn" onClick={fetchLiveStatus} title="Refresh status">
                                <svg className={fetchingStatus ? 'sf-spinning' : ''} width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                            </button>
                        </div>

                        {/* Meta */}
                        <div className="sf-meta-grid">
                            <div className="sf-meta-item">
                                <div className="sf-meta-label">Consignment</div>
                                <div className="sf-meta-value">{order.consignment_id}</div>
                            </div>
                            <div className="sf-meta-item">
                                <div className="sf-meta-label">Tracking</div>
                                <div className="sf-meta-value">{order.tracking_code}</div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="sf-empty-text">This order hasn't been dispatched yet.</p>
                        <button className="sf-dispatch-btn" onClick={handleSendToSteadfast}>
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                            Dispatch to Courier
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}