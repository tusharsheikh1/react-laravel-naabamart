import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNode } from '@craftjs/core';
import CountdownSettings from './CountdownSettings';

// ─── Time calculation ──────────────────────────────────────────────────────
function getTimeLeft(targetDate, mode, durationHours) {
    let countDownDate;
    if (mode === 'evergreen') {
        const key = 'lp_countdown_end';
        let stored = sessionStorage.getItem(key);
        if (!stored) {
            stored = (Date.now() + durationHours * 3600 * 1000).toString();
            sessionStorage.setItem(key, stored);
        }
        countDownDate = parseInt(stored);
    } else if (mode === 'daily') {
        const now = new Date();
        const midnight = new Date(now);
        midnight.setHours(24, 0, 0, 0);
        countDownDate = midnight.getTime();
    } else {
        countDownDate = targetDate ? new Date(targetDate).getTime() : Date.now() + 86400000;
    }
    const distance = countDownDate - Date.now();
    if (distance <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
    return {
        days:    Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours:   Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((distance % (1000 * 60)) / 1000),
        expired: false,
        total:   distance,
    };
}

// ─── Flip animation card ───────────────────────────────────────────────────
const FlipCard = ({ digit, boxTextColor, boxBg, fontSize, boxRadius }) => {
    const [prev, setPrev] = useState(digit);
    const [flipping, setFlipping] = useState(false);

    useEffect(() => {
        if (prev !== digit) {
            setFlipping(true);
            const t = setTimeout(() => {
                setPrev(digit);
                setFlipping(false);
            }, 280);
            return () => clearTimeout(t);
        }
    }, [digit]);

    return (
        <div style={{
            position: 'relative',
            overflow: 'hidden',
            backgroundColor: boxBg,
            borderRadius: `${Math.max(4, boxRadius - 2)}px`,
            minWidth: fontSize === '52px' ? '46px' : fontSize === '44px' ? '38px' : fontSize === '32px' ? '30px' : '22px',
            textAlign: 'center',
            padding: '4px 6px',
            boxShadow: 'inset 0 -2px 0 rgba(0,0,0,0.15)',
        }}>
            <span style={{
                fontSize,
                fontWeight: 800,
                color: boxTextColor,
                lineHeight: 1.1,
                display: 'block',
                transition: flipping ? 'transform 0.14s ease-in, opacity 0.14s' : 'transform 0.14s ease-out, opacity 0.14s',
                transform: flipping ? 'translateY(-40%) scaleY(0.6)' : 'translateY(0) scaleY(1)',
                opacity: flipping ? 0 : 1,
                fontVariantNumeric: 'tabular-nums',
            }}>
                {flipping ? prev : digit}
            </span>
            {/* Fold line */}
            <div style={{
                position: 'absolute',
                left: 0, right: 0,
                top: '50%',
                height: '1px',
                backgroundColor: 'rgba(0,0,0,0.12)',
                pointerEvents: 'none',
            }} />
        </div>
    );
};

// ─── TimeBlock ─────────────────────────────────────────────────────────────
const TimeBlock = ({
    value, label, displayStyle, boxBg, boxTextColor, labelColor,
    boxRadius, boxSize, showSeparator, separatorColor, showLabels,
    glowColor, showGlow, flipAnimation,
}) => {
    const prevVal = useRef(value);
    const [pulse, setPulse] = useState(false);

    useEffect(() => {
        if (prevVal.current !== value && !flipAnimation) {
            setPulse(true);
            const t = setTimeout(() => setPulse(false), 320);
            prevVal.current = value;
            return () => clearTimeout(t);
        }
        prevVal.current = value;
    }, [value]);

    const padded = String(value).padStart(2, '0');

    const sizeMap = {
        xs: { box: 44,  font: '20px', labelFont: '9px',  gap: 2 },
        sm: { box: 56,  font: '26px', labelFont: '10px', gap: 3 },
        md: { box: 74,  font: '34px', labelFont: '11px', gap: 4 },
        lg: { box: 94,  font: '46px', labelFont: '12px', gap: 5 },
        xl: { box: 114, font: '56px', labelFont: '13px', gap: 6 },
    };
    const sz = sizeMap[boxSize] || sizeMap.md;

    const glowStyle = showGlow && glowColor ? {
        boxShadow: `0 0 18px 4px ${glowColor}55, 0 4px 20px rgba(0,0,0,0.12)`,
    } : { boxShadow: '0 4px 20px rgba(0,0,0,0.12)' };

    const baseBox = {
        width: sz.box,
        minHeight: sz.box,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        fontSize: sz.font,
        fontWeight: 800,
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 1,
        color: boxTextColor,
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
        transform: pulse ? 'scale(1.1)' : 'scale(1)',
    };

    let styleOverrides = {};
    if (displayStyle === 'card') {
        styleOverrides = { backgroundColor: boxBg, borderRadius: `${boxRadius}px`, ...glowStyle };
    } else if (displayStyle === 'outline') {
        styleOverrides = { border: `2.5px solid ${boxBg}`, borderRadius: `${boxRadius}px` };
    } else if (displayStyle === 'filled') {
        styleOverrides = { backgroundColor: boxBg, borderRadius: `${boxRadius}px` };
    } else if (displayStyle === 'glass') {
        styleOverrides = {
            backgroundColor: `${boxBg}30`,
            backdropFilter: 'blur(12px)',
            border: `1px solid ${boxBg}50`,
            borderRadius: `${boxRadius}px`,
            ...glowStyle,
        };
    } else if (displayStyle === 'neon') {
        styleOverrides = {
            backgroundColor: 'transparent',
            border: `2px solid ${boxBg}`,
            borderRadius: `${boxRadius}px`,
            boxShadow: `0 0 12px ${boxBg}80, inset 0 0 12px ${boxBg}20`,
            textShadow: `0 0 10px ${boxTextColor}cc`,
        };
    }

    const boxStyle = { ...baseBox, ...styleOverrides };

    return (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={boxStyle}>
                    {(displayStyle === 'card' || displayStyle === 'flip') && flipAnimation ? (
                        <div style={{ display: 'flex', gap: `${sz.gap}px` }}>
                            {padded.split('').map((d, i) => (
                                <FlipCard
                                    key={i}
                                    digit={d}
                                    boxTextColor={boxTextColor}
                                    boxBg={`${boxTextColor}18`}
                                    fontSize={sz.font}
                                    boxRadius={boxRadius}
                                />
                            ))}
                        </div>
                    ) : (
                        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{padded}</span>
                    )}
                </div>
                {showLabels && (
                    <span style={{
                        fontSize: sz.labelFont,
                        color: labelColor,
                        textTransform: 'uppercase',
                        letterSpacing: '0.13em',
                        marginTop: '8px',
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                    }}>
                        {label}
                    </span>
                )}
            </div>

            {showSeparator && (
                <span style={{
                    fontSize: sz.font,
                    color: separatorColor,
                    fontWeight: 900,
                    lineHeight: 1,
                    marginBottom: showLabels ? `${parseInt(sz.labelFont) + 14}px` : '0',
                    padding: '0 4px',
                    opacity: 0.75,
                    animation: 'separatorBlink 1s step-end infinite',
                }}>
                    :
                </span>
            )}
        </div>
    );
};

// ─── Progress Bar ─────────────────────────────────────────────────────────
const ProgressBar = ({ timeLeft, mode, targetDate, durationHours, barColor, barBg, barHeight, barRadius }) => {
    const [pct, setPct] = useState(0);

    useEffect(() => {
        let total = 0;
        if (mode === 'fixed' && targetDate) {
            const end = new Date(targetDate).getTime();
            total = end - (Date.now() - (timeLeft.total || 0));
        } else if (mode === 'evergreen') {
            total = durationHours * 3600 * 1000;
        } else {
            total = 24 * 3600 * 1000;
        }
        const remaining = timeLeft.days * 86400000 + timeLeft.hours * 3600000 + timeLeft.minutes * 60000 + timeLeft.seconds * 1000;
        const p = total > 0 ? Math.max(0, Math.min(100, (remaining / total) * 100)) : 0;
        setPct(p);
    }, [timeLeft]);

    return (
        <div style={{
            width: '100%',
            maxWidth: '440px',
            height: `${barHeight}px`,
            backgroundColor: barBg || 'rgba(255,255,255,0.2)',
            borderRadius: `${barRadius}px`,
            overflow: 'hidden',
            marginTop: '16px',
        }}>
            <div style={{
                height: '100%',
                width: `${pct}%`,
                backgroundColor: barColor,
                borderRadius: `${barRadius}px`,
                transition: 'width 0.9s linear',
            }} />
        </div>
    );
};

// ─── CTA Button ───────────────────────────────────────────────────────────
const CTAButton = ({ text, url, bgColor, textColor, radius, size }) => {
    const sizeMap = {
        sm: { padding: '10px 24px', fontSize: '14px' },
        md: { padding: '14px 36px', fontSize: '16px' },
        lg: { padding: '18px 48px', fontSize: '18px' },
    };
    const s = sizeMap[size] || sizeMap.md;

    return (
        <a
            href={url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            style={{
                display: 'inline-block',
                padding: s.padding,
                fontSize: s.fontSize,
                fontWeight: 800,
                color: textColor,
                backgroundColor: bgColor,
                borderRadius: `${radius}px`,
                textDecoration: 'none',
                letterSpacing: '0.02em',
                marginTop: '24px',
                boxShadow: `0 4px 24px ${bgColor}66`,
                transition: 'transform 0.15s, box-shadow 0.15s',
                cursor: 'pointer',
            }}
            onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                e.currentTarget.style.boxShadow = `0 8px 32px ${bgColor}88`;
            }}
            onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = `0 4px 24px ${bgColor}66`;
            }}
        >
            {text}
        </a>
    );
};

