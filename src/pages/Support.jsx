import { useMemo, useState, useEffect } from "react";
import Toast from "../components/Toast";
import { useNavigate } from "react-router-dom";
import PageHeader from "../components/PageHeader";
import { fetchSupplies, createSupplyRequest, getSupplyRequests, getMembers as getMembersServer } from "../lib/storageAdapter";
import { getAuthInfo, getSession } from "../lib/authStore";

function parseUploadMeta(raw) {
  if (!raw) return {};
  if (typeof raw === "object") return raw;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch {
      return {};
    }
  }
  return {};
}

function getSupplyRequestStatusMeta(status) {
  const normalized = String(status || '').trim().toUpperCase();
  if (normalized === 'COMPLETED' || normalized === 'DONE') {
    return { label: '완료', bg: '#dcfce7', color: '#15803d', border: '1px solid #86efac' };
  }
  if (normalized === 'APPROVED' || normalized === 'CONFIRMED') {
    return { label: '확인완료', bg: '#dbeafe', color: '#1d4ed8', border: '1px solid #93c5fd' };
  }
  if (normalized === 'REJECTED') {
    return { label: '반려', bg: '#fee2e2', color: '#b91c1c', border: '1px solid #fca5a5' };
  }
  return { label: '대기중', bg: '#fef3c7', color: '#b45309', border: '1px solid #fcd34d' };
}

