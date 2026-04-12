const fs = require("fs");
const path = "src/App.jsx";
let text = fs.readFileSync(path, "utf8");
const anchor = '  const payoutPortal = mountNode ? createPortal(\n    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>';
const guide = [
  '  const payoutPortal = mountNode ? createPortal(',
  '    <div style={{ display: "grid", gap: 8, marginTop: 8 }}>',
  '      <div style={{ borderRadius: 12, border: "1px solid rgba(14,116,144,0.2)", background: "rgba(14,116,144,0.06)", padding: "10px 12px", marginBottom: 8 }} data-wallet-guide-version="shop-v3-20260411">',
  '        <div style={{ fontSize: 12, fontWeight: 800, color: "#0f766e", marginBottom: 4 }}>상점 지갑 안내 (현재버전)</div>',
  '        <div style={{ fontSize: 12, lineHeight: 1.7, color: "#475569" }}>',
  '          이전버전은 영문 또는 누락 상태였고, 현재버전에서 한글 안내문으로 복구되었습니다.<br />',
  '          VIP 상품권은 상점 적립금이 아닙니다. 아래 받은 이력에서만 확인해 주세요.<br />',
  '          지급요청은 가용 잔액을 확인한 뒤 지급요청 버튼을 눌러 신청해 주세요.',
  '        </div>',
  '      </div>'
].join("\n");
if (!text.includes('data-wallet-guide-version="shop-v3-20260411"') && text.includes(anchor)) {
  text = text.replace(anchor, guide);
  fs.writeFileSync(path, text, "utf8");
}
console.log('SHOP_DISK_PATCH_DONE');
