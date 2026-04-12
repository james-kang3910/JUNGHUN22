import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAdminAuthenticatedLocal, getAdminToken } from '../../lib/adminAuth';
import Toast from './components/Toast';

export default function AdminBackupTools() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', type: 'success' });
  const [preview, setPreview] = useState(null);
  
  // 백업 전용 인증
  const [isBackupAuthenticated, setIsBackupAuthenticated] = useState(false);
  const [backupPassword, setBackupPassword] = useState('');
  const [authError, setAuthError] = useState('');

  React.useEffect(() => {
    if (!isAdminAuthenticatedLocal()) {
      navigate('/admin/login', { replace: true });
    }
  }, [navigate]);

  const handleBackupAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/admin/backup/verify`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${getAdminToken()}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ password: backupPassword }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.ok) {
        setIsBackupAuthenticated(true);
        setAuthError('');
        setBackupPassword('');
      } else {
        setAuthError(data.error || '비밀번호가 올바르지 않습니다.');
        setBackupPassword('');
      }
    } catch (err) {
      console.error('[AdminBackupTools] Auth failed:', err);
      setAuthError('서버 연결 실패. 다시 시도해주세요.');
      setBackupPassword('');
    }
  };

  /**
   * 전체 데이터 백업
   */
  const exportAllData = async () => {
    setLoading(true);
    try {
      const token = getAdminToken();
      const API_BASE = import.meta.env.VITE_API_BASE || '';

      // 서버의 단일 백업 API 사용 (모든 테이블 포함)
      const res = await fetch(`${API_BASE}/api/admin/backup`, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`서버 오류: ${res.status}`);
      const json = await res.json();
      const tables = json.backup || json.data || {};

      const counts = {};
      for (const [k, v] of Object.entries(tables)) {
        counts[k] = Array.isArray(v) ? v.length : 0;
      }

      const backup = {
        version: '2.0.0',
        exportedAt: new Date().toISOString(),
        exportedBy: 'admin',
        data: tables,
        counts,
      };

      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `admin_backup_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      setToast({ open: true, message: `백업 완료: 총 ${total}개 항목 (${Object.keys(counts).length}개 테이블)`, type: 'success' });
    } catch (err) {
      console.error('[AdminBackupTools] Export failed:', err);
      setToast({ open: true, message: `백업 실패: ${err.message}`, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * 백업 파일 복원
   */
  const importFromFile = async (file) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const backup = JSON.parse(e.target.result);
        
        // 유효성 검증
        if (!backup.version || !backup.data) {
          throw new Error('백업 파일 형식이 올바르지 않습니다');
        }

        setPreview(backup);
        setToast({ 
          open: true, 
          message: `백업 파일 로드 완료. 미리보기에서 확인 후 복원하세요.`, 
          type: 'success' 
        });
      } catch (err) {
        setToast({ open: true, message: `파일 읽기 실패: ${err.message}`, type: 'error' });
      }
    };
    reader.readAsText(file);
  };

  /**
   * SQLite (camelCase) → Postgres (snake_case) 필드명 변환
   */
  const convertToSnakeCase = (obj) => {
    if (!obj || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(convertToSnakeCase);
    
    const result = {};
    for (const [key, value] of Object.entries(obj)) {
      // camelCase → snake_case 변환
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      result[snakeKey] = value;
      // 원본 키도 유지 (호환성)
      if (key !== snakeKey) {
        result[key] = value;
      }
    }
    return result;
  };

  /**
   * 복원 실행
   */
  const executeRestore = async () => {
    if (!preview) return;

    const confirmMsg = `다음 데이터를 복원합니다:\n${Object.entries(preview.counts).map(([k,v]) => `- ${k}: ${v}개`).join('\n')}\n\n계속하시겠습니까?`;
    if (!window.confirm(confirmMsg)) return;

    setLoading(true);
    const results = { success: 0, failed: 0, errors: [] };

    try {
      const token = getAdminToken();
      const API_BASE = import.meta.env.VITE_API_BASE || '';
      
      // 서버에서 한 번에 처리 (UPSERT)
      const response = await fetch(`${API_BASE}/api/admin/restore`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preview.data)
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      results.success = result.restored || 0;
      results.failed = result.failed || 0;
      results.errors = result.errors || [];

      alert(`복원 완료\n성공: ${results.success}건\n실패: ${results.failed}건${results.errors.length ? '\n\n오류:\n' + results.errors.join('\n') : ''}`);
      setPreview(null);
    } catch (err) {
      alert(`복원 실패: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 스타일
  const pageStyle = { minHeight: '100vh', background: '#0f0f14', padding: '20px 16px 100px' };
  const headerStyle = { marginBottom: 24 };
  const titleStyle = { fontSize: 24, fontWeight: 800, margin: 0 };
  const sectionStyle = { padding: 20, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, marginBottom: 20, background: 'rgba(255,255,255,0.02)' };
  const sectionTitleStyle = { fontWeight: 800, marginBottom: 16, fontSize: 16 };
  const buttonStyle = { padding: '12px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };
  const primaryBtnStyle = { ...buttonStyle, background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)', color: '#fff' };
  const secondaryBtnStyle = { ...buttonStyle, background: 'rgba(255,255,255,0.1)', color: '#fff' };
  const dangerBtnStyle = { ...buttonStyle, background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: '#fff' };
  const previewStyle = { padding: 16, background: 'rgba(0,0,0,0.4)', borderRadius: 8, maxHeight: 500, overflow: 'auto', fontSize: 12, whiteSpace: 'pre-wrap', wordBreak: 'break-word', marginTop: 16 };
  const authCardStyle = { maxWidth: 400, margin: '60px auto', padding: 24, borderRadius: 16, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(30,30,40,0.95)' };
  const inputStyle = { width: '100%', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: 'inherit', fontSize: 15, outline: 'none' };

  // 백업 인증되지 않은 경우 비밀번호 입력 화면 표시
  if (!isBackupAuthenticated) {
    return (
      <div style={pageStyle}>
        <div style={authCardStyle}>
          <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 22 }}>🔐 백업 기능 인증</h2>
          <p style={{ textAlign: 'center', fontSize: 13, opacity: 0.6, marginBottom: 24 }}>
            백업/복원 기능은 별도 비밀번호가 필요합니다.
          </p>
          <form onSubmit={handleBackupAuth} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{ fontSize: 14, fontWeight: 600 }}>백업 전용 비밀번호</label>
            <input
              type="password"
              value={backupPassword}
              onChange={(e) => setBackupPassword(e.target.value)}
              placeholder="백업 비밀번호 입력"
              style={inputStyle}
              autoFocus
            />
            <button type="submit" style={{ ...primaryBtnStyle, width: '100%', marginTop: 8 }}>
              인증하기
            </button>
            {authError && (
              <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginTop: 4 }}>
                {authError}
              </div>
            )}
            <button 
              type="button"
              onClick={() => navigate('/admin')} 
              style={{ ...secondaryBtnStyle, width: '100%', marginTop: 4 }}
            >
              ← 관리자 메인으로
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <header style={headerStyle}>
        <h1 style={titleStyle}>💾 백업·임포트 도구</h1>
        <p style={{ fontSize: 13, opacity: 0.6, margin: '8px 0 0' }}>
          전체 데이터 백업 및 복원
        </p>
      </header>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📤 데이터 내보내기 (Export)</div>
        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
          지역, 상점, 미션, 이벤트, 오디션, 방송, 회원 등 모든 데이터를 JSON 파일로 백업합니다.
        </p>
        <button onClick={exportAllData} style={primaryBtnStyle} disabled={loading}>
          {loading ? '백업 중...' : '💾 전체 데이터 백업'}
        </button>
      </div>

      <div style={sectionStyle}>
        <div style={sectionTitleStyle}>📥 데이터 가져오기 (Import)</div>
        <p style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
          백업 파일을 선택하고 미리보기 후 복원합니다. 기존 데이터는 덮어씌워집니다.
        </p>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <label style={{ ...secondaryBtnStyle, cursor: 'pointer' }}>
            📂 백업 파일 선택
            <input 
              type="file" 
              accept="application/json" 
              style={{ display: 'none' }} 
              onChange={(e) => importFromFile(e.target.files?.[0])} 
            />
          </label>
          {preview && (
            <button onClick={executeRestore} style={dangerBtnStyle} disabled={loading}>
              {loading ? '복원 중...' : '⚠️ 복원 실행'}
            </button>
          )}
        </div>

        {preview && (
          <div style={previewStyle}>
            <div style={{ fontWeight: 800, marginBottom: 12, fontSize: 14 }}>
              📋 백업 파일 미리보기
            </div>
            <div style={{ marginBottom: 12, opacity: 0.9 }}>
              버전: {preview.version} | 백업 시간: {new Date(preview.exportedAt).toLocaleString()}
            </div>
            <div style={{ marginBottom: 12 }}>
              {Object.entries(preview.counts).map(([key, count]) => (
                <div key={key} style={{ marginBottom: 4 }}>
                  - {key}: <strong>{count}</strong>개
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8, maxHeight: 300, overflow: 'auto' }}>
              <pre>{JSON.stringify(preview, null, 2)}</pre>
            </div>
          </div>
        )}
      </div>

      {toast.open && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, open: false })}
        />
      )}
    </div>
  );
}
