/**
 * =======================================================
 * AdminVouchers — 상품권 관리 페이지
 * =======================================================
 * DB         : PostgreSQL (USE_POSTGRES = true)
 * API Base   : VITE_API_URL (미설정 시 Vite proxy → localhost:8787)
 * 인증       : x-admin-token (localStorage 'adminToken')
 * 주요 API   :
 *   GET  /api/vouchers/types              상품권 타입 목록
 *   POST /api/vouchers/types              타입 추가
 *   DEL  /api/vouchers/types/:code        타입 삭제
 *   GET  /api/vouchers/:memberId/balance  회원 잔액 (target_type 조건 없음)
 *   GET  /api/shops/:shopId/voucher-balance  상점 잔액
 *   POST /api/vouchers/issue              수동 지급/차감
 *   POST /api/admin/vouchers/distribute   상점→회원 배분
 *   GET  /api/admin/vouchers/logs         원장 이력 (page/filter/sort)
 *   GET  /api/admin/vouchers/balances     잔액 현황 집계 (member|shop)
 * =======================================================
 */
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminAuthenticatedLocal } from "../../lib/adminAuth";
import * as storageAdapter from "../../lib/storageAdapter";

const API_BASE = import.meta.env.VITE_API_URL || '';

async function apiJson(path, options = {}) {
  const token = localStorage.getItem('adminToken') || '';
  const r = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', 'x-admin-token': token, ...(options.headers || {}) },
    ...options,
  });
  if (!r.ok) throw new Error((await r.json().catch(() => ({}))).error || r.statusText);
  return r.json();
}

