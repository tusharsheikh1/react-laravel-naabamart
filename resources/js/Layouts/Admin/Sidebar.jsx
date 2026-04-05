import React, { useState, useCallback, useEffect } from 'react';
import { Link, usePage } from '@inertiajs/react';

// ---------------------------------------------------------------------------
// localStorage key
// ---------------------------------------------------------------------------
const SIDEBAR_STORAGE_KEY = 'admin_sidebar_collapsed';

// Read initial state from localStorage - default to true (collapsed) if not set
const getInitialCollapsed = () => {
    try {
        const stored = localStorage.getItem(SIDEBAR_STORAGE_KEY);
        // If user has never toggled, default to collapsed
        return stored === null ? true : stored === 'true';
    } catch {
        return true;
    }
};

// ---------------------------------------------------------------------------
// Icons
// ---------------------------------------------------------------------------
const ICONS = {
    dashboard:    'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6',
    analytics:    'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
    behavior:     'M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5',
    orders:       'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
    incompleteOrders: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z',
    accounting:   'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    catalog:      'M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z',
    attributes:   'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z',
    system:       'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z',
    product:      'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4',
    category:     'M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z',
    brand:        'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z',
    author:       'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    publication:  'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253',
    color:        'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01',
    size:         'M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4',
    shipping:     'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4',
    slider:       'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
    landingPage:  'M4 6a2 2 0 012-2h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm2 0v3h12V6H6zm0 5v7h4v-7H6zm6 0v7h6v-7h-6z', // NEW: Added landing page icon
    users:        'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z',
    settings:     'M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4',
    security:     'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', 
    chevron:      'M19 9l-7 7-7-7',
    campaign:     'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z',
    intelligence: 'M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z',
    logout:       'M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1',
    chevronsLeft:  'M11 19l-7-7 7-7m8 14l-7-7 7-7',
    chevronsRight: 'M13 5l7 7-7 7M5 5l7 7-7 7',
};

const SvgIcon = ({ name, className = 'w-4 h-4', style }) => (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24"
        stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS[name]} />
    </svg>
);

