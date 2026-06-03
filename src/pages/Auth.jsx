import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { signUp, signIn, getAuthInfo, validatePassword, changePasswordAndSignIn } from "../lib/authStore";
import { clearPendingTab } from "../components/Bottomnav";
import * as storageAdapter from "../lib/storageAdapter";
import * as smsService from "../lib/smsService";
import BackButton from "../components/BackButton";

// ★ 비밀번호 입력 컴포넌트 (eye 아이콘 토글)
const EyeOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeClosedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const PasswordInput = ({ value, onChange, placeholder, hasError }) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={showPassword ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`su-input${hasError ? " is-error" : ""}`}
        style={{ paddingRight: 52 }}
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="auth-gate__eye-btn"
        aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
      >
        {showPassword ? <EyeClosedIcon /> : <EyeOpenIcon />}
      </button>
    </div>
  );
};





// ★ 약관 내용
const TERMS = {
  privacy: {
    title: "개인정보 수집 및 이용 동의",
    content: `[개인정보 수집 및 이용 동의]

1. 수집하는 개인정보 항목
- 필수항목: 이름, 휴대폰번호, 아이디(이메일), 비밀번호
- 선택항목: 닉네임, 지역

2. 개인정보의 수집 및 이용 목적
- 회원 가입 및 관리
- 서비스 제공 및 운영
- 고지사항 전달

3. 개인정보의 보유 및 이용 기간
- 회원 탈퇴 시까지 (단, 관계 법령에 따라 보존이 필요한 경우 해당 기간 동안 보존)

4. 동의 거부권 및 불이익
- 위 개인정보 수집에 대한 동의를 거부할 권리가 있으며, 동의 거부 시 회원가입이 제한됩니다.`,
  },
  terms: {
    title: "이용약관",
    content: `[서비스 이용약관]

제1조 (목적)
본 약관은 쉐어유니티(이하 "회사")가 제공하는 서비스의 이용조건 및 절차, 회사와 회원 간의 권리, 의무 및 책임사항을 규정함을 목적으로 합니다.

제2조 (용어의 정의)
1. "서비스"란 회사가 제공하는 모든 서비스를 의미합니다.
2. "회원"이란 본 약관에 동의하고 서비스를 이용하는 자를 의미합니다.

제3조 (약관의 효력 및 변경)
1. 본 약관은 서비스 화면에 게시하거나 기타의 방법으로 회원에게 공지함으로써 효력이 발생합니다.
2. 회사는 필요한 경우 약관을 변경할 수 있으며, 변경된 약관은 공지 후 효력이 발생합니다.

제4조 (회원가입)
1. 회원가입은 이용자가 약관에 동의하고 가입신청을 한 후 회사가 승낙함으로써 성립됩니다.
2. 회사는 다음 각 호에 해당하는 신청에 대해서는 승낙을 거부할 수 있습니다.`,
  },
  marketing: {
    title: "마케팅 정보 수신 동의",
    content: `[마케팅 정보 수신 동의]

쉐어유니티에서 제공하는 이벤트, 혜택, 신규 서비스 등의 마케팅 정보를 수신하시겠습니까?

- 수신 채널: SMS, 이메일, 앱 푸시 알림
- 수신 내용: 이벤트 안내, 할인 혜택, 신규 서비스 소식

※ 마케팅 정보 수신 동의는 선택사항이며, 동의하지 않아도 서비스 이용에 제한이 없습니다.
※ 수신 동의 후에도 설정에서 언제든지 수신 거부할 수 있습니다.`,
  },
};

// ★ 휴대폰번호 포맷팅
const formatPhone = (v) => {
  const n = v.replace(/[^0-9]/g, "").slice(0, 11);
  if (n.length <= 3) return n;
  if (n.length <= 7) return `${n.slice(0, 3)}-${n.slice(3)}`;
  return `${n.slice(0, 3)}-${n.slice(3, 7)}-${n.slice(7)}`;
};

// ★ 아이디 마스킹 (abc@def.com → a**@d**.com)
const maskId = (id) => {
  if (!id) return "";
  if (id.includes("@")) {
    const [local, domain] = id.split("@");
    const ml = local.length > 2 ? local[0] + "**" : local[0] + "*";
    const [dn, ext] = domain.split(".");
    const md = dn.length > 2 ? dn[0] + "**" : dn[0] + "*";
    return `${ml}@${md}.${ext || "com"}`;
  }
  // 휴대폰
  return id.slice(0, 3) + "****" + id.slice(-4);
};

