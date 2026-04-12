/**
 * 관리자 2차 인증(2FA) 데이터베이스 스키마
 * 
 * SQLite 기준으로 작성되었으며, PostgreSQL로 변환 시 타입 조정 필요
 */

-- 관리자 2FA 설정 테이블
CREATE TABLE IF NOT EXISTS admin_2fa_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adminId TEXT NOT NULL UNIQUE,           -- 관리자 식별자 (예: 'admin' 또는 이메일)
  totpSecret TEXT,                        -- TOTP 시크릿 (암호화 권장)
  isEnabled INTEGER DEFAULT 0,            -- 2FA 활성화 여부 (0=비활성, 1=활성)
  backupCodesHash TEXT,                   -- 백업 코드 해시 (JSON 배열 문자열)
  phoneNumber TEXT,                       -- SMS OTP용 전화번호 (선택)
  email TEXT,                             -- Email OTP용 이메일 (선택)
  preferredMethod TEXT DEFAULT 'TOTP',    -- 기본 인증 방식 (TOTP|SMS|EMAIL)
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

-- 2FA 로그인 시도 기록 (보안 감사용)
CREATE TABLE IF NOT EXISTS admin_2fa_attempts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adminId TEXT NOT NULL,
  method TEXT NOT NULL,                   -- TOTP|SMS|EMAIL|BACKUP
  success INTEGER NOT NULL,               -- 0=실패, 1=성공
  ipAddress TEXT,
  userAgent TEXT,
  attemptedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (adminId) REFERENCES admin_2fa_settings(adminId)
);

-- 임시 OTP 저장 테이블 (SMS/Email OTP용)
CREATE TABLE IF NOT EXISTS admin_temp_otp (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  adminId TEXT NOT NULL,
  otp TEXT NOT NULL,                      -- 6자리 OTP (해시 권장)
  method TEXT NOT NULL,                   -- SMS|EMAIL
  expiresAt TEXT NOT NULL,                -- 만료 시간 (5분)
  used INTEGER DEFAULT 0,                 -- 사용 여부 (0=미사용, 1=사용됨)
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (adminId) REFERENCES admin_2fa_settings(adminId)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_admin_2fa_settings_adminId ON admin_2fa_settings(adminId);
CREATE INDEX IF NOT EXISTS idx_admin_2fa_attempts_adminId ON admin_2fa_attempts(adminId);
CREATE INDEX IF NOT EXISTS idx_admin_temp_otp_adminId_expires ON admin_temp_otp(adminId, expiresAt);

-- PostgreSQL 변환 예시 (참고용)
/*
CREATE TABLE admin_2fa_settings (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL UNIQUE,
  totp_secret TEXT,
  is_enabled BOOLEAN DEFAULT FALSE,
  backup_codes_hash JSONB,               -- PostgreSQL은 JSONB 타입 사용 가능
  phone_number VARCHAR(20),
  email VARCHAR(255),
  preferred_method VARCHAR(10) DEFAULT 'TOTP',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_2fa_attempts (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL REFERENCES admin_2fa_settings(admin_id),
  method VARCHAR(10) NOT NULL,
  success BOOLEAN NOT NULL,
  ip_address INET,
  user_agent TEXT,
  attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE admin_temp_otp (
  id SERIAL PRIMARY KEY,
  admin_id VARCHAR(255) NOT NULL REFERENCES admin_2fa_settings(admin_id),
  otp VARCHAR(6) NOT NULL,
  method VARCHAR(10) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_2fa_settings_admin_id ON admin_2fa_settings(admin_id);
CREATE INDEX idx_admin_2fa_attempts_admin_id ON admin_2fa_attempts(admin_id);
CREATE INDEX idx_admin_temp_otp_admin_id_expires ON admin_temp_otp(admin_id, expires_at);
*/