// ---------------------------------------------------------------------------
// Styles - light / day mode
// ---------------------------------------------------------------------------
const STYLES = `
    .sb-root {
        --sb-bg:          #ffffff;
        --sb-border:      #e5e7eb;
        --sb-accent:      #4f46e5;
        --sb-accent-dim:  #eef2ff;
        --sb-accent-text: #4338ca;
        --sb-text-1:      #111827;
        --sb-text-2:      #6b7280;
        --sb-text-3:      #9ca3af;
        --sb-hover:       #f3f4f6;
        --sb-width:       256px;
        --sb-width-min:   64px;

        width: var(--sb-width);
        height: 100vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: var(--sb-bg);
        border-right: 1px solid var(--sb-border);
        flex-shrink: 0;
        transition: width 280ms cubic-bezier(.4,0,.2,1);
    }
    .sb-root.collapsed { width: var(--sb-width-min); }

    /* - Brand - */
    .sb-brand {
        display: flex;
        align-items: center;
        gap: 10px;
        height: 64px;
        padding: 0 15px;
        border-bottom: 1px solid var(--sb-border);
        flex-shrink: 0;
        position: relative;
        overflow: hidden;
    }
    .sb-brand-logo {
        flex-shrink: 0;
        transition: max-width 280ms cubic-bezier(.4,0,.2,1), opacity 200ms;
        overflow: hidden;
        white-space: nowrap;
    }

    /* - Collapse button - */
    .sb-collapse-btn {
        position: absolute;
        right: 12px; top: 50%; transform: translateY(-50%);
        width: 26px; height: 26px;
        border-radius: 7px;
        border: 1px solid var(--sb-border);
        background: #fff;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        color: var(--sb-text-3);
        transition: background 140ms, color 140ms, border-color 140ms, right 280ms, transform 280ms;
        flex-shrink: 0;
        z-index: 2;
    }
    .sb-collapse-btn:hover { background: var(--sb-hover); color: var(--sb-text-1); border-color: #d1d5db; }
    .sb-collapse-btn:focus-visible { outline: 2px solid var(--sb-accent); outline-offset: 2px; }

    .sb-root.collapsed .sb-collapse-btn {
        right: 50%;
        transform: translate(50%, -50%);
    }

    /* - Nav scrollable region - */
    .sb-nav {
        flex: 1;
        min-height: 0;
        padding: 10px 8px 16px;
        overflow-y: auto;
        overflow-x: hidden;
    }
    .sb-nav::-webkit-scrollbar { width: 3px; }
    .sb-nav::-webkit-scrollbar-track { background: transparent; }
    .sb-nav::-webkit-scrollbar-thumb { background: #dde1e7; border-radius: 99px; }
    .sb-nav::-webkit-scrollbar-thumb:hover { background: #c4c9d4; }

    /* - Section labels - */
    .sb-section {
        font-size: 9.5px; font-weight: 700;
        letter-spacing: 0.1em; text-transform: uppercase;
        color: var(--sb-text-3);
        padding: 0 10px;
        margin: 20px 0 5px;
        user-select: none;
        white-space: nowrap;
        overflow: hidden;
        transition: opacity 200ms, max-height 280ms, margin 280ms, padding 280ms;
        max-height: 30px;
    }
    .sb-section:first-child { margin-top: 4px; }
    .sb-root.collapsed .sb-section {
        opacity: 0; max-height: 0;
        margin: 0; padding: 0;
        pointer-events: none;
    }

    /* - Nav links - */
    .sb-link {
        display: flex; align-items: center; gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        font-size: 13px; font-weight: 500;
        color: var(--sb-text-2);
        text-decoration: none; cursor: pointer;
        border: none; background: none;
        width: 100%; text-align: left;
        transition: background 140ms, color 140ms;
        outline: none; position: relative;
        white-space: nowrap; overflow: hidden;
    }
    .sb-link:hover, .sb-link:focus-visible { background: var(--sb-hover); color: var(--sb-text-1); }
    .sb-link:focus-visible { box-shadow: inset 0 0 0 1.5px var(--sb-accent); }
    .sb-link.active { background: var(--sb-accent-dim); color: var(--sb-accent-text); font-weight: 600; }
    
    .sb-link.active::before {
        content: ''; position: absolute; left: 0; top: 50%; transform: translateY(-50%);
        width: 3px; height: 18px; background: var(--sb-accent); border-radius: 0 3px 3px 0;
    }

    .sb-root.collapsed .sb-link { justify-content: center; padding: 8px 0; }
    .sb-root.collapsed .sb-link.active::before { display: none; }

    /* Fade out labels / chevrons / badges when collapsed */
    .sb-link-label, .sb-chevron-wrap, .sb-badge {
        transition: opacity 180ms, width 280ms, max-width 280ms;
        overflow: hidden;
        white-space: nowrap;
    }
    .sb-root.collapsed .sb-link-label,
    .sb-root.collapsed .sb-chevron-wrap,
    .sb-root.collapsed .sb-badge {
        opacity: 0;
        max-width: 0;
        pointer-events: none;
    }
    .sb-link-label { flex: 1; }

    /* Tooltip in collapsed mode */
    .sb-root.collapsed [data-tip] { position: relative; }
    .sb-root.collapsed [data-tip]::after {
        content: attr(data-tip);
        position: absolute; left: calc(100% + 10px); top: 50%; transform: translateY(-50%);
        background: #1f2937; color: #f9fafb;
        font-size: 12px; font-weight: 500;
        padding: 5px 10px; border-radius: 6px;
        white-space: nowrap; pointer-events: none;
        opacity: 0; transition: opacity 140ms; z-index: 200;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }
    .sb-root.collapsed [data-tip]:hover::after { opacity: 1; }

    /* - Icon wrapper - */
    .sb-icon {
        width: 30px; height: 30px; flex-shrink: 0;
        display: flex; align-items: center; justify-content: center;
        border-radius: 7px; color: var(--sb-text-2);
        transition: background 140ms, color 140ms;
    }
    .sb-link:hover .sb-icon, .sb-link:focus-visible .sb-icon { background: #e9eaec; color: var(--sb-text-1); }
    .sb-link.active .sb-icon { background: #e0e7ff; color: var(--sb-accent); }

    /* - Chevron - */
    .sb-chevron {
        flex-shrink: 0; color: var(--sb-text-3);
        transition: transform 260ms cubic-bezier(.4,0,.2,1);
    }
    .sb-chevron.open { transform: rotate(180deg); }

    /* - Badge - */
    .sb-badge {
        background: #e0e7ff; color: var(--sb-accent-text);
        font-size: 10px; font-weight: 700;
        padding: 1px 6px; border-radius: 99px; flex-shrink: 0;
    }

    /* - Dropdown children - */
    .sb-children {
        overflow: hidden;
        transition: max-height 280ms cubic-bezier(.4,0,.2,1), opacity 200ms;
    }
    .sb-root.collapsed .sb-children { max-height: 0 !important; opacity: 0 !important; }

    .sb-children-inner {
        margin: 2px 0 2px 14px; padding-left: 12px;
        border-left: 1.5px solid #e5e7eb;
    }

    /* - Child links - */
    .sb-child {
        display: flex; align-items: center; gap: 8px;
        padding: 6px 8px; border-radius: 6px;
        font-size: 12.5px; color: var(--sb-text-2);
        text-decoration: none; outline: none;
        transition: background 140ms, color 140ms;
        white-space: nowrap; overflow: hidden;
    }
    .sb-child:hover, .sb-child:focus-visible { background: var(--sb-hover); color: var(--sb-text-1); }
    .sb-child:focus-visible { box-shadow: inset 0 0 0 1.5px var(--sb-accent); }
    .sb-child.active { color: var(--sb-accent-text); font-weight: 600; }
    
    .sb-child-dot {
        width: 5px; height: 5px; border-radius: 50%;
        background: var(--sb-accent); flex-shrink: 0; margin-left: auto;
    }

    /* - User footer - */
    .sb-footer { padding: 8px; border-top: 1px solid var(--sb-border); flex-shrink: 0; }
    .sb-user {
        display: flex; align-items: center; gap: 10px;
        padding: 8px; border-radius: 8px;
        cursor: pointer; transition: background 140ms;
        text-decoration: none; overflow: hidden;
        width: 100%; border: none; background: none; text-align: left;
    }
    .sb-user:hover { background: var(--sb-hover); }
    .sb-root.collapsed .sb-user { justify-content: center; }

    .sb-avatar {
        width: 32px; height: 32px; border-radius: 8px;
        background: linear-gradient(135deg, #4f46e5, #7c3aed);
        display: flex; align-items: center; justify-content: center;
        font-size: 12px; font-weight: 700; color: #fff; flex-shrink: 0;
    }
    .sb-user-info {
        flex: 1; min-width: 0; overflow: hidden;
        transition: opacity 180ms, max-width 280ms;
        max-width: 200px;
    }
    .sb-root.collapsed .sb-user-info { opacity: 0; max-width: 0; pointer-events: none; }
    
    .sb-user-name { font-size: 12.5px; font-weight: 600; color: var(--sb-text-1); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .sb-user-role { font-size: 10.5px; color: var(--sb-text-3); text-transform: capitalize; }

    .sb-logout-icon {
        color: var(--sb-text-3); flex-shrink: 0;
        transition: color 140ms, opacity 180ms, max-width 280ms;
        max-width: 20px; overflow: hidden;
    }
    .sb-user:hover .sb-logout-icon { color: var(--sb-text-2); }
    .sb-root.collapsed .sb-logout-icon { opacity: 0; max-width: 0; }
`;

