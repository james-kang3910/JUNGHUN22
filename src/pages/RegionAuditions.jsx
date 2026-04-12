/**
 * RegionAuditions — 지역 오디션 목록
 * /r/:regionId/auditions
 * 해당 지역 오디션만 표시. 비소속 회원은 참여 안내 표시.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getMe } from '../lib/authStore';
import { getAuditions } from '../lib/storageAdapter';
import { canApplyToAudition } from '../lib/permissions';

function formatDeadline(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  } catch {
    return null;
  }
}

function StatusBadge({ status, type, published }) {
  if (type === 'NOTICE' && !published) {
    return <span className="su-badge" style={{ background: '#f1f5f9', color: '#64748b' }}>준비중</span>;
  }
  if (status === 'OPEN') {
    return <span className="su-badge su-badge--open">모집중</span>;
  }
  if (status === 'CLOSED') {
    return <span className="su-badge su-badge--closed">마감</span>;
  }
  return <span className="su-badge">{status}</span>;
}

export default function RegionAuditions() {
  const { regionId } = useRegion();
  const navigate = useNavigate();
  const outletCtx = useOutletContext() || {};
  const selectedDistrictId = outletCtx.selectedDistrictId || '';

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 현재 로그인 회원 지역 확인
  const me = getMe();
  const myRegionId = me?.regionId || me?.region_id || null;
  const isSameRegion = myRegionId === regionId;

  // 페이지 수준 존재: 이 페이지 자체는 regionId에 소속된 오디션만
  // 보여주도록 API에서 필터링됨.
  // 지원가능 여부는 커드 렬더링 시 canApplyToAudition으로 판단.

  useEffect(() => {
    if (!regionId) return;
    load();
  }, [regionId, selectedDistrictId]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const opts = { regionId };
      if (selectedDistrictId) opts.districtId = selectedDistrictId;
      const data = await getAuditions(opts);
      setItems(Array.isArray(data) ? data : (data.auditions || []));
    } catch (e) {
      console.error('[RegionAuditions] load error:', e);
      setError('오디션 목록을 불러오지 못했습니다.');
    } finally {
      setLoading(false);
    }
  }

  // SSOT 이벤트 수신
  useEffect(() => {
    const onChanged = () => load();
    window.addEventListener('su:ssot:changed', onChanged);
    return () => window.removeEventListener('su:ssot:changed', onChanged);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regionId, selectedDistrictId]);

  if (loading) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--c-tx-s)' }}>
        불러오는 중...
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '40px 20px', textAlign: 'center', color: '#ef4444' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={{ padding: '16px 16px 32px' }}>
      {/* 비소속 회원 안내 */}
      {me && !isSameRegion && (
        <div style={{
          marginBottom: 16, padding: '12px 16px', borderRadius: 12,
          background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
          fontSize: 13, color: '#b45309', display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span>⚠️</span>
          <span>타 지역 회원는 이 오디션에 지원할 수 없습니다. 열람은 가능합니다.</span>
        </div>
      )}

      {items.length === 0 ? (
        <div style={{
          padding: '48px 20px',
          textAlign: 'center',
          color: 'var(--c-tx-s)',
          fontSize: 14,
        }}>
          등록된 오디션이 없습니다.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map(item => {
            const id = item.auditionId || item.audition_id || item.id;
            const startDate = formatDeadline(item.startAt || item.start_at);
            const endDate = formatDeadline(item.endAt || item.end_at);
            const deadline = formatDeadline(item.deadline);
            let periodText = '';
            if (startDate && endDate) periodText = `${startDate} ~ ${endDate}`;
            else if (deadline) periodText = `마감: ${deadline}`;

            // 지원 가능 여부 (permissions 모듈 사용)
            const applyCheck = canApplyToAudition(item, me);
            const canApply = applyCheck.allowed;
            // 구/군 제한: 아직 회원 districtId 미구현, 향후 활성화
            // TODO: 회원별 districtId 등록 UI 구현 완료 후 canApplyToAudition 안의 district 체크 주석 해제

            return (
              <div
                key={id}
                className="su-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/audition/${id}`)}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <span style={{
                    fontSize: 15, fontWeight: 700, color: 'var(--c-tx-h)', flex: 1,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    maxWidth: '100%',
                    wordBreak: 'break-all',
                    display: 'block',
                  }}>
                    {item.title || '제목 없음'}
                  </span>
                  <StatusBadge status={item.status} type={item.type} published={item.published !== undefined ? item.published : true} />
                  {/* 지원 불가 배지 */}
                  {me && !canApply && (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#b45309', border: '1px solid rgba(245,158,11,0.25)', whiteSpace: 'nowrap' }}>
                      🔒 지원불가
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', fontSize: 12, color: 'var(--c-tx-s)' }}>
                  {item.type && item.type !== 'FREE' && (
                    <span style={{ background: 'var(--c-primary-t, #ECFEFF)', color: 'var(--c-primary, #0E7490)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                      {item.type === 'NOTICE' ? '공지형' : item.type}
                    </span>
                  )}
                  {/* 구/군 제한 표시 */}
                  {item.districtId && (
                    <span style={{ background: 'rgba(14,116,144,0.08)', color: 'var(--c-primary)', padding: '2px 8px', borderRadius: 999, fontWeight: 600 }}>
                      📍 {item.districtId}
                    </span>
                  )}
                  {periodText && <span>{periodText}</span>}
                </div>
                {item.description && (
                  <div style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: 'var(--c-tx-s)',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    wordBreak: 'break-all',
                    maxWidth: '100%',
                  }}>
                    {item.description}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