export default function Auth() {
  // mode: login, findId, findPw, findPwReset, signUp
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // 로그인 폼
  const [loginForm, setLoginForm] = useState({ userId: "", password: "" });
  const [loginErrors, setLoginErrors] = useState({});

  // 아이디 찾기 폼
  const [findIdForm, setFindIdForm] = useState({ name: "", phone: "", code: "" });
  const [findIdErrors, setFindIdErrors] = useState({});
  const [findIdResult, setFindIdResult] = useState(null);
  const [codeSent, setCodeSent] = useState(false);
  const [codeTimer, setCodeTimer] = useState(0);

  // 비밀번호 찾기 폼
  const [findPwForm, setFindPwForm] = useState({ userId: "", name: "", code: "" });
  const [findPwErrors, setFindPwErrors] = useState({});
  const [pwResetForm, setPwResetForm] = useState({ password: "", passwordConfirm: "" });
  const [pwResetErrors, setPwResetErrors] = useState({});

  // 임시 비밀번호 → 강제 변경
  const [mustChangeContext, setMustChangeContext] = useState(null);
  const [mustChangeForm, setMustChangeForm] = useState({ password: "", passwordConfirm: "" });
  const [mustChangeErrors, setMustChangeErrors] = useState({});
  const [tempCurrentPassword, setTempCurrentPassword] = useState("");

  // 회원가입 폼
  const [signUpForm, setSignUpForm] = useState({
    name: "", phone: "", userId: "", password: "", passwordConfirm: "", regionId: "", districtId: "",
  });
  const [signUpErrors, setSignUpErrors] = useState({});
  const [agreements, setAgreements] = useState({
    all: false,
    privacy: false,
    terms: false,
    marketing: false,
  });

  // 약관 모달
  const [termModal, setTermModal] = useState(null);

  // 지역 선택 모달
  const [regionModalOpen, setRegionModalOpen] = useState(false);
  const [regionSearch, setRegionSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("전체");

  // 공개된 지역 목록 (서버 SSOT only)
  const [publicRegions, setPublicRegions] = useState([]);
  const [regionsLoadError, setRegionsLoadError] = useState("");

  const reloadRegions = useCallback(async () => {
    setRegionsLoadError("");
    const all = await storageAdapter.getRegions();
    const publics = (Array.isArray(all) ? all : []).filter((r) => r?.isPublic !== false);
    setPublicRegions(publics);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await reloadRegions();
      } catch (e) {
        console.error('[Auth] Failed to load regions (SSOT):', e);
        if (mounted) {
          setPublicRegions([]);
          setRegionsLoadError(e?.message || '지역 목록을 불러오지 못했습니다.');
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [reloadRegions]);
  
  // 도/광역시 목록 추출
  const provinces = useMemo(() => {
    const set = new Set(publicRegions.map(r => r.province));
    return ["전체", ...Array.from(set).sort()];
  }, [publicRegions]);

  // 필터링된 지역 목록
  const filteredRegions = useMemo(() => {
    let list = publicRegions;
    if (regionFilter !== "전체") {
      list = list.filter(r => r.province === regionFilter);
    }
    if (regionSearch.trim()) {
      const q = regionSearch.trim().toLowerCase();
      list = list.filter(r => 
        r.name.toLowerCase().includes(q) || 
        r.province.toLowerCase().includes(q)
      );
    }
    return list;
  }, [publicRegions, regionFilter, regionSearch]);

  // 선택된 지역 정보
  const selectedRegion = useMemo(() => {
    if (!signUpForm.regionId) return null;
    return publicRegions.find(r => r.id === signUpForm.regionId) || null;
  }, [signUpForm.regionId, publicRegions]);

  const navigate = useNavigate();
  const location = useLocation();
  const returnTo = location.state?.returnTo || "/home";

  // ★ 페이지 로드 시 디버깅 로그 (origin/members 확인)
  useEffect(() => {
    console.log("[Auth] origin:", window.location.origin);
    // ★ 서버 DB 기반 회원 목록 조회 (SSOT)
    async function loadMembers() {
      try {
        const serverMembers = await storageAdapter.getMembers();
        console.log("[Auth] server members len:", serverMembers?.length || 0);
        if (serverMembers && serverMembers.length > 0) {
          console.log("[Auth] members snapshot:", serverMembers.slice(0, 5).map(m => ({
            id: m.id,
            email: m.email,
            phone: m.phone,
            name: m.name
          })));
        }
      } catch (e) {
        console.error("[Auth] Failed to load server members:", e);
      }
    }
    loadMembers();
  }, []);

  // ★ 인증번호 타이머
  useEffect(() => {
    if (codeTimer <= 0) return;
    const t = setTimeout(() => setCodeTimer((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [codeTimer]);

  // ★ 지역 모달 열림 시 body 스크롤 잠금
  useEffect(() => {
    if (regionModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [regionModalOpen]);

  // ★ 지역 선택 핸들러
  const openRegionModal = () => {
    if (publicRegions.length === 0) return;
    setRegionSearch("");
    setRegionFilter("전체");
    setRegionModalOpen(true);
  };

  const closeRegionModal = () => {
    setRegionModalOpen(false);
  };

  const selectRegion = (region) => {
    const autoDistrict = String(region?.city || region?.district || '').trim();
    setSignUpForm({ ...signUpForm, regionId: region.id, districtId: autoDistrict });
    closeRegionModal();
  };

  // ★ 모드 전환 시 초기화
  const switchMode = useCallback((m) => {
    setMode(m);
    setFormError("");
    setSuccessMsg("");
    setLoginErrors({});
    setFindIdErrors({});
    setFindPwErrors({});
    setPwResetErrors({});
    setSignUpErrors({});
    setMustChangeErrors({});
    setMustChangeForm({ password: "", passwordConfirm: "" });
    setMustChangeContext(null);
    setTempCurrentPassword("");
    setFindIdResult(null);
    setCodeSent(false);
    setCodeTimer(0);
  }, []);

  // ★ 인증번호 발송 (smsService 경유 — SMS 연동 시 smsService.js만 수정)
  const sendCode = async (phone) => {
    setFormError("");
    setSuccessMsg("");
    try {
      const result = await smsService.sendVerificationCode(phone);
      setCodeSent(true);
      setCodeTimer(180);
      if (result?.debug_code) {
        setSuccessMsg(`[개발] 인증번호: ${result.debug_code} (SMS 미연동 상태)`);
      } else {
        setSuccessMsg("인증번호가 발송되었습니다.");
      }
    } catch (err) {
      setFormError(err.message || "인증번호 발송에 실패했습니다.");
    }
  };

  // ===================== 로그인 =====================
  const handleLogin = async (e) => {
    e.preventDefault();
    setFormError("");
    setLoginErrors({});
    const errors = {};
    const identifier = String(loginForm.userId || '').trim();
    if (!identifier) {
      errors.userId = "아이디 또는 휴대폰번호를 입력해주세요.";
      setLoginErrors(errors);
      return;
    }
    if (!loginForm.password) {
      errors.password = "비밀번호를 입력해주세요.";
      setLoginErrors(errors);
      return;
    }

    setLoading(true);
    try {
      // 서버는 email/userId/phone 식별자를 모두 허용
      const result = await signIn({ email: identifier, userId: identifier, password: loginForm.password });
      setLoading(false);
      if (result?.mustChangePassword) {
        setMustChangeContext({ email: result.email || identifier, memberId: result.memberId });
        setTempCurrentPassword(loginForm.password);
        setMustChangeForm({ password: "", passwordConfirm: "" });
        setMustChangeErrors({});
        setFormError("");
        setMode("mustChangePassword");
        return;
      }
      clearPendingTab();
      setSuccessMsg("로그인 성공!");
      setTimeout(() => navigate(returnTo, { replace: true }), 500);
    } catch (error) {
      setLoading(false);

      // ★ 사용자 친화적 에러 메시지 매핑
      let msg = "로그인에 실패했습니다.";
      if (error?.message) {
        const errMsg = error.message.toLowerCase();
        if (errMsg.includes('invalid') && errMsg.includes('credential')) {
          msg = "아이디 또는 비밀번호가 올바르지 않습니다.";
        } else if (errMsg.includes('not found') || errMsg.includes('does not exist')) {
          msg = "등록되지 않은 계정(아이디/휴대폰번호)입니다.";
        } else if (errMsg.includes('password') && (errMsg.includes('incorrect') || errMsg.includes('wrong'))) {
          msg = "비밀번호가 틀렸습니다.";
        } else if (errMsg.includes('suspended') || errMsg.includes('banned')) {
          msg = "정지된 계정입니다. 관리자에게 문의하세요.";
        } else {
          msg = error.message;
        }
      }
      setFormError(msg);
    }
  };

  // ===================== 아이디 찾기 =====================
  const handleFindId = async (e) => {
    e.preventDefault();
    setFormError("");
    setFindIdErrors({});
    const errors = {};
    if (!findIdForm.name.trim()) errors.name = "이름을 입력해주세요.";
    if (!findIdForm.phone.trim()) errors.phone = "휴대폰번호를 입력해주세요.";
    if (!findIdForm.code.trim()) errors.code = "인증번호를 입력해주세요.";
    if (Object.keys(errors).length > 0) { setFindIdErrors(errors); return; }

    setLoading(true);
    try {
      // 1단계: 인증번호 검증 (smsService)
      await smsService.verifyCode(findIdForm.phone.trim(), findIdForm.code.trim());
      // 2단계: 아이디 조회 (smsService → 서버 API)
      const result = await smsService.findIdByNameAndPhone(findIdForm.name.trim(), findIdForm.phone.trim());
      setFindIdResult(result.userId);
    } catch (err) {
      setFormError(err.message || "일치하는 계정을 찾을 수 없습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== 비밀번호 찾기 (인증) =====================
  const handleFindPw = async (e) => {
    e.preventDefault();
    setFormError("");
    setFindPwErrors({});
    const errors = {};
    if (!findPwForm.userId.trim()) errors.userId = "아이디를 입력해주세요.";
    if (!findPwForm.name.trim()) errors.name = "이름을 입력해주세요.";
    if (!findPwForm.code.trim()) errors.code = "인증번호를 입력해주세요.";
    if (Object.keys(errors).length > 0) { setFindPwErrors(errors); return; }

    setLoading(true);
    try {
      // 인증번호 검증 후 재설정 토큰 요청 (smsService)
      await smsService.verifyCode(findPwForm.userId.trim(), findPwForm.code.trim());
      await smsService.requestPasswordResetToken(findPwForm.userId.trim(), findPwForm.name.trim());
      setMode("findPwReset");
    } catch (err) {
      setFormError(err.message || "인증에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // ===================== 비밀번호 재설정 =====================
  const handlePwReset = (e) => {
    e.preventDefault();
    setFormError("");
    setPwResetErrors({});
    const errors = {};
    const pwResult = validatePassword(pwResetForm.password);
    if (!pwResult.valid) errors.password = pwResult.error;
    if (pwResetForm.password !== pwResetForm.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (Object.keys(errors).length > 0) { setPwResetErrors(errors); return; }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg("비밀번호가 변경되었습니다. 로그인해주세요.");
      setTimeout(() => switchMode("login"), 1500);
    }, 500);
  };

  // ===================== 임시 비밀번호 → 새 비밀번호 설정 =====================
  const handleMustChangePassword = async (e) => {
    e.preventDefault();
    setFormError("");
    setMustChangeErrors({});
    const errors = {};
    const pwResult = validatePassword(mustChangeForm.password);
    if (!pwResult.valid) errors.password = pwResult.error;
    if (mustChangeForm.password !== mustChangeForm.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (Object.keys(errors).length > 0) {
      setMustChangeErrors(errors);
      return;
    }

    const email = mustChangeContext?.email || loginForm.userId;
    if (!email || !tempCurrentPassword) {
      setFormError("세션이 만료되었습니다. 임시 비밀번호로 다시 로그인해주세요.");
      switchMode("login");
      return;
    }

    setLoading(true);
    try {
      await changePasswordAndSignIn({
        email,
        currentPassword: tempCurrentPassword,
        newPassword: mustChangeForm.password,
      });
      setLoading(false);
      clearPendingTab();
      setSuccessMsg("비밀번호가 변경되었습니다. 로그인되었습니다.");
      setTimeout(() => navigate(returnTo, { replace: true }), 800);
    } catch (err) {
      setLoading(false);
      setFormError(err?.message || "비밀번호 변경에 실패했습니다.");
    }
  };

  // ===================== 회원가입 =====================
  const handleSignUp = async (e) => {
    e.preventDefault();
    setFormError("");
    setSignUpErrors({});
    const errors = {};
    if (!signUpForm.name.trim()) errors.name = "이름을 입력해주세요.";
    if (!signUpForm.phone.trim()) errors.phone = "휴대폰번호를 입력해주세요.";
    if (!signUpForm.userId.trim()) errors.userId = "아이디를 입력해주세요.";
    if (!signUpForm.regionId) errors.regionId = "지역을 선택해주세요.";
    const pwResult = validatePassword(signUpForm.password);
    if (!pwResult.valid) errors.password = pwResult.error;
    if (signUpForm.password !== signUpForm.passwordConfirm) {
      errors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (!agreements.privacy || !agreements.terms) {
      setFormError("필수 약관에 동의해주세요.");
      return;
    }
    if (Object.keys(errors).length > 0) { setSignUpErrors(errors); return; }

    setLoading(true);
    try {
      await signUp({
        name: signUpForm.name,
        phone: signUpForm.phone,
        password: signUpForm.password,
        nickname: "",
        region: selectedRegion ? selectedRegion.name : "",
        regionId: signUpForm.regionId,
        districtId: signUpForm.districtId || null,
        email: signUpForm.userId, // ★ 이메일(아이디) 저장
      });
      setLoading(false);
      clearPendingTab();
      setSuccessMsg("회원가입이 완료되었습니다! 모든 기능을 이용할 수 있습니다.");
      setTimeout(() => navigate(returnTo, { replace: true }), 1500);
    } catch (e) {
      setLoading(false);
      // 중복 이메일(409): 로그인으로 이동 유도
      if (e?.status === 409 || e?.message?.includes('이미 가입')) {
        setFormError('이미 가입된 이메일입니다.');
      } else {
        setFormError(e?.message || "회원가입에 실패했습니다.");
      }
    }
  };

  // ★ 전체 동의 토글
  const toggleAll = () => {
    const next = !agreements.all;
    setAgreements({ all: next, privacy: next, terms: next, marketing: next });
  };
  const toggleOne = (key) => {
    const next = { ...agreements, [key]: !agreements[key] };
    next.all = next.privacy && next.terms && next.marketing;
    setAgreements(next);
  };

  // ★ 필수 동의 여부
  const requiredAgreed = agreements.privacy && agreements.terms;

  // ===================== 렌더링 =====================
  return (
    <div className="auth-gate">
      {/* 왼쪽 최상단 뒤로가기 */}
      <div className="auth-gate__back">
        <BackButton onClick={() => navigate(-1)} tone="neutral" />
      </div>
      {/* 배경 레이어 */}
      <div className="auth-gate__bg-top" />
      <div className="auth-gate__bg-bot" />
      <div className="auth-gate__inner">
        {/* 카드 뒤 라이트 스팟 */}
        <div className="auth-gate__bg-highlight" />
        {/* 브랜드 영역 */}
        <div className="auth-gate__brand">
          <div className="auth-gate__logo">Share Map</div>
          <div className="auth-gate__tagline">지역공유 발전 플랫폼</div>
        </div>
        {/* 플로팅 카드 */}
        <div className="auth-gate__card">
        {/* ========== 로그인 ========== */}
        {mode === "login" && (
          <>
            <h2 className="su-authTitle">🔐 로그인</h2>
            {successMsg && <div className="su-alertBox su-alertBox--success">{successMsg}</div>}
            {formError && <div className="su-alertBox su-alertBox--error">{formError}</div>}
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label" style={{ whiteSpace: "nowrap", fontSize: 13 }}>
                  아이디 (이메일/휴대폰번호) <span className="su-required">*</span>
                </label>
                <input
                  type="text"
                  value={loginForm.userId}
                  onChange={(e) => setLoginForm({ ...loginForm, userId: e.target.value })}
                  placeholder="이메일 또는 휴대폰번호"
                  className={`su-input${loginErrors.userId ? " is-error" : ""}`}
                />
                {loginErrors.userId && <div className="su-fieldError">{loginErrors.userId}</div>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="su-label">비밀번호 <span className="su-required">*</span></label>
                <PasswordInput
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  placeholder="비밀번호"
                  hasError={!!loginErrors.password}
                />
                {loginErrors.password && <div className="su-fieldError">{loginErrors.password}</div>}
              </div>
              <button type="submit" disabled={loading} className="su-primaryBtn" style={{ width: "100%" }}>
                {loading ? "로그인 중..." : "로그인"}
              </button>
            </form>
            <div className="su-authLinkRow">
              <button type="button" onClick={() => switchMode("findId")} className="su-authLink">아이디 찾기</button>
              <span className="su-authLinkDivider">|</span>
              <button type="button" onClick={() => switchMode("findPw")} className="su-authLink">비밀번호 찾기</button>
              <span className="su-authLinkDivider">|</span>
              <button type="button" onClick={() => switchMode("signUp")} className="su-authLink">회원가입</button>
            </div>
          </>
        )}

        {/* ========== 아이디 찾기 ========== */}
        {mode === "findId" && !findIdResult && (
          <>
            <h2 className="su-authTitle">🔍 아이디 찾기</h2>
            {successMsg && <div className="su-alertBox su-alertBox--success">{successMsg}</div>}
            {formError && <div className="su-alertBox su-alertBox--error">{formError}</div>}
            <form onSubmit={handleFindId}>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">이름 <span className="su-required">*</span></label>
                <input
                  type="text"
                  value={findIdForm.name}
                  onChange={(e) => setFindIdForm({ ...findIdForm, name: e.target.value })}
                  placeholder="실명 입력"
                  className={`su-input${findIdErrors.name ? " is-error" : ""}`}
                />
                {findIdErrors.name && <div className="su-fieldError">{findIdErrors.name}</div>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">휴대폰번호 <span className="su-required">*</span></label>
                <div className="su-inputRow">
                  <input
                    type="tel"
                    value={findIdForm.phone}
                    onChange={(e) => setFindIdForm({ ...findIdForm, phone: formatPhone(e.target.value) })}
                    placeholder="010-1234-5678"
                    className={`su-input${findIdErrors.phone ? " is-error" : ""}`}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => sendCode(findIdForm.phone)}
                    disabled={codeTimer > 0}
                    className="su-btnSmall"
                  >
                    {codeTimer > 0 ? `${codeTimer}초` : codeSent ? "재전송" : "인증번호"}
                  </button>
                </div>
                {findIdErrors.phone && <div className="su-fieldError">{findIdErrors.phone}</div>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="su-label">인증번호 <span className="su-required">*</span></label>
                <input
                  type="text"
                  value={findIdForm.code}
                  onChange={(e) => setFindIdForm({ ...findIdForm, code: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })}
                  placeholder="6자리 입력"
                  inputMode="numeric"
                  className={`su-input${findIdErrors.code ? " is-error" : ""}`}
                />
                {findIdErrors.code && <div className="su-fieldError">{findIdErrors.code}</div>}
              </div>
              <div className="su-btnRow">
                <button type="button" onClick={() => switchMode("login")} className="su-pill">취소</button>
                <button type="submit" disabled={loading} className="su-primaryBtn">
                  {loading ? "확인 중..." : "아이디 찾기"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ========== 아이디 찾기 결과 ========== */}
        {mode === "findId" && findIdResult && (
          <>
            <h2 className="su-authTitle">🔍 아이디 찾기 결과</h2>
              <div className="su-alertBox su-alertBox--success">
              회원님의 아이디는 <strong>{maskId(findIdResult)}</strong> 입니다.
            </div>
            <button type="button" onClick={() => switchMode("login")} className="su-primaryBtn" style={{ width: "100%" }}>
              로그인하러 가기
            </button>
          </>
        )}

        {/* ========== 비밀번호 찾기 (인증) ========== */}
        {mode === "findPw" && (
          <>
            <h2 className="su-authTitle">🔑 비밀번호 찾기</h2>
            {successMsg && <div className="su-alertBox su-alertBox--success">{successMsg}</div>}
            {formError && <div className="su-alertBox su-alertBox--error">{formError}</div>}
            <form onSubmit={handleFindPw}>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">아이디 <span className="su-required">*</span></label>
                <input
                  type="text"
                  value={findPwForm.userId}
                  onChange={(e) => setFindPwForm({ ...findPwForm, userId: e.target.value })}
                  placeholder="이메일 또는 휴대폰번호"
                  className={`su-input${findPwErrors.userId ? " is-error" : ""}`}
                />
                {findPwErrors.userId && <div className="su-fieldError">{findPwErrors.userId}</div>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">이름 <span className="su-required">*</span></label>
                <input
                  type="text"
                  value={findPwForm.name}
                  onChange={(e) => setFindPwForm({ ...findPwForm, name: e.target.value })}
                  placeholder="실명 입력"
                  className={`su-input${findPwErrors.name ? " is-error" : ""}`}
                />
                {findPwErrors.name && <div className="su-fieldError">{findPwErrors.name}</div>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">휴대폰번호</label>
                <div className="su-inputRow">
                  <input
                    type="tel"
                    value={findPwForm.phone || ""}
                    onChange={(e) => setFindPwForm({ ...findPwForm, phone: formatPhone(e.target.value) })}
                    placeholder="010-1234-5678"
                    className="su-input"
                    style={{ flex: 1 }}
                  />
                  <button type="button" onClick={() => sendCode(findPwForm.phone || '')} disabled={codeTimer > 0} className="su-btnSmall">
                    {codeTimer > 0 ? `${codeTimer}초` : codeSent ? "재전송" : "인증번호"}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="su-label">인증번호 <span className="su-required">*</span></label>
                <input
                  type="text"
                  value={findPwForm.code}
                  onChange={(e) => setFindPwForm({ ...findPwForm, code: e.target.value.replace(/[^0-9]/g, "").slice(0, 6) })}
                  placeholder="6자리 입력"
                  inputMode="numeric"
                  className={`su-input${findPwErrors.code ? " is-error" : ""}`}
                />
                {findPwErrors.code && <div className="su-fieldError">{findPwErrors.code}</div>}
              </div>
              <div className="su-btnRow">
                <button type="button" onClick={() => switchMode("login")} className="su-pill">취소</button>
                <button type="submit" disabled={loading} className="su-primaryBtn">
                  {loading ? "확인 중..." : "다음"}
                </button>
              </div>
            </form>
          </>
        )}

        {/* ========== 임시 비밀번호 변경 (관리자 발급) ========== */}
        {mode === "mustChangePassword" && (
          <>
            <h2 className="su-authTitle">🔑 새 비밀번호 설정</h2>
            <p style={{ fontSize: 14, opacity: 0.75, marginBottom: 16, lineHeight: 1.5 }}>
              관리자가 발급한 임시 비밀번호로 로그인하셨습니다.<br />
              서비스 이용을 위해 새 비밀번호를 설정해주세요.
            </p>
            {successMsg && <div className="su-alertBox su-alertBox--success">{successMsg}</div>}
            {formError && <div className="su-alertBox su-alertBox--error">{formError}</div>}
            <form onSubmit={handleMustChangePassword}>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">새 비밀번호 <span className="su-required">*</span></label>
                <PasswordInput
                  value={mustChangeForm.password}
                  onChange={(e) => setMustChangeForm({ ...mustChangeForm, password: e.target.value })}
                  placeholder="영문+숫자 8~16자"
                  hasError={!!mustChangeErrors.password}
                />
                {mustChangeErrors.password && <div className="su-fieldError">{mustChangeErrors.password}</div>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="su-label">새 비밀번호 확인 <span className="su-required">*</span></label>
                <PasswordInput
                  value={mustChangeForm.passwordConfirm}
                  onChange={(e) => setMustChangeForm({ ...mustChangeForm, passwordConfirm: e.target.value })}
                  placeholder="비밀번호 재입력"
                  hasError={!!mustChangeErrors.passwordConfirm}
                />
                {mustChangeErrors.passwordConfirm && <div className="su-fieldError">{mustChangeErrors.passwordConfirm}</div>}
              </div>
              <button type="submit" disabled={loading} className="su-primaryBtn" style={{ width: "100%" }}>
                {loading ? "변경 중..." : "비밀번호 변경 후 계속"}
              </button>
            </form>
          </>
        )}

        {/* ========== 비밀번호 재설정 ========== */}
        {mode === "findPwReset" && (
          <>
            <h2 className="su-authTitle">🔑 새 비밀번호 설정</h2>
            {successMsg && <div className="su-alertBox su-alertBox--success">{successMsg}</div>}
            {formError && <div className="su-alertBox su-alertBox--error">{formError}</div>}
            <form onSubmit={handlePwReset}>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">새 비밀번호 <span className="su-required">*</span></label>
                <PasswordInput
                  value={pwResetForm.password}
                  onChange={(e) => setPwResetForm({ ...pwResetForm, password: e.target.value })}
                  placeholder="영문+숫자 8~16자"
                  hasError={!!pwResetErrors.password}
                />
                {pwResetErrors.password && <div className="su-fieldError">{pwResetErrors.password}</div>}
              </div>
              <div style={{ marginBottom: 20 }}>
                <label className="su-label">새 비밀번호 확인 <span className="su-required">*</span></label>
                <PasswordInput
                  value={pwResetForm.passwordConfirm}
                  onChange={(e) => setPwResetForm({ ...pwResetForm, passwordConfirm: e.target.value })}
                  placeholder="비밀번호 재입력"
                  hasError={!!pwResetErrors.passwordConfirm}
                />
                {pwResetErrors.passwordConfirm && <div className="su-fieldError">{pwResetErrors.passwordConfirm}</div>}
              </div>
              <button type="submit" disabled={loading} className="su-primaryBtn" style={{ width: "100%" }}>
                {loading ? "변경 중..." : "비밀번호 변경"}
              </button>
            </form>
          </>
        )}

        {/* ========== 회원가입 ========== */}
        {mode === "signUp" && (
          <>
            <h2 className="su-authTitle">📝 회원가입</h2>
            {successMsg && <div className="su-alertBox su-alertBox--success">{successMsg}</div>}
            <form onSubmit={handleSignUp}>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">이름 <span className="su-required">*</span></label>
                <input
                  type="text"
                  value={signUpForm.name}
                  onChange={(e) => setSignUpForm({ ...signUpForm, name: e.target.value })}
                  placeholder="실명 입력"
                  className={`su-input${signUpErrors.name ? " is-error" : ""}`}
                />
                {signUpErrors.name && <div className="su-fieldError">{signUpErrors.name}</div>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">휴대폰번호 <span className="su-required">*</span></label>
                <input
                  type="tel"
                  value={signUpForm.phone}
                  onChange={(e) => setSignUpForm({ ...signUpForm, phone: formatPhone(e.target.value) })}
                  placeholder="010-1234-5678"
                  className={`su-input${signUpErrors.phone ? " is-error" : ""}`}
                />
                {signUpErrors.phone && <div className="su-fieldError">{signUpErrors.phone}</div>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">아이디 (이메일) <span className="su-required">*</span></label>
                <input
                  type="email"
                  value={signUpForm.userId}
                  onChange={(e) => setSignUpForm({ ...signUpForm, userId: e.target.value })}
                  placeholder="example@email.com"
                  className={`su-input${signUpErrors.userId ? " is-error" : ""}`}
                />
                {signUpErrors.userId && <div className="su-fieldError">{signUpErrors.userId}</div>}
              </div>
              <div style={{ marginBottom: 12 }}>
                <label className="su-label">비밀번호 <span className="su-required">*</span></label>
                <PasswordInput
                  value={signUpForm.password}
                  onChange={(e) => setSignUpForm({ ...signUpForm, password: e.target.value })}
                  placeholder="영문+숫자 8~16자"
                  hasError={!!signUpErrors.password}
                />
                {signUpErrors.password && <div className="su-fieldError">{signUpErrors.password}</div>}
              </div>
              <div style={{ marginBottom: 16 }}>
                <label className="su-label">비밀번호 확인 <span className="su-required">*</span></label>
                <PasswordInput
                  value={signUpForm.passwordConfirm}
                  onChange={(e) => setSignUpForm({ ...signUpForm, passwordConfirm: e.target.value })}
                  placeholder="비밀번호 재입력"
                  hasError={!!signUpErrors.passwordConfirm}
                />
                {signUpErrors.passwordConfirm && <div className="su-fieldError">{signUpErrors.passwordConfirm}</div>}
              </div>

              {/* 지역 선택 필드 */}
              <div style={{ marginBottom: 16 }}>
                <label className="su-label">지역 <span className="su-required">*</span></label>
                {publicRegions.length === 0 ? (
                  <div className="su-regionDisplay" style={{ color: "#ef4444", fontSize: 13 }}>
                    등록된 지역이 없습니다. 관리자에게 문의하세요.
                  </div>
                ) : (
                  <div className="su-regionField">
                    <div className={`su-regionDisplay${signUpErrors.regionId ? " is-error" : ""}${!selectedRegion ? " is-placeholder" : ""}`}>
                      {selectedRegion ? `${selectedRegion.name} (${selectedRegion.province})` : "지역을 선택해주세요"}
                    </div>
                    <button
                      type="button"
                      onClick={openRegionModal}
                      className="su-btnSmall"
                    >
                      선택
                    </button>
                  </div>
                )}
                {signUpErrors.regionId && <div className="su-fieldError">{signUpErrors.regionId}</div>}
              </div>

              {/* 약관 동의 섹션 */}
              <div className="su-agreeBox">
                <div className="su-checkRow">
                  <input type="checkbox" checked={agreements.all} onChange={toggleAll} className="su-checkBox" id="agreeAll" />
                  <label htmlFor="agreeAll" className="su-checkLabel" style={{ fontWeight: 700 }}>전체 동의</label>
                </div>
                <div className="su-checkRow">
                  <input type="checkbox" checked={agreements.privacy} onChange={() => toggleOne("privacy")} className="su-checkBox" id="agreePrivacy" />
                  <label htmlFor="agreePrivacy" className="su-checkLabel">[필수] 개인정보 수집 및 이용</label>
                  <button type="button" onClick={() => setTermModal("privacy")} className="su-viewBtn">보기</button>
                </div>
                <div className="su-checkRow">
                  <input type="checkbox" checked={agreements.terms} onChange={() => toggleOne("terms")} className="su-checkBox" id="agreeTerms" />
                  <label htmlFor="agreeTerms" className="su-checkLabel">[필수] 이용약관 동의</label>
                  <button type="button" onClick={() => setTermModal("terms")} className="su-viewBtn">보기</button>
                </div>
                <div className="su-checkRow">
                  <input type="checkbox" checked={agreements.marketing} onChange={() => toggleOne("marketing")} className="su-checkBox" id="agreeMarketing" />
                  <label htmlFor="agreeMarketing" className="su-checkLabel">[선택] 마케팅 정보 수신</label>
                  <button type="button" onClick={() => setTermModal("marketing")} className="su-viewBtn">보기</button>
                </div>
              </div>

              {formError && <div className="su-alertBox su-alertBox--error" style={{ marginBottom: 12 }}>{formError}</div>}
              <div className="su-btnRow">
                <button type="button" onClick={() => switchMode("login")} className="su-pill">취소</button>
                <button
                  type="submit"
                  disabled={loading || !requiredAgreed}
                  className="su-primaryBtn"
                >
                  {loading ? "가입 중..." : "가입하기"}
                </button>
              </div>
            </form>
          </>
        )}
        </div>{/* /auth-gate__card */}
      </div>{/* /auth-gate__inner */}

      {/* ★ 약관 모달 (바텀시트) */}
      {termModal && (
        <div className="su-modalOverlay" onClick={() => setTermModal(null)}>
          <div className="su-termSheet" onClick={(e) => e.stopPropagation()}>
            <h3 className="su-termTitle">{TERMS[termModal]?.title}</h3>
            <div className="su-termContent">{TERMS[termModal]?.content}</div>
            <button type="button" onClick={() => setTermModal(null)} className="su-termClose">
              확인
            </button>
          </div>
        </div>
      )}

      {/* ★ 지역 선택 모달 (중앙 정렬) */}
      {regionModalOpen && (
        <div className="su-modalOverlay is-center" onClick={closeRegionModal}>
          <div className="su-regionModalBox" onClick={(e) => e.stopPropagation()}>
            {/* 헤더 */}
            <div className="su-regionModalHeader">
              <h3 className="su-regionModalTitle">지역 선택</h3>
              <button type="button" onClick={closeRegionModal} className="su-regionCloseBtn">
                ✕
              </button>
            </div>

            {/* 검색 */}
            <div className="su-regionSearchBox">
              <input
                type="text"
                value={regionSearch}
                onChange={(e) => setRegionSearch(e.target.value)}
                placeholder="지역명 검색..."
                className="su-regionSearchInput"
                autoFocus
              />
            </div>

            {/* 도/광역시 필터 */}
            <div className="su-regionFilterBox">
              {provinces.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setRegionFilter(p)}
                  className={`su-regionFilterBtn${regionFilter === p ? " is-active" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>

            {/* 지역 리스트 */}
            <div className="su-regionList">
              {regionsLoadError && (
                <div style={{ padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
                  {regionsLoadError}{' '}
                  <button
                    type="button"
                    onClick={() => {
                      reloadRegions().catch((e) => {
                        setRegionsLoadError(e?.message || '지역 목록을 불러오지 못했습니다.');
                      });
                    }}
                    className="su-pill"
                    style={{ marginLeft: 8 }}
                  >
                    재시도
                  </button>
                </div>
              )}
              {filteredRegions.length === 0 ? (
                <div className="su-regionEmpty">
                  {regionSearch ? "검색 결과가 없습니다." : "등록된 지역이 없습니다."}
                </div>
              ) : (
                filteredRegions.map((region) => (
                  <div
                    key={region.id}
                    onClick={() => selectRegion(region)}
                    className={`su-regionItem${signUpForm.regionId === region.id ? " is-selected" : ""}`}
                  >
                    <span className="su-regionItemName">{region.name}</span>
                    <span className="su-regionItemProvince">{region.province}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
