// resources/js/Components/FloatingContact.jsx
import React, { useState, useEffect, useRef } from 'react';
import { usePage } from '@inertiajs/react';

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');

  @keyframes fc-breathe {
    0%, 100% { box-shadow: 0 0 0 0 rgba(22,163,74,0.5), 0 8px 24px rgba(22,163,74,0.35); }
    50%       { box-shadow: 0 0 0 8px rgba(22,163,74,0), 0 8px 24px rgba(22,163,74,0.35); }
  }
  @keyframes fc-badge-pop {
    0%   { transform: scale(0); }
    70%  { transform: scale(1.25); }
    100% { transform: scale(1); }
  }
  @keyframes fc-slide-up {
    from { opacity: 0; transform: translateY(8px) scale(0.95); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }

  .fc-wrap * { box-sizing: border-box; }
  .fc-wrap { font-family: 'DM Sans', sans-serif; }

  /* ── Toggle Button ── */
  .fc-toggle {
    width: 56px; height: 56px;
    border-radius: 16px;
    border: none; cursor: pointer;
    background: linear-gradient(145deg, #22c55e, #15803d);
    display: flex; align-items: center; justify-content: center;
    position: relative; z-index: 2;
    transition: transform 0.24s cubic-bezier(.34,1.56,.64,1),
                border-radius 0.24s ease,
                background 0.24s ease;
    animation: fc-breathe 3s ease-in-out infinite;
  }
  .fc-toggle:hover {
    transform: scale(1.1) translateY(-2px);
    animation: none;
    box-shadow: 0 14px 32px rgba(22,163,74,0.45);
  }
  .fc-toggle.open {
    background: linear-gradient(145deg, #1f2937, #111827);
    border-radius: 50%;
    animation: none;
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
    transform: rotate(0deg);
  }
  .fc-toggle svg {
    color: #fff;
    transition: transform 0.3s cubic-bezier(.34,1.56,.64,1);
  }
  .fc-toggle.open svg { transform: rotate(90deg); }

  .fc-badge {
    position: absolute; top: -5px; right: -5px;
    width: 16px; height: 16px;
    background: #ef4444;
    border-radius: 50%;
    border: 2px solid #fff;
    animation: fc-badge-pop 0.4s cubic-bezier(.34,1.56,.64,1) 1.2s both;
  }

  /* ── Panel ── */
  .fc-panel {
    position: absolute;
    bottom: calc(100% + 10px);
    right: 0;
    width: 230px;
    background: rgba(15, 23, 42, 0.96);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 20px;
    padding: 8px;
    box-shadow:
      0 24px 64px rgba(0,0,0,0.4),
      0 4px 16px rgba(0,0,0,0.2),
      inset 0 1px 0 rgba(255,255,255,0.06);
    transform-origin: bottom right;
    transition:
      opacity 0.2s ease,
      transform 0.28s cubic-bezier(.34,1.56,.64,1);
  }
  .fc-panel.closed {
    opacity: 0;
    transform: scale(0.8) translateY(12px);
    pointer-events: none;
  }
  .fc-panel.open {
    opacity: 1;
    transform: scale(1) translateY(0);
  }

  /* ── Panel Header ── */
  .fc-header {
    padding: 8px 10px 10px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    margin-bottom: 4px;
  }
  .fc-header-eyebrow {
    margin: 0 0 2px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: rgba(255,255,255,0.3);
  }
  .fc-header-title {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: #f1f5f9;
    letter-spacing: -0.01em;
  }

  /* ── Contact Item ── */
  .fc-item {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 9px 10px;
    border-radius: 12px;
    text-decoration: none;
    transition: background 0.16s ease, transform 0.16s ease;
    animation: fc-slide-up 0.28s ease both;
  }
  .fc-item:hover {
    background: rgba(255,255,255,0.06);
    transform: translateX(-2px);
  }
  .fc-item:active { transform: scale(0.97); }

  .fc-icon {
    width: 38px; height: 38px;
    border-radius: 11px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    transition: transform 0.22s cubic-bezier(.34,1.56,.64,1);
  }
  .fc-item:hover .fc-icon { transform: scale(1.1) rotate(-5deg); }

  .fc-icon-wa  { background: linear-gradient(135deg, #25D366, #128C7E); }
  .fc-icon-fb  { background: linear-gradient(135deg, #0ea5e9, #7c3aed); }
  .fc-icon-tel { background: linear-gradient(135deg, #f97316, #c2410c); }

  .fc-text { flex: 1; min-width: 0; }
  .fc-name {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: #f8fafc;
    line-height: 1.25;
  }
  .fc-sub {
    display: block;
    font-size: 11px;
    color: rgba(255,255,255,0.38);
    margin-top: 1px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .fc-arrow {
    color: rgba(255,255,255,0.18);
    flex-shrink: 0;
    transition: color 0.16s, transform 0.16s;
  }
  .fc-item:hover .fc-arrow {
    color: rgba(255,255,255,0.5);
    transform: translateX(3px);
  }

  .fc-sep {
    height: 1px;
    background: rgba(255,255,255,0.05);
    margin: 2px 0;
  }

  /* ── Desktop override ── */
  @media (min-width: 768px) {
    .fc-root {
      bottom: 32px !important;
      right: 24px !important;
    }
  }
`;

/* ── Icons ── */
const WaIcon = () => (
  <svg width="19" height="19" fill="currentColor" viewBox="0 0 24 24" style={{color:'#fff'}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z"/>
  </svg>
);
const FbIcon = () => (
  <svg width="19" height="19" fill="currentColor" viewBox="0 0 24 24" style={{color:'#fff'}}>
    <path d="M12 2C6.477 2 2 6.145 2 11.258c0 2.923 1.503 5.514 3.821 7.218v3.524l3.482-1.928c.86.241 1.765.37 2.697.37 5.523 0 10-4.145 10-9.258C22 6.145 17.523 2 12 2zm1.066 12.316l-2.73-2.91-5.32 2.91 5.86-6.22 2.75 2.91 5.29-2.91-5.85 6.22z"/>
  </svg>
);
const TelIcon = () => (
  <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{color:'#fff'}}>
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);
const ChatIcon = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" style={{color:'#fff'}}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" viewBox="0 0 24 24" style={{color:'#fff'}}>
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevronRight = () => (
  <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

export default function FloatingContact() {
    const [isOpen, setIsOpen]       = useState(false);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [showBadge, setShowBadge] = useState(true);
    const wrapRef = useRef(null);

    const { global_settings } = usePage().props;
    const settings = global_settings || {};

    useEffect(() => {
        const handler = (e) => setIsCartOpen(e.detail);
        window.addEventListener('cart-state-changed', handler);
        return () => window.removeEventListener('cart-state-changed', handler);
    }, []);

    useEffect(() => {
        if (isOpen) setShowBadge(false);
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (wrapRef.current && !wrapRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [isOpen]);

    const whatsappNumber = settings.floating_whatsapp || null;
    const phoneNumber    = settings.floating_phone    || null;
    const messengerLink  = settings.floating_messenger || null;

    if (!whatsappNumber && !phoneNumber && !messengerLink) return null;

    const methods = [
        whatsappNumber && {
            key: 'wa', name: 'WhatsApp', sub: 'Chat now',
            href: `https://wa.me/${whatsappNumber}`, target: '_blank',
            iconClass: 'fc-icon-wa', icon: <WaIcon />,
            delay: '0ms',
        },
        messengerLink && {
            key: 'fb', name: 'Messenger', sub: 'Message on Facebook',
            href: messengerLink, target: '_blank',
            iconClass: 'fc-icon-fb', icon: <FbIcon />,
            delay: '50ms',
        },
        phoneNumber && {
            key: 'tel', name: 'Call Us', sub: phoneNumber,
            href: `tel:${phoneNumber}`, target: '_self',
            iconClass: 'fc-icon-tel', icon: <TelIcon />,
            delay: '100ms',
        },
    ].filter(Boolean);

    return (
        <>
            <style>{styles}</style>
            <div
                className="fc-wrap fc-root"
                ref={wrapRef}
                style={{
                    position: 'fixed',
                    bottom: '80px',
                    right: '16px',
                    zIndex: 9999,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    transition: 'opacity 0.28s ease, transform 0.28s cubic-bezier(.4,0,.2,1)',
                    opacity: isCartOpen ? 0 : 1,
                    transform: isCartOpen ? 'translateX(72px)' : 'translateX(0)',
                    pointerEvents: isCartOpen ? 'none' : 'auto',
                }}
            >
                {/* Dropdown Panel */}
                <div className={`fc-panel ${isOpen ? 'open' : 'closed'}`} role="dialog" aria-label="Contact options">
                    <div className="fc-header">
                        <p className="fc-header-eyebrow">Get in touch</p>
                        <h4 className="fc-header-title">We're here for you 👋</h4>
                    </div>

                    {methods.map((m, i) => (
                        <React.Fragment key={m.key}>
                            {i > 0 && <div className="fc-sep" />}
                            <a
                                href={m.href}
                                target={m.target}
                                rel="noreferrer"
                                aria-label={m.name}
                                className="fc-item"
                                style={{ animationDelay: m.delay }}
                            >
                                <span className={`fc-icon ${m.iconClass}`}>{m.icon}</span>
                                <span className="fc-text">
                                    <span className="fc-name">{m.name}</span>
                                    <span className="fc-sub">{m.sub}</span>
                                </span>
                                <span className="fc-arrow"><ChevronRight /></span>
                            </a>
                        </React.Fragment>
                    ))}
                </div>

                {/* Toggle */}
                <button
                    className={`fc-toggle ${isOpen ? 'open' : ''}`}
                    onClick={() => setIsOpen(v => !v)}
                    aria-label={isOpen ? 'Close contact menu' : 'Open contact menu'}
                    aria-expanded={isOpen}
                >
                    {isOpen ? <CloseIcon /> : <ChatIcon />}
                    {showBadge && !isOpen && <span className="fc-badge" aria-hidden="true" />}
                </button>
            </div>
        </>
    );
}