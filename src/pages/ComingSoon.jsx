import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ComingSoon({ pageName = '페이지' }) {
  const navigate = useNavigate();

  return (
    <div className="su-page" style={{ 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      padding: 20,
      textAlign: 'center'
    }}>
      <div style={{ fontSize: 64, marginBottom: 20 }}>🚧</div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
        {pageName} 준비중
      </h1>
      <p style={{ fontSize: 14, opacity: 0.7, marginBottom: 32 }}>
        서비스 준비 중입니다.<br />
        빠른 시일 내에 만나뵙겠습니다.
      </p>
      <button
        onClick={() => navigate('/home')}
        style={{
          padding: '12px 24px',
          borderRadius: 10,
          background: 'linear-gradient(135deg, #0C5460 0%, #083D4A 100%)',
          color: '#fff',
          border: 'none',
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        이전 페이지로 돌아가기
      </button>
    </div>
  );
}
