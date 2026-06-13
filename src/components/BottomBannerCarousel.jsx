import { useEffect, useMemo, useState } from 'react';

const MAX_SLIDES = 10;
const AUTO_INTERVAL_MS = 4500;

function resolveApiBase() {
  let base = import.meta.env.VITE_API_BASE || '';
  if (!base && import.meta.env.DEV && typeof window !== 'undefined') {
    base = `${window.location.protocol}//${window.location.hostname}:8787`;
  }
  return base;
}

export function normalizeBottomBannerList(raw) {
  const list = Array.isArray(raw)
    ? raw
    : (Array.isArray(raw?.banners) ? raw.banners : (Array.isArray(raw?.data) ? raw.data : []));

  const apiBase = resolveApiBase();

  return list.slice(0, MAX_SLIDES).map((item, index) => {
    let imageUrl = String(item?.imageUrl || item?.image_url || '').trim();
    const linkUrl = String(item?.linkUrl || item?.link_url || '').trim();
    const title = String(item?.title || '').trim();
    const description = String(item?.description || '').trim();
    const alt = String(item?.alt || title || description || '광고').trim();

    if (imageUrl && !/^https?:\/\//i.test(imageUrl) && !imageUrl.startsWith('data:')) {
      imageUrl = `${apiBase}${imageUrl}`;
    }

    return {
      id: String(item?.id || item?.bannerId || item?.banner_id || `bottom-${index}`),
      imageUrl,
      linkUrl,
      title,
      description,
      alt,
      chipLabel: String(item?.chipLabel || item?.chip_label || '').trim(),
      priority: Number(item?.priority) || 0,
    };
  }).sort((a, b) => b.priority - a.priority);
}

function SlideContent({ slide }) {
  const headline = String(slide.description || slide.title || '').trim();
  const subline = slide.title && slide.description && slide.title !== slide.description
    ? slide.title
    : '';
  const hasImage = !!slide.imageUrl;
  const hasText = !!(headline || subline || slide.chipLabel);

  if (hasImage) {
    return (
      <div
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 68,
          overflow: 'hidden',
          background: '#0f172a',
        }}
      >
        <img
          src={slide.imageUrl}
          alt={slide.alt}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center',
            display: 'block',
          }}
        />
        {hasText ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(15, 23, 42, 0.78) 0%, rgba(15, 23, 42, 0.42) 52%, rgba(15, 23, 42, 0.08) 100%)',
              pointerEvents: 'none',
            }}
          />
        ) : null}
        {hasText ? (
          <div
            style={{
              position: 'relative',
              zIndex: 1,
              minHeight: 68,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 3,
              padding: '10px 14px 14px',
              maxWidth: '88%',
            }}
          >
            {slide.chipLabel ? (
              <span
                style={{
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '3px 8px',
                  borderRadius: 999,
                  background: 'rgba(255, 255, 255, 0.92)',
                  color: '#0e7490',
                  fontSize: 10,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                }}
              >
                {slide.chipLabel}
              </span>
            ) : null}
            {subline ? (
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: '#bae6fd',
                  textShadow: '0 1px 4px rgba(0,0,0,0.45)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {subline}
              </div>
            ) : null}
            {headline ? (
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: '#ffffff',
                  lineHeight: 1.35,
                  letterSpacing: '-0.02em',
                  textShadow: '0 1px 6px rgba(0,0,0,0.55)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                }}
              >
                {headline}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  }

  if (!hasText) return null;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 4,
        padding: '12px 14px',
        minHeight: 68,
        background: 'linear-gradient(135deg, #ffffff 0%, #ecfeff 55%, #f0fdfa 100%)',
      }}
    >
      {slide.chipLabel ? (
        <span
          style={{
            alignSelf: 'flex-start',
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 8px',
            borderRadius: 999,
            background: 'rgba(14, 116, 144, 0.12)',
            color: '#0e7490',
            fontSize: 10,
            fontWeight: 800,
            whiteSpace: 'nowrap',
          }}
        >
          {slide.chipLabel}
        </span>
      ) : null}
      {subline ? (
        <div style={{ fontSize: 11, fontWeight: 700, color: '#0e7490' }}>{subline}</div>
      ) : null}
      {headline ? (
        <div
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {headline}
        </div>
      ) : null}
    </div>
  );
}

export default function BottomBannerCarousel({ banners = [], onClose }) {
  const slides = useMemo(() => normalizeBottomBannerList(banners), [banners]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [slides.length, slides[0]?.id]);

  useEffect(() => {
    if (slides.length <= 1) return undefined;
    const timer = window.setInterval(() => {
      setIndex((prev) => (prev + 1) % slides.length);
    }, AUTO_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const current = slides[index] || slides[0];

  const shellStyle = {
    position: 'fixed',
    left: '50%',
    transform: 'translateX(-50%)',
    bottom: 'calc(env(safe-area-inset-bottom, 0px) + 66px)',
    width: 'min(calc(100vw - 20px), 438px)',
    zIndex: 9998,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  };

  const trackStyle = {
    flex: 1,
    minWidth: 0,
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 14,
    border: '1px solid rgba(14, 116, 144, 0.22)',
    background: '#0f172a',
    boxShadow: '0 8px 22px rgba(14, 116, 144, 0.14)',
  };

  const slideInner = <SlideContent slide={current} />;

  return (
    <div style={shellStyle} role="region" aria-label="하단 프로모션 배너">
      <div style={trackStyle}>
        {current.linkUrl ? (
          <a
            href={current.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}
          >
            {slideInner}
          </a>
        ) : (
          slideInner
        )}

        {slides.length > 1 ? (
          <>
            <div
              style={{
                position: 'absolute',
                right: 8,
                bottom: 5,
                display: 'flex',
                gap: 4,
                zIndex: 2,
              }}
            >
              {slides.map((slide, i) => (
                <button
                  key={slide.id}
                  type="button"
                  aria-label={`배너 ${i + 1}`}
                  onClick={() => setIndex(i)}
                  style={{
                    width: i === index ? 14 : 5,
                    height: 5,
                    borderRadius: 999,
                    border: 0,
                    padding: 0,
                    background: i === index ? '#ffffff' : 'rgba(255, 255, 255, 0.45)',
                    cursor: 'pointer',
                    transition: 'width 0.2s ease',
                  }}
                />
              ))}
            </div>
            <div
              style={{
                position: 'absolute',
                left: 10,
                bottom: 5,
                fontSize: 10,
                fontWeight: 700,
                color: 'rgba(255, 255, 255, 0.88)',
                zIndex: 2,
              }}
            >
              {index + 1}/{slides.length}
            </div>
          </>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label="배너 닫기"
        style={{
          flexShrink: 0,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 28,
          height: 28,
          borderRadius: 999,
          border: '1px solid rgba(148, 163, 184, 0.35)',
          background: '#ffffff',
          color: '#64748b',
          fontSize: 18,
          lineHeight: 1,
          padding: 0,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(15, 23, 42, 0.08)',
        }}
      >
        ×
      </button>
    </div>
  );
}
