/**
 * PV3 완전 복원: 지역 공지사항 페이지
 * 
 * PV3의 RegionNotices.jsx를 서버 DB 기반으로 완전 복원합니다.
 */

import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getRegionNotices, formatNotice, getNoticeScopeText } from '../lib/noticeUtils.js';
import useAutoRefresh from '../hooks/useAutoRefresh';

// 라이트 스타일 상수
const panelStyle = {
  marginTop: 12,
  padding: 16,
  borderRadius: 'var(--r-card, 16px)',
  border: '1px solid var(--c-border, #E2E8F0)',
  background: 'var(--c-surface, #FFFFFF)',
  boxShadow: 'var(--sh-xs, 0 1px 4px rgba(0,0,0,0.04))',
};

const cardStyle = {
  padding: '14px 16px',
  borderRadius: 'var(--r-card, 16px)',
  border: '1px solid var(--c-border, #E2E8F0)',
  background: 'var(--c-surface, #FFFFFF)',
  boxShadow: 'var(--sh-xs, 0 1px 4px rgba(0,0,0,0.04))',
  cursor: 'pointer',
  transition: 'all 0.2s',
};

export default function RegionNotices() {
  const { regionId } = useRegion();
  const outletCtx = useOutletContext() || {};
  const selectedDistrictId = outletCtx.selectedDistrictId || '';
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadNotices();
  }, [regionId, selectedDistrictId]);

  async function loadNotices(background = false) {
    if (!background) setLoading(true);
    try {
      const data = await getRegionNotices(regionId, selectedDistrictId || null);
      setNotices(data.map(formatNotice));
    } catch (error) {
      console.error('Failed to load notices:', error);
      if (!background) alert('공지사항을 불러오는데 실패했습니다.');
    } finally {
      if (!background) setLoading(false);
    }
  }

  useAutoRefresh(() => loadNotices(true), { enabled: !!regionId, intervalMs: 15000 });

  function handleNoticeClick(notice) {
    setSelectedNotice(formatNotice(notice));
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setSelectedNotice(null);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#E8EDF2',
      paddingBottom: 80,
    }}>
      <div style={{ padding: 16 }}>
        {/* 인콘텐츠 타이틀 행 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 14 }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, color: 'var(--c-tx-h, #0F172A)', paddingLeft: 11, borderLeft: '3px solid var(--c-primary, #0E7490)', margin: 0 }}>
            공지사항
          </h1>
          <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-primary, #0E7490)', background: 'var(--c-primary-t, #ECFEFF)', border: '1px solid rgba(14,116,144,0.20)', borderRadius: 999, padding: '3px 10px' }}>
            {notices.length}건
          </span>
        </div>
        {loading ? (
          <section style={{ ...panelStyle, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 14, opacity: 0.7 }}>공지사항을 불러오는 중...</div>
          </section>
        ) : notices.length === 0 ? (
          <section style={{ ...panelStyle, textAlign: 'center', padding: '48px 24px' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>📌</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-tx-h, #0F172A)', marginBottom: 8 }}>
              아직 새로운 소식이 없어요
            </div>
            <div style={{ fontSize: 13, color: 'var(--c-tx-s, #64748B)', lineHeight: 1.6 }}>
              공지가 등록되면 가장 먼저 알려드릴게요
            </div>
          </section>
        ) : (
          <section style={panelStyle}>
            <div style={{ display: 'grid', gap: 10 }}>
              {notices.map(notice => (
                <div
                  key={notice.id || notice.noticeId || notice.notice_id || notice.title}
                  onClick={() => handleNoticeClick(notice)}
                  style={cardStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#F0F4F8';
                    e.currentTarget.style.borderColor = '#C0CDD5';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = '#FFFFFF';
                    e.currentTarget.style.borderColor = '#DDE3EA';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 6 }}>
                    <div>
                      <div style={{
                        fontWeight: 800,
                        fontSize: 15,
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        minWidth: 0,
                        whiteSpace: 'normal',
                        WebkitLineClamp: 'unset',
                        display: 'block',
                        marginBottom: 4,
                        color: 'var(--c-tx-h, #0F172A)'
                      }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', marginRight: 6 }}>공지제목</span>
                        {notice.title}
                      </div>
                      {notice.content && (
                        <div style={{
                          fontSize: 13,
                          color: 'var(--c-tx-s, #64748B)',
                          lineHeight: 1.6,
                          wordBreak: 'break-all',
                          overflowWrap: 'break-word',
                          whiteSpace: 'pre-line',
                          marginBottom: 2,
                        }}>
                          <span style={{ fontSize: 11, fontWeight: 700, color: '#0ea5e9', marginRight: 6 }}>공지내용</span>
                          {notice.content.length > 120
                            ? notice.content.slice(0, 120) + '...'
                            : notice.content}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{
                    fontSize: 13,
                    color: '#2C3E45',
                    marginBottom: 8,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    lineHeight: 1.5,
                    wordBreak: 'break-all', // 긴 단어 강제 줄바꿈
                  }}>
                    {notice.content}
                  </div>

                  <div style={{
                    fontSize: 12,
                    color: '#637074',
                    display: 'flex',
                    gap: 12,
                  }}>
                    <span>{notice.author || '관리자'}</span>
                    <span>·</span>
                    <span>{notice.formattedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 공지사항 상세 모달 */}
      {showModal && selectedNotice && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={closeModal}
        >
          <div 
            onClick={e => e.stopPropagation()}
            style={{
              background: '#FFFFFF',
              borderRadius: 12,
              maxWidth: '800px',
              width: '90%',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              border: '1px solid #DDE3EA',
              color: '#0D1B21',
            }}
          >
            {/* 모달 헤더 */}
            <div style={{
              padding: 24,
              borderBottom: '1px solid #DDE3EA',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: selectedNotice.content && selectedNotice.content.trim() ? 2 : 0 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0ea5e9' }}>공지제목</span>
                <span style={{ fontSize: 20, fontWeight: 900, wordBreak: 'break-all', overflowWrap: 'break-word', minWidth: 0, whiteSpace: 'normal', WebkitLineClamp: 'unset', display: 'block' }}>{selectedNotice.title}</span>
              </div>
              <button 
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 28,
                  cursor: 'pointer',
                  color: '#9BA8AE',
                  padding: 0,
                  width: 32,
                  height: 32,
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>

            {/* 모달 바디 */}
            <div style={{
              padding: 24,
              overflowY: 'auto',
              flex: 1,
            }}>
              <div style={{
                display: 'flex',
                gap: 12,
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid #DDE3EA',
                fontSize: 13,
                color: '#637074',
              }}>
                <span style={{
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(14,116,144,0.10)',
                  color: 'var(--c-primary, #0E7490)',
                }}>
                  {getNoticeScopeText(selectedNotice)}
                </span>
                <span>{selectedNotice.author || '관리자'}</span>
                <span>·</span>
                <span>{selectedNotice.formattedDate}</span>
              </div>

              {selectedNotice.content && selectedNotice.content.trim() && (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#0ea5e9', marginTop: 2 }}>공지내용</span>
                  <div style={{ lineHeight: 1.8, color: '#2C3E45', whiteSpace: 'pre-wrap', fontSize: 14 }}>
                    {selectedNotice.content.split('\n').map((line, index) => (
                      <p key={index} style={{ margin: '0 0 12px 0', display: 'block' }}>{line}</p>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 모달 푸터 */}
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid #DDE3EA',
              display: 'flex',
              justifyContent: 'flex-end',
            }}>
              <button 
                onClick={closeModal}
                style={{
                  padding: '10px 24px',
                  background: 'rgba(14,116,144,0.08)',
                  border: 'none',
                  borderRadius: 8,
                  cursor: 'pointer',
                  fontSize: 14,
                  color: 'var(--c-primary, #0E7490)',
                  fontWeight: 600,
                }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