export default function Support() {
  console.log('[FORENSIC] 🔍 THIS FILE IS USED: src/pages/Support.jsx');
  const navigate = useNavigate();
  const goHome = () => navigate("/home");
  const goBack = () => {
    try {
      window.history.back();
    } catch {}
  };

  const [tab, setTab] = useState("apply"); // apply | status
  // Toast 상태
  const [toast, setToast] = useState({ open: false, message: "", type: "success" });
  // 신청 버튼 로딩 상태
  const [loadingId, setLoadingId] = useState(null);

  // 보급지원 담당자가 등록한 보급품
  const [offers, setOffers] = useState([]);
  // 내가 신청한 현황
  const [myRequests, setMyRequests] = useState([]);

  // 현재 사용자 ID
  const getCurrentUserId = () => {
    try {
      const auth = typeof getAuthInfo === 'function' ? getAuthInfo() : null;
      if (auth) return String(auth.id || auth.memberId || '');
      const session = typeof getSession === 'function' ? getSession() : null;
      return String(session?.memberId || session?.id || '');
    } catch {
      return '';
    }
  };

  // 보급품 목록 로드
  useEffect(() => {
    let mounted = true;
    async function loadOffers() {
      try {
        console.log('[Support] 🔍 Loading supplies (/api/supplies) - SSOT with Admin...');

        const [items, members] = await Promise.all([
          fetchSupplies(), // ★ 통일: getSupplyItems → fetchSupplies (Admin과 동일)
          // managerName/contact는 members에서 보강 (SSOT=server)
          getMembersServer().catch(() => []),
        ]);

        const memberById = new Map(
          (Array.isArray(members) ? members : []).map(m => [String(m.id ?? m.memberId ?? ''), m])
        );

        const normalizedOffers = (Array.isArray(items) ? items : []).map((i) => {
          const meta = parseUploadMeta(i.uploadMeta ?? i.upload_meta);
          // ★ fetchSupplies는 supplies 테이블 반환 (id, title, type, status, created_by 등)
          const id = i.id || i.supplyId;
          const managerId = i.created_by || i.createdBy || i.userId || i.user_id || i.managerId || i.manager_id;
          const manager = managerId ? memberById.get(String(managerId)) : null;
          return {
            id,
            supplyItemId: id,
            itemName: i.title || i.item || i.item_name || i.name,
            description: i.description || i.details || i.notes || meta.detail || '',
            quantity: i.quantity || 0,
            status: i.status || 'available',
            type: i.type || '',  // ★ type 필드 유지
            price: Number(i.price ?? meta.price ?? 0),
            imageUrl: i.imageUrl || i.image_url || meta.image || '',
            managerId,
            managerName: meta.manager || manager?.name || manager?.nickname || (managerId ? String(managerId) : ''),
            contactInfo: meta.contact || manager?.phone || manager?.email || '',
          };
        });

        const activeOffers = normalizedOffers.filter(o => {
          const status = String(o.status || '').toLowerCase();
          const type = String(o.type || '').toLowerCase();
          // supplies 테이블: type='offer'이면서 status가 활성/신청예정인 것만 (scheduled는 표시는 하되 신청 불가)
          return type === 'offer' && (status === 'available' || status === 'active' || status === 'pending' || status === 'scheduled' || status === '');
        });

        console.log('[Support] ✅ Supply offers normalized:', {
          count: activeOffers.length,
          ids: activeOffers.slice(0, 5).map(o => o.id),  // ★ 첫 5개만 로그
          firstFiveIds: activeOffers.slice(0, 5).map(o => o.id)
        });

        if (mounted) setOffers(activeOffers);
      } catch (e) {
        console.error('[Support] ❌ loadOffers error:', e);
        if (mounted) setOffers([]);
      }
    }

    async function loadMyStatus() {
      const userId = getCurrentUserId();
      if (!userId) return;
      try {
        // 내가 신청한 요청 조회
        const requests = await getSupplyRequests({ requesterId: userId });
        if (mounted) setMyRequests(Array.isArray(requests) ? requests : []);
      } catch (e) {
        console.error('[Support] loadMyStatus error:', e);
        if (mounted) setMyRequests([]);
      }
    }

    loadOffers();
    loadMyStatus();

    const handler = () => {
      loadOffers();
      loadMyStatus();
    };
    window.addEventListener('supply:updated', handler);
    window.addEventListener('su:ssot:changed', handler);

    return () => {
      mounted = false;
      window.removeEventListener('supply:updated', handler);
      window.removeEventListener('su:ssot:changed', handler);
    };
  }, []);

  // 신청하기
  const handleApply = async (offer) => {
    if (loadingId) return; // 중복 클릭 방지
    const userId = getCurrentUserId();
    if (!userId) {
      setToast({ open: true, message: "로그인이 필요합니다.", type: "error" });
      return;
    }

    // ★ FIX Issue #3: supplyId는 문자열(TEXT)이므로 String 추출 (Number 변환 금지)
    const supplyId = String(offer?.id || offer?.supplyItemId || offer?.supplyId || '').trim();
    if (!supplyId) {
      console.error('[Support] invalid supplyId:', { offer });
      setToast({ open: true, message: "보급품 ID가 올바르지 않습니다. 새로고침 후 다시 시도하세요.", type: "error" });
      return;
    }
    console.log('[Support] Applying for supply:', { supplyId, userId });

    // 중복 신청 방지
    const alreadyRequested = myRequests.some(r => 
      String(r.supplyItemId || r.supplyId) === supplyId && 
      (r.status === 'PENDING' || r.status === 'APPROVED')
    );
    if (alreadyRequested) {
      setToast({ open: true, message: "이미 신청한 물품입니다.", type: "warning" });
      return;
    }

    // ✅ 로그인 사용자 정보 자동 사용 (prompt 제거)
    const session = getSession();
    const authInfo = getAuthInfo();
    const userName = session?.name || authInfo?.name || '익명';
    const userPhone = session?.phone || authInfo?.phone || '';

    try {
      setLoadingId(supplyId);
      const created = await createSupplyRequest({
        supplyItemId: supplyId,  // ★ Send as string
        requesterId: userId,
        quantity: 1,
        message: null,
        requesterName: userName,
        requesterContact: userPhone,
      });
      setToast({ open: true, message: "신청되었습니다.", type: "success" });

      // Immediately refresh myRequests and update UI so user sees the new entry
      try {
        const requests = await getSupplyRequests({ requesterId: userId });
        console.log('[Support] post-create getSupplyRequests result:', { created, requests });
        setMyRequests(Array.isArray(requests) ? requests : (requests && requests.requests) ? requests.requests : []);
      } catch (err) {
        console.error('[Support] post-create reload failed:', err);
      }

      // 목록 다시 로드: 일반 공급 목록 리스너와 SSOT 리스너 둘 다 트리거
      window.dispatchEvent(new Event('supply:updated'));
      window.dispatchEvent(new Event('su:ssot:changed'));
    } catch (e) {
      console.error('[Support] handleApply error:', e);
      setToast({ open: true, message: "신청 실패: " + (e?.message || e), type: "error" });
    } finally {
      setLoadingId(null);
    }
  };

  // ---- 인라인 스타일(기본 CSS 없어도 안정) ----
  const panelStyle = {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    border: "1px solid #DDE3EA",
    background: "#F5F7FA",
  };

  const chipStyle = (on) => ({
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid #DDE3EA",
    background: on ? "rgba(12,84,96,0.12)" : "#FFFFFF",
    fontWeight: 900,
    fontSize: 13,
    whiteSpace: "nowrap",
  });

  const cardStyle = {
    padding: 12,
    borderRadius: 14,
    border: "1px solid #DDE3EA",
    background: "#FFFFFF",
    textAlign: "left",
  };

  const badgeStyle = {
    padding: "3px 8px",
    borderRadius: 999,
    border: "1px solid #DDE3EA",
    fontSize: 12,
    opacity: 0.9,
    whiteSpace: "nowrap",
  };

  return (
    <div className="su-page su-page--support">
      {/* Toast */}
      <Toast
        open={toast.open}
        message={toast.message}
        type={toast.type}
        onClose={() => setToast(t => ({ ...t, open: false }))}
        duration={2200}
      />
      <PageHeader title="보급 · 지원" onBack={goBack} action={{ label: "홈", onClick: goHome }} />

      {/* 탭 */}
      <div className="su-tabRow">
        <button type="button" className={`su-chip${tab === "apply" ? " is-active" : ""}`} onClick={() => setTab("apply")}>
          보급품 신청
        </button>
        <button type="button" className={`su-chip${tab === "status" ? " is-active" : ""}`} onClick={() => setTab("status")}>
          내 신청 현황
        </button>
      </div>

      {/* 안내 */}
      <section className="su-panel">
        <div style={{ fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 8 }}>안내</div>
        <div style={{ fontSize: 13, color: 'var(--c-tx-s)', lineHeight: 1.6 }}>
          • 보급지원 담당자가 등록한 보급품을 신청할 수 있어요.<br />
          • 신청 후 담당자 확인을 기다려주세요.<br />
          • 내 신청 현황은 '내 신청 현황' 탭에서 확인하세요.
        </div>
      </section>

      {/* 보급품 신청 */}
      {tab === "apply" && (
        <section className="su-panel">
          <div style={{ fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 10 }}>등록된 보급품 ({offers.length})</div>

          {offers.length === 0 ? (
            <div className="su-empty">등록된 보급품이 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {offers.map((offer) => {
                const isScheduled = offer.status === 'scheduled';
                return (
                  <div key={offer.id} className="su-card" style={{ overflow: 'hidden', padding: 0, borderRadius: 22, border: '1px solid rgba(148,163,184,0.16)', boxShadow: '0 14px 30px rgba(15,23,42,0.08)', background: 'linear-gradient(180deg, #ffffff 0%, #f8fbfd 100%)' }}>
                    {offer.imageUrl ? (
                      <div style={{ position: 'relative', height: 170, overflow: 'hidden', background: '#e2e8f0' }}>
                        <img src={offer.imageUrl} alt={offer.itemName || '보급품 이미지'} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(8,47,73,0.06) 0%, rgba(8,47,73,0.62) 100%)' }} />
                        <div style={{ position: 'absolute', left: 16, right: 16, top: 14, display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ padding: '7px 12px', borderRadius: 999, background: 'rgba(255,255,255,0.88)', color: '#0f766e', fontWeight: 800, fontSize: 12 }}>보급품</span>
                          <span style={{ padding: '7px 12px', borderRadius: 999, background: isScheduled ? 'rgba(254,240,138,0.92)' : 'rgba(220,252,231,0.9)', color: isScheduled ? '#a16207' : '#166534', fontWeight: 800, fontSize: 12 }}>{isScheduled ? '신청예정' : '신청가능'}</span>
                        </div>
                        <div style={{ position: 'absolute', left: 16, right: 16, bottom: 16 }}>
                          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', marginBottom: 6 }}>등록된 보급품</div>
                          <div style={{ fontSize: 23, lineHeight: 1.2, fontWeight: 900, color: '#ffffff', letterSpacing: '-0.03em' }}>{offer.itemName || offer.item}</div>
                        </div>
                      </div>
                    ) : null}
                    <div style={{ padding: 18 }}>
                      {!offer.imageUrl ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', marginBottom: 12 }}>
                          <div>
                            <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 800, marginBottom: 6 }}>등록된 보급품</div>
                            <div style={{ fontWeight: 900, fontSize: 22, color: '#0f172a', letterSpacing: '-0.03em' }}>{offer.itemName || offer.item}</div>
                          </div>
                          <div style={{ display: 'grid', gap: 8, justifyItems: 'end' }}>
                            <span style={{ padding: '7px 12px', borderRadius: 999, background: '#ecfeff', color: '#0f766e', border: '1px solid #a5f3fc', fontWeight: 800, fontSize: 12 }}>보급품</span>
                            <span style={{ padding: '7px 12px', borderRadius: 999, background: isScheduled ? '#fef3c7' : '#dcfce7', color: isScheduled ? '#a16207' : '#166534', border: isScheduled ? '1px solid #fde68a' : '1px solid #86efac', fontWeight: 800, fontSize: 12 }}>{isScheduled ? '신청예정' : '신청가능'}</span>
                          </div>
                        </div>
                      ) : null}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 10, marginBottom: 12 }}>
                        <div style={{ padding: '12px 13px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 4 }}>담당자</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{offer.managerName || '-'}</div>
                        </div>
                        <div style={{ padding: '12px 13px', borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0' }}>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 4 }}>연락처</div>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a' }}>{offer.contactInfo || '-'}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 12, padding: '13px 14px', borderRadius: 16, background: 'linear-gradient(135deg, #ecfeff 0%, #f0fdfa 100%)', border: '1px solid #bfdbfe' }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 800, color: '#64748b', marginBottom: 4 }}>안내 금액</div>
                          <div style={{ fontSize: 22, fontWeight: 900, color: '#0f766e', letterSpacing: '-0.03em' }}>{(offer.price || 0).toLocaleString()}원</div>
                        </div>
                        <div style={{ fontSize: 12, color: '#0f766e', fontWeight: 700 }}>담당자 확인 후 진행</div>
                      </div>
                      {offer.description ? (
                        <div style={{ marginBottom: 14, padding: '12px 14px', borderRadius: 14, background: '#fffaf0', border: '1px solid #fde68a', color: '#7c5e10', fontSize: 13, lineHeight: 1.55 }}>
                          {offer.description}
                        </div>
                      ) : null}
                      {isScheduled ? (
                        <div style={{ padding: '11px 14px', borderRadius: 14, background: '#FEF3C7', border: '1px solid #FCD34D', color: '#92400E', fontSize: 13, fontWeight: 800, textAlign: 'center' }}>
                          📅 신청예정 · 곧 신청이 시작될 예정입니다
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="su-primaryBtn"
                          onClick={() => handleApply(offer)}
                          style={{ width: '100%', minHeight: 52, borderRadius: 16, fontWeight: 900, fontSize: 16, boxShadow: '0 14px 30px rgba(8,145,178,0.22)', opacity: loadingId === offer.id ? 0.7 : 1 }}
                          disabled={loadingId === offer.id}
                        >
                          {loadingId === offer.id ? "신청 중..." : "신청하기"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* 내 신청 현황 */}
      {tab === "status" && (
        <section className="su-panel">
          <div style={{ fontWeight: 700, color: 'var(--c-tx-h)', marginBottom: 10 }}>내 신청 현황 ({myRequests.length})</div>

          {myRequests.length === 0 ? (
            <div className="su-empty">신청 내역이 없습니다.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {myRequests.map((req) => {
                const statusMeta = getSupplyRequestStatusMeta(req.status);
                return (
                  <div key={req.id} className="su-card">
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ fontWeight: 700, color: 'var(--c-tx-h)' }}>{req.itemName || req.item || '품목 정보 없음'}</div>
                      <span style={{ padding: '7px 12px', borderRadius: 999, fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', background: statusMeta.bg, color: statusMeta.color, border: statusMeta.border }}>{statusMeta.label}</span>
                    </div>
                    <div style={{ marginTop: 6, fontSize: 13, color: 'var(--c-tx-s)' }}>
                      신청자: {req.requesterName || req.applicantName}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-tx-d)' }}>
                      연락처: {req.requesterContact || req.applicantContact}
                    </div>
                    <div style={{ marginTop: 4, fontSize: 12, color: 'var(--c-tx-d)' }}>
                      신청일: {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : (req.date || '-')}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div style={{ height: 90 }} />
    </div>
  );
}