// ---------------------------------------------------------------------------
// Atomic components
// ---------------------------------------------------------------------------
const SectionLabel = ({ children }) => <p className="sb-section">{children}</p>;

const Badge = ({ count }) =>
    count > 0 ? <span className="sb-badge">{count}</span> : null;

const NavIcon = ({ name }) => (
    <span className="sb-icon"><SvgIcon name={name} /></span>
);

const Chevron = ({ open }) => (
    <svg
        className={`sb-chevron${open ? ' open' : ''}`}
        width="13" height="13" viewBox="0 0 24 24"
        fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"
    >
        <path strokeLinecap="round" strokeLinejoin="round" d={ICONS.chevron} />
    </svg>
);

const NavLink = ({ href, iconName, label, path, badge, isActive }) => {
    const active = isActive(path);
    return (
        <Link
            href={href}
            className={`sb-link${active ? ' active' : ''}`}
            data-tip={label}
            aria-current={active ? 'page' : undefined}
        >
            <NavIcon name={iconName} />
            <span className="sb-link-label">{label}</span>
            {badge != null && <Badge count={badge} />}
        </Link>
    );
};

const ChildLink = ({ href, iconName, label, path, isActive }) => {
    const active = isActive(path);
    return (
        <Link
            href={href}
            className={`sb-child${active ? ' active' : ''}`}
            aria-current={active ? 'page' : undefined}
        >
            <SvgIcon name={iconName} className="w-3.5 h-3.5"
                style={{ opacity: active ? 1 : 0.5, flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{label}</span>
            {active && <span className="sb-child-dot" aria-hidden="true" />}
        </Link>
    );
};

const NavGroup = ({ menuKey, iconName, label, isAnyChildActive, openMenus, toggleMenu, isActive, children }) => {
    const open = openMenus[menuKey];
    const panelId = `sb-panel-${menuKey}`;
    return (
        <div>
            <button
                type="button"
                onClick={() => toggleMenu(menuKey)}
                className={`sb-link${isAnyChildActive ? ' active' : ''}`}
                data-tip={label}
                aria-expanded={open}
                aria-controls={panelId}
            >
                <NavIcon name={iconName} />
                <span className="sb-link-label" style={{ flex: 1 }}>{label}</span>
                <span className="sb-chevron-wrap" style={{ display: 'flex' }}>
                    <Chevron open={open} />
                </span>
            </button>
            <div
                id={panelId}
                className="sb-children"
                style={{ maxHeight: open ? '600px' : '0', opacity: open ? 1 : 0 }}
                aria-hidden={!open}
            >
                <div className="sb-children-inner">{children}</div>
            </div>
        </div>
    );
};

// ---------------------------------------------------------------------------
// Sidebar
// ---------------------------------------------------------------------------
export default function Sidebar() {
    const { url, props } = usePage();
    const user     = props.auth?.user;
    const settings = props.global_settings || props.settings || {};
    const siteName = settings.site_name || 'Admin Panel';
    const logoPath = settings.site_logo ? `/storage/${settings.site_logo}` : null;

    // -- Collapsed state - initialised from localStorage --
    const [collapsed, setCollapsed] = useState(getInitialCollapsed);

    // Persist to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
        } catch {
            // localStorage unavailable (private browsing, storage quota, etc.) - silently ignore
        }
    }, [collapsed]);

    const toggleCollapsed = useCallback(() => {
        setCollapsed((prev) => !prev);
    }, []);

    // -- Active route helpers --
    const isActive = useCallback((path) => url.startsWith(path), [url]);

    const isCatalogActive    = ['/admin/products', '/admin/categories', '/admin/brands', '/admin/authors', '/admin/publications'].some(isActive);
    const isAttributesActive = ['/admin/colors', '/admin/sizes'].some(isActive);
    const isAnalyticsActive  = ['/admin/analytics'].some(isActive);
    
    // UPDATED: Now includes landing pages so the dropdown stays open
    const isCampaignActive   = ['/admin/sliders', '/admin/landing-pages'].some(isActive); 
    
    const isSystemActive     = ['/admin/shipping-methods', '/admin/users', '/admin/settings', '/admin/blacklists'].some(isActive);
    const isFinanceActive    = ['/admin/transactions', '/admin/accounting/profit-loss'].some(isActive);

    const [openMenus, setOpenMenus] = useState({
        catalog:    isCatalogActive,
        attributes: isAttributesActive,
        analytics:  isAnalyticsActive,
        campaign:   isCampaignActive,
        system:     isSystemActive,
        finance:    isFinanceActive,
    });

    const toggleMenu = useCallback((menu) => {
        setOpenMenus((prev) => ({ ...prev, [menu]: !prev[menu] }));
    }, []);

    const hasAccess = useCallback((permission) => {
        if (!user) return false;
        if (user.role === 'admin') return true;
        if (user.role === 'staff') {
            const perms = Array.isArray(user.permissions) ? user.permissions : [];
            return perms.includes(permission);
        }
        return false;
    }, [user]);

    const groupProps = { openMenus, toggleMenu, isActive };

    return (
        <>
            <style>{STYLES}</style>
            <aside className={`sb-root${collapsed ? ' collapsed' : ''}`} aria-label="Main navigation">
                {/* -- Brand - logo only, no bg box, no text -- */}
                <div className="sb-brand">
                    <div
                        className="sb-brand-logo"
                        style={{ maxWidth: collapsed ? 0 : 130, opacity: collapsed ? 0 : 1 }}
                    >
                        {logoPath ? (
                            <img
                                src={logoPath}
                                alt={siteName}
                                style={{ height: 28, maxWidth: 130, objectFit: 'contain', objectPosition: 'left', display: 'block' }}
                            />
                        ) : (
                            <span style={{ fontSize: 15, fontWeight: 800, color: '#4f46e5', letterSpacing: '-0.03em', display: 'block' }}>
                                {siteName}
                            </span>
                        )}
                    </div>
                    {/* Collapse / expand toggle */}
                    <button
                        type="button"
                        className="sb-collapse-btn"
                        onClick={toggleCollapsed}
                        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    >
                        <SvgIcon
                            name={collapsed ? 'chevronsRight' : 'chevronsLeft'}
                            className="w-3 h-3"
                        />
                    </button>
                </div>

                {/* -- Scrollable nav -- */}
                <nav className="sb-nav" aria-label="Site sections">

                    {/* 1 ── MAIN (daily use) */}
                    <SectionLabel>Main</SectionLabel>
                    <NavLink href={route('admin.dashboard')} iconName="dashboard" label="Dashboard" path="/admin/dashboard" isActive={isActive} />

                    {hasAccess('manage_orders') && (
                        <NavLink href={route('admin.orders.index')} iconName="orders" label="Orders" path="/admin/orders" isActive={isActive} />
                    )}
                    {hasAccess('manage_orders') && (
                        <NavLink href="/admin/incomplete-orders" iconName="incompleteOrders" label="Incomplete Orders" path="/admin/incomplete-orders" isActive={isActive} />
                    )}

                    {/* 2 ── STORE (frequent product management) */}
                    {(hasAccess('manage_catalog') || hasAccess('manage_attributes')) && (
                        <SectionLabel>Store</SectionLabel>
                    )}

                    {hasAccess('manage_catalog') && (
                        <NavGroup menuKey="catalog" iconName="catalog" label="Catalog" isAnyChildActive={isCatalogActive} {...groupProps}>
                            <ChildLink href={route('admin.products.index')}     iconName="product"     label="Products"     path="/admin/products"     isActive={isActive} />
                            <ChildLink href={route('admin.categories.index')}   iconName="category"    label="Categories"   path="/admin/categories"   isActive={isActive} />
                            <ChildLink href={route('admin.brands.index')}       iconName="brand"       label="Brands"       path="/admin/brands"       isActive={isActive} />
                            <ChildLink href={route('admin.authors.index')}      iconName="author"      label="Authors"      path="/admin/authors"      isActive={isActive} />
                            <ChildLink href={route('admin.publications.index')} iconName="publication" label="Publications" path="/admin/publications" isActive={isActive} />
                        </NavGroup>
                    )}

                    {hasAccess('manage_attributes') && (
                        <NavGroup menuKey="attributes" iconName="attributes" label="Attributes" isAnyChildActive={isAttributesActive} {...groupProps}>
                            <ChildLink href={route('admin.colors.index')} iconName="color" label="Colors" path="/admin/colors" isActive={isActive} />
                            <ChildLink href={route('admin.sizes.index')}  iconName="size"  label="Sizes"  path="/admin/sizes"  isActive={isActive} />
                        </NavGroup>
                    )}

                    {/* 3 ── FINANCE (regular financial checks) */}
                    {user?.role === 'admin' && (
                        <>
                            <SectionLabel>Finance</SectionLabel>
                            <NavGroup
                                menuKey="finance"
                                iconName="accounting"
                                label="Accounting"
                                isAnyChildActive={isFinanceActive}
                                {...groupProps}
                            >
                                <ChildLink
                                    href={route('admin.transactions.index')}
                                    iconName="orders"
                                    label="Transactions"
                                    path="/admin/transactions"
                                    isActive={isActive}
                                />
                                <ChildLink
                                    href={route('admin.accounting.profit-loss')}
                                    iconName="analytics"
                                    label="Profit & Loss"
                                    path="/admin/accounting/profit-loss"
                                    isActive={isActive}
                                />
                            </NavGroup>
                        </>
                    )}

                    {/* 4 ── INSIGHTS (periodic analytics reviews) */}
                    {hasAccess('manage_analytics') && (
                        <>
                            <SectionLabel>Insights</SectionLabel>
                            <NavGroup menuKey="analytics" iconName="analytics" label="Analytics" isAnyChildActive={isAnalyticsActive} {...groupProps}>
                                <ChildLink href={route('admin.analytics.index')}    iconName="intelligence" label="Analytics & Intelligence"  path="/admin/analytics/index"    isActive={isActive} />
                                <ChildLink href={route('admin.analytics.behavior')} iconName="behavior"     label="Product Behavior Insights" path="/admin/analytics/behavior" isActive={isActive} />
                            </NavGroup>
                        </>
                    )}

                    {/* 5 ── MARKETING (occasional campaigns) */}
                    {hasAccess('manage_marketing') && (
                        <>
                            <SectionLabel>Marketing</SectionLabel>
                            <NavGroup menuKey="campaign" iconName="campaign" label="Campaign" isAnyChildActive={isCampaignActive} {...groupProps}>
                                <ChildLink href={route('admin.sliders.index')} iconName="slider" label="Sliders" path="/admin/sliders" isActive={isActive} />
                                {/* NEW: Added Landing Pages link */}
                                <ChildLink href="/admin/landing-pages" iconName="landingPage" label="Landing Pages" path="/admin/landing-pages" isActive={isActive} />
                            </NavGroup>
                        </>
                    )}

                    {/* 6 ── CONFIGURATION (rare, admin-only) */}
                    {(hasAccess('manage_settings') || user?.role === 'admin') && (
                        <>
                            <SectionLabel>Configuration</SectionLabel>
                            <NavGroup menuKey="system" iconName="system" label="System" isAnyChildActive={isSystemActive} {...groupProps}>
                                {hasAccess('manage_settings') && (
                                    <ChildLink href={route('admin.shipping-methods.index')} iconName="shipping" label="Shipping Methods" path="/admin/shipping-methods" isActive={isActive} />
                                )}
                                {user?.role === 'admin' && (
                                    <ChildLink href={route('admin.users.index')} iconName="users" label="Staff & Users" path="/admin/users" isActive={isActive} />
                                )}
                                {(hasAccess('manage_settings') || user?.role === 'admin') && (
                                    <ChildLink href={route('admin.blacklists.index')} iconName="security" label="Blocked Users" path="/admin/blacklists" isActive={isActive} />
                                )}
                                {hasAccess('manage_settings') && (
                                    <ChildLink href={route('admin.settings.index')} iconName="settings" label="Settings" path="/admin/settings" isActive={isActive} />
                                )}
                            </NavGroup>
                        </>
                    )}
                </nav>

                {/* -- User footer -- */}
                {user && (
                    <div className="sb-footer">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="sb-user"
                            data-tip={collapsed ? `${user.name} - Log out` : undefined}
                        >
                            <div className="sb-avatar">{user.name?.charAt(0).toUpperCase() || 'A'}</div>
                            <div className="sb-user-info">
                                <div className="sb-user-name">{user.name}</div>
                                <div className="sb-user-role">{user.role || 'Admin'}</div>
                            </div>
                            <SvgIcon name="logout" className="sb-logout-icon w-3.5 h-3.5" />
                        </Link>
                    </div>
                )}
            </aside>
        </>
    );
}