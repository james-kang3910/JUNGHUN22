/**
 * smsService.js — SMS 인증 서비스 레이어 (구조 설계, 실제 SMS 미구현)
 *
 * ★ SMS 서비스 도입 시 아래 함수들의 TODO 주석 부분만 교체하면 됩니다.
 * 현재는 개발 환경에서 디버그용 코드(123456)를 반환하며,
 * 프로덕션 환경에서는 "SMS 서비스 미연동" 오류를 반환합니다.
 */

const IS_DEV = import.meta.env.DEV;

// 인증번호 임시 저장소 (메모리, 탭당)
const _pending = new Map(); // phone → { code, expiresAt }

/**
 * 인증번호 발송 요청
 * @param {string} phone - 수신 번호 (010-0000-0000 형식)
 * @returns {Promise<{ ok: boolean, debug_code?: string }>}
 */
export async function sendVerificationCode(phone) {
  if (!phone || !phone.trim()) {
    throw new Error('휴대폰 번호를 입력해주세요.');
  }

  // TODO: 실제 SMS 도입 시 아래 구현 교체
  // const res = await fetch('/api/sms/send', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone }),
  // });
  // if (!res.ok) throw new Error((await res.json()).error || 'SMS 발송 실패');
  // return { ok: true };

  if (!IS_DEV) {
    // 프로덕션에서는 실제 SMS 서비스 연동 전까지 오류 반환
    throw new Error('SMS 서비스가 아직 연동되지 않았습니다. 관리자에게 문의하세요.');
  }

  // 개발 환경: 고정 코드 123456 사용
  const code = '123456';
  _pending.set(phone.trim(), { code, expiresAt: Date.now() + 3 * 60 * 1000 });
  console.debug(`[smsService] DEV 인증코드 발송 → ${phone}: ${code}`);
  return { ok: true, debug_code: code };
}

/**
 * 인증번호 검증
 * @param {string} phone
 * @param {string} code
 * @returns {Promise<{ ok: boolean }>}
 */
export async function verifyCode(phone, code) {
  if (!phone || !code) throw new Error('휴대폰 번호와 인증번호를 입력해주세요.');

  // TODO: 실제 SMS 도입 시 아래 구현 교체
  // const res = await fetch('/api/sms/verify', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ phone, code }),
  // });
  // if (!res.ok) throw new Error((await res.json()).error || '인증 실패');
  // return { ok: true };

  if (!IS_DEV) {
    throw new Error('SMS 서비스가 아직 연동되지 않았습니다.');
  }

  const entry = _pending.get(phone.trim());
  if (!entry) throw new Error('인증번호를 먼저 요청해주세요.');
  if (Date.now() > entry.expiresAt) {
    _pending.delete(phone.trim());
    throw new Error('인증번호가 만료되었습니다. 다시 요청해주세요.');
  }
  if (entry.code !== code.trim()) {
    throw new Error('인증번호가 올바르지 않습니다.');
  }
  _pending.delete(phone.trim());
  return { ok: true };
}

/**
 * 이름 + 휴대폰으로 아이디(이메일) 찾기
 * @param {string} name
 * @param {string} phone
 * @returns {Promise<{ userId: string }>} 마스킹된 이메일
 */
export async function findIdByNameAndPhone(name, phone) {
  // TODO: SMS 인증 완료 후 서버 API 호출로 교체
  // const res = await fetch('/api/auth/find-id', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ name, phone }),
  // });
  // if (!res.ok) throw new Error((await res.json()).error || '계정을 찾을 수 없습니다.');
  // return res.json();

  throw new Error('SMS 인증 서비스 연동 후 이용 가능합니다.');
}

/**
 * 비밀번호 재설정 권한 검증 (이름 + 이메일 + 인증 완료 여부)
 * @param {string} userId - 이메일
 * @param {string} name
 * @returns {Promise<{ token: string }>} 일회용 재설정 토큰
 */
export async function requestPasswordResetToken(userId, name) {
  // TODO: SMS 인증 완료 후 서버 API 호출로 교체
  // const res = await fetch('/api/auth/request-pw-reset', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({ userId, name }),
  // });
  // if (!res.ok) throw new Error((await res.json()).error || '인증 실패');
  // return res.json();

  throw new Error('SMS 인증 서비스 연동 후 이용 가능합니다.');
}
