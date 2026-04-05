import React, { useState, useEffect, useRef, memo } from 'react';
import ProductCard from '@/Components/ProductCard';

/* ─── Shared CSS ──────────────────────────────────────────────────────────── */
export const HOME_STYLES = `
@keyframes sk {
  0%,100% { opacity: 1; }
  50%      { opacity: .4; }
}
.sk {
  animation: sk 1.6s ease-in-out infinite;
  background: #e5e7eb;
  border-radius: 5px;
}
@keyframes reveal {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
.reveal {
  animation: reveal .28s ease both;
  will-change: opacity, transform;
}
`;

/* ─── Shared IntersectionObserver ───────────────────────────────────────────── */
let _observer = null;
const _cbs = new Map();

export function getObserver() {
  if (_observer) return _observer;
  _observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const cb = _cbs.get(e.target);
          if (cb) { cb(); _cbs.delete(e.target); _observer.unobserve(e.target); }
        }
      });
    },
    { rootMargin: '220px', threshold: 0 }
  );
  return _observer;
}

export function useReveal(eager) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(eager);

  useEffect(() => {
    if (eager || !ref.current) return;
    const el = ref.current;
    _cbs.set(el, () => setVisible(true));
    getObserver().observe(el);
    return () => { _cbs.delete(el); getObserver().unobserve(el); };
  }, [eager]);

  return [ref, visible];
}

/* ─── LazyCard ────────────────────────────────────────────────────────────── */
export const LazyCard = memo(({ skeleton, children, eager = false, className }) => {
  const [ref, visible] = useReveal(eager);
  return (
    <div ref={eager ? undefined : ref} className={className}>
      {visible ? <div className="reveal">{children}</div> : skeleton}
    </div>
  );
});

/* ─── Skeletons ────────────────────────────────────────────────────────────── */
export const SKU_PRODUCT = (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
    <div className="sk w-full" style={{ height: 160, borderRadius: 0 }} />
    <div className="p-3 flex flex-col gap-2">
      <div className="sk" style={{ height: 12, width: '80%' }} />
      <div className="sk" style={{ height: 12, width: '60%' }} />
      <div className="sk" style={{ height: 16, width: '40%', marginTop: 4 }} />
    </div>
  </div>
);

export const SKU_TOP = (
  <>
    <div className="md:hidden flex flex-col bg-white rounded-2xl overflow-hidden w-full" style={{ height: 340 }}>
      <div className="sk w-full flex-shrink-0" style={{ height: 160, borderRadius: 0 }} />
      <div className="flex flex-col flex-1 px-3 pb-3 gap-2 pt-3">
        <div className="sk" style={{ height: 12, width: '80%' }} />
        <div className="sk" style={{ height: 12, width: '60%' }} />
        <div className="sk" style={{ height: 16, width: '50%', marginTop: 4 }} />
        <div className="sk" style={{ height: 32, width: '100%', marginTop: 'auto' }} />
      </div>
    </div>
    <div className="hidden md:flex bg-white rounded-2xl overflow-hidden w-full" style={{ minHeight: 220 }}>
      <div className="sk flex-shrink-0" style={{ width: 280, height: 220, borderRadius: 0 }} />
      <div className="flex flex-col justify-center flex-1 py-6 pr-8 gap-3 pl-6">
        <div className="sk" style={{ height: 16, width: '75%' }} />
        <div className="sk" style={{ height: 16, width: '50%' }} />
        <div className="sk" style={{ height: 20, width: '40%', marginTop: 4 }} />
        <div className="sk" style={{ height: 24, width: '33%' }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <div className="sk" style={{ height: 40, width: 128 }} />
          <div className="sk" style={{ height: 40, width: 112 }} />
        </div>
      </div>
    </div>
  </>
);

/* ─── Infinite Scroll All Products ────────────────────────────────────────── */
const PAGE_SIZE = 30;

export const AllProducts = memo(({ products }) => {
  const [page, setPage] = useState(1);
  const slice = products.slice(0, page * PAGE_SIZE);
  const hasMore = slice.length < products.length;
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setPage((p) => p + 1); },
      { rootMargin: '400px' }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
        {slice.map((p, i) => (
          <LazyCard key={p.id} skeleton={SKU_PRODUCT} eager={i < 10}>
            <ProductCard product={p} />
          </LazyCard>
        ))}
      </div>
      {hasMore && <div ref={sentinelRef} style={{ height: 1 }} aria-hidden="true" />}
    </>
  );
});