/**
 * RegionLayout
 * 
 * 지역 허브의 공통 껍데기.
 * PageHeader + 지역 선택 드롭다운 + 탭바(고정) + Outlet
 * 
 * 라우트 구조:
 *   /r/:regionId          → index → RegionHub
 *   /r/:regionId/board    → RegionBoard
 *   /r/:regionId/notices  → RegionNotices
 *   /r/:regionId/missions → Missions
 *   /r/:regionId/shops    → RegionShops
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Outlet, useParams, useNavigate, useLocation } from 'react-router-dom';
import { RegionProvider } from '../context/RegionContext';
import PageHeader from '../components/PageHeader';
import RegionSearchModal from '../components/RegionSearchModal';
import * as storageAdapter from '../lib/storageAdapter';
import useAutoRefresh from '../hooks/useAutoRefresh';

const REGION_NAME_CACHE_KEY = 'su_region_name_cache_v1';

function readRegionNameCache() {
  try {
    const parsed = JSON.parse(localStorage.getItem(REGION_NAME_CACHE_KEY) || '{}');
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) {
    return {};
  }
}

function writeRegionNameCache(rows) {
  try {
    const prev = readRegionNameCache();
    const next = { ...prev };
    (Array.isArray(rows) ? rows : []).forEach((region) => {
      const id = String(region?.id || region?.regionId || region?.region_id || '').trim();
      const name = String(region?.name || region?.regionName || region?.region_name || '').trim();
      if (id && name) next[id] = name;
    });
    localStorage.setItem(REGION_NAME_CACHE_KEY, JSON.stringify(next));
  } catch (e) {
    // noop
  }
}

function getCachedRegionName(regionId) {
  const id = String(regionId || '').trim();
  if (!id) return '';
  try {
    const selectedId = String(localStorage.getItem('selectedRegionId') || '').trim();
    const selectedName = String(localStorage.getItem('selectedRegionName') || '').trim();
    if (selectedId && selectedId === id && selectedName) return selectedName;
  } catch (e) {
    // noop
  }
  const cached = readRegionNameCache();
  return String(cached[id] || '').trim();
}

const TABS = [
  { key: 'home',      label: '지역홈',      path: '' },
  { key: 'intro',     label: '지역소개', path: '/intro' },
    // { key: 'events',    label: '이벤트',  path: '/events' }, // 탭 노출만 제거
  { key: 'festivals', label: '지역행사', path: '/festivals' },
  { key: 'community', label: '커뮤니티', path: '/board' },
];

// 더보기 서브메뉴 항목 (기존 기능 접근 보호)
const MORE_ITEMS = [
  { label: '커뮤니티', path: '/board',      icon: '💬' },
  { label: '지역미션/이벤트', path: '/missions',   icon: '🎯' },
  { label: '지역채팅', path: '/chat',      icon: '💬' },
  { label: '공지사항', path: '/notices',    icon: '📋' },
  { label: '지역방송', path: '/broadcasts', icon: '📺' },
  { label: '오디션',   path: '/auditions',  icon: '🎤' },
  { label: '지역뉴스', path: '/news',       icon: '📰' },
];

const TAB_TITLE_MAP = {
  '':            null,         // regionName 사용
  '/intro':      '지역소개',
  '/events':     '이벤트',
  '/apt':        '아파트',
  '/shops':      '상권',
  '/flyers':     '전단',
  '/festivals':  '지역행사',
  // 더보기 항목 (기존 유지)
  '/board':      '커뮤니티',
  '/missions':   '지역미션/이벤트',
  '/chat':       '지역채팅',
  '/notices':    '공지사항',
  '/broadcasts': '지역방송',
  '/auditions':  '지역오디션',
  '/news':       '지역뉴스',
};

export default function RegionLayout() {
  const { regionId } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [regionName, setRegionName] = useState(() => {
    const id = String(regionId || '').trim();
    if (!id) return '';
    return getCachedRegionName(id) || '지역';
  });
  const [regions, setRegions] = useState([]);

  // 기존 Outlet 호환 유지를 위해 빈 값 유지
  const [districts] = useState([]);
  const [selectedDistrictId] = useState('');
  const [selectedRegionOptionId, setSelectedRegionOptionId] = useState(regionId || '');
  const [searchOpen, setSearchOpen] = useState(false);

  const isSameRegionList = useCallback((left, right) => {
    if (left === right) return true;
    if (!Array.isArray(left) || !Array.isArray(right)) return false;
    if (left.length !== right.length) return false;
    return left.every((region, index) => {
      const next = right[index];
      if (!next) return false;
      const leftId = String(region?.id || region?.regionId || region?.region_id || '');
      const rightId = String(next?.id || next?.regionId || next?.region_id || '');
      return leftId === rightId
        && String(region?.name || '') === String(next?.name || '')
        && String(region?.province || region?.sido || '') === String(next?.province || next?.sido || '')
        && region?.isPublic === next?.isPublic;
    });
  }, []);

  const loadRegions = useCallback(() => {
    if (!regionId) return Promise.resolve();
    return storageAdapter.getRegions()
      .then(all => {
        const visibleRegions = (all || []).filter((region) => region?.isPublic !== false);
        writeRegionNameCache(visibleRegions);
        setRegions((prev) => (isSameRegionList(prev, visibleRegions) ? prev : visibleRegions));
        const found = visibleRegions.find(r =>
          String(r.id || r.regionId || r.region_id) === String(regionId)
        );
        if (found) {
          const foundId = String(found.id || found.regionId || found.region_id || '').trim();
          const nextRegionName = String(found.name || found.regionName || regionId || '').trim();
          setRegionName((prev) => (prev === nextRegionName ? prev : nextRegionName));
          try {
            if (foundId) localStorage.setItem('selectedRegionId', foundId);
            if (nextRegionName) localStorage.setItem('selectedRegionName', nextRegionName);
          } catch (e) {
            // noop
          }
        } else if (visibleRegions.length > 0) {
          // URL의 regionId가 DB에 없음 → localStorage 오래된 ID 자동 갱신
          const savedId = localStorage.getItem('selectedRegionId');
          if (savedId === regionId || !savedId) {
            const fallback = visibleRegions[0];
            const fallbackId = String(fallback.id || fallback.regionId || fallback.region_id);
            localStorage.setItem('selectedRegionId', fallbackId);
            if (fallback.name) localStorage.setItem('selectedRegionName', fallback.name);
            navigate(`/r/${fallbackId}`, { replace: true });
          } else {
            setRegionName('지역');
          }
        }
      })
      .catch(() => {
        setRegions((prev) => (prev.length === 0 ? prev : []));
        setRegionName((prev) => (prev === '지역' ? prev : '지역'));
      });
  }, [isSameRegionList, regionId, navigate]);

  useEffect(() => {
    loadRegions();
  }, [loadRegions]);

  useAutoRefresh(loadRegions, { enabled: !!regionId, intervalMs: 120000 });

  useEffect(() => {
    const nextId = String(regionId || '').trim();
    setSelectedRegionOptionId(nextId);
    if (!nextId) {
      setRegionName('');
      return;
    }
    const cachedName = getCachedRegionName(nextId);
    if (cachedName) {
      setRegionName((prev) => (prev === cachedName ? prev : cachedName));
    } else {
      setRegionName((prev) => (prev === '지역' ? prev : '지역'));
    }
  }, [regionId]);

  const regionOptions = useMemo(() => {
    return regions.map((region) => ({
      id: String(region.id || region.regionId || region.region_id || ''),
      label: region.province && region.province !== region.name
        ? `${region.name} · ${region.province}`
        : region.name,
    })).filter((region) => region.id);
  }, [regions]);

  const handleRegionChange = useCallback((e) => {
    const id = e.target.value;
    setSelectedRegionOptionId(id);
    if (!id || String(id) === String(regionId)) return;
    navigate(`/r/${id}`);
  }, [navigate, regionId]);

  const getTabPath = (tabPath) => `/r/${regionId}${tabPath}`;

  const isActive = (tabPath) => {
    const full = getTabPath(tabPath);
    if (tabPath === '') {
      return pathname === full || pathname === `/r/${regionId}/`;
    }
    return pathname.startsWith(full);
  };

  const activeTab = TABS.find(t => {
    return t.path === ''
      ? (pathname === `/r/${regionId}` || pathname === `/r/${regionId}/`)
      : pathname.startsWith(`/r/${regionId}${t.path}`);
  });
  const regionRootPath = `/r/${regionId}`;
  const isRegionRoot = pathname === regionRootPath || pathname === `${regionRootPath}/`;
  const handleHeaderBack = () => {
    // 지역 하위 페이지에서는 지역홈으로, 지역홈에서는 지역선택으로 이동
    if (!isRegionRoot) {
      navigate(regionRootPath, { replace: true });
      return;
    }
    navigate('/region', { replace: true });
  };
  const headerTitle = (activeTab && TAB_TITLE_MAP[activeTab.path])
    || MORE_ITEMS.find(m => pathname.startsWith(`/r/${regionId}${m.path}`))?.label
    || regionName;

  return (
    <RegionProvider regionId={regionId}>
      {/* 공통 헤더 */}
      <PageHeader
        title={headerTitle}
        onBack={handleHeaderBack}
        className="su-regionHeader"
      />

      {/* 다른 지역 이동 + 검색 */}
      <div style={{
        padding: '5px 14px',
        borderBottom: '1px solid #DDE3EA',
        background: '#FFFFFF',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}>
        <span style={{ fontSize: 13, color: '#637074', whiteSpace: 'nowrap' }}>📍 다른 지역 보기</span>
        <select
          value={selectedRegionOptionId}
          onChange={handleRegionChange}
          style={{
            flex: 1,
            minWidth: 0,
            padding: '6px 10px',
            borderRadius: 8,
            border: '1px solid #DDE3EA',
            background: '#F8FAFC',
            color: '#0D1B21',
            fontSize: 14,
            fontWeight: selectedDistrictId ? 600 : 400,
            outline: 'none',
            cursor: 'pointer',
          }}
        >
          {regionOptions.length === 0
            ? <option value="">등록된 지역이 없습니다</option>
            : regionOptions.map(region => (
                <option key={region.id} value={region.id}>{region.label}</option>
              ))
          }
        </select>
        <button
          type="button"
          aria-label="지역 검색"
          title="지역 검색"
          onClick={() => setSearchOpen(true)}
          style={{
            flexShrink: 0,
            width: 38,
            height: 34,
            borderRadius: 8,
            border: '1px solid #DDE3EA',
            background: '#F8FAFC',
            color: '#0E7490',
            fontSize: 16,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🔍
        </button>
      </div>

      <RegionSearchModal
        regionId={regionId}
        regionName={regionName}
        open={searchOpen}
        onClose={() => setSearchOpen(false)}
      />

      {/* 탭바 */}
      <nav className="su-regionTabBar">
        {TABS.map(tab => {
          const active = isActive(tab.path);
          return (
            <button
              key={tab.key}
              className={`su-regionTab${active ? ' is-active' : ''}`}
              onClick={() => navigate(getTabPath(tab.path))}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </nav>

      {/* 탭별 콘텐츠 */}
      <Outlet context={{ selectedDistrictId, districts, regionName }} />
    </RegionProvider>
  );
}

