const fs = require('fs');
const path = 'src/App.jsx';
let s = fs.readFileSync(path, 'utf8');
const anchor = '  const payoutPortal = mountNode ? createPortal(\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>';
if (!s.includes('상점 지갑 안내') && s.includes(anchor)) {
  const guide = `  const payoutPortal = mountNode ? createPortal(\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>\n      <div style={{ borderRadius: "12px", border: "1px solid rgba(14,116,144,0.2)", background: "rgba(14,116,144,0.06)", padding: "10px 12px", marginBottom: 8 }}>\n        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>상점 지갑 안내</div>\n        <div style={{ fontSize: 12, lineHeight: 1.7, color: "#475569" }}>\n          VIP 상품권은 상점 적립금이 아닙니다. 아래 받은 이력에서만 확인해 주세요.<br />\n          지급요청은 가용 잔액을 확인한 뒤 지급요청 버튼을 눌러 신청해 주세요.\n        </div>\n      </div>`;
  s = s.replace(anchor, guide);
  fs.writeFileSync(path, s, 'utf8');
  console.log('SHOP_GUIDE_INSERTED');
} else {
  console.log('SHOP_GUIDE_SKIPPED');
}
