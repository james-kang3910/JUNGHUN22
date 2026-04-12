import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as storageAdapter from "../../lib/storageAdapter";

// ★ 비밀번호 입력 컴포넌트 (보기 토글 포함)
const PasswordInput = ({ value, onChange, placeholder, style, autoFocus, id }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ ...style, paddingRight: 50 }}
        autoFocus={autoFocus}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: "absolute",
          right: 10,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          color: "rgba(255,255,255,0.6)",
          fontSize: 12,
          cursor: "pointer",
          padding: "4px 8px",
        }}
      >
        {showPassword ? "숨김" : "보기"}
      </button>
    </div>
  );
};

// API 에러 메시지 파싱 헬퍼 (checkStatus는 "API error 4xx: {json}" 형태로 throw)
function parseApiError(err) {
  try {
    const raw = err?.message || "";
    const jsonPart = raw.replace(/^API error \d+:\s*/, "");
    const parsed = JSON.parse(jsonPart);
    return parsed.error || raw;
  } catch {
    return err?.message || "오류가 발생했습니다.";
  }
}

export default function AdminLogin() {
  const navigate = useNavigate();

  // ── Step 상태 ──
  const [step, setStep] = useState(1); // 1: 회원 로그인, 2: 관리자 비밀번호
  const [memberInfo, setMemberInfo] = useState(null); // Step1 성공 후 저장

  // ── 입력값 ──
  const [email, setEmail] = useState("");
  const [memberPw, setMemberPw] = useState("");
  const [adminPw, setAdminPw] = useState("");

  // ── UI 상태 ──
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // 개발환경에서 자동 로그인 처리 (개발 편의용)
  useEffect(() => {
    if (!import.meta.env.DEV) return;
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        // 1) 일반 로그인 (개발용 admin/1234)
        const result = await storageAdapter.login({ email: 'admin', password: '1234' });
        if (!mounted) return;
        if (!result || !result.ok) return;
        const member = result.member;
        if (!member) return;
        // proceed to admin step
        const adminRes = await storageAdapter.adminLogin('1234', member.memberId);
        if (!mounted) return;
        if (adminRes?.ok && adminRes?.token) {
          sessionStorage.setItem('su_admin_token', adminRes.token);
          sessionStorage.setItem('su_admin_isAdmin', 'true');
          sessionStorage.setItem('su_admin_name', adminRes.memberName || member.name || 'Developer');
          sessionStorage.setItem('su_admin_role', adminRes.memberRole || 'ADMIN');
          sessionStorage.setItem('su_admin_is_website_admin', adminRes.isWebsiteAdmin ? 'true' : 'false');
          localStorage.removeItem('su_admin_token');
          localStorage.removeItem('su_admin_isAdmin');
          navigate('/admin', { replace: true });
        }
      } catch (e) {
        // ignore dev auto-login failures
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // ─────────────────────────────────────────
  // Step 1: 회원 로그인
  // ─────────────────────────────────────────
  const handleStep1 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await storageAdapter.login({ email: email.trim(), password: memberPw });
      if (!result || !result.ok) {
        setError("이메일 또는 비밀번호가 올바르지 않습니다.");
        setMemberPw("");
        return;
      }
      const member = result.member;
      if (!member) {
        setError("회원 정보를 불러올 수 없습니다.");
        setMemberPw("");
        return;
      }
      // Step1: 관리자 role 사전 체크 (UX 개선 - 서버 Step2에서도 재검증함)
      const ADMIN_ROLES = ['ADMIN', 'SUPER_ADMIN', 'WEBSITE_ADMIN'];
      if (!ADMIN_ROLES.includes(member.role)) {
        setError(`관리자 권한이 없는 계정입니다. (현재 역할: ${member.role || 'USER'})`);
        setMemberPw("");
        return;
      }
      // Step1 성공 → Step2로
      setMemberInfo(member);
      setStep(2);
      setError("");
    } catch (err) {
      setError(parseApiError(err));
      setMemberPw("");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // Step 2: 관리자 비밀번호
  // ─────────────────────────────────────────
  const handleStep2 = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await storageAdapter.adminLogin(adminPw, memberInfo?.memberId);
      if (result?.ok && result?.token) {
        sessionStorage.setItem("su_admin_token", result.token);
        sessionStorage.setItem("su_admin_isAdmin", "true");
        sessionStorage.setItem("su_admin_member_id", String(memberInfo?.memberId || ""));
        // memberName: 서버 응답 우선, 없으면 Step1 로그인 결과(memberInfo.name) 사용
        sessionStorage.setItem("su_admin_name", result.memberName || memberInfo?.name || memberInfo?.nickname || "");
        sessionStorage.setItem("su_admin_role", result.memberRole || "ADMIN");
        sessionStorage.setItem("su_admin_is_website_admin", result.isWebsiteAdmin ? "true" : "false");
        // 구버전 localStorage 잔여분 정리
        localStorage.removeItem("su_admin_token");
        localStorage.removeItem("su_admin_isAdmin");
        navigate("/admin", { replace: true });
      } else {
        setError("비밀번호가 올바르지 않습니다.");
        setAdminPw("");
      }
    } catch (err) {
      setError(parseApiError(err));
      setAdminPw("");
    } finally {
      setLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // 스타일
  // ─────────────────────────────────────────
  const cardStyle = {
    maxWidth: 400,
    margin: "60px auto",
    padding: 24,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(30,30,40,0.95)",
  };
  const inputStyle = {
    width: "100%",
    padding: "14px 16px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.06)",
    color: "#ffffff",
    fontSize: 15,
    outline: "none",
    boxSizing: "border-box",
    // 브라우저 자동완성(autofill) 시 흰 배경 강제 적용 방지
    WebkitBoxShadow: "0 0 0px 1000px rgba(30,30,40,0.95) inset",
    WebkitTextFillColor: "#ffffff",
  };
  const btnStyle = {
    width: "100%",
    padding: "14px 0",
    borderRadius: 10,
    border: "none",
    background: "linear-gradient(135deg, #8b5cf6, #7c3aed)",
    color: "#fff",
    fontSize: 15,
    fontWeight: 700,
    cursor: "pointer",
    marginTop: 16,
    opacity: loading ? 0.7 : 1,
  };
  const labelStyle = { fontSize: 13, fontWeight: 600, opacity: 0.8, display: "block", marginBottom: 6 };

  // ─────────────────────────────────────────
  // 렌더
  // ─────────────────────────────────────────
  return (
    <div style={{ minHeight: "100vh", background: "#0f0f14", color: "#ffffff" }}>
      <div style={cardStyle}>
        {/* 헤더 */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🔐</div>
          <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>관리자 콘솔</h1>
          {/* 스텝 표시 */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 }}>
            <StepBadge n={1} active={step === 1} done={step > 1} label="회원 확인" />
            <div style={{ width: 28, height: 1, background: "rgba(255,255,255,0.25)" }} />
            <StepBadge n={2} active={step === 2} done={false} label="관리자 인증" />
          </div>
        </div>

        {/* ── Step 1 ── */}
        {step === 1 && (
          <form onSubmit={handleStep1}>
            <p style={{ fontSize: 13, opacity: 0.55, margin: "0 0 16px" }}>
              관리자 계정으로 로그인하세요.
            </p>
            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>이메일 또는 전화번호</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 또는 전화번호"
                style={inputStyle}
                autoFocus
                autoComplete="username"
                required
              />
            </div>
            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>비밀번호</label>
              <PasswordInput
                value={memberPw}
                onChange={(e) => setMemberPw(e.target.value)}
                placeholder="계정 비밀번호"
                style={inputStyle}
              />
            </div>
            {error && <ErrorMsg msg={error} />}
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "확인 중..." : "다음 →"}
            </button>
          </form>
        )}

        {/* ── Step 2 ── */}
        {step === 2 && (
          <form onSubmit={handleStep2}>
            <p style={{ fontSize: 13, opacity: 0.55, margin: "0 0 4px" }}>
              반갑습니다,{" "}
              <strong style={{ color: "#a78bfa" }}>
                {memberInfo?.name || memberInfo?.email || "관리자"}
              </strong>
              님.
            </p>
            <p style={{ fontSize: 13, opacity: 0.55, margin: "0 0 16px" }}>
              관리자 비밀번호를 입력하세요.
            </p>
            <div style={{ marginBottom: 4 }}>
              <label style={labelStyle}>관리자 비밀번호</label>
              <PasswordInput
                value={adminPw}
                onChange={(e) => setAdminPw(e.target.value)}
                placeholder="관리자 비밀번호"
                style={inputStyle}
                autoFocus
              />
            </div>
            {error && <ErrorMsg msg={error} />}
            <button type="submit" style={btnStyle} disabled={loading}>
              {loading ? "인증 중..." : "로그인"}
            </button>
            <button
              type="button"
              onClick={() => { setStep(1); setError(""); setAdminPw(""); }}
              style={{
                width: "100%",
                padding: "10px 0",
                borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "transparent",
                color: "rgba(255,255,255,0.55)",
                fontSize: 13,
                cursor: "pointer",
                marginTop: 8,
              }}
            >
              ← 이전 단계로
            </button>
          </form>
        )}

        {/* 홈으로 */}
        <div style={{ textAlign: "center", marginTop: 20 }}>
          <button
            type="button"
            onClick={() => navigate("/home")}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.4)",
              fontSize: 13,
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 보조 컴포넌트 ──
function StepBadge({ n, active, done, label }) {
  const bg = done ? "#22c55e" : active ? "#7c3aed" : "rgba(255,255,255,0.1)";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
      <div
        style={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          background: bg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          fontWeight: 700,
          color: "#fff",
        }}
      >
        {done ? "✓" : n}
      </div>
      <span style={{ fontSize: 11, opacity: active ? 0.9 : 0.45 }}>{label}</span>
    </div>
  );
}

function ErrorMsg({ msg }) {
  return (
    <div
      style={{
        color: "#fca5a5",
        fontSize: 13,
        marginTop: 10,
        padding: "8px 12px",
        borderRadius: 8,
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
      }}
    >
      {msg}
    </div>
  );
}
