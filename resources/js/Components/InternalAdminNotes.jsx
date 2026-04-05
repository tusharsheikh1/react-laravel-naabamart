export default function InternalAdminNotes({ order, isEditing, editForm, formatDateTime }) {
    return (
        <div style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }} className="bg-white border border-slate-200 rounded-lg shadow-sm mb-6">
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
                .an-wrap { font-family: 'DM Sans', 'Helvetica Neue', sans-serif; }

                .an-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 16px 20px;
                    border-bottom: 1px solid #f1f5f9;
                    background: #fafafa;
                    border-radius: 8px 8px 0 0;
                }
                .an-icon {
                    width: 32px; height: 32px;
                    background: #0f172a;
                    border-radius: 7px;
                    display: flex; align-items: center; justify-content: center;
                    flex-shrink: 0;
                }
                .an-title { font-size: 14px; font-weight: 600; color: #0f172a; letter-spacing: -0.01em; }
                .an-subtitle { font-size: 11px; color: #94a3b8; font-weight: 500; letter-spacing: 0.03em; text-transform: uppercase; margin-top: 1px; }

                .an-body { padding: 16px 20px; }

                .an-timeline {
                    max-height: 220px;
                    overflow-y: auto;
                    margin-bottom: 4px;
                }
                .an-timeline::-webkit-scrollbar { width: 4px; }
                .an-timeline::-webkit-scrollbar-track { background: #f8fafc; }
                .an-timeline::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 2px; }

                .an-entry {
                    display: flex;
                    gap: 12px;
                    padding: 10px 0;
                    border-bottom: 1px solid #f8fafc;
                }
                .an-entry:last-child { border-bottom: none; padding-bottom: 0; }
                .an-entry:first-child { padding-top: 0; }

                .an-dot-col {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    padding-top: 3px;
                    flex-shrink: 0;
                }
                .an-dot {
                    width: 8px; height: 8px;
                    background: #0f172a;
                    border-radius: 50%;
                    flex-shrink: 0;
                }
                .an-line {
                    width: 1px;
                    flex: 1;
                    background: #e2e8f0;
                    margin-top: 4px;
                    min-height: 16px;
                }

                .an-note-text {
                    font-size: 13px;
                    font-weight: 500;
                    color: #1e293b;
                    line-height: 1.5;
                    margin-bottom: 3px;
                }
                .an-note-meta {
                    font-size: 11px;
                    color: #94a3b8;
                }
                .an-note-author {
                    font-weight: 600;
                    color: #475569;
                }

                .an-empty {
                    font-size: 13px;
                    color: #94a3b8;
                    font-style: italic;
                    padding: 4px 0 12px;
                }

                .an-input-section {
                    border-top: 1px solid #f1f5f9;
                    padding-top: 14px;
                    margin-top: 4px;
                }
                .an-input-label {
                    font-size: 10px;
                    font-weight: 600;
                    color: #94a3b8;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                    margin-bottom: 6px;
                    display: block;
                }
                .an-textarea {
                    width: 100%;
                    font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
                    font-size: 13px;
                    color: #1e293b;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    border-radius: 8px;
                    padding: 10px 12px;
                    resize: vertical;
                    outline: none;
                    transition: border-color 0.15s, box-shadow 0.15s;
                    box-sizing: border-box;
                    line-height: 1.5;
                }
                .an-textarea::placeholder { color: #cbd5e1; }
                .an-textarea:focus {
                    border-color: #0f172a;
                    box-shadow: 0 0 0 3px rgba(15,23,42,0.06);
                    background: #fff;
                }
            `}</style>

            <div className="an-wrap">
                <div className="an-header">
                    <div className="an-icon">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </div>
                    <div>
                        <div className="an-title">Internal Admin Notes</div>
                        <div className="an-subtitle">Private · Staff Only</div>
                    </div>
                </div>

                <div className="an-body">
                    {order.admin_notes && order.admin_notes.length > 0 ? (
                        <div className="an-timeline">
                            {[...order.admin_notes].reverse().map((noteObj, idx, arr) => (
                                <div key={idx} className="an-entry">
                                    <div className="an-dot-col">
                                        <div className="an-dot" />
                                        {idx !== arr.length - 1 && <div className="an-line" />}
                                    </div>
                                    <div>
                                        <p className="an-note-text">{noteObj.note}</p>
                                        <p className="an-note-meta">
                                            by <span className="an-note-author">{noteObj.user}</span> · {formatDateTime(noteObj.time)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="an-empty">No internal notes added yet.</p>
                    )}

                    {isEditing && (
                        <div className="an-input-section">
                            <label className="an-input-label">Add New Note</label>
                            <textarea
                                className="an-textarea"
                                value={editForm.data.new_admin_note}
                                onChange={e => editForm.setData('new_admin_note', e.target.value)}
                                rows={2}
                                placeholder="Type a private note..."
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}