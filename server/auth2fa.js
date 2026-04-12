/**
 * 관리자 2차 인증(2FA) 시스템
 * 
 * 지원 방식:
 * 1. TOTP (Time-based One-Time Password) - Google Authenticator, Authy 등
 * 2. SMS OTP (선택사항, Twilio/AWS SNS 필요)
 * 3. Email OTP (선택사항, Nodemailer 필요)
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * TOTP 설정 생성 (최초 1회)
 * @param {string} adminId - 관리자 식별자 (예: 'admin' 또는 이메일)
 * @returns {Promise<{secret: string, qrCode: string, backupCodes: string[]}>}
 */
async function generateTOTPSecret(adminId = 'admin') {
  // TOTP Secret 생성
  const secret = speakeasy.generateSecret({
    name: `Share Unity (${adminId})`,
    issuer: 'Share Unity Portal',
    length: 32
  });

  // QR 코드 생성 (Google Authenticator 등록용)
  const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url);

  // 백업 코드 생성 (앱 분실 시 복구용)
  const backupCodes = Array.from({ length: 10 }, () => 
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );

  return {
    secret: secret.base32, // DB에 저장할 시크릿
    qrCode: qrCodeUrl,     // 클라이언트에 전달할 QR 코드
    backupCodes            // 안전한 곳에 저장 (DB에 해시하여 저장 권장)
  };
}

/**
 * TOTP 검증
 * @param {string} secret - DB에 저장된 TOTP 시크릿
 * @param {string} token - 사용자가 입력한 6자리 코드
 * @param {number} window - 시간 허용 범위 (기본 1 = ±30초)
 * @returns {boolean} 검증 성공 여부
 */
function verifyTOTP(secret, token, window = 1) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window // 1 = 현재 ±30초 허용 (네트워크 지연 고려)
  });
}

/**
 * 백업 코드 검증 (해시 비교)
 * @param {string} inputCode - 사용자가 입력한 백업 코드
 * @param {string[]} hashedCodes - DB에 저장된 해시된 백업 코드 목록
 * @returns {number} 매칭된 코드의 인덱스 (-1이면 실패)
 */
function verifyBackupCode(inputCode, hashedCodes) {
  const inputHash = crypto.createHash('sha256').update(inputCode.toUpperCase()).digest('hex');
  return hashedCodes.findIndex(hash => hash === inputHash);
}

/**
 * 백업 코드 해시화 (DB 저장용)
 * @param {string[]} backupCodes - 생성된 백업 코드
 * @returns {string[]} 해시된 코드 목록
 */
function hashBackupCodes(backupCodes) {
  return backupCodes.map(code => 
    crypto.createHash('sha256').update(code.toUpperCase()).digest('hex')
  );
}

/**
 * SMS OTP 생성 및 전송 (Twilio 예시)
 * 환경변수 필요: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 */
async function sendSMSOTP(phoneNumber, otp) {
  // Twilio 설정 (선택사항)
  if (!process.env.TWILIO_ACCOUNT_SID) {
    throw new Error('SMS OTP requires TWILIO_ACCOUNT_SID env variable');
  }

  const twilio = require('twilio')(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );

  await twilio.messages.create({
    body: `Share Unity 관리자 인증코드: ${otp} (5분간 유효)`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phoneNumber
  });
}

/**
 * Email OTP 생성 및 전송 (Nodemailer 예시)
 * 환경변수 필요: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
 */
async function sendEmailOTP(email, otp) {
  const nodemailer = require('nodemailer');

  if (!process.env.SMTP_HOST) {
    throw new Error('Email OTP requires SMTP_HOST env variable');
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  await transporter.sendMail({
    from: `"Share Unity" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Share Unity 관리자 인증코드',
    html: `
      <h2>관리자 로그인 인증코드</h2>
      <p>아래 코드를 입력하여 로그인을 완료하세요:</p>
      <h1 style="color: #3b82f6; letter-spacing: 5px;">${otp}</h1>
      <p><small>이 코드는 5분간 유효합니다.</small></p>
    `
  });
}

/**
 * 간단한 OTP 생성 (6자리 숫자)
 */
function generateSimpleOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

module.exports = {
  generateTOTPSecret,
  verifyTOTP,
  verifyBackupCode,
  hashBackupCodes,
  sendSMSOTP,
  sendEmailOTP,
  generateSimpleOTP
};