// ─── Badge / Pill ─────────────────────────────────────────────────────────
const BadgePill = ({ text, bgColor, textColor }) => (
    <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        backgroundColor: bgColor,
        color: textColor,
        fontSize: '11px',
        fontWeight: 800,
        padding: '5px 14px',
        borderRadius: '999px',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        marginBottom: '12px',
    }}>
        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: textColor, opacity: 0.7, animation: 'pulseOrb 1.5s ease-in-out infinite' }} />
        {text}
    </div>
);

// ─── Main CountdownWidget ─────────────────────────────────────────────────
export const CountdownWidget = (props) => {
    const {
        mode, targetDate, durationHours, showDays,
        showHeadline, headline, headlineSize, headlineColor, headlineWeight,
        showSubtitle, subtitle, subtitleColor, subtitleSize,
        expiredMessage, expiredRedirectUrl,
        displayStyle, boxSize, boxBg, boxTextColor, labelColor, boxRadius, separatorColor, showLabels,
        showUrgencyBar, urgencyText, urgencyBarBg, urgencyBarText,
        bgType, bgColor, bgGradientFrom, bgGradientTo, bgGradientDirection,
        bgImage, overlayColor, overlayOpacity,
        paddingTop, paddingBottom, paddingLeft, paddingRight, contentAlign,

        // New features
        flipAnimation,
        showGlow, glowColor,
        showProgressBar, progressBarColor, progressBarBg, progressBarHeight, progressBarRadius,
        showCTA, ctaText, ctaUrl, ctaBg, ctaTextColor, ctaRadius, ctaSize,
        showBadge, badgeText, badgeBg, badgeTextColor,
        borderWidth, borderColor, borderRadius: widgetBorderRadius,
        fontFamily,
        customCss,
    } = props;

    const { connectors: { connect, drag } } = useNode();

    const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate, mode, durationHours));

    useEffect(() => {
        setTimeLeft(getTimeLeft(targetDate, mode, durationHours));
        const interval = setInterval(() => {
            const t = getTimeLeft(targetDate, mode, durationHours);
            setTimeLeft(t);
            if (t.expired && expiredRedirectUrl) {
                window.location.href = expiredRedirectUrl;
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [targetDate, mode, durationHours]);

    let bg = bgColor;
    if (bgType === 'gradient') {
        bg = `linear-gradient(${bgGradientDirection}deg, ${bgGradientFrom}, ${bgGradientTo})`;
    }
    const bgImgStyle = bgType === 'image' && bgImage
        ? { backgroundImage: `url(${bgImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
        : {};

    const alignStyle = {
        left:   { alignItems: 'flex-start', textAlign: 'left' },
        center: { alignItems: 'center',     textAlign: 'center' },
        right:  { alignItems: 'flex-end',   textAlign: 'right' },
    }[contentAlign] || { alignItems: 'center', textAlign: 'center' };

    const justifyStyle = {
        left:   'flex-start',
        center: 'center',
        right:  'flex-end',
    }[contentAlign] || 'center';

    const units = [
        ...(showDays ? [{ value: timeLeft.days,    label: 'Days'    }] : []),
        { value: timeLeft.hours,   label: 'Hours'   },
        { value: timeLeft.minutes, label: 'Minutes' },
        { value: timeLeft.seconds, label: 'Seconds' },
    ];

    const fontImport = fontFamily && fontFamily !== 'inherit'
        ? `@import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@400;700;800;900&display=swap');`
        : '';

    return (
        <div
            ref={ref => connect(drag(ref))}
            style={{
                background: bg,
                ...bgImgStyle,
                position: 'relative',
                overflow: 'hidden',
                borderRadius: widgetBorderRadius ? `${widgetBorderRadius}px` : undefined,
                border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : undefined,
                fontFamily: fontFamily && fontFamily !== 'inherit' ? `'${fontFamily}', sans-serif` : 'inherit',
                width: '100%',
                boxSizing: 'border-box',
            }}
        >
            {/* Font + animation styles */}
            <style>{`
                ${fontImport}
                @keyframes separatorBlink { 0%,100% { opacity: 0.75 } 50% { opacity: 0.2 } }
                @keyframes pulseOrb { 0%,100% { transform: scale(1); opacity: 0.7 } 50% { transform: scale(1.5); opacity: 1 } }
                @keyframes slideDown { from { transform: translateY(-8px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
                .cd-widget-inner { animation: slideDown 0.4s ease both; }
                @media (max-width: 480px) {
                    .cd-timer-wrap { gap: 6px !important; }
                    .cd-headline { font-size: clamp(16px, 5vw, var(--hl-size)) !important; }
                    .cd-subtitle { font-size: clamp(13px, 3.5vw, var(--sub-size)) !important; }
                }
                ${customCss || ''}
            `}</style>

            {/* Overlay */}
            {overlayOpacity > 0 && (
                <div style={{
                    position: 'absolute', inset: 0,
                    backgroundColor: overlayColor,
                    opacity: overlayOpacity / 100,
                    pointerEvents: 'none',
                    zIndex: 0,
                }} />
            )}

            {/* Urgency bar */}
            {showUrgencyBar && urgencyText && (
                <div style={{
                    backgroundColor: urgencyBarBg,
                    color: urgencyBarText,
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 800,
                    padding: '9px 16px',
                    position: 'relative',
                    zIndex: 1,
                    letterSpacing: '0.03em',
                }}>
                    {urgencyText}
                </div>
            )}

            {/* Main content */}
            <div
                className="cd-widget-inner"
                style={{
                    position: 'relative',
                    zIndex: 1,
                    paddingTop: `${paddingTop}px`,
                    paddingBottom: `${paddingBottom}px`,
                    paddingLeft: `clamp(16px, ${paddingLeft}px, ${paddingLeft}px)`,
                    paddingRight: `clamp(16px, ${paddingRight}px, ${paddingRight}px)`,
                    display: 'flex',
                    flexDirection: 'column',
                    ...alignStyle,
                }}
            >
                {timeLeft.expired ? (
                    <div style={{ fontSize: '22px', fontWeight: 700, color: boxTextColor }}>
                        {expiredMessage}
                    </div>
                ) : (
                    <>
                        {/* Badge pill */}
                        {showBadge && badgeText && (
                            <BadgePill text={badgeText} bgColor={badgeBg} textColor={badgeTextColor} />
                        )}

                        {/* Headline */}
                        {showHeadline && headline && (
                            <h2
                                className="cd-headline"
                                style={{
                                    '--hl-size': `${headlineSize}px`,
                                    fontSize: `clamp(16px, 4vw, ${headlineSize}px)`,
                                    fontWeight: headlineWeight,
                                    color: headlineColor,
                                    marginBottom: '10px',
                                    lineHeight: 1.25,
                                    marginTop: 0,
                                }}
                            >
                                {headline}
                            </h2>
                        )}

                        {/* Subtitle */}
                        {showSubtitle && subtitle && (
                            <p
                                className="cd-subtitle"
                                style={{
                                    '--sub-size': `${subtitleSize}px`,
                                    fontSize: `clamp(13px, 3vw, ${subtitleSize}px)`,
                                    color: subtitleColor,
                                    marginBottom: '20px',
                                    lineHeight: 1.6,
                                    maxWidth: '520px',
                                    marginTop: 0,
                                }}
                            >
                                {subtitle}
                            </p>
                        )}

                        {/* Timer row */}
                        <div
                            className="cd-timer-wrap"
                            style={{
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: justifyStyle,
                                gap: displayStyle === 'minimal' || displayStyle === 'neon' ? '16px' : '10px',
                            }}
                        >
                            {units.map((unit, i) => (
                                <TimeBlock
                                    key={unit.label}
                                    value={unit.value}
                                    label={unit.label}
                                    displayStyle={displayStyle}
                                    boxBg={boxBg}
                                    boxTextColor={boxTextColor}
                                    labelColor={labelColor}
                                    boxRadius={boxRadius}
                                    boxSize={boxSize}
                                    showSeparator={i < units.length - 1}
                                    separatorColor={separatorColor}
                                    showLabels={showLabels}
                                    glowColor={glowColor}
                                    showGlow={showGlow}
                                    flipAnimation={flipAnimation}
                                />
                            ))}
                        </div>

                        {/* Progress bar */}
                        {showProgressBar && (
                            <ProgressBar
                                timeLeft={timeLeft}
                                mode={mode}
                                targetDate={targetDate}
                                durationHours={durationHours}
                                barColor={progressBarColor}
                                barBg={progressBarBg}
                                barHeight={progressBarHeight}
                                barRadius={progressBarRadius}
                            />
                        )}

                        {/* CTA Button */}
                        {showCTA && ctaText && (
                            <CTAButton
                                text={ctaText}
                                url={ctaUrl}
                                bgColor={ctaBg}
                                textColor={ctaTextColor}
                                radius={ctaRadius}
                                size={ctaSize}
                            />
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// ─── Templates ────────────────────────────────────────────────────────────
export const COUNTDOWN_TEMPLATES = {
    flashSale: {
        label: '🔥 Flash Sale',
        props: {
            mode: 'evergreen', durationHours: 4, showDays: false,
            showHeadline: true, headline: '⚡ Flash Sale — 4 Hours Only!', headlineSize: 28, headlineColor: '#ffffff', headlineWeight: '900',
            showSubtitle: true, subtitle: 'Massive discounts across our entire store. Don\'t wait — stock runs out fast.', subtitleColor: '#fde8d8', subtitleSize: 15,
            displayStyle: 'card', boxSize: 'md', boxBg: '#ffffff', boxTextColor: '#dc2626', labelColor: '#fde8d8', boxRadius: 10, separatorColor: '#ffffff', showLabels: true,
            showUrgencyBar: true, urgencyText: '🔥 FLASH SALE — Ends in 4 Hours!', urgencyBarBg: '#fbbf24', urgencyBarText: '#7c2d12',
            bgType: 'gradient', bgGradientFrom: '#dc2626', bgGradientTo: '#991b1b', bgGradientDirection: 135,
            paddingTop: 48, paddingBottom: 48, paddingLeft: 32, paddingRight: 32, contentAlign: 'center',
            flipAnimation: true, showGlow: false,
            showProgressBar: true, progressBarColor: '#fbbf24', progressBarBg: 'rgba(255,255,255,0.2)', progressBarHeight: 6, progressBarRadius: 99,
            showCTA: true, ctaText: 'Shop Now — Save 50%', ctaUrl: '#', ctaBg: '#fbbf24', ctaTextColor: '#7c2d12', ctaRadius: 8, ctaSize: 'md',
            showBadge: true, badgeText: 'Limited Time', badgeBg: 'rgba(255,255,255,0.15)', badgeTextColor: '#ffffff',
            borderWidth: 0, borderColor: '#ffffff', borderRadius: 0, fontFamily: 'inherit',
            expiredMessage: '⚠️ This offer has expired.', expiredRedirectUrl: '',
            overlayColor: '#000000', overlayOpacity: 0, bgColor: '#dc2626', bgImage: '',
        },
    },
    eventLaunch: {
        label: '🚀 Event Launch',
        props: {
            mode: 'fixed', targetDate: '', durationHours: 24, showDays: true,
            showHeadline: true, headline: '🚀 Something Big Is Coming', headlineSize: 32, headlineColor: '#e0e7ff', headlineWeight: '900',
            showSubtitle: true, subtitle: 'Mark your calendar. Be the first to know when we go live.', subtitleColor: '#a5b4fc', subtitleSize: 15,
            displayStyle: 'glass', boxSize: 'lg', boxBg: '#6366f1', boxTextColor: '#ffffff', labelColor: '#c7d2fe', boxRadius: 16, separatorColor: '#a5b4fc', showLabels: true,
            showUrgencyBar: false, urgencyText: '', urgencyBarBg: '#6366f1', urgencyBarText: '#ffffff',
            bgType: 'gradient', bgGradientFrom: '#1e1b4b', bgGradientTo: '#312e81', bgGradientDirection: 145,
            paddingTop: 60, paddingBottom: 60, paddingLeft: 32, paddingRight: 32, contentAlign: 'center',
            flipAnimation: false, showGlow: true, glowColor: '#818cf8',
            showProgressBar: false, progressBarColor: '#818cf8', progressBarBg: 'rgba(255,255,255,0.1)', progressBarHeight: 4, progressBarRadius: 99,
            showCTA: true, ctaText: 'Notify Me', ctaUrl: '#', ctaBg: '#6366f1', ctaTextColor: '#ffffff', ctaRadius: 99, ctaSize: 'md',
            showBadge: true, badgeText: 'Launching Soon', badgeBg: 'rgba(99,102,241,0.3)', badgeTextColor: '#a5b4fc',
            borderWidth: 0, borderColor: '#6366f1', borderRadius: 0, fontFamily: 'inherit',
            expiredMessage: '🎉 We\'re Live!', expiredRedirectUrl: '',
            overlayColor: '#000000', overlayOpacity: 0, bgColor: '#1e1b4b', bgImage: '',
        },
    },
    dailyDeal: {
        label: '🎁 Daily Deal',
        props: {
            mode: 'daily', durationHours: 24, showDays: false,
            showHeadline: true, headline: '🎁 Deal of the Day', headlineSize: 26, headlineColor: '#1a1a1a', headlineWeight: '900',
            showSubtitle: true, subtitle: 'Today\'s exclusive offer resets at midnight. Lock in your discount now.', subtitleColor: '#374151', subtitleSize: 14,
            displayStyle: 'filled', boxSize: 'md', boxBg: '#16a34a', boxTextColor: '#ffffff', labelColor: '#374151', boxRadius: 10, separatorColor: '#16a34a', showLabels: true,
            showUrgencyBar: true, urgencyText: '✅ Deal Resets at Midnight — Don\'t Miss Out!', urgencyBarBg: '#16a34a', urgencyBarText: '#ffffff',
            bgType: 'color', bgColor: '#f0fdf4',
            paddingTop: 40, paddingBottom: 40, paddingLeft: 28, paddingRight: 28, contentAlign: 'center',
            flipAnimation: true, showGlow: false,
            showProgressBar: true, progressBarColor: '#16a34a', progressBarBg: 'rgba(0,0,0,0.08)', progressBarHeight: 5, progressBarRadius: 99,
            showCTA: true, ctaText: 'Claim This Deal', ctaUrl: '#', ctaBg: '#16a34a', ctaTextColor: '#ffffff', ctaRadius: 8, ctaSize: 'md',
            showBadge: false, badgeText: '', badgeBg: '#dcfce7', badgeTextColor: '#16a34a',
            borderWidth: 2, borderColor: '#bbf7d0', borderRadius: 16, fontFamily: 'inherit',
            expiredMessage: '⏰ Come back tomorrow for a new deal!', expiredRedirectUrl: '',
            overlayColor: '#000000', overlayOpacity: 0, bgImage: '', bgGradientFrom: '#f0fdf4', bgGradientTo: '#dcfce7', bgGradientDirection: 135,
        },
    },
    productDrop: {
        label: '👟 Product Drop',
        props: {
            mode: 'fixed', targetDate: '', durationHours: 24, showDays: true,
            showHeadline: true, headline: 'DROP INCOMING', headlineSize: 40, headlineColor: '#ffffff', headlineWeight: '900',
            showSubtitle: true, subtitle: 'Limited units. No restocks. Set a reminder or miss it forever.', subtitleColor: '#d1d5db', subtitleSize: 14,
            displayStyle: 'neon', boxSize: 'lg', boxBg: '#22d3ee', boxTextColor: '#22d3ee', labelColor: '#6b7280', boxRadius: 6, separatorColor: '#22d3ee', showLabels: true,
            showUrgencyBar: false, urgencyText: '', urgencyBarBg: '#22d3ee', urgencyBarText: '#000000',
            bgType: 'color', bgColor: '#030712',
            paddingTop: 56, paddingBottom: 56, paddingLeft: 32, paddingRight: 32, contentAlign: 'center',
            flipAnimation: false, showGlow: true, glowColor: '#22d3ee',
            showProgressBar: false, progressBarColor: '#22d3ee', progressBarBg: 'rgba(255,255,255,0.1)', progressBarHeight: 3, progressBarRadius: 99,
            showCTA: true, ctaText: 'GET EARLY ACCESS →', ctaUrl: '#', ctaBg: '#22d3ee', ctaTextColor: '#030712', ctaRadius: 4, ctaSize: 'md',
            showBadge: true, badgeText: 'Limited Drop', badgeBg: 'rgba(34,211,238,0.12)', badgeTextColor: '#22d3ee',
            borderWidth: 0, borderColor: '#22d3ee', borderRadius: 0, fontFamily: 'inherit',
            expiredMessage: '🔒 This drop is sold out.', expiredRedirectUrl: '',
            overlayColor: '#000000', overlayOpacity: 0, bgImage: '', bgGradientFrom: '#030712', bgGradientTo: '#0f172a', bgGradientDirection: 135,
        },
    },
    webinar: {
        label: '🎙️ Webinar',
        props: {
            mode: 'fixed', targetDate: '', durationHours: 24, showDays: true,
            showHeadline: true, headline: '🎙️ Live Webinar Starting In:', headlineSize: 24, headlineColor: '#1e293b', headlineWeight: '800',
            showSubtitle: true, subtitle: 'Join us live for expert insights, Q&A, and exclusive bonuses for attendees.', subtitleColor: '#475569', subtitleSize: 14,
            displayStyle: 'outline', boxSize: 'md', boxBg: '#0ea5e9', boxTextColor: '#0ea5e9', labelColor: '#64748b', boxRadius: 10, separatorColor: '#0ea5e9', showLabels: true,
            showUrgencyBar: true, urgencyText: '📅 Free Registration — Limited Seats Remaining', urgencyBarBg: '#0ea5e9', urgencyBarText: '#ffffff',
            bgType: 'color', bgColor: '#f8fafc',
            paddingTop: 40, paddingBottom: 40, paddingLeft: 28, paddingRight: 28, contentAlign: 'center',
            flipAnimation: false, showGlow: false,
            showProgressBar: false, progressBarColor: '#0ea5e9', progressBarBg: 'rgba(0,0,0,0.08)', progressBarHeight: 4, progressBarRadius: 99,
            showCTA: true, ctaText: 'Reserve My Spot', ctaUrl: '#', ctaBg: '#0ea5e9', ctaTextColor: '#ffffff', ctaRadius: 8, ctaSize: 'md',
            showBadge: true, badgeText: 'Free to Attend', badgeBg: '#e0f2fe', badgeTextColor: '#0369a1',
            borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 16, fontFamily: 'inherit',
            expiredMessage: '⏰ This webinar has ended. Watch the replay →', expiredRedirectUrl: '',
            overlayColor: '#000000', overlayOpacity: 0, bgImage: '', bgGradientFrom: '#f8fafc', bgGradientTo: '#e0f2fe', bgGradientDirection: 135,
        },
    },
};

CountdownWidget.craft = {
    displayName: 'Urgency Timer',
    props: {
        ...COUNTDOWN_TEMPLATES.flashSale.props,
    },
    related: { settings: CountdownSettings },
};