export default function AdminVouchers() {
  const navigate = useNavigate();
  const [types, setTypes] = useState([]);
  const [filterType] = useState(''); // 레거시 (타입 패널용 유지)
  const [issueForm, setIssueForm] = useState({ memberId: '', typeCode: 'SHOP_USE', amount: 1, description: '' });
  const [memberBalance, setMemberBalance] = useState(null);
  const [balanceMemberId, setBalanceMemberId] = useState('');
  const [typeForm, setTypeForm] = useState({ typeCode: '', name: '', description: '' });
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [showMemberDropdown, setShowMemberDropdown] = useState(false);
  const [balanceSearch, setBalanceSearch] = useState('');
  const [showBalanceDropdown, setShowBalanceDropdown] = useState(false);
  const [issueMode, setIssueMode] = useState('지급'); // '지급' | '차감'
  const [targetType, setTargetType] = useState('회원'); // '회원' | '상점'
  const [shops, setShops] = useState([]);
  const [shopSearch, setShopSearch] = useState('');
  const [showShopDropdown, setShowShopDropdown] = useState(false);
  const [shopBalance, setShopBalance] = useState(null); // 선택된 상점 바란스
  const [distributeForm, setDistributeForm] = useState({ shopId: '', shopName: '', memberId: '', memberName: '', typeCode: 'SHOP_USE', amount: 1, description: '' });
  const [distShopSearch, setDistShopSearch] = useState('');
  const [showDistShopDropdown, setShowDistShopDropdown] = useState(false);
  const [distMemberSearch, setDistMemberSearch] = useState('');
  const [showDistMemberDropdown, setShowDistMemberDropdown] = useState(false);
  const [distShopBalance, setDistShopBalance] = useState(null);

  // 잔액 조회 탭 (member | shop)
  const [balanceTargetType, setBalanceTargetType] = useState('member');
  // 상점 잔액조회용
  const [shopBalanceSearch, setShopBalanceSearch] = useState('');
  const [showShopBalanceDropdown, setShowShopBalanceDropdown] = useState(false);
  const [shopBalanceId, setShopBalanceId] = useState('');
  const [shopBalanceData, setShopBalanceData] = useState(null);
  // 펼침 이력 패널
  const [expandedLogs, setExpandedLogs] = useState([]);

  // ── 원장 테이블 상태 ──
  const [tblLogs, setTblLogs] = useState([]);
  const [tblTotal, setTblTotal] = useState(0);
  const [tblSumPlus, setTblSumPlus] = useState(0);
  const [tblSumMinus, setTblSumMinus] = useState(0);
  const [tblLoading, setTblLoading] = useState(false);
  const [tblPage, setTblPage] = useState(1);
  const [tblPageSize] = useState(20);
  const [tblSortField, setTblSortField] = useState('created_at');
  const [tblSortDir, setTblSortDir] = useState('DESC');
  // 필터
  const [tblFrom, setTblFrom] = useState('');
  const [tblTo, setTblTo] = useState('');
  const [tblFilterTarget, setTblFilterTarget] = useState(''); // '' | 'member' | 'shop'
  const [tblFilterSign, setTblFilterSign] = useState(''); // '' | 'plus' | 'minus'
  const [tblFilterSource, setTblFilterSource] = useState('');
  const [tblFilterType, setTblFilterType] = useState('');
  const [tblFilterName, setTblFilterName] = useState('');

  // ── 잔액 현황 테이블 상태 ──
  const [balTab, setBalTab] = useState('member'); // 'member' | 'shop'
  const [balRows, setBalRows] = useState([]);
  const [balTotal, setBalTotal] = useState(0);
  const [balLoading, setBalLoading] = useState(false);
  const [balPage, setBalPage] = useState(1);
  const [balPageSize] = useState(30);
  const [balExcludeZero, setBalExcludeZero] = useState(true);
  const [balFilterName, setBalFilterName] = useState('');
  const [balFilterType, setBalFilterType] = useState('');

  // ── 수동 지급/차감 안전성: 차감 시 대상 잔액 실시간 조회 ──
  const [issueTargetBalance, setIssueTargetBalance] = useState(null); // { total, balances: [{typeCode, name, balance}] }
  const [issueBalanceLoading, setIssueBalanceLoading] = useState(false);

  // ── 반응형 ──
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640);
  const [tblFilterOpen, setTblFilterOpen] = useState(false); // 모바일 필터 fold/unfold
  useEffect(() => {
    const handle = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handle);
    return () => window.removeEventListener('resize', handle);
  }, []);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [t, m, s] = await Promise.all([
        apiJson('/api/vouchers/types'),
        apiJson('/api/members'),
        apiJson('/api/shops').catch(() => ({ shops: [] })),
      ]);
      setTypes(t.types || []);
      setMembers(m.members || []);
      setShops(s.shops || []);
    } catch (e) {
      showToast('❌ 데이터 로드 실패: ' + e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadTableLogs = useCallback(async (overrides = {}) => {
    try {
      setTblLoading(true);
      const p = new URLSearchParams();
      const o = (k, fallback) => overrides[k] !== undefined ? overrides[k] : fallback;
      const page      = o('page', tblPage);
      const sortField = o('sortField', tblSortField);
      const sortDir   = o('sortDir', tblSortDir);
      p.set('page', page);
      p.set('pageSize', tblPageSize);
      p.set('sortField', sortField);
      p.set('sortDir', sortDir);
      const from   = o('from',   tblFrom);        if (from)   p.set('from',   from);
      const to     = o('to',     tblTo);          if (to)     p.set('to',     to);
      const target = o('target', tblFilterTarget);if (target) p.set('targetType', target);
      const sign   = o('sign',   tblFilterSign);  if (sign)   p.set('sign',   sign);
      const source = o('source', tblFilterSource);if (source) p.set('source', source);
      const type   = o('type',   tblFilterType);  if (type)   p.set('typeCode', type);
      const name   = o('name',   tblFilterName);  if (name)   p.set('name',   name);
      const d = await apiJson(`/api/admin/vouchers/logs?${p.toString()}`);
      setTblLogs(d.logs || []);
      setTblTotal(d.total || 0);
      setTblSumPlus(d.sumPlus || 0);
      setTblSumMinus(d.sumMinus || 0);
    } catch (e) {
      showToast('❌ 원장 조회 실패: ' + e.message);
    } finally {
      setTblLoading(false);
    }
  }, [tblPage, tblPageSize, tblSortField, tblSortDir, tblFrom, tblTo, tblFilterTarget, tblFilterSign, tblFilterSource, tblFilterType, tblFilterName]);

  const loadBalances = useCallback(async (overrides = {}) => {
    try {
      setBalLoading(true);
      const o = (k, fallback) => overrides[k] !== undefined ? overrides[k] : fallback;
      const p = new URLSearchParams();
      p.set('targetType',  o('tab',         balTab));
      p.set('page',        o('page',        balPage));
      p.set('pageSize',    balPageSize);
      p.set('excludeZero', o('excludeZero', balExcludeZero) ? '1' : '0');
      const name       = o('name',       balFilterName);  if (name)       p.set('name',     name);
      const filterType = o('filterType', balFilterType);  if (filterType) p.set('typeCode', filterType);
      const d = await apiJson(`/api/admin/vouchers/balances?${p.toString()}`);
      setBalRows(d.rows || []);
      setBalTotal(d.total || 0);
    } catch (e) {
      showToast('❌ 잔액 현황 조회 실패: ' + e.message);
    } finally {
      setBalLoading(false);
    }
  }, [balTab, balPage, balPageSize, balExcludeZero, balFilterName, balFilterType]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isAdminAuthenticatedLocal()) { navigate('/admin/login', { replace: true }); return; }
    loadData();
    loadTableLogs();
    loadBalances();
  }, [navigate, loadData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleIssue = async () => {
    try {
      const isShop = targetType === '상점';
      if (!issueForm.memberId || !issueForm.typeCode || !issueForm.amount) {
        showToast(isShop ? '상점, 타입, 수량을 입력하세요' : '회원, 타입, 수량을 입력하세요'); return;
      }
      const signedAmount = issueMode === '차감' ? -Math.abs(Number(issueForm.amount)) : Math.abs(Number(issueForm.amount));
      await apiJson('/api/vouchers/issue', {
        method: 'POST',
        body: JSON.stringify({
          ...issueForm,
          amount: signedAmount,
          source: issueMode === '차감' ? 'ADMIN_DEDUCT' : 'ADMIN',
          targetType: isShop ? 'shop' : 'member',
          shopId: isShop ? issueForm.memberId : undefined,
        }),
      });
      showToast(issueMode === '차감' ? `✅ 상품권 차감 완료` : `✅ 상품권 지급 완료 ${isShop ? '(상점에게)' : '(회원에게)'}`);
      setIssueForm(f => ({ ...f, memberId: '', description: '' }));
      setMemberSearch('');
      setShopSearch('');
      // 지급/차감 완료 후 잔액 자동 재조회
      if (isShop) {
        const newBal = await loadShopBalance(issueForm.memberId);
        setShopBalance(newBal);
        // 잔액조회 패널도 갱신
        if (shopBalanceId === issueForm.memberId) {
          setShopBalanceData(newBal);
          loadTargetLogs(issueForm.memberId, 'shop');
        }
      } else {
        if (balanceMemberId === issueForm.memberId) {
          const newBal = await apiJson(`/api/vouchers/${encodeURIComponent(issueForm.memberId)}/balance`).catch(() => null);
          if (newBal) setMemberBalance(newBal);
          loadTargetLogs(issueForm.memberId, 'member');
        }
      }
      loadBalances(); // 잔액 현황 테이블 갱신
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const handleDistribute = async () => {
    try {
      if (!distributeForm.shopId || !distributeForm.memberId || !distributeForm.typeCode || !distributeForm.amount) {
        showToast('상점, 회원, 타입, 수량을 모두 입력하세요'); return;
      }
      await apiJson('/api/admin/vouchers/distribute', {
        method: 'POST',
        body: JSON.stringify({ ...distributeForm, adminId: 'admin' }),
      });
      showToast(`✅ 배분 완료: ${distributeForm.shopName || distributeForm.shopId} → ${distributeForm.memberName || distributeForm.memberId} ${distributeForm.amount}장`);
      setDistributeForm(f => ({ ...f, shopId: '', shopName: '', memberId: '', memberName: '', description: '' }));
      setDistShopSearch(''); setDistMemberSearch(''); setDistShopBalance(null);
      loadData(); loadTableLogs(); loadBalances();
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const loadShopBalance = async (sid) => {
    try {
      const d = await apiJson(`/api/shops/${encodeURIComponent(sid)}/voucher-balance`);
      return d;
    } catch (e) { return null; }
  };

  // 수동 지급/차감 패널 전용: 대상 선택 시 잔액 로드 + 차감 가능 타입 자동 세팅
  const loadIssueTargetBalance = async (id, type) => {
    try {
      setIssueBalanceLoading(true);
      setIssueTargetBalance(null);
      const endpoint = type === 'shop'
        ? `/api/shops/${encodeURIComponent(id)}/voucher-balance`
        : `/api/vouchers/${encodeURIComponent(id)}/balance`;
      const d = await apiJson(endpoint);
      setIssueTargetBalance(d);
      // 보유 타입 중 첫 번째로 자동 선택
      const avail = (d?.balances || []).filter(b => (b.balance || 0) > 0);
      if (avail.length > 0) setIssueForm(f => ({ ...f, typeCode: avail[0].typeCode, amount: 1 }));
    } catch (e) {
      setIssueTargetBalance(null);
    } finally {
      setIssueBalanceLoading(false);
    }
  };

  // 대상(member/shop)의 최근 이력 로드 (잔액 조회 패널용 미니 조회)
  const loadTargetLogs = async (id, type) => {
    try {
      const param = type === 'shop' ? `shopId=${encodeURIComponent(id)}` : `memberId=${encodeURIComponent(id)}`;
      const d = await apiJson(`/api/admin/vouchers/logs?pageSize=10&${param}`);
      setExpandedLogs(d.logs || []);
    } catch (e) { setExpandedLogs([]); }
  };

  const handleAddType = async () => {
    try {
      if (!typeForm.typeCode || !typeForm.name) { showToast('코드와 이름을 입력하세요'); return; }
      await apiJson('/api/vouchers/types', { method: 'POST', body: JSON.stringify(typeForm) });
      showToast('✅ 타입 추가 완료');
      setTypeForm({ typeCode: '', name: '', description: '' });
      loadData();
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const handleCheckBalance = async () => {
    try {
      if (!balanceMemberId) { showToast('회원을 선택하세요'); return; }
      const data = await apiJson(`/api/vouchers/${encodeURIComponent(balanceMemberId)}/balance`);
      setMemberBalance(data);
      loadTargetLogs(balanceMemberId, 'member');
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const handleCheckShopBalance = async (sid) => {
    try {
      if (!sid) return;
      const d = await loadShopBalance(sid);
      setShopBalanceData(d);
      loadTargetLogs(sid, 'shop');
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const handleDeleteType = async (typeCode, typeName) => {
    if (!window.confirm(`"타입 ${typeName} (${typeCode})"을 제거하시겠습니까?\n\n이미 지급된 내역은 유지되며 [삭제됨]으로 표시됩니다.`)) return;
    try {
      await apiJson(`/api/vouchers/types/${encodeURIComponent(typeCode)}`, { method: 'DELETE' });
      showToast(`✅ ${typeName} 타입 제거 완료`);
      loadData();
      loadTableLogs();
    } catch (e) { showToast('❌ ' + e.message); }
  };

  const handleTblSort = (field) => {
    const newDir = tblSortField === field && tblSortDir === 'DESC' ? 'ASC' : 'DESC';
    setTblSortField(field);
    setTblSortDir(newDir);
    setTblPage(1);
    loadTableLogs({ page: 1, sortField: field, sortDir: newDir });
  };

  const handleTblSearch = () => {
    setTblPage(1);
    loadTableLogs({ page: 1 });
  };

  const handleTblReset = () => {
    setTblFrom(''); setTblTo('');
    setTblFilterTarget(''); setTblFilterSign('');
    setTblFilterSource(''); setTblFilterType('');
    setTblFilterName('');
    setTblPage(1);
    setTblSortField('created_at'); setTblSortDir('DESC');
    loadTableLogs({ page: 1, from: '', to: '', target: '', sign: '', source: '', type: '', name: '', sortField: 'created_at', sortDir: 'DESC' });
  };

  const handleTblPage = (p) => {
    setTblPage(p);
    loadTableLogs({ page: p });
  };

  const tblSortIcon = (field) => {
    if (tblSortField !== field) return <span style={{ opacity: 0.3, marginLeft: 3 }}>⇅</span>;
    return <span style={{ marginLeft: 3, color: '#6ee7b7' }}>{tblSortDir === 'DESC' ? '↓' : '↑'}</span>;
  };

  const SOURCE_OPTIONS = ['ADMIN', 'ADMIN_DEDUCT', 'MISSION', 'QR', 'SHOP_USE', 'DISTRIBUTE'];

  const panelStyle = { background: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: isMobile ? '14px 12px' : 20, marginBottom: 16, border: '1px solid rgba(255,255,255,0.08)' };
  const inputStyle = { padding: '9px 12px', borderRadius: 8, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.08)', color: '#fff', fontSize: 14, width: '100%', boxSizing: 'border-box' };
  const btnStyle = (bg) => ({ padding: isMobile ? '10px 16px' : '8px 16px', borderRadius: 8, border: 'none', background: bg, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14, touchAction: 'manipulation' });
  const labelStyle = { fontSize: 12, opacity: 0.7, marginBottom: 4, display: 'block' };
  // 반응형 그리드 헬퍼
  const grid1 = { display: 'grid', gridTemplateColumns: '1fr', gap: 8 };
  const grid2 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8 };
  const grid3 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr', gap: 8 };
  const gridIssue = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr', gap: 8, marginBottom: 8 };
  const gridDist2 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 8, marginBottom: 8 };
  const gridDist3 = { display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 2fr', gap: 8, marginBottom: 8 };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 10px 80px' : '0 16px 80px' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: '#1e293b', padding: '10px 20px', borderRadius: 12, zIndex: 9999, fontWeight: 700 }}>{toast}</div>}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingTop: 16 }}>
        <button onClick={() => navigate('/admin')} style={{ ...btnStyle('rgba(255,255,255,0.1)'), padding: '6px 12px' }}>← 돌아가기</button>
        <h1 style={{ margin: 0, fontSize: 22, fontWeight: 900 }}>🎟️ VIP 상품권 관리</h1>
      </div>

      {/* 상품권 타입 목록 */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>📋 상품권 타입</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {types.map(t => (
            <div key={t.type_code} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 10, background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', fontSize: 13 }}>
              <span style={{ fontWeight: 700, color: '#fbbf24' }}>{t.type_code}</span>
              <span>{t.name}</span>
              <button
                onClick={() => handleDeleteType(t.type_code, t.name)}
                style={{ marginLeft: 4, padding: '2px 7px', borderRadius: 6, border: 'none', background: 'rgba(239,68,68,0.25)', color: '#f87171', cursor: 'pointer', fontSize: 11, fontWeight: 700, lineHeight: 1.4 }}
                title="이 타입 제거"
              >✕</button>
            </div>
          ))}
        </div>
        <hr style={{ borderColor: 'rgba(255,255,255,0.08)', margin: '14px 0' }} />
        <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 10 }}>새 타입 추가</div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr 1fr auto', gap: 8, alignItems: 'end' }}>
          <div><label style={labelStyle}>코드 (영문대문자)</label><input style={inputStyle} placeholder="NEW_TYPE" value={typeForm.typeCode} onChange={e => setTypeForm(f => ({ ...f, typeCode: e.target.value }))} /></div>
          <div><label style={labelStyle}>이름</label><input style={inputStyle} placeholder="타입명" value={typeForm.name} onChange={e => setTypeForm(f => ({ ...f, name: e.target.value }))} /></div>
          <div><label style={labelStyle}>설명 (선택)</label><input style={inputStyle} placeholder="설명" value={typeForm.description} onChange={e => setTypeForm(f => ({ ...f, description: e.target.value }))} /></div>
          <button style={{ ...btnStyle('rgba(34,197,94,0.8)'), width: isMobile ? '100%' : 'auto', marginTop: isMobile ? 4 : 0 }} onClick={handleAddType}>추가</button>
        </div>
      </div>

      {/* 잔액 조회 */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>🔍 회원 잔액 조회</div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'end' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <label style={labelStyle}>회원 검색</label>
            <input
              style={inputStyle}
              placeholder="이름 또는 전화번호 검색..."
              value={balanceSearch}
              onChange={e => {
                setBalanceSearch(e.target.value);
                setShowBalanceDropdown(true);
                if (!e.target.value) { setBalanceMemberId(''); setMemberBalance(null); }
              }}
              onFocus={() => setShowBalanceDropdown(true)}
              onBlur={() => setTimeout(() => setShowBalanceDropdown(false), 150)}
              autoComplete="off"
            />
            {balanceMemberId && (
              <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 4 }}>
                ✓ {members.find(m => (m.memberId || m.id) === balanceMemberId)?.name || balanceMemberId} 선택됨
              </div>
            )}
            {showBalanceDropdown && balanceSearch.trim() && (() => {
              const q = balanceSearch.trim().toLowerCase();
              const filtered = members.filter(m =>
                (m.name || '').toLowerCase().includes(q) ||
                (m.phone || m.phoneNumber || '').replace(/-/g,'').includes(q.replace(/-/g,''))
              ).slice(0, 10);
              return filtered.length > 0 ? (
                <div style={{
                  position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0,
                  background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: 8, marginTop: 2, maxHeight: 220, overflowY: 'auto',
                }}>
                  {filtered.map(m => {
                    const mid = m.memberId || m.id;
                    return (
                      <div
                        key={mid}
                        style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseDown={() => {
                          setBalanceMemberId(mid);
                          setMemberBalance(null);
                          setBalanceSearch(m.name + (m.phone || m.phoneNumber ? ` (${m.phone || m.phoneNumber})` : ''));
                          setShowBalanceDropdown(false);
                          // 선택 즉시 자동 조회
                          apiJson(`/api/vouchers/${encodeURIComponent(mid)}/balance`)
                            .then(data => setMemberBalance(data))
                            .catch(() => {});
                          loadTargetLogs(mid, 'member');
                        }}
                      >
                        <span style={{ fontWeight: 700 }}>{m.name}</span>
                        <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>{m.phone || m.phoneNumber || mid}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()}
          </div>
          <button style={btnStyle('rgba(59,130,246,0.8)')} onClick={handleCheckBalance}>조회</button>
        </div>
        {memberBalance && (
          <div style={{ marginTop: 12, padding: 14, background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>회원 {memberBalance.memberId} — 총 {memberBalance.total}장</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(memberBalance.balances || []).map(b => (
                <div key={b.typeCode} style={{ padding: '6px 12px', background: 'rgba(251,191,36,0.15)', borderRadius: 8, fontSize: 13 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 700 }}>{b.typeCode}</span> {b.balance}장
                </div>
              ))}
              {memberBalance.balances?.length === 0 && <span style={{ opacity: 0.6, fontSize: 13 }}>보유 상품권 없음</span>}
            </div>
          </div>
        )}
      </div>

      {/* ── 잔액 현황 테이블 ── */}
      <div style={panelStyle} id="bal-panel">
        {/* 헤더 + 탭 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>💰 보유 잔액 현황</div>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                style={{ padding: '5px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: balTab === 'member' ? 'rgba(59,130,246,0.8)' : 'transparent', color: balTab === 'member' ? '#fff' : 'rgba(255,255,255,0.6)' }}
                onClick={() => { setBalTab('member'); setBalPage(1); loadBalances({ tab: 'member', page: 1 }); }}
              >회원</button>
              <button
                style={{ padding: '5px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: balTab === 'shop' ? 'rgba(251,191,36,0.8)' : 'transparent', color: balTab === 'shop' ? '#000' : 'rgba(255,255,255,0.6)' }}
                onClick={() => { setBalTab('shop'); setBalPage(1); loadBalances({ tab: 'shop', page: 1 }); }}
              >상점</button>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnStyle('rgba(59,130,246,0.8)'), padding: '6px 14px', fontSize: 13 }} onClick={() => { setBalPage(1); loadBalances({ page: 1 }); }}>🔍 조회</button>
            <button style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '6px 12px', fontSize: 13 }} onClick={() => loadBalances()}>🔄</button>
          </div>
        </div>

        {/* 필터 */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label style={labelStyle}>이름 검색</label>
            <input
              style={inputStyle}
              placeholder="이름 검색..."
              value={balFilterName}
              onChange={e => setBalFilterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (setBalPage(1), loadBalances({ page: 1 }))}
            />
          </div>
          <div style={{ minWidth: 140 }}>
            <label style={labelStyle}>타입 필터</label>
            <select style={inputStyle} value={balFilterType} onChange={e => { setBalFilterType(e.target.value); setBalPage(1); loadBalances({ page: 1, filterType: e.target.value }); }}>
              <option value=''>전체 타입</option>
              {types.map(t => <option key={t.type_code} value={t.type_code}>{t.name}</option>)}
            </select>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', paddingBottom: 1 }}>
            <input type="checkbox" checked={balExcludeZero} onChange={e => { setBalExcludeZero(e.target.checked); setBalPage(1); loadBalances({ page: 1, excludeZero: e.target.checked }); }} />
            0장 제외
          </label>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>이름</th>
                {types.filter(t => !balFilterType || t.type_code === balFilterType).map(t => (
                  <th key={t.type_code} style={{ padding: '9px 10px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 999, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>{t.name}</span>
                  </th>
                ))}
                <th style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800 }}>합계</th>
                <th style={{ padding: '9px 10px', textAlign: 'center', width: 60 }}>이력</th>
              </tr>
            </thead>
            <tbody>
              {balLoading ? (
                <tr><td colSpan={types.length + 3} style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>⏳ 조회 중...</td></tr>
              ) : balRows.length === 0 ? (
                <tr><td colSpan={types.length + 3} style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>조회 결과가 없습니다.</td></tr>
              ) : balRows.map((row, i) => (
                <tr key={row.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 10px' }}>
                    {balTab === 'shop' && <span style={{ fontSize: 11, marginRight: 4, padding: '1px 5px', borderRadius: 6, background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>🏦</span>}
                    <span style={{ fontWeight: 600 }}>{row.name}</span>
                    <span style={{ fontSize: 11, opacity: 0.4, marginLeft: 6 }}>{row.id}</span>
                  </td>
                  {types.filter(t => !balFilterType || t.type_code === balFilterType).map(t => {
                    const cnt = row.types[t.type_code] || 0;
                    return (
                      <td key={t.type_code} style={{ padding: '9px 10px', textAlign: 'right', fontWeight: cnt > 0 ? 700 : 'normal', color: cnt > 0 ? '#e2e8f0' : 'rgba(255,255,255,0.25)' }}>
                        {cnt > 0 ? `${cnt}장` : '—'}
                      </td>
                    );
                  })}
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, color: row.total > 0 ? '#6ee7b7' : '#f87171' }}>
                    {row.total}장
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center' }}>
                    <button
                      style={{ padding: '3px 9px', borderRadius: 7, border: 'none', background: 'rgba(99,102,241,0.3)', color: '#a5b4fc', cursor: 'pointer', fontSize: 11, fontWeight: 700 }}
                      onClick={() => {
                        setTblFilterTarget(balTab);
                        setTblFilterName(row.name || row.id);
                        setTblPage(1);
                        loadTableLogs({ page: 1, target: balTab, name: row.name || row.id });
                        document.getElementById('ledger-panel')?.scrollIntoView({ behavior: 'smooth' });
                      }}
                    >📋</button>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* 합계 행 */}
            {balRows.length > 0 && (() => {
              const totals = {};
              let grandTotal = 0;
              for (const row of balRows) {
                for (const [tc, cnt] of Object.entries(row.types)) {
                  totals[tc] = (totals[tc] || 0) + cnt;
                  grandTotal += cnt;
                }
              }
              return (
                <tfoot>
                  <tr style={{ borderTop: '2px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', fontWeight: 800 }}>
                    <td style={{ padding: '9px 10px', opacity: 0.6, fontSize: 12 }}>이 페이지 합계 ({balRows.length}건)</td>
                    {types.filter(t => !balFilterType || t.type_code === balFilterType).map(t => (
                      <td key={t.type_code} style={{ padding: '9px 10px', textAlign: 'right', color: '#fbbf24' }}>
                        {totals[t.type_code] || 0}장
                      </td>
                    ))}
                    <td style={{ padding: '9px 10px', textAlign: 'right', color: '#6ee7b7' }}>{grandTotal}장</td>
                    <td />
                  </tr>
                </tfoot>
              );
            })()}
          </table>
        </div>

        {/* 페이지네이션 */}
        {balTotal > balPageSize && (() => {
          const totalPages = Math.ceil(balTotal / balPageSize);
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 14 }}>
              {!isMobile && <button onClick={() => { setBalPage(1); loadBalances({ page: 1 }); }} disabled={balPage === 1} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 12px', fontSize: 13, opacity: balPage === 1 ? 0.3 : 1 }}>◀◀</button>}
              <button onClick={() => { const p = balPage - 1; setBalPage(p); loadBalances({ page: p }); }} disabled={balPage === 1} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 14px', fontSize: 13, opacity: balPage === 1 ? 0.3 : 1 }}>◀</button>
              {Array.from({ length: Math.min(isMobile ? 3 : 5, totalPages) }, (_, i) => {
                const p = Math.max(1, balPage - 2) + i;
                if (p > totalPages) return null;
                return <button key={p} onClick={() => { setBalPage(p); loadBalances({ page: p }); }}
                  style={{ ...btnStyle(p === balPage ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.08)'), padding: '7px 12px', fontSize: 13, minWidth: 36 }}>{p}</button>;
              })}
              <button onClick={() => { const p = balPage + 1; setBalPage(p); loadBalances({ page: p }); }} disabled={balPage === totalPages} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 14px', fontSize: 13, opacity: balPage === totalPages ? 0.3 : 1 }}>▶</button>
              {!isMobile && <button onClick={() => { setBalPage(totalPages); loadBalances({ page: totalPages }); }} disabled={balPage === totalPages} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 12px', fontSize: 13, opacity: balPage === totalPages ? 0.3 : 1 }}>▶▶</button>}
              <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 4 }}>{balPage}/{totalPages} · {balTotal}건</span>
            </div>
          );
        })()}
      </div>

      {/* 수동 지급 / 차감 */}
      <div style={panelStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>📤 수동 지급 / 차감</div>
          <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
            <button
              style={{ padding: '5px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: issueMode === '지급' ? 'rgba(110,231,183,0.8)' : 'transparent', color: issueMode === '지급' ? '#000' : 'rgba(255,255,255,0.6)' }}
              onClick={() => { setIssueMode('지급'); setIssueTargetBalance(null); }}
            >지급</button>
            <button
              style={{ padding: '5px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: issueMode === '차감' ? 'rgba(239,68,68,0.8)' : 'transparent', color: issueMode === '차감' ? '#fff' : 'rgba(255,255,255,0.6)' }}
              onClick={() => { setIssueMode('차감'); if (issueForm.memberId) loadIssueTargetBalance(issueForm.memberId, targetType === '상점' ? 'shop' : 'member'); }}
            >차감</button>
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 13, opacity: 0.7 }}>대상:</span>
            <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)' }}>
              <button
                style={{ padding: '5px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: targetType === '회원' ? 'rgba(59,130,246,0.8)' : 'transparent', color: targetType === '회원' ? '#fff' : 'rgba(255,255,255,0.6)' }}
                onClick={() => { setTargetType('회원'); setIssueForm(f => ({ ...f, memberId: '' })); setMemberSearch(''); setShopSearch(''); setShopBalance(null); setIssueTargetBalance(null); }}
              >회원</button>
              <button
                style={{ padding: '5px 14px', fontSize: 13, fontWeight: 700, border: 'none', cursor: 'pointer', background: targetType === '상점' ? 'rgba(251,191,36,0.8)' : 'transparent', color: targetType === '상점' ? '#000' : 'rgba(255,255,255,0.6)' }}
                onClick={() => { setTargetType('상점'); setIssueForm(f => ({ ...f, memberId: '' })); setMemberSearch(''); setShopSearch(''); setShopBalance(null); setIssueTargetBalance(null); }}
              >상점</button>
            </div>
          </div>
        </div>
        <div style={gridIssue}>
          <div style={{ position: 'relative' }}>
            {targetType === '회원' ? (
              <>
                <label style={labelStyle}>회원 검색</label>
                <input
                  style={inputStyle}
                  placeholder="이름 또는 전화번호 검색..."
                  value={memberSearch}
                  onChange={e => {
                    setMemberSearch(e.target.value);
                    setShowMemberDropdown(true);
                    if (!e.target.value) setIssueForm(f => ({ ...f, memberId: '' }));
                  }}
                  onFocus={() => setShowMemberDropdown(true)}
                  onBlur={() => setTimeout(() => setShowMemberDropdown(false), 150)}
                  autoComplete="off"
                />
                {issueForm.memberId && (
                  <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 4 }}>
                    ✓ {members.find(m => (m.memberId || m.id) === issueForm.memberId)?.name || issueForm.memberId} 선택됨
                    {issueMode === '차감' && issueBalanceLoading && <span style={{ marginLeft: 6, opacity: 0.6 }}>⏳ 잔액 확인 중...</span>}
                    {issueMode === '차감' && !issueBalanceLoading && issueTargetBalance && <span style={{ marginLeft: 6 }}>잔여 {issueTargetBalance.total}장</span>}
                    {issueMode === '차감' && !issueBalanceLoading && issueTargetBalance && issueTargetBalance.total === 0 && <span style={{ marginLeft: 4, color: '#f87171' }}>(보유 없음)</span>}
                  </div>
                )}
                {showMemberDropdown && memberSearch.trim() && (() => {
                  const q = memberSearch.trim().toLowerCase();
                  const filtered = members.filter(m =>
                    (m.name || '').toLowerCase().includes(q) ||
                    (m.phone || m.phoneNumber || '').replace(/-/g,'').includes(q.replace(/-/g,''))
                  ).slice(0, 10);
                  return filtered.length > 0 ? (
                    <div style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
                      {filtered.map(m => {
                        const mid = m.memberId || m.id;
                        return (
                          <div key={mid} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                            onMouseDown={() => { setIssueForm(f => ({ ...f, memberId: mid })); setMemberSearch(m.name + (m.phone || m.phoneNumber ? ` (${m.phone || m.phoneNumber})` : '')); setShowMemberDropdown(false); if (issueMode === '차감') loadIssueTargetBalance(mid, 'member'); }}>
                            <span style={{ fontWeight: 700 }}>{m.name}</span>
                            <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>{m.phone || m.phoneNumber || mid}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null;
                })()}
              </>
            ) : (
              <>
                <label style={labelStyle}>상점 검색</label>
                <input
                  style={inputStyle}
                  placeholder="상점명 검색..."
                  value={shopSearch}
                  onChange={e => {
                    setShopSearch(e.target.value);
                    setShowShopDropdown(true);
                    if (!e.target.value) { setIssueForm(f => ({ ...f, memberId: '' })); setShopBalance(null); }
                  }}
                  onFocus={() => setShowShopDropdown(true)}
                  onBlur={() => setTimeout(() => setShowShopDropdown(false), 150)}
                  autoComplete="off"
                />
                {issueForm.memberId && (
                  <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>
                    ✓ {shops.find(s => String(s.shop_id || s.id) === issueForm.memberId)?.name || issueForm.memberId} 선택됨
                    {issueBalanceLoading && <span style={{ marginLeft: 6, opacity: 0.6 }}>⏳ 잔액 확인 중...</span>}
                    {!issueBalanceLoading && shopBalance && <span style={{ marginLeft: 8 }}>잔여 {shopBalance.total}장</span>}
                    {!issueBalanceLoading && shopBalance && shopBalance.total === 0 && <span style={{ marginLeft: 4, color: '#f87171' }}>(보유 없음)</span>}
                  </div>
                )}
                {showShopDropdown && shopSearch.trim() && (() => {
                  const q = shopSearch.trim().toLowerCase();
                  const filtered = shops.filter(s => (s.name || '').toLowerCase().includes(q)).slice(0, 10);
                  return filtered.length > 0 ? (
                    <div style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
                      {filtered.map(s => {
                        const sid = String(s.shop_id || s.id);
                        return (
                          <div key={sid} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                            onMouseDown={async () => {
                              setIssueForm(f => ({ ...f, memberId: sid }));
                              setShopSearch(s.name || sid);
                              setShowShopDropdown(false);
                              const bal = await loadShopBalance(sid);
                              setShopBalance(bal);
                              if (issueMode === '차감') {
                                setIssueTargetBalance(bal);
                                const avail = (bal?.balances || []).filter(b => (b.balance || 0) > 0);
                                if (avail.length > 0) setIssueForm(f => ({ ...f, typeCode: avail[0].typeCode, amount: 1 }));
                              }
                            }}>
                            <span style={{ fontWeight: 700 }}>{s.name}</span>
                            <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>{s.region || sid}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null;
                })()}
              </>
            )}
          </div>
          <div>
            <label style={labelStyle}>타입</label>
            {issueMode === '차감' && issueForm.memberId ? (() => {
              const avail = (issueTargetBalance?.balances || []).filter(b => (b.balance || 0) > 0);
              return (
                <select
                  style={{ ...inputStyle, opacity: (issueBalanceLoading || avail.length === 0) ? 0.5 : 1 }}
                  value={issueForm.typeCode}
                  onChange={e => setIssueForm(f => ({ ...f, typeCode: e.target.value, amount: 1 }))}
                  disabled={issueBalanceLoading || avail.length === 0}
                >
                  {issueBalanceLoading
                    ? <option value=''>⏳ 조회 중...</option>
                    : avail.length === 0
                      ? <option value=''>— 보유 상품권 없음 —</option>
                      : avail.map(b => <option key={b.typeCode} value={b.typeCode}>{b.name || b.typeCode} (잔여 {b.balance}장)</option>)
                  }
                </select>
              );
            })() : (
              <select style={{ ...inputStyle }} value={issueForm.typeCode} onChange={e => setIssueForm(f => ({ ...f, typeCode: e.target.value }))}>
                {types.map(t => <option key={t.type_code} value={t.type_code}>{t.name} ({t.type_code})</option>)}
              </select>
            )}
          </div>
          <div>
            <label style={labelStyle}>수량
              {issueMode === '차감' && issueTargetBalance && (() => {
                const maxQ = (issueTargetBalance.balances || []).find(b => b.typeCode === issueForm.typeCode)?.balance || 0;
                return <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>최대 {maxQ}장</span>;
              })()}
            </label>
            {issueMode === '차감' ? (() => {
              const maxQ = (issueTargetBalance?.balances || []).find(b => b.typeCode === issueForm.typeCode)?.balance || 0;
              const over = Number(issueForm.amount) > maxQ;
              return (
                <input
                  style={{ ...inputStyle, ...(over ? { borderColor: 'rgba(248,113,113,0.8)' } : {}) }}
                  type="number" min={1} max={maxQ || undefined}
                  value={issueForm.amount}
                  onChange={e => setIssueForm(f => ({ ...f, amount: e.target.value }))}
                />
              );
            })() : (
              <input style={inputStyle} type="number" min={1} value={issueForm.amount} onChange={e => setIssueForm(f => ({ ...f, amount: e.target.value }))} />
            )}
          </div>
        </div>
        <div style={{ marginBottom: 10 }}><label style={labelStyle}>사유 (선택)</label><input style={inputStyle} placeholder={issueMode === '차감' ? '차감 사유' : '지급 사유'} value={issueForm.description} onChange={e => setIssueForm(f => ({ ...f, description: e.target.value }))} /></div>
        <button
          disabled={issueMode === '차감' && (() => {
            if (!issueForm.memberId || issueBalanceLoading) return true;
            if (!issueTargetBalance) return false; // 조회 전이면 허용
            const avail = (issueTargetBalance.balances || []).filter(b => (b.balance || 0) > 0);
            if (avail.length === 0) return true;
            const maxQ = avail.find(b => b.typeCode === issueForm.typeCode)?.balance || 0;
            return maxQ === 0 || Number(issueForm.amount) < 1 || Number(issueForm.amount) > maxQ;
          })()}
          style={{ ...btnStyle(issueMode === '차감' ? 'rgba(239,68,68,0.8)' : targetType === '상점' ? 'rgba(251,191,36,0.8)' : 'rgba(110,231,183,0.8)'), width: '100%', padding: '10px 0', fontSize: 16, color: (issueMode !== '차감' && targetType === '상점') ? '#000' : '#fff', opacity: issueMode === '차감' && (() => { if (!issueForm.memberId || issueBalanceLoading) return true; if (!issueTargetBalance) return false; const avail = (issueTargetBalance.balances || []).filter(b => (b.balance || 0) > 0); if (avail.length === 0) return true; const maxQ = avail.find(b => b.typeCode === issueForm.typeCode)?.balance || 0; return maxQ === 0 || Number(issueForm.amount) < 1 || Number(issueForm.amount) > maxQ; })() ? 0.4 : 1, cursor: issueMode === '차감' && (() => { if (!issueForm.memberId || issueBalanceLoading) return true; if (!issueTargetBalance) return false; const avail = (issueTargetBalance.balances || []).filter(b => (b.balance || 0) > 0); if (avail.length === 0) return true; const maxQ = avail.find(b => b.typeCode === issueForm.typeCode)?.balance || 0; return maxQ === 0 || Number(issueForm.amount) < 1 || Number(issueForm.amount) > maxQ; })() ? 'not-allowed' : 'pointer' }}
          onClick={handleIssue}
        >{issueMode === '차감' ? `➖ 차감하기 (${targetType}에게)` : `🎟️ 지급하기 (${targetType}에게)`}</button>
      </div>

      {/* 🏦 상점 → 회원 배분 */}
      <div style={panelStyle}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 12 }}>🏦 상점 → 회원 배분</div>
        <div style={gridDist2}>
          {/* 상점 선택 */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>배분 상점 검색</label>
            <input
              style={inputStyle}
              placeholder="상점명 검색..."
              value={distShopSearch}
              onChange={e => {
                setDistShopSearch(e.target.value);
                setShowDistShopDropdown(true);
                if (!e.target.value) { setDistributeForm(f => ({ ...f, shopId: '', shopName: '' })); setDistShopBalance(null); }
              }}
              onFocus={() => setShowDistShopDropdown(true)}
              onBlur={() => setTimeout(() => setShowDistShopDropdown(false), 150)}
              autoComplete="off"
            />
            {distributeForm.shopId && (
              <div style={{ fontSize: 11, color: '#fbbf24', marginTop: 4 }}>
                ✓ {distributeForm.shopName} 선택됨
                {distShopBalance && (
                  <span style={{ marginLeft: 8 }}>잔여: {distShopBalance.total}장
                    {(distShopBalance.balances || []).map(b => <span key={b.typeCode} style={{ marginLeft: 6, opacity: 0.8 }}>{b.typeCode}:{b.balance}장</span>)}
                  </span>
                )}
              </div>
            )}
            {showDistShopDropdown && distShopSearch.trim() && (() => {
              const q = distShopSearch.trim().toLowerCase();
              const filtered = shops.filter(s => (s.name || '').toLowerCase().includes(q)).slice(0, 10);
              return filtered.length > 0 ? (
                <div style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
                  {filtered.map(s => {
                    const sid = String(s.shop_id || s.id);
                    return (
                      <div key={sid} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseDown={async () => {
                          setDistributeForm(f => ({ ...f, shopId: sid, shopName: s.name || sid }));
                          setDistShopSearch(s.name || sid);
                          setShowDistShopDropdown(false);
                          const bal = await loadShopBalance(sid);
                          setDistShopBalance(bal);
                          if (bal?.balances?.length > 0) setDistributeForm(f => ({ ...f, typeCode: bal.balances[0].typeCode }));
                        }}>
                        <span style={{ fontWeight: 700 }}>{s.name}</span>
                        <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>{s.region || sid}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()}
          </div>
          {/* 회원 선택 */}
          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>배분 받는 회원 검색</label>
            <input
              style={inputStyle}
              placeholder="회원명 또는 전화번호..."
              value={distMemberSearch}
              onChange={e => {
                setDistMemberSearch(e.target.value);
                setShowDistMemberDropdown(true);
                if (!e.target.value) setDistributeForm(f => ({ ...f, memberId: '', memberName: '' }));
              }}
              onFocus={() => setShowDistMemberDropdown(true)}
              onBlur={() => setTimeout(() => setShowDistMemberDropdown(false), 150)}
              autoComplete="off"
            />
            {distributeForm.memberId && (
              <div style={{ fontSize: 11, color: '#6ee7b7', marginTop: 4 }}>✓ {distributeForm.memberName} 선택됨</div>
            )}
            {showDistMemberDropdown && distMemberSearch.trim() && (() => {
              const q = distMemberSearch.trim().toLowerCase();
              const filtered = members.filter(m =>
                (m.name || '').toLowerCase().includes(q) ||
                (m.phone || m.phoneNumber || '').replace(/-/g,'').includes(q.replace(/-/g,''))
              ).slice(0, 10);
              return filtered.length > 0 ? (
                <div style={{ position: 'absolute', zIndex: 999, top: '100%', left: 0, right: 0, background: '#1e293b', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8, marginTop: 2, maxHeight: 220, overflowY: 'auto' }}>
                  {filtered.map(m => {
                    const mid = m.memberId || m.id;
                    return (
                      <div key={mid} style={{ padding: '8px 12px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid rgba(255,255,255,0.06)' }}
                        onMouseDown={() => {
                          setDistributeForm(f => ({ ...f, memberId: mid, memberName: m.name || mid }));
                          setDistMemberSearch(m.name + (m.phone || m.phoneNumber ? ` (${m.phone || m.phoneNumber})` : ''));
                          setShowDistMemberDropdown(false);
                        }}>
                        <span style={{ fontWeight: 700 }}>{m.name}</span>
                        <span style={{ opacity: 0.6, marginLeft: 8, fontSize: 12 }}>{m.phone || m.phoneNumber || mid}</span>
                      </div>
                    );
                  })}
                </div>
              ) : null;
            })()}
          </div>
        </div>
        <div style={gridDist3}>
          <div>
            <label style={labelStyle}>상품권 타입</label>
            <select style={{ ...inputStyle }} value={distributeForm.typeCode} onChange={e => setDistributeForm(f => ({ ...f, typeCode: e.target.value }))}>
              {(distShopBalance?.balances?.length > 0 ? distShopBalance.balances : types).map(t => (
                <option key={t.typeCode || t.type_code} value={t.typeCode || t.type_code}>
                  {t.name || t.typeCode || t.type_code} ({t.balance !== undefined ? `${t.balance}장` : t.type_code})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>수량
              {distShopBalance && (() => {
                const maxQ = (distShopBalance.balances || []).find(b => (b.typeCode || b.type_code) === distributeForm.typeCode)?.balance || 0;
                return <span style={{ marginLeft: 6, opacity: 0.6, fontSize: 11 }}>최대 {maxQ}장</span>;
              })()}
            </label>
            {(() => {
              const maxQ = distShopBalance ? (distShopBalance.balances || []).find(b => (b.typeCode || b.type_code) === distributeForm.typeCode)?.balance || 0 : undefined;
              const over = maxQ !== undefined && Number(distributeForm.amount) > maxQ;
              return (
                <input
                  style={{ ...inputStyle, ...(over ? { borderColor: 'rgba(248,113,113,0.8)' } : {}) }}
                  type="number" min={1} max={maxQ || undefined}
                  value={distributeForm.amount}
                  onChange={e => setDistributeForm(f => ({ ...f, amount: e.target.value }))}
                />
              );
            })()}
          </div>
          <div><label style={labelStyle}>사유 (선택)</label><input style={inputStyle} placeholder="배분 사유" value={distributeForm.description} onChange={e => setDistributeForm(f => ({ ...f, description: e.target.value }))} /></div>
        </div>
        <button
          disabled={(() => {
            if (!distributeForm.shopId || !distributeForm.memberId) return true;
            if (!distShopBalance) return false;
            const maxQ = (distShopBalance.balances || []).find(b => (b.typeCode || b.type_code) === distributeForm.typeCode)?.balance || 0;
            return maxQ === 0 || Number(distributeForm.amount) < 1 || Number(distributeForm.amount) > maxQ;
          })()}
          style={{ ...btnStyle('rgba(168,85,247,0.8)'), width: '100%', padding: '10px 0', fontSize: 16, opacity: (() => { if (!distributeForm.shopId || !distributeForm.memberId) return 0.4; if (!distShopBalance) return 1; const maxQ = (distShopBalance.balances || []).find(b => (b.typeCode || b.type_code) === distributeForm.typeCode)?.balance || 0; return (maxQ === 0 || Number(distributeForm.amount) > maxQ) ? 0.4 : 1; })(), cursor: (() => { if (!distributeForm.shopId || !distributeForm.memberId) return 'not-allowed'; if (!distShopBalance) return 'pointer'; const maxQ = (distShopBalance.balances || []).find(b => (b.typeCode || b.type_code) === distributeForm.typeCode)?.balance || 0; return (maxQ === 0 || Number(distributeForm.amount) > maxQ) ? 'not-allowed' : 'pointer'; })() }}
          onClick={handleDistribute}
        >📤 배분하기 ({distributeForm.shopName || '상점 미선택'} → {distributeForm.memberName || '회원 미선택'})</button>
      </div>

      {/* ── 원장 조회 테이블 ── */}
      <div id="ledger-panel" style={panelStyle}>
        {/* 헤더 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
          <div style={{ fontWeight: 700, fontSize: 16 }}>📋 상품권 원장 조회</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ ...btnStyle('rgba(59,130,246,0.8)'), padding: '6px 14px', fontSize: 13 }} onClick={handleTblSearch}>🔍 조회</button>
            <button style={{ ...btnStyle('rgba(255,255,255,0.1)'), padding: '6px 12px', fontSize: 13 }} onClick={handleTblReset}>✕ 초기화</button>
            <button style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '6px 12px', fontSize: 13 }} onClick={() => loadTableLogs()}>🔄</button>
          </div>
        </div>

        {/* 필터 바 */}
        {isMobile && (
          <button
            onClick={() => setTblFilterOpen(v => !v)}
            style={{ ...btnStyle('rgba(255,255,255,0.07)'), width: '100%', marginBottom: 8, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px' }}
          >
            <span>🔧 필터 {[tblFrom, tblTo, tblFilterTarget, tblFilterSign, tblFilterType, tblFilterSource, tblFilterName].filter(Boolean).length > 0 ? `(${[tblFrom, tblTo, tblFilterTarget, tblFilterSign, tblFilterType, tblFilterSource, tblFilterName].filter(Boolean).length}개 적용)` : ''}</span>
            <span>{tblFilterOpen ? '▲' : '▼'}</span>
          </button>
        )}
        {(!isMobile || tblFilterOpen) && (
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(auto-fill, minmax(150px, 1fr))', gap: 8, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>시작일</label>
            <input type="date" style={inputStyle} value={tblFrom} onChange={e => { setTblFrom(e.target.value); loadTableLogs({ page: 1, from: e.target.value }); }} />
          </div>
          <div>
            <label style={labelStyle}>종료일</label>
            <input type="date" style={inputStyle} value={tblTo} onChange={e => { setTblTo(e.target.value); loadTableLogs({ page: 1, to: e.target.value }); }} />
          </div>
          <div>
            <label style={labelStyle}>대상 유형</label>
            <select style={inputStyle} value={tblFilterTarget} onChange={e => { setTblFilterTarget(e.target.value); loadTableLogs({ page: 1, target: e.target.value }); }}>
              <option value=''>전체</option>
              <option value='member'>회원</option>
              <option value='shop'>상점</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>지급/차감</label>
            <select style={inputStyle} value={tblFilterSign} onChange={e => { setTblFilterSign(e.target.value); loadTableLogs({ page: 1, sign: e.target.value }); }}>
              <option value=''>전체</option>
              <option value='plus'>지급 (+)</option>
              <option value='minus'>차감 (−)</option>
            </select>
          </div>
          <div>
            <label style={labelStyle}>상품권 타입</label>
            <select style={inputStyle} value={tblFilterType} onChange={e => { setTblFilterType(e.target.value); loadTableLogs({ page: 1, type: e.target.value }); }}>
              <option value=''>전체</option>
              {types.map(t => <option key={t.type_code} value={t.type_code}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label style={labelStyle}>소스</label>
            <select style={inputStyle} value={tblFilterSource} onChange={e => { setTblFilterSource(e.target.value); loadTableLogs({ page: 1, source: e.target.value }); }}>
              <option value=''>전체</option>
              {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ gridColumn: isMobile ? 'span 2' : 'span 2' }}>
            <label style={labelStyle}>이름 검색 (회원명·상점명)</label>
            <input
              style={inputStyle}
              placeholder="이름 입력 후 조회 버튼..."
              value={tblFilterName}
              onChange={e => setTblFilterName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleTblSearch()}
            />
          </div>
        </div>
        )}

        {/* 집계 칩 */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
          <div style={{ padding: '5px 12px', background: 'rgba(255,255,255,0.06)', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>총 {tblTotal.toLocaleString()}건</div>
          <div style={{ padding: '5px 12px', background: 'rgba(110,231,183,0.15)', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#6ee7b7' }}>지급 +{tblSumPlus.toLocaleString()}장</div>
          <div style={{ padding: '5px 12px', background: 'rgba(248,113,113,0.15)', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#f87171' }}>차감 {tblSumMinus.toLocaleString()}장</div>
          <div style={{ padding: '5px 12px', background: 'rgba(99,102,241,0.15)', borderRadius: 999, fontSize: 12, fontWeight: 700, color: '#a5b4fc' }}>순잔액 +{(tblSumPlus + tblSumMinus).toLocaleString()}장</div>
        </div>

        {/* 테이블 */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <th style={{ padding: '9px 10px', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleTblSort('created_at')}>
                  일시 {tblSortIcon('created_at')}
                </th>
                <th style={{ padding: '9px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>대상</th>
                <th style={{ padding: '9px 10px', textAlign: 'left', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleTblSort('type_code')}>
                  타입 {tblSortIcon('type_code')}
                </th>
                <th style={{ padding: '9px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>방향</th>
                <th style={{ padding: '9px 10px', textAlign: 'right', whiteSpace: 'nowrap', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleTblSort('amount')}>
                  수량 {tblSortIcon('amount')}
                </th>
                <th style={{ padding: '9px 10px', textAlign: 'left', whiteSpace: 'nowrap' }}>소스</th>
                <th style={{ padding: '9px 10px', textAlign: 'left' }}>사유</th>
                <th style={{ padding: '9px 10px', textAlign: 'left', whiteSpace: 'nowrap', opacity: 0.6 }}>관리자</th>
              </tr>
            </thead>
            <tbody>
              {tblLoading ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>⏳ 조회 중...</td></tr>
              ) : tblLogs.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>조회 결과가 없습니다.</td></tr>
              ) : tblLogs.map((log, i) => (
                <tr key={log.id || i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', transition: 'background .15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', opacity: 0.7, fontSize: 12 }}>
                    {log.createdAt ? new Date(log.createdAt).toLocaleString('ko-KR', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
                  </td>
                  <td style={{ padding: '9px 10px', maxWidth: 160 }}>
                    {log.targetType === 'shop'
                      ? <span><span style={{ fontSize: 11, marginRight: 4, padding: '1px 5px', borderRadius: 6, background: 'rgba(251,191,36,0.2)', color: '#fbbf24' }}>🏦</span>{log.shopName || log.shopId || log.memberId}</span>
                      : <span>{log.memberName || log.memberId}</span>
                    }
                  </td>
                  <td style={{ padding: '9px 10px', whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 7px', borderRadius: 999, background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>{log.typeCode}</span>
                    {log.typeIsActive === false && <span style={{ marginLeft: 4, fontSize: 10, padding: '1px 5px', borderRadius: 6, background: 'rgba(239,68,68,0.2)', color: '#f87171' }}>삭제됨</span>}
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                    {log.amount > 0
                      ? <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(110,231,183,0.15)', color: '#6ee7b7' }}>지급</span>
                      : <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(248,113,113,0.15)', color: '#f87171' }}>차감</span>
                    }
                  </td>
                  <td style={{ padding: '9px 10px', textAlign: 'right', fontWeight: 800, whiteSpace: 'nowrap', color: log.amount > 0 ? '#6ee7b7' : '#f87171' }}>
                    {log.amount > 0 ? '+' : ''}{log.amount}
                  </td>
                  <td style={{ padding: '9px 10px', whiteSpace: 'nowrap', opacity: 0.65, fontSize: 12 }}>{log.source || '-'}</td>
                  <td style={{ padding: '9px 10px', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', opacity: 0.8 }}>{log.description || '-'}</td>
                  <td style={{ padding: '9px 10px', opacity: 0.45, fontSize: 11, whiteSpace: 'nowrap' }}>{log.adminId || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 페이지네이션 */}
        {tblTotal > tblPageSize && (() => {
          const totalPages = Math.ceil(tblTotal / tblPageSize);
          const pages = [];
          const start = Math.max(1, tblPage - 2);
          const end   = Math.min(totalPages, tblPage + 2);
          for (let p = start; p <= end; p++) pages.push(p);
          return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6, marginTop: 16, flexWrap: 'wrap' }}>
              {!isMobile && <button onClick={() => handleTblPage(1)} disabled={tblPage === 1} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 12px', fontSize: 13, opacity: tblPage === 1 ? 0.3 : 1 }}>◀◀</button>}
              <button onClick={() => handleTblPage(tblPage - 1)} disabled={tblPage === 1} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 14px', fontSize: 13, opacity: tblPage === 1 ? 0.3 : 1 }}>◀</button>
              {start > 1 && <span style={{ opacity: 0.4, fontSize: 12 }}>...</span>}
              {pages.map(p => (
                <button key={p} onClick={() => handleTblPage(p)}
                  style={{ ...btnStyle(p === tblPage ? 'rgba(59,130,246,0.8)' : 'rgba(255,255,255,0.08)'), padding: '7px 12px', fontSize: 13, minWidth: 36 }}>
                  {p}
                </button>
              ))}
              {end < totalPages && <span style={{ opacity: 0.4, fontSize: 12 }}>...</span>}
              <button onClick={() => handleTblPage(tblPage + 1)} disabled={tblPage === totalPages} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 14px', fontSize: 13, opacity: tblPage === totalPages ? 0.3 : 1 }}>▶</button>
              {!isMobile && <button onClick={() => handleTblPage(totalPages)} disabled={tblPage === totalPages} style={{ ...btnStyle('rgba(255,255,255,0.08)'), padding: '7px 12px', fontSize: 13, opacity: tblPage === totalPages ? 0.3 : 1 }}>▶▶</button>}
              <span style={{ fontSize: 12, opacity: 0.5, marginLeft: 4 }}>{tblPage}/{totalPages}{!isMobile && ` 페이지`} · {tblTotal}건</span>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
