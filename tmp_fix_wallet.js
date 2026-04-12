const fs = require('fs');
const path = 'src/App.jsx';
let s = fs.readFileSync(path, 'utf8');

s = s.replace('POINT WALLET', 'POINT WALLET LIVE-FIX');

const qrBtn = '<button type="button" disabled style={{ width: "100%", minHeight: 42, borderRadius: 14, border: "1px solid rgba(203,213,225,0.9)", background: "rgba(241,245,249,0.9)", color: "#94a3b8", fontWeight: 800, fontSize: 13, cursor: "not-allowed", opacity: 0.9, marginBottom: 16 }}>QR 결제 (준비중)</button>';
const pointGuide = `<div style={{ borderRadius: "14px", border: "1px solid rgba(148,163,184,0.26)", background: "rgba(248,250,252,0.95)", padding: "11px 12px", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 5 }}>포인트 안내</div>
              <div style={{ fontSize: 12, lineHeight: 1.7, color: "#475569" }}>
                포인트 보내기: 회원을 선택하고 금액을 입력한 뒤 전송을 완료하세요.<br />
                상점 결제: 결제할 상점을 선택하고 금액 확인 후 결제를 진행하세요.
              </div>
            </div>
            ${qrBtn}`;
if (s.includes(qrBtn) && !s.includes('포인트 안내')) {
  s = s.replace(qrBtn, pointGuide);
}

const payoutAnchor = 'const payoutPortal = mountNode ? createPortal(\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>';
const shopGuide = `const payoutPortal = mountNode ? createPortal(\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
      <div style={{ borderRadius: "12px", border: "1px solid rgba(14,116,144,0.2)", background: "rgba(14,116,144,0.06)", padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>상점 지갑 안내</div>
        <div style={{ fontSize: 12, lineHeight: 1.7, color: "#475569" }}>
          VIP 상품권은 상점 적립금이 아닙니다. 아래 받은 이력에서만 확인해 주세요.<br />
          지급요청은 가용 잔액을 확인한 뒤 지급요청 버튼을 눌러 신청해 주세요.
        </div>
      </div>`;
if (s.includes(payoutAnchor) && !s.includes('상점 지갑 안내')) {
  s = s.replace(payoutAnchor, shopGuide);
}

fs.writeFileSync(path, s, 'utf8');
console.log('UPDATED_APP');
