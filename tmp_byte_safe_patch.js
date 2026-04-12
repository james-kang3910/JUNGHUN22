const fs = require('fs');
const path = 'src/App.jsx';
const buf = fs.readFileSync(path);
let s = buf.toString('latin1');

s = s.replace('POINT WALLET', 'POINT WALLET LIVE-FIX');

const headerNeedle = '</div>\r\n\r\n        {loading ? (';
if (!s.includes('Point Guide') && s.includes(headerNeedle)) {
  const headerInsert = `</div>\r\n\r\n        <div style={{ borderRadius: "12px", border: "1px solid rgba(148,163,184,0.26)", background: "rgba(248,250,252,0.95)", padding: "10px 12px", marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>Point Guide</div>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: "#475569" }}>
            Send points: choose a member, input amount, then confirm transfer.<br />
            Shop payment: select a shop and verify amount before payment.
          </div>
        </div>\r\n\r\n        {loading ? (`;
  s = s.replace(headerNeedle, headerInsert);
}

const payoutAnchor = 'const payoutPortal = mountNode ? createPortal(\r\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>';
if (!s.includes('Shop Wallet Guide') && s.includes(payoutAnchor)) {
  const payoutInsert = `const payoutPortal = mountNode ? createPortal(\r\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>
      <div style={{ borderRadius: "12px", border: "1px solid rgba(14,116,144,0.2)", background: "rgba(14,116,144,0.06)", padding: "10px 12px", marginBottom: 8 }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>Shop Wallet Guide</div>
        <div style={{ fontSize: 12, lineHeight: 1.6, color: "#475569" }}>
          Voucher payments are not direct cash-out points. Check records below first.<br />
          Submit payout request after confirming available balance.
        </div>
      </div>`;
  s = s.replace(payoutAnchor, payoutInsert);
}

fs.writeFileSync(path, Buffer.from(s, 'latin1'));
console.log('BYTE_SAFE_PATCH_DONE');
