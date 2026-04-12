import React from 'react';
import { useLocation } from 'react-router-dom';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

export default function Card() {
  const q = useQuery();
  const name = q.get('name') || '';
  const title = q.get('title') || '';
  const company = q.get('company') || '';
  const phone = q.get('phone') || '';
  const email = q.get('email') || '';
  const address = q.get('address') || '';
  const website = q.get('website') || '';

  // mount log to help verify this component renders at runtime (dev-time HMR checks)
  React.useEffect(() => { if (import.meta.env && import.meta.env.DEV) console.log('CARD MOUNT', { name, title, company, phone, email }); }, []);

  const downloadVcf = () => {
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      name ? `N:${name}` : '',
      company ? `ORG:${company}` : '',
      title ? `TITLE:${title}` : '',
      phone ? `TEL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      address ? `ADR:;;${address};;;;` : '',
      website ? `URL:${website}` : '',
      'END:VCARD'
    ].filter(Boolean).join('\r\n');

    // Ensure UTF-8 and CRLF line endings for mobile address book compatibility
    const blob = new Blob(["\uFEFF" + lines], { type: 'text/vcard;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${(name || 'contact').replace(/\s+/g,'_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const downloadPng = async () => {
    try {
      // Build card URL used by QR (same query params)
      const search = typeof window !== 'undefined' ? window.location.search : '';
      const cardUrl = (typeof window !== 'undefined' ? window.location.origin : '') + '/card' + search;

      // Prepare canvas at 2x scale (2000x1200)
      const width = 2000;
      const height = 1200;
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

  // Background gradient (dark navy, glass base)
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, '#07112a');
  g.addColorStop(1, '#03061a');
  // draw rounded rect background (glass card)
  const r = 20; // border radius (pixel-perfect for PNG)
  ctx.fillStyle = g;
  roundRect(ctx, 20, 20, width - 40, height - 40, r, true, false);

  // thin iridescent gradient glow border
  const strokeG = ctx.createLinearGradient(0, 0, width, 0);
  strokeG.addColorStop(0, 'rgba(96,165,250,0.18)');
  strokeG.addColorStop(0.5, 'rgba(99,102,241,0.12)');
  strokeG.addColorStop(1, 'rgba(96,165,250,0.12)');
  ctx.lineWidth = 6;
  ctx.strokeStyle = strokeG;
  roundRect(ctx, 20, 20, width - 40, height - 40, r, false, true);

  // subtle inner glass highlight (top-left)
  ctx.globalCompositeOperation = 'lighter';
  const hg = ctx.createLinearGradient(20, 20, width / 2, height / 3);
  hg.addColorStop(0, 'rgba(255,255,255,0.03)');
  hg.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = hg;
  roundRect(ctx, 20, 20, width - 40, height - 40, r, true, false);
  ctx.globalCompositeOperation = 'source-over';

  // left text column (modern typographic scale for 2000px canvas)
  const paddingLeft = 140;
  let y = 180;
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 120px system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial';
  ctx.fillText(name || '', paddingLeft, y);
  y += 120 + 22;
  ctx.font = '500 38px system-ui, Roboto, Arial';
  if (title) { ctx.fillStyle = 'rgba(255,255,255,0.92)'; ctx.fillText(title, paddingLeft, y); y += 44; }
  if (company) { ctx.fillStyle = 'rgba(255,255,255,0.82)'; ctx.fillText(company, paddingLeft, y); y += 50; }

  ctx.font = '400 48px system-ui, Roboto, Arial';
  ctx.fillStyle = 'rgba(255,255,255,0.9)';
  if (phone) { ctx.fillText('📞 ' + phone, paddingLeft, y); y += 58; }
  if (email) { ctx.fillText('✉️ ' + email, paddingLeft, y); y += 58; }
  if (address) { ctx.fillText('📍 ' + address, paddingLeft, y); y += 58; }
  if (website) { ctx.fillText('🌐 ' + website, paddingLeft, y); y += 58; }

      // Fetch QR image as blob and draw in white box on bottom-right
  const qrSize = 640; // large on 2000x1200 canvas
  const qrPadding = 34;
      const qrBoxW = qrSize + qrPadding * 2;
      const qrBoxH = qrSize + qrPadding * 2;
      const qrX = width - qrBoxW - 120;
      const qrY = height - qrBoxH - 120;

  // white QR plate with subtle corner radius and shadow
  ctx.fillStyle = '#ffffff';
  // shadow for plate
  ctx.save();
  ctx.shadowColor = 'rgba(2,6,23,0.45)';
  ctx.shadowBlur = 28;
  roundRect(ctx, qrX, qrY, qrBoxW, qrBoxH, 18, true, false);
  ctx.restore();

      const qrApi = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(cardUrl);
      const resp = await fetch(qrApi);
      const blob = await resp.blob();
      let imgBitmap = null;
      if (window.createImageBitmap) imgBitmap = await createImageBitmap(blob);
      if (imgBitmap) {
        ctx.drawImage(imgBitmap, qrX + qrPadding, qrY + qrPadding, qrSize, qrSize);
      } else {
        const url = URL.createObjectURL(blob);
        const img = new Image();
        await new Promise((res) => { img.onload = () => { ctx.drawImage(img, qrX + qrPadding, qrY + qrPadding, qrSize, qrSize); URL.revokeObjectURL(url); res(); }; img.onerror = () => { URL.revokeObjectURL(url); res(); }; img.src = url; });
      }

      // Trigger download
      const dataUrl = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${(name || 'businesscard').replace(/\s+/g,'_')}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (e) {
      console.error('PNG generation failed', e);
      alert('명함 이미지 생성에 실패했습니다.');
    }
  };

  // helper: rounded rect
  function roundRect(ctx, x, y, w, h, r, fill, stroke) {
    if (typeof r === 'undefined') r = 5;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
    if (fill) ctx.fill();
    if (stroke) ctx.stroke();
  }

  const hasAny = Boolean(name || title || company || phone || email || address || website);

  const search = typeof window !== 'undefined' ? window.location.search : '';
  const pageUrl = (typeof window !== 'undefined' ? window.location.origin + '/card' + search : '');
  const qrSrc = 'https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=' + encodeURIComponent(pageUrl);

  if (!hasAny) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#E8EDF2', color: '#0D1B21', padding: 24, boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 8 }}>잘못된 명함 링크입니다</div>
          <div style={{ opacity: 0.8 }}>명함 정보를 찾을 수 없습니다. QR이 올바른지 확인하세요.</div>
        </div>
      </div>
    );
  }

  // SSOT proxy: when `su:ssot:changed` happens elsewhere, re-dispatch a storage event
  React.useEffect(() => {
    let listenerId = null;
    try {
      const { register, unregister } = require('../lib/ssotRegistry');
      listenerId = register(['*'], () => {
        try { window.dispatchEvent(new StorageEvent('storage', { key: 'su_ssot_reload', newValue: Date.now().toString() })); } catch (e) { window.dispatchEvent(new Event('su:ssot_proxy')); }
      });
    } catch (e) {
      // ignore if registry not available
    }
    return () => { try { if (listenerId) { const { unregister } = require('../lib/ssotRegistry'); unregister(listenerId); } } catch (e) {} };
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#E8EDF2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, boxSizing: 'border-box' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, color: '#0D1B21' }}>
          <div style={{ fontWeight: 700 }}>브랜드명</div>
          <div>
            {website ? <a href={website} target="_blank" rel="noreferrer" style={{ color: '#0C5460', fontWeight: 700 }}>홈페이지</a> : null}
          </div>
        </div>

        {/* Card */}
        <div style={{ borderRadius: 20, padding: 20, position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, #0C5460 0%, #083D4A 55%, #052830 100%)', boxShadow: '0 8px 32px rgba(12,84,96,0.3)', border: '1px solid rgba(12,84,96,0.2)' }}>
          {/* glow border pseudo effect via inner element */}
          <div style={{ position: 'absolute', inset: 0, borderRadius: 20, pointerEvents: 'none', boxShadow: 'inset 0 0 0 1px rgba(96,165,250,0.06)' }} />

          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#fff', lineHeight: 1.02 }}>{name}</div>
              <div style={{ marginTop: 6, color: 'rgba(255,255,255,0.9)', fontSize: 14 }}>{title}{company ? ' · ' + company : ''}</div>

              <div style={{ marginTop: 14, color: 'rgba(255,255,255,0.85)', fontSize: 15, display: 'grid', gap: 8 }}>
                {phone && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span>📞</span><span style={{ wordBreak: 'break-word' }}>{phone}</span></div>}
                {email && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span>✉️</span><span style={{ wordBreak: 'break-word' }}>{email}</span></div>}
                {address && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span>📍</span><span style={{ wordBreak: 'break-word' }}>{address}</span></div>}
                {website && <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><span>🌐</span><a href={website} target="_blank" rel="noreferrer" style={{ color: '#7dd3fc' }}>{website}</a></div>}
              </div>
            </div>

            {/* QR area */}
            <div style={{ width: 124, height: 124, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ background: '#fff', padding: 10, borderRadius: 12, boxShadow: '0 8px 18px rgba(2,6,23,0.28)' }}>
                <img src={qrSrc} alt="QR" style={{ width: 104, height: 104, display: 'block', borderRadius: 6 }} />
              </div>
            </div>
          </div>
        </div>

        {/* Buttons: fixed under card area */}
        <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
          <button onClick={downloadVcf} style={{ flex: 1, minHeight: 44, borderRadius: 10, background: '#3D9DAB', border: 'none', color: '#fff', fontWeight: 800 }}>연락처 저장</button>
          <button onClick={downloadPng} style={{ flex: 1, minHeight: 44, borderRadius: 10, background: '#0C5460', border: 'none', color: '#fff', fontWeight: 800 }}>명함 저장</button>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
          {website ? <button onClick={() => window.open(website, '_blank')} style={{ flex: 1, minHeight: 44, borderRadius: 10, background: '#EEF1F5', border: '1px solid #DDE3EA', color: '#0C5460', fontWeight: 800 }}>홈페이지 열기</button> : null}
        </div>

        <div style={{ marginTop: 12, color: '#9BA8AE', fontSize: 12 }}>QR 스캔으로 이 페이지에 도달했습니다. 이 페이지는 서버에 데이터를 저장하지 않습니다.</div>
      </div>
    </div>
  );
}
