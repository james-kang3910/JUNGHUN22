import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import * as storageAdapter from '../lib/storageAdapter';
import ContextHeader from '../components/ContextHeader';

console.log('[PAGE]', 'NoticeDetail.jsx (active)');

const panelStyle = {
  marginTop: 12,
  padding: 16,
  borderRadius: 16,
  border: "1px solid #DDE3EA",
  background: "#FFFFFF",
};

export default function NoticeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const [notice, setNotice] = useState(location.state?.notice || null);
  const [loading, setLoading] = useState(!notice);
  const [allNotices, setAllNotices] = useState([]);
  const [showRelatedNotices, setShowRelatedNotices] = useState(false);

  // 공지사항 로드
  useEffect(() => {
    let mounted = true;
    async function loadNotice() {
      if (notice) {
        setLoading(false);
        return;
      }

      try {
        const result = await storageAdapter.getNoticeById(id);
        if (mounted) {
          setNotice(result);
        }
      } catch (e) {
        console.error('[NoticeDetail] Failed to load notice:', e);
        if (mounted) {
          alert('공지사항을 불러올 수 없습니다');
          navigate('/notices', { replace: true });
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    loadNotice();
    return () => { mounted = false; };
  }, [id, notice, navigate]);

  // 전체 목록 로드 (이전/다음 네비게이션용)
  useEffect(() => {
    let mounted = true;
    async function loadAllNotices() {
      try {
        const result = await storageAdapter.getNotices();
        if (mounted) {
          const sorted = [...(Array.isArray(result) ? result : [])].sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          });
          setAllNotices(sorted);
        }
      } catch (e) {
        console.error('[NoticeDetail] Failed to load all notices:', e);
        if (mounted) setAllNotices([]);
      }
    }
    loadAllNotices();
    return () => { mounted = false; };
  }, []);

  // 현재 공지의 인덱스
  const currentIndex = allNotices.findIndex(n => String(n.id) === String(id));
  const prevNotice = currentIndex > 0 ? allNotices[currentIndex - 1] : null;
  const nextNotice = currentIndex < allNotices.length - 1 ? allNotices[currentIndex + 1] : null;

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#E8EDF2',
        color: '#2C3E45',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>로딩 중...</div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#E8EDF2',
        color: '#2C3E45',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ fontSize: 14, opacity: 0.7 }}>공지사항을 찾을 수 없습니다</div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#E8EDF2',
      color: '#0D1B21',
      paddingBottom: 80,
    }}>
      <ContextHeader title="공지사항" onBack={() => navigate('/notices')} />

      <div style={{ padding: 16 }}>
        {/* 공지사항 내용 */}
        <section style={panelStyle}>
          {/* 태그 */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {notice.isPinned && (
              <span style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(220,38,38,0.1)',
                color: '#DC2626',
                fontWeight: 700,
              }}>
                📌 고정
              </span>
            )}
            {notice.important && !notice.isPinned && (
              <span style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(200,168,75,0.12)',
                color: '#92650A',
                fontWeight: 700,
              }}>
                ⭐ 중요
              </span>
            )}
            {notice.category && (
              <span style={{
                fontSize: 11,
                padding: '4px 10px',
                borderRadius: 6,
                background: 'rgba(12,84,96,0.10)',
                color: '#0C5460',
              }}>
                {notice.category}
              </span>
            )}
          </div>

          {/* 제목 */}
          <h1 style={{
            fontSize: 20,
            fontWeight: 900,
            lineHeight: 1.4,
            marginBottom: 12,
            wordBreak: 'keep-all',
            overflowWrap: 'break-word',
            minWidth: 0,
            whiteSpace: 'normal',
            WebkitLineClamp: 'unset',
            display: 'block',
          }}>
            {notice.title}
          </h1>

          {/* 메타 정보 */}
          <div style={{
            display: 'flex',
            gap: 12,
            fontSize: 13,
            opacity: 0.7,
            paddingBottom: 16,
            borderBottom: '1px solid #DDE3EA',
            marginBottom: 16,
          }}>
            <div>✍️ {notice.author || '관리자'}</div>
            <div>📅 {new Date(notice.createdAt).toLocaleDateString('ko-KR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</div>
          </div>

          {/* 본문 */}
          <div style={{
            fontSize: 15,
            lineHeight: 1.7,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {notice.content || '내용이 없습니다.'}
          </div>

          {/* 첨부파일 */}
          {notice.attachments && Array.isArray(notice.attachments) && notice.attachments.length > 0 && (
            <div style={{
              marginTop: 24,
              padding: 16,
              borderRadius: 10,
              background: '#EEF1F5',
              borderTop: '1px solid #DDE3EA',
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>📎 첨부파일</div>
              {notice.attachments.map((file, idx) => (
                <a
                  key={idx}
                  href={file.url}
                  download
                  style={{
                    display: 'block',
                    padding: '8px 12px',
                    borderRadius: 8,
                    background: '#E0F4F7',
                    color: '#0C5460',
                    textDecoration: 'none',
                    marginBottom: 6,
                    fontSize: 13,
                  }}
                >
                  📄 {file.name}
                </a>
              ))}
            </div>
          )}
        </section>

        {/* 다른 공지 토글 */}
        {(prevNotice || nextNotice) && (
          <button
            type="button"
            onClick={() => setShowRelatedNotices((prev) => !prev)}
            style={{
              width: '100%',
              marginTop: 12,
              padding: '11px 12px',
              borderRadius: 10,
              border: '1px solid #DDE3EA',
              background: '#FFFFFF',
              color: '#0C5460',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {showRelatedNotices ? '다른 공지 닫기' : '다른 공지 보기'}
          </button>
        )}

        {/* 이전/다음 네비게이션 (토글 시 표시) */}
        {showRelatedNotices && (prevNotice || nextNotice) && (
          <section style={{ ...panelStyle, display: 'grid', gap: 8 }}>
            {prevNotice && (
              <button
                onClick={() => navigate(`/notices/${prevNotice.id}`, { state: { notice: prevNotice } })}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(12,84,96,0.07)',
                  border: '1px solid #DDE3EA',
                  color: '#2C3E45',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>⬆️ 이전 공지</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{prevNotice.title}</div>
              </button>
            )}
            {nextNotice && (
              <button
                onClick={() => navigate(`/notices/${nextNotice.id}`, { state: { notice: nextNotice } })}
                style={{
                  padding: '12px 14px',
                  borderRadius: 10,
                  background: 'rgba(12,84,96,0.07)',
                  border: '1px solid #DDE3EA',
                  color: '#2C3E45',
                  textAlign: 'left',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, opacity: 0.6, marginBottom: 4 }}>⬇️ 다음 공지</div>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{nextNotice.title}</div>
              </button>
            )}
          </section>
        )}

        {/* 목록으로 버튼 */}
        <button
          onClick={() => navigate('/notices')}
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: 10,
            background: 'linear-gradient(135deg, #0E7490, #0C6480)',
            border: 'none',
            color: '#fff',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            marginTop: 12,
          }}
        >
          목록으로
        </button>
      </div>
    </div>
  );
}
