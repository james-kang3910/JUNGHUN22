const path = require('path');
// Load environment variables in development; in production Railway injects env vars.
try {
  // eslint-disable-next-line global-require
  const dotenv = require('dotenv');
  dotenv.config({ path: path.join(__dirname, '..', '.env') });
} catch (e) {
  // If dotenv is not installed in the environment, ignore (production platforms inject env vars)
}

const http = require('http');
const { Server: SocketIOServer } = require('socket.io');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const sharp = require('sharp');
const logger = require('./logger');
const bcrypt = require('bcryptjs');
const webpush = require('web-push');

// VAPID keys for push notifications
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || 'BI_dbWUHjVwx8YgYtC-HqutXd-ENqCfKiZrM1LC3FdRRdMAoGCr4OR7xYYXolpCnL66IjoN1c3VQAEJtaBnoUTk';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || 'wz6mVKS2trEKnHMCUN6UfumWYojwCZLF8Rcy_0cOk2Y';
webpush.setVapidDetails('mailto:admin@smi.ceo', VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// Environment variables
const NODE_ENV = process.env.NODE_ENV || 'development';
const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;
const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = !!DATABASE_URL && DATABASE_URL.startsWith('postgres');

// QR signing secret (HMAC).
// - Postgres(실서비스/배포)에서는 production에서 반드시 환경변수로 설정.
// - Forcing Postgres means we always expect QR_SECRET configured in production; fallback allowed in dev only if explicitly set.
const QR_SECRET = process.env.QR_SECRET || process.env.JWT_SECRET || ((NODE_ENV === 'production' && USE_POSTGRES) ? '' : 'dev_qr_secret_change_me');

function base64urlEncode(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64urlDecodeToString(input) {
  const padLen = (4 - (input.length % 4)) % 4;
  const padded = (input + '='.repeat(padLen)).replace(/-/g, '+').replace(/_/g, '/');
  return Buffer.from(padded, 'base64').toString('utf8');
}

function signQrPayload(payloadObj) {
  if (!QR_SECRET) {
    throw new Error('QR_SECRET is not configured');
  }
  const header = { alg: 'HS256', typ: 'SUQR' };
  const headerB64 = base64urlEncode(JSON.stringify(header));
  const payloadB64 = base64urlEncode(JSON.stringify(payloadObj));
  const data = `${headerB64}.${payloadB64}`;
  const sig = crypto.createHmac('sha256', QR_SECRET).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  return `${data}.${sig}`;
}

function verifyQrPayload(token) {
  if (!QR_SECRET) {
    throw new Error('QR_SECRET is not configured');
  }
  if (!token || typeof token !== 'string') {
    return { ok: false, error: 'qrPayload required' };
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { ok: false, error: 'invalid token format' };
  }
  const [headerB64, payloadB64, sig] = parts;
  const data = `${headerB64}.${payloadB64}`;
  const expected = crypto.createHmac('sha256', QR_SECRET).update(data).digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
  try {
    const sigOk = crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
    if (!sigOk) return { ok: false, error: 'invalid signature' };
  } catch (e) {
    return { ok: false, error: 'invalid signature' };
  }
  let payload;
  try {
    payload = JSON.parse(base64urlDecodeToString(payloadB64));
  } catch (e) {
    return { ok: false, error: 'invalid payload' };
  }
  if (!payload || !payload.shopId) {
    return { ok: false, error: 'payload missing shopId' };
  }
  const exp = Number(payload.exp);
  if (!Number.isFinite(exp)) {
    return { ok: false, error: 'payload missing exp' };
  }
  if (Date.now() > exp) {
    return { ok: false, error: 'token expired' };
  }
  return { ok: true, payload };
}

logger.info(`Starting server in ${NODE_ENV} mode`);
logger.info(`Database: ${USE_POSTGRES ? 'PostgreSQL' : 'SQLite'}`);

// Database connection
let db;

if (USE_POSTGRES) {
  // PostgreSQL setup
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });
  
  db = {
    query: async (text, params) => {
      const result = await pool.query(text, params);
      return result.rows;
    },
    run: async (text, params) => {
      await pool.query(text, params);
    },
    get: async (text, params) => {
      const result = await pool.query(text, params);
      return result.rows[0] || null;
    }
  };
  // compatibility alias
  db.all = async (text, params) => {
    return await db.query(text, params);
  };
  db._pool = pool; // 트랜잭션용 직접 클라이언트 접근

  logger.info('PostgreSQL connection pool created');
  
  // ★ 자동 마이그레이션: region_scope, region_ids 컬럼 추가
  (async () => {
    try {
      await pool.query(`
        ALTER TABLE missions 
        ADD COLUMN IF NOT EXISTS region_scope TEXT DEFAULT 'ALL',
        ADD COLUMN IF NOT EXISTS region_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
        ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general'
      `);
      await pool.query(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50) DEFAULT 'points'`);
      await pool.query(`
        ALTER TABLE events 
        ADD COLUMN IF NOT EXISTS region_scope TEXT DEFAULT 'ALL',
        ADD COLUMN IF NOT EXISTS region_ids TEXT[] DEFAULT ARRAY[]::TEXT[],
        ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'general'
      `);
      await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50) DEFAULT 'points'`);
      await pool.query(`ALTER TABLE events ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0`);
      logger.info('✅ Auto-migration: region_scope, region_ids, category columns added');
    } catch (err) {
      logger.error('Auto-migration failed (may already exist):', err.message);
    }
  })();

  // ★ 자동 마이그레이션: voucher_ledger 상점 지급 지원 컬럼
  (async () => {
    try {
      await pool.query(`ALTER TABLE voucher_ledger ADD COLUMN IF NOT EXISTS target_type VARCHAR(10) DEFAULT 'member'`);
      await pool.query(`ALTER TABLE voucher_ledger ADD COLUMN IF NOT EXISTS shop_id VARCHAR(255)`);
      // serial_no 자동 연번(시퀀스) 추가 — Postgres는 시퀀스 사용, 이미 존재하면 무시
      try {
        await pool.query(`CREATE SEQUENCE IF NOT EXISTS voucher_serial_seq START 1`);
        await pool.query(`ALTER TABLE voucher_ledger ADD COLUMN IF NOT EXISTS serial_no BIGINT DEFAULT nextval('voucher_serial_seq')`);
        await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS idx_voucher_ledger_serial ON voucher_ledger(serial_no)`);
      } catch (e) {
        // 시퀀스/컬럼 생성 중 에러는 무시
      }
      logger.info('✅ Auto-migration: voucher_ledger target_type, shop_id, serial_no columns added');
    } catch (err) {
      logger.error('Auto-migration voucher_ledger failed:', err.message);
    }
  })();
} else {
  // SQLite setup (development fallback)
  const sqlite3 = require('sqlite3').verbose();
  // 환경변수로 DB 경로 관리 (배포 시 영속성 보장)
  const DB_FILE = process.env.DATABASE_PATH || path.join(__dirname, 'data', 'database.db');
  
  // 디렉터리 생성
  const dbDir = path.dirname(DB_FILE);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, '');
  }
  
  const sqliteDb = new sqlite3.Database(DB_FILE);
  
  db = {
    query: (text, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.all(text, params, (err, rows) => {
          if (err) reject(err);
          else resolve(rows || []);
        });
      });
    },
    run: (text, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.run(text, params, function(err) {
          if (err) reject(err);
          else resolve(this);
        });
      });
    },
    get: (text, params = []) => {
      return new Promise((resolve, reject) => {
        sqliteDb.get(text, params, (err, row) => {
          if (err) reject(err);
          else resolve(row || null);
        });
      });
    }
  };
  // compatibility alias
  db.all = async (text, params) => {
    return await db.query(text, params);
  };
  
  logger.info('SQLite database connected');
  logger.info(`📂 DB ABSOLUTE PATH: ${DB_FILE}`);
}

// SQL Logging Helper (FORENSIC MODE)
const SQL_LOG_ENABLED = process.env.SQL_LOG === 'true' || NODE_ENV === 'development';
function logSQL(operation, route, sql, params, resultCount) {
  if (!SQL_LOG_ENABLED) return;

  // Backward compatible signature support:
  // - logSQL(operation, route, sql, params, resultCount)
  // - logSQL(label, sql, params, resultCount)
  let op = operation;
  let rt = route;
  let query = sql;
  let pr = params;
  let rc = resultCount;

  if (typeof query !== 'string' && typeof rt === 'string') {
    // If the 3-arg form is used, shift arguments.
    // Example: logSQL('SomeLabel', 'SELECT ...', [1,2,3])
    query = rt;
    pr = sql;
    rc = params;
    rt = '';
  }

  if (typeof query !== 'string') query = String(query);

  const routePart = rt ? ` | Route: ${rt}` : '';
  const resultsPart = rc !== undefined ? ` | Results: ${rc}` : '';
  logger.info(`[SQL] ${op}${routePart} | Params: ${JSON.stringify(pr)}${resultsPart}`);
  logger.info(`[SQL] Query: ${query.substring(0, 200)}...`);
}

// Write Logging Helper (no-op in production)
function logForensicWrite({ route, method, body, sql, params, dbResult, result }) {
  // logging removed for production security
}

function jsonOk(res, payload = {}) {
  return res.json({ ok: true, success: true, ...payload });
}

function jsonFail(res, status, error, extra = {}) {
  return res.status(status).json({ ok: false, success: false, error: error || 'Unknown error', ...extra });
}

function parseLegacyNoticePk(rawId) {
  const text = String(rawId || '').trim();
  const match = /^notice_(\d+)$/.exec(text);
  if (!match) return null;
  const parsed = Number(match[1]);
  // PostgreSQL integer(int4) 범위를 넘는 값은 legacy PK로 취급하지 않는다.
  if (!Number.isSafeInteger(parsed)) return null;
  if (parsed < 1 || parsed > 2147483647) return null;
  return parsed;
}

function readCookie(req, name) {
  try {
    const raw = req.headers && req.headers.cookie ? String(req.headers.cookie) : '';
    if (!raw) return null;
    const parts = raw.split(';').map((p) => p.trim());
    for (const part of parts) {
      const idx = part.indexOf('=');
      if (idx <= 0) continue;
      const k = part.slice(0, idx);
      if (k === name) return decodeURIComponent(part.slice(idx + 1));
    }
    return null;
  } catch {
    return null;
  }
}

function getAuthToken(req) {
  try {
    const h = req.headers?.authorization;
    if (h && String(h).startsWith('Bearer ')) return String(h).slice('Bearer '.length);
  } catch (e) {}
  const fromBody = req.body?.token;
  if (fromBody) return String(fromBody);
  const fromQuery = req.query?.token;
  if (fromQuery) return String(fromQuery);
  const fromCookie = readCookie(req, 'su_token');
  if (fromCookie) return String(fromCookie);
  return null;
}

// ============================================
// Response Normalization Utilities
// PostgreSQL (snake_case) ↔ SQLite (camelCase) 통일
// ============================================

function normalizeMember(row) {
  if (!row) return null;
  return {
    ...row,
    // Ensure both camelCase and snake_case fields exist for compatibility
    id: row.id || row.memberId || row.member_id,
    memberId: row.memberId || row.member_id,
    supplyManager: row.supplyManager !== undefined ? row.supplyManager : row.supply_manager,
    distributionManager: row.distributionManager !== undefined ? row.distributionManager : row.distribution_manager,
    sdMark: row.sdMark !== undefined ? row.sdMark : row.sd_mark,
    regionId: row.regionId || row.region_id,
    districtId: row.districtId || row.district_id || null,
    address: row.address || null,
    createdAt: row.createdAt || row.created_at,
    updatedAt: row.updatedAt || row.updated_at,
    cardPublic: row.cardPublic !== undefined ? row.cardPublic : row.card_public,
    passwordHash: row.passwordHash || row.password_hash
  };
}

function normalizeMembers(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeMember);
}

function normalizeSession(row) {
  if (!row) return null;
  return {
    ...row,
    sessionId: row.sessionId || row.session_id,
    memberId: row.memberId || row.member_id,
    signedAt: row.signedAt || row.signed_at,
    expiresAt: row.expiresAt || row.expires_at
  };
}

function normalizeSessions(rows) {
  if (!Array.isArray(rows)) return [];
  return rows.map(normalizeSession);
}

logger.info('Response normalization utilities defined at module level');

// ============================================
// requireAuth 미들웨어 — 세션 기반 본인 인증 + role 조회
// Authorization: Bearer <session_token> 헤더 필수
// 성공 시 req.authMemberId, req.authRole 주입
// ============================================
async function requireAuth(req, res, next) {
  try {
    const token = getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized: 로그인이 필요합니다.' });
    const row = USE_POSTGRES
      ? await db.get(
          'SELECT s.member_id, m.role, m.name FROM sessions s JOIN members m ON s.member_id = m.member_id WHERE s.session_id = $1 AND s.status = $2',
          [token, 'ACTIVE']
        )
      : await db.get(
          'SELECT s.memberId, m.role, m.name FROM sessions s JOIN members m ON s.memberId = m.memberId WHERE s.sessionId = ? AND s.status = ?',
          [token, 'ACTIVE']
        );
    if (!row) return res.status(401).json({ error: 'Unauthorized: 세션이 만료되었습니다.' });
    req.authMemberId = String(row.member_id || row.memberId);
    req.authRole = String(row.role || 'USER').toUpperCase();
    req.authMemberName = String(row.name || '').trim();
    next();
  } catch (err) {
    logger.error('requireAuth error:', err);
    return res.status(500).json({ error: 'Auth check failed' });
  }
}

// 관리자 role 체크 헬퍼 — ADMIN, SUPER_ADMIN, WEBSITE_ADMIN 모두 허용
function isAdminRole(role) {
  return ['ADMIN', 'SUPER_ADMIN', 'WEBSITE_ADMIN'].includes(String(role || '').toUpperCase());
}

function isRegionSuperManagerRole(role) {
  const normalized = String(role || '').toUpperCase();
  return normalized === 'REGION_ADMIN' || normalized === 'REGION_SUPER_MANAGER';
}

function isRegionManagerRole(role) {
  return String(role || '').toUpperCase() === 'REGION_MANAGER';
}

function generateTemporaryPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  const bytes = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) {
    out += chars[bytes[i] % chars.length];
  }
  return out;
}

async function canModerateAuditionSubmission(memberId, role, submissionId) {
  const normalizedRole = String(role || '').toUpperCase();
  if (isAdminRole(normalizedRole)) return true;
  if (!USE_POSTGRES) return false;

  if (isRegionSuperManagerRole(normalizedRole)) {
    return true;
  }

  if (!isRegionManagerRole(normalizedRole)) return false;

  const row = await db.get(
    `SELECT 1
       FROM audition_submissions s
       JOIN auditions a ON a.audition_id = s.audition_id
       JOIN members m ON m.member_id = $1 AND m.region_id = a.region_id
      WHERE s.submission_id = $2`,
    [memberId, submissionId]
  );
  return !!row;
}

function getSubmissionApprovalStatus(row) {
  if (!row) return 'pending';
  const raw = USE_POSTGRES ? row.approval_status : row.approvalStatus;
  const status = String(raw || 'pending').trim().toLowerCase();
  if (status === 'pending' || status === 'approved' || status === 'rejected') return status;
  return 'pending';
}

function mapAuditionSubmissionForViewer(row, auth = {}, options = {}) {
  const memberId = USE_POSTGRES ? row.member_id : row.memberId;
  const approvalStatus = getSubmissionApprovalStatus(row);
  const isAdmin = isAdminRole(auth.role);
  const isOwner = auth.memberId && String(auth.memberId) === String(memberId);
  const canViewMedia = approvalStatus === 'approved' || isAdmin;
  const includeInList = approvalStatus === 'approved' || isAdmin || isOwner;
  if (!includeInList && !options.forceInclude) return null;

  const base = USE_POSTGRES ? {
    id: row.submission_id,
    submissionId: row.submission_id,
    auditionId: row.audition_id,
    memberId: row.member_id,
    memberName: row.member_name,
    title: row.title,
    mediaType: canViewMedia ? row.media_type : 'locked',
    mediaUrl: canViewMedia ? row.media_url : '',
    thumbnailUrl: canViewMedia ? row.thumbnail_url : '',
    rankLabel: row.rank_label || '',
    votesCount: row.votes_count || row.votesCount || 0,
    voted: !!row.voted,
    approvalStatus,
    locked: !canViewMedia,
    createdAt: row.created_at,
  } : {
    id: row.submissionId,
    submissionId: row.submissionId,
    auditionId: row.auditionId,
    memberId: row.memberId,
    memberName: row.member_name,
    title: row.title,
    mediaType: canViewMedia ? row.mediaType : 'locked',
    mediaUrl: canViewMedia ? row.mediaUrl : '',
    thumbnailUrl: canViewMedia ? row.thumbnailUrl : '',
    rankLabel: row.rankLabel || '',
    votesCount: row.votesCount || row.votes_count || 0,
    voted: !!row.voted,
    approvalStatus,
    locked: !canViewMedia,
    createdAt: row.createdAt,
  };
  return base;
}

async function getOptionalAuth(req) {
  const token = getAuthToken(req);
  if (!token) return { memberId: null, role: 'USER' };
  const row = USE_POSTGRES
    ? await db.get(
        'SELECT s.member_id, m.role FROM sessions s JOIN members m ON s.member_id = m.member_id WHERE s.session_id = $1 AND s.status = $2',
        [token, 'ACTIVE']
      )
    : await db.get(
        'SELECT s.memberId, m.role FROM sessions s JOIN members m ON s.memberId = m.memberId WHERE s.sessionId = ? AND s.status = ?',
        [token, 'ACTIVE']
      );
  if (!row) return { memberId: null, role: 'USER' };
  return {
    memberId: String(row.member_id || row.memberId || ''),
    role: String(row.role || 'USER').toUpperCase(),
  };
}

function isPointsTransferEnabledValue(raw) {
  const value = String(raw ?? 'true').trim().toLowerCase();
  return !['false', '0', 'off', 'no', 'disabled'].includes(value);
}

function canViewMemberPoints(auth, targetMemberId) {
  if (targetMemberId === 'all') return isAdminRole(auth?.role);
  return String(auth?.memberId || '') === String(targetMemberId) || isAdminRole(auth?.role);
}

async function lockMemberPointLedger(memberId) {
  if (!memberId || !USE_POSTGRES) return;
  await db.run(
    `SELECT ledger_id FROM point_ledger WHERE member_id = $1 FOR UPDATE`,
    [memberId]
  );
}

async function getMemberPointBalance(memberId) {
  const balanceQuery = USE_POSTGRES
    ? "SELECT COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 0 ELSE amount END), 0) as balance FROM point_ledger WHERE member_id = $1"
    : "SELECT COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 0 ELSE amount END), 0) as balance FROM point_ledger WHERE memberId = ?";
  const balanceRow = await db.get(balanceQuery, [memberId]);
  return Number(balanceRow?.balance || 0);
}

async function canManageApartmentRegion(memberId, role, regionId) {
  const normalizedRole = String(role || '').toUpperCase();
  if (!memberId || !regionId) {
    console.log('[canManageApartmentRegion] DENY: missing memberId or regionId', { memberId, regionId });
    return false;
  }
  if (isAdminRole(normalizedRole) || isRegionSuperManagerRole(normalizedRole)) {
    console.log('[canManageApartmentRegion] ALLOW: admin/super-manager role', { memberId, normalizedRole, regionId });
    return true;
  }
  if (!isRegionManagerRole(normalizedRole)) {
    console.log('[canManageApartmentRegion] DENY: not region manager role', { memberId, normalizedRole, regionId });
    return false;
  }

  if (USE_POSTGRES) {
    const ownRegionRow = await db.get('SELECT 1 FROM members WHERE member_id = $1 AND region_id = $2', [memberId, regionId]);
    if (ownRegionRow) {
      console.log('[canManageApartmentRegion] ALLOW: found in members table', { memberId, regionId });
      return true;
    }

    const assignedRow = await db.get(
      'SELECT 1 FROM region_admin_assignments WHERE member_id = $1 AND region_id = $2',
      [memberId, regionId]
    );
    const result = !!assignedRow;
    if (!result) {
      console.log('[canManageApartmentRegion] DENY: not in members or assignments', { memberId, regionId });
    } else {
      console.log('[canManageApartmentRegion] ALLOW: found in region_admin_assignments', { memberId, regionId });
    }
    return result;
  }

  const row = await db.get('SELECT 1 FROM members WHERE memberId = ? AND regionId = ?', [memberId, regionId]);
  console.log('[canManageApartmentRegion] SQLite result:', { memberId, regionId, found: !!row });
  return !!row;
}

// Initialize database tables
async function initDatabase() {
  try {
    if (USE_POSTGRES) {
      // PostgreSQL schema
      await db.run(`
        CREATE TABLE IF NOT EXISTS members (
          member_id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE,
          name VARCHAR(100),
          phone VARCHAR(20),
          password_hash TEXT,
          status VARCHAR(20) DEFAULT 'ACTIVE',
          role VARCHAR(20) DEFAULT 'USER',
          bio TEXT,
          links JSONB,
          card_public BOOLEAN DEFAULT false,
          sd_mark INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      
      try {
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS bio TEXT`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS links JSONB`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS card_public BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS supply_manager BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS distribution_manager BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS sd_mark INTEGER`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS password_hash TEXT`);
          await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS card_slug VARCHAR(60)`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS address TEXT`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)`);
        try { await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_members_card_slug ON members(card_slug) WHERE card_slug IS NOT NULL`); } catch (e2) {}
      } catch (e) {
        // Columns may already exist
      }
      
      await db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          session_id VARCHAR(255) PRIMARY KEY,
          member_id INTEGER REFERENCES members(member_id) ON DELETE CASCADE,
          status VARCHAR(20) DEFAULT 'ACTIVE',
          signed_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          expires_at TIMESTAMPTZ
        )
      `);
      
      // ── 기존 테이블의 TIMESTAMP(without TZ) → TIMESTAMPTZ 자동 마이그레이션 ──
      // 이전에 TIMESTAMP로 생성된 컬럼은 UTC 값이 저장돼 있으므로 AT TIME ZONE 'UTC'로 변환
      await db.run(`ALTER TABLE sessions ALTER COLUMN expires_at TYPE TIMESTAMPTZ USING expires_at AT TIME ZONE 'UTC'`).catch(() => {});
      await db.run(`ALTER TABLE sessions ALTER COLUMN signed_at TYPE TIMESTAMPTZ USING signed_at AT TIME ZONE 'UTC'`).catch(() => {});
      
      await db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_member ON sessions(member_id)`);

      // ── 역할 관리: 지역관리자 ↔ 지역 매핑 테이블 ──
      await db.run(`
        CREATE TABLE IF NOT EXISTS region_admin_assignments (
          id SERIAL PRIMARY KEY,
          member_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
          region_id VARCHAR(100) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(member_id, region_id)
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_raa_member ON region_admin_assignments(member_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_raa_region ON region_admin_assignments(region_id)`);

      // ── 웹사이트 관리자 자동 role 업데이트 ──
      // 이메일 기반 (SUPER_ADMIN_EMAIL — 권장, ID 불변 보장)
      const _superAdminEmails = (process.env.SUPER_ADMIN_EMAIL || '')
        .split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
      for (const _email of _superAdminEmails) {
        await db.run(`UPDATE members SET role = 'WEBSITE_ADMIN' WHERE LOWER(email) = $1`, [_email]);
      }
      // ID 기반 하위호환 (SUPER_ADMIN_MEMBER_ID)
      const _websiteAdminIds = (process.env.SUPER_ADMIN_MEMBER_ID || '')
        .split(',').map(s => s.trim()).filter(Boolean);
      for (const _wid of _websiteAdminIds) {
        await db.run(`UPDATE members SET role = 'WEBSITE_ADMIN' WHERE member_id = $1`, [_wid]);
      }
      const _allSuperSet = [..._superAdminEmails, ..._websiteAdminIds];
      if (_allSuperSet.length > 0) {
        logger.info(`[INIT] 웹사이트 관리자 자동설정: ${_allSuperSet.join(', ')}`);
      }

      logger.info('PostgreSQL tables initialized');

      // ★ SERIAL 시퀀스 자동 보정 — 백업 복원 후 시퀀스가 어긋난 경우 방지
      try {
        await db.run(`SELECT setval('members_member_id_seq', GREATEST((SELECT COALESCE(MAX(member_id),1) FROM members), 1))`);
        await db.run(`SELECT setval('point_ledger_ledger_id_seq', GREATEST((SELECT COALESCE(MAX(ledger_id),1) FROM point_ledger), 1))`);
      } catch(e) { logger.warn('[INIT] 시퀀스 보정 실패 (신규 DB라면 무시):', e.message); }
    } else {
      // SQLite schema (development)
      await db.run(`
        CREATE TABLE IF NOT EXISTS members (
          memberId TEXT PRIMARY KEY,
          name TEXT,
          email TEXT,
          phone TEXT,
          password TEXT,
          passwordHash TEXT,
          regionId TEXT,
          status TEXT,
          role TEXT,
          bio TEXT,
          links TEXT,
          cardPublic INTEGER DEFAULT 0,
          sdMark INTEGER,
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      
      try {
        await db.run(`ALTER TABLE members ADD COLUMN bio TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN links TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN cardPublic INTEGER DEFAULT 0`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN sdMark INTEGER`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN supplyManager INTEGER DEFAULT 0`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN distributionManager INTEGER DEFAULT 0`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN password TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN passwordHash TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN regionId TEXT`);
      } catch (e) {}
      
      await db.run(`
        CREATE TABLE IF NOT EXISTS sessions (
          sessionId TEXT PRIMARY KEY,
          memberId TEXT,
          status TEXT,
          signedAt TEXT
        )
      `);
      
      logger.info('SQLite tables initialized');
    }

    // Ensure posts table exists (some routes expect columns like `board_type` and `created_at`)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS posts (
            post_id SERIAL PRIMARY KEY,
            title TEXT,
            body TEXT,
            board_type VARCHAR(50),
            region VARCHAR(100),
            author_id VARCHAR(255),
            is_pinned BOOLEAN DEFAULT false,
            tags TEXT,
            attachments JSONB,
            views INTEGER DEFAULT 0,
            is_public BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        // Add columns if they don't exist (migration) - run BEFORE creating indexes
        try {
          await db.run(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS author_id VARCHAR(255)`);
          await db.run(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`);
          await db.run(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS tags TEXT`);
          await db.run(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS attachments JSONB`);
          await db.run(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0`);
          await db.run(`ALTER TABLE posts ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true`);
        } catch (e) {
          // Columns may already exist or DB doesn't support IF NOT EXISTS - ignore
        }

        await db.run(`CREATE INDEX IF NOT EXISTS idx_posts_board_region ON posts(board_type, region)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(is_pinned DESC, created_at DESC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS posts (
            postId TEXT PRIMARY KEY,
            title TEXT,
            body TEXT,
            board_type TEXT,
            region TEXT,
            authorId TEXT,
            isPinned INTEGER DEFAULT 0,
            tags TEXT,
            attachments TEXT,
            views INTEGER DEFAULT 0,
            isPublic INTEGER DEFAULT 1,
            created_at TEXT,
            updated_at TEXT
          )
        `);
        // Add columns if they don't exist (SQLite migration) - run BEFORE creating indexes
        const columns = ['authorId', 'isPinned', 'tags', 'attachments', 'views', 'isPublic'];
        for (const col of columns) {
          try {
            await db.run(`ALTER TABLE posts ADD COLUMN ${col} TEXT`);
          } catch (e) {
            // Column already exists
          }
        }

        await db.run(`CREATE INDEX IF NOT EXISTS idx_posts_board_region ON posts(board_type, region)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_posts_pinned ON posts(isPinned DESC, created_at DESC)`);
      }
      logger.info('posts table ensured');
    } catch (e) {
      logger.error('posts table init error:', e);
    }
    // Ensure regions table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS regions (
            region_id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            province VARCHAR(100),
            city VARCHAR(100),
            intro TEXT,
            apt_households INTEGER,
            avg_sale_price VARCHAR(100),
            traffic_info TEXT,
            tour_spots TEXT,
            festivals TEXT,
            attractions JSONB,
            is_public BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        try {
          await db.run(`ALTER TABLE regions ADD COLUMN IF NOT EXISTS attractions JSONB`);
        } catch (e) {
          // Column already exists
        }
        try {
          await db.run(`ALTER TABLE regions ADD COLUMN IF NOT EXISTS city VARCHAR(100)`);
        } catch (e) {
          // Column already exists
        }
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS regions (
            regionId TEXT PRIMARY KEY,
            name TEXT,
            province TEXT,
            city TEXT,
            intro TEXT,
            aptHouseholds INTEGER,
            avgSalePrice TEXT,
            trafficInfo TEXT,
            tourSpots TEXT,
            festivals TEXT,
            attractions TEXT,
            isPublic INTEGER,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        
        try {
          await db.run(`ALTER TABLE regions ADD COLUMN attractions TEXT`);
        } catch (e) {
          // Column already exists
        }
        try {
          await db.run(`ALTER TABLE regions ADD COLUMN city TEXT`);
        } catch (e) {
          // Column already exists
        }

        // SSOT invariant: prevent duplicate region names
        try {
          await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_regions_name_unique ON regions(name COLLATE NOCASE)`);
        } catch (e) {
          // ignore
        }
      }
      logger.info('regions table ensured');
    } catch (e) {
      logger.error('regions table init error:', e);
    }
    // Ensure shops table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shops (
            shop_id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255),
            category VARCHAR(100),
            region VARCHAR(100),
            address TEXT,
            phone VARCHAR(20),
            description TEXT,
            hours TEXT,
            is_public BOOLEAN DEFAULT false,
            status VARCHAR(20) DEFAULT 'pending',
            owner_id VARCHAR(255),
            created_by VARCHAR(255),
            district_id VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        
        // Add owner_id column if it doesn't exist (migration)
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS owner_id VARCHAR(255)`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS created_by VARCHAR(255)`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS menus JSONB`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS status VARCHAR(20)`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS region_id INTEGER`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS registered_by VARCHAR(255)`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS thumbnail TEXT`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS business_hours TEXT`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS closed_day TEXT`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS break_time TEXT`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS recommended_menus JSONB`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS amenities JSONB`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS lat DECIMAL`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS lng DECIMAL`);
          await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS shop_images JSONB`);
          // region_id 타입을 VARCHAR로 변경 (기존 INTEGER → 문자열 regionId 지원)
          await db.run(`ALTER TABLE shops ALTER COLUMN region_id TYPE VARCHAR(255) USING region_id::text`);
        } catch (e) {
          // Column already exists, ignore
        }
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shops (
            shopId TEXT PRIMARY KEY,
            name TEXT,
            category TEXT,
            region TEXT,
            address TEXT,
            phone TEXT,
            description TEXT,
            hours TEXT,
            isPublic INTEGER,
            status TEXT,
            ownerId TEXT,
            createdBy TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        
        // Add ownerId column if it doesn't exist (migration)
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN ownerId TEXT`);
        } catch (e) {
          // Column already exists, ignore
        }
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN createdBy TEXT`);
        } catch (e) {
          // Column already exists, ignore
        }
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN menus TEXT`);
        } catch (e) {
          // Column already exists, ignore
        }
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN status TEXT`);
        } catch (e) {
          // Column already exists, ignore
        }
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN regionId INTEGER`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN registeredBy TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN thumbnail TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN businessHours TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN closedDay TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN breakTime TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN recommendedMenus TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN amenities TEXT`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN lat REAL`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN lng REAL`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE shops ADD COLUMN shopImages TEXT`);
        } catch (e) {}

      }
      logger.info('shops table ensured');
    } catch (e) {
      logger.error('shops table init error:', e);
    }
    // Ensure missions table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS missions (
            mission_id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255),
            description TEXT,
            points INTEGER DEFAULT 0,
            type VARCHAR(50),
            images JSONB DEFAULT '[]'::jsonb,
            status VARCHAR(20) DEFAULT 'ACTIVE',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS missions (
            missionId TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            points INTEGER,
            type TEXT,
            images TEXT,
            status TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
      }
      logger.info('missions table ensured');
    } catch (e) {
      logger.error('missions table init error:', e);
    }
    // Ensure events table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS events (
            event_id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255),
            description TEXT,
            region VARCHAR(100),
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            location TEXT,
            images JSONB DEFAULT '[]'::jsonb,
            is_public BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS events (
            eventId TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            region TEXT,
            startDate TEXT,
            endDate TEXT,
            location TEXT,
            images TEXT,
            isPublic INTEGER,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
      }
      logger.info('events table ensured');
    } catch (e) {
      logger.error('events table init error:', e);
    }
    // Ensure boards table exists (지역 게시판)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS boards (
            board_id SERIAL PRIMARY KEY,
            region_id VARCHAR(100) NOT NULL,
            author_id VARCHAR(255),
            author_name VARCHAR(100),
            title VARCHAR(255) NOT NULL,
            content TEXT,
            category VARCHAR(50) DEFAULT 'general',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_boards_region ON boards(region_id, created_at DESC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS boards (
            boardId INTEGER PRIMARY KEY AUTOINCREMENT,
            regionId TEXT NOT NULL,
            authorId TEXT,
            authorName TEXT,
            title TEXT NOT NULL,
            content TEXT,
            category TEXT DEFAULT 'general',
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_boards_region ON boards(regionId, createdAt DESC)`);
      }
      logger.info('boards table ensured');
    } catch (e) {
      logger.error('boards table init error:', e);
    }
    // Ensure board_comments table exists (게시판 댓글)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS board_comments (
            comment_id SERIAL PRIMARY KEY,
            board_id INTEGER NOT NULL REFERENCES boards(board_id) ON DELETE CASCADE,
            author_id VARCHAR(255),
            author_name VARCHAR(100),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_board_comments_board ON board_comments(board_id, created_at ASC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS board_comments (
            commentId INTEGER PRIMARY KEY AUTOINCREMENT,
            boardId INTEGER NOT NULL,
            authorId TEXT,
            authorName TEXT,
            content TEXT NOT NULL,
            createdAt TEXT DEFAULT (datetime('now'))
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_board_comments_board ON board_comments(boardId, createdAt ASC)`);
      }
      logger.info('board_comments table ensured');
    } catch (e) {
      logger.error('board_comments table init error:', e);
    }
    // Ensure districts table exists (시/도 하위 구/군/시)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS districts (
            district_id SERIAL PRIMARY KEY,
            region_id VARCHAR(255) NOT NULL,
            name VARCHAR(100) NOT NULL,
            slug VARCHAR(100),
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_districts_region ON districts(region_id, sort_order ASC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS districts (
            districtId INTEGER PRIMARY KEY AUTOINCREMENT,
            regionId TEXT NOT NULL,
            name TEXT NOT NULL,
            slug TEXT,
            isActive INTEGER DEFAULT 1,
            sortOrder INTEGER DEFAULT 0,
            createdAt TEXT DEFAULT (datetime('now')),
            updatedAt TEXT DEFAULT (datetime('now'))
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_districts_region ON districts(regionId, sortOrder ASC)`);
      }
      logger.info('districts table ensured');
    } catch (e) {
      logger.error('districts table init error:', e);
    }
    // Ensure apartments table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS apartments (
            apartment_id SERIAL PRIMARY KEY,
            region_id VARCHAR(255) NOT NULL,
            district_id VARCHAR(255),
            name VARCHAR(200) NOT NULL,
            address TEXT,
            households INTEGER,
            floors INTEGER,
            built_year INTEGER,
            manager_phone VARCHAR(50),
            thumbnail TEXT,
            is_active BOOLEAN DEFAULT true,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apartments_region ON apartments(region_id, sort_order ASC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apartments_district ON apartments(district_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS apartments (
            apartment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            region_id TEXT NOT NULL,
            district_id TEXT,
            name TEXT NOT NULL,
            address TEXT,
            households INTEGER,
            floors INTEGER,
            built_year INTEGER,
            manager_phone TEXT,
            thumbnail TEXT,
            is_active INTEGER DEFAULT 1,
            sort_order INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apartments_region ON apartments(region_id, sort_order ASC)`);
      }
      logger.info('apartments table ensured');
    } catch (e) {
      logger.error('apartments table init error:', e);
    }
    // Ensure apartment_posts table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS apartment_posts (
            post_id SERIAL PRIMARY KEY,
            apartment_id INTEGER NOT NULL,
            region_id VARCHAR(255),
            author_id VARCHAR(255),
            author_name VARCHAR(100),
            title VARCHAR(255) NOT NULL,
            content TEXT,
            category VARCHAR(50) DEFAULT 'general',
            post_type VARCHAR(50) DEFAULT 'board',
            images JSONB DEFAULT '[]'::jsonb,
            status VARCHAR(50),
            is_private BOOLEAN DEFAULT false,
            is_pinned BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`ALTER TABLE apartment_posts ADD COLUMN IF NOT EXISTS post_type VARCHAR(50) DEFAULT 'board'`);
        await db.run(`ALTER TABLE apartment_posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
        await db.run(`ALTER TABLE apartment_posts ADD COLUMN IF NOT EXISTS status VARCHAR(50)`);
        await db.run(`ALTER TABLE apartment_posts ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE apartment_posts ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_posts_apt ON apartment_posts(apartment_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_posts_region ON apartment_posts(region_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_posts_type ON apartment_posts(post_type, created_at DESC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS apartment_posts (
            post_id INTEGER PRIMARY KEY AUTOINCREMENT,
            apartment_id INTEGER NOT NULL,
            region_id TEXT,
            author_id TEXT,
            author_name TEXT,
            title TEXT NOT NULL,
            content TEXT,
            category TEXT DEFAULT 'general',
            post_type TEXT DEFAULT 'board',
            images TEXT,
            status TEXT,
            is_private INTEGER DEFAULT 0,
            is_pinned INTEGER DEFAULT 0,
            created_at TEXT DEFAULT (datetime('now')),
            updated_at TEXT DEFAULT (datetime('now'))
          )
        `);
        try { await db.run(`ALTER TABLE apartment_posts ADD COLUMN post_type TEXT DEFAULT 'board'`); } catch (e) {}
        try { await db.run(`ALTER TABLE apartment_posts ADD COLUMN images TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE apartment_posts ADD COLUMN status TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE apartment_posts ADD COLUMN is_private INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE apartment_posts ADD COLUMN is_pinned INTEGER DEFAULT 0`); } catch (e) {}
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_posts_apt ON apartment_posts(apartment_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_posts_type ON apartment_posts(post_type, created_at DESC)`);
      }
      logger.info('apartment_posts table ensured');
    } catch (e) {
      logger.error('apartment_posts table init error:', e);
    }
    // Ensure apartment_post_comments table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS apartment_post_comments (
            comment_id SERIAL PRIMARY KEY,
            post_id INTEGER NOT NULL,
            author_id VARCHAR(255),
            author_name VARCHAR(100),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_comments_post ON apartment_post_comments(post_id, created_at ASC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS apartment_post_comments (
            comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
            post_id INTEGER NOT NULL,
            author_id TEXT,
            author_name TEXT,
            content TEXT NOT NULL,
            created_at TEXT DEFAULT (datetime('now'))
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_apt_comments_post ON apartment_post_comments(post_id, created_at ASC)`);
      }
      logger.info('apartment_post_comments table ensured');
    } catch (e) {
      logger.error('apartment_post_comments table init error:', e);
    }

    // ── Phase A-4: 지역 허브 신규 테이블 9종 (PostgreSQL 전용) ──────────────────
    if (USE_POSTGRES) {
      // 1. region_hero_images
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_hero_images (
            image_id   VARCHAR(255) PRIMARY KEY,
            region_id  VARCHAR(255) NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
            url        TEXT NOT NULL,
            caption    VARCHAR(100),
            sort_order INT DEFAULT 0,
            is_active  BOOLEAN DEFAULT true,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_hero_region ON region_hero_images(region_id, sort_order ASC)`);
        logger.info('region_hero_images table ensured');
      } catch (e) { logger.error('region_hero_images table init error:', e); }

      // 2. region_info
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_info (
            region_id    VARCHAR(255) PRIMARY KEY REFERENCES regions(region_id) ON DELETE CASCADE,
            content      TEXT,
            images       JSONB DEFAULT '[]',
            updated_at   TIMESTAMPTZ DEFAULT NOW(),
            updated_by   VARCHAR(255)
          )
        `);
        logger.info('region_info table ensured');
      } catch (e) { logger.error('region_info table init error:', e); }

      // 3. region_travel_posts
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_travel_posts (
            post_id     VARCHAR(255) PRIMARY KEY,
            region_id   VARCHAR(255) NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
            title       VARCHAR(200) NOT NULL,
            content     TEXT,
            images      JSONB DEFAULT '[]',
            author_id   VARCHAR(255),
            view_count  INT DEFAULT 0,
            created_at  TIMESTAMPTZ DEFAULT NOW(),
            updated_at  TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_travel_posts_region ON region_travel_posts(region_id, created_at DESC)`);
        logger.info('region_travel_posts table ensured');
      } catch (e) { logger.error('region_travel_posts table init error:', e); }

      // 4. region_travel_comments
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_travel_comments (
            comment_id  VARCHAR(255) PRIMARY KEY,
            post_id     VARCHAR(255) NOT NULL REFERENCES region_travel_posts(post_id) ON DELETE CASCADE,
            author_id   VARCHAR(255) NOT NULL,
            content     TEXT NOT NULL,
            images      JSONB DEFAULT '[]',
            created_at  TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_travel_comments_post ON region_travel_comments(post_id, created_at ASC)`);
        logger.info('region_travel_comments table ensured');
      } catch (e) { logger.error('region_travel_comments table init error:', e); }

      // 5. region_events
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_events (
            event_id    VARCHAR(255) PRIMARY KEY,
            region_id   VARCHAR(255) NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
            title       VARCHAR(200) NOT NULL,
            content     TEXT,
            images      JSONB DEFAULT '[]',
            banner_url  TEXT,
            mission_id  VARCHAR(255),
            start_at    TIMESTAMPTZ,
            end_at      TIMESTAMPTZ,
            status      VARCHAR(20) DEFAULT 'active',
            author_id   VARCHAR(255),
            view_count  INT DEFAULT 0,
            created_at  TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_events_region ON region_events(region_id, status, created_at DESC)`);
        logger.info('region_events table ensured');
      } catch (e) { logger.error('region_events table init error:', e); }

      // 6. region_flyers
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_flyers (
            flyer_id       VARCHAR(255) PRIMARY KEY,
            region_id      VARCHAR(255) NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
            title          VARCHAR(200) NOT NULL,
            shop_name      VARCHAR(100),
            category       VARCHAR(50),
            images         JSONB DEFAULT '[]',
            point_reward   INT DEFAULT 0,
            point_enabled  BOOLEAN DEFAULT false,
            start_at       TIMESTAMPTZ,
            end_at         TIMESTAMPTZ,
            view_count     INT DEFAULT 0,
            is_active      BOOLEAN DEFAULT true,
            created_at     TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_flyers_region ON region_flyers(region_id, is_active, created_at DESC)`);
        logger.info('region_flyers table ensured');
      } catch (e) { logger.error('region_flyers table init error:', e); }

      // 7. region_flyer_views (UNIQUE는 부분 인덱스만 사용 - NULL 허용)
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_flyer_views (
            view_id    SERIAL PRIMARY KEY,
            flyer_id   VARCHAR(255) NOT NULL,
            member_id  VARCHAR(255),
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`
          CREATE UNIQUE INDEX IF NOT EXISTS idx_flyer_views_unique
            ON region_flyer_views(flyer_id, member_id)
            WHERE member_id IS NOT NULL
        `);
        logger.info('region_flyer_views table ensured');
      } catch (e) { logger.error('region_flyer_views table init error:', e); }

      // 8. region_festivals
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_festivals (
            festival_id  VARCHAR(255) PRIMARY KEY,
            region_id    VARCHAR(255) NOT NULL REFERENCES regions(region_id) ON DELETE CASCADE,
            title        VARCHAR(200) NOT NULL,
            content      TEXT,
            images       JSONB DEFAULT '[]',
            location     VARCHAR(200),
            start_at     TIMESTAMPTZ,
            end_at       TIMESTAMPTZ,
            author_id    VARCHAR(255) NOT NULL,
            view_count   INT DEFAULT 0,
            created_at   TIMESTAMPTZ DEFAULT NOW(),
            updated_at   TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_festivals_region ON region_festivals(region_id, created_at DESC)`);
        logger.info('region_festivals table ensured');
      } catch (e) { logger.error('region_festivals table init error:', e); }

      // 9. region_festival_comments
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_festival_comments (
            comment_id   VARCHAR(255) PRIMARY KEY,
            festival_id  VARCHAR(255) NOT NULL REFERENCES region_festivals(festival_id) ON DELETE CASCADE,
            author_id    VARCHAR(255) NOT NULL,
            content      TEXT NOT NULL,
            images       JSONB DEFAULT '[]',
            created_at   TIMESTAMPTZ DEFAULT NOW()
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_festival_comments_festival ON region_festival_comments(festival_id, created_at ASC)`);
        logger.info('region_festival_comments table ensured');
      } catch (e) { logger.error('region_festival_comments table init error:', e); }
    }
    // ── Phase A-4 끝 ────────────────────────────────────────────────────────────
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS banners (
            banner_id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(255),
            description TEXT,
            image_url TEXT,
            video_url TEXT,
            alt VARCHAR(255),
            link_url TEXT,
            regions TEXT,
            start_date TIMESTAMP,
            end_date TIMESTAMP,
            is_active BOOLEAN DEFAULT true,
            priority INTEGER DEFAULT 0,
            weight INTEGER DEFAULT 1,
            gradient_enabled BOOLEAN DEFAULT false,
            gradient_preset VARCHAR(50) DEFAULT 'dark',
            gradient_color1 VARCHAR(20) DEFAULT NULL,
            gradient_color2 VARCHAR(20) DEFAULT NULL,
            gradient_stop1 INTEGER DEFAULT 0,
            gradient_stop2 INTEGER DEFAULT 100,
            chip_label VARCHAR(100) DEFAULT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_banners_active ON banners(is_active, priority DESC)`);
        // 기존 테이블 마이그레이션: NOT NULL 제약 해제 + gradient 컬럼 추가
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS title VARCHAR(255)`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS description TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ALTER COLUMN image_url DROP NOT NULL`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS video_url TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS gradient_enabled BOOLEAN DEFAULT false`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS gradient_preset VARCHAR(50) DEFAULT 'dark'`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS gradient_color1 VARCHAR(20) DEFAULT NULL`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS gradient_color2 VARCHAR(20) DEFAULT NULL`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS gradient_stop1 INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS gradient_stop2 INTEGER DEFAULT 100`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS chip_label VARCHAR(100) DEFAULT NULL`); } catch (e) {}
        // Phase A-1: bottom_banner 슬롯 지원용 type 컬럼 + region_id 컬럼
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'main'`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN IF NOT EXISTS region_id VARCHAR(255) DEFAULT NULL`); } catch (e) {}
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS banners (
            bannerId TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            imageUrl TEXT,
            videoUrl TEXT,
            alt TEXT,
            linkUrl TEXT,
            regions TEXT,
            startDate TEXT,
            endDate TEXT,
            isActive INTEGER DEFAULT 1,
            priority INTEGER DEFAULT 0,
            weight INTEGER DEFAULT 1,
            gradientEnabled INTEGER DEFAULT 0,
            gradientPreset TEXT DEFAULT 'dark',
            gradientColor1 TEXT DEFAULT NULL,
            gradientColor2 TEXT DEFAULT NULL,
            gradientStop1 INTEGER DEFAULT 0,
            gradientStop2 INTEGER DEFAULT 100,
            chipLabel TEXT DEFAULT NULL,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        try { await db.run(`ALTER TABLE banners ADD COLUMN title TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN description TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN videoUrl TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN gradientEnabled INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN gradientPreset TEXT DEFAULT 'dark'`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN gradientColor1 TEXT DEFAULT NULL`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN gradientColor2 TEXT DEFAULT NULL`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN gradientStop1 INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN gradientStop2 INTEGER DEFAULT 100`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN chipLabel TEXT DEFAULT NULL`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN type TEXT DEFAULT 'main'`); } catch (e) {}
        try { await db.run(`ALTER TABLE banners ADD COLUMN regionId TEXT DEFAULT NULL`); } catch (e) {}
      }
      logger.info('banners table ensured');
    } catch (e) {
      logger.error('banners table init error:', e);
    }
    // Ensure reviews table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS reviews (
            review_id VARCHAR(255) PRIMARY KEY,
            shop_id VARCHAR(255) NOT NULL,
            member_id VARCHAR(255),
            author_name VARCHAR(255),
            content TEXT,
            rating INTEGER,
            status VARCHAR(20) DEFAULT 'visible',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews(shop_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_member ON reviews(member_id)`);
        try { await db.run(`ALTER TABLE reviews ADD COLUMN IF NOT EXISTS images TEXT DEFAULT '[]'`); } catch (e) {}
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS reviews (
            reviewId TEXT PRIMARY KEY,
            shopId TEXT NOT NULL,
            memberId TEXT,
            authorName TEXT,
            content TEXT,
            rating INTEGER,
            status TEXT DEFAULT 'visible',
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_reviews_shop ON reviews(shopId)`);
        try { await db.run(`ALTER TABLE reviews ADD COLUMN images TEXT DEFAULT '[]'`); } catch (e) {}
      }
      logger.info('reviews table ensured');
    } catch (e) {
      logger.error('reviews table init error:', e);
    }
    // Ensure shop_earnings table exists (for tracking shop point earnings from payments)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shop_earnings (
            earning_id SERIAL PRIMARY KEY,
            shop_id VARCHAR(255) NOT NULL,
            shop_name VARCHAR(255),
            amount INTEGER NOT NULL,
            source_tx_id VARCHAR(255),
            buyer_member_id VARCHAR(255),
            status VARCHAR(20) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_earnings_shop ON shop_earnings(shop_id, created_at DESC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shop_earnings (
            earning_id INTEGER PRIMARY KEY AUTOINCREMENT,
            shop_id TEXT NOT NULL,
            shop_name TEXT,
            amount INTEGER NOT NULL,
            source_tx_id TEXT,
            buyer_member_id TEXT,
            status TEXT DEFAULT 'active',
            created_at TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_earnings_shop ON shop_earnings(shop_id)`);
      }
      logger.info('shop_earnings table ensured');
    } catch (e) {
      logger.error('shop_earnings table init error:', e);
    }
    // Ensure shop_payout_requests table exists (for shop owner payout requests)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shop_payout_requests (
            request_id VARCHAR(255) PRIMARY KEY,
            shop_id VARCHAR(255) NOT NULL,
            amount INTEGER NOT NULL,
            bank_name VARCHAR(100),
            account_number VARCHAR(100),
            depositor_name VARCHAR(100),
            memo TEXT,
            status VARCHAR(20) DEFAULT 'PENDING',
            requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            processed_at TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_payout_shop ON shop_payout_requests(shop_id, requested_at DESC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shop_payout_requests (
            request_id TEXT PRIMARY KEY,
            shop_id TEXT NOT NULL,
            amount INTEGER NOT NULL,
            bank_name TEXT,
            account_number TEXT,
            depositor_name TEXT,
            memo TEXT,
            status TEXT DEFAULT 'PENDING',
            requested_at TEXT,
            updated_at TEXT,
            processed_at TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_payout_shop ON shop_payout_requests(shop_id)`);
      }
      logger.info('shop_payout_requests table ensured');
    } catch (e) {
      logger.error('shop_payout_requests table init error:', e);
    }

    // ── Reservations table ──
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS reservations (
            reservation_id VARCHAR(255) PRIMARY KEY,
            shop_id VARCHAR(255) NOT NULL,
            member_id INTEGER NOT NULL,
            reserved_date DATE NOT NULL,
            reserved_time VARCHAR(10) NOT NULL,
            service_name VARCHAR(200),
            number_of_people INTEGER DEFAULT 1,
            guest_name VARCHAR(100),
            guest_phone VARCHAR(30),
            notes TEXT,
            status VARCHAR(20) DEFAULT 'pending',
            reject_reason TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_reservations_shop ON reservations(shop_id, reserved_date DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_reservations_member ON reservations(member_id, created_at DESC)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS reservations (
            reservation_id TEXT PRIMARY KEY,
            shop_id TEXT NOT NULL,
            member_id INTEGER NOT NULL,
            reserved_date TEXT NOT NULL,
            reserved_time TEXT NOT NULL,
            service_name TEXT,
            number_of_people INTEGER DEFAULT 1,
            guest_name TEXT,
            guest_phone TEXT,
            notes TEXT,
            status TEXT DEFAULT 'pending',
            reject_reason TEXT,
            created_at TEXT,
            updated_at TEXT
          )
        `);
      }
      logger.info('reservations table ensured');
    } catch (e) {
      logger.error('reservations table init error:', e);
    }

    // ── Push subscriptions table ──
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS push_subscriptions (
            id SERIAL PRIMARY KEY,
            member_id INTEGER NOT NULL,
            endpoint TEXT NOT NULL,
            auth_key TEXT,
            p256dh_key TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(member_id, endpoint)
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_push_member ON push_subscriptions(member_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS push_subscriptions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            member_id INTEGER NOT NULL,
            endpoint TEXT NOT NULL,
            auth_key TEXT,
            p256dh_key TEXT,
            created_at TEXT
          )
        `);
      }
      logger.info('push_subscriptions table ensured');
    } catch (e) {
      logger.error('push_subscriptions table init error:', e);
    }

    // Ensure broadcasts table exists
        // Ensure dist_payout_requests table exists (for distribution seller payouts)
        try {
          if (USE_POSTGRES) {
            await db.run(`
              CREATE TABLE IF NOT EXISTS dist_payout_requests (
                id SERIAL PRIMARY KEY,
                seller_id VARCHAR(255) NOT NULL,
                seller_name TEXT,
                amount NUMERIC(12,2) NOT NULL DEFAULT 0,
                bank_name VARCHAR(100),
                account_number VARCHAR(100),
                depositor_name VARCHAR(100),
                memo TEXT,
                status VARCHAR(20) DEFAULT 'PENDING',
                requested_at TIMESTAMPTZ DEFAULT NOW(),
                handled_at TIMESTAMPTZ,
                handled_by TEXT,
                reject_reason TEXT
              )
            `);
            await db.run(`CREATE INDEX IF NOT EXISTS idx_dist_payout_seller ON dist_payout_requests(seller_id, requested_at DESC)`);
          } else {
            await db.run(`
              CREATE TABLE IF NOT EXISTS dist_payout_requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                seller_id TEXT NOT NULL,
                seller_name TEXT,
                amount REAL NOT NULL DEFAULT 0,
                bank_name TEXT,
                account_number TEXT,
                depositor_name TEXT,
                memo TEXT,
                status TEXT DEFAULT 'PENDING',
                requested_at TEXT,
                handled_at TEXT,
                handled_by TEXT,
                reject_reason TEXT
              )
            `);
            await db.run(`CREATE INDEX IF NOT EXISTS idx_dist_payout_seller ON dist_payout_requests(seller_id)`);
          }
          logger.info('dist_payout_requests table ensured');
        } catch (e) {
          logger.error('dist_payout_requests table init error:', e);
        }
        // Ensure broadcasts table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS broadcasts (
            broadcast_id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            video_kind VARCHAR(50),
            video_url TEXT,
            upload_url TEXT,
            upload_meta JSONB,
            region_id VARCHAR(100),
            is_public BOOLEAN DEFAULT false,
            is_live BOOLEAN DEFAULT false,
            live_started_at TIMESTAMP,
            published_at TIMESTAMP,
            legacy_id VARCHAR(255),
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_region ON broadcasts(region_id, published_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_public ON broadcasts(is_public, published_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_legacy ON broadcasts(legacy_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_live ON broadcasts(is_live)`);
        
        try {
          await db.run(`ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS is_live BOOLEAN DEFAULT false`);
          await db.run(`ALTER TABLE broadcasts ADD COLUMN IF NOT EXISTS live_started_at TIMESTAMP`);
        } catch (e) {
          // Columns may already exist
        }
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS broadcasts (
            broadcastId TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            videoKind TEXT,
            videoUrl TEXT,
            uploadUrl TEXT,
            uploadMeta TEXT,
            regionId TEXT,
            isPublic INTEGER DEFAULT 0,
            isLive INTEGER DEFAULT 0,
            liveStartedAt TEXT,
            publishedAt TEXT,
            legacyId TEXT,
            createdBy TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        
        try {
          await db.run(`ALTER TABLE broadcasts ADD COLUMN isLive INTEGER DEFAULT 0`);
        } catch (e) {}
        try {
          await db.run(`ALTER TABLE broadcasts ADD COLUMN liveStartedAt TEXT`);
        } catch (e) {}
        
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_region ON broadcasts(regionId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_public ON broadcasts(isPublic)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcasts_live ON broadcasts(isLive)`);
      }
      logger.info('broadcasts table ensured');
    } catch (e) {
      logger.error('broadcasts table init error:', e);
    }
    // Ensure broadcast_comments table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS broadcast_comments (
            comment_id VARCHAR(255) PRIMARY KEY,
            broadcast_id VARCHAR(255) NOT NULL,
            author_id VARCHAR(255),
            author_name VARCHAR(255),
            text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcast_comments_broadcast ON broadcast_comments(broadcast_id, created_at DESC)`);
        // PostgreSQL은 ADD CONSTRAINT IF NOT EXISTS 미지원 — try/catch로 처리
        try {
          await db.run(`ALTER TABLE broadcast_comments ADD CONSTRAINT fk_broadcast_comments_broadcast FOREIGN KEY (broadcast_id) REFERENCES broadcasts(broadcast_id) ON DELETE CASCADE`);
        } catch (e) { /* 이미 존재하면 무시 */ }
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS broadcast_comments (
            commentId TEXT PRIMARY KEY,
            broadcastId TEXT NOT NULL,
            authorId TEXT,
            authorName TEXT,
            text TEXT,
            createdAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_broadcast_comments_broadcast ON broadcast_comments(broadcastId)`);
      }
      logger.info('broadcast_comments table ensured');
    } catch (e) {
      logger.error('broadcast_comments table init error:', e);
    }
    // Ensure supplies table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS supplies (
            supply_id VARCHAR(255) PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            quantity INTEGER DEFAULT 0,
            media_url TEXT,
            upload_url TEXT,
            upload_meta JSONB,
            region_id VARCHAR(100),
            status VARCHAR(50) DEFAULT 'available',
            type VARCHAR(50),
            price DECIMAL(10,2),
            image_url TEXT,
            purchase_amount DECIMAL(10,2),
            completed_at TIMESTAMP,
            assigned_to VARCHAR(255),
            legacy_id VARCHAR(255),
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_region ON supplies(region_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_status ON supplies(status, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_assigned ON supplies(assigned_to)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_legacy ON supplies(legacy_id)`);
        
        // Migrations: add columns if they don't exist
        try {
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS type VARCHAR(50)`);
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS price DECIMAL(10,2)`);
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS image_url TEXT`);
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS purchase_amount DECIMAL(10,2)`);
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP`);
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS assigned_to VARCHAR(255)`);
          await db.run(`ALTER TABLE supplies ADD COLUMN IF NOT EXISTS legacy_id VARCHAR(255)`);
        } catch (e) {
          // Columns may already exist
        }
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS supplies (
            supplyId TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            description TEXT,
            quantity INTEGER DEFAULT 0,
            mediaUrl TEXT,
            uploadUrl TEXT,
            uploadMeta TEXT,
            regionId TEXT,
            status TEXT DEFAULT 'available',
            type TEXT,
            price REAL,
            imageUrl TEXT,
            purchaseAmount REAL,
            completedAt TEXT,
            assignedTo TEXT,
            legacyId TEXT,
            createdBy TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_region ON supplies(regionId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_status ON supplies(status)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_assigned ON supplies(assignedTo)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_supplies_legacy ON supplies(legacyId)`);
        
        // Migrations: add columns if they don't exist (SQLite doesn't support IF NOT EXISTS in ALTER)
        const columns = ['type', 'price', 'imageUrl', 'purchaseAmount', 'completedAt', 'assignedTo', 'legacyId'];
        for (const col of columns) {
          try {
            await db.run(`ALTER TABLE supplies ADD COLUMN ${col} TEXT`);
          } catch (e) {
            // Column already exists
          }
        }
      }
      logger.info('supplies table ensured');
    } catch (e) {
      logger.error('supplies table init error:', e);
    }
    
    // Ensure point_ledger table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS point_ledger (
            ledger_id SERIAL PRIMARY KEY,
            member_id VARCHAR(255) NOT NULL,
            amount INTEGER NOT NULL,
            type VARCHAR(50),
            description TEXT,
            reference_id VARCHAR(255),
            reference_type VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_member ON point_ledger(member_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_type ON point_ledger(type)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS point_ledger (
            ledgerId INTEGER PRIMARY KEY AUTOINCREMENT,
            memberId TEXT NOT NULL,
            amount INTEGER NOT NULL,
            type TEXT,
            description TEXT,
            referenceId TEXT,
            referenceType TEXT,
            createdAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_member ON point_ledger(memberId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_type ON point_ledger(type)`);
      }
      logger.info('point_ledger table ensured');
    } catch (e) {
      logger.error('point_ledger table init error:', e);
    }
    
    // Ensure participations table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS participations (
            participation_id SERIAL PRIMARY KEY,
            item_key VARCHAR(255) NOT NULL,
            item_id VARCHAR(255),
            item_type VARCHAR(50),
            title VARCHAR(500),
            member_id VARCHAR(255),
            region_id VARCHAR(100),
            cross_region BOOLEAN DEFAULT false,
            joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            status VARCHAR(50) DEFAULT 'submitted',
            submission_text TEXT,
            submission_link TEXT,
            submission_images JSONB,
            review_note TEXT,
            reviewed_at TIMESTAMP,
            reviewed_by VARCHAR(255),
            selected BOOLEAN DEFAULT false,
            selected_at TIMESTAMP,
            reward_type VARCHAR(50),
            reward_amount INTEGER DEFAULT 0,
            reward_description TEXT,
            rewarded_at TIMESTAMP
          )
        `);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'submitted'`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS submission_text TEXT`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS submission_link TEXT`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS submission_images JSONB`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS cross_region BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS review_note TEXT`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMP`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS reviewed_by VARCHAR(255)`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50)`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS reward_amount INTEGER DEFAULT 0`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS reward_description TEXT`);
        await db.run(`ALTER TABLE participations ADD COLUMN IF NOT EXISTS rewarded_at TIMESTAMP`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_participations_member ON participations(member_id)`);
        await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_participations_unique ON participations(item_key, member_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS participations (
            participationId INTEGER PRIMARY KEY AUTOINCREMENT,
            itemKey TEXT NOT NULL,
            itemId TEXT,
            itemType TEXT,
            title TEXT,
            memberId TEXT,
            regionId TEXT,
            crossRegion INTEGER DEFAULT 0,
            joinedAt TEXT,
            status TEXT DEFAULT 'submitted',
            submissionText TEXT,
            submissionLink TEXT,
            submissionImages TEXT,
            reviewNote TEXT,
            reviewedAt TEXT,
            reviewedBy TEXT,
            selected INTEGER DEFAULT 0,
            selectedAt TEXT,
            rewardType TEXT,
            rewardAmount INTEGER DEFAULT 0,
            rewardDescription TEXT,
            rewardedAt TEXT
          )
        `);
        try { await db.run(`ALTER TABLE participations ADD COLUMN status TEXT DEFAULT 'submitted'`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN submissionText TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN submissionLink TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN submissionImages TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN crossRegion INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN reviewNote TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN reviewedAt TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN reviewedBy TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN rewardType TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN rewardAmount INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN rewardDescription TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE participations ADD COLUMN rewardedAt TEXT`); } catch (e) {}
        await db.run(`CREATE INDEX IF NOT EXISTS idx_participations_member ON participations(memberId)`);
        await db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_participations_unique ON participations(itemKey, memberId)`);
      }
      logger.info('participations table ensured');
    } catch (e) {
      logger.error('participations table init error:', e);
    }

    // Ensure configs table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS configs (
            config_key VARCHAR(255) PRIMARY KEY,
            config_value TEXT NOT NULL,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS configs (
            configKey TEXT PRIMARY KEY,
            configValue TEXT NOT NULL,
            updatedAt TEXT
          )
        `);
      }
      logger.info('configs table ensured');
    } catch (e) {
      logger.error('configs table init error:', e);
    }

    // Ensure schedules table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS schedules (
            schedule_id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            schedule_date DATE,
            schedule_time TIME,
            status VARCHAR(50) DEFAULT 'pending',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(user_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS schedules (
            scheduleId TEXT PRIMARY KEY,
            userId TEXT NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            scheduleDate TEXT,
            scheduleTime TEXT,
            status TEXT DEFAULT 'pending',
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_schedules_user ON schedules(userId)`);
      }
      logger.info('schedules table ensured');
    } catch (e) {
      logger.error('schedules table init error:', e);
    }

    // Ensure chats table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS chats (
            chat_id VARCHAR(255) PRIMARY KEY,
            from_user_id VARCHAR(255) NOT NULL,
            to_user_id VARCHAR(255) NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_chats_from ON chats(from_user_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_chats_to ON chats(to_user_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS chats (
            chatId TEXT PRIMARY KEY,
            fromUserId TEXT NOT NULL,
            toUserId TEXT NOT NULL,
            text TEXT NOT NULL,
            createdAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_chats_from ON chats(fromUserId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_chats_to ON chats(toUserId)`);
      }
      logger.info('chats table ensured');
    } catch (e) {
      logger.error('chats table init error:', e);
    }

    // Ensure friends table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS friends (
            friendship_id SERIAL PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            friend_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(user_id, friend_id)
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS friends (
            friendshipId INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT NOT NULL,
            friendId TEXT NOT NULL,
            createdAt TEXT,
            UNIQUE(userId, friendId)
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(userId)`);
      }
      logger.info('friends table ensured');
    } catch (e) {
      logger.error('friends table init error:', e);
    }
    
    // Ensure auditions table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS auditions (
            audition_id SERIAL PRIMARY KEY,
            title VARCHAR(500) NOT NULL,
            description TEXT,
            category VARCHAR(100),
            region_id VARCHAR(100),
            deadline TIMESTAMP,
            requirements TEXT,
            image_url TEXT,
            images JSONB DEFAULT '[]'::jsonb,
            video_url TEXT,
            status VARCHAR(20) DEFAULT 'active',
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_auditions_region ON auditions(region_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_auditions_status ON auditions(status)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS auditions (
            auditionId INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            category TEXT,
            regionId TEXT,
            deadline TEXT,
            requirements TEXT,
            imageUrl TEXT,
            images TEXT,
            videoUrl TEXT,
            status TEXT DEFAULT 'active',
            createdBy TEXT,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_auditions_region ON auditions(regionId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_auditions_status ON auditions(status)`);
      }
      logger.info('auditions table ensured');
    } catch (e) {
      logger.error('auditions table init error:', e);
    }
    
    // ✨ ADD: auditions 테이블에 type, published 컬럼 추가 (마이그레이션)
    try {
      if (USE_POSTGRES) {
        // type 컬럼: NOTICE(공지형) / FREE(자유응모)
        await db.run(`ALTER TABLE auditions ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'FREE'`);
        // published 컬럼: NOTICE 타입에서 게시 여부
        await db.run(`ALTER TABLE auditions ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT TRUE`);
        // startAt, endAt 컬럼 추가 (기존 deadline 대신)
        await db.run(`ALTER TABLE auditions ADD COLUMN IF NOT EXISTS start_at TIMESTAMP`);
        await db.run(`ALTER TABLE auditions ADD COLUMN IF NOT EXISTS end_at TIMESTAMP`);
        // posterUrl 컬럼 추가 (image_url과 별도)
        await db.run(`ALTER TABLE auditions ADD COLUMN IF NOT EXISTS poster_url TEXT`);
        await db.run(`ALTER TABLE auditions ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
      } else {
        // SQLite는 ALTER TABLE ADD COLUMN IF NOT EXISTS를 지원하지 않으므로 에러 무시
        try { await db.run(`ALTER TABLE auditions ADD COLUMN type TEXT DEFAULT 'FREE'`); } catch {}
        try { await db.run(`ALTER TABLE auditions ADD COLUMN published INTEGER DEFAULT 1`); } catch {}
        try { await db.run(`ALTER TABLE auditions ADD COLUMN startAt TEXT`); } catch {}
        try { await db.run(`ALTER TABLE auditions ADD COLUMN endAt TEXT`); } catch {}
        try { await db.run(`ALTER TABLE auditions ADD COLUMN posterUrl TEXT`); } catch {}
        try { await db.run(`ALTER TABLE auditions ADD COLUMN images TEXT`); } catch {}
      }
      logger.info('auditions table columns (type, published, startAt, endAt, posterUrl) ensured');
    } catch (e) {
      logger.error('auditions table migration error:', e);
    }
    
    // Ensure audition_submissions table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS audition_submissions (
            submission_id SERIAL PRIMARY KEY,
            audition_id INTEGER NOT NULL,
            member_id INTEGER NOT NULL,
            title VARCHAR(500),
            media_type VARCHAR(20),
            media_url TEXT,
            thumbnail_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_audition ON audition_submissions(audition_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_member ON audition_submissions(member_id)`);
        // ✨ ADD: votes_count 컬럼 추가
        try { await db.run(`ALTER TABLE audition_submissions ADD COLUMN votes_count INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE audition_submissions ADD COLUMN rank_label VARCHAR(120)`); } catch (e) {}
        try { await db.run(`ALTER TABLE audition_submissions ADD COLUMN IF NOT EXISTS approval_status VARCHAR(20) DEFAULT 'pending'`); } catch (e) {}
        try {
          await db.run(`UPDATE audition_submissions SET approval_status = 'approved' WHERE approval_status IS NULL OR approval_status = ''`);
        } catch (e) {}
        // ✨ FIX: member_id 타입을 INTEGER로 변경 (members.member_id와 타입 일치)
        try {
          await db.run(`ALTER TABLE audition_submissions ALTER COLUMN member_id TYPE INTEGER USING member_id::integer`);
        } catch (e) {
          // 이미 INTEGER이거나 다른 이유로 실패해도 무시
        }
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS audition_submissions (
            submissionId INTEGER PRIMARY KEY AUTOINCREMENT,
            auditionId INTEGER NOT NULL,
            memberId TEXT NOT NULL,
            title TEXT,
            mediaType TEXT,
            mediaUrl TEXT,
            thumbnailUrl TEXT,
            createdAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_audition ON audition_submissions(auditionId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_submissions_member ON audition_submissions(memberId)`);
        // ✨ ADD: votesCount 컬럼 추가
        try { await db.run(`ALTER TABLE audition_submissions ADD COLUMN votesCount INTEGER DEFAULT 0`); } catch (e) {}
        try { await db.run(`ALTER TABLE audition_submissions ADD COLUMN rankLabel TEXT`); } catch (e) {}
        try { await db.run(`ALTER TABLE audition_submissions ADD COLUMN approvalStatus TEXT DEFAULT 'pending'`); } catch (e) {}
        try {
          await db.run(`UPDATE audition_submissions SET approvalStatus = 'approved' WHERE approvalStatus IS NULL OR approvalStatus = ''`);
        } catch (e) {}
      }
      logger.info('audition_submissions table ensured');
    } catch (e) {
      logger.error('audition_submissions table init error:', e);
    }

    // ✨ ADD: audition_votes table (1인 1투표 제한)
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS audition_votes (
            vote_id SERIAL PRIMARY KEY,
            submission_id INTEGER NOT NULL,
            voter_id VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(submission_id, voter_id)
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_votes_submission ON audition_votes(submission_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_votes_voter ON audition_votes(voter_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS audition_votes (
            voteId INTEGER PRIMARY KEY AUTOINCREMENT,
            submissionId INTEGER NOT NULL,
            voterId TEXT NOT NULL,
            createdAt TEXT,
            UNIQUE(submissionId, voterId)
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_votes_submission ON audition_votes(submissionId)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_votes_voter ON audition_votes(voterId)`);
      }
      logger.info('audition_votes table ensured');
    } catch (e) {
      logger.error('audition_votes table init error:', e);
    }

    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS audition_submission_comments (
            comment_id SERIAL PRIMARY KEY,
            submission_id INTEGER NOT NULL REFERENCES audition_submissions(submission_id) ON DELETE CASCADE,
            author_id INTEGER NOT NULL REFERENCES members(member_id) ON DELETE CASCADE,
            author_name VARCHAR(255),
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_asc_submission_created ON audition_submission_comments(submission_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_asc_author ON audition_submission_comments(author_id)`);
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS audition_submission_comments (
            commentId INTEGER PRIMARY KEY AUTOINCREMENT,
            submissionId INTEGER NOT NULL,
            authorId TEXT NOT NULL,
            authorName TEXT,
            content TEXT NOT NULL,
            createdAt TEXT,
            updatedAt TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_asc_submission_created ON audition_submission_comments(submissionId, createdAt DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_asc_author ON audition_submission_comments(authorId)`);
      }
      logger.info('audition_submission_comments table ensured');
    } catch (e) {
      logger.error('audition_submission_comments table init error:', e);
    }

    // Ensure shop_events table exists
    try {
      if (USE_POSTGRES) {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shop_events (
            event_id VARCHAR(255) PRIMARY KEY,
            shop_id VARCHAR(255) NOT NULL,
            title VARCHAR(500) NOT NULL,
            content TEXT,
            image_url TEXT,
            start_date DATE,
            end_date DATE,
            status VARCHAR(20) DEFAULT 'pending',
            reject_reason TEXT,
            created_by VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_events_shop ON shop_events(shop_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_events_dates ON shop_events(start_date, end_date)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_events_status ON shop_events(status)`);
        // 기존 테이블 마이그레이션
        try { await db.run(`ALTER TABLE shop_events ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending'`); } catch(e) {}
        try { await db.run(`ALTER TABLE shop_events ADD COLUMN IF NOT EXISTS reject_reason TEXT`); } catch(e) {}
      } else {
        await db.run(`
          CREATE TABLE IF NOT EXISTS shop_events (
            event_id TEXT PRIMARY KEY,
            shop_id TEXT NOT NULL,
            title TEXT NOT NULL,
            content TEXT,
            image_url TEXT,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'pending',
            reject_reason TEXT,
            created_by TEXT,
            created_at TEXT,
            updated_at TEXT
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_events_shop ON shop_events(shop_id)`);
        try { await db.run(`ALTER TABLE shop_events ADD COLUMN status TEXT DEFAULT 'pending'`); } catch(e) {}
        try { await db.run(`ALTER TABLE shop_events ADD COLUMN reject_reason TEXT`); } catch(e) {}
      }
      logger.info('shop_events table ensured');
    } catch (e) {
      logger.error('shop_events table init error:', e);
    }
  } catch (err) {
    logger.error('Database initialization error:', err);
    if (USE_POSTGRES) {
      logger.error('PostgreSQL is required in this environment. SQLite fallback is disabled.');
    }
    throw err;
  }
  
  // ============================================
  // Supply Support Tables
  // ============================================
  try {
    if (USE_POSTGRES) {
      // supply_items table (보급지원 물품)
      await db.run(`
        CREATE TABLE IF NOT EXISTS supply_items (
          item_id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          description TEXT,
          quantity INTEGER DEFAULT 0,
          manager_id VARCHAR(255) NOT NULL,
          status VARCHAR(50) DEFAULT 'available',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_items_manager ON supply_items(manager_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_items_status ON supply_items(status, created_at DESC)`);
      
      // supply_requests table (보급지원 신청)
      await db.run(`
        CREATE TABLE IF NOT EXISTS supply_requests (
          request_id SERIAL PRIMARY KEY,
          supply_item_id INTEGER NOT NULL REFERENCES supply_items(item_id) ON DELETE CASCADE,
          requester_id VARCHAR(255) NOT NULL,
          requester_name VARCHAR(255),
          requester_contact VARCHAR(255),
          quantity INTEGER DEFAULT 1,
          message TEXT,
          status VARCHAR(50) DEFAULT 'PENDING',
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          completed_at TIMESTAMPTZ -- ✨ ADD: 완료 시각 기록
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_requests_item ON supply_requests(supply_item_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_requests_requester ON supply_requests(requester_id)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status, created_at DESC)`);
      
      // ✨ 기존 테이블에 컬럼 추가 (안전한 마이그레이션)
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS requester_name VARCHAR(255)`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS requester_contact VARCHAR(255)`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS message TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS item_name TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS manager_name TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS request_type VARCHAR(30) DEFAULT 'supply'`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS order_status VARCHAR(40)`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS receive_method VARCHAR(30)`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS payment_reference_id VARCHAR(120)`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS payment_amount INTEGER DEFAULT 0`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS buyer_confirmed_at TIMESTAMPTZ`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMPTZ`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS return_requested_at TIMESTAMPTZ`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS returned_at TIMESTAMPTZ`); } catch (e) {}
      // ✨ supply_item_id 컬럼 타입 수정: INTEGER → TEXT (FK 제약 먼저 DROP 후 변환)
      // 케이스1: FK 제약이 TYPE 변경을 막으므로 먼저 DROP
      try { await db.run(`ALTER TABLE supply_requests DROP CONSTRAINT IF EXISTS supply_requests_supply_item_id_fkey`); } catch (e) {}
      // 케이스2: 컬럼이 INTEGER로 존재 → TEXT로 변환
      try { await db.run(`ALTER TABLE supply_requests ALTER COLUMN supply_item_id TYPE TEXT USING supply_item_id::TEXT`); } catch (e) {}
      // 케이스3: 컬럼이 아예 없는 경우 (구버전 스키마) → 추가
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS supply_item_id TEXT`); } catch (e) {}
      
      // ✨ 타임스탬프 컬럼 타입 변경 (TIMESTAMP → TIMESTAMPTZ)
      try {
        await db.run(`ALTER TABLE supply_requests ALTER COLUMN created_at TYPE TIMESTAMPTZ USING created_at AT TIME ZONE 'Asia/Seoul'`);
        await db.run(`ALTER TABLE supply_requests ALTER COLUMN updated_at TYPE TIMESTAMPTZ USING updated_at AT TIME ZONE 'Asia/Seoul'`);
        await db.run(`ALTER TABLE supply_requests ALTER COLUMN completed_at TYPE TIMESTAMPTZ USING completed_at AT TIME ZONE 'Asia/Seoul'`);
        logger.info('✅ supply_requests 타임스탬프 컬럼 타입 변경 완료');
      } catch (e) {
        logger.warn('⚠️  supply_requests 타임스탬프 변경 실패 (이미 변경되었거나 권한 없음):', e.message);
      }

      // ✨ 기존 유통 주문 payment_amount 복구 마이그레이션
      // Phase 8 이전에 생성된 distribution 주문은 payment_amount=0으로 저장됨 → supplies.price 기반 복구
      try {
        const fixResult = await db.run(`
          UPDATE supply_requests sr
          SET payment_amount = COALESCE(sr.quantity, 1) * COALESCE(s.price, 0)
          FROM supplies s
          WHERE sr.supply_item_id = s.supply_id
            AND COALESCE(sr.request_type, 'supply') = 'distribution'
            AND COALESCE(sr.payment_amount, 0) = 0
            AND COALESCE(s.price, 0) > 0
        `);
        if (fixResult && fixResult.rowCount > 0) {
          logger.info(`✅ 기존 유통 주문 ${fixResult.rowCount}건 payment_amount 복구 완료`);
        }
      } catch (e) {
        logger.warn('⚠️  기존 유통 주문 payment_amount 복구 실패:', e.message);
      }
      
      logger.info('PostgreSQL supply support tables ensured');
    } else {
      // SQLite supply_items table
      await db.run(`
        CREATE TABLE IF NOT EXISTS supply_items (
          itemId INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          description TEXT,
          quantity INTEGER DEFAULT 0,
          managerId TEXT NOT NULL,
          status TEXT DEFAULT 'available',
          createdAt TEXT,
          updatedAt TEXT
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_items_manager ON supply_items(managerId)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_items_status ON supply_items(status)`);
      
      // SQLite supply_requests table
      await db.run(`
        CREATE TABLE IF NOT EXISTS supply_requests (
          requestId INTEGER PRIMARY KEY AUTOINCREMENT,
          supplyItemId INTEGER NOT NULL,
          requesterId TEXT NOT NULL,
          status TEXT DEFAULT 'PENDING',
          createdAt TEXT,
          updatedAt TEXT,
          FOREIGN KEY (supplyItemId) REFERENCES supply_items(itemId) ON DELETE CASCADE
        )
      `);
      // Optional columns added over time (safe in-place schema evolution)
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN requesterName TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN requesterContact TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN quantity INTEGER`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN message TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN completedAt TEXT`); } catch (e) {} // ✨ ADD: 완료 시각 기록
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN requestType TEXT DEFAULT 'supply'`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN orderStatus TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN receiveMethod TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN paymentReferenceId TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN paymentAmount INTEGER DEFAULT 0`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN buyerConfirmedAt TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN cancelledAt TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN returnRequestedAt TEXT`); } catch (e) {}
      try { await db.run(`ALTER TABLE supply_requests ADD COLUMN returnedAt TEXT`); } catch (e) {}
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_requests_item ON supply_requests(supplyItemId)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_requests_requester ON supply_requests(requesterId)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_supply_requests_status ON supply_requests(status)`);
      
      logger.info('SQLite supply support tables ensured');
    }
  } catch (e) {
    logger.error('Supply support tables init error:', e);
  }
  
  // ============================================
  // PV3 완전 복원: 추가 스키마
  // ============================================
  try {
    logger.info('Applying PV3 full restoration schema...');
    
    if (USE_POSTGRES) {
      // 1. members 테이블 확장 (지역 정보)
      try {
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS region VARCHAR(100)`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS region_id VARCHAR(50)`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS region_name VARCHAR(100)`);
        await db.run(`ALTER TABLE members ADD COLUMN IF NOT EXISTS memo TEXT`);
      } catch (e) { /* 컬럼이 이미 존재할 수 있음 */ }
      
      // 2. notices 테이블 생성
      await db.run(`
        CREATE TABLE IF NOT EXISTS notices (
          notice_id SERIAL PRIMARY KEY,
          id VARCHAR(50) UNIQUE,
          title TEXT NOT NULL,
          content TEXT,
          scope VARCHAR(20) DEFAULT 'ALL',
          region_id VARCHAR(50),
          region_ids JSONB,
          is_popup BOOLEAN DEFAULT false,
          is_pinned BOOLEAN DEFAULT false,
          is_public BOOLEAN DEFAULT true,
          status VARCHAR(20) DEFAULT 'ACTIVE',
          author VARCHAR(100),
          author_id VARCHAR(50),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      try {
        await db.run(`ALTER TABLE notices ADD COLUMN IF NOT EXISTS is_popup BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE notices ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false`);
        await db.run(`ALTER TABLE notices ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true`);
        await db.run(`ALTER TABLE notices ADD COLUMN IF NOT EXISTS image_url TEXT`);
      } catch (e) { /* 컬럼이 이미 존재할 수 있음 */ }
      await db.run(`CREATE INDEX IF NOT EXISTS idx_notices_scope ON notices(scope)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_notices_region_id ON notices(region_id)`);
      try {
        await db.run(`UPDATE notices SET id = CONCAT('notice_', notice_id) WHERE id IS NULL OR TRIM(id) = ''`);
      } catch (e) { /* 기존 데이터 보정 실패는 치명적이지 않음 */ }
      
      // 3. point_ledger 테이블 확장
      try {
        await db.run(`ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS admin_id VARCHAR(50)`);
        await db.run(`ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS user_name VARCHAR(100)`);
        await db.run(`ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active'`);
      } catch (e) { /* 컬럼이 이미 존재할 수 있음 */ }
      await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_status ON point_ledger(status)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_admin_id ON point_ledger(admin_id)`);
      
      // 4. shop_payout_requests 테이블 확장
      try {
        await db.run(`ALTER TABLE shop_payout_requests ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP`);
        await db.run(`ALTER TABLE shop_payout_requests ADD COLUMN IF NOT EXISTS handled_by VARCHAR(50)`);
        await db.run(`ALTER TABLE shop_payout_requests ADD COLUMN IF NOT EXISTS reject_reason TEXT`);
      } catch (e) { /* 컬럼이 이미 존재할 수 있음 */ }
      await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_payout_handled_by ON shop_payout_requests(handled_by)`);
      
      // 5. missions 테이블 확장 (PV3 참여자 관리 기능)
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS max_participants INTEGER`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS region_name VARCHAR(255)`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS start_date TIMESTAMP`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS end_date TIMESTAMP`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS participants JSONB`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS created_by VARCHAR(50)`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS region_id VARCHAR(255)`);
        await db.run(`ALTER TABLE missions ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50) DEFAULT 'points'`);
        await db.run(`ALTER TABLE events ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
        await db.run(`ALTER TABLE events ADD COLUMN IF NOT EXISTS reward_type VARCHAR(50) DEFAULT 'points'`);
        await db.run(`ALTER TABLE events ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0`);
      } catch (e) { /* 컬럼이 이미 존재할 수 있음 */ }
      await db.run(`CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_missions_region ON missions(region_id)`);
      
      // 6. shops 테이블 확장 (리뷰 시스템)
      try {
        await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS thumbnail TEXT`);
        await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS rating REAL DEFAULT 0`);
        await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0`);
        await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS shop_images JSONB`);
      } catch (e) { /* 컬럼이 이미 존재할 수 있음 */ }

      // 7. QR 결제 내역 테이블 (상점 QR 결제 증거용)
      await db.run(`
        CREATE TABLE IF NOT EXISTS qr_payments (
          payment_id VARCHAR(255) PRIMARY KEY,
          shop_id VARCHAR(255) NOT NULL,
          amount INTEGER NOT NULL,
          payer_member_id VARCHAR(255),
          status VARCHAR(20) DEFAULT 'completed',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_qr_payments_shop ON qr_payments(shop_id, created_at DESC)`);
      
      // 8. VIP 상품권 시스템 테이블
      await db.run(`
        CREATE TABLE IF NOT EXISTS voucher_types (
          type_code   VARCHAR(50) PRIMARY KEY,
          name        VARCHAR(100) NOT NULL,
          description TEXT,
          is_active   BOOLEAN DEFAULT true,
          created_at  TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      // 초기 voucher_types 데이터
      await db.run(`
        INSERT INTO voucher_types (type_code, name, description) VALUES
          ('SHOP_USE',       'VIP 상품권',         '상점에서 사용 가능한 VIP 상품권'),
          ('MISSION_REWARD', '미션 보상 상품권',   '미션·이벤트 완료 시 지급'),
          ('ADMIN_GRANT',    '관리자 지급 상품권', '관리자가 수동 지급')
        ON CONFLICT (type_code) DO NOTHING
      `);
      await db.run(`
        CREATE TABLE IF NOT EXISTS voucher_ledger (
          ledger_id    BIGSERIAL PRIMARY KEY,
          member_id    VARCHAR(255) NOT NULL,
          serial_no    BIGINT UNIQUE DEFAULT nextval('voucher_serial_seq'),
          type_code    VARCHAR(50) REFERENCES voucher_types(type_code),
          amount       INTEGER NOT NULL,
          status       VARCHAR(20) DEFAULT 'active',
          source       VARCHAR(100),
          reference_id VARCHAR(255),
          description  TEXT,
          admin_id     VARCHAR(255),
          target_type  VARCHAR(20) DEFAULT 'member',
          shop_id      VARCHAR(255),
          created_at   TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_voucher_ledger_member ON voucher_ledger(member_id, created_at DESC)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_voucher_ledger_type ON voucher_ledger(type_code)`);
      // shops 상품권 및 리뷰 허용 컬럼
      try {
        await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS vip_voucher_count INTEGER DEFAULT 0`);
        await db.run(`ALTER TABLE shops ADD COLUMN IF NOT EXISTS review_allowed BOOLEAN DEFAULT true`);
      } catch (e) { /* 이미 존재 */ }
      // ★ voucher_ledger 상점 지급 지원 컬럼 마이그레이션 (기존 DB 대응)
      try { await db.run(`ALTER TABLE voucher_ledger ADD COLUMN IF NOT EXISTS target_type VARCHAR(20) DEFAULT 'member'`); } catch (e) {}
      try { await db.run(`ALTER TABLE voucher_ledger ADD COLUMN IF NOT EXISTS shop_id VARCHAR(255)`); } catch (e) {}
  try { await db.run(`ALTER TABLE voucher_ledger ADD COLUMN IF NOT EXISTS serial_no BIGINT`); } catch (e) {}
      try { await db.run(`CREATE INDEX IF NOT EXISTS idx_voucher_ledger_target ON voucher_ledger(target_type, shop_id)`); } catch (e) {}
      // ★ 기존 행(target_type = NULL) → 'member' 로 일괄 업데이트 (ALTER ADD COLUMN은 NULL로 남김)
      try { await db.run(`UPDATE voucher_ledger SET target_type = 'member' WHERE target_type IS NULL`); } catch (e) {}

      logger.info('PostgreSQL PV3 schema applied');
    } else {
      // SQLite용 스키마
      // 1. members 테이블 확장
      try {
        await db.run(`ALTER TABLE members ADD COLUMN region TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN region_id TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN region_name TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE members ADD COLUMN memo TEXT`);
      } catch (e) {}
      
      // 2. notices 테이블 생성
      await db.run(`
        CREATE TABLE IF NOT EXISTS notices (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          content TEXT,
          scope TEXT DEFAULT 'ALL',
          region_id TEXT,
          region_ids TEXT,
          is_popup INTEGER DEFAULT 0,
          is_pinned INTEGER DEFAULT 0,
          is_public INTEGER DEFAULT 1,
          status TEXT DEFAULT 'ACTIVE',
          author TEXT,
          author_id TEXT,
          created_at TEXT DEFAULT (datetime('now')),
          updated_at TEXT DEFAULT (datetime('now'))
        )
      `);
      try { await db.run(`ALTER TABLE notices ADD COLUMN is_popup INTEGER DEFAULT 0`); } catch (e) {}
      try { await db.run(`ALTER TABLE notices ADD COLUMN is_pinned INTEGER DEFAULT 0`); } catch (e) {}
      try { await db.run(`ALTER TABLE notices ADD COLUMN is_public INTEGER DEFAULT 1`); } catch (e) {}
      try { await db.run(`ALTER TABLE notices ADD COLUMN image_url TEXT`); } catch (e) {}
      await db.run(`CREATE INDEX IF NOT EXISTS idx_notices_scope ON notices(scope)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_notices_region_id ON notices(region_id)`);
      try { await db.run(`UPDATE notices SET id = 'notice_' || notice_id WHERE id IS NULL OR TRIM(id) = ''`); } catch (e) {}
      
      // 3. point_ledger 테이블 확장
      try {
        await db.run(`ALTER TABLE point_ledger ADD COLUMN admin_id TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE point_ledger ADD COLUMN user_name TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE point_ledger ADD COLUMN status TEXT DEFAULT 'active'`);
      } catch (e) {}
      await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_status ON point_ledger(status)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_point_ledger_admin_id ON point_ledger(admin_id)`);
      
      // 4. shop_payout_requests 테이블 확장
      try {
        await db.run(`ALTER TABLE shop_payout_requests ADD COLUMN handled_at TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE shop_payout_requests ADD COLUMN handled_by TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE shop_payout_requests ADD COLUMN reject_reason TEXT`);
      } catch (e) {}
      await db.run(`CREATE INDEX IF NOT EXISTS idx_shop_payout_handled_by ON shop_payout_requests(handled_by)`);
      
      // 5. missions 테이블 확장 (PV3 참여자 관리 기능)
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN max_participants INTEGER`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN start_date TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN end_date TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN participants TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN created_by TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN region_id TEXT`);
      } catch (e) {}
      // ★ Fix: region_scope / regionIds 컬럼 추가 (지역 미션 필터링에 필요)
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN regionScope TEXT DEFAULT 'ALL'`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN regionIds TEXT DEFAULT '[]'`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN category TEXT DEFAULT 'general'`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE missions ADD COLUMN images TEXT`);
      } catch (e) {}
      await db.run(`CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by)`);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_missions_region_scope ON missions(regionScope)`);
      // ★ Fix: events 테이블 regionScope / regionIds 컬럼 추가
      try {
        await db.run(`ALTER TABLE events ADD COLUMN regionScope TEXT DEFAULT 'ALL'`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE events ADD COLUMN regionIds TEXT DEFAULT '[]'`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE events ADD COLUMN images TEXT`);
      } catch (e) {}
      
      // 6. shops 테이블 확장
      try {
        await db.run(`ALTER TABLE shops ADD COLUMN thumbnail TEXT`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE shops ADD COLUMN rating REAL DEFAULT 0`);
      } catch (e) {}
      try {
        await db.run(`ALTER TABLE shops ADD COLUMN review_count INTEGER DEFAULT 0`);
      } catch (e) {}

      // 7. QR 결제 내역 테이블 (상점 QR 결제 증거용)
      await db.run(`
        CREATE TABLE IF NOT EXISTS qr_payments (
          payment_id TEXT PRIMARY KEY,
          shop_id TEXT NOT NULL,
          amount INTEGER NOT NULL,
          payer_member_id TEXT,
          status TEXT DEFAULT 'completed',
          created_at TEXT
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_qr_payments_shop ON qr_payments(shop_id)`);
      
      // 8. VIP 상품권 시스템 테이블 (SQLite)
      await db.run(`
        CREATE TABLE IF NOT EXISTS voucher_types (
          type_code   TEXT PRIMARY KEY,
          name        TEXT NOT NULL,
          description TEXT,
          is_active   INTEGER DEFAULT 1,
          created_at  TEXT DEFAULT (datetime('now'))
        )
      `);
      // 초기 voucher_types
      await db.run(`INSERT OR IGNORE INTO voucher_types (type_code, name, description) VALUES ('SHOP_USE','VIP 상품권','상점에서 사용 가능한 VIP 상품권')`);
      await db.run(`INSERT OR IGNORE INTO voucher_types (type_code, name, description) VALUES ('MISSION_REWARD','미션 보상 상품권','미션·이벤트 완료 시 지급')`);
      await db.run(`INSERT OR IGNORE INTO voucher_types (type_code, name, description) VALUES ('ADMIN_GRANT','관리자 지급 상품권','관리자가 수동 지급')`);
      await db.run(`
        CREATE TABLE IF NOT EXISTS voucher_ledger (
          ledger_id    INTEGER PRIMARY KEY AUTOINCREMENT,
          member_id    TEXT NOT NULL,
          type_code    TEXT,
          amount       INTEGER NOT NULL,
          status       TEXT DEFAULT 'active',
          source       TEXT,
          reference_id TEXT,
          description  TEXT,
          admin_id     TEXT,
          created_at   TEXT DEFAULT (datetime('now'))
        )
      `);
      await db.run(`CREATE INDEX IF NOT EXISTS idx_voucher_ledger_member ON voucher_ledger(member_id)`);
      try { await db.run(`ALTER TABLE shops ADD COLUMN vip_voucher_count INTEGER DEFAULT 0`); } catch (e) {}
      try { await db.run(`ALTER TABLE shops ADD COLUMN review_allowed INTEGER DEFAULT 1`); } catch (e) {}
      // ★ 자동 마이그레이션: voucher_ledger 상점 지급 지원 컬럼
      try { await db.run(`ALTER TABLE voucher_ledger ADD COLUMN target_type TEXT DEFAULT 'member'`); } catch (e) {}
      try { await db.run(`ALTER TABLE voucher_ledger ADD COLUMN shop_id TEXT`); } catch (e) {}
      
      logger.info('SQLite PV3 schema applied');
    }
    
    // 7. 초기 공지사항 데이터 (샘플)
    const existingNotice = await db.get(`SELECT id FROM notices WHERE id = 'notice_welcome' LIMIT 1`);
    if (!existingNotice) {
      if (USE_POSTGRES) {
        await db.run(`
          INSERT INTO notices (id, title, content, scope, status, author)
          VALUES 
            ('notice_welcome', '서비스 오픈 안내', '안녕하세요. 지역 연합 플랫폼이 정식 오픈하였습니다.', 'ALL', 'ACTIVE', '관리자')
          ON CONFLICT (id) DO NOTHING
        `);
      } else {
        await db.run(`
          INSERT OR IGNORE INTO notices (id, title, content, scope, status, author, created_at)
          VALUES ('notice_welcome', '서비스 오픈 안내', '안녕하세요. 지역 연합 플랫폼이 정식 오픈하였습니다.', 'ALL', 'ACTIVE', '관리자', datetime('now'))
        `);
      }
      logger.info('Initial notices data inserted');
    }
    
    // 8. region_news 테이블 생성 (지역 뉴스·공지)
    if (USE_POSTGRES) {
      try {
        await db.run(`
          CREATE TABLE IF NOT EXISTS region_news (
            news_id     VARCHAR(255) PRIMARY KEY,
            region_id   VARCHAR(255) NOT NULL,
            title       VARCHAR(500) NOT NULL,
            content     TEXT,
            thumbnail   TEXT,
            images      JSONB DEFAULT '[]'::jsonb,
            author_id   INTEGER,
            author_name VARCHAR(100) DEFAULT '관리자',
            district_id VARCHAR(255),
            is_pinned   BOOLEAN DEFAULT false,
            is_public   BOOLEAN DEFAULT true,
            views       INTEGER DEFAULT 0,
            created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          )
        `);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_news_region ON region_news(region_id, created_at DESC)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_news_district ON region_news(district_id)`);
        await db.run(`CREATE INDEX IF NOT EXISTS idx_region_news_public ON region_news(is_public, is_pinned DESC, created_at DESC)`);
        logger.info('region_news table ensured');
      } catch (e) {
        logger.error('region_news table init error:', e);
      }
      try {
        await db.run(`ALTER TABLE region_news ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb`);
      } catch (e) {}
    }

    // 9. district_id 컬럼 추가 (기존 테이블 마이그레이션)
    if (USE_POSTGRES) {
      const _dc = [
        'ALTER TABLE notices    ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE missions   ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE events     ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE supplies   ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE shops      ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE boards     ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE broadcasts  ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
        'ALTER TABLE auditions  ADD COLUMN IF NOT EXISTS district_id VARCHAR(255)',
      ];
      for (const sql of _dc) {
        try { await db.run(sql); } catch (e) { /* 이미 존재 */ }
      }
      logger.info('district_id columns migration done');
    }

    logger.info('PV3 full restoration schema completed');
    
    // ============================================
    // FORENSIC MODE: DB 상태 진단 출력
    // ============================================
    try {
      const tableCounts = {};
      const tables = ['members', 'missions', 'events', 'schedules', 'shops', 'supplies', 'participations', 'broadcasts'];
      for (const table of tables) {
        try {
          const rows = await db.query(`SELECT COUNT(*) as count FROM ${table}`);
          tableCounts[table] = rows[0]?.count || rows[0]?.COUNT || 0;
        } catch (e) {
          tableCounts[table] = 'ERROR';
        }
      }
      logger.info('📊 DB TABLE COUNTS:', tableCounts);
    } catch (e) {
      logger.warn('Failed to count table rows:', e.message);
    }
  } catch (e) {
    logger.error('PV3 schema migration error:', e);
  }
}

const app = express();
app.disable('x-powered-by');

// ============================================
// FILE UPLOAD CONFIGURATION
// ============================================

// Ensure uploads directory exists
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'banners');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  logger.info('Created uploads directory:', UPLOADS_DIR);
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const ext = path.extname(file.originalname);
    cb(null, `banner_${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
  }
};

// Multer upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
  }
});

// CORS configuration
let allowedOrigins = [];

// 환경변수에서 명시적으로 설정된 origins
if (process.env.ALLOWED_ORIGINS) {
  allowedOrigins = process.env.ALLOWED_ORIGINS.split(',')
    .map(s => s.trim())
    .filter(Boolean);
}

// 개발 환경에서만 localhost 추가
if (NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5174', 'http://localhost:8787');
}

// APP_URL 추가 (프로덕션 URL)
if (process.env.APP_URL) {
  allowedOrigins.push(process.env.APP_URL);
}

// 중복 제거
allowedOrigins = Array.from(new Set(allowedOrigins));

logger.info('Allowed origins:', { origins: allowedOrigins });

// CORS configuration
// In development allow localhost / 127.0.0.1 origins more permissively and log origins for debugging.
if (NODE_ENV === 'development') {
  app.use((req, res, next) => {
    try {
      logger.debug('Incoming Request:', {
        origin: req.headers.origin,
        userAgent: req.headers['user-agent'],
        method: req.method,
        path: req.path,
        referer: req.headers.referer
      });
    } catch (e) {}
    next();
  });

  app.use(cors({
    origin: (origin, callback) => {
      // ★ Android WebView / Kakaotalk 요청은 origin이 null이거나 없을 수 있음
      if (!origin) {
        logger.debug('[CORS] Allowing request with no origin (Android WebView / Kakaotalk)');
        return callback(null, true);
      }
      const low = String(origin).toLowerCase();
      if (low.startsWith('http://localhost') || low.startsWith('http://127.0.0.1') || allowedOrigins.includes(origin)) {
        logger.debug('[CORS] Allowing origin:', origin);
        return callback(null, true);
      }
      // ★ 개발 환경에서는 모든 origin 허용 (Android WebView 테스트 용)
      logger.warn('[CORS] Allowing unknown origin in development:', origin);
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours preflight cache
  }));

  // ★ OPTIONS preflight 대응 강화 (Android WebView Private Network 요청 대응)
  app.options('*', (req, res, next) => {
    if (req.headers['access-control-request-private-network'] === 'true') {
      res.setHeader('Access-Control-Allow-Private-Network', 'true');
      logger.debug('[CORS] Allowing Private Network preflight request');
    }
    // preflight 요청 즉시 응답
    res.status(204).end();
  });
} else {
  app.use(cors({
    origin: (origin, callback) => {
      // ★ 프로덕션에서도 Android WebView / Kakaotalk 요청 허용 (origin null)
      if (!origin) {
        logger.info('[CORS] Allowing request with no origin (Android WebView / Kakaotalk)');
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        logger.error('[CORS] Blocked origin:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400 // 24 hours preflight cache
  }));

  // ★ OPTIONS preflight 대응 (프로덕션)
  app.options('*', (req, res) => {
    res.status(204).end();
  });
}

app.use(bodyParser.json({ limit: '50mb' }));

// ✅ DEBUG: 상세 API 요청 로거 (SSOT 디버깅용)
app.use('/api', (req, res, next) => {
  const timestamp = new Date().toISOString();
  const cookiePreview = req.headers.cookie 
    ? req.headers.cookie.slice(0, 60) + '...' 
    : '(no cookie)';
  
  console.group(`\n🔵 [API IN] ${req.method} ${req.path}`);
  console.log('├─ Time:', timestamp);
  console.log('├─ Origin:', req.headers.origin || '(none)');
  console.log('├─ Referer:', req.headers.referer || '(none)');
  console.log('├─ Cookie:', cookiePreview);
  console.log('├─ Query:', Object.keys(req.query).length > 0 ? req.query : '(none)');
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH' || req.method === 'DELETE') {
    console.log('├─ Body:', req.body);
  }
  console.groupEnd();
  
  // 응답 완료 시 status 로깅
  const originalSend = res.send;
  const originalJson = res.json;
  
  res.send = function(data) {
    console.log(`🟢 [API OUT] ${req.method} ${req.path} → ${res.statusCode}`);
    originalSend.call(this, data);
  };
  
  res.json = function(data) {
    console.log(`🟢 [API OUT] ${req.method} ${req.path} → ${res.statusCode}`, 
      typeof data === 'object' ? (data.ok !== undefined ? `ok=${data.ok}` : '') : '');
    originalJson.call(this, data);
  };
  
  next();
});

// 🔍 E2E FORENSIC: API 요청/응답 로깅 미들웨어
app.use((req, res, next) => {
  const startTime = Date.now();
  const originalJson = res.json.bind(res);
  
  // 요청 로그 (인증 관련 경로는 body 제외 — 비밀번호 평문 로그 방지)
  if (req.path.startsWith('/api/')) {
    const _sensitiveRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/signup',
                              '/api/admin/auth/login', '/api/admin/auth/verify'];
    const _isSensitive = _sensitiveRoutes.some(r => req.path.startsWith(r));
    logger.info(`[REQ] ${req.method} ${req.path}`, {
      query: req.query,
      body: (req.method !== 'GET' && !_isSensitive) ? req.body : undefined,
      memberId: req.headers['x-member-id'] || null,
      contentType: req.headers['content-type']
    });
  }
  
  // 응답 인터셉트
  res.json = function(data) {
    const duration = Date.now() - startTime;
    if (req.path.startsWith('/api/')) {
      const resultCount = Array.isArray(data) ? data.length : 
                         (data?.schedules?.length || data?.missions?.length || data?.events?.length || 
                          data?.members?.length || data?.shops?.length || data?.supplies?.length || 
                          data?.participations?.length || data?.broadcasts?.length || 
                          (data?.ok ? 1 : 0));
      logger.info(`[RES] ${req.method} ${req.path}`, {
        status: res.statusCode,
        duration: `${duration}ms`,
        resultCount,
        success: res.statusCode < 400
      });
    }
    return originalJson(data);
  };
  
  next();
});

// Add request logging middleware
app.use(logger.requestLogger());

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: USE_POSTGRES ? 'PostgreSQL' : 'SQLite',
    environment: NODE_ENV
  });
});

// Root route: serve frontend index if built, otherwise show API info
app.get('/', (req, res) => {
  const DIST_DIR = path.join(__dirname, '..', 'dist');
  const indexFile = path.join(DIST_DIR, 'index.html');
  if (fs.existsSync(indexFile)) {
    return res.sendFile(indexFile);
  }
  res.json({ 
    message: 'Share Unity API Server', 
    version: '0.0.0',
    environment: NODE_ENV,
    database: USE_POSTGRES ? 'PostgreSQL' : 'SQLite',
    endpoints: [
      'GET /api/members',
      'POST /api/members/upsert',
      'GET /api/session?sessionId=...',
      'POST /api/session',
      'DELETE /api/session?sessionId=...'
    ]
  });
});

// Serve frontend production build if exists
const DIST_DIR = path.join(__dirname, '..', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// 약관 페이지 — public/ 에서 직접 서빙 (빌드 여부와 무관하게 항상 동작)
app.get('/terms',   (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'terms.html')));
app.get('/privacy', (req, res) => res.sendFile(path.join(PUBLIC_DIR, 'privacy.html')));

try {
  const distExists = fs.existsSync(DIST_DIR);
  logger.info('Dist path check:', { path: DIST_DIR, exists: distExists });
  if (distExists) {
    const files = fs.readdirSync(DIST_DIR).slice(0, 20);
    logger.info('Dist files:', { files });
    // Serve static files and ensure Cache-Control is a string (avoid undefined header values)
    app.use(express.static(DIST_DIR, {
      setHeaders: (res /*, path */) => {
        try {
          const cc = process.env.CACHE_CONTROL || 'public, max-age=0';
          if (cc !== undefined && cc !== null) res.setHeader('Cache-Control', String(cc));
        } catch (e) {
          // ignore header set errors to avoid crashing the server
        }
      }
    }));

    // SPA fallback
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      if (req.path.startsWith('/uploads')) return next();
      res.sendFile(path.join(DIST_DIR, 'index.html'));
    });
  }
} catch (e) {
  logger.error('Error checking dist directory:', e);
}

// GET /api/members
app.get('/api/members', async (req, res) => {
  try {
    const query = USE_POSTGRES 
      ? 'SELECT member_id, email, name, phone, status, role, supply_manager, distribution_manager, sd_mark, memo, region_id, created_at, updated_at FROM members ORDER BY created_at DESC'
      : 'SELECT memberId, email, name, phone, status, role, supplyManager, distributionManager, sdMark, memo, regionId, createdAt, updatedAt FROM members';
    const rows = await db.query(query);
    return jsonOk(res, { members: normalizeMembers(rows) });
  } catch (err) {
    logger.error('Error fetching members:', err);
    return jsonFail(res, 500, err.message || String(err), { stack: NODE_ENV === 'development' ? err.stack : undefined });
  }
});

// GET /api/members/:id - fetch single member by id
app.get('/api/members/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) return jsonFail(res, 400, 'id required');
    if (USE_POSTGRES) {
      const row = await db.get('SELECT * FROM members WHERE member_id::text = $1 OR email = $1 LIMIT 1', [id]);
      return jsonOk(res, { member: normalizeMember(row) });
    } else {
      const row = await db.get('SELECT * FROM members WHERE memberId = ? OR email = ? LIMIT 1', [id, id]);
      return jsonOk(res, { member: normalizeMember(row) });
    }
  } catch (err) {
    logger.error('Error fetching member by id:', err);
    return jsonFail(res, 500, err.message || String(err));
  }
});

// POST /api/members/upsert
// POST /api/members - create new member (fails if email/phone exists)
app.post('/api/members', async (req, res) => {
  try {
    const m = req.body || {};
    const now = new Date().toISOString();
    if (!m.email && !m.phone) return jsonFail(res, 400, 'email or phone required');

    // Check existing by email or phone
    if (USE_POSTGRES) {
      const exists = await db.query(`SELECT * FROM members WHERE email = $1 OR phone = $2 LIMIT 1`, [m.email || null, m.phone || null]);
      if (exists && exists.length > 0) return jsonFail(res, 409, 'member_exists', { member: exists[0] });

      const query = `
        INSERT INTO members(email, name, phone, status, role, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6)
        RETURNING member_id, email, name, phone, status, role, created_at, updated_at
      `;
      const status = (m.status || 'ACTIVE').toUpperCase();
      const role = m.role || 'USER';
      const result = await db.query(query, [m.email || null, m.name || '', m.phone || null, status, role, now]);
      res.status(201);
      return jsonOk(res, { member: normalizeMember(result[0]) });
    } else {
      // SQLite: check existing
      const exists = await db.get(`SELECT * FROM members WHERE email = ? OR phone = ? LIMIT 1`, [m.email || null, m.phone || null]);
      if (exists) return jsonFail(res, 409, 'member_exists', { member: exists });

      // create with client-provided memberId if present, otherwise use generated id
      const memberId = m.memberId || (`M_${Date.now()}_${Math.floor(Math.random()*10000)}`);
      const status = (m.status || 'ACTIVE').toUpperCase();
      const role = m.role || 'USER';
      const query = `
        INSERT INTO members(memberId, name, email, phone, status, role, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(query, [memberId, m.name || '', m.email || '', m.phone || '', status, role, now, now]);
      res.status(201);
      const created = { memberId, email: m.email, name: m.name, phone: m.phone, status, role, createdAt: now, updatedAt: now };
      return jsonOk(res, { member: normalizeMember(created) });
    }
  } catch (err) {
    logger.error('Error creating member:', err);
    return jsonFail(res, 500, err.message || String(err));
  }
});

// DELETE /api/members/:id - delete member (admin only)
app.delete('/api/members/:id', requireAuth, async (req, res) => {
  try {
    const memberId = req.params.id;
    if (!memberId) return jsonFail(res, 400, 'member id required');

    // ADMIN 이상만 타인 계정 삭제 가능
    if (!isAdminRole(req.authRole)) {
      return jsonFail(res, 403, 'Forbidden: 관리자만 회원을 삭제할 수 있습니다.');
    }

    // 자기 자신 삭제 방지
    if (String(memberId) === String(req.authMemberId)) {
      return jsonFail(res, 403, 'Cannot delete yourself');
    }

    const currentMemberId = req.authMemberId;

    if (USE_POSTGRES) {
      await db.run('DELETE FROM members WHERE member_id = $1', [memberId]);
    } else {
      // SQLite
      await db.run('DELETE FROM members WHERE memberId = ?', [memberId]);
    }

    logger.info(`Member deleted: ${memberId} by ${currentMemberId}`);
    return jsonOk(res, { ok: true, message: 'Member deleted successfully' });
  } catch (err) {
    logger.error('Error deleting member:', err);
    return jsonFail(res, 500, err.message || String(err));
  }
});

// PUT /api/members/:id - upsert member by id (SSOT)
app.put('/api/members/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const body = req.body || {};
    if (!id) return jsonFail(res, 400, 'member id required');

    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      const status = body.status !== undefined ? String(body.status).toUpperCase() : 'ACTIVE';
      // ⚠️ role 변경은 API에서 차단 — DB 직접 수정으로만 가능
      const supplyManager = (body.supplyManager !== undefined || body.supply_manager !== undefined)
        ? !!(body.supplyManager !== undefined ? body.supplyManager : body.supply_manager)
        : false;
      const distributionManager = (body.distributionManager !== undefined || body.distribution_manager !== undefined)
        ? !!(body.distributionManager !== undefined ? body.distributionManager : body.distribution_manager)
        : false;

      const rawPasswordHash = body.passwordHash !== undefined ? body.passwordHash : body.password_hash;
      const passwordHash = rawPasswordHash ? String(rawPasswordHash) : null;

      const rawSdMark = body.sdMark !== undefined ? body.sdMark : body.sd_mark;
      const sdMark = rawSdMark === '' || rawSdMark === null || rawSdMark === undefined
        ? null
        : Math.max(0, Number(rawSdMark) || 0) || null;

      const query = `
        INSERT INTO members(member_id, email, name, phone, password_hash, status, role, supply_manager, distribution_manager, sd_mark, memo, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT(member_id)
        DO UPDATE SET
          email = COALESCE(EXCLUDED.email, members.email),
          name = COALESCE(EXCLUDED.name, members.name),
          phone = COALESCE(EXCLUDED.phone, members.phone),
          password_hash = COALESCE(EXCLUDED.password_hash, members.password_hash),
          status = COALESCE(EXCLUDED.status, members.status),
          supply_manager = COALESCE(EXCLUDED.supply_manager, members.supply_manager),
          distribution_manager = COALESCE(EXCLUDED.distribution_manager, members.distribution_manager),
          sd_mark = COALESCE(EXCLUDED.sd_mark, members.sd_mark),
          memo = COALESCE(EXCLUDED.memo, members.memo),
          updated_at = EXCLUDED.updated_at
        RETURNING member_id, email, name, phone, status, role, supply_manager, distribution_manager, sd_mark, memo, created_at, updated_at
      `;
      const row = await db.get(query, [
        id,
        body.email || null,
        body.name || null,
        body.phone || null,
        passwordHash,
        status,
        'USER', // role은 INSERT 시 기본값 USER만 허용; 기존 row는 DO UPDATE에서 role 제외로 보존
        supplyManager,
        distributionManager,
        sdMark,
        body.memo || null,
        now,
        now
      ]);
      return jsonOk(res, { member: normalizeMember(row) });
    }

    // SQLite upsert
    const existing = await db.get('SELECT * FROM members WHERE memberId = ? LIMIT 1', [id]);
    if (!existing) {
      const status = (body.status || 'ACTIVE').toUpperCase();
      const role = body.role || 'USER';
      const supplyManager = (body.supplyManager !== undefined || body.supply_manager !== undefined)
        ? ((body.supplyManager !== undefined ? body.supplyManager : body.supply_manager) ? 1 : 0)
        : 0;
      const distributionManager = (body.distributionManager !== undefined || body.distribution_manager !== undefined)
        ? ((body.distributionManager !== undefined ? body.distributionManager : body.distribution_manager) ? 1 : 0)
        : 0;
      const rawSdMark = body.sdMark !== undefined ? body.sdMark : body.sd_mark;
      const sdMark = rawSdMark === '' || rawSdMark === null || rawSdMark === undefined
        ? null
        : Math.max(0, Number(rawSdMark) || 0) || null;
      
      // Postgres 백업 복원 시 snake_case 필드명 지원
      const passwordHash = body.passwordHash || body.password_hash || '';
      const regionId = body.regionId || body.region_id || null;
      
      const query = `
        INSERT INTO members(memberId, name, email, phone, status, role, supplyManager, distributionManager, sdMark, memo, password, passwordHash, regionId, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(query, [
        id,
        body.name || '',
        body.email || '',
        body.phone || '',
        status,
        role,
        supplyManager,
        distributionManager,
        sdMark,
        body.memo || '',
        body.password || '',
        passwordHash,
        regionId,
        now,
        now,
      ]);
      const member = await db.get('SELECT * FROM members WHERE memberId = ? LIMIT 1', [id]);
      return jsonOk(res, { member: normalizeMember(member) });
    }

    // update existing (partial)
    const sets = [];
    const params = [];
    if (body.name !== undefined) { sets.push('name = ?'); params.push(body.name); }
    if (body.email !== undefined) { sets.push('email = ?'); params.push(body.email); }
    if (body.phone !== undefined) { sets.push('phone = ?'); params.push(body.phone); }
    if (body.status !== undefined) { sets.push('status = ?'); params.push(String(body.status).toUpperCase()); }
    // ⚠️ role 변경은 API에서 차단 — DB 직접 수정으로만 가능
    if (body.password !== undefined) { sets.push('password = ?'); params.push(body.password); }
    
    // Postgres 백업 복원 시 snake_case 필드명 지원
    if (body.passwordHash !== undefined || body.password_hash !== undefined) {
      sets.push('passwordHash = ?');
      params.push(body.passwordHash || body.password_hash);
    }
    if (body.regionId !== undefined || body.region_id !== undefined) {
      sets.push('regionId = ?');
      params.push(body.regionId || body.region_id);
    }
    
    if (body.memo !== undefined) { sets.push('memo = ?'); params.push(body.memo); }
    if (body.sdMark !== undefined || body.sd_mark !== undefined) {
      const rawSdMark = body.sdMark !== undefined ? body.sdMark : body.sd_mark;
      const sdMark = rawSdMark === '' || rawSdMark === null || rawSdMark === undefined
        ? null
        : Math.max(0, Number(rawSdMark) || 0) || null;
      sets.push('sdMark = ?');
      params.push(sdMark);
    }
    if (body.supplyManager !== undefined || body.supply_manager !== undefined) {
      const val = body.supplyManager !== undefined ? body.supplyManager : body.supply_manager;
      sets.push('supplyManager = ?');
      params.push(val ? 1 : 0);
    }
    if (body.distributionManager !== undefined || body.distribution_manager !== undefined) {
      const val = body.distributionManager !== undefined ? body.distributionManager : body.distribution_manager;
      sets.push('distributionManager = ?');
      params.push(val ? 1 : 0);
    }
    sets.push('updatedAt = ?');
    params.push(now);
    params.push(id);
    await db.run(`UPDATE members SET ${sets.join(', ')} WHERE memberId = ?`, params);
    const member = await db.get('SELECT * FROM members WHERE memberId = ? LIMIT 1', [id]);
    return jsonOk(res, { member: normalizeMember(member) });
  } catch (err) {
    logger.error('Error upserting member:', err);
    return jsonFail(res, 500, err.message || String(err));
  }
});

// PATCH /api/members/:id - update member by id only
app.patch('/api/members/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    if (!id) return jsonFail(res, 400, 'member id required');

    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      // Update by primary key (member_id)
      const fields = [];
      const values = [];
      let idx = 1;
      if (updates.name !== undefined) { fields.push(`name=$${idx++}`); values.push(updates.name); }
      if (updates.phone !== undefined) { fields.push(`phone=$${idx++}`); values.push(updates.phone); }
      if (updates.address !== undefined) { fields.push(`address=$${idx++}`); values.push(updates.address); }
      if (updates.regionId !== undefined || updates.region_id !== undefined) {
        const rv = updates.regionId !== undefined ? updates.regionId : updates.region_id;
        fields.push(`region_id=$${idx++}`); values.push(rv || null);
      }
      if (updates.district_id !== undefined || updates.districtId !== undefined) {
        const dv = updates.districtId !== undefined ? updates.districtId : updates.district_id;
        fields.push(`district_id=$${idx++}`); values.push(dv || null);
      }
      if (updates.status !== undefined) { fields.push(`status=$${idx++}`); values.push(updates.status); }
      if (updates.sdMark !== undefined || updates.sd_mark !== undefined) {
        const rawSdMark = updates.sdMark !== undefined ? updates.sdMark : updates.sd_mark;
        const sdMark = rawSdMark === '' || rawSdMark === null || rawSdMark === undefined
          ? null
          : Math.max(0, Number(rawSdMark) || 0) || null;
        fields.push(`sd_mark=$${idx++}`); values.push(sdMark);
      }
      // ⚠️ role 변경은 보안상 API에서 차단 — DB 직접 수정으로만 가능
      if (updates.supplyManager !== undefined || updates.supply_manager !== undefined) { 
        const val = updates.supplyManager !== undefined ? updates.supplyManager : updates.supply_manager;
        fields.push(`supply_manager=$${idx++}`); 
        values.push(!!val); 
      }
      if (updates.distributionManager !== undefined || updates.distribution_manager !== undefined) {
        const val = updates.distributionManager !== undefined ? updates.distributionManager : updates.distribution_manager;
        fields.push(`distribution_manager=$${idx++}`);
        values.push(!!val);
      }
      if (fields.length === 0) return jsonFail(res, 400, 'no fields to update');
      fields.push(`updated_at=$${idx++}`); values.push(now);
      const query = `UPDATE members SET ${fields.join(', ')} WHERE member_id = $${idx} RETURNING member_id, email, name, phone, address, status, role, supply_manager, distribution_manager, sd_mark, region_id, district_id, memo, created_at, updated_at`;
      values.push(id);
      logger.info('[PATCH /api/members/:id][sdMark] incoming updates', { id, updates });
      logSQL('UPDATE', '/api/members/:id', query, values);
      const rows = await db.query(query, values);
      logger.info(`[PATCH /api/members/:id] ⚠️ AFFECTED ROWS: ${rows.length || 0} (expected: 1, target: ${id})`);
      if (!rows || rows.length === 0) {
        return jsonFail(res, 404, 'member not found', { memberId: id });
      }
      return jsonOk(res, { member: normalizeMember(rows[0]) });
    } else {
      // SQLite: update by memberId
      const sets = [];
      const params = [];
      if (updates.name !== undefined) { sets.push('name = ?'); params.push(updates.name); }
      if (updates.phone !== undefined) { sets.push('phone = ?'); params.push(updates.phone); }
      if (updates.address !== undefined) { sets.push('address = ?'); params.push(updates.address); }
      if (updates.regionId !== undefined || updates.region_id !== undefined) {
        const rv = updates.regionId !== undefined ? updates.regionId : updates.region_id;
        sets.push('regionId = ?'); params.push(rv || null);
      }
      if (updates.district_id !== undefined || updates.districtId !== undefined) {
        const dv = updates.districtId !== undefined ? updates.districtId : updates.district_id;
        sets.push('district_id = ?'); params.push(dv || null);
      }
      if (updates.status !== undefined) { sets.push('status = ?'); params.push(updates.status); }
      if (updates.sdMark !== undefined || updates.sd_mark !== undefined) {
        const rawSdMark = updates.sdMark !== undefined ? updates.sdMark : updates.sd_mark;
        const sdMark = rawSdMark === '' || rawSdMark === null || rawSdMark === undefined
          ? null
          : Math.max(0, Number(rawSdMark) || 0) || null;
        sets.push('sdMark = ?'); params.push(sdMark);
      }
      // ⚠️ role 변경은 보안상 API에서 차단 — DB 직접 수정으로만 가능
      if (updates.supplyManager !== undefined || updates.supply_manager !== undefined) { 
        const val = updates.supplyManager !== undefined ? updates.supplyManager : updates.supply_manager;
        sets.push('supplyManager = ?'); 
        params.push(val ? 1 : 0); 
      }
      if (updates.distributionManager !== undefined || updates.distribution_manager !== undefined) {
        const val = updates.distributionManager !== undefined ? updates.distributionManager : updates.distribution_manager;
        sets.push('distributionManager = ?');
        params.push(val ? 1 : 0);
      }
      if (sets.length === 0) return jsonFail(res, 400, 'no fields to update');
      sets.push('updatedAt = ?'); params.push(now);
      params.push(id);
      const query = `UPDATE members SET ${sets.join(', ')} WHERE memberId = ?`;
      logger.info('[PATCH /api/members/:id][sdMark] incoming updates', { id, updates });
      logSQL('UPDATE', '/api/members/:id', query, params);
      const result = await db.run(query, params);
      const affected = result?.changes || 0;
      logger.info(`[PATCH /api/members/:id] ⚠️ AFFECTED ROWS: ${affected} (expected: 1, target: ${id})`);
      if (affected === 0) {
        return jsonFail(res, 404, 'member not found', { memberId: id });
      }
      const member = await db.get(`SELECT * FROM members WHERE memberId = ?`, [id]);
      if (!member) {
        return jsonFail(res, 404, 'member not found', { memberId: id });
      }
      return jsonOk(res, { member: normalizeMember(member) });
    }
  } catch (err) {
    logger.error('Error updating member:', err);
    return jsonFail(res, 500, err.message || String(err));
  }
});

// GET /api/session?sessionId=...
app.get('/api/session', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || null;
    if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
    
    const query = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1'
      : 'SELECT * FROM sessions WHERE sessionId = ?';
    const row = await db.get(query, [sessionId]);
    res.json(normalizeSession(row));
  } catch (err) {
    logger.error('Error fetching session:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/session
app.post('/api/session', async (req, res) => {
  try {
    const s = req.body || {};
    const sessionId = s.sessionId || `S_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    const signedAt = s.signedAt || now;
    const status = (s.status || 'ACTIVE').toUpperCase();
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO sessions(session_id, member_id, status, signed_at)
        VALUES($1, $2, $3, $4)
        ON CONFLICT(session_id) DO UPDATE SET
          member_id=EXCLUDED.member_id,
          status=EXCLUDED.status,
          signed_at=EXCLUDED.signed_at
        RETURNING session_id
      `;
      await db.query(query, [sessionId, s.memberId || null, status, signedAt]);
    } else {
      const query = `
        INSERT INTO sessions(sessionId, memberId, status, signedAt)
        VALUES(?, ?, ?, ?)
        ON CONFLICT(sessionId) DO UPDATE SET
          memberId=excluded.memberId,
          status=excluded.status,
          signedAt=excluded.signedAt
      `;
      await db.run(query, [sessionId, s.memberId || null, status, signedAt]);
    }
    // sessionId는 이미 camelCase이므로 정규화 불필요
    return jsonOk(res, { sessionId });
  } catch (err) {
    logger.error('Error creating session:', err);
    return jsonFail(res, 500, err.message);
  }
});

// DELETE /api/session
app.delete('/api/session', async (req, res) => {
  try {
    const sessionId = req.query.sessionId || null;
    if (!sessionId) return jsonFail(res, 400, 'sessionId required');
    
    const query = USE_POSTGRES
      ? 'DELETE FROM sessions WHERE session_id = $1'
      : 'DELETE FROM sessions WHERE sessionId = ?';
    await db.run(query, [sessionId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting session:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ============ Auth API ============
// ══════════════════════════════════════════════
// 브루트포스 방지 — 인메모리 Rate Limiting
// ══════════════════════════════════════════════
const _attempts = {
  login:  new Map(), // 일반 로그인  IP → { count, lockUntil }
  admin:  new Map(), // 어드민 로그인
  backup: new Map(), // 백업 비밀번호
};
function _getIp(req) {
  return String(req.headers['x-forwarded-for'] || req.ip || '0.0.0.0').split(',')[0].trim();
}
function _checkLock(map, ip) {
  const e = map.get(ip);
  if (!e || e.lockUntil <= Date.now()) return null;
  return Math.ceil((e.lockUntil - Date.now()) / 1000);
}
function _recordFail(map, ip, maxAttempts, lockMs) {
  const e = map.get(ip) || { count: 0, lockUntil: 0 };
  if (e.lockUntil > Date.now()) return;
  e.count++;
  if (e.count >= maxAttempts) { e.lockUntil = Date.now() + lockMs; e.count = 0; }
  map.set(ip, e);
}
function _clearAttempts(map, ip) { map.delete(ip); }

// DEV helper: clear admin login lock for an IP (unsafe in production)
app.post('/internal/clear-admin-lock', (req, res) => {
  try {
    if (process.env.NODE_ENV === 'production') return res.status(403).json({ error: 'forbidden' });
    const ip = req.body?.ip || _getIp(req);
    _clearAttempts(_attempts.admin, ip);
    return res.json({ ok: true, clearedIp: ip });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    // ── 브루트포스 방지 (15회 / 10분) ──
    const _ip = _getIp(req);
    const _lockSec = _checkLock(_attempts.login, _ip);
    if (_lockSec) return jsonFail(res, 429, `로그인 시도 초과. ${_lockSec}초 후 다시 시도하세요.`);

    const rawBody = req.body || {};
    const password = rawBody?.password;
    const rawIdentifier = rawBody?.email ?? rawBody?.userId ?? rawBody?.phone ?? rawBody?.identifier;

    if (!rawIdentifier) return jsonFail(res, 400, 'email or phone required', { details: { missing: 'identifier' } });
    if (!password) return jsonFail(res, 400, 'password required', { details: { missing: 'password' } });

    // 이메일/휴대폰번호/memberId(기존 아이디) 식별자 허용
    const identifier = String(rawIdentifier).trim();
    const normalizedIdentifier = identifier.toLowerCase();
    const normalizedPhone = identifier.replace(/\D/g, '');
    const isEmail = identifier.includes('@');
    const isPhone = normalizedPhone.length >= 8 && normalizedPhone.length <= 15;

    const now = new Date().toISOString();

    // Development shortcut: allow admin login without DB when NODE_ENV !== 'production'
    if (process.env.NODE_ENV !== 'production' && String(identifier) === 'admin' && String(password) === '1234') {
      const nowDev = new Date().toISOString();
      const sessionIdDev = `SESSION_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
      // WEBSITE_ADMIN 계정 조회 후 실제 member_id 사용 (FK 제약 우회)
      let devMemberId = null;
      try {
        const adminRow = await db.get(
          `SELECT member_id FROM members WHERE role IN ('WEBSITE_ADMIN','SUPER_ADMIN','ADMIN') ORDER BY member_id ASC LIMIT 1`
        );
        devMemberId = adminRow?.member_id ?? null;
      } catch (e) { /* ignore */ }
      if (devMemberId != null) {
        const sessionQueryDev = USE_POSTGRES
          ? `INSERT INTO sessions(session_id, member_id, status, signed_at) VALUES($1, $2, $3, $4)`
          : `INSERT INTO sessions(sessionId, memberId, status, signedAt) VALUES(?, ?, ?, ?)`;
        try { await db.run(sessionQueryDev, [sessionIdDev, devMemberId, 'ACTIVE', nowDev]); } catch (e) { /* ignore */ }
      }
      try { res.cookie('su_token', sessionIdDev, { httpOnly: true, sameSite: 'lax', path: '/' }); } catch (e) {}
      _clearAttempts(_attempts.login, _ip);
      return jsonOk(res, { token: sessionIdDev, member: { memberId: devMemberId ?? 'admin', email: 'admin', name: 'Developer', status: 'ACTIVE', role: 'WEBSITE_ADMIN' } });
    }

    // 이메일/휴대폰번호/memberId(기존 아이디)로 조회
    let member;
    let row = null;
    if (USE_POSTGRES) {
      const sql = isEmail
        ? 'SELECT * FROM members WHERE LOWER(email) = LOWER($1) LIMIT 1'
        : isPhone
          ? "SELECT * FROM members WHERE regexp_replace(COALESCE(phone, ''), '[^0-9]', '', 'g') = $1 LIMIT 1"
          : 'SELECT * FROM members WHERE CAST(member_id AS TEXT) = $1 OR LOWER(email) = LOWER($1) LIMIT 1';
      const params = isEmail ? [normalizedIdentifier] : isPhone ? [normalizedPhone] : [identifier];
      row = await db.get(sql, params);
      if (!row) return jsonFail(res, 401, '아이디 또는 비밀번호가 일치하지 않습니다.');

      const storedHash = row.password_hash || row.passwordHash || null;
      const storedLegacy = row.password || null;
      let ok = false;
      if (storedHash) {
        ok = await bcrypt.compare(String(password), String(storedHash));
      } else if (storedLegacy) {
        ok = String(storedLegacy) === String(password);
        // best-effort upgrade to hash (SSOT migration)
        if (ok) {
          try {
            const newHash = await bcrypt.hash(String(password), 10);
            await db.run('UPDATE members SET password_hash = $1, updated_at = $2 WHERE member_id = $3', [newHash, now, row.member_id]);
          } catch (e) {
            logger.warn('[AUTH_LOGIN] Failed to upgrade legacy password to hash (postgres)', e);
          }
        }
      }
      if (!ok) { _recordFail(_attempts.login, _ip, 15, 10*60*1000); return jsonFail(res, 401, '아이디 또는 비밀번호가 일치하지 않습니다.'); }
      member = {
        memberId: row.member_id,
        email: row.email,
        name: row.name,
        phone: row.phone,
        status: row.status,
        role: row.role,
        regionId: row.region_id,
      };
    } else {
      const sql = isEmail
        ? 'SELECT * FROM members WHERE LOWER(email) = LOWER(?) LIMIT 1'
        : isPhone
          ? "SELECT * FROM members WHERE REPLACE(REPLACE(REPLACE(REPLACE(COALESCE(phone, ''), '-', ''), ' ', ''), '(', ''), ')', '') = ? LIMIT 1"
          : 'SELECT * FROM members WHERE memberId = ? OR LOWER(email) = LOWER(?) LIMIT 1';
      const params = isEmail ? [normalizedIdentifier] : isPhone ? [normalizedPhone] : [identifier, identifier];
      row = await db.get(sql, params);
      if (!row) return jsonFail(res, 401, '아이디 또는 비밀번호가 일치하지 않습니다.', { details: { identifier } });

      const storedHash = row.passwordHash || null;
      const storedLegacy = row.password || null;
      let ok = false;
      if (storedHash) {
        ok = await bcrypt.compare(String(password), String(storedHash));
      } else if (storedLegacy) {
        ok = String(storedLegacy) === String(password);
        // SSOT migration: upgrade legacy plaintext to bcrypt hash
        if (ok) {
          try {
            const newHash = await bcrypt.hash(String(password), 10);
            await db.run('UPDATE members SET passwordHash = ?, updatedAt = ? WHERE memberId = ?', [newHash, now, row.memberId]);
          } catch (e) {
            logger.warn('[AUTH_LOGIN] Failed to upgrade legacy password to hash (sqlite)', e);
          }
        }
      }
      if (!ok) { _recordFail(_attempts.login, _ip, 15, 10*60*1000); return jsonFail(res, 401, '아이디 또는 비밀번호가 일치하지 않습니다.'); }
      member = {
        memberId: row.memberId,
        email: row.email,
        name: row.name,
        phone: row.phone,
        status: row.status,
        role: row.role,
        regionId: row.regionId,
      };
    }

    // SUPER_ADMIN_EMAIL 또는 SUPER_ADMIN_MEMBER_ID에 해당하면 role을 WEBSITE_ADMIN으로 즉시 반영
    // (서버 재기동 전에도 관리자 진입 가능하도록 로그인 시점에도 체크)
    const _saEmailsLogin = (process.env.SUPER_ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const _saIdsLogin    = (process.env.SUPER_ADMIN_MEMBER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
    if (_saEmailsLogin.includes((member.email || '').toLowerCase()) ||
        _saIdsLogin.includes(String(member.memberId))) {
      member.role = 'WEBSITE_ADMIN';
    }

    // If the account is marked must_change_password, do NOT issue a session.
    // Instead, instruct client to go through password-change flow.
    const mustChange = row && (row.must_change_password || row.mustChangePassword || false);
    if (mustChange) {
      // Clear attempts and return a specific flag. Do not create session.
      _clearAttempts(_attempts.login, _ip);
      return jsonOk(res, { mustChangePassword: true, message: '임시 비밀번호로 로그인했습니다. 비밀번호 변경이 필요합니다.', member: { memberId: member.memberId, email: member.email } });
    }

    _clearAttempts(_attempts.login, _ip); // 로그인 성공 → 시도 기록 초기화
    const sessionId = `SESSION_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const sessionQuery = USE_POSTGRES
      ? `INSERT INTO sessions(session_id, member_id, status, signed_at) VALUES($1, $2, $3, $4)`
      : `INSERT INTO sessions(sessionId, memberId, status, signedAt) VALUES(?, ?, ?, ?)`;
    await db.run(sessionQuery, [sessionId, member.memberId, 'ACTIVE', now]);

    // Cookie-based token (no localStorage required). Client can also use Bearer token.
    try {
      res.cookie('su_token', sessionId, { httpOnly: true, sameSite: 'lax', path: '/' });
    } catch (e) {}

    // Success contract must be { ok:true, success:true, member }
    return jsonOk(res, { token: sessionId, member });
  } catch (err) {
    logger.error('Error during login:', err);
    return jsonFail(res, 500, err.message || String(err), { details: { stack: NODE_ENV === 'development' ? err.stack : undefined } });
  }
});

// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, phone, regionId, districtId } = req.body || {};
    if (!email) return jsonFail(res, 400, '이메일을 입력해주세요.');
    if (!password) return jsonFail(res, 400, '비밀번호를 입력해주세요.');
    if (!regionId) return jsonFail(res, 400, '지역을 선택해주세요.');

    const normalizedEmail = String(email).trim().toLowerCase();
    if (!normalizedEmail) return jsonFail(res, 400, '이메일을 입력해주세요.');

    // SSOT: regionId must exist
    const regionRow = USE_POSTGRES
      ? await db.get('SELECT region_id FROM regions WHERE region_id = $1 LIMIT 1', [regionId])
      : await db.get('SELECT regionId FROM regions WHERE regionId = ? LIMIT 1', [regionId]);
    if (!regionRow) return jsonFail(res, 400, '유효하지 않은 지역입니다.');

    const now = new Date().toISOString();
    const memberId = `SU${Date.now()}${Math.floor(1000 + Math.random() * 9000)}`;

    if (USE_POSTGRES) {
      // PostgreSQL: member_id is SERIAL (auto-increment), don't insert it manually
      const exists = await db.get('SELECT 1 FROM members WHERE LOWER(email) = LOWER($1) LIMIT 1', [normalizedEmail]);
      if (exists) return jsonFail(res, 409, '이미 가입된 이메일입니다.');
      const passwordHash = await bcrypt.hash(String(password), 10);
      const result = await db.get(
        'INSERT INTO members(email, name, phone, password_hash, status, role, region_id, district_id, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING member_id',
        [normalizedEmail, name || '', phone || '', passwordHash, 'ACTIVE', 'USER', regionId, districtId || null, now, now]
      );
      const newMemberId = result.member_id;
      return jsonOk(res, { member: { memberId: newMemberId, email: normalizedEmail, name: name || '', phone: phone || '', regionId, districtId: districtId || null, status: 'ACTIVE', role: 'USER' } });
    } else {
      // SQLite: memberId is custom string ID
      const exists = await db.get('SELECT 1 FROM members WHERE LOWER(email) = LOWER(?) LIMIT 1', [normalizedEmail]);
      if (exists) return jsonFail(res, 409, '이미 가입된 이메일입니다.');
      const passwordHash = await bcrypt.hash(String(password), 10);
      await db.run(
        'INSERT INTO members(memberId, name, email, phone, passwordHash, password, regionId, districtId, status, role, createdAt, updatedAt) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)',
        [memberId, name || '', normalizedEmail, phone || '', passwordHash, '', regionId, districtId || null, 'ACTIVE', 'USER', now, now]
      );
      return jsonOk(res, { member: { memberId, email: normalizedEmail, name: name || '', phone: phone || '', regionId, districtId: districtId || null, status: 'ACTIVE', role: 'USER' } });
    }
  } catch (err) {
    logger.error('Error during register:', err);
    // 사용자 친화적 에러 메시지
    if (err.code === '23505' || err.message?.includes('duplicate key') || err.message?.includes('UNIQUE constraint')) {
      return jsonFail(res, 409, '이미 가입된 이메일입니다.');
    }
    return jsonFail(res, 500, '회원가입 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
  }
});

// POST /api/auth/change-password
// Accepts: { email, currentPassword, newPassword }
app.post('/api/auth/change-password', async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body || {};
    if (!email) return jsonFail(res, 400, 'email required');
    if (!currentPassword) return jsonFail(res, 400, 'currentPassword required');
    if (!newPassword) return jsonFail(res, 400, 'newPassword required');
    if (typeof newPassword !== 'string' || newPassword.length < 8) return jsonFail(res, 400, '새 비밀번호는 최소 8자 이상이어야 합니다.');

    const identifier = String(email).trim();
    const isEmail = identifier.includes('@');

    let row;
    if (USE_POSTGRES) {
      const sql = isEmail
        ? 'SELECT * FROM members WHERE LOWER(email) = LOWER($1) LIMIT 1'
        : 'SELECT * FROM members WHERE REPLACE(REPLACE(REPLACE(phone, \'-\', \'\'), \' \' , \'\'), \'()\', \'\') = $1 LIMIT 1';
      const params = isEmail ? [identifier.toLowerCase()] : [identifier.replace(/[\\s()-]/g, '')];
      row = await db.get(sql, params);
      if (!row) return jsonFail(res, 404, '회원이 존재하지 않습니다.');
    } else {
      const sql = isEmail
        ? 'SELECT * FROM members WHERE LOWER(email) = LOWER(?) LIMIT 1'
        : 'SELECT * FROM members WHERE REPLACE(REPLACE(REPLACE(phone, \'-\', \'\'), \' \' , \'\'), \'()\', \'\') = ? LIMIT 1';
      const params = isEmail ? [identifier.toLowerCase()] : [identifier.replace(/[\s()-]/g, '')];
      row = await db.get(sql, params);
      if (!row) return jsonFail(res, 404, '회원이 존재하지 않습니다.');
    }

    const storedHash = row.password_hash || row.passwordHash || null;
    const storedLegacy = row.password || null;
    let ok = false;
    if (storedHash) {
      ok = await bcrypt.compare(String(currentPassword), String(storedHash));
    } else if (storedLegacy) {
      ok = String(storedLegacy) === String(currentPassword);
    }
    if (!ok) return jsonFail(res, 401, '현재 비밀번호가 일치하지 않습니다.');

    const newHash = await bcrypt.hash(String(newPassword), 10);
    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run('UPDATE members SET password_hash = $1, must_change_password = false, updated_at = $2 WHERE member_id = $3', [newHash, now, row.member_id]);
    } else {
      await db.run('UPDATE members SET passwordHash = ?, mustChangePassword = 0, updatedAt = ? WHERE memberId = ?', [newHash, now, row.memberId]);
    }

    // Optionally create a new session after password change
    const sessionId = `SESSION_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const sessionQuery = USE_POSTGRES
      ? `INSERT INTO sessions(session_id, member_id, status, signed_at) VALUES($1, $2, $3, $4)`
      : `INSERT INTO sessions(sessionId, memberId, status, signedAt) VALUES(?, ?, ?, ?)`;
    await db.run(sessionQuery, [sessionId, (row.member_id || row.memberId), 'ACTIVE', now]);
    try { res.cookie('su_token', sessionId, { httpOnly: true, sameSite: 'lax', path: '/' }); } catch (e) {}

    return jsonOk(res, { token: sessionId, message: '비밀번호가 변경되었습니다. 새 세션을 발급합니다.' });
  } catch (err) {
    logger.error('change-password error:', err);
    return jsonFail(res, 500, '비밀번호 변경 중 오류가 발생했습니다.');
  }
});

// POST /api/auth/logout
app.post('/api/auth/logout', async (req, res) => {
  try {
    const token = getAuthToken(req);
    if (!token) return jsonFail(res, 400, 'token required');
    
    // 세션 삭제
    const query = USE_POSTGRES
      ? 'DELETE FROM sessions WHERE session_id = $1'
      : 'DELETE FROM sessions WHERE sessionId = ?';
    await db.run(query, [token]);
    try {
      res.clearCookie('su_token', { path: '/' });
    } catch (e) {}
    return jsonOk(res, { message: 'Logged out successfully' });
  } catch (err) {
    logger.error('Error during logout:', err);
    return jsonFail(res, 500, err.message);
  }
});

// GET /api/auth/me (현재 로그인한 사용자 정보)
app.get('/api/auth/me', async (req, res) => {
  try {
    const token = getAuthToken(req);
    if (!token) return jsonFail(res, 401, 'Unauthorized');
    
    // 세션 확인
    const sessionQuery = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND status = ?';
    const session = await db.get(sessionQuery, [token, 'ACTIVE']);
    
    if (!session) return jsonFail(res, 401, 'Invalid or expired session');
    
    // 회원 정보 조회
    const memberQuery = USE_POSTGRES
      ? 'SELECT * FROM members WHERE member_id = $1'
      : 'SELECT * FROM members WHERE memberId = ?';
    const member = await db.get(memberQuery, [session.member_id || session.memberId]);
    
    if (!member) return jsonFail(res, 404, 'Member not found');

    // Normalize + never leak password/passwordHash (Issue A fix: add supplyManager)
    const normalized = USE_POSTGRES
      ? {
        memberId: member.member_id,
        email: member.email,
        name: member.name,
        phone: member.phone,
        status: member.status,
        role: member.role,
        supplyManager: !!member.supply_manager,
        distributionManager: !!member.distribution_manager,
        regionId: member.region_id,
        createdAt: member.created_at,
        updatedAt: member.updated_at,
      }
      : {
        memberId: member.memberId,
        email: member.email,
        name: member.name,
        phone: member.phone,
        status: member.status,
        role: member.role,
        supplyManager: !!member.supplyManager,
        distributionManager: !!member.distributionManager,
        regionId: member.regionId,
        createdAt: member.createdAt,
        updatedAt: member.updatedAt,
      };

    return jsonOk(res, { member: normalized });
  } catch (err) {
    logger.error('Error fetching current user:', err);
    return jsonFail(res, 500, err.message || String(err), { details: { stack: NODE_ENV === 'development' ? err.stack : undefined } });
  }
});

// ============ Admin Auth API ============
// POST /api/admin/auth/login — 2-step: Step1은 /api/auth/login, Step2가 여기
app.post('/api/admin/auth/login', async (req, res) => {
  try {
    // ── 브루트포스 방지 (5회 / 15분) ──
    const _ip = _getIp(req);
    const _lockSec = _checkLock(_attempts.admin, _ip);
    if (_lockSec) {
      const remaining = Math.ceil(_lockSec / 60);
      return res.status(429).json({ error: `관리자 로그인 잠금 중입니다. ${remaining}분 후 다시 시도하세요.`, locked: true });
    }

    const { password, memberId } = req.body || {};
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin1234';

    // 프로덕션에서 기본 비밀번호 사용 시 경고
    if (process.env.NODE_ENV === 'production' && ADMIN_PASSWORD === 'admin1234') {
      logger.warn('⚠️  WARNING: Using default admin password in production! Set ADMIN_PASSWORD env variable.');
    }

    // memberId 필수 — Step1(회원 로그인) 없이 직접 접근 차단
    if (!memberId) {
      return res.status(400).json({ error: '회원 인증 정보가 필요합니다. 먼저 로그인하세요.' });
    }

    // Development bypass: allow admin/1234 to authenticate without DB when not in production
    let memberRow = null;
    if (process.env.NODE_ENV !== 'production' && String(memberId) === 'admin' && String(password) === '1234') {
      memberRow = { member_id: 'admin', name: 'Developer', role: 'WEBSITE_ADMIN', status: 'ACTIVE', email: process.env.SUPER_ADMIN_EMAIL || 'admin' };
    } else {
      // DB에서 회원 조회 + role=ADMIN 검증
      // NOTE: include password fields to support allowing member account password as alternative admin credential
      memberRow = USE_POSTGRES
        ? await db.get('SELECT member_id, name, role, status, email, password_hash, NULL::text AS legacy_password FROM members WHERE member_id = $1 LIMIT 1', [memberId])
        : await db.get('SELECT memberId AS member_id, name, role, status, email, COALESCE(passwordHash, NULL) AS password_hash, COALESCE(password, NULL) AS legacy_password FROM members WHERE memberId = ? LIMIT 1', [memberId]);
    }

    if (!memberRow) {
      _recordFail(_attempts.admin, _ip, 5, 15 * 60 * 1000);
      return res.status(403).json({ error: '회원 정보를 찾을 수 없습니다.' });
    }
    // 웹사이트 관리자 여부: 이메일 기반(SUPER_ADMIN_EMAIL) + ID 기반 하위호환(SUPER_ADMIN_MEMBER_ID)
    const _saEmails = (process.env.SUPER_ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const _saIds    = (process.env.SUPER_ADMIN_MEMBER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
    const isSuperAdmin = _saIds.includes(String(memberRow.member_id))
      || _saEmails.includes((memberRow.email || '').toLowerCase());
    // 관리자 콘솔 접근 허용 role: ADMIN, SUPER_ADMIN, WEBSITE_ADMIN (REGION_ADMIN 제외)
    const isAdminRole = ['ADMIN', 'SUPER_ADMIN', 'WEBSITE_ADMIN'].includes(memberRow.role);
    if (!isAdminRole && !isSuperAdmin) {
      _recordFail(_attempts.admin, _ip, 5, 15 * 60 * 1000);
      return res.status(403).json({ error: '관리자 권한이 없는 계정입니다.' });
    }
    if (memberRow.status !== 'ACTIVE') {
      return res.status(403).json({ error: '비활성화된 계정입니다.' });
    }

    // 관리자 비밀번호 확인
    let adminAuthOk = false;
    try {
      // 1) global admin password match
      if (password === ADMIN_PASSWORD) adminAuthOk = true;
      // 2) 또는 회원 계정 비밀번호와 일치하는지 검증 (bcrypt 또는 legacy)
      if (!adminAuthOk) {
        const storedHash = memberRow.password_hash || null;
        const storedLegacy = memberRow.legacy_password || null;
        if (storedHash) {
          try {
            adminAuthOk = await bcrypt.compare(String(password), String(storedHash));
          } catch (e) {
            adminAuthOk = false;
          }
        } else if (storedLegacy) {
          adminAuthOk = String(storedLegacy) === String(password);
        }
      }
    } catch (e) {
      adminAuthOk = false;
    }

    if (!adminAuthOk) {
      _recordFail(_attempts.admin, _ip, 5, 15 * 60 * 1000);
      // 잠금 적용 여부 확인
      const attemptEntry = _attempts.admin.get(_ip) || { count: 0, lockUntil: 0 };
      const justLocked = attemptEntry.lockUntil > Date.now();
      const left = justLocked ? 0 : Math.max(0, 5 - attemptEntry.count);
      const msg = justLocked
        ? `비밀번호가 올바르지 않습니다. 15분 잠금이 적용되었습니다.`
        : `비밀번호가 올바르지 않습니다.${left > 0 ? ` (${left}회 남음)` : ''}`;
      return res.status(401).json({ error: msg });
    }

    // ── 로그인 성공 ──
    _clearAttempts(_attempts.admin, _ip);
    const sessionId = `ADMIN_SESSION_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    // 만료: 4시간
    const expiresAt = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString();

    const query = USE_POSTGRES
      ? `INSERT INTO sessions(session_id, member_id, status, signed_at, expires_at)
         VALUES($1, $2, $3, $4, $5)`
      : `INSERT INTO sessions(sessionId, memberId, status, signedAt)
         VALUES(?, ?, ?, ?)`;
    const params = USE_POSTGRES
      ? [sessionId, memberRow.member_id, 'ACTIVE', now, expiresAt]
      : [sessionId, String(memberId), 'ACTIVE', now];
    await db.run(query, params);

    logger.info(`[ADMIN LOGIN] memberId=${memberRow.member_id} ip=${_ip}`);
    // 실효 역할: 웹사이트 관리자이면 WEBSITE_ADMIN 우선
    const effectiveRole = isSuperAdmin ? 'WEBSITE_ADMIN' : memberRow.role;
    return res.json({
      ok: true,
      token: sessionId,
      expiresAt,
      memberName: memberRow.name || '',
      memberRole: effectiveRole,
      isWebsiteAdmin: isSuperAdmin,
      message: 'Admin login successful',
    });
  } catch (err) {
    logger.error('Error during admin login:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/auth/logout
app.post('/api/admin/auth/logout', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.body?.token;
    if (!token) return res.status(400).json({ error: 'token required' });
    
    const query = USE_POSTGRES
      ? 'DELETE FROM sessions WHERE session_id = $1'
      : 'DELETE FROM sessions WHERE sessionId = ?';
    await db.run(query, [token]);
    
    res.json({ ok: true, message: 'Admin logged out successfully' });
  } catch (err) {
    logger.error('Error during admin logout:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/auth/verify - Verify admin session (만료 + role 이중 검증)
app.get('/api/admin/auth/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '') || req.query?.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized', authenticated: false });

    // PostgreSQL: expires_at 비교를 DB 서버의 NOW()로 처리 → Node.js 타임존 파싱 버그 완전 회피
    const query = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2 AND (expires_at IS NULL OR expires_at > NOW())'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND status = ?';
    const sessionParams = USE_POSTGRES ? [token, 'ACTIVE'] : [token, 'ACTIVE'];
    const session = await db.get(query, sessionParams);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired admin session', authenticated: false });
    }

    // ★ 이중 방어: 회원의 현재 role이 여전히 관리자인지 재확인
    // 세션 삭제가 실패한 경우나 직접 DB 변경 등을 대비
    if (USE_POSTGRES && session.member_id) {
      try {
        const memberRow = await db.get('SELECT role, email FROM members WHERE member_id = $1 LIMIT 1', [session.member_id]);
        const ADMIN_ELIGIBLE = ['ADMIN', 'SUPER_ADMIN', 'WEBSITE_ADMIN'];
        const _saEmails = (process.env.SUPER_ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
        const _saIds    = (process.env.SUPER_ADMIN_MEMBER_ID || '').split(',').map(s => s.trim()).filter(Boolean);
        const isStillAdmin = (memberRow && ADMIN_ELIGIBLE.includes(memberRow.role))
          || _saIds.includes(String(session.member_id))
          || _saEmails.includes((memberRow?.email || '').toLowerCase());
        if (!isStillAdmin) {
          await db.run('DELETE FROM sessions WHERE session_id = $1', [token]).catch(() => {});
          return res.status(403).json({ error: '관리자 권한이 없는 계정입니다.', authenticated: false });
        }
      } catch (roleCheckErr) {
        // role 조회 실패 시 기존 세션 유효 상태 유지 (서비스 안정성 우선)
        logger.warn('[VERIFY] role check failed (non-blocking):', roleCheckErr.message);
      }
    }

    return res.json({ ok: true, authenticated: true });
  } catch (err) {
    logger.error('Error verifying admin session:', err);
    res.status(500).json({ error: err.message, authenticated: false });
  }
});

// GET /api/admin/members/export - 관리자 전용: 백업을 위해 모든 필드 포함
app.get('/api/admin/members/export', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    // 관리자 세션 확인
    const sessionQuery = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND memberId = ? AND status = ?';
    const sessionParams = USE_POSTGRES ? [token, 'ACTIVE'] : [token, 'ADMIN', 'ACTIVE'];
    const session = await db.get(sessionQuery, sessionParams);
    
    if (!session) return res.status(401).json({ error: 'Unauthorized' });
    
    // 백업용: password, passwordHash 포함한 모든 필드 반환
    const query = USE_POSTGRES 
      ? 'SELECT * FROM members ORDER BY created_at DESC'
      : 'SELECT * FROM members ORDER BY createdAt DESC';
    const rows = await db.query(query);
    
    logger.info(`[ADMIN] Members export: ${rows?.length || 0} members exported`);
    return jsonOk(res, { members: rows || [] });
  } catch (err) {
    logger.error('Error exporting members:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ============================================
// 역할 관리 API (총관리자/관리자 전용)
// ============================================

// PATCH /api/admin/members/:id/role — 회원 역할 변경
app.patch('/api/admin/members/:id/role', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });
    const sessionRow = USE_POSTGRES
      ? await db.get('SELECT member_id FROM sessions WHERE session_id = $1 AND status = $2', [token, 'ACTIVE'])
      : await db.get('SELECT memberId AS member_id FROM sessions WHERE sessionId = ? AND status = ?', [token, 'ACTIVE']);
    if (!sessionRow) return res.status(401).json({ error: '세션이 만료되었습니다.' });

    // 역할 허용값 (WEBSITE_ADMIN은 env 전용, 직접 부여 불가)
    const VALID_ROLES = ['USER', 'REGION_MANAGER', 'REGION_ADMIN', 'ADMIN', 'SUPER_ADMIN'];
    const ROLE_ALIASES = {
      REGION_SUPER_MANAGER: 'REGION_ADMIN',
      REGION_MANAGER: 'REGION_MANAGER',
      REGION_ADMIN: 'REGION_ADMIN',
      ADMIN: 'ADMIN',
      SUPER_ADMIN: 'SUPER_ADMIN',
      USER: 'USER',
    };
    const { role } = req.body || {};
    const normalizedRole = ROLE_ALIASES[String(role || '').trim().toUpperCase()] || null;
    if (!normalizedRole || !VALID_ROLES.includes(normalizedRole)) {
      return res.status(400).json({ error: `유효하지 않은 역할입니다. 허용값: ${VALID_ROLES.join(', ')}` });
    }

    const targetId = req.params.id;

    // ── 권한 계층 검증 (이메일 기반 + ID 기반 하위호환) ──
    const _saEmails = (process.env.SUPER_ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const _wIds     = (process.env.SUPER_ADMIN_MEMBER_ID || '').split(',').map(s => s.trim()).filter(Boolean);

    // 요청자·대상자 DB role + email 조회 (이메일 기반 체크를 위해 먼저 조회)
    const requesterRow = USE_POSTGRES
      ? await db.get('SELECT role, email FROM members WHERE member_id = $1', [sessionRow.member_id])
      : null;
    const targetRow = USE_POSTGRES
      ? await db.get('SELECT role, email FROM members WHERE member_id = $1', [targetId])
      : null;

    const requesterIsWebsiteAdmin = _wIds.includes(String(sessionRow.member_id))
      || _saEmails.includes((requesterRow?.email || '').toLowerCase())
      || requesterRow?.role === 'WEBSITE_ADMIN';
    const targetIsWebsiteAdmin = _wIds.includes(String(targetId))
      || _saEmails.includes((targetRow?.email || '').toLowerCase())
      || targetRow?.role === 'WEBSITE_ADMIN';

    // 웹사이트 관리자 계정은 누구도 변경 불가
    // SUPER_ADMIN_LOCK=Y 설정 시 서버 재기동마다 이메일 기반으로 재적용됨
    if (targetIsWebsiteAdmin) {
      return res.status(403).json({ error: '웹사이트 관리자의 권한은 변경할 수 없습니다.' });
    }

    const ROLE_LEVEL = { USER: 0, REGION_MANAGER: 1, REGION_ADMIN: 2, ADMIN: 3, SUPER_ADMIN: 4, WEBSITE_ADMIN: 5 };
    const requesterLevel = requesterIsWebsiteAdmin ? ROLE_LEVEL.WEBSITE_ADMIN : (ROLE_LEVEL[requesterRow?.role] ?? 0);
    const targetLevel    = ROLE_LEVEL[targetRow?.role] ?? 0;
    const newRoleLevel   = ROLE_LEVEL[normalizedRole] ?? 0;

    // 자신과 동급 이상의 계정은 변경 불가
    if (targetLevel >= requesterLevel) {
      return res.status(403).json({ error: '자신과 동급 이상의 계정 권한은 변경할 수 없습니다.' });
    }
    // 자신의 등급 이상 역할로 변경 불가
    if (newRoleLevel >= requesterLevel) {
      return res.status(403).json({ error: '자신의 등급 이상 역할로는 변경할 수 없습니다.' });
    }

    if (USE_POSTGRES) {
      await db.run('UPDATE members SET role = $1, updated_at = NOW() WHERE member_id = $2', [normalizedRole, targetId]);
    } else {
      await db.run('UPDATE members SET role = ? WHERE memberId = ?', [normalizedRole, targetId]);
    }

    // 지역총관리자가 아닌 역할로 변경 시 기존 지역 배정 삭제
    if (normalizedRole !== 'REGION_ADMIN' && USE_POSTGRES) {
      await db.run('DELETE FROM region_admin_assignments WHERE member_id = $1', [targetId]);
    }

    // 관리자 권한 없는 역할로 변경 시 해당 회원의 관리자 세션 즉시 삭제 (강제 로그아웃)
    const ADMIN_ELIGIBLE = ['ADMIN', 'SUPER_ADMIN', 'WEBSITE_ADMIN'];
    if (!ADMIN_ELIGIBLE.includes(normalizedRole) && USE_POSTGRES) {
      await db.run('DELETE FROM sessions WHERE member_id = $1', [targetId]).catch(() => {});
      logger.info(`[ROLE] Admin sessions invalidated for member ${targetId} (new role: ${normalizedRole})`);
    }

    logger.info(`[ROLE] member ${targetId} role changed to ${normalizedRole} by session ${token}`);
    return jsonOk(res, { memberId: targetId, role: normalizedRole });
  } catch (err) {
    logger.error('Error updating member role:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/admin/members/:id/reset-password — 관리자 임시 비밀번호 발급
app.post('/api/admin/members/:id/reset-password', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });
    const sessionRow = USE_POSTGRES
      ? await db.get(
          'SELECT s.member_id, m.role, m.email FROM sessions s JOIN members m ON s.member_id = m.member_id WHERE s.session_id = $1 AND s.status = $2',
          [token, 'ACTIVE']
        )
      : await db.get(
          'SELECT s.memberId AS member_id, m.role, m.email FROM sessions s JOIN members m ON s.memberId = m.memberId WHERE s.sessionId = ? AND s.status = ?',
          [token, 'ACTIVE']
        );
    if (!sessionRow) return res.status(401).json({ error: '세션이 만료되었습니다.' });

    const requesterRole = String(sessionRow.role || 'USER').toUpperCase();
    if (!isAdminRole(requesterRole)) {
      return res.status(403).json({ error: '관리자만 임시 비밀번호를 발급할 수 있습니다.' });
    }

    const targetId = String(req.params.id || '').trim();
    if (!targetId) return res.status(400).json({ error: '회원 ID가 필요합니다.' });

    const _saEmails = (process.env.SUPER_ADMIN_EMAIL || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    const _wIds = (process.env.SUPER_ADMIN_MEMBER_ID || '').split(',').map(s => s.trim()).filter(Boolean);

    const requesterIsWebsiteAdmin = _wIds.includes(String(sessionRow.member_id))
      || _saEmails.includes((sessionRow.email || '').toLowerCase())
      || requesterRole === 'WEBSITE_ADMIN';

    const targetRow = USE_POSTGRES
      ? await db.get('SELECT member_id, email, role, status FROM members WHERE member_id = $1', [targetId])
      : await db.get('SELECT memberId AS member_id, email, role, status FROM members WHERE memberId = ?', [targetId]);
    if (!targetRow) return res.status(404).json({ error: '회원을 찾을 수 없습니다.' });

    const targetIsWebsiteAdmin = _wIds.includes(String(targetId))
      || _saEmails.includes((targetRow.email || '').toLowerCase())
      || String(targetRow.role || '').toUpperCase() === 'WEBSITE_ADMIN';

    if (targetIsWebsiteAdmin && !requesterIsWebsiteAdmin) {
      return res.status(403).json({ error: '웹사이트 관리자 계정의 비밀번호는 발급할 수 없습니다.' });
    }

    const ROLE_LEVEL = { USER: 0, REGION_MANAGER: 1, REGION_ADMIN: 2, ADMIN: 3, SUPER_ADMIN: 4, WEBSITE_ADMIN: 5 };
    const requesterLevel = requesterIsWebsiteAdmin ? ROLE_LEVEL.WEBSITE_ADMIN : (ROLE_LEVEL[requesterRole] ?? 0);
    const targetLevel = targetIsWebsiteAdmin ? ROLE_LEVEL.WEBSITE_ADMIN : (ROLE_LEVEL[String(targetRow.role || 'USER').toUpperCase()] ?? 0);
    if (targetLevel >= requesterLevel) {
      return res.status(403).json({ error: '자신과 동급 이상 계정의 비밀번호는 발급할 수 없습니다.' });
    }

    const temporaryPassword = generateTemporaryPassword(10);
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        'UPDATE members SET password_hash = $1, must_change_password = true, updated_at = $2 WHERE member_id = $3',
        [passwordHash, now, targetId]
      );
      await db.run('DELETE FROM sessions WHERE member_id = $1', [targetId]).catch(() => {});
    } else {
      await db.run(
        'UPDATE members SET passwordHash = ?, mustChangePassword = 1, updatedAt = ? WHERE memberId = ?',
        [passwordHash, now, targetId]
      );
      await db.run('DELETE FROM sessions WHERE memberId = ?', [targetId]).catch(() => {});
    }

    logger.info(`[RESET-PW] member ${targetId} temp password issued by admin ${sessionRow.member_id}`);
    return jsonOk(res, {
      memberId: targetId,
      email: targetRow.email,
      temporaryPassword,
      mustChangePassword: true,
    });
  } catch (err) {
    logger.error('Error resetting member password:', err);
    return jsonFail(res, 500, err.message);
  }
});

// GET /api/admin/members/:id/region-assignments — 지역관리자 배정 목록
app.get('/api/admin/members/:id/region-assignments', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });
    const sessionRow = USE_POSTGRES
      ? await db.get('SELECT member_id FROM sessions WHERE session_id = $1 AND status = $2', [token, 'ACTIVE'])
      : null;
    if (!sessionRow) return res.status(401).json({ error: '세션이 만료되었습니다.' });

    if (!USE_POSTGRES) return jsonOk(res, { assignments: [] });
    const rows = await db.query(
      `SELECT raa.id, raa.region_id, raa.created_at, r.name AS region_name
       FROM region_admin_assignments raa
       LEFT JOIN regions r ON r.region_id = raa.region_id
       WHERE raa.member_id = $1
       ORDER BY raa.created_at`,
      [req.params.id]
    );
    return jsonOk(res, { assignments: rows || [] });
  } catch (err) {
    logger.error('Error getting region assignments:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/admin/members/:id/region-assignments — 지역 배정 추가
app.post('/api/admin/members/:id/region-assignments', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });
    const sessionRow = USE_POSTGRES
      ? await db.get('SELECT member_id FROM sessions WHERE session_id = $1 AND status = $2', [token, 'ACTIVE'])
      : null;
    if (!sessionRow) return res.status(401).json({ error: '세션이 만료되었습니다.' });

    const { regionId } = req.body || {};
    if (!regionId) return res.status(400).json({ error: 'regionId가 필요합니다.' });
    if (!USE_POSTGRES) return jsonOk(res, { ok: true });

    await db.run(
      `INSERT INTO region_admin_assignments(member_id, region_id) VALUES($1, $2)
       ON CONFLICT(member_id, region_id) DO NOTHING`,
      [req.params.id, regionId]
    );
    return jsonOk(res, { memberId: req.params.id, regionId });
  } catch (err) {
    logger.error('Error adding region assignment:', err);
    return jsonFail(res, 500, err.message);
  }
});

// DELETE /api/admin/members/:id/region-assignments/:regionId — 지역 배정 제거
app.delete('/api/admin/members/:id/region-assignments/:regionId', async (req, res) => {
  try {
    const token = req.headers['x-admin-token'] || req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: '인증이 필요합니다.' });
    const sessionRow = USE_POSTGRES
      ? await db.get('SELECT member_id FROM sessions WHERE session_id = $1 AND status = $2', [token, 'ACTIVE'])
      : null;
    if (!sessionRow) return res.status(401).json({ error: '세션이 만료되었습니다.' });

    if (!USE_POSTGRES) return jsonOk(res, { ok: true });
    await db.run(
      'DELETE FROM region_admin_assignments WHERE member_id = $1 AND region_id = $2',
      [req.params.id, req.params.regionId]
    );
    return jsonOk(res, { memberId: req.params.id, regionId: req.params.regionId });
  } catch (err) {
    logger.error('Error removing region assignment:', err);
    return jsonFail(res, 500, err.message);
  }
});

// GET /api/admin/backup - 관리자 전용: 전체 DB 백업 (주요 테이블 포함)
app.get('/api/admin/backup', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });

    // PostgreSQL 관리자 세션은 member_id = NULL로 저장되므로 member_id 조건 제외
    const sessionQuery = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND memberId = ? AND status = ?';
    const sessionParams = USE_POSTGRES ? [token, 'ACTIVE'] : [token, 'ADMIN', 'ACTIVE'];
    const session = await db.get(sessionQuery, sessionParams);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    const tables = {};
    const q = async (sql, params = []) => USE_POSTGRES ? await db.query(sql, params) : await db.query(sql, params);

    // Collect core tables
    tables.regions = await q(USE_POSTGRES ? 'SELECT * FROM regions' : 'SELECT * FROM regions');
    tables.shops = await q(USE_POSTGRES ? 'SELECT * FROM shops' : 'SELECT * FROM shops');
    tables.missions = await q(USE_POSTGRES ? 'SELECT * FROM missions' : 'SELECT * FROM missions');
    tables.events = await q(USE_POSTGRES ? 'SELECT * FROM events' : 'SELECT * FROM events');
    tables.auditions = await q(USE_POSTGRES ? 'SELECT * FROM auditions' : 'SELECT * FROM auditions');
    tables.broadcasts = await q(USE_POSTGRES ? 'SELECT * FROM broadcasts' : 'SELECT * FROM broadcasts');
    tables.members = await q(USE_POSTGRES ? 'SELECT * FROM members' : 'SELECT * FROM members');
    tables.supplies = await q(USE_POSTGRES ? 'SELECT * FROM supplies' : 'SELECT * FROM supplies');
    tables.supply_requests = await q(USE_POSTGRES ? 'SELECT * FROM supply_requests' : 'SELECT * FROM supply_requests');
    tables.participations = await q(USE_POSTGRES ? 'SELECT * FROM participations' : 'SELECT * FROM participations');
    tables.point_ledger = await q(USE_POSTGRES ? 'SELECT * FROM point_ledger' : 'SELECT * FROM point_ledger');
    tables.posts = await q(USE_POSTGRES ? 'SELECT * FROM posts' : 'SELECT * FROM posts');
    tables.banners = await q(USE_POSTGRES ? 'SELECT * FROM banners' : 'SELECT * FROM banners');
    tables.notices = await q(USE_POSTGRES ? 'SELECT * FROM notices' : 'SELECT * FROM notices');
    tables.shop_payout_requests = await q(USE_POSTGRES ? 'SELECT * FROM shop_payout_requests' : 'SELECT * FROM shop_payout_requests');
    tables.qr_payments = await q(USE_POSTGRES ? 'SELECT * FROM qr_payments' : 'SELECT * FROM qr_payments');
    // 추가 테이블
    tables.voucher_types         = await q('SELECT * FROM voucher_types');
    tables.voucher_ledger        = await q('SELECT * FROM voucher_ledger');
    tables.shop_earnings         = await q('SELECT * FROM shop_earnings');
    tables.configs               = await q('SELECT * FROM configs');
    tables.reviews               = await q('SELECT * FROM reviews');
    tables.supply_items          = await q('SELECT * FROM supply_items');
    tables.audition_submissions  = await q('SELECT * FROM audition_submissions');
    tables.audition_votes        = await q('SELECT * FROM audition_votes');
    tables.audition_submission_comments = await q('SELECT * FROM audition_submission_comments');
    tables.schedules             = await q('SELECT * FROM schedules');
    tables.broadcast_comments    = await q('SELECT * FROM broadcast_comments');
    tables.chats                 = await q('SELECT * FROM chats');
    tables.friends               = await q('SELECT * FROM friends');
    // 게시판/아파트/지역구 테이블
    tables.boards                = await q('SELECT * FROM boards');
    tables.board_comments        = await q('SELECT * FROM board_comments');
    tables.districts             = await q('SELECT * FROM districts');
    tables.apartments            = await q('SELECT * FROM apartments');
    tables.apartment_posts       = await q('SELECT * FROM apartment_posts');
    tables.apartment_post_comments = await q('SELECT * FROM apartment_post_comments');
    tables.region_news             = await q('SELECT * FROM region_news');
    tables.region_admin_assignments = await q('SELECT * FROM region_admin_assignments');

    logger.info(`[ADMIN] Full backup prepared`);
    return jsonOk(res, { backup: tables });
  } catch (err) {
    logger.error('Error preparing full backup:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ────────── 관리자 상점 승인 API ──────────
// PATCH /api/admin/shops/:id/approve - 상점 승인
app.patch('/api/admin/shops/:id/approve', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const sessionQuery = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND memberId = ? AND status = ?';
    const sessionParams = USE_POSTGRES ? [token, 'ACTIVE'] : [token, 'ADMIN', 'ACTIVE'];
    const session = await db.get(sessionQuery, sessionParams);
    
    if (!session) return res.status(401).json({ error: 'Invalid admin session' });
    
    const shopId = req.params.id;
    const now = new Date().toISOString();
    
    const updateQuery = USE_POSTGRES
      ? 'UPDATE shops SET status = $1, updated_at = $2 WHERE shop_id = $3'
      : 'UPDATE shops SET status = ?, updatedAt = ? WHERE shopId = ?';
    await db.run(updateQuery, ['approved', now, shopId]);
    
    res.json({ ok: true, shopId, status: 'approved' });
  } catch (err) {
    logger.error('Error approving shop:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/shops/:id/reject - 상점 거부
app.patch('/api/admin/shops/:id/reject', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    const sessionQuery2 = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND memberId = ? AND status = ?';
    const sessionParams2 = USE_POSTGRES ? [token, 'ACTIVE'] : [token, 'ADMIN', 'ACTIVE'];
    const session2 = await db.get(sessionQuery2, sessionParams2);
    
    if (!session2) return res.status(401).json({ error: 'Invalid admin session' });
    
    const shopId = req.params.id;
    const now = new Date().toISOString();
    
    const updateQuery = USE_POSTGRES
      ? 'UPDATE shops SET status = $1, updated_at = $2 WHERE shop_id = $3'
      : 'UPDATE shops SET status = ?, updatedAt = ? WHERE shopId = ?';
    await db.run(updateQuery, ['rejected', now, shopId]);
    
    res.json({ ok: true, shopId, status: 'rejected' });
  } catch (err) {
    logger.error('Error rejecting shop:', err);
    res.status(500).json({ error: err.message });
  }
});

// Normalize Postgres snake_case to frontend camelCase for regions
const normalizeRegionRow = (row) => {
  if (!row) return null;
  if (row.regionId !== undefined) {
    return {
      ...row,
      id: row.regionId || row.id,
      city: row.city || row.district || '',
      district: row.district || row.city || '',
    };
  }
  // Convert Postgres snake_case to camelCase
  return {
    id: row.region_id || row.id,
    name: row.name,
    province: row.province,
    city: row.city || row.district || '',
    district: row.city || row.district || '',
    intro: row.intro,
    aptHouseholds: row.apt_households,
    avgSalePrice: row.avg_sale_price,
    trafficInfo: row.traffic_info,
    tourSpots: row.tour_spots,
    festivals: row.festivals,
    attractions: row.attractions,
    isPublic: row.is_public,
    createdAt: row.created_at || row.createdAt,
    updatedAt: row.updated_at || row.updatedAt
  };
};

// GET /api/regions
app.get('/api/regions', async (req, res) => {
  try {
    const query = USE_POSTGRES
      ? 'SELECT * FROM regions ORDER BY created_at DESC'
      : 'SELECT * FROM regions';
    const rows = await db.query(query);
    const normalized = (rows || []).map(normalizeRegionRow);
    return jsonOk(res, { regions: normalized });
  } catch (err) {
    logger.error('Error fetching regions:', err);
    return jsonFail(res, 500, err.message || String(err), { stack: NODE_ENV === 'development' ? err.stack : undefined });
  }
});

// POST /api/regions
app.post('/api/regions', async (req, res) => {
  try {
    const r = req.body || {};
    if (!r.name) return jsonFail(res, 400, 'name required');
    if (!r.province) return jsonFail(res, 400, 'province required');
    if (!(r.city || r.district)) return jsonFail(res, 400, 'city required');

    // prevent duplicates by name (case-insensitive)
    const nameNorm = String(r.name).trim();
    const cityNorm = String(r.city || r.district || '').trim();
    const dup = USE_POSTGRES
      ? await db.get('SELECT region_id FROM regions WHERE LOWER(name) = LOWER($1) LIMIT 1', [nameNorm])
      : await db.get('SELECT regionId FROM regions WHERE name = ? COLLATE NOCASE LIMIT 1', [nameNorm]);
    if (dup) return jsonFail(res, 409, 'region already exists');
    
    const regionId = r.id || r.regionId || `R_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    const tourSpots = Array.isArray(r.tourSpots) ? JSON.stringify(r.tourSpots) : (r.tourSpots || '[]');
    const festivals = Array.isArray(r.festivals) ? JSON.stringify(r.festivals) : (r.festivals || '[]');
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO regions(region_id, name, province, city, intro, apt_households, avg_sale_price, traffic_info, tour_spots, festivals, is_public, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        ON CONFLICT(region_id) DO UPDATE SET
          name=EXCLUDED.name,
          province=EXCLUDED.province,
          city=EXCLUDED.city,
          intro=EXCLUDED.intro,
          apt_households=EXCLUDED.apt_households,
          avg_sale_price=EXCLUDED.avg_sale_price,
          traffic_info=EXCLUDED.traffic_info,
          tour_spots=EXCLUDED.tour_spots,
          festivals=EXCLUDED.festivals,
          is_public=EXCLUDED.is_public,
          updated_at=EXCLUDED.updated_at
        RETURNING region_id
      `;
      await db.query(query, [
        regionId,
        nameNorm,
        r.province || '',
        cityNorm,
        r.intro || '',
        parseInt(r.aptHouseholds) || 0,
        r.avgSalePrice || '',
        r.trafficInfo || '',
        tourSpots,
        festivals,
        r.isPublic || false,
        now,
        now
      ]);
      // Seed 콘텐츠: 신규 지역 생성 시 웰컴 공지 + 웰컴 게시글 자동 생성
      try {
        const welcomeNoticeId = `notice_region_welcome_${regionId}`;
        const welcomeNoticeTitle = `${r.name} 지역 포탈에 오신 것을 환영합니다!`;
        const existingNotice = await db.get(
          `SELECT notice_id, id FROM notices WHERE id = $1 OR (region_id = $2 AND title = $3) LIMIT 1`,
          [welcomeNoticeId, regionId, welcomeNoticeTitle]
        );
        if (!existingNotice) {
          await db.query(
            `INSERT INTO notices(id, region_id, title, content, scope, status, is_pinned, created_at)
             VALUES($1, $2, $3, $4, 'REGION', 'ACTIVE', true, $5)`,
            [welcomeNoticeId, regionId, welcomeNoticeTitle,
             `${r.name} 지역 커뮤니티가 시작되었습니다. \n지역 주민 여러분의 참여로 더 풍성한 지역 공간이 될 수 있습니다. \n미션에 참여하고 게시판에서 이웃과 소통해보세요.`,
             now]
          );
        } else if (!existingNotice.id) {
          await db.run(`UPDATE notices SET id = $1 WHERE notice_id = $2`, [welcomeNoticeId, existingNotice.notice_id]);
        }
        const existingPost = await db.get(
          `SELECT board_id FROM boards WHERE region_id = $1 LIMIT 1`, [regionId]
        );
        if (!existingPost) {
          await db.query(
            `INSERT INTO boards(region_id, author_name, title, content, category, created_at)
             VALUES($1, '운영팀', $2, $3, 'notice', $4)`,
            [regionId, `${r.name} 주민 여러분 환영합니다 🎉`,
             `안녕하세요! ${r.name} 지역 커뮤니티 게시판입니다. \n자유롭게 글을 남기고 이웃과 소통해보세요. \n지역 미션에도 꼭 참여해주세요!`,
             now]
          );
        }
      } catch (seedErr) {
        logger.warn('[Seed] region seed content error (non-fatal):', seedErr.message);
      }
    } else {
      const query = `
        INSERT INTO regions(regionId, name, province, city, intro, aptHouseholds, avgSalePrice, trafficInfo, tourSpots, festivals, isPublic, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(regionId) DO UPDATE SET
          name=excluded.name,
          province=excluded.province,
          city=excluded.city,
          intro=excluded.intro,
          aptHouseholds=excluded.aptHouseholds,
          avgSalePrice=excluded.avgSalePrice,
          trafficInfo=excluded.trafficInfo,
          tourSpots=excluded.tourSpots,
          festivals=excluded.festivals,
          isPublic=excluded.isPublic,
          updatedAt=excluded.updatedAt
      `;
      await db.run(query, [
        regionId,
        nameNorm,
        r.province || '',
        cityNorm,
        r.intro || '',
        parseInt(r.aptHouseholds) || 0,
        r.avgSalePrice || '',
        r.trafficInfo || '',
        tourSpots,
        festivals,
        r.isPublic ? 1 : 0,
        now,
        now
      ]);
    }
    return jsonOk(res, { regionId });
  } catch (err) {
    logger.error('Error creating/updating region:', err);
    return jsonFail(res, 500, err.message);
  }
});

// GET /api/regions/:regionId/stats — 지역 활동 통계
app.get('/api/regions/:regionId/stats', async (req, res) => {
  try {
    const { regionId } = req.params;
    if (!regionId) return jsonFail(res, 400, 'regionId required');
    let activeCount = 0;
    let todayPosts = 0;
    if (USE_POSTGRES) {
      const today = new Date().toISOString().slice(0, 10);
      const missionRow = await db.get(
        `SELECT COUNT(*) AS cnt FROM missions WHERE region_id = $1 AND status = 'ACTIVE'`,
        [regionId]
      );
      const boardRow = await db.get(
        `SELECT COUNT(*) AS cnt FROM boards WHERE region_id = $1 AND created_at::date = $2::date`,
        [regionId, today]
      );
      const missionCnt = Number(missionRow?.cnt || 0);
      todayPosts = Number(boardRow?.cnt || 0);
      activeCount = missionCnt + todayPosts;
    }
    return jsonOk(res, { activeCount, todayPosts });
  } catch (err) {
    logger.error('Error fetching region stats:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/admin/backup/verify - 백업 전용 비밀번호 검증
app.post('/api/admin/backup/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // 관리자 세션 확인
    const sessionQuery = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND status = ?';
    const session = await db.get(sessionQuery, [token, 'ACTIVE']);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid admin session' });
    }
    
    // 백업 전용 비밀번호 확인
    const { password } = req.body;
    const BACKUP_PASSWORD = process.env.BACKUP_PASSWORD || 'backup1234';
    
    // 프로덕션에서 기본 비밀번호 사용 시 경고
    if (process.env.NODE_ENV === 'production' && BACKUP_PASSWORD === 'backup1234') {
      logger.warn('⚠️  WARNING: Using default backup password in production! Set BACKUP_PASSWORD env variable.');
    }
    
    // ── 백업 비밀번호 브루트포스 방지 (7회 / 5분) ──
    const _bIp = _getIp(req);
    const _bLock = _checkLock(_attempts.backup, _bIp);
    if (_bLock) return res.status(429).json({ error: `백업 시도 초과. ${_bLock}초 후 다시 시도하세요.` });

    if (password !== BACKUP_PASSWORD) {
      _recordFail(_attempts.backup, _bIp, 7, 5*60*1000);
      logger.warn(`[SECURITY] Backup password verification failed from IP: ${req.ip}`);
      return res.status(401).json({ error: 'Invalid backup password' });
    }
    
    _clearAttempts(_attempts.backup, _bIp);
    logger.info(`[SECURITY] Backup access granted for session: ${token}`);
    
    res.json({ 
      ok: true,
      message: 'Backup authentication successful'
    });
  } catch (err) {
    logger.error('Error verifying backup password:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/restore - 백업 전체 복원 (UPSERT)
app.post('/api/admin/restore', async (req, res) => {
  // try 밖에 선언: catch/finally에서도 접근 보장
  let _pgc = null;
  const _oq = db.query, _or = db.run, _og = db.get; // 원본 항상 캡처
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const sessionQuery = USE_POSTGRES
      ? 'SELECT * FROM sessions WHERE session_id = $1 AND status = $2'
      : 'SELECT * FROM sessions WHERE sessionId = ? AND memberId = ? AND status = ?';
    const sessionParams = USE_POSTGRES ? [token, 'ACTIVE'] : [token, 'ADMIN', 'ACTIVE'];
    const session = await db.get(sessionQuery, sessionParams);
    if (!session) return res.status(401).json({ error: 'Unauthorized' });

    // ── PostgreSQL 트랜잭션: 각 쿼리마다 SAVEPOINT로 개별 보호 ──
    // 항목 하나 실패해도 트랜잭션 전체가 abort되지 않음
    if (USE_POSTGRES && db._pool) {
      _pgc = await db._pool.connect();
      await _pgc.query('BEGIN');
      let _spIdx = 0;
      const _wrapPg = (fn) => async (t, p=[]) => {
        const sp = `sp_${_spIdx++}`;
        await _pgc.query(`SAVEPOINT ${sp}`);
        try {
          const r = await fn(t, p);
          await _pgc.query(`RELEASE SAVEPOINT ${sp}`);
          return r;
        } catch(e) {
          await _pgc.query(`ROLLBACK TO SAVEPOINT ${sp}`);
          throw e;
        }
      };
      db.query = _wrapPg((t, p=[]) => _pgc.query(t, p).then(r => r.rows));
      db.run   = _wrapPg((t, p=[]) => _pgc.query(t, p).then(() => {}));
      db.get   = _wrapPg((t, p=[]) => _pgc.query(t, p).then(r => r.rows[0] || null));
    }

    const data = req.body || {};
    let restored = 0, failed = 0, errors = [];
    const now = new Date().toISOString();

    // ── 기존 데이터 전체 삭제 (복원 = 완전 덮어쓰기) ──
    // FK 순서: 자식 테이블 먼저, SET LOCAL replica로 FK 체크 우회
    const RESTORE_TABLES = [
      'apartment_post_comments','apartment_posts',
      'board_comments','boards',
      'broadcast_comments','audition_submission_comments','audition_votes','audition_submissions','auditions',
      'region_news',
      'chats','friends','schedules',
      'participations','point_ledger','voucher_ledger',
      'shop_earnings','shop_payout_requests','qr_payments',
      'supply_requests','supply_items','supplies',
      'reviews','banners','notices','posts','broadcasts',
      'events','missions','shops','region_admin_assignments','members',
      'configs','voucher_types','districts','apartments','regions',
    ];
    // PostgreSQL 전용: FK 체크 비활성화 후 전체 삭제
    await _pgc.query('SET LOCAL session_replication_role = replica');
    for (const tbl of RESTORE_TABLES) {
      try { await _pgc.query(`DELETE FROM ${tbl}`); }
      catch(e) { errors.push(`[Clear] ${tbl}: ${e.message}`); }
    }

    // Regions
    for (const item of data.regions || []) {
      try {
        const id = item.regionId || item.region_id || item.id || `R_${Date.now()}`;
        const tourSpots = Array.isArray(item.tourSpots) ? JSON.stringify(item.tourSpots) : (item.tourSpots || '[]');
        const festivals = Array.isArray(item.festivals) ? JSON.stringify(item.festivals) : (item.festivals || '[]');
        
        const attractionsPG = item.attractions || null;
        await db.query(`INSERT INTO regions(region_id, name, province, intro, apt_households, avg_sale_price, traffic_info, tour_spots, festivals, attractions, is_public, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT(region_id) DO UPDATE SET name=EXCLUDED.name, province=EXCLUDED.province, intro=EXCLUDED.intro, apt_households=EXCLUDED.apt_households, avg_sale_price=EXCLUDED.avg_sale_price, traffic_info=EXCLUDED.traffic_info, tour_spots=EXCLUDED.tour_spots, festivals=EXCLUDED.festivals, attractions=EXCLUDED.attractions, is_public=EXCLUDED.is_public, updated_at=EXCLUDED.updated_at`,
          [id, item.name, item.province||'', item.intro||'', parseInt(item.aptHouseholds||item.apt_households)||0, item.avgSalePrice||item.avg_sale_price||'', item.trafficInfo||item.traffic_info||'', tourSpots, festivals, attractionsPG, !!(item.isPublic??item.is_public), item.createdAt||item.created_at||now, now]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Region ${item.name}: ${err.message}`);
      }
    }

    // Shops
    for (const item of data.shops || []) {
      try {
        const id = item.shopId || item.shop_id || item.id || `S_${Date.now()}`;
        // JSONB 컬럼: 항상 유효한 JSON 문자열로 변환 후 ::jsonb 캐스팅
        const _toJsonb = (v) => {
          if (v == null) return null;
          try {
            const obj = typeof v === 'string' ? JSON.parse(v) : v;
            return JSON.stringify(obj);
          } catch { return null; }
        };
        const menusPG     = _toJsonb(item.menus);
        const amenitiesPG = _toJsonb(item.amenities);
        const recMenusPG  = _toJsonb(item.recommendedMenus ?? item.recommended_menus);
        const latPG  = (item.lat  != null && item.lat  !== '') ? parseFloat(item.lat)  : null;
        const lngPG  = (item.lng  != null && item.lng  !== '') ? parseFloat(item.lng)  : null;
        await db.query(`INSERT INTO shops(shop_id, name, category, region, address, phone, description, hours, is_public, status, owner_id, created_by, registered_by, created_at, updated_at, region_id, thumbnail, business_hours, closed_day, break_time, recommended_menus, menus, amenities, lat, lng, review_allowed, vip_voucher_count) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21::jsonb,$22::jsonb,$23::jsonb,$24,$25,$26,$27) ON CONFLICT(shop_id) DO UPDATE SET name=EXCLUDED.name, category=EXCLUDED.category, region=EXCLUDED.region, address=EXCLUDED.address, phone=EXCLUDED.phone, description=EXCLUDED.description, hours=EXCLUDED.hours, is_public=EXCLUDED.is_public, status=EXCLUDED.status, owner_id=EXCLUDED.owner_id, created_by=EXCLUDED.created_by, registered_by=EXCLUDED.registered_by, region_id=EXCLUDED.region_id, thumbnail=EXCLUDED.thumbnail, business_hours=EXCLUDED.business_hours, closed_day=EXCLUDED.closed_day, break_time=EXCLUDED.break_time, recommended_menus=EXCLUDED.recommended_menus, menus=EXCLUDED.menus, amenities=EXCLUDED.amenities, lat=EXCLUDED.lat, lng=EXCLUDED.lng, review_allowed=EXCLUDED.review_allowed, vip_voucher_count=EXCLUDED.vip_voucher_count, updated_at=EXCLUDED.updated_at`,
          [id, item.name, item.category||'', item.region||item.region_id||'', item.address||'', item.phone||'', item.description||'', item.hours||item.business_hours||'', !!(item.isPublic??item.is_public), item.status||'pending', item.ownerId||item.owner_id||'', item.createdBy||item.created_by||'', item.registeredBy||item.registered_by||'', item.createdAt||item.created_at||now, now, item.regionId||item.region_id||null, item.thumbnail||'', item.businessHours||item.business_hours||'', item.closedDay||item.closed_day||'', item.breakTime||item.break_time||'', recMenusPG, menusPG, amenitiesPG, latPG, lngPG, !!(item.reviewAllowed??item.review_allowed??true), parseInt(item.vipVoucherCount??item.vip_voucher_count)||0]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Shop ${item.name}: ${err.message}`);
      }
    }

    // Missions
    for (const item of data.missions || []) {
      try {
        const id = item.missionId || item.mission_id || item.id || `M_${Date.now()}`;
        // JSONB 컬럼은 JS 배열/객체를 직접 전달 (문자열 금지)
        const regionIds = Array.isArray(item.regionIds||item.region_ids) ? (item.regionIds||item.region_ids) : [];
        const participants = item.participants ? (typeof item.participants === 'string' ? JSON.parse(item.participants) : item.participants) : null;
        await db.query(`INSERT INTO missions(mission_id, title, description, points, type, status, region_id, region_scope, region_ids, category, start_date, end_date, max_participants, created_by, participants, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) ON CONFLICT(mission_id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, points=EXCLUDED.points, type=EXCLUDED.type, status=EXCLUDED.status, region_id=EXCLUDED.region_id, region_scope=EXCLUDED.region_scope, region_ids=EXCLUDED.region_ids, category=EXCLUDED.category, start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date, max_participants=EXCLUDED.max_participants, created_by=EXCLUDED.created_by, participants=EXCLUDED.participants, updated_at=EXCLUDED.updated_at`,
          [id, item.title, item.description||'', parseInt(item.points)||0, item.type||'', item.status||'ACTIVE', item.regionId||item.region_id||null, item.regionScope||item.region_scope||'ALL', regionIds, item.category||'general', item.startDate||item.start_date||null, item.endDate||item.end_date||null, item.maxParticipants||item.max_participants||null, item.createdBy||item.created_by||'', participants, item.createdAt||item.created_at||now, now]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Mission ${item.title}: ${err.message}`);
      }
    }

    // Events
    for (const item of data.events || []) {
      try {
        const id = item.eventId || item.event_id || item.id || `E_${Date.now()}`;
        await db.query(`INSERT INTO events(event_id, title, description, region, start_date, end_date, location, is_public, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(event_id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, region=EXCLUDED.region, start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date, location=EXCLUDED.location, is_public=EXCLUDED.is_public, updated_at=EXCLUDED.updated_at`,
          [id, item.title, item.description||'', item.region||item.region_id||'', item.startDate||item.start_date||null, item.endDate||item.end_date||null, item.location||'', !!(item.isPublic??item.is_public), now, now]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Event ${item.title}: ${err.message}`);
      }
    }

    // Auditions (SERIAL PK이므로 id 무시)
    for (const item of data.auditions || []) {
      try {
        await db.query(`INSERT INTO auditions(title, description, category, region_id, deadline, requirements, image_url, video_url, status, created_by, created_at, updated_at, type, published, start_at, end_at, poster_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
          [item.title, item.description||'', item.category||'', item.regionId||item.region_id||'', item.deadline||null, item.requirements||'', item.imageUrl||item.image_url||'', item.videoUrl||item.video_url||'', item.status||'OPEN', item.createdBy||item.created_by||'', now, now, item.type||'FREE', item.published!==undefined?!!item.published:true, item.startAt||item.start_at||null, item.endAt||item.end_at||null, item.posterUrl||item.poster_url||'']);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Audition ${item.title}: ${err.message}`);
      }
    }

    // Broadcasts
    for (const item of data.broadcasts || []) {
      try {
        const id = item.broadcastId || item.broadcast_id || item.id || `B_${Date.now()}`;
        // JSONB: PG는 raw object, SQLite는 JSON string
        const uploadMetaPG = item.uploadMeta || null;
        await db.query(`INSERT INTO broadcasts(broadcast_id, title, video_kind, video_url, upload_url, upload_meta, region_id, is_public, is_live, live_started_at, published_at, legacy_id, created_by, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) ON CONFLICT(broadcast_id) DO UPDATE SET title=EXCLUDED.title, video_kind=EXCLUDED.video_kind, video_url=EXCLUDED.video_url, upload_url=EXCLUDED.upload_url, upload_meta=EXCLUDED.upload_meta, region_id=EXCLUDED.region_id, is_public=EXCLUDED.is_public, is_live=EXCLUDED.is_live, live_started_at=EXCLUDED.live_started_at, published_at=EXCLUDED.published_at, legacy_id=EXCLUDED.legacy_id, created_by=EXCLUDED.created_by, updated_at=EXCLUDED.updated_at`,
          [id, item.title, item.videoKind||item.video_kind||'', item.videoUrl||item.video_url||'', item.uploadUrl||item.upload_url||'', uploadMetaPG, item.regionId||item.region_id||'', !!(item.isPublic??item.is_public), !!(item.isLive??item.is_live), item.liveStartedAt||item.live_started_at||null, item.publishedAt||item.published_at||null, item.legacyId||item.legacy_id||'', item.createdBy||item.created_by||'', now, now]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Broadcast ${item.title}: ${err.message}`);
      }
    }

    // Members
    for (const item of data.members || []) {
      try {
        // JSONB: links는 JSON 문자열로 변환 후 ::jsonb 캐스팅
        const linksPG = (() => {
          const v = item.links;
          if (v == null) return null;
          try { return typeof v === 'string' ? v : JSON.stringify(v); } catch { return null; }
        })();
        const _memberId = item.member_id ?? item.memberId ?? null;
        if (USE_POSTGRES && _memberId != null) {
          // ★ member_id 보존: OVERRIDING SYSTEM VALUE로 SERIAL 시퀀스를 우회하여 원래 ID 유지
          await db.query(`INSERT INTO members(member_id, email, name, phone, password_hash, status, role, bio, links, card_public, supply_manager, region_id, region, region_name, memo, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) ON CONFLICT(member_id) DO UPDATE SET email=EXCLUDED.email, name=EXCLUDED.name, phone=EXCLUDED.phone, password_hash=EXCLUDED.password_hash, status=EXCLUDED.status, role=EXCLUDED.role, bio=EXCLUDED.bio, links=EXCLUDED.links, card_public=EXCLUDED.card_public, supply_manager=EXCLUDED.supply_manager, region_id=EXCLUDED.region_id, region=EXCLUDED.region, region_name=EXCLUDED.region_name, memo=EXCLUDED.memo, updated_at=EXCLUDED.updated_at`,
            [_memberId, item.email, item.name, item.phone||'', item.passwordHash||item.password_hash||'', item.status||'ACTIVE', item.role||'USER', item.bio||'', linksPG, !!(item.cardPublic??item.card_public), !!(item.supplyManager??item.supply_manager), item.regionId||item.region_id||null, item.region||null, item.regionName||item.region_name||null, item.memo||null, item.createdAt||item.created_at||now, now]);
        } else {
          await db.query(`INSERT INTO members(email, name, phone, password_hash, status, role, bio, links, card_public, supply_manager, region_id, region, region_name, memo, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16) ON CONFLICT(email) DO UPDATE SET name=EXCLUDED.name, phone=EXCLUDED.phone, password_hash=EXCLUDED.password_hash, status=EXCLUDED.status, role=EXCLUDED.role, bio=EXCLUDED.bio, links=EXCLUDED.links, card_public=EXCLUDED.card_public, supply_manager=EXCLUDED.supply_manager, region_id=EXCLUDED.region_id, region=EXCLUDED.region, region_name=EXCLUDED.region_name, memo=EXCLUDED.memo, updated_at=EXCLUDED.updated_at`,
            [item.email, item.name, item.phone||'', item.passwordHash||item.password_hash||'', item.status||'ACTIVE', item.role||'USER', item.bio||'', linksPG, !!(item.cardPublic??item.card_public), !!(item.supplyManager??item.supply_manager), item.regionId||item.region_id||null, item.region||null, item.regionName||item.region_name||null, item.memo||null, item.createdAt||item.created_at||now, now]);
        }
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Member ${item.email}: ${err.message}`);
      }
    }
    // ★ SERIAL 시퀀스를 복원된 최대 member_id로 재설정 → 이후 신규 회원 등록 시 ID 충돌 방지
    if (USE_POSTGRES && (data.members||[]).length > 0) {
      try {
        await _pgc.query(`SELECT setval('members_member_id_seq', GREATEST((SELECT COALESCE(MAX(member_id),1) FROM members), 1))`);
      } catch(e) { errors.push(`[Seq] members_member_id_seq reset: ${e.message}`); }
    }
    // ★ point_ledger 시퀀스 재설정 → 복원 후 포인트 지급 시 ID 충돌 방지
    if (USE_POSTGRES && (data.point_ledger||[]).length > 0) {
      try {
        await _pgc.query(`SELECT setval('point_ledger_ledger_id_seq', GREATEST((SELECT COALESCE(MAX(ledger_id),1) FROM point_ledger), 1))`);
      } catch(e) { errors.push(`[Seq] point_ledger_ledger_id_seq reset: ${e.message}`); }
    }
    // ★ 오디션 관련 SERIAL 시퀀스 재설정 → 복원 후 지원/투표/댓글 등록 시 PK 충돌 방지
    if (USE_POSTGRES && (data.audition_submissions||[]).length > 0) {
      try {
        await _pgc.query(`SELECT setval('audition_submissions_submission_id_seq', GREATEST((SELECT COALESCE(MAX(submission_id),1) FROM audition_submissions), 1))`);
      } catch(e) { errors.push(`[Seq] audition_submissions_submission_id_seq reset: ${e.message}`); }
    }
    if (USE_POSTGRES && (data.audition_votes||[]).length > 0) {
      try {
        await _pgc.query(`SELECT setval('audition_votes_vote_id_seq', GREATEST((SELECT COALESCE(MAX(vote_id),1) FROM audition_votes), 1))`);
      } catch(e) { errors.push(`[Seq] audition_votes_vote_id_seq reset: ${e.message}`); }
    }
    if (USE_POSTGRES && (data.audition_submission_comments||[]).length > 0) {
      try {
        await _pgc.query(`SELECT setval('audition_submission_comments_comment_id_seq', GREATEST((SELECT COALESCE(MAX(comment_id),1) FROM audition_submission_comments), 1))`);
      } catch(e) { errors.push(`[Seq] audition_submission_comments_comment_id_seq reset: ${e.message}`); }
    }
    // Supplies
    for (const item of data.supplies || []) {
      let id;
      try {
        id = item.supplyId || item.supply_id || item.id || `S_${Date.now()}`;
        await db.query(`INSERT INTO supplies(supply_id, title, description, quantity, media_url, upload_url, upload_meta, region_id, status, type, price, image_url, purchase_amount, completed_at, assigned_to, legacy_id, created_by, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19) ON CONFLICT(supply_id) DO UPDATE SET title=EXCLUDED.title, description=EXCLUDED.description, quantity=EXCLUDED.quantity, media_url=EXCLUDED.media_url, upload_url=EXCLUDED.upload_url, upload_meta=EXCLUDED.upload_meta, region_id=EXCLUDED.region_id, status=EXCLUDED.status, type=EXCLUDED.type, price=EXCLUDED.price, image_url=EXCLUDED.image_url, purchase_amount=EXCLUDED.purchase_amount, completed_at=EXCLUDED.completed_at, assigned_to=EXCLUDED.assigned_to, legacy_id=EXCLUDED.legacy_id, created_by=EXCLUDED.created_by, updated_at=EXCLUDED.updated_at`,
          [id, item.title||'', item.description||'', parseInt(item.quantity)||0, item.mediaUrl||item.media_url||'', item.uploadUrl||item.upload_url||'', item.uploadMeta||null, item.regionId||item.region_id||item.region||'', item.status||'available', item.type||'', item.price||null, item.imageUrl||item.image_url||'', item.purchaseAmount||item.purchase_amount||null, item.completedAt||item.completed_at||null, item.assignedTo||item.assigned_to||'', item.legacyId||item.legacy_id||'', item.createdBy||item.created_by||'', item.createdAt||item.created_at||null, item.updatedAt||item.updated_at||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Supply ${item.title||id}: ${err.message}`);
      }
    }

    // Supply requests
    for (const item of data.supply_requests || []) {
      let id;
      try {
        id = item.requestId || item.request_id || item.id || null;
        await db.query(`INSERT INTO supply_requests(request_id, supply_item_id, requester_id, status, created_at, updated_at, completed_at, requester_name, requester_contact, quantity, message) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(request_id) DO UPDATE SET supply_item_id=EXCLUDED.supply_item_id, requester_id=EXCLUDED.requester_id, status=EXCLUDED.status, updated_at=EXCLUDED.updated_at, completed_at=EXCLUDED.completed_at, requester_name=EXCLUDED.requester_name, requester_contact=EXCLUDED.requester_contact, quantity=EXCLUDED.quantity, message=EXCLUDED.message`,
          [id, item.supplyItemId||item.supply_item_id||null, item.requesterId||item.requester_id||'', item.status||'PENDING', item.createdAt||item.created_at||null, item.updatedAt||item.updated_at||null, item.completedAt||item.completed_at||null, item.requesterName||item.requester_name||null, item.requesterContact||item.requester_contact||null, item.quantity||null, item.message||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`SupplyRequest ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Participations
    for (const item of data.participations || []) {
      let id;
      try {
        id = item.participationId || item.participation_id || item.id || null;
        await db.query(`INSERT INTO participations(participation_id, item_key, item_id, item_type, title, member_id, region_id, joined_at, selected, selected_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(participation_id) DO UPDATE SET item_key=EXCLUDED.item_key, item_id=EXCLUDED.item_id, item_type=EXCLUDED.item_type, title=EXCLUDED.title, member_id=EXCLUDED.member_id, region_id=EXCLUDED.region_id, joined_at=EXCLUDED.joined_at, selected=EXCLUDED.selected, selected_at=EXCLUDED.selected_at`,
          [id, item.itemKey||item.item_key||'', item.itemId||item.item_id||'', item.itemType||item.item_type||'', item.title||'', item.memberId||item.member_id||'', item.regionId||item.region_id||'', item.joinedAt||item.joined_at||null, !!(item.selected), item.selectedAt||item.selected_at||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Participation ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Point ledger
    for (const item of data.point_ledger || []) {
      let id;
      try {
        id = item.ledgerId || item.ledger_id || item.id || null;
        await db.query(`INSERT INTO point_ledger(ledger_id, member_id, amount, type, description, reference_id, reference_type, created_at, admin_id, user_name, status) OVERRIDING SYSTEM VALUE VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ON CONFLICT(ledger_id) DO UPDATE SET member_id=EXCLUDED.member_id, amount=EXCLUDED.amount, type=EXCLUDED.type, description=EXCLUDED.description, reference_id=EXCLUDED.reference_id, reference_type=EXCLUDED.reference_type, created_at=EXCLUDED.created_at, admin_id=EXCLUDED.admin_id, user_name=EXCLUDED.user_name, status=EXCLUDED.status`,
            [id, item.memberId||item.member_id||item.member||'', parseInt(item.amount)||0, item.type||'', item.description||'', item.referenceId||item.reference_id||'', item.referenceType||item.reference_type||'', item.createdAt||item.created_at||null, item.adminId||item.admin_id||'', item.userName||item.user_name||'', item.status||'active']);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`PointLedger ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Posts
    for (const item of data.posts || []) {
      let id;
      try {
        id = item.postId || item.post_id || item.id || `P_${Date.now()}`;
        await db.query(`INSERT INTO posts(post_id, title, body, board_type, region, author_id, is_pinned, tags, attachments, views, is_public, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT(post_id) DO UPDATE SET title=EXCLUDED.title, body=EXCLUDED.body, board_type=EXCLUDED.board_type, region=EXCLUDED.region, author_id=EXCLUDED.author_id, is_pinned=EXCLUDED.is_pinned, tags=EXCLUDED.tags, attachments=EXCLUDED.attachments, views=EXCLUDED.views, is_public=EXCLUDED.is_public, updated_at=EXCLUDED.updated_at`,
          [id, item.title||'', item.body||'', item.board_type||item.boardType||'', item.region||'', item.author_id||item.authorId||'', !!(item.is_pinned??item.isPinned), item.tags?JSON.stringify(item.tags):null, item.attachments?JSON.stringify(item.attachments):null, item.views||0, !!(item.is_public??item.isPublic??true), item.created_at||item.createdAt||null, item.updated_at||item.updatedAt||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Post ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Banners
    for (const item of data.banners || []) {
      let id;
      try {
        id = item.bannerId || item.banner_id || item.id || `B_${Date.now()}`;
        await db.query(`INSERT INTO banners(banner_id, image_url, alt, link_url, regions, start_date, end_date, is_active, priority, weight, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(banner_id) DO UPDATE SET image_url=EXCLUDED.image_url, alt=EXCLUDED.alt, link_url=EXCLUDED.link_url, regions=EXCLUDED.regions, start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date, is_active=EXCLUDED.is_active, priority=EXCLUDED.priority, weight=EXCLUDED.weight, updated_at=EXCLUDED.updated_at`,
          [id, item.imageUrl||item.image_url||'', item.alt||'', item.linkUrl||item.link_url||'', item.regions?JSON.stringify(item.regions):null, item.startDate||item.start_date||null, item.endDate||item.end_date||null, !!(item.isActive??item.is_active??true), item.priority||0, item.weight||1, item.createdAt||item.created_at||null, item.updatedAt||item.updated_at||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Banner ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Notices (if provided)
    for (const item of data.notices || []) {
      let id;
      try {
        id = item.id || item.noticeId || item.notice_id || `N_${Date.now()}`;
        await db.query(`INSERT INTO notices(id, title, content, scope, region_id, region_ids, is_pinned, is_public, status, author, author_id, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title, content=EXCLUDED.content, scope=EXCLUDED.scope, region_id=EXCLUDED.region_id, region_ids=EXCLUDED.region_ids, is_pinned=EXCLUDED.is_pinned, is_public=EXCLUDED.is_public, status=EXCLUDED.status, author=EXCLUDED.author, author_id=EXCLUDED.author_id, updated_at=EXCLUDED.updated_at`,
          [id, item.title||'', item.content||'', item.scope||'ALL', item.regionId||item.region_id||null, Array.isArray(item.regionIds||item.region_ids) ? (item.regionIds||item.region_ids) : null, !!(item.isPinned??item.is_pinned), !!(item.isPublic??item.is_public??true), item.status||'ACTIVE', item.author||'', item.authorId||item.author_id||'', item.createdAt||item.created_at||null, item.updatedAt||item.updated_at||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`Notice ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Shop payout requests
    for (const item of data.shop_payout_requests || []) {
      let id;
      try {
        id = item.id || item.request_id || item.requestId || `PR_${Date.now()}`;
        await db.query(`INSERT INTO shop_payout_requests(request_id, shop_id, amount, bank_name, account_number, depositor_name, memo, status, requested_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(request_id) DO UPDATE SET shop_id=EXCLUDED.shop_id, amount=EXCLUDED.amount, bank_name=EXCLUDED.bank_name, account_number=EXCLUDED.account_number, depositor_name=EXCLUDED.depositor_name, memo=EXCLUDED.memo, status=EXCLUDED.status, requested_at=EXCLUDED.requested_at, updated_at=EXCLUDED.updated_at`,
          [id, item.shopId||item.shop_id||'', item.amount||0, item.bankName||item.bank_name||'', item.accountNumber||item.account_number||'', item.depositorName||item.depositor_name||'', item.memo||'', item.status||'pending', item.requestedAt||item.requested_at||null, item.updatedAt||item.updated_at||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`PayoutRequest ${id || 'unknown'}: ${err.message}`);
      }
    }

    // QR payments
    for (const item of data.qr_payments || []) {
      let id;
      try {
        id = item.payment_id || item.paymentId || item.id || `QR_${Date.now()}`;
        await db.query(`INSERT INTO qr_payments(payment_id, shop_id, amount, payer_member_id, status, created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(payment_id) DO UPDATE SET shop_id=EXCLUDED.shop_id, amount=EXCLUDED.amount, payer_member_id=EXCLUDED.payer_member_id, status=EXCLUDED.status, created_at=EXCLUDED.created_at`,
          [id, item.shopId||item.shop_id||'', item.amount||0, item.payerMemberId||item.payer_member_id||'', item.status||'completed', item.createdAt||item.created_at||null]);
        restored++;
      } catch (err) {
        failed++;
        errors.push(`QRPayment ${id || 'unknown'}: ${err.message}`);
      }
    }

    // Voucher Types
    for (const item of data.voucher_types || []) {
      try {
        await db.query(`INSERT INTO voucher_types(type_code, name, description, is_active, created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(type_code) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, is_active=EXCLUDED.is_active`,
          [item.type_code||item.typeCode, item.name||'', item.description||'', item.is_active??item.isActive??true, item.created_at||item.createdAt||new Date().toISOString()]);
        restored++;
      } catch (err) { failed++; errors.push(`VoucherType ${item.type_code||item.typeCode}: ${err.message}`); }
    }

    // Voucher Ledger
    for (const item of data.voucher_ledger || []) {
      let id;
      try {
        id = item.ledger_id || item.ledgerId;
        await db.query(`INSERT INTO voucher_ledger(ledger_id, member_id, type_code, amount, status, source, reference_id, description, admin_id, created_at, target_type, shop_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) ON CONFLICT(ledger_id) DO UPDATE SET member_id=EXCLUDED.member_id, type_code=EXCLUDED.type_code, amount=EXCLUDED.amount, status=EXCLUDED.status, source=EXCLUDED.source, reference_id=EXCLUDED.reference_id, description=EXCLUDED.description, admin_id=EXCLUDED.admin_id, target_type=EXCLUDED.target_type, shop_id=EXCLUDED.shop_id`,
          [id, item.member_id||item.memberId||'', item.type_code||item.typeCode||'', item.amount||0, item.status||'active', item.source||'', item.reference_id||item.referenceId||'', item.description||'', item.admin_id||item.adminId||'', item.created_at||item.createdAt||null, item.target_type||item.targetType||'member', item.shop_id||item.shopId||'']);
        restored++;
      } catch (err) { failed++; errors.push(`VoucherLedger ${item.ledger_id||item.ledgerId}: ${err.message}`); }
    }

    // Shop Earnings
    for (const item of data.shop_earnings || []) {
      let id;
      try {
        id = item.earning_id || item.earningId;
        await db.query(`INSERT INTO shop_earnings(earning_id, shop_id, shop_name, amount, source_tx_id, buyer_member_id, status, created_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(earning_id) DO UPDATE SET shop_id=EXCLUDED.shop_id, shop_name=EXCLUDED.shop_name, amount=EXCLUDED.amount, source_tx_id=EXCLUDED.source_tx_id, buyer_member_id=EXCLUDED.buyer_member_id, status=EXCLUDED.status`,
          [id, item.shop_id||item.shopId||'', item.shop_name||item.shopName||'', item.amount||0, item.source_tx_id||item.sourceTxId||'', item.buyer_member_id||item.buyerMemberId||'', item.status||'settled', item.created_at||item.createdAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`ShopEarning ${id}: ${err.message}`); }
    }

    // Configs
    for (const item of data.configs || []) {
      try {
        await db.query(`INSERT INTO configs(config_key, config_value, updated_at) VALUES($1,$2,$3) ON CONFLICT(config_key) DO UPDATE SET config_value=EXCLUDED.config_value, updated_at=EXCLUDED.updated_at`,
          [item.config_key||item.configKey, item.config_value||item.configValue||'', item.updated_at||item.updatedAt||new Date().toISOString()]);
        restored++;
      } catch (err) { failed++; errors.push(`Config ${item.config_key||item.configKey}: ${err.message}`); }
    }

    // Reviews
    for (const item of data.reviews || []) {
      let id;
      try {
        id = item.review_id || item.reviewId || `RV_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        await db.query(`INSERT INTO reviews(review_id, shop_id, member_id, author_name, content, rating, status, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(review_id) DO UPDATE SET shop_id=EXCLUDED.shop_id, member_id=EXCLUDED.member_id, author_name=EXCLUDED.author_name, content=EXCLUDED.content, rating=EXCLUDED.rating, status=EXCLUDED.status, updated_at=EXCLUDED.updated_at`,
          [id, item.shop_id||item.shopId||'', item.member_id||item.memberId||'', item.author_name||item.authorName||'', item.content||'', item.rating||0, item.status||'active', item.created_at||item.createdAt||null, item.updated_at||item.updatedAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`Review ${id}: ${err.message}`); }
    }

    // Supply Items
    for (const item of data.supply_items || []) {
      let id;
      try {
        id = item.item_id || item.itemId;
        await db.query(`INSERT INTO supply_items(item_id, name, description, quantity, manager_id, status, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(item_id) DO UPDATE SET name=EXCLUDED.name, description=EXCLUDED.description, quantity=EXCLUDED.quantity, manager_id=EXCLUDED.manager_id, status=EXCLUDED.status, updated_at=EXCLUDED.updated_at`,
          [id, item.name||'', item.description||'', item.quantity||0, item.manager_id||item.managerId||'', item.status||'available', item.created_at||item.createdAt||null, item.updated_at||item.updatedAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`SupplyItem ${id}: ${err.message}`); }
    }

    // Audition Submissions
    for (const item of data.audition_submissions || []) {
      let id;
      try {
        id = item.submission_id || item.submissionId;
        await db.query(`INSERT INTO audition_submissions(submission_id, audition_id, member_id, title, media_type, media_url, thumbnail_url, created_at, votes_count, rank_label) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(submission_id) DO UPDATE SET audition_id=EXCLUDED.audition_id, member_id=EXCLUDED.member_id, title=EXCLUDED.title, media_type=EXCLUDED.media_type, media_url=EXCLUDED.media_url, thumbnail_url=EXCLUDED.thumbnail_url, votes_count=EXCLUDED.votes_count, rank_label=EXCLUDED.rank_label`,
          [id, item.audition_id||item.auditionId||null, item.member_id||item.memberId||null, item.title||'', item.media_type||item.mediaType||'', item.media_url||item.mediaUrl||'', item.thumbnail_url||item.thumbnailUrl||'', item.created_at||item.createdAt||null, item.votes_count||item.votesCount||0, item.rank_label||item.rankLabel||null]);
        restored++;
      } catch (err) { failed++; errors.push(`AuditionSubmission ${id}: ${err.message}`); }
    }

    // Audition Votes
    for (const item of data.audition_votes || []) {
      let id;
      try {
        id = item.vote_id || item.voteId;
        await db.query(`INSERT INTO audition_votes(vote_id, submission_id, voter_id, created_at) VALUES($1,$2,$3,$4) ON CONFLICT(vote_id) DO UPDATE SET submission_id=EXCLUDED.submission_id, voter_id=EXCLUDED.voter_id`,
          [id, item.submission_id||item.submissionId||null, item.voter_id||item.voterId||'', item.created_at||item.createdAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`AuditionVote ${id}: ${err.message}`); }
    }

    // Schedules
    for (const item of data.schedules || []) {
      let id;
      try {
        id = item.schedule_id || item.scheduleId || `SCH_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        await db.query(`INSERT INTO schedules(schedule_id, user_id, title, description, schedule_date, schedule_time, status, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(schedule_id) DO UPDATE SET user_id=EXCLUDED.user_id, title=EXCLUDED.title, description=EXCLUDED.description, schedule_date=EXCLUDED.schedule_date, schedule_time=EXCLUDED.schedule_time, status=EXCLUDED.status, updated_at=EXCLUDED.updated_at`,
          [id, item.user_id||item.userId||'', item.title||'', item.description||'', item.schedule_date||item.scheduleDate||null, item.schedule_time||item.scheduleTime||null, item.status||'active', item.created_at||item.createdAt||null, item.updated_at||item.updatedAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`Schedule ${id}: ${err.message}`); }
    }

    // Broadcast Comments
    for (const item of data.broadcast_comments || []) {
      let id;
      try {
        id = item.comment_id || item.commentId || `CMT_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        await db.query(`INSERT INTO broadcast_comments(comment_id, broadcast_id, author_id, author_name, text, created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(comment_id) DO UPDATE SET broadcast_id=EXCLUDED.broadcast_id, author_id=EXCLUDED.author_id, author_name=EXCLUDED.author_name, text=EXCLUDED.text`,
          [id, item.broadcast_id||item.broadcastId||'', item.author_id||item.authorId||'', item.author_name||item.authorName||'', item.text||'', item.created_at||item.createdAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`BroadcastComment ${id}: ${err.message}`); }
    }

    // Audition Submission Comments
    for (const item of data.audition_submission_comments || []) {
      let id;
      try {
        id = item.comment_id || item.commentId || null;
        await db.query(
          `INSERT INTO audition_submission_comments(comment_id, submission_id, author_id, author_name, content, created_at, updated_at)
           VALUES($1,$2,$3,$4,$5,$6,$7)
           ON CONFLICT(comment_id) DO UPDATE SET
             submission_id = EXCLUDED.submission_id,
             author_id = EXCLUDED.author_id,
             author_name = EXCLUDED.author_name,
             content = EXCLUDED.content,
             updated_at = EXCLUDED.updated_at`,
          [
            id,
            item.submission_id || item.submissionId || null,
            item.author_id || item.authorId || null,
            item.author_name || item.authorName || '',
            item.content || '',
            item.created_at || item.createdAt || null,
            item.updated_at || item.updatedAt || item.created_at || item.createdAt || null,
          ]
        );
        restored++;
      } catch (err) { failed++; errors.push(`AuditionSubmissionComment ${id}: ${err.message}`); }
    }

    // Chats
    for (const item of data.chats || []) {
      let id;
      try {
        id = item.chat_id || item.chatId || `CHT_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        await db.query(`INSERT INTO chats(chat_id, from_user_id, to_user_id, text, created_at) VALUES($1,$2,$3,$4,$5) ON CONFLICT(chat_id) DO UPDATE SET from_user_id=EXCLUDED.from_user_id, to_user_id=EXCLUDED.to_user_id, text=EXCLUDED.text`,
          [id, item.from_user_id||item.fromUserId||'', item.to_user_id||item.toUserId||'', item.text||'', item.created_at||item.createdAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`Chat ${id}: ${err.message}`); }
    }

    // Friends
    for (const item of data.friends || []) {
      let id;
      try {
        id = item.friendship_id || item.friendshipId;
        await db.query(`INSERT INTO friends(friendship_id, user_id, friend_id, created_at) VALUES($1,$2,$3,$4) ON CONFLICT(friendship_id) DO UPDATE SET user_id=EXCLUDED.user_id, friend_id=EXCLUDED.friend_id`,
          [id, item.user_id||item.userId||'', item.friend_id||item.friendId||'', item.created_at||item.createdAt||null]);
        restored++;
      } catch (err) { failed++; errors.push(`Friend ${id}: ${err.message}`); }
    }

    // Districts
    for (const item of data.districts || []) {
      let id;
      try {
        id = item.district_id || item.districtId;
        await db.query(`INSERT INTO districts(district_id, region_id, name, slug, is_active, sort_order, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(district_id) DO UPDATE SET region_id=EXCLUDED.region_id, name=EXCLUDED.name, slug=EXCLUDED.slug, is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=EXCLUDED.updated_at`,
            [id, item.region_id||item.regionId||'', item.name||'', item.slug||'', !!(item.is_active??item.isActive??true), item.sort_order||item.sortOrder||0, item.created_at||item.createdAt||now, now]);
        restored++;
      } catch (err) { failed++; errors.push(`District ${item.name}: ${err.message}`); }
    }

    // Apartments
    for (const item of data.apartments || []) {
      let id;
      try {
        id = item.apartment_id || item.apartmentId;
        await db.query(`INSERT INTO apartments(apartment_id, region_id, district_id, name, address, households, floors, built_year, manager_phone, thumbnail, is_active, sort_order, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT(apartment_id) DO UPDATE SET region_id=EXCLUDED.region_id, district_id=EXCLUDED.district_id, name=EXCLUDED.name, address=EXCLUDED.address, households=EXCLUDED.households, floors=EXCLUDED.floors, built_year=EXCLUDED.built_year, manager_phone=EXCLUDED.manager_phone, thumbnail=EXCLUDED.thumbnail, is_active=EXCLUDED.is_active, sort_order=EXCLUDED.sort_order, updated_at=EXCLUDED.updated_at`,
            [id, item.region_id||item.regionId||'', item.district_id||item.districtId||null, item.name||'', item.address||'', item.households||null, item.floors||null, item.built_year||item.builtYear||null, item.manager_phone||item.managerPhone||'', item.thumbnail||'', !!(item.is_active??item.isActive??true), item.sort_order||item.sortOrder||0, item.created_at||item.createdAt||now, now]);
        restored++;
      } catch (err) { failed++; errors.push(`Apartment ${item.name}: ${err.message}`); }
    }

    // Apartment Posts
    for (const item of data.apartment_posts || []) {
      let id;
      try {
        id = item.post_id || item.postId;
        await db.query(`INSERT INTO apartment_posts(post_id, apartment_id, region_id, author_id, author_name, title, content, category, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) ON CONFLICT(post_id) DO UPDATE SET apartment_id=EXCLUDED.apartment_id, region_id=EXCLUDED.region_id, author_id=EXCLUDED.author_id, author_name=EXCLUDED.author_name, title=EXCLUDED.title, content=EXCLUDED.content, category=EXCLUDED.category, updated_at=EXCLUDED.updated_at`,
            [id, item.apartment_id||item.apartmentId||null, item.region_id||item.regionId||null, item.author_id||item.authorId||null, item.author_name||item.authorName||'익명', item.title||'', item.content||'', item.category||'general', item.created_at||item.createdAt||now, now]);
        restored++;
      } catch (err) { failed++; errors.push(`ApartmentPost ${id}: ${err.message}`); }
    }

    // Apartment Post Comments
    for (const item of data.apartment_post_comments || []) {
      let id;
      try {
        id = item.comment_id || item.commentId;
        await db.query(`INSERT INTO apartment_post_comments(comment_id, post_id, author_id, author_name, content, created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(comment_id) DO UPDATE SET post_id=EXCLUDED.post_id, author_id=EXCLUDED.author_id, author_name=EXCLUDED.author_name, content=EXCLUDED.content`,
            [id, item.post_id||item.postId||null, item.author_id||item.authorId||null, item.author_name||item.authorName||'익명', item.content||'', item.created_at||item.createdAt||now]);
        restored++;
      } catch (err) { failed++; errors.push(`ApartmentComment ${id}: ${err.message}`); }
    }

    // Boards (지역 게시판)
    for (const item of data.boards || []) {
      let id;
      try {
        id = item.board_id || item.boardId;
        await db.query(`INSERT INTO boards(board_id, region_id, author_id, author_name, title, content, category, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT(board_id) DO UPDATE SET region_id=EXCLUDED.region_id, author_id=EXCLUDED.author_id, author_name=EXCLUDED.author_name, title=EXCLUDED.title, content=EXCLUDED.content, category=EXCLUDED.category, updated_at=EXCLUDED.updated_at`,
            [id, item.region_id||item.regionId||'', item.author_id||item.authorId||null, item.author_name||item.authorName||'익명', item.title||'', item.content||'', item.category||'general', item.created_at||item.createdAt||now, now]);
        restored++;
      } catch (err) { failed++; errors.push(`Board ${id}: ${err.message}`); }
    }

    // Board Comments
    for (const item of data.board_comments || []) {
      let id;
      try {
        id = item.comment_id || item.commentId;
        await db.query(`INSERT INTO board_comments(comment_id, board_id, author_id, author_name, content, created_at) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(comment_id) DO UPDATE SET board_id=EXCLUDED.board_id, author_id=EXCLUDED.author_id, author_name=EXCLUDED.author_name, content=EXCLUDED.content`,
            [id, item.board_id||item.boardId||null, item.author_id||item.authorId||null, item.author_name||item.authorName||'익명', item.content||'', item.created_at||item.createdAt||now]);
        restored++;
      } catch (err) { failed++; errors.push(`BoardComment ${id}: ${err.message}`); }
    }

    // Region Admin Assignments
    for (const item of data.region_admin_assignments || []) {
      try {
        const memberId = item.member_id || item.memberId;
        const regionId = item.region_id || item.regionId;
        if (!memberId || !regionId) continue;
        await db.query(
          `INSERT INTO region_admin_assignments(member_id, region_id, created_at) VALUES($1,$2,$3) ON CONFLICT(member_id, region_id) DO NOTHING`,
          [memberId, regionId, item.created_at || item.createdAt || now]
        );
        restored++;
      } catch (err) { failed++; errors.push(`RegionAdminAssignment ${item.member_id||item.memberId}/${item.region_id||item.regionId}: ${err.message}`); }
    }

    // Region News
    for (const item of data.region_news || []) {
      let id;
      try {
        id = item.news_id || item.newsId || `RN_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
        await db.query(`INSERT INTO region_news(news_id, region_id, title, content, thumbnail, author_id, author_name, district_id, is_pinned, is_public, views, created_at, updated_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) ON CONFLICT(news_id) DO UPDATE SET region_id=EXCLUDED.region_id, title=EXCLUDED.title, content=EXCLUDED.content, thumbnail=EXCLUDED.thumbnail, author_id=EXCLUDED.author_id, author_name=EXCLUDED.author_name, district_id=EXCLUDED.district_id, is_pinned=EXCLUDED.is_pinned, is_public=EXCLUDED.is_public, views=EXCLUDED.views, updated_at=EXCLUDED.updated_at`,
          [id, item.region_id||item.regionId||'', item.title||'', item.content||'', item.thumbnail||null, item.author_id||item.authorId||null, item.author_name||item.authorName||'관리자', item.district_id||item.districtId||null, !!(item.is_pinned??item.isPinned), !!(item.is_public??item.isPublic??true), item.views||0, item.created_at||item.createdAt||now, now]);
        restored++;
      } catch (err) { failed++; errors.push(`RegionNews ${id}: ${err.message}`); }
    }

    if (_pgc) { await _pgc.query('COMMIT'); _pgc.release(); _pgc = null; }
    db.query = _oq; db.run = _or; db.get = _og;
    return jsonOk(res, { restored, failed, errors });
  } catch (err) {
    db.query = _oq; db.run = _or; db.get = _og;
    if (_pgc) { try { await _pgc.query('ROLLBACK'); } catch(e){} try { _pgc.release(); } catch(e){} _pgc = null; }
    logger.error('Error restoring backup:', err.stack || err.message);
    return jsonFail(res, 500, err.message, { detail: err.stack });
  }
});

// PUT /api/regions/:id (upsert-by-id)
app.put('/api/regions/:id', async (req, res) => {
  try {
    const regionId = req.params.id;
    const r = req.body || {};
    if (!regionId) return jsonFail(res, 400, 'regionId required');
    if (!r.name) return jsonFail(res, 400, 'name required');
    if (!r.province) return jsonFail(res, 400, 'province required');
    if (!(r.city || r.district)) return jsonFail(res, 400, 'city required');

    // prevent name collision with other region
    const nameNorm = String(r.name).trim();
    const cityNorm = String(r.city || r.district || '').trim();
    const dup = USE_POSTGRES
      ? await db.get('SELECT region_id FROM regions WHERE LOWER(name) = LOWER($1) AND region_id <> $2 LIMIT 1', [nameNorm, regionId])
      : await db.get('SELECT regionId FROM regions WHERE name = ? COLLATE NOCASE AND regionId <> ? LIMIT 1', [nameNorm, regionId]);
    if (dup) return jsonFail(res, 409, 'region already exists');

    const now = new Date().toISOString();
    const tourSpots = Array.isArray(r.tourSpots) ? JSON.stringify(r.tourSpots) : (r.tourSpots || '[]');
    const festivals = Array.isArray(r.festivals) ? JSON.stringify(r.festivals) : (r.festivals || '[]');

    if (USE_POSTGRES) {
      await db.run(
        `UPDATE regions SET name=$1, province=$2, city=$3, intro=$4, apt_households=$5, avg_sale_price=$6, traffic_info=$7, tour_spots=$8, festivals=$9, is_public=$10, updated_at=$11 WHERE region_id=$12`,
        [
          nameNorm,
          r.province || '',
          cityNorm,
          r.intro || '',
          parseInt(r.aptHouseholds) || 0,
          r.avgSalePrice || '',
          r.trafficInfo || '',
          tourSpots,
          festivals,
          r.isPublic || false,
          now,
          regionId,
        ]
      );
    } else {
      await db.run(
        `UPDATE regions SET name=?, province=?, city=?, intro=?, aptHouseholds=?, avgSalePrice=?, trafficInfo=?, tourSpots=?, festivals=?, isPublic=?, updatedAt=? WHERE regionId=?`,
        [
          nameNorm,
          r.province || '',
          cityNorm,
          r.intro || '',
          parseInt(r.aptHouseholds) || 0,
          r.avgSalePrice || '',
          r.trafficInfo || '',
          tourSpots,
          festivals,
          r.isPublic ? 1 : 0,
          now,
          regionId,
        ]
      );
    }
    return jsonOk(res, { regionId });
  } catch (err) {
    logger.error('Error updating region:', err);
    return jsonFail(res, 500, err.message);
  }
});

// DELETE /api/regions/:id
app.delete('/api/regions/:id', async (req, res) => {
  try {
    const regionId = req.params.id;
    if (!regionId) return jsonFail(res, 400, 'regionId required');
    
    const query = USE_POSTGRES
      ? 'DELETE FROM regions WHERE region_id = $1'
      : 'DELETE FROM regions WHERE regionId = ?';
    await db.run(query, [regionId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting region:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ============================================
// REGION NEWS API
// ============================================

function normalizeContentImages(value, fallbackValues = []) {
  const images = [];

  const pushValue = (candidate) => {
    if (!candidate) return;

    if (Array.isArray(candidate)) {
      candidate.forEach(pushValue);
      return;
    }

    if (typeof candidate === 'object') {
      pushValue(candidate.url || candidate.imageUrl || candidate.src);
      return;
    }

    const text = String(candidate || '').trim();
    if (!text) return;

    if ((text.startsWith('[') || text.startsWith('{')) && !/^https?:\/\//i.test(text) && !text.startsWith('/')) {
      try {
        pushValue(JSON.parse(text));
        return;
      } catch (error) {
        // ignore parse failure and keep plain text handling below
      }
    }

    if (!images.includes(text)) images.push(text);
  };

  pushValue(value);
  pushValue(fallbackValues);
  return images.slice(0, 3);
}

function serializeContentImages(images) {
  return JSON.stringify(normalizeContentImages(images));
}

function getPrimaryContentImage(images, fallbackValue = '') {
  return normalizeContentImages(images, [fallbackValue])[0] || '';
}

function normalizeNewsRow(row) {
  if (!row) return null;
  const images = normalizeContentImages(row.images, [row.thumbnail]);
  return {
    newsId: row.news_id,
    regionId: row.region_id,
    title: row.title,
    content: row.content,
    thumbnail: images[0] || row.thumbnail,
    images,
    authorId: row.author_id,
    authorName: row.author_name || '관리자',
    districtId: row.district_id,
    isPinned: !!(row.is_pinned),
    isPublic: !!(row.is_public),
    views: Number(row.views || 0),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// GET /api/regions/:regionId/news
app.get('/api/regions/:regionId/news', async (req, res) => {
  try {
    const { regionId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const districtId = req.query.districtId || null;

    let where = `WHERE n.region_id = $1 AND n.is_public = true`;
    const params = [regionId];

    if (districtId) {
      params.push(districtId);
      where += ` AND (n.district_id = $${params.length} OR n.district_id IS NULL)`;
    }

    const rows = await db.query(
      `SELECT * FROM region_news n ${where}
       ORDER BY n.is_pinned DESC, n.created_at DESC
       LIMIT ${limit} OFFSET ${offset}`,
      params
    );

    const countRow = await db.get(
      `SELECT COUNT(*) AS total FROM region_news n ${where}`,
      params
    );

    return jsonOk(res, {
      news: (rows || []).map(normalizeNewsRow),
      total: Number(countRow?.total || 0),
      page,
      limit,
    });
  } catch (err) {
    logger.error('Error fetching region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// GET /api/regions/:regionId/news/:newsId
app.get('/api/regions/:regionId/news/:newsId', async (req, res) => {
  try {
    const { regionId, newsId } = req.params;
    const row = await db.get(
      `SELECT * FROM region_news WHERE news_id = $1 AND region_id = $2`,
      [newsId, regionId]
    );
    if (!row) return jsonFail(res, 404, 'not found');
    // increment views (non-blocking)
    db.run(`UPDATE region_news SET views = views + 1 WHERE news_id = $1`, [newsId]).catch(() => {});
    return jsonOk(res, { news: normalizeNewsRow({ ...row, views: (row.views || 0) + 1 }) });
  } catch (err) {
    logger.error('Error fetching region news detail:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/regions/:regionId/news  (관리자)
app.post('/api/regions/:regionId/news', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken) return jsonFail(res, 401, 'admin token required');

    const { regionId } = req.params;
    const b = req.body || {};
    if (!b.title) return jsonFail(res, 400, 'title required');

    const newsId = `news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    await db.run(
      `INSERT INTO region_news
         (news_id, region_id, title, content, thumbnail, author_id, author_name,
          district_id, is_pinned, is_public, views, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,$11,$12)`,
      [
        newsId, regionId,
        b.title, b.content || null, b.thumbnail || null,
        b.authorId || null, b.authorName || '관리자',
        b.districtId || null,
        b.isPinned ? true : false,
        b.isPublic !== false,
        now, now,
      ]
    );

    const created = await db.get(`SELECT * FROM region_news WHERE news_id = $1`, [newsId]);
    return jsonOk(res, { news: normalizeNewsRow(created) });
  } catch (err) {
    logger.error('Error creating region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// PATCH /api/regions/:regionId/news/:newsId
app.patch('/api/regions/:regionId/news/:newsId', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken) return jsonFail(res, 401, 'admin token required');

    const { regionId, newsId } = req.params;
    const b = req.body || {};
    const now = new Date().toISOString();

    const fields = [];
    const vals = [];
    const addField = (col, val) => { fields.push(`${col} = $${vals.length + 1}`); vals.push(val); };

    if (b.title !== undefined) addField('title', b.title);
    if (b.content !== undefined) addField('content', b.content);
    if (b.thumbnail !== undefined) addField('thumbnail', b.thumbnail);
    if (b.authorName !== undefined) addField('author_name', b.authorName);
    if (b.districtId !== undefined) addField('district_id', b.districtId || null);
    if (b.isPinned !== undefined) addField('is_pinned', !!b.isPinned);
    if (b.isPublic !== undefined) addField('is_public', !!b.isPublic);
    addField('updated_at', now);

    if (fields.length === 0) return jsonFail(res, 400, 'no fields to update');

    vals.push(newsId); vals.push(regionId);
    await db.run(
      `UPDATE region_news SET ${fields.join(', ')} WHERE news_id = $${vals.length - 1} AND region_id = $${vals.length}`,
      vals
    );

    const updated = await db.get(`SELECT * FROM region_news WHERE news_id = $1`, [newsId]);
    return jsonOk(res, { news: normalizeNewsRow(updated) });
  } catch (err) {
    logger.error('Error updating region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// DELETE /api/regions/:regionId/news/:newsId
app.delete('/api/regions/:regionId/news/:newsId', async (req, res) => {
  try {
    const adminToken = req.headers['x-admin-token'];
    if (!adminToken) return jsonFail(res, 401, 'admin token required');

    const { regionId, newsId } = req.params;
    await db.run(`DELETE FROM region_news WHERE news_id = $1 AND region_id = $2`, [newsId, regionId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ================================================================
// Phase A-4: 지역 허브 신규 API
// ================================================================

// ── Hero Images ─────────────────────────────────────────────────
app.get('/api/regions/:regionId/hero-images', async (req, res) => {
  try {
    const { regionId } = req.params;
    const rows = await db.query(
      `SELECT * FROM region_hero_images WHERE region_id = $1 AND is_active = true ORDER BY sort_order ASC`,
      [regionId]
    );
    return jsonOk(res, { images: rows || [] });
  } catch (err) {
    logger.error('Error fetching hero images:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/admin/regions/:regionId/hero-images', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const { regionId } = req.params;
    const { url, caption, sortOrder } = req.body;
    if (!url) return jsonFail(res, 400, 'url required');
    const imageId = `hero_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.run(
      `INSERT INTO region_hero_images(image_id, region_id, url, caption, sort_order) VALUES($1,$2,$3,$4,$5)`,
      [imageId, regionId, url, caption || null, sortOrder ?? 0]
    );
    return jsonOk(res, { imageId });
  } catch (err) {
    logger.error('Error adding hero image:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.delete('/api/admin/regions/:regionId/hero-images/:imageId', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const { regionId, imageId } = req.params;
    const row = await db.get(`SELECT url FROM region_hero_images WHERE image_id = $1 AND region_id = $2`, [imageId, regionId]);
    if (!row) return jsonFail(res, 404, 'Not found');
    await db.run(`DELETE FROM region_hero_images WHERE image_id = $1`, [imageId]);
    // 파일 정리
    if (row.url && row.url.startsWith('/uploads/')) {
      const filePath = path.join(__dirname, row.url);
      if (fs.existsSync(filePath)) { try { fs.unlinkSync(filePath); } catch (e) { logger.warn('unlink failed:', e.message); } }
    }
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting hero image:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.patch('/api/admin/regions/:regionId/hero-images/reorder', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const { regionId } = req.params;
    const { order } = req.body; // [{imageId, sortOrder}]
    if (!Array.isArray(order)) return jsonFail(res, 400, 'order array required');
    for (const item of order) {
      await db.run(`UPDATE region_hero_images SET sort_order = $1 WHERE image_id = $2 AND region_id = $3`, [item.sortOrder, item.imageId, regionId]);
    }
    return jsonOk(res);
  } catch (err) {
    logger.error('Error reordering hero images:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── Region Intro ────────────────────────────────────────────────
app.get('/api/regions/:regionId/intro', async (req, res) => {
  try {
    const { regionId } = req.params;
    const row = await db.get(`SELECT * FROM region_info WHERE region_id = $1`, [regionId]);
    return jsonOk(res, { intro: row || null });
  } catch (err) {
    logger.error('Error fetching region intro:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── region_info.sections 컬럼 자동 추가
(async () => {
  try {
    if (USE_POSTGRES) {
      await db.run(`ALTER TABLE region_info ADD COLUMN IF NOT EXISTS sections JSONB DEFAULT '[]'::jsonb`);
    } else {
      try {
        await db.run(`ALTER TABLE region_info ADD COLUMN sections TEXT DEFAULT '[]'`);
      } catch (e) {}
    }
  } catch (e) {}
})();

app.put('/api/admin/regions/:regionId/intro', requireAuth, async (req, res) => {
  try {
    const { regionId } = req.params;
    const canManage = await canManageApartmentRegion(req.authMemberId, req.authRole, regionId);
    if (!canManage) return jsonFail(res, 403, 'Region manager or admin required');
    const { content, images } = req.body;
    const existing = await db.get(`SELECT * FROM region_info WHERE region_id = $1`, [regionId]);
    const parseSafeArray = (value) => {
      if (Array.isArray(value)) return value;
      if (typeof value === 'string') {
        try {
          const parsed = JSON.parse(value);
          return Array.isArray(parsed) ? parsed : [];
        } catch {
          return [];
        }
      }
      return [];
    };

    const rawIncomingSections = req.body?.sections ?? req.body?.introSections;
    const normalizedSections = rawIncomingSections === undefined
      ? parseSafeArray(existing?.sections)
      : parseSafeArray(rawIncomingSections);

    logger.info('[region-intro] save payload summary', {
      regionId,
      hasImages: Array.isArray(images) ? images.length : 0,
      incomingSectionsKey: req.body?.sections !== undefined ? 'sections' : (req.body?.introSections !== undefined ? 'introSections' : 'none'),
      incomingSectionsCount: Array.isArray(rawIncomingSections) ? rawIncomingSections.length : (typeof rawIncomingSections === 'string' ? -1 : 0),
      normalizedSectionsCount: normalizedSections.length,
    });

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO region_info(region_id, content, images, sections, updated_at, updated_by)
         VALUES($1,$2,$3,$4,NOW(),$5)
         ON CONFLICT(region_id) DO UPDATE SET content=$2, images=$3, sections=$4, updated_at=NOW(), updated_by=$5`,
        [regionId, content || null, JSON.stringify(images || []), JSON.stringify(normalizedSections), req.authMemberId || null]
      );
    } else {
      await db.run(
        `INSERT INTO region_info(region_id, content, images, sections, updated_at, updated_by)
         VALUES(?,?,?,?,CURRENT_TIMESTAMP,?)
         ON CONFLICT(region_id) DO UPDATE SET content=excluded.content, images=excluded.images, sections=excluded.sections, updated_at=excluded.updated_at, updated_by=excluded.updated_by`,
        [regionId, content || null, JSON.stringify(images || []), JSON.stringify(normalizedSections), req.authMemberId || null]
      );
    }
    return jsonOk(res);
  } catch (err) {
    logger.error('Error updating region intro:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── Travel Posts ────────────────────────────────────────────────
app.get('/api/regions/:regionId/travel-posts', async (req, res) => {
  try {
    const { regionId } = req.params;
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = parseInt(req.query.offset) || 0;
    const rows = await db.query(
      `SELECT p.*, m.name AS author_name FROM region_travel_posts p
       LEFT JOIN members m ON CAST(m.member_id AS TEXT) = p.author_id
       WHERE p.region_id = $1 ORDER BY p.created_at DESC LIMIT $2 OFFSET $3`,
      [regionId, limit, offset]
    );
    return jsonOk(res, { posts: rows || [] });
  } catch (err) {
    logger.error('Error fetching travel posts:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/regions/:regionId/travel-posts', requireAuth, async (req, res) => {
  try {
    const { regionId } = req.params;
    const { title, content, images } = req.body;
    if (!title) return jsonFail(res, 400, 'title required');
    const postId = `tp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.run(
      `INSERT INTO region_travel_posts(post_id, region_id, title, content, images, author_id) VALUES($1,$2,$3,$4,$5,$6)`,
      [postId, regionId, title, content || null, JSON.stringify(images || []), req.authMemberId]
    );
    return jsonOk(res, { postId });
  } catch (err) {
    logger.error('Error creating travel post:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.get('/api/regions/:regionId/travel-posts/:postId/comments', async (req, res) => {
  try {
    const { postId } = req.params;
    const rows = await db.query(
      `SELECT c.*, m.name AS author_name FROM region_travel_comments c
       LEFT JOIN members m ON CAST(m.member_id AS TEXT) = c.author_id
       WHERE c.post_id = $1 ORDER BY c.created_at ASC`,
      [postId]
    );
    return jsonOk(res, { comments: rows || [] });
  } catch (err) {
    logger.error('Error fetching travel comments:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/regions/:regionId/travel-posts/:postId/comments', requireAuth, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, images } = req.body;
    if (!content) return jsonFail(res, 400, 'content required');
    const commentId = `tc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.run(
      `INSERT INTO region_travel_comments(comment_id, post_id, author_id, content, images) VALUES($1,$2,$3,$4,$5)`,
      [commentId, postId, req.authMemberId, content, JSON.stringify(images || [])]
    );
    return jsonOk(res, { commentId });
  } catch (err) {
    logger.error('Error creating travel comment:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── Region Events ───────────────────────────────────────────────
app.get('/api/regions/:regionId/events', async (req, res) => {
  try {
    const { regionId } = req.params;
    const status = req.query.status || null;
    const params = [regionId];
    let where = 'WHERE e.region_id = $1';
    if (status) { where += ` AND e.status = $2`; params.push(status); }
    const rows = await db.query(
      `SELECT * FROM region_events e ${where} ORDER BY e.created_at DESC LIMIT 100`,
      params
    );
    return jsonOk(res, { events: rows || [] });
  } catch (err) {
    logger.error('Error fetching region events:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/admin/regions/:regionId/events', requireAuth, async (req, res) => {
  try {
    const { regionId } = req.params;
    const canManage = await canManageApartmentRegion(req.authMemberId, req.authRole, regionId);
    if (!canManage) return jsonFail(res, 403, 'Region manager or admin required');
    const { title, content, images, bannerUrl, missionId, startAt, endAt } = req.body;
    if (!title) return jsonFail(res, 400, 'title required');
    const eventId = `ev_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.run(
      `INSERT INTO region_events(event_id, region_id, title, content, images, banner_url, mission_id, start_at, end_at, author_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [eventId, regionId, title, content || null, JSON.stringify(images || []), bannerUrl || null, missionId || null, startAt || null, endAt || null, req.authMemberId]
    );
    return jsonOk(res, { eventId });
  } catch (err) {
    logger.error('Error creating region event:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.patch('/api/admin/regions/:regionId/events/:eventId', requireAuth, async (req, res) => {
  try {
    const { regionId, eventId } = req.params;
    const canManage = await canManageApartmentRegion(req.authMemberId, req.authRole, regionId);
    if (!canManage) return jsonFail(res, 403, 'Region manager or admin required');
    const { title, content, images, bannerUrl, missionId, startAt, endAt, status } = req.body;
    const fields = []; const vals = [];
    const f = (col, val) => { fields.push(`${col}=$${vals.length+1}`); vals.push(val); };
    if (title !== undefined) f('title', title);
    if (content !== undefined) f('content', content);
    if (images !== undefined) f('images', JSON.stringify(images));
    if (bannerUrl !== undefined) f('banner_url', bannerUrl);
    if (missionId !== undefined) f('mission_id', missionId);
    if (startAt !== undefined) f('start_at', startAt);
    if (endAt !== undefined) f('end_at', endAt);
    if (status !== undefined) f('status', status);
    if (!fields.length) return jsonFail(res, 400, 'no fields');
    vals.push(eventId);
    await db.run(`UPDATE region_events SET ${fields.join(',')} WHERE event_id=$${vals.length}`, vals);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error updating region event:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.delete('/api/admin/regions/:regionId/events/:eventId', requireAuth, async (req, res) => {
  try {
    const { regionId, eventId } = req.params;
    const canManage = await canManageApartmentRegion(req.authMemberId, req.authRole, regionId);
    if (!canManage) return jsonFail(res, 403, 'Region manager or admin required');
    await db.run(`DELETE FROM region_events WHERE event_id = $1 AND region_id = $2`, [eventId, regionId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting region event:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── Region Flyers ───────────────────────────────────────────────
app.get('/api/regions/:regionId/flyers', async (req, res) => {
  try {
    const { regionId } = req.params;
    const category = req.query.category || null;
    const params = [regionId];
    let where = `WHERE f.region_id = $1 AND f.is_active = true`;
    if (category) { where += ` AND f.category = $2`; params.push(category); }
    const rows = await db.query(
      `SELECT * FROM region_flyers f ${where} ORDER BY f.created_at DESC LIMIT 100`,
      params
    );
    return jsonOk(res, { flyers: rows || [] });
  } catch (err) {
    logger.error('Error fetching region flyers:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.get('/api/regions/:regionId/flyers/:flyerId', async (req, res) => {
  try {
    const { flyerId } = req.params;
    const row = await db.get(`SELECT * FROM region_flyers WHERE flyer_id = $1`, [flyerId]);
    if (!row) return jsonFail(res, 404, 'Not found');
    return jsonOk(res, { flyer: row });
  } catch (err) {
    logger.error('Error fetching flyer:', err);
    return jsonFail(res, 500, err.message);
  }
});

// 전단 열람 - 로그인 필수, 포인트 지급 (중복 방지)
app.post('/api/regions/:regionId/flyers/:flyerId/view', requireAuth, async (req, res) => {
  try {
    const { flyerId } = req.params;
    const memberId = req.authMemberId;
    const flyer = await db.get(`SELECT * FROM region_flyers WHERE flyer_id = $1 AND is_active = true`, [flyerId]);
    if (!flyer) return jsonFail(res, 404, 'Flyer not found');

    // 조회수 증가
    await db.run(`UPDATE region_flyers SET view_count = view_count + 1 WHERE flyer_id = $1`, [flyerId]);

    // 포인트 지급 (중복 체크)
    let pointAwarded = 0;
    if (flyer.point_enabled && flyer.point_reward > 0) {
      const existing = await db.get(
        `SELECT view_id FROM region_flyer_views WHERE flyer_id = $1 AND member_id = $2`,
        [flyerId, memberId]
      );
      if (!existing) {
        await db.run(
          `INSERT INTO region_flyer_views(flyer_id, member_id) VALUES($1,$2)`,
          [flyerId, memberId]
        );
        await db.run(
          `INSERT INTO point_ledger(member_id, amount, type, description) VALUES($1,$2,'earn','전단 열람 포인트')`,
          [memberId, flyer.point_reward]
        );
        pointAwarded = flyer.point_reward;
      }
    }
    return jsonOk(res, { pointAwarded });
  } catch (err) {
    logger.error('Error recording flyer view:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/admin/regions/:regionId/flyers', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const { regionId } = req.params;
    const { title, shopName, category, images, pointReward, pointEnabled, startAt, endAt } = req.body;
    if (!title) return jsonFail(res, 400, 'title required');
    const flyerId = `fl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.run(
      `INSERT INTO region_flyers(flyer_id, region_id, title, shop_name, category, images, point_reward, point_enabled, start_at, end_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [flyerId, regionId, title, shopName || null, category || null, JSON.stringify(images || []), pointReward ?? 0, !!pointEnabled, startAt || null, endAt || null]
    );
    return jsonOk(res, { flyerId });
  } catch (err) {
    logger.error('Error creating flyer:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.patch('/api/admin/regions/:regionId/flyers/:flyerId', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const { flyerId } = req.params;
    const { title, shopName, category, images, pointReward, pointEnabled, startAt, endAt, isActive } = req.body;
    const fields = []; const vals = [];
    const f = (col, val) => { fields.push(`${col}=$${vals.length+1}`); vals.push(val); };
    if (title !== undefined) f('title', title);
    if (shopName !== undefined) f('shop_name', shopName);
    if (category !== undefined) f('category', category);
    if (images !== undefined) f('images', JSON.stringify(images));
    if (pointReward !== undefined) f('point_reward', pointReward);
    if (pointEnabled !== undefined) f('point_enabled', !!pointEnabled);
    if (startAt !== undefined) f('start_at', startAt);
    if (endAt !== undefined) f('end_at', endAt);
    if (isActive !== undefined) f('is_active', !!isActive);
    if (!fields.length) return jsonFail(res, 400, 'no fields');
    vals.push(flyerId);
    await db.run(`UPDATE region_flyers SET ${fields.join(',')} WHERE flyer_id=$${vals.length}`, vals);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error updating flyer:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.delete('/api/admin/regions/:regionId/flyers/:flyerId', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const { flyerId } = req.params;
    const row = await db.get(`SELECT images FROM region_flyers WHERE flyer_id = $1`, [flyerId]);
    await db.run(`DELETE FROM region_flyers WHERE flyer_id = $1`, [flyerId]);
    // 이미지 파일 정리
    if (row && row.images) {
      const imgs = Array.isArray(row.images) ? row.images : JSON.parse(row.images || '[]');
      for (const img of imgs) {
        const url = typeof img === 'string' ? img : img.url;
        if (url && url.startsWith('/uploads/')) {
          const fp = path.join(__dirname, url);
          if (fs.existsSync(fp)) { try { fs.unlinkSync(fp); } catch (e) { logger.warn('unlink failed:', e.message); } }
        }
      }
    }
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting flyer:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── Region Festivals ────────────────────────────────────────────
app.get('/api/regions/:regionId/festivals', async (req, res) => {
  try {
    const { regionId } = req.params;
    const getQuery = USE_POSTGRES
      ? `SELECT f.*, m.name AS author_name FROM region_festivals f
         LEFT JOIN members m ON CAST(m.member_id AS TEXT) = f.author_id
         WHERE f.region_id = $1 ORDER BY f.created_at DESC LIMIT 100`
      : `SELECT f.*, m.name AS author_name FROM region_festivals f
         LEFT JOIN members m ON CAST(m.memberId AS TEXT) = f.authorId
         WHERE f.regionId = ? ORDER BY f.createdAt DESC LIMIT 100`;
    const rows = await db.query(getQuery, [regionId]);
    return jsonOk(res, { festivals: rows || [] });
  } catch (err) {
    logger.error('Error fetching festivals:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/regions/:regionId/festivals', requireAuth, async (req, res) => {
  try {
    const { regionId } = req.params;
    const { title, content, images, location, startAt, endAt } = req.body;
    if (!title) return jsonFail(res, 400, 'title required');
    const festivalId = `ft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const insQuery = USE_POSTGRES
      ? `INSERT INTO region_festivals(festival_id, region_id, title, content, images, location, start_at, end_at, author_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`
      : `INSERT INTO region_festivals(festivalId, regionId, title, content, images, location, startAt, endAt, authorId) VALUES(?,?,?,?,?,?,?,?,?)`;
    await db.run(
      insQuery,
      [festivalId, regionId, title, content || null, JSON.stringify(images || []), location || null, startAt || null, endAt || null, req.authMemberId]
    );
    return jsonOk(res, { festivalId });
  } catch (err) {
    logger.error('Error creating festival:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Admin create (and region manager) — allow admins or assigned region managers to create
app.post('/api/admin/regions/:regionId/festivals', requireAuth, async (req, res) => {
  try {
    const { regionId } = req.params;
    if (!(await canManageApartmentRegion(req.authMemberId, req.authRole, regionId))) return jsonFail(res, 403, 'Admin or region manager required');
    const { title, content, images, location, startAt, endAt } = req.body;
    if (!title) return jsonFail(res, 400, 'title required');
    const festivalId = `ft_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    await db.run(
      `INSERT INTO region_festivals(festival_id, region_id, title, content, images, location, start_at, end_at, author_id) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
      [festivalId, regionId, title, content || null, JSON.stringify(images || []), location || null, startAt || null, endAt || null, req.authMemberId]
    );
    return jsonOk(res, { festivalId });
  } catch (err) {
    logger.error('Error creating admin festival:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.patch('/api/admin/regions/:regionId/festivals/:festivalId', requireAuth, async (req, res) => {
  try {
    const { festivalId, regionId } = req.params;
    if (!(await canManageApartmentRegion(req.authMemberId, req.authRole, regionId))) return jsonFail(res, 403, 'Admin or region manager required');
    const { title, content, images, location, startAt, endAt } = req.body;
    const fields = []; const vals = [];
    const f = (col, val) => { fields.push(`${col}=$${vals.length+1}`); vals.push(val); };
    if (title !== undefined) f('title', title);
    if (content !== undefined) f('content', content);
    if (images !== undefined) f('images', JSON.stringify(images));
    if (location !== undefined) f('location', location);
    if (startAt !== undefined) f('start_at', startAt);
    if (endAt !== undefined) f('end_at', endAt);
    if (!fields.length) return jsonFail(res, 400, 'no fields');
    f('updated_at', new Date().toISOString());
    // scope update to the region to prevent cross-region edits by region managers
    vals.push(festivalId);
    vals.push(regionId);
    await db.run(`UPDATE region_festivals SET ${fields.join(',')} WHERE festival_id=$${vals.length-1} AND region_id=$${vals.length}`, vals);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error updating festival:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.delete('/api/admin/regions/:regionId/festivals/:festivalId', requireAuth, async (req, res) => {
  try {
    const { festivalId, regionId } = req.params;
    if (!(await canManageApartmentRegion(req.authMemberId, req.authRole, regionId))) return jsonFail(res, 403, 'Admin or region manager required');
    await db.run(`DELETE FROM region_festivals WHERE festival_id = $1 AND region_id = $2`, [festivalId, regionId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting festival:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.get('/api/regions/:regionId/festivals/:festivalId/comments', async (req, res) => {
  try {
    const { festivalId } = req.params;
    const getQuery = USE_POSTGRES
      ? `SELECT c.*, m.name AS author_name FROM region_festival_comments c
         LEFT JOIN members m ON CAST(m.member_id AS TEXT) = c.author_id
         WHERE c.festival_id = $1 ORDER BY c.created_at ASC`
      : `SELECT c.*, m.name AS author_name FROM region_festival_comments c
         LEFT JOIN members m ON CAST(m.memberId AS TEXT) = c.authorId
         WHERE c.festivalId = ? ORDER BY c.created_at ASC`;
    const rows = await db.query(getQuery, [festivalId]);
    return jsonOk(res, { comments: rows || [] });
  } catch (err) {
    logger.error('Error fetching festival comments:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.post('/api/regions/:regionId/festivals/:festivalId/comments', requireAuth, async (req, res) => {
  try {
    const { festivalId } = req.params;
    const { content, images } = req.body;
    if (!content) return jsonFail(res, 400, 'content required');
    const commentId = `fc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    const insQuery = USE_POSTGRES
      ? `INSERT INTO region_festival_comments(comment_id, festival_id, author_id, content, images) VALUES($1,$2,$3,$4,$5)`
      : `INSERT INTO region_festival_comments(commentId, festivalId, authorId, content, images) VALUES(?,?,?,?,?)`;
    await db.run(
      insQuery,
      [commentId, festivalId, req.authMemberId, content, JSON.stringify(images || [])]
    );
    return jsonOk(res, { commentId });
  } catch (err) {
    logger.error('Error creating festival comment:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.delete('/api/regions/:regionId/festivals/:festivalId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const { commentId } = req.params;
    // 댓글 조회: 작성자 확인
    const getQuery = USE_POSTGRES
      ? `SELECT author_id FROM region_festival_comments WHERE comment_id = $1`
      : `SELECT authorId FROM region_festival_comments WHERE commentId = ?`;
    const comment = await db.get(getQuery, [commentId]);
    if (!comment) return jsonFail(res, 404, 'Comment not found');
    
    // 작성자이거나 관리자만 삭제 가능
    const authorId = USE_POSTGRES ? comment.author_id : comment.authorId;
    const isAuthor = String(authorId) === String(req.authMemberId);
    const isAdmin = isAdminRole(req.authRole);
    
    if (!isAuthor && !isAdmin) {
      return jsonFail(res, 403, 'Not authorized to delete this comment');
    }
    
    const delQuery = USE_POSTGRES
      ? `DELETE FROM region_festival_comments WHERE comment_id = $1`
      : `DELETE FROM region_festival_comments WHERE commentId = ?`;
    await db.run(delQuery, [commentId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting festival comment:', err);
    return jsonFail(res, 500, err.message);
  }
});

app.delete('/api/admin/regions/:regionId/festivals/:festivalId/comments/:commentId', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return jsonFail(res, 403, 'Admin required');
    const delQuery = USE_POSTGRES
      ? `DELETE FROM region_festival_comments WHERE comment_id = $1`
      : `DELETE FROM region_festival_comments WHERE commentId = ?`;
    await db.run(delQuery, [req.params.commentId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting festival comment:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ── Admin region-news endpoints (no x-admin-token required, gated by frontend admin check) ──

// GET /api/admin/region-news
app.get('/api/admin/region-news', async (req, res) => {
  try {
    const regionId = req.query.regionId || null;
    const limit = Math.min(500, parseInt(req.query.limit) || 200);
    let where = '';
    const params = [];
    if (regionId) {
      where = 'WHERE n.region_id = $1';
      params.push(regionId);
    }
    const rows = await db.query(
      `SELECT n.*, r.name AS region_name FROM region_news n
       LEFT JOIN regions r ON r.region_id = n.region_id
       ${where} ORDER BY n.is_pinned DESC, n.created_at DESC LIMIT ${limit}`,
      params
    );
    return jsonOk(res, { news: (rows || []).map(row => ({ ...normalizeNewsRow(row), regionName: row.region_name })) });
  } catch (err) {
    logger.error('Error fetching admin region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/admin/region-news
app.post('/api/admin/region-news', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.regionId) return jsonFail(res, 400, 'regionId required');
    if (!b.title) return jsonFail(res, 400, 'title required');
    const newsId = `news_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const images = normalizeContentImages(b.images, [b.thumbnail]);
    await db.run(
      `INSERT INTO region_news (news_id, region_id, title, content, thumbnail, images, author_id, author_name, district_id, is_pinned, is_public, views, created_at, updated_at)
       VALUES ($1,$2,$3,$4,$5,$6::jsonb,$7,$8,$9,$10,$11,0,$12,$13)`,
      [newsId, b.regionId, b.title, b.content || null, images[0] || null, serializeContentImages(images),
       b.authorId || null, b.authorName || '관리자', b.districtId || null,
       b.isPinned ? true : false, b.isPublic !== false, now, now]
    );
    const created = await db.get(`SELECT * FROM region_news WHERE news_id = $1`, [newsId]);
    return jsonOk(res, { news: normalizeNewsRow(created) });
  } catch (err) {
    logger.error('Error creating admin region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// PATCH /api/admin/region-news/:newsId
app.patch('/api/admin/region-news/:newsId', async (req, res) => {
  try {
    const { newsId } = req.params;
    const b = req.body || {};
    const now = new Date().toISOString();
    const fields = [];
    const vals = [];
    const addField = (col, val, suffix = '') => { fields.push(`${col} = $${vals.length + 1}${suffix}`); vals.push(val); };
    if (b.title !== undefined) addField('title', b.title);
    if (b.content !== undefined) addField('content', b.content);
    if (b.thumbnail !== undefined) addField('thumbnail', b.thumbnail);
    if (b.images !== undefined) addField('images', serializeContentImages(b.images), '::jsonb');
    if (b.authorName !== undefined) addField('author_name', b.authorName);
    if (b.districtId !== undefined) addField('district_id', b.districtId || null);
    if (b.regionId !== undefined) addField('region_id', b.regionId);
    if (b.isPinned !== undefined) addField('is_pinned', !!b.isPinned);
    if (b.isPublic !== undefined) addField('is_public', !!b.isPublic);
    addField('updated_at', now);
    if (fields.length <= 1) return jsonFail(res, 400, 'no fields to update');
    vals.push(newsId);
    await db.run(`UPDATE region_news SET ${fields.join(', ')} WHERE news_id = $${vals.length}`, vals);
    const updated = await db.get(`SELECT * FROM region_news WHERE news_id = $1`, [newsId]);
    return jsonOk(res, { news: normalizeNewsRow(updated) });
  } catch (err) {
    logger.error('Error updating admin region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// DELETE /api/admin/region-news/:newsId
app.delete('/api/admin/region-news/:newsId', async (req, res) => {
  try {
    const { newsId } = req.params;
    await db.run(`DELETE FROM region_news WHERE news_id = $1`, [newsId]);
    return jsonOk(res);
  } catch (err) {
    logger.error('Error deleting admin region news:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ============================================
// SHOPS API
// ============================================

function normalizeShopImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter((item) => typeof item === 'string').slice(0, 3);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((item) => typeof item === 'string').slice(0, 3) : (value.trim().startsWith('/') || /^https?:\/\//i.test(value.trim()) ? [value.trim()] : []);
    } catch (e) {
      return value.trim().startsWith('/') || /^https?:\/\//i.test(value.trim()) ? [value.trim()] : [];
    }
  }
  return [];
}

function normalizeShopRow(row) {
  if (!row) return null;
  if (USE_POSTGRES) {
    const shopImages = normalizeShopImages(row.shop_images);
    return {
      shopId: row.shop_id,
      id: row.shop_id,
      name: row.name,
      category: row.category,
      region: row.region,
      regionId: row.region_id,
      address: row.address,
      phone: row.phone,
      owner: row.owner_id,
      description: row.description,
      hours: row.hours,
      businessHours: row.business_hours,
      closedDay: row.closed_day,
      breakTime: row.break_time,
      isPublic: !!row.is_public,
      status: row.status,
      ownerId: row.owner_id,
      createdBy: row.created_by,
      registeredBy: row.registered_by || row.created_by,
      thumbnail: row.thumbnail,
      thumbnailUrl: row.thumbnail,
      image: row.thumbnail || null,
      rating: row.avg_rating != null ? Number(row.avg_rating) : null,
      reviewCount: parseInt(row.review_count) || 0,
      vipVoucherCount: parseInt(row.vip_voucher_count) || 0,
      reviewAllowed: row.review_allowed !== false && row.review_allowed !== 0,
      menus: row.menus,
      recommendedMenus: row.recommended_menus,
      amenities: row.amenities,
      lat: row.lat,
      lng: row.lng,
      districtId: row.district_id || null,
      shopImages,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
  let menus = null;
  let recommendedMenus = null;
  let amenities = null;
  try {
    menus = row.menus ? JSON.parse(row.menus) : null;
  } catch (e) {
    menus = null;
  }
  try {
    recommendedMenus = row.recommendedMenus ? JSON.parse(row.recommendedMenus) : null;
  } catch (e) {
    recommendedMenus = null;
  }
  try {
    amenities = row.amenities ? JSON.parse(row.amenities) : null;
  } catch (e) {
    amenities = null;
  }
  return {
    shopId: row.shopId,
    id: row.shopId,
    name: row.name,
    category: row.category,
    region: row.region,
    regionId: row.regionId,
    districtId: row.districtId || row.district_id || null,
    address: row.address,
    phone: row.phone,
    owner: row.ownerId,
    description: row.description,
    hours: row.hours,
    businessHours: row.businessHours,
    closedDay: row.closedDay,
    breakTime: row.breakTime,
    isPublic: !!row.isPublic,
    status: row.status,
    ownerId: row.ownerId,
    createdBy: row.createdBy,
    registeredBy: row.registeredBy || row.createdBy,
    thumbnail: row.thumbnail,
    thumbnailUrl: row.thumbnail,
    image: row.thumbnail || null,
    rating: row.rating,
    reviewCount: row.review_count,
    vipVoucherCount: parseInt(row.vip_voucher_count) || 0,
    reviewAllowed: row.review_allowed !== null ? (!!row.review_allowed) : true,
    menus,
    recommendedMenus,
    amenities,
    lat: row.lat,
    lng: row.lng,
    shopImages: normalizeShopImages(row.shopImages),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

// GET /api/shops/my - Get shops owned by current user
app.get('/api/shops/my', async (req, res) => {
  try {
    // Extract memberId from headers (sent by client)
    const memberId = req.headers['x-member-id'] || req.query.memberId;
    
    if (!memberId) {
      return res.status(401).json({ error: 'memberId required' });
    }
    
    const query = USE_POSTGRES
      ? `SELECT s.*,
          COALESCE((SELECT SUM(vl.amount) FROM voucher_ledger vl WHERE vl.member_id = s.shop_id AND vl.target_type = 'shop' AND vl.status = 'active'), 0) AS vip_voucher_count,
          (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.shop_id = s.shop_id AND r.status = 'visible') AS avg_rating,
          COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.shop_id = s.shop_id AND r.status = 'visible'), 0) AS review_count
         FROM shops s WHERE s.owner_id = $1 OR s.created_by = $1 ORDER BY s.created_at DESC`
      : 'SELECT * FROM shops WHERE ownerId = ? OR createdBy = ? ORDER BY createdAt DESC';
    
    const rows = USE_POSTGRES 
      ? await db.query(query, [memberId])
      : await db.query(query, [memberId, memberId]);
    
    const shops = (rows || []).map(normalizeShopRow).filter(Boolean);
    res.json({ ok: true, success: true, shops });
  } catch (err) {
    logger.error('Error fetching my shops:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shops
app.get('/api/shops', async (req, res) => {
  try {
    const ownerId = req.query.ownerId || req.query.memberId || null;
    const regionId = req.query.regionId || null;
    const districtId = req.query.districtId || null;
    let query;
    let params = [];

    if (USE_POSTGRES) {
      const selectBase = `SELECT s.*,
            COALESCE((SELECT SUM(vl.amount) FROM voucher_ledger vl WHERE vl.member_id = s.shop_id AND vl.target_type = 'shop' AND vl.status = 'active'), 0) AS vip_voucher_count,
            (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.shop_id = s.shop_id AND r.status = 'visible') AS avg_rating,
            COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.shop_id = s.shop_id AND r.status = 'visible'), 0) AS review_count
           FROM shops s WHERE 1=1`;
      if (ownerId) {
        params.push(ownerId);
        query = `${selectBase} AND (s.owner_id = $${params.length} OR s.created_by = $${params.length})`;
      } else if (regionId) {
        params.push(regionId);
        query = `${selectBase} AND s.region_id = $${params.length}`;
        if (districtId) {
          params.push(districtId);
          query += ` AND s.district_id = $${params.length}`;
        }
      } else {
        query = selectBase;
      }
      query += ` ORDER BY s.created_at DESC`;
    } else {
      if (ownerId) {
        query = 'SELECT * FROM shops WHERE ownerId = ? OR createdBy = ? ORDER BY createdAt DESC';
        params = [ownerId, ownerId];
      } else if (regionId) {
        query = 'SELECT * FROM shops WHERE regionId = ? ORDER BY createdAt DESC';
        params = [regionId];
      } else {
        query = 'SELECT * FROM shops ORDER BY createdAt DESC';
      }
    }
    const rows = await db.query(query, params);
    res.json({ shops: (rows || []).map(normalizeShopRow).filter(Boolean) });
  } catch (err) {
    logger.error('Error fetching shops:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shops/:shopId - shop detail (for edit/prefill)
app.get('/api/shops/:shopId', async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) return res.status(400).json({ error: 'shopId required' });
    const query = USE_POSTGRES
      ? `SELECT s.*,
          COALESCE((SELECT SUM(vl.amount) FROM voucher_ledger vl WHERE vl.member_id = s.shop_id AND vl.target_type = 'shop' AND vl.status = 'active'), 0) AS vip_voucher_count,
          (SELECT ROUND(AVG(r.rating)::numeric, 1) FROM reviews r WHERE r.shop_id = s.shop_id AND r.status = 'visible') AS avg_rating,
          COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.shop_id = s.shop_id AND r.status = 'visible'), 0) AS review_count
         FROM shops s WHERE s.shop_id = $1`
      : 'SELECT * FROM shops WHERE shopId = ?';
    const row = await db.get(query, [shopId]);
    if (!row) return res.status(404).json({ error: 'Shop not found' });
    res.json({ shop: normalizeShopRow(row) });
  } catch (err) {
    logger.error('Error fetching shop:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shops
app.post('/api/shops', async (req, res) => {
  try {
    const s = req.body || {};
    if (!s.name) return res.status(400).json({ error: 'name required' });
    
    const shopId = s.id || s.shopId || `SHOP_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    
    // Extract memberId from headers or body
    const memberId = req.headers['x-member-id'] || s.memberId || s.ownerId || s.registeredBy;
    
    let sql = null;
    let params = null;

    if (USE_POSTGRES) {
      const query = `
        INSERT INTO shops(
          shop_id, name, category, region, address, phone, description, hours, 
          is_public, status, owner_id, created_by, registered_by, created_at, updated_at,
          region_id, district_id, thumbnail, business_hours, closed_day, break_time, 
          recommended_menus, menus, amenities, lat, lng,
          review_allowed, vip_voucher_count, shop_images
        )
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29)
        ON CONFLICT(shop_id) DO UPDATE SET
          name=EXCLUDED.name,
          category=EXCLUDED.category,
          region=EXCLUDED.region,
          address=EXCLUDED.address,
          phone=EXCLUDED.phone,
          description=EXCLUDED.description,
          hours=EXCLUDED.hours,
          is_public=EXCLUDED.is_public,
          status=EXCLUDED.status,
          region_id=EXCLUDED.region_id,
          district_id=EXCLUDED.district_id,
          thumbnail=EXCLUDED.thumbnail,
          business_hours=EXCLUDED.business_hours,
          closed_day=EXCLUDED.closed_day,
          break_time=EXCLUDED.break_time,
          recommended_menus=EXCLUDED.recommended_menus,
          menus=EXCLUDED.menus,
          amenities=EXCLUDED.amenities,
          lat=EXCLUDED.lat,
          lng=EXCLUDED.lng,
          updated_at=EXCLUDED.updated_at,
          review_allowed=EXCLUDED.review_allowed,
          vip_voucher_count=EXCLUDED.vip_voucher_count,
          shop_images=EXCLUDED.shop_images
        RETURNING shop_id
      `;
      sql = query;
      params = [
        shopId,
        s.name,
        s.category || '',
        s.region || '',
        s.address || '',
        s.phone || '',
        s.description || '',
        s.hours || s.businessHours || '',
        s.isPublic !== undefined ? s.isPublic : (s.isVisible !== undefined ? s.isVisible : false),
        s.status || 'pending',
        memberId || null,
        memberId || null,
        s.registeredBy || memberId || null,
        now,
        now,
        s.regionId || null,
        s.districtId || null,
        s.thumbnail || null,
        s.businessHours || '',
        s.closedDay || '',
        s.breakTime || '',
        s.recommendedMenus ? JSON.stringify(s.recommendedMenus) : null,
        s.menus ? JSON.stringify(s.menus) : null,
        s.amenities ? JSON.stringify(s.amenities) : null,
        s.lat || null,
        s.lng || null,
        s.reviewAllowed !== undefined ? s.reviewAllowed : true,
        s.vipVoucherCount !== undefined ? Number(s.vipVoucherCount) : 0,
        s.shopImages ? JSON.stringify(s.shopImages) : null,
      ];
      await db.query(sql, params);
      
      // Return full shop data for Postgres
      const newShop = {
        shopId,
        id: shopId,
        name: s.name,
        category: s.category,
        region: s.region,
        regionId: s.regionId,
        districtId: s.districtId || null,
        address: s.address,
        phone: s.phone,
        owner: memberId,
        description: s.description,
        hours: s.hours || s.businessHours,
        businessHours: s.businessHours,
        closedDay: s.closedDay,
        breakTime: s.breakTime,
        isPublic: s.isPublic || false,
        status: s.status || 'pending',
        ownerId: memberId,
        createdBy: memberId,
        registeredBy: s.registeredBy || memberId,
        thumbnail: s.thumbnail,
        recommendedMenus: s.recommendedMenus,
        menus: s.menus,
        amenities: s.amenities,
        lat: s.lat,
        lng: s.lng,
        shopImages: Array.isArray(s.shopImages) ? s.shopImages : [],
        createdAt: now,
        updatedAt: now,
        reviewAllowed: s.reviewAllowed !== undefined ? s.reviewAllowed : true,
        vipVoucherCount: s.vipVoucherCount !== undefined ? Number(s.vipVoucherCount) : 0,
      };
      
      logForensicWrite({ route: '/api/shops', method: 'POST', body: req.body || {}, sql, params, dbResult: null, result: { ok: true, success: true, shopId, data: newShop } });
      return res.json({ ok: true, success: true, shopId, data: newShop });
    } else {
      const query = `
        INSERT INTO shops(
          shopId, name, category, region, address, phone, description, hours, 
          isPublic, status, ownerId, createdBy, registeredBy, createdAt, updatedAt,
          regionId, districtId, thumbnail, businessHours, closedDay, breakTime,
          recommendedMenus, menus, amenities, lat, lng,
          review_allowed, vip_voucher_count, shopImages
        )
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(shopId) DO UPDATE SET
          name=excluded.name,
          category=excluded.category,
          region=excluded.region,
          address=excluded.address,
          phone=excluded.phone,
          description=excluded.description,
          hours=excluded.hours,
          isPublic=excluded.isPublic,
          status=excluded.status,
          regionId=excluded.regionId,
          districtId=excluded.districtId,
          thumbnail=excluded.thumbnail,
          businessHours=excluded.businessHours,
          closedDay=excluded.closedDay,
          breakTime=excluded.breakTime,
          recommendedMenus=excluded.recommendedMenus,
          menus=excluded.menus,
          amenities=excluded.amenities,
          lat=excluded.lat,
          lng=excluded.lng,
          updatedAt=excluded.updatedAt,
          review_allowed=excluded.review_allowed,
          vip_voucher_count=excluded.vip_voucher_count,
          shopImages=excluded.shopImages
      `;
      sql = query;
      params = [
        shopId,
        s.name,
        s.category || '',
        s.region || '',
        s.address || '',
        s.phone || '',
        s.description || '',
        s.hours || s.businessHours || '',
        (s.isPublic !== undefined ? s.isPublic : (s.isVisible !== undefined ? s.isVisible : false)) ? 1 : 0,
        s.status || 'pending',
        memberId || null,
        memberId || null,
        s.registeredBy || memberId || null,
        now,
        now,
        s.regionId || null,
        s.districtId || null,
        s.thumbnail || null,
        s.businessHours || '',
        s.closedDay || '',
        s.breakTime || '',
        s.recommendedMenus ? JSON.stringify(s.recommendedMenus) : null,
        s.menus ? JSON.stringify(s.menus) : null,
        s.amenities ? JSON.stringify(s.amenities) : null,
        s.lat || null,
        s.lng || null,
        s.reviewAllowed !== undefined ? (s.reviewAllowed ? 1 : 0) : 1,
        s.vipVoucherCount !== undefined ? Number(s.vipVoucherCount) : 0,
        s.shopImages ? JSON.stringify(s.shopImages) : null,
      ];
      const dbResult = await db.run(sql, params);
      logForensicWrite({ route: '/api/shops', method: 'POST', body: req.body || {}, sql, params, dbResult, result: { ok: true, success: true, shopId, data: s } });
      
      // Return full shop data
      const newShop = normalizeShopRow({
        shopId,
        name: s.name,
        category: s.category,
        region: s.region,
        regionId: s.regionId,
        address: s.address,
        phone: s.phone,
        description: s.description,
        hours: s.hours || s.businessHours,
        businessHours: s.businessHours,
        closedDay: s.closedDay,
        breakTime: s.breakTime,
        isPublic: s.isPublic ? 1 : 0,
        status: s.status || 'pending',
        ownerId: memberId,
        createdBy: memberId,
        registeredBy: s.registeredBy || memberId,
        thumbnail: s.thumbnail,
        recommendedMenus: s.recommendedMenus ? JSON.stringify(s.recommendedMenus) : null,
        menus: s.menus ? JSON.stringify(s.menus) : null,
        amenities: s.amenities ? JSON.stringify(s.amenities) : null,
        lat: s.lat,
        lng: s.lng,
        shopImages: s.shopImages ? JSON.stringify(s.shopImages) : null,
        createdAt: now,
        updatedAt: now,
      });
      
      return res.json({ ok: true, success: true, shopId, data: newShop });
    }
  } catch (err) {
    logger.error('Error creating/updating shop:', err);
    res.status(500).json({ error: err.message });
  }
});

async function assertShopOwnerOrThrow(shopId, memberId) {
  if (!memberId) {
    const e = new Error('Unauthorized: memberId required');
    e.statusCode = 401;
    throw e;
  }
  const checkQuery = USE_POSTGRES
    ? 'SELECT owner_id, created_by FROM shops WHERE shop_id = $1'
    : 'SELECT ownerId, createdBy FROM shops WHERE shopId = ?';
  const existing = await db.get(checkQuery, [shopId]);
  if (!existing) {
    const e = new Error('Shop not found');
    e.statusCode = 404;
    throw e;
  }
  const ownerId = USE_POSTGRES ? existing.owner_id : existing.ownerId;
  const createdBy = USE_POSTGRES ? existing.created_by : existing.createdBy;
  if (ownerId !== memberId && createdBy !== memberId) {
    const e = new Error('Forbidden: You do not own this shop');
    e.statusCode = 403;
    throw e;
  }
  return existing;
}

// ✨ ADD: POST /api/shops/:id/thumbnail - 썸네일 업로드
app.post('/api/shops/:id/thumbnail', upload.single('thumbnail'), async (req, res) => {
  try {
    const shopId = req.params.id;
    const memberId = req.headers['x-member-id'];
    await assertShopOwnerOrThrow(shopId, memberId);

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // ✅ UPLOADS_DIR = server/uploads/banners/ → URL 경로도 /banners/ 포함
    const thumbnailUrl = `/uploads/banners/${req.file.filename}`;
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        'UPDATE shops SET thumbnail = $1, updated_at = $2 WHERE shop_id = $3',
        [thumbnailUrl, now, shopId]
      );
    } else {
      await db.run(
        'UPDATE shops SET thumbnail = ?, updatedAt = ? WHERE shopId = ?',
        [thumbnailUrl, now, shopId]
      );
    }

    res.json({ ok: true, thumbnailUrl });
  } catch (err) {
    logger.error('Error uploading shop thumbnail:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.post('/api/shops/:id/images', upload.array('images', 3), async (req, res) => {
  try {
    const shopId = req.params.id;
    const memberId = req.headers['x-member-id'];
    await assertShopOwnerOrThrow(shopId, memberId);

    const files = Array.isArray(req.files) ? req.files.slice(0, 3) : [];
    if (!files.length) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const currentRow = USE_POSTGRES
      ? await db.get('SELECT shop_images FROM shops WHERE shop_id = $1', [shopId])
      : await db.get('SELECT shopImages FROM shops WHERE shopId = ?', [shopId]);
    const existingImages = normalizeShopImages(USE_POSTGRES ? currentRow?.shop_images : currentRow?.shopImages);

    if (existingImages.length >= 3 || existingImages.length + files.length > 3) {
      return res.status(400).json({ error: '상점 내부 사진은 최대 3장까지 등록할 수 있습니다.' });
    }

    const uploadedImages = files.map((file) => `/uploads/banners/${file.filename}`);
    const shopImages = [...existingImages, ...uploadedImages].slice(0, 3);
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        'UPDATE shops SET shop_images = $1::jsonb, updated_at = $2 WHERE shop_id = $3',
        [JSON.stringify(shopImages), now, shopId]
      );
    } else {
      await db.run(
        'UPDATE shops SET shopImages = ?, updatedAt = ? WHERE shopId = ?',
        [JSON.stringify(shopImages), now, shopId]
      );
    }

    res.json({ ok: true, shopImages });
  } catch (err) {
    logger.error('Error uploading shop images:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// PUT /api/shops/:shopId - 상점 정보 수정 (소유자 권한 확인)
app.put('/api/shops/:id', async (req, res) => {
  try {
    const shopId = req.params.id;
    const memberId = req.headers['x-member-id'];
    await assertShopOwnerOrThrow(shopId, memberId);

    const updates = req.body || {};
    const now = new Date().toISOString();

    let sql = null;
    let params = null;

    if (USE_POSTGRES) {
      const query = `
        UPDATE shops SET
          name = COALESCE($1, name),
          category = COALESCE($2, category),
          region = COALESCE($3, region),
          region_id = COALESCE($4, region_id),
          address = COALESCE($5, address),
          phone = COALESCE($6, phone),
          description = COALESCE($7, description),
          hours = COALESCE($8, hours),
          is_public = COALESCE($9, is_public),
          status = COALESCE($10, status),
          menus = COALESCE($11::jsonb, menus),
          thumbnail = COALESCE($12, thumbnail),
          updated_at = $13
        WHERE shop_id = $14
      `;
      sql = query;
      params = [
        updates.name,
        updates.category,
        updates.region,
        updates.regionId != null ? String(updates.regionId) : null,
        updates.address,
        updates.phone,
        updates.description,
        updates.hours,
        updates.isPublic,
        updates.status,
        updates.menus ? JSON.stringify(updates.menus) : null,
        updates.thumbnail,
        now,
        shopId,
      ];
      await db.run(sql, params);
    } else {
      const query = `
        UPDATE shops SET
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          region = COALESCE(?, region),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          description = COALESCE(?, description),
          hours = COALESCE(?, hours),
          isPublic = COALESCE(?, isPublic),
          status = COALESCE(?, status),
          menus = COALESCE(?, menus),
          thumbnail = COALESCE(?, thumbnail),
          updatedAt = ?
        WHERE shopId = ?
      `;
      sql = query;
      params = [
        updates.name,
        updates.category,
        updates.region,
        updates.address,
        updates.phone,
        updates.description,
        updates.hours,
        updates.isPublic !== undefined ? (updates.isPublic ? 1 : 0) : null,
        updates.status !== undefined ? String(updates.status) : null,
        updates.menus ? JSON.stringify(updates.menus) : null,
        updates.thumbnail,
        now,
        shopId,
      ];
      const dbResult = await db.run(sql, params);
      logForensicWrite({ route: `/api/shops/${shopId}`, method: 'PUT', body: req.body || {}, sql, params, dbResult, result: { ok: true, success: true, shopId } });
      return res.json({ ok: true, success: true, shopId });
    }

    logForensicWrite({ route: `/api/shops/${shopId}`, method: 'PUT', body: req.body || {}, sql, params, dbResult: null, result: { ok: true, success: true, shopId } });
    res.json({ ok: true, success: true, shopId });
  } catch (err) {
    logger.error('Error updating shop:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// PATCH /api/shops/:id - 상점 정보 수정 (소유자 권한 확인)
app.patch('/api/shops/:id', async (req, res) => {
  try {
    // Back-compat: PATCH is treated as PUT with same contract
    const shopId = req.params.id;
    const memberId = req.headers['x-member-id'];
    await assertShopOwnerOrThrow(shopId, memberId);

    const updates = req.body || {};
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      const query = `
        UPDATE shops SET
          name = COALESCE($1, name),
          category = COALESCE($2, category),
          region = COALESCE($3, region),
          address = COALESCE($4, address),
          phone = COALESCE($5, phone),
          description = COALESCE($6, description),
          hours = COALESCE($7, hours),
          is_public = COALESCE($8, is_public),
          status = COALESCE($9, status),
          menus = COALESCE($10::jsonb, menus),
          thumbnail = COALESCE($11, thumbnail),
          updated_at = $12
        WHERE shop_id = $13
      `;
      await db.run(query, [
        updates.name,
        updates.category,
        updates.region,
        updates.address,
        updates.phone,
        updates.description,
        updates.hours,
        updates.isPublic,
        updates.status,
        updates.menus ? JSON.stringify(updates.menus) : null,
        updates.thumbnail,
        now,
        shopId,
      ]);
    } else {
      const query = `
        UPDATE shops SET
          name = COALESCE(?, name),
          category = COALESCE(?, category),
          region = COALESCE(?, region),
          address = COALESCE(?, address),
          phone = COALESCE(?, phone),
          description = COALESCE(?, description),
          hours = COALESCE(?, hours),
          isPublic = COALESCE(?, isPublic),
          status = COALESCE(?, status),
          menus = COALESCE(?, menus),
          thumbnail = COALESCE(?, thumbnail),
          updatedAt = ?
        WHERE shopId = ?
      `;
      await db.run(query, [
        updates.name,
        updates.category,
        updates.region,
        updates.address,
        updates.phone,
        updates.description,
        updates.hours,
        updates.isPublic !== undefined ? (updates.isPublic ? 1 : 0) : null,
        updates.status !== undefined ? String(updates.status) : null,
        updates.menus ? JSON.stringify(updates.menus) : null,
        updates.thumbnail,
        now,
        shopId,
      ]);
    }

    res.json({ ok: true, success: true, shopId });
  } catch (err) {
    logger.error('Error updating shop:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// GET /api/shops/:shopId/qr - 서명된 QR payload 발급 (위조 방지)
app.get('/api/shops/:shopId/qr', async (req, res) => {
  try {
    const { shopId } = req.params;
    if (!shopId) return res.status(400).json({ error: 'shopId required' });

    // shop 존재 확인
    const row = await db.get(
      USE_POSTGRES ? 'SELECT shop_id FROM shops WHERE shop_id = $1' : 'SELECT shopId FROM shops WHERE shopId = ?',
      [shopId]
    );
    if (!row) return res.status(404).json({ error: 'Shop not found' });

    const exp = Date.now() + 10 * 60 * 1000; // 10 minutes
    const nonce = crypto.randomBytes(8).toString('hex');
    const qrPayload = signQrPayload({ shopId, exp, nonce });
    logForensicWrite({
      route: `/api/shops/${shopId}/qr`,
      method: 'GET',
      body: {},
      sql: USE_POSTGRES ? 'SELECT shop_id FROM shops WHERE shop_id = $1' : 'SELECT shopId FROM shops WHERE shopId = ?',
      params: [shopId],
      dbResult: null,
      result: { ok: true, success: true, shopId, exp, nonceIssued: true },
    });
    res.json({ ok: true, success: true, shopId, exp, qrPayload });
  } catch (err) {
    logger.error('Error issuing shop qr:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/qr - QR 결제 처리 (서명 검증 후 상점 적립)
app.post('/api/payments/qr', requireAuth, async (req, res) => {
  try {
    const { qrPayload, amount } = req.body || {};
    const amt = Number(amount);
    if (!qrPayload) return res.status(400).json({ error: 'qrPayload required' });
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'valid amount required' });

    const verified = verifyQrPayload(qrPayload);
    if (!verified.ok) return res.status(400).json({ error: verified.error });
    const shopId = String(verified.payload.shopId);

    // shop 존재 확인
    const shop = await db.get(
      USE_POSTGRES ? 'SELECT shop_id, name FROM shops WHERE shop_id = $1' : 'SELECT shopId, name FROM shops WHERE shopId = ?',
      [shopId]
    );
    if (!shop) return res.status(404).json({ error: 'Shop not found' });

    const payerMemberId = String(req.authMemberId || '').trim();
    if (!payerMemberId) {
      return res.status(401).json({ error: 'Unauthorized: 로그인이 필요합니다.' });
    }
    const headerMemberId = req.headers['x-member-id'] ? String(req.headers['x-member-id']).trim() : '';
    if (headerMemberId && headerMemberId !== payerMemberId) {
      return res.status(403).json({ error: '결제 회원 정보가 세션과 일치하지 않습니다.' });
    }

    const paymentId = `QRPAY_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    const shopName = USE_POSTGRES ? shop.name : shop.name;
    const description = `상점 ${shopName || shopId} QR 결제`;
    const debitAmount = Math.abs(Math.trunc(amt));

    await syncPointLedgerSeq();

    let currentBalance = 0;
    if (USE_POSTGRES) {
      await db.run('BEGIN');
      try {
        await lockMemberPointLedger(payerMemberId);
        currentBalance = await getMemberPointBalance(payerMemberId);
        if (currentBalance < debitAmount) {
          await db.run('ROLLBACK');
          return res.status(400).json({ error: '포인트 잔액이 부족합니다.', required: debitAmount, available: currentBalance });
        }

        await db.run(
          `INSERT INTO qr_payments(payment_id, shop_id, amount, payer_member_id, status, created_at)
           VALUES($1, $2, $3, $4, 'completed', $5)`,
          [paymentId, shopId, debitAmount, payerMemberId, now]
        );
        await db.run(
          `INSERT INTO shop_earnings(shop_id, shop_name, amount, source_tx_id, buyer_member_id, status, created_at)
           VALUES($1, $2, $3, $4, $5, 'active', $6)`,
          [shopId, shopName, debitAmount, paymentId, payerMemberId, now]
        );
        await db.run(
          `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, status, created_at)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [payerMemberId, -debitAmount, 'PAYMENT', description, paymentId, 'QR_PAYMENT', 'active', now]
        );
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      await db.run('BEGIN');
      try {
        currentBalance = await getMemberPointBalance(payerMemberId);
        if (currentBalance < debitAmount) {
          await db.run('ROLLBACK');
          return res.status(400).json({ error: '포인트 잔액이 부족합니다.', required: debitAmount, available: currentBalance });
        }

        await db.run(
          `INSERT INTO qr_payments(payment_id, shop_id, amount, payer_member_id, status, created_at)
           VALUES(?, ?, ?, ?, 'completed', ?)`,
          [paymentId, shopId, debitAmount, payerMemberId, now]
        );
        await db.run(
          `INSERT INTO shop_earnings(shop_id, shop_name, amount, source_tx_id, buyer_member_id, status, created_at)
           VALUES(?, ?, ?, ?, ?, 'active', ?)`,
          [shopId, shopName, debitAmount, paymentId, payerMemberId, now]
        );
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, status, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
          [payerMemberId, -debitAmount, 'PAYMENT', description, paymentId, 'QR_PAYMENT', 'active', now]
        );
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    }

    logForensicWrite({
      route: '/api/payments/qr',
      method: 'POST',
      body: req.body || {},
      sql: 'BEGIN; qr_payments + shop_earnings + point_ledger (user debit); COMMIT',
      params: { paymentId, shopId, amount: debitAmount, payerMemberId },
      dbResult: null,
      result: { ok: true, success: true, id: paymentId, shopId, amount: debitAmount, userBalance: currentBalance - debitAmount },
    });

    res.json({ 
      ok: true, 
      success: true, 
      id: paymentId, 
      shopId, 
      amount: debitAmount,
      userBalance: currentBalance - debitAmount,
      message: '결제 완료 (유저 포인트 차감 + 상점 포인트 적립)'
    });
  } catch (err) {
    logger.error('Error processing qr payment:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shops/:id
app.delete('/api/shops/:id', requireAuth, async (req, res) => {
  try {
    const shopId = req.params.id;
    if (!shopId) return res.status(400).json({ error: 'shopId required' });

    // 상점 소유자 또는 ADMIN 이상만 삭제 가능
    if (!isAdminRole(req.authRole)) {
      const shop = USE_POSTGRES
        ? await db.get('SELECT owner_id FROM shops WHERE shop_id = $1', [shopId])
        : await db.get('SELECT ownerId FROM shops WHERE shopId = ?', [shopId]);
      if (!shop) return res.status(404).json({ error: 'Shop not found' });
      const ownerId = String(shop.owner_id || shop.ownerId || '');
      if (ownerId !== req.authMemberId) return res.status(403).json({ error: 'Forbidden: 상점 소유자만 삭제할 수 있습니다.' });
    }

    const query = USE_POSTGRES
      ? 'DELETE FROM shops WHERE shop_id = $1'
      : 'DELETE FROM shops WHERE shopId = ?';
    const dbResult = await db.run(query, [shopId]);
    const result = { ok: true, success: true, shopId };
    try {
      logForensicWrite({ route: `/api/shops/${shopId}`, method: 'DELETE', body: {}, sql: query, params: [shopId], dbResult, result });
    } catch (e) {}
    res.json(result);
  } catch (err) {
    logger.error('Error deleting shop:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// VIP VOUCHER API
// ============================================

// GET /api/vouchers/types - 상품권 타입 목록
app.get('/api/vouchers/types', async (req, res) => {
  try {
    const rows = USE_POSTGRES
      ? await db.query('SELECT * FROM voucher_types WHERE is_active = true ORDER BY created_at ASC')
      : await db.all('SELECT * FROM voucher_types WHERE is_active = 1 ORDER BY created_at ASC');
    res.json({ ok: true, types: rows || [] });
  } catch (err) {
    logger.error('voucher types error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vouchers/types - 새 타입 추가 (관리자)
app.post('/api/vouchers/types', async (req, res) => {
  try {
    const { typeCode, name, description } = req.body;
    if (!typeCode || !name) return res.status(400).json({ error: 'typeCode and name required' });
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO voucher_types (type_code, name, description) VALUES ($1, $2, $3) ON CONFLICT (type_code) DO UPDATE SET name=$2, description=$3, is_active=true`,
        [typeCode, name, description || null]
      );
    } else {
      await db.run(
        `INSERT OR REPLACE INTO voucher_types (type_code, name, description, is_active) VALUES (?, ?, ?, 1)`,
        [typeCode, name, description || null]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error('voucher type create error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/vouchers/types/:typeCode - 타입 비활성화 (soft-delete)
app.delete('/api/vouchers/types/:typeCode', async (req, res) => {
  try {
    const { typeCode } = req.params;
    if (!typeCode) return res.status(400).json({ error: 'typeCode required' });
    if (USE_POSTGRES) {
      await db.run(`UPDATE voucher_types SET is_active = false WHERE type_code = $1`, [typeCode]);
    } else {
      await db.run(`UPDATE voucher_types SET is_active = 0 WHERE type_code = ?`, [typeCode]);
    }
    logger.info(`[VOUCHER_TYPE_DELETE] type_code=${typeCode} soft-deleted`);
    res.json({ ok: true });
  } catch (err) {
    logger.error('voucher type delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vouchers/:memberId/balance - 회원별 타입별 잔액
app.get('/api/vouchers/:memberId/balance', async (req, res) => {
  try {
    const { memberId } = req.params;
    const rows = USE_POSTGRES
      ? await db.query(
          `SELECT vl.type_code, vt.name, SUM(vl.amount) as balance
           FROM voucher_ledger vl
           LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
           WHERE vl.member_id = $1 AND vl.status = 'active'
           GROUP BY vl.type_code, vt.name`,
          [String(memberId)]
        )
      : await db.all(
          `SELECT vl.type_code, vt.name, SUM(vl.amount) as balance
           FROM voucher_ledger vl
           LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
           WHERE vl.member_id = ? AND vl.status = 'active'
           GROUP BY vl.type_code, vt.name`,
          [String(memberId)]
        );
    const balances = (rows || []).map(r => ({
      typeCode: r.type_code || r.typeCode,
      name: r.name || r.type_code,
      balance: parseInt(r.balance) || 0,
    }));
    const total = balances.reduce((s, b) => s + b.balance, 0);
    res.json({ ok: true, memberId, total, balances });
  } catch (err) {
    logger.error('voucher balance error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shops/:shopId/voucher-balance - 상점 보유 상품권 잔액
app.get('/api/shops/:shopId/voucher-balance', async (req, res) => {
  try {
    const { shopId } = req.params;
    const rows = USE_POSTGRES
      ? await db.query(
          `SELECT vl.type_code, vt.name, COALESCE(SUM(vl.amount),0) as balance
           FROM voucher_ledger vl
           LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
           WHERE vl.member_id = $1 AND vl.target_type = 'shop' AND vl.status = 'active'
           GROUP BY vl.type_code, vt.name`,
          [String(shopId)]
        )
      : await db.all(
          `SELECT vl.type_code, vt.name, COALESCE(SUM(vl.amount),0) as balance
           FROM voucher_ledger vl
           LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
           WHERE vl.member_id = ? AND vl.target_type = 'shop' AND vl.status = 'active'
           GROUP BY vl.type_code, vt.name`,
          [String(shopId)]
        );
    const balances = (rows || []).map(r => ({
      typeCode: r.type_code || r.typeCode,
      name: r.name || r.type_code,
      balance: parseInt(r.balance) || 0,
    }));
    const total = balances.reduce((s, b) => s + b.balance, 0);
    res.json({ ok: true, shopId, total, balances });
  } catch (err) {
    logger.error('shop voucher balance error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/admin/vouchers/distribute - 상점 → 회원 배분
app.post('/api/admin/vouchers/distribute', async (req, res) => {
  try {
    const { shopId, memberId, typeCode, amount, description, adminId } = req.body;
    if (!shopId || !memberId || !typeCode || !amount) return res.status(400).json({ error: '필수 파라미터 누락' });
    const qty = parseInt(amount);
    if (qty <= 0) return res.status(400).json({ error: '수량은 1 이상이어야 합니다' });

    // 상점 잔액 확인
    const balRow = USE_POSTGRES
      ? (await db.query(`SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=$1 AND type_code=$2 AND target_type='shop' AND status='active'`, [String(shopId), typeCode]))[0]
      : await db.get(`SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=? AND type_code=? AND target_type='shop' AND status='active'`, [String(shopId), typeCode]);
    const currentBalance = parseInt(balRow?.bal) || 0;
    if (currentBalance < qty) return res.status(400).json({ error: `상점 잔액 부족 (현재: ${currentBalance}장)` });

    const refId = `dist_${Date.now()}`;
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      // 상점에서 차감 (-qty)
      await db.query(
        `INSERT INTO voucher_ledger(member_id,type_code,amount,status,source,reference_id,description,admin_id,target_type,shop_id,created_at)
         VALUES($1,$2,$3,'active','admin_distribute',$4,$5,$6,'shop',$7,$8)`,
        [String(shopId), typeCode, -qty, refId, description || `회원 배분: ${memberId}`, adminId || 'admin', String(shopId), now]
      );
      // 회원에게 지급 (+qty)
      await db.query(
        `INSERT INTO voucher_ledger(member_id,type_code,amount,status,source,reference_id,description,admin_id,target_type,shop_id,created_at)
         VALUES($1,$2,$3,'active','admin_distribute',$4,$5,$6,'member',$7,$8)`,
        [String(memberId), typeCode, qty, refId, description || `상점 배분: ${shopId}`, adminId || 'admin', String(shopId), now]
      );
    } else {
      // SQLite: 간단한 연번 계산 (동시성 경합 시 희박한 레이스 가능, 운영 DB는 Postgres 권장)
      const nextRow = await db.get(`SELECT COALESCE(MAX(serial_no),0)+1 as next FROM voucher_ledger`);
      const nextSerial = (nextRow && nextRow.next) ? Number(nextRow.next) : 1;
      // 상점에서 차감 (-qty)
      await db.run(
        `INSERT INTO voucher_ledger(serial_no, member_id,type_code,amount,status,source,reference_id,description,admin_id,target_type,shop_id,created_at)
         VALUES(?,?,?,?,?,'admin_distribute',?,?,?,'shop',?,?)`,
        [nextSerial, String(shopId), typeCode, -qty, 'active', refId, description || `회원 배분: ${memberId}`, adminId || 'admin', String(shopId), now]
      );
      // 회원에게 지급 (+qty) — 다음 연번 사용
      await db.run(
        `INSERT INTO voucher_ledger(serial_no, member_id,type_code,amount,status,source,reference_id,description,admin_id,target_type,shop_id,created_at)
         VALUES(?,?,?,?,?,'admin_distribute',?,?,?,'member',?,?)`,
        [nextSerial + 1, String(memberId), typeCode, qty, 'active', refId, description || `상점 배분: ${shopId}`, adminId || 'admin', String(shopId), now]
      );
    }

    res.json({ ok: true, shopId, memberId, typeCode, amount: qty, referenceId: refId });
  } catch (err) {
    logger.error('voucher distribute error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/vouchers/:memberId/history - 상품권 내역
app.get('/api/vouchers/:memberId/history', async (req, res) => {
  try {
    const { memberId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    const rows = USE_POSTGRES
      ? await db.query(
          `SELECT vl.*, vt.name as type_name
           FROM voucher_ledger vl
           LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
           WHERE vl.member_id = $1
           ORDER BY vl.created_at DESC LIMIT $2`,
          [String(memberId), limit]
        )
      : await db.all(
          `SELECT vl.*, vt.name as type_name
           FROM voucher_ledger vl
           LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
           WHERE vl.member_id = ?
           ORDER BY vl.created_at DESC LIMIT ?`,
          [String(memberId), limit]
        );
    const history = (rows || []).map(r => ({
      id: r.ledger_id || r.ledgerId,
      memberId: r.member_id || r.memberId,
      typeCode: r.type_code || r.typeCode,
      typeName: r.type_name || r.typeName || r.type_code,
      amount: r.amount,
      status: r.status,
      source: r.source,
      referenceId: r.reference_id || r.referenceId,
      description: r.description,
      createdAt: r.created_at || r.createdAt,
    }));
    res.json({ ok: true, history });
  } catch (err) {
    logger.error('voucher history error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vouchers/issue - 관리자 수동 지급 (회원 또는 상점 대상)
app.post('/api/vouchers/issue', async (req, res) => {
  try {
    const { memberId, typeCode, amount, description, adminId, source, referenceId, targetType, shopId } = req.body;
    if (!memberId || !typeCode || !amount) return res.status(400).json({ error: 'memberId, typeCode, amount required' });
    const resolvedTargetType = targetType || 'member';
    const resolvedShopId = resolvedTargetType === 'shop' ? (shopId || memberId) : (shopId || null);
    const qty = Number(amount);

    // 차감인 경우 잔액 확인
    if (qty < 0) {
      const whereId = resolvedTargetType === 'shop' ? 'shop_id' : 'member_id';
      const whereIdSqlite = resolvedTargetType === 'shop' ? 'shop_id' : 'member_id';
      const balRow = USE_POSTGRES
        ? (await db.query(
            `SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=$1 AND type_code=$2 AND target_type=$3 AND status='active'`,
            [String(memberId), typeCode, resolvedTargetType]
          ))[0] || (await db.query(
            `SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=$1 AND type_code=$2 AND status='active'`,
            [String(memberId), typeCode]
          ))[0]
        : await db.get(
            `SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=? AND type_code=? AND target_type=? AND status='active'`,
            [String(memberId), typeCode, resolvedTargetType]
          );
      const currentBalance = parseInt(balRow?.bal) || 0;
      if (currentBalance + qty < 0) {
        return res.status(400).json({ error: `잔액 부족 (현재: ${currentBalance}장, 차감: ${Math.abs(qty)}장)`, balance: currentBalance });
      }
    }
    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO voucher_ledger(member_id, type_code, amount, status, source, reference_id, description, admin_id, target_type, shop_id, created_at)
         VALUES($1,$2,$3,'active',$4,$5,$6,$7,$8,$9,$10)`,
        [String(memberId), typeCode, qty, source || 'ADMIN', referenceId || null, description || null, adminId || null, resolvedTargetType, resolvedShopId, now]
      );
    } else {
      // SQLite: serial_no 직접 계산
      const nextRow = await db.get(`SELECT COALESCE(MAX(serial_no),0)+1 as next FROM voucher_ledger`);
      const nextSerial = (nextRow && nextRow.next) ? Number(nextRow.next) : 1;
      await db.run(
        `INSERT INTO voucher_ledger(serial_no, member_id, type_code, amount, status, source, reference_id, description, admin_id, target_type, shop_id, created_at)
         VALUES(?,?,?,?,? ,?, ?, ?, ?, ?, ?, ?)`,
        [nextSerial, String(memberId), typeCode, qty, 'active', source || 'ADMIN', referenceId || null, description || null, adminId || null, resolvedTargetType, resolvedShopId, now]
      );
    }
    logger.info(`✅ [VOUCHER_ISSUE] target=${resolvedTargetType} id=${memberId} ${qty > 0 ? '+' : ''}${qty} ${typeCode}`);
    res.json({ ok: true });
  } catch (err) {
    logger.error('voucher issue error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/vouchers/use - 상점에서 사용 차감
app.post('/api/vouchers/use', async (req, res) => {
  try {
    const { memberId, typeCode, amount, description, shopId } = req.body;
    if (!memberId || !typeCode || !amount) return res.status(400).json({ error: 'memberId, typeCode, amount required' });
    // 잔액 확인
    const balRows = USE_POSTGRES
      ? await db.query(`SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=$1 AND type_code=$2 AND status='active'`, [String(memberId), typeCode])
      : await db.all(`SELECT COALESCE(SUM(amount),0) as bal FROM voucher_ledger WHERE member_id=? AND type_code=? AND status='active'`, [String(memberId), typeCode]);
    const balance = parseInt(balRows?.[0]?.bal) || 0;
    if (balance < Number(amount)) return res.status(400).json({ error: '잔액이 부족합니다.', balance });
    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO voucher_ledger(member_id, type_code, amount, status, source, reference_id, description, created_at)
         VALUES($1,$2,$3,'active','SHOP_USE',$4,$5,$6)`,
        [String(memberId), typeCode, -Number(amount), shopId || null, description || '상점 사용', now]
      );
    } else {
      // SQLite: serial_no 직접 계산 후 입력
      const nextRow = await db.get(`SELECT COALESCE(MAX(serial_no),0)+1 as next FROM voucher_ledger`);
      const nextSerial = (nextRow && nextRow.next) ? Number(nextRow.next) : 1;
      await db.run(
        `INSERT INTO voucher_ledger(serial_no, member_id, type_code, amount, status, source, reference_id, description, created_at)
         VALUES(?,?,?,?,?,'SHOP_USE',?, ?, ?)`,
        [nextSerial, String(memberId), typeCode, -Number(amount), 'active', shopId || null, description || '상점 사용', now]
      );
    }
    logger.info(`✅ [VOUCHER_USE] ${memberId} -${amount} ${typeCode} @ shop ${shopId}`);
    res.json({ ok: true, balance: balance - Number(amount) });
  } catch (err) {
    logger.error('voucher use error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/vouchers/transfer', requireAuth, async (req, res) => {
  try {
    const {
      fromMemberId,
      toMemberId,
      shopId,
      targetType,
      typeCode,
      amount,
      referenceId,
      senderSource,
      receiverSource,
      senderDescription,
      receiverDescription,
      actorId,
    } = req.body || {};

    const resolvedTargetType = String(targetType || 'member').trim().toLowerCase() === 'shop' ? 'shop' : 'member';
    const sessionSenderId = String(req.authMemberId || '').trim();
    const bodySenderId = String(fromMemberId || '').trim();
    const senderId = isAdminRole(req.authRole) && bodySenderId ? bodySenderId : sessionSenderId;
    if (!senderId) {
      return res.status(401).json({ error: 'Unauthorized: 로그인이 필요합니다.' });
    }
    if (!isAdminRole(req.authRole) && bodySenderId && bodySenderId !== sessionSenderId) {
      return res.status(403).json({ error: '본인 계정으로만 이용권을 전송할 수 있습니다.' });
    }
    const receiverId = String(resolvedTargetType === 'shop' ? (shopId || '') : (toMemberId || '')).trim();
    const qty = Number(amount);
    const refId = String(referenceId || '').trim();

    if (!senderId || !receiverId || !typeCode || !refId || !Number.isFinite(qty) || qty <= 0) {
      return res.status(400).json({ error: 'fromMemberId, target, typeCode, amount, referenceId required' });
    }

    if (resolvedTargetType === 'member' && senderId === receiverId) {
      return res.status(400).json({ error: '본인에게는 전송할 수 없습니다.' });
    }

    const senderBalanceRow = USE_POSTGRES
      ? (await db.query(
          `SELECT COALESCE(SUM(amount),0) as bal
           FROM voucher_ledger
           WHERE member_id = $1
             AND type_code = $2
             AND reference_id = $3
             AND status = 'active'
             AND (target_type = 'member' OR target_type IS NULL)`,
          [senderId, typeCode, refId]
        ))[0]
      : await db.get(
          `SELECT COALESCE(SUM(amount),0) as bal
           FROM voucher_ledger
           WHERE member_id = ?
             AND type_code = ?
             AND reference_id = ?
             AND status = 'active'
             AND (target_type = 'member' OR target_type IS NULL)`,
          [senderId, typeCode, refId]
        );

    const senderBalance = parseInt(senderBalanceRow?.bal, 10) || 0;
    if (senderBalance < qty) {
      return res.status(400).json({ error: '해당 상품권 카드 잔액이 부족합니다.', balance: senderBalance });
    }

    const now = new Date().toISOString();
    const resolvedSenderSource = senderSource || (resolvedTargetType === 'shop' ? 'VOUCHER_SHOP_TRANSFER_OUT' : 'MEMBER_TRANSFER_OUT');
    const resolvedReceiverSource = receiverSource || (resolvedTargetType === 'shop' ? 'VOUCHER_SHOP_TRANSFER_IN' : 'MEMBER_TRANSFER_IN');

    if (USE_POSTGRES && db._pool) {
      const client = await db._pool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `INSERT INTO voucher_ledger(member_id, type_code, amount, status, source, reference_id, description, admin_id, target_type, shop_id, created_at)
           VALUES($1,$2,$3,'active',$4,$5,$6,$7,'member',NULL,$8)`,
          [senderId, typeCode, -qty, resolvedSenderSource, refId, senderDescription || null, actorId || null, now]
        );
        await client.query(
          `INSERT INTO voucher_ledger(member_id, type_code, amount, status, source, reference_id, description, admin_id, target_type, shop_id, created_at)
           VALUES($1,$2,$3,'active',$4,$5,$6,$7,$8,$9,$10)`,
          [receiverId, typeCode, qty, resolvedReceiverSource, refId, receiverDescription || null, actorId || null, resolvedTargetType, resolvedTargetType === 'shop' ? receiverId : null, now]
        );
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else {
      await db.run('BEGIN');
      try {
        const nextRow = await db.get(`SELECT COALESCE(MAX(serial_no),0)+1 as next FROM voucher_ledger`);
        const nextSerial = Number(nextRow?.next || 1);
        await db.run(
          `INSERT INTO voucher_ledger(serial_no, member_id, type_code, amount, status, source, reference_id, description, admin_id, target_type, shop_id, created_at)
           VALUES(?,?,?,?,? ,?, ?, ?, ?, 'member', NULL, ?)`,
          [nextSerial, senderId, typeCode, -qty, 'active', resolvedSenderSource, refId, senderDescription || null, actorId || null, now]
        );
        await db.run(
          `INSERT INTO voucher_ledger(serial_no, member_id, type_code, amount, status, source, reference_id, description, admin_id, target_type, shop_id, created_at)
           VALUES(?,?,?,?,? ,?, ?, ?, ?, ?, ?, ?)`,
          [nextSerial + 1, receiverId, typeCode, qty, 'active', resolvedReceiverSource, refId, receiverDescription || null, actorId || null, resolvedTargetType, resolvedTargetType === 'shop' ? receiverId : null, now]
        );
        await db.run('COMMIT');
      } catch (error) {
        try { await db.run('ROLLBACK'); } catch (rollbackError) {}
        throw error;
      }
    }

    logger.info(`✅ [VOUCHER_TRANSFER] ${senderId} -> ${receiverId} ${resolvedTargetType} ${qty} ${typeCode} ref=${refId}`);
    res.json({ ok: true, referenceId: refId, targetType: resolvedTargetType, targetId: receiverId });
  } catch (err) {
    logger.error('voucher transfer error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/vouchers/logs - 전체 로그 (관리자 대시보드)
// 지원 쿼리: page, pageSize, limit(레거시), typeCode, memberId, shopId,
//            targetType(member|shop), sign(plus|minus), source, name(통합 검색),
//            from(YYYY-MM-DD), to(YYYY-MM-DD), sortField, sortDir(asc|desc)
app.get('/api/admin/vouchers/logs', async (req, res) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize = parseInt(req.query.pageSize) || parseInt(req.query.limit) || 20;
    const offset   = (page - 1) * pageSize;

    const qTypeCode   = req.query.typeCode   || null;
    const qMemberId   = req.query.memberId   || null;
    const qShopId     = req.query.shopId     || null;
    const qTargetType = req.query.targetType || null; // 'member' | 'shop'
    const qSign       = req.query.sign       || null; // 'plus' | 'minus'
    const qSource     = req.query.source     || null;
    const qName       = req.query.name       || null; // 통합 이름 검색
    const qFrom       = req.query.from       || null; // YYYY-MM-DD
    const qTo         = req.query.to         || null;
    const sortField   = ['created_at','amount','type_code'].includes(req.query.sortField) ? req.query.sortField : 'created_at';
    const sortDir     = req.query.sortDir === 'asc' ? 'ASC' : 'DESC';

    if (USE_POSTGRES) {
      const conditions = ['1=1'];
      const params = [];
      const p = (v) => { params.push(v); return `$${params.length}`; };

      if (qTypeCode)   conditions.push(`vl.type_code=${p(qTypeCode)}`);
      if (qMemberId)   conditions.push(`vl.member_id=${p(String(qMemberId))}`);
      if (qShopId)     conditions.push(`(vl.shop_id=${p(String(qShopId))} OR (vl.member_id=${p(String(qShopId))} AND vl.target_type='shop'))`);
      if (qTargetType) conditions.push(`vl.target_type=${p(qTargetType)}`);
      if (qSign === 'plus')  conditions.push(`vl.amount > 0`);
      if (qSign === 'minus') conditions.push(`vl.amount < 0`);
      if (qSource)     conditions.push(`vl.source=${p(qSource)}`);
      if (qFrom)       conditions.push(`vl.created_at >= ${p(qFrom + 'T00:00:00')}`);
      if (qTo)         conditions.push(`vl.created_at <= ${p(qTo   + 'T23:59:59')}`);
      if (qName) {
        const like = p('%' + qName + '%');
        conditions.push(`(m.name ILIKE ${like} OR s.name ILIKE ${like} OR vl.member_id ILIKE ${like})`);
      }
      const whereClause = conditions.join(' AND ');

      const baseSelect = `FROM voucher_ledger vl
               LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
               LEFT JOIN members m ON vl.member_id = CAST(m.member_id AS TEXT) AND (vl.target_type = 'member' OR vl.target_type IS NULL)
               LEFT JOIN shops s ON vl.shop_id = CAST(s.shop_id AS TEXT)
               WHERE ${whereClause}`;

      const aggRows   = await db.query(`SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN amount>0 THEN amount ELSE 0 END),0) as sum_plus, COALESCE(SUM(CASE WHEN amount<0 THEN amount ELSE 0 END),0) as sum_minus ${baseSelect}`, params);
      const total     = parseInt(aggRows[0]?.total) || 0;
      const sumPlus   = parseInt(aggRows[0]?.sum_plus) || 0;
      const sumMinus  = parseInt(aggRows[0]?.sum_minus) || 0;

      params.push(pageSize); const limitP = `$${params.length}`;
      params.push(offset);   const offsetP = `$${params.length}`;
      const rows = await db.query(
        `SELECT vl.*, vt.name as type_name, vt.is_active as type_is_active, m.name as member_name, s.name as shop_name
         ${baseSelect} ORDER BY vl.${sortField} ${sortDir} LIMIT ${limitP} OFFSET ${offsetP}`,
        params
      );

      const logs = rows.map(r => ({
        id: r.ledger_id, memberId: r.member_id, memberName: r.member_name || '',
        typeCode: r.type_code, typeName: r.type_name || r.type_code,
        typeIsActive: r.type_is_active !== false,
        targetType: r.target_type || 'member',
        shopId: r.shop_id || null, shopName: r.shop_name || null,
        amount: r.amount, status: r.status, source: r.source,
        referenceId: r.reference_id, description: r.description,
        adminId: r.admin_id, createdAt: r.created_at,
      }));
      res.json({ ok: true, logs, total, sumPlus, sumMinus, page, pageSize });

    } else {
      // SQLite
      const conditions = ['1=1'];
      const params = [];

      if (qTypeCode)   { params.push(qTypeCode);           conditions.push('vl.type_code=?'); }
      if (qMemberId)   { params.push(String(qMemberId));   conditions.push('vl.member_id=?'); }
      if (qShopId)     { params.push(String(qShopId)); params.push(String(qShopId)); conditions.push("(vl.shop_id=? OR (vl.member_id=? AND vl.target_type='shop'))"); }
      if (qTargetType) { params.push(qTargetType);         conditions.push('vl.target_type=?'); }
      if (qSign === 'plus')  conditions.push('vl.amount > 0');
      if (qSign === 'minus') conditions.push('vl.amount < 0');
      if (qSource)     { params.push(qSource);             conditions.push('vl.source=?'); }
      if (qFrom)       { params.push(qFrom + 'T00:00:00'); conditions.push('vl.created_at >= ?'); }
      if (qTo)         { params.push(qTo   + 'T23:59:59'); conditions.push('vl.created_at <= ?'); }
      if (qName) {
        const like = '%' + qName + '%';
        params.push(like); params.push(like); params.push(like);
        conditions.push('(m.name LIKE ? OR s.name LIKE ? OR vl.member_id LIKE ?)');
      }
      const whereClause = conditions.join(' AND ');

      const baseSQL = `FROM voucher_ledger vl
               LEFT JOIN voucher_types vt ON vl.type_code = vt.type_code
               LEFT JOIN members m ON vl.member_id = m.memberId AND (vl.target_type = 'member' OR vl.target_type IS NULL)
               LEFT JOIN shops s ON vl.shop_id = s.shopId
               WHERE ${whereClause}`;

      const aggRow  = await db.get(`SELECT COUNT(*) as total, COALESCE(SUM(CASE WHEN amount>0 THEN amount ELSE 0 END),0) as sum_plus, COALESCE(SUM(CASE WHEN amount<0 THEN amount ELSE 0 END),0) as sum_minus ${baseSQL}`, params);
      const total   = parseInt(aggRow?.total) || 0;
      const sumPlus = parseInt(aggRow?.sum_plus) || 0;
      const sumMinus= parseInt(aggRow?.sum_minus) || 0;

      const dataParams = [...params, pageSize, offset];
      const rows = await db.all(
        `SELECT vl.*, vt.name as type_name, vt.is_active as type_is_active, m.name as member_name, s.name as shop_name
         ${baseSQL} ORDER BY vl.${sortField} ${sortDir} LIMIT ? OFFSET ?`,
        dataParams
      );

      const logs = (rows || []).map(r => ({
        id: r.ledger_id, memberId: r.member_id || r.memberId, memberName: r.member_name || r.memberName || '',
        typeCode: r.type_code || r.typeCode, typeName: r.type_name || r.typeName || r.type_code,
        typeIsActive: r.type_is_active !== 0 && r.type_is_active !== false,
        targetType: r.target_type || r.targetType || 'member',
        shopId: r.shop_id || r.shopId || null, shopName: r.shop_name || r.shopName || null,
        amount: r.amount, status: r.status, source: r.source,
        referenceId: r.reference_id || r.referenceId, description: r.description,
        adminId: r.admin_id || r.adminId, createdAt: r.created_at || r.createdAt,
      }));
      res.json({ ok: true, logs, total, sumPlus, sumMinus, page, pageSize });
    }
  } catch (err) {
    logger.error('admin voucher logs error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/vouchers/balances - 회원/상점별 잔액 현황 (집계)
// 쿼리: targetType(member|shop), name, excludeZero(1), page, pageSize, typeCode
app.get('/api/admin/vouchers/balances', async (req, res) => {
  try {
    const targetType  = req.query.targetType || 'member'; // 'member' | 'shop'
    const name        = req.query.name || null;
    const excludeZero = req.query.excludeZero === '1';
    const page        = Math.max(1, parseInt(req.query.page) || 1);
    const pageSize    = parseInt(req.query.pageSize) || 30;
    const offset      = (page - 1) * pageSize;
    const filterType  = req.query.typeCode || null;

    if (USE_POSTGRES) {
      // target_type IS NULL인 기존 행은 'member'로 간주 (마이그레이션 이전 데이터 호환)
      const targetCondition = targetType === 'member'
        ? `(vl.target_type = $1 OR vl.target_type IS NULL)`
        : `vl.target_type = $1`;
      const conditions = [targetCondition, `vl.status = 'active'`];
      const params = [targetType];
      const p = (v) => { params.push(v); return `$${params.length}`; };

      if (filterType) conditions.push(`vl.type_code = ${p(filterType)}`);

      let joinClause, idCol, nameCol, nameCondition;
      if (targetType === 'shop') {
        joinClause = `LEFT JOIN shops s ON vl.member_id = CAST(s.shop_id AS TEXT)`;
        idCol = 'vl.member_id';
        nameCol = `COALESCE(s.name, vl.member_id)`;
        if (name) { params.push('%' + name + '%'); nameCondition = `(s.name ILIKE $${params.length} OR vl.member_id ILIKE $${params.length})`; }
      } else {
        joinClause = `LEFT JOIN members m ON vl.member_id = CAST(m.member_id AS TEXT)`;
        idCol = 'vl.member_id';
        nameCol = `COALESCE(m.name, vl.member_id)`;
        if (name) { params.push('%' + name + '%'); nameCondition = `(m.name ILIKE $${params.length} OR vl.member_id ILIKE $${params.length})`; }
      }
      if (nameCondition) conditions.push(nameCondition);
      const where = conditions.join(' AND ');

      // 타입별 pivot - 집계만 (db.query는 rows 배열을 직접 반환)
      const pivotRows = await db.query(
        `SELECT ${idCol} as id, ${nameCol} as display_name, vl.type_code,
                SUM(vl.amount) as balance
         FROM voucher_ledger vl ${joinClause}
         WHERE ${where}
         GROUP BY ${idCol}, ${nameCol}, vl.type_code`,
        params
      );

      // JS에서 pivot 조합
      const map = {};
      for (const r of pivotRows) {
        const key = r.id;
        if (!map[key]) map[key] = { id: r.id, name: r.display_name, types: {}, total: 0 };
        const bal = parseInt(r.balance) || 0;
        map[key].types[r.type_code] = bal;
        map[key].total += bal;
      }
      let rows = Object.values(map);
      if (excludeZero) rows = rows.filter(r => r.total > 0);
      rows.sort((a, b) => b.total - a.total);
      const total = rows.length;
      const paged = rows.slice(offset, offset + pageSize);
      res.json({ ok: true, rows: paged, total, page, pageSize });

    } else {
      // SQLite
      const conditions = [`vl.target_type = ?`, `vl.status = 'active'`];
      const params = [targetType];

      if (filterType) { params.push(filterType); conditions.push('vl.type_code = ?'); }

      let joinClause, idCol, nameCol;
      if (targetType === 'shop') {
        joinClause = `LEFT JOIN shops s ON vl.member_id = s.shopId`;
        idCol = 'vl.member_id';
        nameCol = `COALESCE(s.name, vl.member_id)`;
        if (name) { const like = '%' + name + '%'; params.push(like); params.push(like); conditions.push(`(s.name LIKE ? OR vl.member_id LIKE ?)`); }
      } else {
        joinClause = `LEFT JOIN members m ON vl.member_id = m.memberId`;
        idCol = 'vl.member_id';
        nameCol = `COALESCE(m.name, vl.member_id)`;
        if (name) { const like = '%' + name + '%'; params.push(like); params.push(like); conditions.push(`(m.name LIKE ? OR vl.member_id LIKE ?)`); }
      }
      const where = conditions.join(' AND ');

      const pivotRows = await db.all(
        `SELECT ${idCol} as id, ${nameCol} as display_name, vl.type_code,
                SUM(vl.amount) as balance
         FROM voucher_ledger vl ${joinClause}
         WHERE ${where}
         GROUP BY ${idCol}, display_name, vl.type_code`,
        params
      );

      const map = {};
      for (const r of pivotRows) {
        const key = r.id;
        if (!map[key]) map[key] = { id: r.id, name: r.display_name, types: {}, total: 0 };
        const bal = parseInt(r.balance) || 0;
        map[key].types[r.type_code] = bal;
        map[key].total += bal;
      }
      let rows = Object.values(map);
      if (excludeZero) rows = rows.filter(r => r.total > 0);
      rows.sort((a, b) => b.total - a.total);
      const total = rows.length;
      const paged = rows.slice(offset, offset + pageSize);
      res.json({ ok: true, rows: paged, total, page, pageSize });
    }
  } catch (err) {
    logger.error('admin voucher balances error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shops/:id/voucher-count - 관리자: 상점 상품권 수 수정
app.patch('/api/shops/:id/voucher-count', async (req, res) => {
  try {
    const shopId = req.params.id;
    const { count } = req.body;
    if (count === undefined) return res.status(400).json({ error: 'count required' });
    if (USE_POSTGRES) {
      await db.run(`UPDATE shops SET vip_voucher_count=$1 WHERE shop_id=$2`, [Number(count), shopId]);
    } else {
      await db.run(`UPDATE shops SET vip_voucher_count=? WHERE shopId=?`, [Number(count), shopId]);
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error('shop voucher count update error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// REVIEWS API
// ============================================

function parseReviewImages(raw, max = 5) {
  let value = raw;
  for (let i = 0; i < 2; i += 1) {
    if (typeof value !== 'string') break;
    const trimmed = value.trim();
    if (!trimmed) return [];
    try {
      value = JSON.parse(trimmed);
    } catch (e) {
      break;
    }
  }
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item === 'object') return String(item.url || item.imageUrl || '').trim();
      return '';
    })
    .filter(Boolean)
    .slice(0, max);
}

function normalizeReviewRow(row) {
  if (!row) return row;
  const images = parseReviewImages(row.images);
  return { ...row, images };
}

// GET /api/shops/:id/reviews - 특정 상점의 리뷰 조회
app.get('/api/shops/:id/reviews', async (req, res) => {
  try {
    const shopId = req.params.id;
    const limit = parseInt(req.query.limit) || 50;
    const after = req.query.after; // cursor: timestamp
    
    let query, params;
    if (USE_POSTGRES) {
      query = `
        SELECT review_id AS "reviewId", shop_id AS "shopId", member_id AS "memberId", 
               author_name AS "authorName", content, rating, status, images,
               created_at AS "createdAt", updated_at AS "updatedAt"
        FROM reviews 
        WHERE shop_id = $1 AND status = 'visible'
        ${after ? 'AND created_at < $3' : ''}
        ORDER BY created_at DESC
        LIMIT $2
      `;
      params = after ? [shopId, limit, after] : [shopId, limit];
    } else {
      query = `
        SELECT reviewId, shopId, memberId, authorName, content, rating, status, images, createdAt, updatedAt
        FROM reviews 
        WHERE shopId = ? AND status = 'visible'
        ${after ? 'AND createdAt < ?' : ''}
        ORDER BY createdAt DESC
        LIMIT ?
      `;
      params = after ? [shopId, after, limit] : [shopId, limit];
    }
    
    const rows = await db.query(query, params);
    res.json((rows || []).map(normalizeReviewRow));
  } catch (err) {
    logger.error('Error fetching reviews:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shops/:id/reviews - 리뷰 등록
app.post('/api/shops/:id/reviews', async (req, res) => {
  try {
    const shopId = req.params.id;
    const memberId = req.headers['x-member-id'];
    const { content, rating, authorName, images: rawImages } = req.body || {};
    
    if (!memberId) {
      return res.status(401).json({ error: 'Unauthorized: memberId required' });
    }
    
    // 5-4: review_allowed 체크
    const shopRow = await db.get(
      USE_POSTGRES ? 'SELECT review_allowed FROM shops WHERE shop_id=$1' : 'SELECT review_allowed FROM shops WHERE shopId=?',
      [shopId]
    );
    if (shopRow && (shopRow.review_allowed === false || shopRow.review_allowed === 0)) {
      return res.status(403).json({ error: '이 상점은 리뷰 작성을 허용하지 않습니다.' });
    }
    
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'content required' });
    }
    
    if (content.length > 1000) {
      return res.status(400).json({ error: 'content too long (max 1000 chars)' });
    }
    
    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const reviewImages = parseReviewImages(rawImages, 5);
    const imagesJson = JSON.stringify(reviewImages);
    
    const reviewId = `REVIEW_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO reviews(review_id, shop_id, member_id, author_name, content, rating, status, images, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING review_id AS "reviewId", shop_id AS "shopId", member_id AS "memberId", 
                  author_name AS "authorName", content, rating, status, images,
                  created_at AS "createdAt", updated_at AS "updatedAt"
      `;
      const rows = await db.query(query, [
        reviewId,
        shopId,
        memberId,
        authorName || '익명',
        content.trim(),
        rating,
        'visible',
        imagesJson,
        now,
        now
      ]);
      // update-on-write: shops.rating / review_count 즉시 반영
      await db.query(
        `UPDATE shops SET
          rating = (SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r WHERE r.shop_id=$1 AND r.status='visible'),
          review_count = (SELECT COUNT(*) FROM reviews r WHERE r.shop_id=$1 AND r.status='visible')
         WHERE shop_id = $1`,
        [shopId]
      );
      res.json(normalizeReviewRow(rows[0]));
    } else {
      const query = `
        INSERT INTO reviews(reviewId, shopId, memberId, authorName, content, rating, status, images, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(query, [
        reviewId,
        shopId,
        memberId,
        authorName || '익명',
        content.trim(),
        rating,
        'visible',
        imagesJson,
        now,
        now
      ]);
      res.json(normalizeReviewRow({
        reviewId,
        shopId,
        memberId,
        authorName: authorName || '익명',
        content: content.trim(),
        rating,
        status: 'visible',
        images: imagesJson,
        createdAt: now,
        updatedAt: now
      }));
    }
  } catch (err) {
    logger.error('Error creating review:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shops/:id/reviews/:reviewId - 리뷰 수정 (작성자 본인)
app.patch('/api/shops/:id/reviews/:reviewId', requireAuth, async (req, res) => {
  try {
    const { id: shopId, reviewId } = req.params;
    const { content, rating, images: rawImages } = req.body || {};

    const checkQuery = USE_POSTGRES
      ? `SELECT member_id, status FROM reviews WHERE review_id = $1 AND shop_id = $2`
      : `SELECT memberId, status FROM reviews WHERE reviewId = ? AND shopId = ?`;
    const existing = await db.get(checkQuery, [reviewId, shopId]);

    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }

    const reviewStatus = USE_POSTGRES ? existing.status : existing.status;
    if (reviewStatus === 'removed') {
      return res.status(404).json({ error: 'Review not found' });
    }

    const reviewMemberId = String(USE_POSTGRES ? existing.member_id : existing.memberId);
    if (!isAdminRole(req.authRole) && reviewMemberId !== req.authMemberId) {
      return res.status(403).json({ error: '본인 후기만 수정할 수 있습니다.' });
    }

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'content required' });
    }
    if (String(content).length > 1000) {
      return res.status(400).json({ error: 'content too long (max 1000 chars)' });
    }
    if (rating === undefined || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be between 1 and 5' });
    }

    const reviewImages = parseReviewImages(rawImages, 5);
    const imagesJson = JSON.stringify(reviewImages);
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      const rows = await db.query(
        `UPDATE reviews
         SET content = $1, rating = $2, images = $3, updated_at = $4
         WHERE review_id = $5
         RETURNING review_id AS "reviewId", shop_id AS "shopId", member_id AS "memberId",
                   author_name AS "authorName", content, rating, status, images,
                   created_at AS "createdAt", updated_at AS "updatedAt"`,
        [String(content).trim(), rating, imagesJson, now, reviewId]
      );
      await db.query(
        `UPDATE shops SET
          rating = (SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r WHERE r.shop_id=$1 AND r.status='visible'),
          review_count = (SELECT COUNT(*) FROM reviews r WHERE r.shop_id=$1 AND r.status='visible')
         WHERE shop_id = $1`,
        [shopId]
      );
      res.json(normalizeReviewRow(rows[0]));
    } else {
      await db.run(
        `UPDATE reviews SET content = ?, rating = ?, images = ?, updatedAt = ? WHERE reviewId = ?`,
        [String(content).trim(), rating, imagesJson, now, reviewId]
      );
      const row = await db.get(
        `SELECT reviewId, shopId, memberId, authorName, content, rating, status, images, createdAt, updatedAt
         FROM reviews WHERE reviewId = ?`,
        [reviewId]
      );
      res.json(normalizeReviewRow(row));
    }
  } catch (err) {
    logger.error('Error updating review:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shops/:id/reviews/:reviewId - 리뷰 삭제
app.delete('/api/shops/:id/reviews/:reviewId', requireAuth, async (req, res) => {
  try {
    const { id: shopId, reviewId } = req.params;
    
    // 리뷰 소유자 확인
    const checkQuery = USE_POSTGRES
      ? 'SELECT member_id FROM reviews WHERE review_id = $1 AND shop_id = $2'
      : 'SELECT memberId FROM reviews WHERE reviewId = ? AND shopId = ?';
    const existing = await db.get(checkQuery, [reviewId, shopId]);
    
    if (!existing) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    const reviewMemberId = String(USE_POSTGRES ? existing.member_id : existing.memberId);
    const isReviewAuthor = reviewMemberId === req.authMemberId;

    if (!isAdminRole(req.authRole) && !isReviewAuthor) {
      const shopRow = await db.get(
        USE_POSTGRES
          ? 'SELECT owner_id, created_by FROM shops WHERE shop_id = $1'
          : 'SELECT ownerId, createdBy FROM shops WHERE shopId = ?',
        [shopId]
      );
      if (!shopRow) {
        return res.status(404).json({ error: 'Shop not found' });
      }
      const ownerId = String(USE_POSTGRES ? shopRow.owner_id : shopRow.ownerId || '');
      const createdBy = String(USE_POSTGRES ? shopRow.created_by : shopRow.createdBy || '');
      const isShopOwner = req.authMemberId === ownerId || req.authMemberId === createdBy;
      if (!isShopOwner) {
        return res.status(403).json({ error: '후기를 삭제할 권한이 없습니다.' });
      }
    }
    
    // Soft delete: status를 'removed'로 변경
    const now = new Date().toISOString();
    const updateQuery = USE_POSTGRES
      ? 'UPDATE reviews SET status = $1, updated_at = $2 WHERE review_id = $3'
      : 'UPDATE reviews SET status = ?, updatedAt = ? WHERE reviewId = ?';
    await db.run(updateQuery, ['removed', now, reviewId]);

    // update-on-write: shops.rating / review_count 즉시 반영
    if (USE_POSTGRES) {
      await db.query(
        `UPDATE shops SET
          rating = (SELECT ROUND(AVG(r.rating)::numeric,1) FROM reviews r WHERE r.shop_id=$1 AND r.status='visible'),
          review_count = (SELECT COUNT(*) FROM reviews r WHERE r.shop_id=$1 AND r.status='visible')
         WHERE shop_id = $1`,
        [shopId]
      );
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting review:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SHOP EVENTS API
// ============================================

// 날짜 정규화 헬퍼
function normalizeDateStr(val) {
  if (!val) return null;
  if (val instanceof Date) {
    const d = val;
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`;
  }
  return String(val).split('T')[0];
}

function isShopEventActive(startDate, endDate, targetDate) {
  const start = normalizeDateStr(startDate);
  const end = normalizeDateStr(endDate);
  const target = normalizeDateStr(targetDate);
  if (!start || !end || !target) return false;
  return start <= target && end >= target;
}

// GET /api/shop-events — 전체 또는 필터 조회
// ?shopId=xxx : 특정 상점 이벤트만
// ?active=true : 진행 중인 이벤트만 (현재 날짜가 start~end 사이) + status='approved'
// ?status=pending|approved|rejected : 상태 필터 (관리자용)
app.get('/api/shop-events', async (req, res) => {
  try {
    const { shopId, active, status } = req.query;
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    let rows;
    if (USE_POSTGRES) {
      let sql = `SELECT se.*, s.name AS shop_name, s.category AS shop_category, s.thumbnail AS shop_thumbnail
                 FROM shop_events se
                 LEFT JOIN shops s ON s.shop_id = se.shop_id
                 WHERE 1=1`;
      const params = [];
      if (shopId) { params.push(shopId); sql += ` AND se.shop_id = $${params.length}`; }
      if (active === 'true') {
        sql += ` AND se.status = 'approved'`;
      } else if (status) {
        params.push(status); sql += ` AND se.status = $${params.length}`;
      }
      sql += ` ORDER BY se.updated_at DESC NULLS LAST, se.created_at DESC`;
      rows = await db.query(sql, params);
    } else {
      let sql = `SELECT se.*, s.name AS shop_name, s.category AS shop_category, s.thumbnail AS shop_thumbnail
                 FROM shop_events se
                 LEFT JOIN shops s ON s.shopId = se.shop_id
                 WHERE 1=1`;
      const params = [];
      if (shopId) { params.push(shopId); sql += ` AND se.shop_id = ?`; }
      if (active === 'true') {
        sql += ` AND se.status = 'approved'`;
      } else if (status) {
        params.push(status); sql += ` AND se.status = ?`;
      }
      sql += ` ORDER BY se.updated_at DESC, se.created_at DESC`;
      rows = await db.query(sql, params);
    }

    let normalizedRows = Array.isArray(rows) ? rows : [];
    if (active === 'true') {
      normalizedRows = normalizedRows.filter((row) => isShopEventActive(row.start_date || row.startDate, row.end_date || row.endDate, today));
    }
    if (active === 'true' && !shopId) {
      const seenShopIds = new Set();
      normalizedRows = normalizedRows.filter((row) => {
        const currentShopId = String(row.shop_id || row.shopId || '');
        if (!currentShopId) return true;
        if (seenShopIds.has(currentShopId)) return false;
        seenShopIds.add(currentShopId);
        return true;
      });
    }

    const normalized = normalizedRows.map(r => ({
      eventId: r.event_id,
      shopId: r.shop_id,
      title: r.title,
      content: r.content,
      imageUrl: r.image_url,
      startDate: normalizeDateStr(r.start_date),
      endDate: normalizeDateStr(r.end_date),
      status: r.status || 'pending',
      rejectReason: r.reject_reason || null,
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      shopName: r.shop_name,
      shopCategory: r.shop_category,
      shopThumbnail: r.shop_thumbnail,
    }));
    res.json(normalized);
  } catch (err) {
    logger.error('GET /api/shop-events error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop-events — 이벤트 등록 (로그인 필요 + 상점 소유자 또는 관리자)
app.post('/api/shop-events', requireAuth, async (req, res) => {
  try {
    const { shopId, title, content, imageUrl, startDate, endDate } = req.body;
    if (!shopId) return res.status(400).json({ error: 'shopId required' });
    if (!title) return res.status(400).json({ error: 'title required' });
    if (!startDate || !endDate) return res.status(400).json({ error: 'startDate and endDate required' });

    // 권한 확인: 상점 소유자 또는 관리자
    if (!isAdminRole(req.authRole)) {
      const shop = await db.get(
        USE_POSTGRES
          ? 'SELECT owner_id, created_by FROM shops WHERE shop_id = $1'
          : 'SELECT ownerId, createdBy FROM shops WHERE shopId = ?',
        [shopId]
      );
      if (!shop) return res.status(404).json({ error: '상점을 찾을 수 없습니다.' });
      const ownerId = USE_POSTGRES ? shop.owner_id : shop.ownerId;
      const createdBy = USE_POSTGRES ? shop.created_by : shop.createdBy;
      if (String(ownerId) !== String(req.authMemberId) && String(createdBy) !== String(req.authMemberId)) {
        return res.status(403).json({ error: '이벤트를 등록할 권한이 없습니다.' });
      }
    }

    const eventId = `SEVT_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO shop_events(event_id, shop_id, title, content, image_url, start_date, end_date, status, created_by, created_at, updated_at)
         VALUES($1,$2,$3,$4,$5,$6,$7,'pending',$8,$9,$10)`,
        [eventId, shopId, title, content||'', imageUrl||null, startDate, endDate, req.authMemberId, now, now]
      );
    } else {
      await db.run(
        `INSERT INTO shop_events(event_id, shop_id, title, content, image_url, start_date, end_date, status, created_by, created_at, updated_at)
         VALUES(?,?,?,?,?,?,?,'pending',?,?,?)`,
        [eventId, shopId, title, content||'', imageUrl||null, startDate, endDate, req.authMemberId, now, now]
      );
    }
    res.json({ ok: true, eventId });
  } catch (err) {
    logger.error('POST /api/shop-events error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/shop-events/:id — 이벤트 수정
app.put('/api/shop-events/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const { title, content, imageUrl, startDate, endDate } = req.body;

    // 권한 확인
    const existing = await db.get(
      USE_POSTGRES
        ? 'SELECT created_by, shop_id FROM shop_events WHERE event_id = $1'
        : 'SELECT created_by, shop_id FROM shop_events WHERE event_id = ?',
      [eventId]
    );
    if (!existing) return res.status(404).json({ error: '이벤트를 찾을 수 없습니다.' });
    if (!isAdminRole(req.authRole) && String(existing.created_by) !== String(req.authMemberId)) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE shop_events SET
           title = COALESCE($1, title),
           content = COALESCE($2, content),
           image_url = COALESCE($3, image_url),
           start_date = COALESCE($4, start_date),
           end_date = COALESCE($5, end_date),
           updated_at = $6
         WHERE event_id = $7`,
        [title??null, content??null, imageUrl??null, startDate??null, endDate??null, now, eventId]
      );
    } else {
      await db.run(
        `UPDATE shop_events SET
           title = COALESCE(?, title),
           content = COALESCE(?, content),
           image_url = COALESCE(?, image_url),
           start_date = COALESCE(?, start_date),
           end_date = COALESCE(?, end_date),
           updated_at = ?
         WHERE event_id = ?`,
        [title??null, content??null, imageUrl??null, startDate??null, endDate??null, now, eventId]
      );
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error('PUT /api/shop-events/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/shop-events/:id — 이벤트 삭제
app.delete('/api/shop-events/:id', requireAuth, async (req, res) => {
  try {
    const eventId = req.params.id;
    const existing = await db.get(
      USE_POSTGRES
        ? 'SELECT created_by FROM shop_events WHERE event_id = $1'
        : 'SELECT created_by FROM shop_events WHERE event_id = ?',
      [eventId]
    );
    if (!existing) return res.status(404).json({ error: '이벤트를 찾을 수 없습니다.' });
    if (!isAdminRole(req.authRole) && String(existing.created_by) !== String(req.authMemberId)) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }
    await db.run(
      USE_POSTGRES ? 'DELETE FROM shop_events WHERE event_id = $1' : 'DELETE FROM shop_events WHERE event_id = ?',
      [eventId]
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error('DELETE /api/shop-events/:id error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/shop-events/:id/status — 이벤트 승인/반려 (관리자 전용)
app.patch('/api/shop-events/:id/status', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) return res.status(403).json({ error: '관리자만 상태를 변경할 수 있습니다.' });
    const eventId = req.params.id;
    const { status, rejectReason } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ error: 'status는 approved, rejected, pending 중 하나여야 합니다.' });
    }
    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE shop_events SET status=$1, reject_reason=$2, updated_at=$3 WHERE event_id=$4`,
        [status, rejectReason||null, now, eventId]
      );
    } else {
      await db.run(
        `UPDATE shop_events SET status=?, reject_reason=?, updated_at=? WHERE event_id=?`,
        [status, rejectReason||null, now, eventId]
      );
    }
    res.json({ ok: true, eventId, status });
  } catch (err) {
    logger.error('PATCH /api/shop-events/:id/status error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shop-events/:id/image — 이벤트 이미지 업로드
app.post('/api/shop-events/:id/image', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!req.file) return res.status(400).json({ error: '파일이 없습니다.' });

    const existing = await db.get(
      USE_POSTGRES
        ? 'SELECT created_by FROM shop_events WHERE event_id = $1'
        : 'SELECT created_by FROM shop_events WHERE event_id = ?',
      [eventId]
    );
    if (!existing) return res.status(404).json({ error: '이벤트를 찾을 수 없습니다.' });
    if (!isAdminRole(req.authRole) && String(existing.created_by) !== String(req.authMemberId)) {
      return res.status(403).json({ error: '권한이 없습니다.' });
    }

    const imageUrl = `/uploads/banners/${req.file.filename}`;
    await db.run(
      USE_POSTGRES
        ? 'UPDATE shop_events SET image_url=$1, updated_at=$2 WHERE event_id=$3'
        : 'UPDATE shop_events SET image_url=?, updated_at=? WHERE event_id=?',
      [imageUrl, new Date().toISOString(), eventId]
    );
    res.json({ ok: true, imageUrl });
  } catch (err) {
    logger.error('POST /api/shop-events/:id/image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// SHOP POINTS & PAYOUT API (for shop owners)
// ============================================

// GET /api/shops/:shopId/points/earned - 상점별 총 적립 포인트 조회
app.get('/api/shops/:shopId/points/earned', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    // 테이블이 없는 경우 0 반환
    const result = await db.get(
      USE_POSTGRES
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM shop_earnings WHERE shop_id = $1 AND status != 'cancelled'`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM shop_earnings WHERE shop_id = ? AND status != 'cancelled'`,
      [shopId]
    );
    
    res.json({ shopId, totalEarned: result?.total || 0 });
  } catch (err) {
    logger.error('Error fetching shop earned points:', err);
    // 테이블이 없어도 정상 동작하도록 0 반환
    res.json({ shopId: req.params.shopId, totalEarned: 0 });
  }
});

// GET /api/shops/:shopId/points/available - 상점별 가용 잔액 (총 적립 - 지급완료 - PENDING)
app.get('/api/shops/:shopId/points/available', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const earned = await db.get(
      USE_POSTGRES
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM shop_earnings WHERE shop_id = $1 AND status != 'cancelled'`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM shop_earnings WHERE shop_id = ? AND status != 'cancelled'`,
      [shopId]
    );
    
    // ✅ FIX: PAID + PENDING 모두 차감 (지급 대기 중인 금액도 사용 불가)
    const withdrawn = await db.get(
      USE_POSTGRES
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM shop_payout_requests WHERE shop_id = $1 AND status IN ('PAID', 'PENDING')`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM shop_payout_requests WHERE shop_id = ? AND status IN ('PAID', 'PENDING')`,
      [shopId]
    );
    
    const available = (earned?.total || 0) - (withdrawn?.total || 0);
    res.json({ shopId, available });
  } catch (err) {
    logger.error('Error fetching shop available points:', err);
    res.json({ shopId: req.params.shopId, available: 0 });
  }
});

// GET /api/shops/:shopId/points/ledger - 상점 적립 원장 조회
app.get('/api/shops/:shopId/points/ledger', async (req, res) => {
  try {
    const { shopId } = req.params;
    const limit = Math.max(1, Math.min(parseInt(req.query.limit, 10) || 20, 100));
    const rows = await db.query(
      USE_POSTGRES
        ? `SELECT se.earning_id, se.shop_id, se.shop_name, se.amount, se.source_tx_id, se.buyer_member_id, se.status, se.created_at,
                  se.created_at AT TIME ZONE 'UTC' AS created_at_utc,
                  m.name AS buyer_name, m.phone AS buyer_phone
             FROM shop_earnings se
             LEFT JOIN members m ON se.buyer_member_id = m.member_id::text
            WHERE se.shop_id = $1
            ORDER BY se.created_at DESC
            LIMIT $2`
        : `SELECT se.earning_id, se.shop_id, se.shop_name, se.amount, se.source_tx_id, se.buyer_member_id, se.status, se.created_at,
                  m.name AS buyer_name, m.phone AS buyer_phone
             FROM shop_earnings se
             LEFT JOIN members m ON se.buyer_member_id = m.memberId
            WHERE se.shop_id = ?
            ORDER BY se.created_at DESC
            LIMIT ?`,
      [shopId, limit]
    );

    const ledger = (rows || []).map((row) => ({
      earningId: row.earning_id,
      shopId: row.shop_id,
      shopName: row.shop_name,
      amount: Number(row.amount || 0),
      sourceTxId: row.source_tx_id,
      buyerMemberId: row.buyer_member_id,
      buyerName: row.buyer_name || '',
      buyerPhone: row.buyer_phone || '',
      status: row.status,
      createdAt: row.created_at_utc || row.created_at,
    }));

    res.json({ ok: true, success: true, shopId, ledger });
  } catch (err) {
    logger.error('Error fetching shop points ledger:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shops/:shopId/payout-requests - 지급요청 목록 조회
app.get('/api/shops/:shopId/payout-requests', async (req, res) => {
  try {
    const { shopId } = req.params;
    
    const rows = await db.query(
      USE_POSTGRES
        ? `SELECT *, requested_at AT TIME ZONE 'UTC' AS requested_at_utc FROM shop_payout_requests WHERE shop_id = $1 ORDER BY requested_at DESC`
        : `SELECT * FROM shop_payout_requests WHERE shop_id = ? ORDER BY requested_at DESC`,
      [shopId]
    );
    
    const requests = (rows || []).map((row) => USE_POSTGRES ? ({
      ...row,
      requested_at: row.requested_at_utc || row.requested_at,
      requestedAt: row.requested_at_utc || row.requested_at,
    }) : row);
    res.json({ ok: true, success: true, shopId, requests });
  } catch (err) {
    logger.error('Error fetching payout requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/shops/:shopId/payout-requests - 지급요청 생성
app.post('/api/shops/:shopId/payout-requests', async (req, res) => {
  try {
    const { shopId } = req.params;
    const { amount, bankName, accountNumber, depositorName, memo, storeName, ownerName } = req.body || {};
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Valid amount required' });
    }
    
    if (!bankName || !accountNumber || !depositorName) {
      return res.status(400).json({ error: 'Bank information required' });
    }

    // 가용 잔액 검증 (CRITICAL FIX — Phase 2)
    const earned = await db.get(
      USE_POSTGRES
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM shop_earnings WHERE shop_id = $1 AND status != 'cancelled'`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM shop_earnings WHERE shop_id = ? AND status != 'cancelled'`,
      [shopId]
    );
    
    const pendingPaid = await db.get(
      USE_POSTGRES
        ? `SELECT COALESCE(SUM(amount), 0) as total FROM shop_payout_requests WHERE shop_id = $1 AND status IN ('PAID', 'PENDING')`
        : `SELECT COALESCE(SUM(amount), 0) as total FROM shop_payout_requests WHERE shop_id = ? AND status IN ('PAID', 'PENDING')`,
      [shopId]
    );
    
    const totalEarned = Number(earned?.total || 0);
    const totalReserved = Number(pendingPaid?.total || 0);
    const available = totalEarned - totalReserved;
    
    if (amount > available) {
      return res.status(400).json({ 
        error: '지급 가능 금액을 초과했습니다.',
        requested: amount,
        available,
        totalEarned,
        totalReserved
      });
    }
    
    const requestId = `PAYOUT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();
    
    let sql = null;
    let params = null;

    if (USE_POSTGRES) {
      const query = `
        INSERT INTO shop_payout_requests(request_id, shop_id, amount, bank_name, account_number, depositor_name, memo, status, requested_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      sql = query;
      params = [
        requestId,
        shopId,
        amount,
        bankName,
        accountNumber,
        depositorName,
        memo || '',
        'PENDING',
        now,
        now
      ];
      const rows = await db.query(sql, params);
      logForensicWrite({ route: `/api/shops/${shopId}/payout-requests`, method: 'POST', body: req.body || {}, sql, params, dbResult: null, result: { ok: true, success: true, id: requestId } });
      res.json({ ok: true, success: true, id: requestId, request: rows[0] });
    } else {
      const query = `
        INSERT INTO shop_payout_requests(request_id, shop_id, amount, bank_name, account_number, depositor_name, memo, status, requested_at, updated_at)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      sql = query;
      params = [
        requestId,
        shopId,
        amount,
        bankName,
        accountNumber,
        depositorName,
        memo || '',
        'PENDING',
        now,
        now
      ];
      const dbResult = await db.run(sql, params);
      logForensicWrite({ route: `/api/shops/${shopId}/payout-requests`, method: 'POST', body: req.body || {}, sql, params, dbResult, result: { ok: true, success: true, id: requestId } });
      res.json({ ok: true, success: true, id: requestId, requestId });
    }
  } catch (err) {
    logger.error('Error creating payout request:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN PAYOUT API (for admin console)
// ============================================

// GET /api/admin/payout-requests - 전체 지급요청 조회 (Admin 전용)
app.get('/api/admin/payout-requests', async (req, res) => {
  try {
    const { status } = req.query;
    
    let query, params;
    if (status && status !== 'ALL') {
      query = USE_POSTGRES
        ? `SELECT pr.*, s.name as shop_name, s.owner_id 
           FROM shop_payout_requests pr 
           LEFT JOIN shops s ON pr.shop_id = s.shop_id 
           WHERE pr.status = $1 
           ORDER BY pr.requested_at DESC`
        : `SELECT pr.*, s.name as shop_name, s.ownerId as owner_id
           FROM shop_payout_requests pr 
           LEFT JOIN shops s ON pr.shop_id = s.shopId
           WHERE pr.status = ? 
           ORDER BY pr.requested_at DESC`;
      params = [status];
    } else {
      query = USE_POSTGRES
        ? `SELECT pr.*, s.name as shop_name, s.owner_id 
           FROM shop_payout_requests pr 
           LEFT JOIN shops s ON pr.shop_id = s.shop_id 
           ORDER BY pr.requested_at DESC`
        : `SELECT pr.*, s.name as shop_name, s.ownerId as owner_id
           FROM shop_payout_requests pr 
           LEFT JOIN shops s ON pr.shop_id = s.shopId
           ORDER BY pr.requested_at DESC`;
      params = [];
    }
    
    const rows = await db.query(query, params);
    res.json({ ok: true, requests: rows || [] });
  } catch (err) {
    logger.error('Error fetching admin payout requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/admin/payout-requests/:id/complete - 지급 완료 처리 (Issue 2(B-2): return PAID status)
app.put('/api/admin/payout-requests/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const { adminId, adminNote } = req.body || {};
    
    const now = new Date().toISOString();
    
    // PAID 상태로 변경 (UI는 PAID 기준으로 필터링)
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE shop_payout_requests 
         SET status = $1, processed_at = $2, handled_by = $3, updated_at = $4
         WHERE request_id = $5`,
        ['PAID', now, adminId || 'admin', now, id]
      );
    } else {
      await db.run(
        `UPDATE shop_payout_requests 
         SET status = ?, processed_at = ?, handled_by = ?, updated_at = ?
         WHERE request_id = ?`,
        ['PAID', now, adminId || 'admin', now, id]
      );
    }
    
    // Issue 2(B-2): 업데이트된 객체 조회 후 반환
    const updated = await db.get(
      USE_POSTGRES
        ? `SELECT pr.*, s.name as shop_name FROM shop_payout_requests pr LEFT JOIN shops s ON pr.shop_id = s.shop_id WHERE pr.request_id = $1`
        : `SELECT pr.*, s.name as shop_name FROM shop_payout_requests pr LEFT JOIN shops s ON pr.shop_id = s.shopId WHERE pr.request_id = ?`,
      [id]
    );
    
    logger.info(`Payout request completed: requestId=${id}, admin=${adminId || 'admin'}, status=PAID`);
    res.json({ ok: true, status: 'PAID', completedAt: now, updated });
  } catch (err) {
    logger.error('Error completing payout request:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN POINTS API (Issue 3-A, 3-B)
// ============================================

// GET /api/admin/points/transactions - 포인트 이력 기본 로딩 (Issue 3-A)
app.get('/api/admin/points/transactions', async (req, res) => {
  try {
    const { memberId, limit = 100, offset = 0 } = req.query;
    
    let query, params;
    if (memberId) {
      query = USE_POSTGRES
      ? `SELECT pl.*, pl.created_at AT TIME ZONE 'UTC' AS created_at_utc,
        COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name, m.phone
        FROM point_ledger pl
        LEFT JOIN members m ON pl.member_id = m.member_id::text
        WHERE pl.member_id = $1
        ORDER BY pl.created_at DESC
           LIMIT $2 OFFSET $3`
      : `SELECT pl.*, COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name, m.phone
        FROM point_ledger pl
        LEFT JOIN members m ON pl.memberId = m.memberId
        WHERE pl.memberId = ?
        ORDER BY pl.createdAt DESC
           LIMIT ? OFFSET ?`;
      params = [memberId, parseInt(limit) || 100, parseInt(offset) || 0];
    } else {
      query = USE_POSTGRES
      ? `SELECT pl.*, pl.created_at AT TIME ZONE 'UTC' AS created_at_utc,
        COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name, m.phone
        FROM point_ledger pl
        LEFT JOIN members m ON pl.member_id = m.member_id::text
        ORDER BY pl.created_at DESC
           LIMIT $1 OFFSET $2`
      : `SELECT pl.*, COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name, m.phone
        FROM point_ledger pl
        LEFT JOIN members m ON pl.memberId = m.memberId
        ORDER BY pl.createdAt DESC
           LIMIT ? OFFSET ?`;
      params = [parseInt(limit) || 100, parseInt(offset) || 0];
    }
    
    const rows = await db.query(query, params);
    
    const transactions = (rows || []).map(t => USE_POSTGRES ? {
    id: t.ledger_id,
    transactionId: t.ledger_id,
      memberId: t.member_id,
    memberName: t.member_name || t.user_name || '',
    userName: t.member_name || t.user_name || '',
      type: t.type,
      amount: t.amount,
      description: t.description,
      createdAt: t.created_at_utc || t.created_at,
    status: t.status,
      phone: t.phone
    } : {
    id: t.ledgerId,
    transactionId: t.ledgerId,
      memberId: t.memberId,
    memberName: t.member_name || t.user_name || '',
    userName: t.member_name || t.user_name || '',
      type: t.type,
      amount: t.amount,
      description: t.description,
      createdAt: t.createdAt,
    status: t.status,
      phone: t.phone
    });
    
    res.json({ ok: true, transactions });
  } catch (err) {
    logger.error('Error fetching point transactions:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// PAYOUT REQUESTS (existing code below)
// ============================================

// GET /api/payout-requests?shopId=... - contract: { requests: [...] }
app.get('/api/payout-requests', async (req, res) => {
  try {
    const shopId = req.query.shopId;
    if (!shopId) return res.status(400).json({ error: 'shopId required' });
    const rows = await db.query(
      USE_POSTGRES
        ? `SELECT * FROM shop_payout_requests WHERE shop_id = $1 ORDER BY requested_at DESC`
        : `SELECT * FROM shop_payout_requests WHERE shop_id = ? ORDER BY requested_at DESC`,
      [shopId]
    );
    res.json({ ok: true, success: true, shopId, requests: rows || [] });
  } catch (err) {
    logger.error('Error fetching payout requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payout-requests - body: { shopId, amount, reason }
app.post('/api/payout-requests', async (req, res) => {
  try {
    const memberId = req.headers['x-member-id'] ? String(req.headers['x-member-id']) : null;
    const { shopId, amount, reason } = req.body || {};
    const amt = Number(amount);
    if (!shopId) return res.status(400).json({ error: 'shopId required' });
    if (!Number.isFinite(amt) || amt <= 0) return res.status(400).json({ error: 'valid amount required' });
    if (!reason || !String(reason).trim()) return res.status(400).json({ error: 'reason required' });

    await assertShopOwnerOrThrow(String(shopId), memberId);

    const requestId = `PAYOUT_${Date.now()}_${Math.floor(Math.random() * 10000)}`;
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO shop_payout_requests(request_id, shop_id, amount, memo, status, requested_at, updated_at)
         VALUES($1, $2, $3, $4, 'PENDING', $5, $6)`
        , [requestId, shopId, Math.trunc(amt), String(reason).trim(), now, now]
      );
    } else {
      await db.run(
        `INSERT INTO shop_payout_requests(request_id, shop_id, amount, memo, status, requested_at, updated_at)
         VALUES(?, ?, ?, ?, 'PENDING', ?, ?)`
        , [requestId, shopId, Math.trunc(amt), String(reason).trim(), now, now]
      );
    }

    res.json({ ok: true, success: true, id: requestId, requestId });
  } catch (err) {
    logger.error('Error creating payout request:', err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// ============================================
// MISSIONS API
// ============================================

function normalizeMissionRow(row) {
  if (!row) return null;
  const missionId = USE_POSTGRES ? row.mission_id : row.missionId;
  const participantsRaw = USE_POSTGRES ? row.participants : row.participants;
  let participants = [];
  if (USE_POSTGRES) {
    // pg: JSONB may already be object/array
    if (Array.isArray(participantsRaw)) participants = participantsRaw;
    else if (participantsRaw && typeof participantsRaw === 'object') participants = participantsRaw;
    else participants = [];
  } else {
    try {
      participants = participantsRaw ? JSON.parse(participantsRaw) : [];
      if (!Array.isArray(participants)) participants = [];
    } catch (e) {
      participants = [];
    }
  }
  // Issue C-1: participantsCount from JOIN
  const participantsCount = parseInt(row.participants_count || row.participantsCount) || 0;
  
  // regionIds 처리
  let regionIds = [];
  const regionIdsRaw = USE_POSTGRES ? row.region_ids : row.regionIds;
  if (USE_POSTGRES) {
    if (Array.isArray(regionIdsRaw)) regionIds = regionIdsRaw;
    else regionIds = [];
  } else {
    try {
      regionIds = regionIdsRaw ? JSON.parse(regionIdsRaw) : [];
      if (!Array.isArray(regionIds)) regionIds = [];
    } catch (e) {
      regionIds = [];
    }
  }
  
  // 날짜 변환: TIMESTAMP를 YYYY-MM-DD 문자열로 (타임존 고려)
  let startDate = null;
  let endDate = null;
  if (row.start_date) {
    if (row.start_date instanceof Date) {
      // UTC Date 객체를 로컬 날짜 문자열로 변환 (타임존 보정)
      const d = new Date(row.start_date);
      startDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    } else {
      startDate = String(row.start_date).split('T')[0];
    }
  }
  if (row.end_date) {
    if (row.end_date instanceof Date) {
      const d = new Date(row.end_date);
      endDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
    } else {
      endDate = String(row.end_date).split('T')[0];
    }
  }

  const images = normalizeContentImages(row.images);
  const primaryRegionId = USE_POSTGRES
    ? (row.region_id || regionIds[0] || null)
    : (row.regionId || regionIds[0] || null);
  const regionScope = USE_POSTGRES ? row.region_scope : row.regionScope;
  const normalizedRegionName = row.region_name || row.regionName || row.region || null;
  
  return {
    id: missionId,
    regionId: primaryRegionId,
    regionName: normalizedRegionName || (String(regionScope || '').trim().toUpperCase() === 'ALL' ? '전체 지역' : null),
    missionId,
    title: row.title,
    description: row.description,
    category: row.category || 'general',
    points: row.points,
    rewardType: USE_POSTGRES ? (row.reward_type || 'points') : (row.rewardType || 'points'),
    type: row.type,
    status: row.status,
    maxParticipants: USE_POSTGRES ? row.max_participants : row.maxParticipants,
    startDate,
    endDate,
    regionScope,
    regionIds,
    images,
    participants,
    participantsCount,
    createdBy: USE_POSTGRES ? row.created_by : row.createdBy,
    createdAt: USE_POSTGRES ? row.created_at : row.createdAt,
    updatedAt: USE_POSTGRES ? row.updated_at : row.updatedAt,
  };
}

// GET /api/missions (Issue 4-B: participantsCount 필드 통일)
app.get('/api/missions', async (req, res) => {
  try {
    const status = req.query.status || null;
    const regionId = req.query.regionId || null;
    const districtId = req.query.districtId || null;
    let query;
    let params = [];
    if (USE_POSTGRES) {
      query = `
        SELECT m.*, COUNT(p.participation_id) as participants_count,
          (SELECT COUNT(DISTINCT p2.participation_id)
           FROM participations p2
           JOIN members mem2 ON p2.member_id = CAST(mem2.member_id AS TEXT)
           WHERE (p2.item_key = 'mission:' || CAST(m.mission_id AS TEXT)
                  OR p2.item_key = CAST(m.mission_id AS TEXT)
                  OR p2.item_key LIKE 'mission:' || CAST(m.mission_id AS TEXT) || ':%')
             AND (p2.item_type IS NULL OR p2.item_type = '' OR LOWER(p2.item_type) = 'mission')
             AND NOT (mem2.region_id = ANY(m.region_ids))) AS ext_participants_count
        FROM missions m
        LEFT JOIN participations p ON (
          (p.item_key = 'mission:' || CAST(m.mission_id AS TEXT)
           OR p.item_key = CAST(m.mission_id AS TEXT)
           OR p.item_key LIKE 'mission:' || CAST(m.mission_id AS TEXT) || ':%')
          AND (p.item_type IS NULL OR p.item_type = '' OR LOWER(p.item_type) = 'mission'))
        WHERE 1=1
      `;
      if (status) {
        params.push(status);
        query += ` AND m.status = $${params.length}`;
      }
      if (regionId) {
        params.push(regionId);
        query += ` AND (m.region_id = $${params.length} OR $${params.length} = ANY(m.region_ids))`;
        if (districtId) {
          params.push(districtId);
          query += ` AND m.district_id = $${params.length}`;
        }
      }
      query += ` GROUP BY m.mission_id ORDER BY
        CASE WHEN m.end_date IS NULL THEN 0 ELSE 1 END ASC,
        m.end_date DESC NULLS FIRST,
        m.created_at DESC`;
    } else {
      // SQLite: participations table uses itemKey = 'mission:{missionId}' pattern
      query = `
        SELECT m.*, COUNT(p.participationId) as participantsCount
        FROM missions m
        LEFT JOIN participations p ON (
          (p.itemKey = 'mission:' || m.missionId
           OR p.itemKey = m.missionId
           OR p.itemKey LIKE 'mission:' || m.missionId || ':%')
          AND p.itemType = 'mission')
        WHERE 1=1
      `;
      if (status) {
        query += ' AND m.status = ?';
        params.push(status);
      }
      if (regionId) {
        query += ` AND (m.regionId = ? OR m.regionIds LIKE '%"' || ? || '"%')`;
        params.push(regionId);
        params.push(regionId);
        if (districtId) {
          query += ` AND m.district_id = ?`;
          params.push(districtId);
        }
      }
      query += ` GROUP BY m.missionId ORDER BY
        CASE WHEN m.endDate IS NULL THEN 0 ELSE 1 END ASC,
        m.endDate DESC,
        m.createdAt DESC`;
    }

    const rows = await db.query(query, params);
    const missions = (rows || []).map(row => {
      const normalized = normalizeMissionRow(row);
      // 참여자 수 필드 통일: participantsCount로 강제 (pg: participants_count, sqlite: participantsCount)
      const rawCount = row.participants_count ?? row.participantsCount ?? row.participantscount;
      if (normalized && rawCount !== undefined) {
        normalized.participantsCount = parseInt(rawCount) || 0;
      }
      const rawExtCount = row.ext_participants_count ?? row.extParticipantsCount;
      if (normalized) {
        normalized.extParticipantsCount = parseInt(rawExtCount || 0) || 0;
      }
      return normalized;
    }).filter(Boolean);
    res.json({ missions });
  } catch (err) {
    logger.error('Error fetching missions:', err);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// 지역 게시판 API
// ────────────────────────────────────────────────────────────

// GET /api/boards?regionId=
app.get('/api/boards', async (req, res) => {
  try {
    const regionId = req.query.regionId || null;
    let query;
    let params = [];
    if (USE_POSTGRES) {
      if (regionId) {
        query = `
          SELECT b.*,
            (SELECT COUNT(*) FROM board_comments c WHERE c.board_id = b.board_id) AS comment_count
          FROM boards b
          WHERE b.region_id = $1
          ORDER BY b.created_at DESC LIMIT 100`;
        params = [regionId];
      } else {
        query = `
          SELECT b.*,
            (SELECT COUNT(*) FROM board_comments c WHERE c.board_id = b.board_id) AS comment_count
          FROM boards b
          ORDER BY b.created_at DESC LIMIT 100`;
      }
    } else {
      if (regionId) {
        query = `SELECT * FROM boards WHERE regionId = ? ORDER BY createdAt DESC LIMIT 100`;
        params = [regionId];
      } else {
        query = `SELECT * FROM boards ORDER BY createdAt DESC LIMIT 100`;
      }
    }
    const rows = await db.query(query, params);
    const posts = (rows || []).map(row => ({
      id: row.board_id || row.boardId,
      regionId: row.region_id || row.regionId,
      authorId: row.author_id || row.authorId,
      authorName: row.author_name || row.authorName || '익명',
      title: row.title,
      content: row.content,
      category: row.category || 'general',
      createdAt: row.created_at || row.createdAt,
      commentCount: Number(row.comment_count || 0),
      likeCount: Number(row.like_count || 0),
    })).filter(Boolean);
    res.json({ posts });
  } catch (err) {
    logger.error('Error fetching boards:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/boards (작성 — 로그인 사용자)
app.post('/api/boards', requireAuth, async (req, res) => {
  try {
    const { regionId, title, content, category } = req.body;
    if (!regionId || !title) {
      return res.status(400).json({ error: 'regionId, title은 필수입니다.' });
    }
    const authorId = req.authMemberId;
    const authorName = req.authName || '익명';
    let newPost;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `INSERT INTO boards (region_id, author_id, author_name, title, content, category)
         VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
        [regionId, authorId, authorName, title, content || '', category || 'general']
      );
      newPost = rows && rows[0];
    } else {
      const id = `board_${Date.now()}`;
      await db.run(
        `INSERT INTO boards (boardId, regionId, authorId, authorName, title, content, category) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, regionId, authorId, authorName, title, content || '', category || 'general']
      );
      newPost = { boardId: id, regionId, title, content, category, authorId, authorName };
    }
    res.status(201).json({ post: newPost });
  } catch (err) {
    logger.error('Error creating board post:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/boards/:id (단건 조회)
app.get('/api/boards/:id', async (req, res) => {
  try {
    const id = req.params.id;
    let row;
    if (USE_POSTGRES) {
      const rows = await db.query(`SELECT * FROM boards WHERE board_id = $1`, [id]);
      row = rows && rows[0];
    } else {
      const rows = await db.query(`SELECT * FROM boards WHERE boardId = ?`, [id]);
      row = rows && rows[0];
    }
    if (!row) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    res.json({
      post: {
        id: row.board_id || row.boardId,
        regionId: row.region_id || row.regionId,
        authorId: row.author_id || row.authorId,
        authorName: row.author_name || row.authorName || '익명',
        title: row.title,
        content: row.content,
        category: row.category || 'general',
        createdAt: row.created_at || row.createdAt,
        updatedAt: row.updated_at || row.updatedAt,
      }
    });
  } catch (err) {
    logger.error('Error fetching board post:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/boards/:id (수정 — 작성자 또는 관리자)
app.put('/api/boards/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { title, content, category } = req.body;
    if (!title) return res.status(400).json({ error: 'title은 필수입니다.' });

    // 기존 게시글 조회 (작성자 확인용)
    let existing;
    if (USE_POSTGRES) {
      const rows = await db.query(`SELECT * FROM boards WHERE board_id = $1`, [id]);
      existing = rows && rows[0];
    } else {
      const rows = await db.query(`SELECT * FROM boards WHERE boardId = ?`, [id]);
      existing = rows && rows[0];
    }
    if (!existing) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

    const authorId = String(existing.author_id || existing.authorId || '');
    if (!isAdminRole(req.authRole) && req.authMemberId !== authorId) {
      return res.status(403).json({ error: '수정 권한이 없습니다.' });
    }

    if (USE_POSTGRES) {
      await db.query(
        `UPDATE boards SET title=$1, content=$2, category=$3, updated_at=CURRENT_TIMESTAMP WHERE board_id=$4`,
        [title, content || '', category || 'general', id]
      );
    } else {
      await db.run(
        `UPDATE boards SET title=?, content=?, category=?, updatedAt=datetime('now') WHERE boardId=?`,
        [title, content || '', category || 'general', id]
      );
    }
    res.json({ success: true, id });
  } catch (err) {
    logger.error('Error updating board post:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/boards/:id (삭제 — 작성자 본인만)
app.delete('/api/boards/:id', requireAuth, async (req, res) => {
  try {
    const id = req.params.id;

    // 기존 게시글 조회 (작성자 확인용)
    let existing;
    if (USE_POSTGRES) {
      const rows = await db.query(`SELECT * FROM boards WHERE board_id = $1`, [id]);
      existing = rows && rows[0];
    } else {
      const rows = await db.query(`SELECT * FROM boards WHERE boardId = ?`, [id]);
      existing = rows && rows[0];
    }
    if (!existing) return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });

    const authorId = String(existing.author_id || existing.authorId || '');
    if (req.authMemberId !== authorId) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    const q = USE_POSTGRES
      ? `DELETE FROM boards WHERE board_id = $1`
      : `DELETE FROM boards WHERE boardId = ?`;
    await db.run(q, [id]);
    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting board post:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// BOARD COMMENTS API
// ============================================

// GET /api/boards/:id/comments
app.get('/api/boards/:id/comments', async (req, res) => {
  try {
    const boardId = req.params.id;
    let rows;
    if (USE_POSTGRES) {
      rows = await db.query(
        `SELECT * FROM board_comments WHERE board_id = $1 ORDER BY created_at ASC`,
        [boardId]
      );
    } else {
      rows = await db.query(
        `SELECT * FROM board_comments WHERE boardId = ? ORDER BY createdAt ASC`,
        [boardId]
      );
    }
    const comments = (rows || []).map(r => ({
      id: String(r.comment_id || r.commentId),
      boardId: String(r.board_id || r.boardId),
      authorId: r.author_id || r.authorId || null,
      authorName: r.author_name || r.authorName || '익명',
      content: r.content,
      createdAt: r.created_at || r.createdAt,
    }));
    res.json({ comments });
  } catch (err) {
    logger.error('Error fetching board comments:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/boards/:id/comments (작성 — 로그인 사용자)
app.post('/api/boards/:id/comments', requireAuth, async (req, res) => {
  try {
    const boardId = req.params.id;
    const { content } = req.body;
    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    }
    const authorId = req.authMemberId;
    const authorName = req.authName || '익명';
    let newId;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `INSERT INTO board_comments (board_id, author_id, author_name, content) VALUES ($1, $2, $3, $4) RETURNING comment_id`,
        [boardId, authorId, authorName, content.trim()]
      );
      newId = rows && rows[0]?.comment_id;
    } else {
      const result = await db.run(
        `INSERT INTO board_comments (boardId, authorId, authorName, content) VALUES (?, ?, ?, ?)`,
        [boardId, authorId, authorName, content.trim()]
      );
      newId = result?.lastID;
    }
    res.status(201).json({ ok: true, id: String(newId) });
  } catch (err) {
    logger.error('Error adding board comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/boards/:id/comments/:commentId (삭제 — 작성자 본인만)
app.delete('/api/boards/:id/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const { id: boardId, commentId } = req.params;

    let existing;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `SELECT * FROM board_comments WHERE comment_id = $1 AND board_id = $2`,
        [commentId, boardId]
      );
      existing = rows && rows[0];
    } else {
      const rows = await db.query(
        `SELECT * FROM board_comments WHERE commentId = ? AND boardId = ?`,
        [commentId, boardId]
      );
      existing = rows && rows[0];
    }
    if (!existing) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });

    const authorId = String(existing.author_id || existing.authorId || '');
    if (req.authMemberId !== authorId) {
      return res.status(403).json({ error: '삭제 권한이 없습니다.' });
    }

    const q = USE_POSTGRES
      ? `DELETE FROM board_comments WHERE comment_id = $1`
      : `DELETE FROM board_comments WHERE commentId = ?`;
    await db.run(q, [commentId]);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting board comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// UNIFIED SEARCH API
// ────────────────────────────────────────────────────────────

// GET /api/search?q=검색어&types=shops,missions,boards,notices,events,auditions,broadcasts,regions
app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const typesParam = req.query.types || 'shops,missions,boards,notices,events,auditions,broadcasts,regions';
    const types = typesParam.split(',').map(t => t.trim()).filter(Boolean);

    if (!q || q.length < 1) {
      return res.json({ results: [] });
    }

    const results = [];
    const like = `%${q}%`;

    // Shops
    if (types.includes('shops')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT shop_id, name, category, address, region_id FROM shops WHERE name ILIKE $1 OR category ILIKE $1 LIMIT 10`
          : `SELECT shopId, name, category, address, regionId FROM shops WHERE name LIKE ? OR category LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => results.push({
          type: 'shop',
          id: String(r.shop_id || r.shopId),
          title: r.name,
          subtitle: r.category || '',
          detail: r.address || '',
          url: `/shops/${r.shop_id || r.shopId}`,
        }));
      } catch (e) { /* shops might not exist */ }
    }

    // Missions
    if (types.includes('missions')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT mission_id, title, description FROM missions WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 10`
          : `SELECT missionId, title, description FROM missions WHERE title LIKE ? OR description LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => results.push({
          type: 'mission',
          id: String(r.mission_id || r.missionId),
          title: r.title,
          subtitle: '미션',
          detail: r.description || '',
          url: `/missions`,
        }));
      } catch (e) { /* missions might not exist */ }
    }

    // Boards
    if (types.includes('boards')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT board_id, title, content, region_id FROM boards WHERE title ILIKE $1 OR content ILIKE $1 LIMIT 10`
          : `SELECT boardId, title, content, regionId FROM boards WHERE title LIKE ? OR content LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => {
          const rid = String(r.region_id || r.regionId || '');
          results.push({
            type: 'board',
            id: String(r.board_id || r.boardId),
            title: r.title,
            subtitle: '게시판',
            detail: (r.content || '').slice(0, 60),
            url: rid ? `/r/${rid}/board/${r.board_id || r.boardId}` : `/r/default/board/${r.board_id || r.boardId}`,
          });
        });
      } catch (e) { /* boards might not exist */ }
    }

    // Notices
    if (types.includes('notices')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT id, title, content FROM notices WHERE title ILIKE $1 OR content ILIKE $1 LIMIT 10`
          : `SELECT id, title, content FROM notices WHERE title LIKE ? OR content LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => results.push({
          type: 'notice',
          id: String(r.id),
          title: r.title,
          subtitle: '공지사항',
          detail: (r.content || '').slice(0, 60),
          url: `/notices/${r.id}`,
        }));
      } catch (e) { /* notices might not exist */ }
    }

    // Events
    if (types.includes('events')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT event_id, title, description, region_id FROM events WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 10`
          : `SELECT eventId, title, description, regionId FROM events WHERE title LIKE ? OR description LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => {
          const eventId = String(r.event_id || r.eventId);
          const regionId = String(r.region_id || r.regionId || '');
          results.push({
            type: 'event',
            id: eventId,
            title: r.title,
            subtitle: '이벤트',
            detail: r.description || '',
            url: regionId ? `/r/${regionId}/events` : '/missions',
          });
        });
      } catch (e) { /* events might not exist */ }
    }

    // Auditions
    if (types.includes('auditions')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT audition_id, title, description FROM auditions WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 10`
          : `SELECT auditionId, title, description FROM auditions WHERE title LIKE ? OR description LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => {
          const auditionId = String(r.audition_id || r.auditionId);
          results.push({
            type: 'audition',
            id: auditionId,
            title: r.title,
            subtitle: '오디션',
            detail: r.description || '',
            url: `/audition/${auditionId}`,
          });
        });
      } catch (e) { /* auditions might not exist */ }
    }

    // Broadcasts
    if (types.includes('broadcasts')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT broadcast_id, title, description FROM broadcasts WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 10`
          : `SELECT broadcastId, title, description FROM broadcasts WHERE title LIKE ? OR description LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like]);
        (rows || []).forEach(r => {
          const broadcastId = String(r.broadcast_id || r.broadcastId);
          results.push({
            type: 'broadcast',
            id: broadcastId,
            title: r.title,
            subtitle: '공유방송',
            detail: r.description || '',
            url: `/broadcast/${broadcastId}`,
          });
        });
      } catch (e) { /* broadcasts might not exist */ }
    }

    // Regions
    if (types.includes('regions')) {
      try {
        const query = USE_POSTGRES
          ? `SELECT region_id, name, province, city FROM regions WHERE name ILIKE $1 OR province ILIKE $1 OR city ILIKE $1 LIMIT 10`
          : `SELECT regionId, name, province, city FROM regions WHERE name LIKE ? OR province LIKE ? OR city LIKE ? LIMIT 10`;
        const rows = USE_POSTGRES
          ? await db.query(query, [like])
          : await db.query(query, [like, like, like]);
        (rows || []).forEach(r => {
          const regionId = String(r.region_id || r.regionId);
          const province = r.province || '';
          const city = r.city || '';
          results.push({
            type: 'region',
            id: regionId,
            title: r.name,
            subtitle: '지역포털',
            detail: [province, city].filter(Boolean).join(' · '),
            url: `/r/${regionId}`,
          });
        });
      } catch (e) { /* regions might not exist */ }
    }

    res.json({ results, query: q });
  } catch (err) {
    logger.error('Error in /api/search:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/regions/:regionId/search?q=검색어 — 현재 지역 내 통합 검색
app.get('/api/regions/:regionId/search', async (req, res) => {
  try {
    const regionId = String(req.params.regionId || '').trim();
    const q = String(req.query.q || '').trim();
    if (!regionId) return res.status(400).json({ error: 'regionId required' });
    if (!q || q.length < 1) return res.json({ results: [], query: q, regionId });

    const results = [];
    const like = `%${q}%`;
    const regionIdsJson = JSON.stringify([regionId]);
    const limit = 12;
    const push = (item) => results.push(item);

    // 상점
    try {
      const query = USE_POSTGRES
        ? `SELECT shop_id, name, category, address FROM shops
           WHERE CAST(region_id AS TEXT) = $2
             AND (name ILIKE $1 OR category ILIKE $1 OR address ILIKE $1 OR description ILIKE $1)
           LIMIT ${limit}`
        : `SELECT shopId, name, category, address FROM shops
           WHERE CAST(regionId AS TEXT) = ?
             AND (name LIKE ? OR category LIKE ? OR address LIKE ? OR description LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like, like, like]);
      (rows || []).forEach((r) => push({
        type: 'shop',
        id: String(r.shop_id || r.shopId),
        title: r.name,
        subtitle: r.category || '상점',
        detail: r.address || '',
        url: `/r/${regionId}/shops`,
      }));
    } catch (e) { /* noop */ }

    // 미션
    try {
      const query = USE_POSTGRES
        ? `SELECT mission_id, title, description FROM missions
           WHERE (title ILIKE $1 OR description ILIKE $1)
             AND (
               region_scope = 'ALL'
               OR CAST(region_id AS TEXT) = $2
               OR region_ids @> $3::jsonb
             )
           LIMIT ${limit}`
        : `SELECT missionId, title, description FROM missions
           WHERE (title LIKE ? OR description LIKE ?)
             AND (
               regionScope = 'ALL'
               OR CAST(regionId AS TEXT) = ?
               OR regionIds LIKE ?
             )
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId, regionIdsJson])
        : await db.query(query, [like, like, regionId, `%${regionId}%`]);
      (rows || []).forEach((r) => push({
        type: 'mission',
        id: String(r.mission_id || r.missionId),
        title: r.title,
        subtitle: '미션',
        detail: (r.description || '').slice(0, 80),
        url: `/r/${regionId}/missions`,
      }));
    } catch (e) { /* noop */ }

    // 커뮤니티 게시글
    try {
      const query = USE_POSTGRES
        ? `SELECT board_id, title, content FROM boards
           WHERE CAST(region_id AS TEXT) = $2 AND (title ILIKE $1 OR content ILIKE $1)
           LIMIT ${limit}`
        : `SELECT boardId, title, content FROM boards
           WHERE CAST(regionId AS TEXT) = ? AND (title LIKE ? OR content LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'board',
        id: String(r.board_id || r.boardId),
        title: r.title,
        subtitle: '커뮤니티',
        detail: (r.content || '').slice(0, 80),
        url: `/r/${regionId}/board/${r.board_id || r.boardId}`,
      }));
    } catch (e) { /* noop */ }

    // 공지 (전체 + 해당 지역)
    try {
      const query = USE_POSTGRES
        ? `SELECT id, title, content FROM notices
           WHERE (title ILIKE $1 OR content ILIKE $1)
             AND UPPER(COALESCE(status, 'ACTIVE')) = 'ACTIVE'
             AND (
               scope = 'ALL'
               OR CAST(region_id AS TEXT) = $2
               OR region_ids @> $3::jsonb
             )
           LIMIT ${limit}`
        : `SELECT id, title, content FROM notices
           WHERE (title LIKE ? OR content LIKE ?)
             AND UPPER(COALESCE(status, 'ACTIVE')) = 'ACTIVE'
             AND (
               scope = 'ALL'
               OR CAST(region_id AS TEXT) = ?
               OR region_ids LIKE ?
             )
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId, regionIdsJson])
        : await db.query(query, [like, like, regionId, `%${regionId}%`]);
      (rows || []).forEach((r) => push({
        type: 'notice',
        id: String(r.id),
        title: r.title,
        subtitle: '공지사항',
        detail: (r.content || '').slice(0, 80),
        url: `/r/${regionId}/notices`,
      }));
    } catch (e) { /* noop */ }

    // 지역 이벤트
    try {
      const query = USE_POSTGRES
        ? `SELECT event_id, title, content FROM region_events
           WHERE region_id = $2 AND (title ILIKE $1 OR content ILIKE $1)
           LIMIT ${limit}`
        : `SELECT event_id, title, content FROM region_events
           WHERE region_id = ? AND (title LIKE ? OR content LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'event',
        id: String(r.event_id),
        title: r.title,
        subtitle: '이벤트',
        detail: (r.content || '').slice(0, 80),
        url: `/r/${regionId}/events`,
      }));
    } catch (e) { /* noop */ }

    // 지역행사
    try {
      const query = USE_POSTGRES
        ? `SELECT festival_id, title, description, location FROM region_festivals
           WHERE region_id = $2 AND (title ILIKE $1 OR description ILIKE $1 OR location ILIKE $1)
           LIMIT ${limit}`
        : `SELECT festival_id, title, description, location FROM region_festivals
           WHERE region_id = ? AND (title LIKE ? OR description LIKE ? OR location LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like, like]);
      (rows || []).forEach((r) => push({
        type: 'festival',
        id: String(r.festival_id),
        title: r.title,
        subtitle: '지역행사',
        detail: (r.description || r.location || '').slice(0, 80),
        url: `/r/${regionId}/festivals`,
      }));
    } catch (e) { /* noop */ }

    // 전단
    try {
      const query = USE_POSTGRES
        ? `SELECT flyer_id, title, shop_name, category FROM region_flyers
           WHERE region_id = $2 AND (title ILIKE $1 OR shop_name ILIKE $1 OR category ILIKE $1)
           LIMIT ${limit}`
        : `SELECT flyer_id, title, shop_name, category FROM region_flyers
           WHERE region_id = ? AND (title LIKE ? OR shop_name LIKE ? OR category LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like, like]);
      (rows || []).forEach((r) => push({
        type: 'flyer',
        id: String(r.flyer_id),
        title: r.title || r.shop_name,
        subtitle: '전단',
        detail: r.category || r.shop_name || '',
        url: `/r/${regionId}/flyers`,
      }));
    } catch (e) { /* noop */ }

    // 지역뉴스
    try {
      const query = USE_POSTGRES
        ? `SELECT news_id, title, content FROM region_news
           WHERE region_id = $2 AND is_public IS NOT FALSE AND (title ILIKE $1 OR content ILIKE $1)
           LIMIT ${limit}`
        : `SELECT news_id, title, content FROM region_news
           WHERE region_id = ? AND (title LIKE ? OR content LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'news',
        id: String(r.news_id),
        title: r.title,
        subtitle: '지역뉴스',
        detail: (r.content || '').slice(0, 80),
        url: `/r/${regionId}/news`,
      }));
    } catch (e) { /* noop */ }

    // 오디션
    try {
      const query = USE_POSTGRES
        ? `SELECT audition_id, title, description FROM auditions
           WHERE CAST(region_id AS TEXT) = $2 AND (title ILIKE $1 OR description ILIKE $1)
           LIMIT ${limit}`
        : `SELECT auditionId, title, description FROM auditions
           WHERE CAST(regionId AS TEXT) = ? AND (title LIKE ? OR description LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'audition',
        id: String(r.audition_id || r.auditionId),
        title: r.title,
        subtitle: '오디션',
        detail: (r.description || '').slice(0, 80),
        url: `/r/${regionId}/auditions`,
      }));
    } catch (e) { /* noop */ }

    // 공유방송
    try {
      const query = USE_POSTGRES
        ? `SELECT broadcast_id, title, description FROM broadcasts
           WHERE CAST(region_id AS TEXT) = $2 AND (title ILIKE $1 OR description ILIKE $1)
           LIMIT ${limit}`
        : `SELECT broadcastId, title, description FROM broadcasts
           WHERE CAST(regionId AS TEXT) = ? AND (title LIKE ? OR description LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'broadcast',
        id: String(r.broadcast_id || r.broadcastId),
        title: r.title,
        subtitle: '공유방송',
        detail: (r.description || '').slice(0, 80),
        url: `/broadcast/${r.broadcast_id || r.broadcastId}`,
      }));
    } catch (e) { /* noop */ }

    // 지역 소개
    try {
      const query = USE_POSTGRES
        ? `SELECT region_id, content, sections::text AS sections_text FROM region_info
           WHERE region_id = $2 AND (content ILIKE $1 OR sections::text ILIKE $1)
           LIMIT 3`
        : `SELECT region_id, content, sections FROM region_info
           WHERE region_id = ? AND (content LIKE ? OR sections LIKE ?)
           LIMIT 3`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'intro',
        id: String(r.region_id),
        title: '지역 소개',
        subtitle: '지역소개',
        detail: (r.content || '').slice(0, 80),
        url: `/r/${regionId}/intro`,
      }));
    } catch (e) { /* noop */ }

    // 아파트
    try {
      const query = USE_POSTGRES
        ? `SELECT apartment_id, name, address FROM apartments
           WHERE CAST(region_id AS TEXT) = $2 AND (name ILIKE $1 OR address ILIKE $1)
           LIMIT ${limit}`
        : `SELECT apartment_id, name, address FROM apartments
           WHERE CAST(region_id AS TEXT) = ? AND (name LIKE ? OR address LIKE ?)
           LIMIT ${limit}`;
      const rows = USE_POSTGRES
        ? await db.query(query, [like, regionId])
        : await db.query(query, [regionId, like, like]);
      (rows || []).forEach((r) => push({
        type: 'apartment',
        id: String(r.apartment_id),
        title: r.name,
        subtitle: '아파트',
        detail: r.address || '',
        url: `/r/${regionId}/apt`,
      }));
    } catch (e) { /* noop */ }

    return res.json({ results, query: q, regionId });
  } catch (err) {
    logger.error('Error in /api/regions/:regionId/search:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// 구/군/시 (districts) API
// ────────────────────────────────────────────────────────────

// normalize helper
function normalizeDistrictRow(row) {
  if (!row) return null;
  return {
    id: String(row.district_id || row.districtId),
    regionId: row.region_id || row.regionId,
    name: row.name,
    slug: row.slug || '',
    isActive: row.is_active !== undefined ? !!row.is_active : (row.isActive !== undefined ? !!row.isActive : true),
    sortOrder: row.sort_order || row.sortOrder || 0,
    createdAt: row.created_at || row.createdAt,
  };
}

// GET /api/districts?regionId= (특정 지역의 구/군)
// GET /api/districts/all (활성 구/군 전체)
app.get('/api/districts/all', async (req, res) => {
  try {
    const query = USE_POSTGRES
      ? `SELECT * FROM districts WHERE is_active = true ORDER BY region_id ASC, sort_order ASC, name ASC`
      : `SELECT * FROM districts WHERE isActive = 1 ORDER BY regionId ASC, sortOrder ASC, name ASC`;
    const rows = await db.query(query, []);
    res.json({ districts: (rows || []).map(normalizeDistrictRow).filter(Boolean) });
  } catch (err) {
    logger.error('Error fetching all districts:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/districts', async (req, res) => {
  try {
    const regionId = req.query.regionId || null;
    let rows;
    if (regionId) {
      const query = USE_POSTGRES
        ? `SELECT * FROM districts WHERE region_id = $1 ORDER BY sort_order ASC, name ASC`
        : `SELECT * FROM districts WHERE regionId = ? ORDER BY sortOrder ASC, name ASC`;
      rows = await db.query(query, [regionId]);
    } else {
      const query = USE_POSTGRES
        ? `SELECT * FROM districts ORDER BY region_id ASC, sort_order ASC, name ASC`
        : `SELECT * FROM districts ORDER BY regionId ASC, sortOrder ASC, name ASC`;
      rows = await db.query(query, []);
    }
    res.json({ districts: (rows || []).map(normalizeDistrictRow).filter(Boolean) });
  } catch (err) {
    logger.error('Error fetching districts:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/districts (관리자: 구/군 추가)
app.post('/api/districts', async (req, res) => {
  try {
    const { regionId, name, slug, isActive, sortOrder } = req.body;
    if (!regionId || !name) {
      return res.status(400).json({ error: 'regionId, name은 필수입니다.' });
    }
    const slugVal = slug || name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    let newDistrict;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `INSERT INTO districts (region_id, name, slug, is_active, sort_order) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
        [regionId, name, slugVal, isActive !== false, sortOrder || 0]
      );
      newDistrict = rows && normalizeDistrictRow(rows[0]);
    } else {
      const result = await db.run(
        `INSERT INTO districts (regionId, name, slug, isActive, sortOrder) VALUES (?, ?, ?, ?, ?)`,
        [regionId, name, slugVal, isActive !== false ? 1 : 0, sortOrder || 0]
      );
      const id = result?.lastID || result?.lastId;
      newDistrict = { id: String(id), regionId, name, slug: slugVal, isActive: isActive !== false, sortOrder: sortOrder || 0 };
    }
    res.status(201).json({ district: newDistrict });
  } catch (err) {
    logger.error('Error creating district:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/districts/:id (관리자: 구/군 수정)
app.put('/api/districts/:id', async (req, res) => {
  try {
    const districtId = req.params.id;
    const { name, slug, isActive, sortOrder } = req.body;
    if (!name) return res.status(400).json({ error: 'name은 필수입니다.' });
    const slugVal = slug || name.toLowerCase().replace(/[^a-z0-9가-힣]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE districts SET name=$1, slug=$2, is_active=$3, sort_order=$4, updated_at=NOW() WHERE district_id=$5`,
        [name, slugVal, isActive !== false, sortOrder || 0, districtId]
      );
    } else {
      await db.run(
        `UPDATE districts SET name=?, slug=?, isActive=?, sortOrder=?, updatedAt=datetime('now') WHERE districtId=?`,
        [name, slugVal, isActive !== false ? 1 : 0, sortOrder || 0, districtId]
      );
    }
    res.json({ success: true });
  } catch (err) {
    logger.error('Error updating district:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/districts/:id (관리자: 구/군 삭제)
app.delete('/api/districts/:id', async (req, res) => {
  try {
    const districtId = req.params.id;
    // 구/군 삭제 시 해당 구/군을 참조하는 지역 공지의 district_id를 비워 orphan 필터 문제를 방지
    if (USE_POSTGRES) {
      await db.run(`UPDATE notices SET district_id = NULL, updated_at = NOW() WHERE district_id = $1`, [districtId]);
    } else {
      await db.run(`UPDATE notices SET district_id = NULL, updated_at = datetime('now') WHERE district_id = ?`, [districtId]);
    }

    const query = USE_POSTGRES
      ? `DELETE FROM districts WHERE district_id = $1`
      : `DELETE FROM districts WHERE districtId = ?`;
    await db.run(query, [districtId]);
    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting district:', err);
    res.status(500).json({ error: err.message });
  }
});

// ────────────────────────────────────────────────────────────
// 아파트 (apartments) API
// ────────────────────────────────────────────────────────────

function normalizeApartmentRow(row) {
  if (!row) return null;
  return {
    id: String(row.apartment_id),
    regionId: row.region_id,
    districtId: row.district_id || null,
    name: row.name,
    address: row.address || '',
    households: row.households || 0,
    floors: row.floors || 0,
    builtYear: row.built_year || null,
    managerPhone: row.manager_phone || '',
    thumbnail: row.thumbnail || '',
    isActive: row.is_active !== undefined ? !!row.is_active : true,
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
  };
}

function normalizeAptPostRow(row) {
  if (!row) return null;
  return {
    id: String(row.post_id),
    apartmentId: String(row.apartment_id),
    regionId: row.region_id || null,
    authorId: row.author_id || null,
    authorName: row.author_name || '익명',
    title: row.title,
    content: row.content || '',
    category: row.category || 'general',
    postType: row.post_type || row.postType || 'board',
    images: normalizeContentImages(row.images),
    status: row.status || null,
    isPrivate: row.is_private !== undefined ? !!row.is_private : !!row.isPrivate,
    isPinned: row.is_pinned !== undefined ? !!row.is_pinned : !!row.isPinned,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const APARTMENT_POST_TYPES = new Set(['notice', 'board', 'help_request']);
const APARTMENT_BOARD_CATEGORIES = new Set(['notice', 'trade', 'general']);
const APARTMENT_HELP_STATUSES = new Set(['received', 'reviewing', 'processing', 'completed']);

function normalizeApartmentPostType(value) {
  const normalized = String(value || 'board').trim().toLowerCase();
  return APARTMENT_POST_TYPES.has(normalized) ? normalized : 'board';
}

function normalizeApartmentBoardCategory(value, fallback = 'general') {
  const normalized = String(value || fallback || 'general').trim().toLowerCase();
  return APARTMENT_BOARD_CATEGORIES.has(normalized) ? normalized : fallback;
}

function normalizeApartmentHelpStatus(value, fallback = 'received') {
  const normalized = String(value || fallback || 'received').trim().toLowerCase();
  return APARTMENT_HELP_STATUSES.has(normalized) ? normalized : fallback;
}

// GET /api/apartments?regionId=&districtId=
app.get('/api/apartments', async (req, res) => {
  try {
    const { regionId, districtId } = req.query;
    let rows;
    if (USE_POSTGRES) {
      if (districtId) {
        rows = await db.query(
          `SELECT * FROM apartments WHERE region_id = $1 AND district_id = $2 AND is_active = true ORDER BY sort_order ASC, name ASC`,
          [regionId, districtId]
        );
      } else if (regionId) {
        rows = await db.query(
          `SELECT * FROM apartments WHERE region_id = $1 AND is_active = true ORDER BY sort_order ASC, name ASC`,
          [regionId]
        );
      } else {
        rows = await db.query(`SELECT * FROM apartments WHERE is_active = true ORDER BY region_id ASC, sort_order ASC, name ASC`, []);
      }
    } else {
      if (districtId) {
        rows = await db.query(
          `SELECT * FROM apartments WHERE region_id = ? AND district_id = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC`,
          [regionId, districtId]
        );
      } else if (regionId) {
        rows = await db.query(
          `SELECT * FROM apartments WHERE region_id = ? AND is_active = 1 ORDER BY sort_order ASC, name ASC`,
          [regionId]
        );
      } else {
        rows = await db.query(`SELECT * FROM apartments WHERE is_active = 1 ORDER BY region_id ASC, sort_order ASC, name ASC`, []);
      }
    }
    res.json({ apartments: (rows || []).map(normalizeApartmentRow).filter(Boolean) });
  } catch (err) {
    logger.error('Error fetching apartments:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apartments (관리자: 아파트 추가)
app.post('/api/apartments', async (req, res) => {
  try {
    const { regionId, districtId, name, address, households, floors, builtYear, managerPhone, thumbnail, isActive, sortOrder } = req.body;
    if (!regionId || !name) return res.status(400).json({ error: 'regionId, name은 필수입니다.' });
    let apt;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `INSERT INTO apartments (region_id, district_id, name, address, households, floors, built_year, manager_phone, thumbnail, is_active, sort_order)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
        [regionId, districtId || null, name, address || '', households || 0, floors || 0, builtYear || null, managerPhone || '', thumbnail || '', isActive !== false, sortOrder || 0]
      );
      apt = rows && normalizeApartmentRow(rows[0]);
    } else {
      const result = await db.run(
        `INSERT INTO apartments (region_id, district_id, name, address, households, floors, built_year, manager_phone, thumbnail, is_active, sort_order) VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
        [regionId, districtId || null, name, address || '', households || 0, floors || 0, builtYear || null, managerPhone || '', thumbnail || '', isActive !== false ? 1 : 0, sortOrder || 0]
      );
      const id = result?.lastID || result?.lastId;
      apt = { id: String(id), regionId, districtId: districtId || null, name, address: address || '', households: households || 0, floors: floors || 0, builtYear: builtYear || null, managerPhone: managerPhone || '', thumbnail: thumbnail || '', isActive: isActive !== false, sortOrder: sortOrder || 0 };
    }
    res.status(201).json({ apartment: apt });
  } catch (err) {
    logger.error('Error creating apartment:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/apartments/:id (관리자: 아파트 수정)
app.put('/api/apartments/:id', async (req, res) => {
  try {
    const aptId = req.params.id;
    const { name, districtId, address, households, floors, builtYear, managerPhone, thumbnail, isActive, sortOrder } = req.body;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `UPDATE apartments SET name=$1, district_id=$2, address=$3, households=$4, floors=$5, built_year=$6, manager_phone=$7, thumbnail=$8, is_active=$9, sort_order=$10, updated_at=CURRENT_TIMESTAMP WHERE apartment_id=$11 RETURNING *`,
        [name, districtId || null, address || '', households || 0, floors || 0, builtYear || null, managerPhone || '', thumbnail || '', isActive !== false, sortOrder || 0, aptId]
      );
      const apt = rows && normalizeApartmentRow(rows[0]);
      if (!apt) return res.status(404).json({ error: '아파트를 찾을 수 없습니다.' });
      res.json({ apartment: apt });
    } else {
      await db.run(
        `UPDATE apartments SET name=?, district_id=?, address=?, households=?, floors=?, built_year=?, manager_phone=?, thumbnail=?, is_active=?, sort_order=?, updated_at=datetime('now') WHERE apartment_id=?`,
        [name, districtId || null, address || '', households || 0, floors || 0, builtYear || null, managerPhone || '', thumbnail || '', isActive !== false ? 1 : 0, sortOrder || 0, aptId]
      );
      res.json({ success: true });
    }
  } catch (err) {
    logger.error('Error updating apartment:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/apartments/:id (관리자: 아파트 삭제)
app.delete('/api/apartments/:id', async (req, res) => {
  try {
    const aptId = req.params.id;
    const q = USE_POSTGRES ? `DELETE FROM apartments WHERE apartment_id = $1` : `DELETE FROM apartments WHERE apartment_id = ?`;
    await db.run(q, [aptId]);
    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting apartment:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apartment-posts?apartmentId=&regionId=&category=&section=
app.get('/api/apartment-posts', async (req, res) => {
  try {
    const { apartmentId, regionId, category, section } = req.query;
    if (!apartmentId && !regionId) return res.status(400).json({ error: 'apartmentId or regionId required' });
    const auth = await getOptionalAuth(req);
    let apartmentRegionId = null;
    if (apartmentId) {
      const apartment = USE_POSTGRES
        ? await db.get('SELECT region_id FROM apartments WHERE apartment_id = $1', [apartmentId])
        : await db.get('SELECT region_id FROM apartments WHERE apartment_id = ?', [apartmentId]);
      apartmentRegionId = apartment?.region_id || null;
    }
    const targetRegionId = regionId || apartmentRegionId || null;
    const canModerate = await canManageApartmentRegion(auth.memberId, auth.role, targetRegionId);
    const normalizedSection = String(section || '').trim().toLowerCase();
    let rows;
    if (USE_POSTGRES) {
      const conditions = [];
      const params = [];
      if (apartmentId) {
        params.push(apartmentId);
        conditions.push(`apartment_id = $${params.length}`);
      } else {
        params.push(regionId);
        conditions.push(`region_id = $${params.length}`);
      }
      if (normalizedSection === 'notices') {
        params.push('notice');
        conditions.push(`post_type = $${params.length}`);
      } else if (normalizedSection === 'board') {
        params.push('board');
        conditions.push(`post_type = $${params.length}`);
      } else if (normalizedSection === 'help') {
        params.push('help_request');
        conditions.push(`post_type = $${params.length}`);
      }
      if (category && category !== 'all') {
        params.push(category);
        conditions.push(`category = $${params.length}`);
      }
      rows = await db.query(
        `SELECT * FROM apartment_posts WHERE ${conditions.join(' AND ')} ORDER BY is_pinned DESC, created_at DESC`,
        params
      );
    } else {
      const conditions = [];
      const params = [];
      if (apartmentId) {
        params.push(apartmentId);
        conditions.push('apartment_id = ?');
      } else {
        params.push(regionId);
        conditions.push('region_id = ?');
      }
      if (normalizedSection === 'notices') {
        params.push('notice');
        conditions.push('post_type = ?');
      } else if (normalizedSection === 'board') {
        params.push('board');
        conditions.push('post_type = ?');
      } else if (normalizedSection === 'help') {
        params.push('help_request');
        conditions.push('post_type = ?');
      }
      if (category && category !== 'all') {
        params.push(category);
        conditions.push('category = ?');
      }
      rows = await db.query(
        `SELECT * FROM apartment_posts WHERE ${conditions.join(' AND ')} ORDER BY is_pinned DESC, created_at DESC`,
        params
      );
    }
    const posts = (rows || []).map(normalizeAptPostRow).filter(Boolean).filter((post) => {
      if (post.postType !== 'help_request') return true;
      if (canModerate) return true;
      return auth.memberId && String(post.authorId || '') === String(auth.memberId);
    });
    res.json({ posts, canModerateHelpRequests: canModerate });
  } catch (err) {
    logger.error('Error fetching apartment posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apartment-posts (게시글 작성)
app.post('/api/apartment-posts', requireAuth, async (req, res) => {
  try {
    const { apartmentId, regionId, authorName, title, content, category, postType, images, isPinned, status } = req.body;
    console.log('[POST /api/apartment-posts] 요청:', { 
      apartmentId, 
      regionId, 
      postType, 
      title: title?.substring(0, 20),
      authMemberId: req.authMemberId,
      authRole: req.authRole,
    });
    
    if (!apartmentId || !title) return res.status(400).json({ error: 'apartmentId, title은 필수입니다.' });
    const apartment = USE_POSTGRES
      ? await db.get('SELECT region_id FROM apartments WHERE apartment_id = $1', [apartmentId])
      : await db.get('SELECT region_id FROM apartments WHERE apartment_id = ?', [apartmentId]);
    const resolvedRegionId = regionId || apartment?.region_id || null;
    console.log('[POST /api/apartment-posts] 해결된 regionId:', { resolvedRegionId, apartmentRegionId: apartment?.region_id, requestRegionId: regionId });
    
    const canModerate = await canManageApartmentRegion(req.authMemberId, req.authRole, resolvedRegionId);
    console.log('[POST /api/apartment-posts] canModerate:', canModerate);
    
    const normalizedPostType = normalizeApartmentPostType(postType);
    const normalizedImages = normalizeContentImages(images);
    let normalizedCategory = normalizeApartmentBoardCategory(category, 'general');
    let normalizedStatus = null;
    let normalizedPrivate = false;
    let normalizedPinned = false;

    if (normalizedPostType === 'notice') {
      if (!canModerate) {
        console.log('[POST /api/apartment-posts] REJECT: notice_forbidden');
        return res.status(403).json({ error: 'notice_forbidden' });
      }
      normalizedCategory = 'notice';
      normalizedPinned = !!isPinned;
    } else if (normalizedPostType === 'help_request') {
      normalizedCategory = 'help';
      normalizedStatus = normalizeApartmentHelpStatus(status, 'received');
      normalizedPrivate = true;
    } else {
      if (normalizedCategory === 'notice' && !canModerate) return res.status(403).json({ error: 'notice_forbidden' });
      normalizedPinned = normalizedCategory === 'notice' && canModerate ? !!isPinned : false;
    }

    let post;
    if (USE_POSTGRES) {
      const rows = await db.query(
        `INSERT INTO apartment_posts (apartment_id, region_id, author_id, author_name, title, content, category, post_type, images, status, is_private, is_pinned)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10,$11,$12) RETURNING *`,
        [apartmentId, resolvedRegionId, req.authMemberId, authorName || '익명', title, content || '', normalizedCategory, normalizedPostType, JSON.stringify(normalizedImages), normalizedStatus, normalizedPrivate, normalizedPinned]
      );
      post = rows && normalizeAptPostRow(rows[0]);
    } else {
      const result = await db.run(
        `INSERT INTO apartment_posts (apartment_id, region_id, author_id, author_name, title, content, category, post_type, images, status, is_private, is_pinned) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [apartmentId, resolvedRegionId, req.authMemberId, authorName || '익명', title, content || '', normalizedCategory, normalizedPostType, JSON.stringify(normalizedImages), normalizedStatus, normalizedPrivate ? 1 : 0, normalizedPinned ? 1 : 0]
      );
      const id = result?.lastID || result?.lastId;
      post = {
        id: String(id),
        apartmentId: String(apartmentId),
        regionId: resolvedRegionId,
        authorId: req.authMemberId,
        authorName: authorName || '익명',
        title,
        content: content || '',
        category: normalizedCategory,
        postType: normalizedPostType,
        images: normalizedImages,
        status: normalizedStatus,
        isPrivate: normalizedPrivate,
        isPinned: normalizedPinned,
      };
    }
    console.log('[POST /api/apartment-posts] 성공:', { postId: post?.id, postType: post?.postType });
    res.status(201).json({ post });
  } catch (err) {
    logger.error('Error creating apartment post:', err);
    console.error('[POST /api/apartment-posts] 에러:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/apartment-posts/:id (게시글 수정)
app.put('/api/apartment-posts/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { title, content, category, images, isPinned, status } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });
    const existing = await db.get(
      USE_POSTGRES ? 'SELECT * FROM apartment_posts WHERE post_id = $1' : 'SELECT * FROM apartment_posts WHERE post_id = ?',
      [postId]
    );
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const canModerate = await canManageApartmentRegion(req.authMemberId, req.authRole, existing.region_id);
    const isAuthor = String(existing.author_id || '') === String(req.authMemberId);
    if (!canModerate && !isAuthor) return res.status(403).json({ error: 'Forbidden' });
    const existingPostType = normalizeApartmentPostType(existing.post_type || 'board');
    if (existingPostType === 'notice' && !canModerate) return res.status(403).json({ error: 'notice_forbidden' });
    if (existingPostType === 'help_request' && status !== undefined && !canModerate) return res.status(403).json({ error: 'help_status_forbidden' });

    const normalizedImages = normalizeContentImages(images !== undefined ? images : existing.images);
    let nextCategory = existing.category || 'general';
    let nextStatus = existing.status || null;
    let nextPinned = existing.is_pinned !== undefined ? !!existing.is_pinned : false;

    if (existingPostType === 'notice') {
      nextCategory = 'notice';
      nextPinned = canModerate ? !!isPinned : nextPinned;
      nextStatus = null;
    } else if (existingPostType === 'help_request') {
      nextCategory = 'help';
      nextStatus = canModerate ? normalizeApartmentHelpStatus(status, existing.status || 'received') : (existing.status || 'received');
      nextPinned = false;
    } else {
      nextCategory = normalizeApartmentBoardCategory(category, existing.category || 'general');
      if (nextCategory === 'notice' && !canModerate) return res.status(403).json({ error: 'notice_forbidden' });
      nextPinned = nextCategory === 'notice' && canModerate ? !!isPinned : false;
      nextStatus = null;
    }

    let row;
    if (USE_POSTGRES) {
      const rows = await db.query(
        'UPDATE apartment_posts SET title=$1, content=$2, category=$3, images=$4::jsonb, status=$5, is_private=$6, is_pinned=$7, updated_at=NOW() WHERE post_id=$8 RETURNING *',
        [title, content || '', nextCategory, JSON.stringify(normalizedImages), nextStatus, existingPostType === 'help_request', nextPinned, postId]
      );
      row = rows && rows[0];
    } else {
      await db.run(
        'UPDATE apartment_posts SET title=?, content=?, category=?, images=?, status=?, is_private=?, is_pinned=?, updated_at=datetime("now") WHERE post_id=?',
        [title, content || '', nextCategory, JSON.stringify(normalizedImages), nextStatus, existingPostType === 'help_request' ? 1 : 0, nextPinned ? 1 : 0, postId]
      );
      row = await db.get('SELECT * FROM apartment_posts WHERE post_id=?', [postId]);
    }
    res.json({ post: normalizeAptPostRow(row) });
  } catch (err) {
    logger.error('Error updating apartment post:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/apartment-posts/:id/status', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const existing = await db.get(
      USE_POSTGRES ? 'SELECT * FROM apartment_posts WHERE post_id = $1' : 'SELECT * FROM apartment_posts WHERE post_id = ?',
      [postId]
    );
    if (!existing) return res.status(404).json({ error: 'Not found' });
    if (normalizeApartmentPostType(existing.post_type || 'board') !== 'help_request') {
      return res.status(400).json({ error: 'not_help_request' });
    }
    const canModerate = await canManageApartmentRegion(req.authMemberId, req.authRole, existing.region_id);
    if (!canModerate) return res.status(403).json({ error: 'Forbidden' });
    const nextStatus = normalizeApartmentHelpStatus(req.body?.status, existing.status || 'received');
    let row;
    if (USE_POSTGRES) {
      const rows = await db.query(
        'UPDATE apartment_posts SET status=$1, updated_at=NOW() WHERE post_id=$2 RETURNING *',
        [nextStatus, postId]
      );
      row = rows && rows[0];
    } else {
      await db.run(
        'UPDATE apartment_posts SET status=?, updated_at=datetime("now") WHERE post_id=?',
        [nextStatus, postId]
      );
      row = await db.get('SELECT * FROM apartment_posts WHERE post_id=?', [postId]);
    }
    res.json({ post: normalizeAptPostRow(row) });
  } catch (err) {
    logger.error('Error updating apartment help request status:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/apartment-posts/:id (게시글 삭제)
app.delete('/api/apartment-posts/:id', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const existing = await db.get(
      USE_POSTGRES ? 'SELECT * FROM apartment_posts WHERE post_id = $1' : 'SELECT * FROM apartment_posts WHERE post_id = ?',
      [postId]
    );
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const canModerate = await canManageApartmentRegion(req.authMemberId, req.authRole, existing.region_id);
    if (!canModerate && String(existing.author_id || '') !== String(req.authMemberId)) return res.status(403).json({ error: 'Forbidden' });
    if (USE_POSTGRES) {
      await db.run('DELETE FROM apartment_post_comments WHERE post_id = $1', [postId]);
      await db.run('DELETE FROM apartment_posts WHERE post_id = $1', [postId]);
    } else {
      await db.run('DELETE FROM apartment_post_comments WHERE post_id = ?', [postId]);
      await db.run('DELETE FROM apartment_posts WHERE post_id = ?', [postId]);
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting apartment post:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/apartment-posts/:id/comments
app.get('/api/apartment-posts/:id/comments', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await db.get(
      USE_POSTGRES ? 'SELECT post_type FROM apartment_posts WHERE post_id = $1' : 'SELECT post_type FROM apartment_posts WHERE post_id = ?',
      [postId]
    );
    if (!post || normalizeApartmentPostType(post.post_type || 'board') !== 'board') {
      return res.json({ comments: [] });
    }
    const rows = USE_POSTGRES
      ? await db.query('SELECT * FROM apartment_post_comments WHERE post_id = $1 ORDER BY created_at ASC', [postId])
      : await db.query('SELECT * FROM apartment_post_comments WHERE post_id = ? ORDER BY created_at ASC', [postId]);
    res.json({ comments: (rows || []).map(r => ({
      id: String(r.comment_id),
      postId: String(r.post_id),
      authorId: r.author_id || null,
      authorName: r.author_name || '익명',
      content: r.content,
      createdAt: r.created_at,
    })) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/apartment-posts/:id/comments
app.post('/api/apartment-posts/:id/comments', requireAuth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { authorName, content } = req.body;
    if (!content || !String(content).trim()) return res.status(400).json({ error: 'content required' });
    const post = await db.get(
      USE_POSTGRES ? 'SELECT post_type FROM apartment_posts WHERE post_id = $1' : 'SELECT post_type FROM apartment_posts WHERE post_id = ?',
      [postId]
    );
    if (!post || normalizeApartmentPostType(post.post_type || 'board') !== 'board') {
      return res.status(403).json({ error: 'comments_not_allowed' });
    }
    let row;
    if (USE_POSTGRES) {
      const rows = await db.query(
        'INSERT INTO apartment_post_comments (post_id, author_id, author_name, content) VALUES ($1,$2,$3,$4) RETURNING *',
        [postId, req.authMemberId, authorName || '익명', String(content).trim()]
      );
      row = rows && rows[0];
    } else {
      const result = await db.run(
        'INSERT INTO apartment_post_comments (post_id, author_id, author_name, content) VALUES (?,?,?,?)',
        [postId, req.authMemberId, authorName || '익명', String(content).trim()]
      );
      const cid = result?.lastID || result?.lastId;
      row = await db.get('SELECT * FROM apartment_post_comments WHERE comment_id=?', [cid]);
    }
    res.status(201).json({ comment: {
      id: String(row.comment_id),
      postId: String(row.post_id),
      authorId: row.author_id || null,
      authorName: row.author_name || '익명',
      content: row.content,
      createdAt: row.created_at,
    } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/apartment-post-comments/:commentId
app.delete('/api/apartment-post-comments/:commentId', requireAuth, async (req, res) => {
  try {
    const commentId = req.params.commentId;
    const existing = await db.get(
      USE_POSTGRES ? 'SELECT * FROM apartment_post_comments WHERE comment_id = $1' : 'SELECT * FROM apartment_post_comments WHERE comment_id = ?',
      [commentId]
    );
    if (!existing) return res.status(404).json({ error: 'Not found' });
    const post = await db.get(
      USE_POSTGRES ? 'SELECT region_id FROM apartment_posts WHERE post_id = $1' : 'SELECT region_id FROM apartment_posts WHERE post_id = ?',
      [existing.post_id]
    );
    const canModerate = await canManageApartmentRegion(req.authMemberId, req.authRole, post?.region_id || null);
    if (!canModerate && String(existing.author_id || '') !== String(req.authMemberId)) return res.status(403).json({ error: 'Forbidden' });
    await db.run(
      USE_POSTGRES ? 'DELETE FROM apartment_post_comments WHERE comment_id = $1' : 'DELETE FROM apartment_post_comments WHERE comment_id = ?',
      [commentId]
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/api/missions/:missionId', async (req, res) => {
  try {
    const missionId = req.params.missionId;
    if (!missionId) return res.status(400).json({ error: 'missionId required' });
    const query = USE_POSTGRES
      ? 'SELECT * FROM missions WHERE mission_id = $1'
      : 'SELECT * FROM missions WHERE missionId = ?';
    const row = await db.get(query, [missionId]);
    if (!row) return res.status(404).json({ error: 'Mission not found' });
    res.json({ mission: normalizeMissionRow(row) });
  } catch (err) {
    logger.error('Error fetching mission:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/missions
app.post('/api/missions', async (req, res) => {
  try {
    const m = req.body || {};
    console.log("[MISSION-SERVER-IN]", {
      method: req.method,
      id: req.params?.id ?? null,
      title: (req.body || {}).title,
      regionId: (req.body || {}).regionId,
      regionName: (req.body || {}).regionName,
      body: req.body || {},
    });
    if (!m.title) return res.status(400).json({ error: 'title required' });
    
    const missionId = m.id || m.missionId || `MISSION_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    let regionScope = String(m.regionScope || 'ALL').trim().toUpperCase();
    let regionIds = m.regionIds;
    if (Array.isArray(regionIds)) {
      regionIds = regionIds.map((value) => String(value || '').trim()).filter(Boolean);
    } else if (typeof regionIds === 'string') {
      regionIds = [String(regionIds).trim()].filter(Boolean);
    }
    if (regionScope !== 'REGION' || regionIds.length === 0 || regionIds.some((value) => value.toUpperCase() === 'ALL')) {
      regionScope = 'ALL';
      regionIds = [];
    }
    // regionScope REGION이면 regionIds 배열 강제
    if (regionScope === 'REGION') {
      if (Array.isArray(regionIds)) {
        if (regionIds.length === 0 && m.regionId) regionIds = [m.regionId];
      } else if (typeof regionIds === 'string') {
        regionIds = [regionIds];
      } else if (m.regionId) {
        regionIds = [m.regionId];
      } else {
        regionIds = [];
      }
      if (!Array.isArray(regionIds) || regionIds.length === 0) {
        logger.warn('[POST /api/missions] regionScope=REGION인데 regionIds가 유효하지 않음', { regionIds, regionScope, body: m });
        return res.status(400).json({ error: 'regionIds required for regionScope=REGION' });
      }
    } else {
      regionIds = Array.isArray(regionIds) ? regionIds : (regionIds ? [regionIds] : []);
    }
    logger.info('[POST /api/missions] regionScope/regionIds', { regionScope, regionIds });
    const category = m.category || 'general';
    const images = normalizeContentImages(m.images);
    const primaryRegionId = regionScope === 'REGION'
      ? String(m.regionId || regionIds[0] || '').trim() || null
      : null;
    const normalizedRegionName = m.regionName || (regionScope === 'ALL' ? '전체 지역' : null);

    const startDateFormatted = m.startDate ? `${m.startDate}T12:00:00Z` : null;
    const endDateFormatted = m.endDate ? `${m.endDate}T12:00:00Z` : null;
    logger.info(`[POST /api/missions] 날짜 변환 - startDate: ${m.startDate} → ${startDateFormatted}, endDate: ${m.endDate} → ${endDateFormatted}`);
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO missions(mission_id, title, description, points, reward_type, type, status, start_date, end_date, region_id, region_scope, region_ids, region_name, category, district_id, images, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        ON CONFLICT(mission_id) DO UPDATE SET
          title=EXCLUDED.title,
          description=EXCLUDED.description,
          points=EXCLUDED.points,
          reward_type=EXCLUDED.reward_type,
          type=EXCLUDED.type,
          status=EXCLUDED.status,
          start_date=EXCLUDED.start_date,
          end_date=EXCLUDED.end_date,
          region_id=EXCLUDED.region_id,
          region_scope=EXCLUDED.region_scope,
          region_ids=EXCLUDED.region_ids,
          region_name=EXCLUDED.region_name,
          category=EXCLUDED.category,
          district_id=EXCLUDED.district_id,
          images=EXCLUDED.images,
          updated_at=EXCLUDED.updated_at
        RETURNING mission_id
      `;
      await db.query(query, [
        missionId,
        m.title,
        m.description || '',
        parseInt(m.points) || 0,
        m.rewardType || 'points',
        m.type || '',
        m.status || 'ACTIVE',
        startDateFormatted,
        endDateFormatted,
        primaryRegionId,
        regionScope,
        regionIds,
        normalizedRegionName,
        category,
        m.districtId || null,
        serializeContentImages(images),
        now,
        now
      ]);
    } else {
      const query = `
        INSERT INTO missions(missionId, title, description, points, rewardType, type, status, startDate, endDate, regionId, regionScope, regionIds, regionName, category, images, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(missionId) DO UPDATE SET
          title=excluded.title,
          description=excluded.description,
          points=excluded.points,
          rewardType=excluded.rewardType,
          type=excluded.type,
          status=excluded.status,
          startDate=excluded.startDate,
          endDate=excluded.endDate,
          regionId=excluded.regionId,
          regionScope=excluded.regionScope,
          regionIds=excluded.regionIds,
          regionName=excluded.regionName,
          category=excluded.category,
          images=excluded.images,
          updatedAt=excluded.updatedAt
      `;
      await db.run(query, [
        missionId,
        m.title,
        m.description || '',
        parseInt(m.points) || 0,
        m.rewardType || 'points',
        m.type || '',
        m.status || 'ACTIVE',
        m.startDate || null,
        m.endDate || null,
        primaryRegionId,
        regionScope,
        JSON.stringify(regionIds),
        normalizedRegionName,
        category,
        serializeContentImages(images),
        now,
        now
      ]);
    }
    res.json({ ok: true, success: true, missionId, id: missionId });
  } catch (err) {
    logger.error('Error creating/updating mission:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/missions/:missionId
app.put('/api/missions/:missionId', async (req, res) => {
  try {
    const missionId = req.params.missionId;
    if (!missionId) return res.status(400).json({ error: 'missionId required' });
    const updates = req.body || {};
    console.log("[MISSION-SERVER-IN]", {
      method: req.method,
      id: req.params?.missionId ?? null,
      title: (req.body || {}).title,
      regionId: (req.body || {}).regionId,
      regionName: (req.body || {}).regionName,
      body: req.body || {},
    });
    const now = new Date().toISOString();

    const sets = [];
    const params = [];
    let idx = 1;

    function pushSet(pgCol, sqliteCol, value, transform) {
      if (value === undefined) return;
      const v = transform ? transform(value) : value;
      if (USE_POSTGRES) {
        sets.push(`${pgCol} = $${idx++}`);
      } else {
        sets.push(`${sqliteCol} = ?`);
      }
      params.push(v);
    }

    pushSet('title', 'title', updates.title);
    pushSet('description', 'description', updates.description);
    pushSet('points', 'points', updates.points, (v) => (v === null || v === '' ? null : parseInt(v, 10)));
    pushSet('reward_type', 'rewardType', updates.rewardType, (v) => String(v || 'points').trim().toLowerCase());
    pushSet('type', 'type', updates.type);
    pushSet('status', 'status', updates.status);
    pushSet('max_participants', 'max_participants', updates.maxParticipants, (v) => (v === null || v === '' ? null : parseInt(v, 10)));
    pushSet('start_date', 'start_date', updates.startDate, (v) => v ? `${v}T12:00:00Z` : null);
    pushSet('end_date', 'end_date', updates.endDate, (v) => v ? `${v}T12:00:00Z` : null);
    if (updates.images !== undefined) {
      const normalizedImages = normalizeContentImages(updates.images);
      if (USE_POSTGRES) {
        sets.push(`images = $${idx++}::jsonb`);
      } else {
        sets.push(`images = ?`);
      }
      params.push(serializeContentImages(normalizedImages));
    }
    // regionScope REGION이면 regionIds 배열 강제
    let regionScope = String(updates.regionScope || 'ALL').trim().toUpperCase();
    let regionIds = updates.regionIds;
    if (Array.isArray(regionIds)) {
      regionIds = regionIds.map((value) => String(value || '').trim()).filter(Boolean);
    } else if (typeof regionIds === 'string') {
      regionIds = [String(regionIds).trim()].filter(Boolean);
    }
    if (regionScope !== 'REGION' || (Array.isArray(regionIds) && regionIds.some((value) => value.toUpperCase() === 'ALL'))) {
      regionScope = 'ALL';
      regionIds = [];
    }
    if (regionScope === 'REGION') {
      if (Array.isArray(regionIds)) {
        if (regionIds.length === 0 && updates.regionId) regionIds = [updates.regionId];
      } else if (typeof regionIds === 'string') {
        regionIds = [regionIds];
      } else if (updates.regionId) {
        regionIds = [updates.regionId];
      } else {
        regionIds = [];
      }
      if (!Array.isArray(regionIds) || regionIds.length === 0) {
        logger.warn('[PUT /api/missions/:missionId] regionScope=REGION인데 regionIds가 유효하지 않음', { regionIds, regionScope, body: updates });
        return res.status(400).json({ error: 'regionIds required for regionScope=REGION' });
      }
    } else if (regionIds !== undefined) {
      regionIds = Array.isArray(regionIds) ? regionIds : (regionIds ? [regionIds] : []);
    }
    const derivedRegionId = regionScope === 'REGION'
      ? String(updates.regionId || regionIds?.[0] || '').trim() || null
      : null;
    const derivedRegionName = updates.regionName !== undefined
      ? updates.regionName
      : (regionScope === 'ALL' ? '전체 지역' : undefined);
    logger.info('[PUT /api/missions/:missionId] regionScope/regionIds', { regionScope, regionIds });
    pushSet('region_id', 'regionId', derivedRegionId);
    pushSet('region_scope', 'region_scope', regionScope);
    pushSet('category', 'category', updates.category);
    pushSet('district_id', 'district_id', updates.districtId !== undefined ? (updates.districtId || null) : undefined);
    if (regionIds !== undefined) {
      pushSet('region_ids', 'region_ids', USE_POSTGRES ? regionIds : JSON.stringify(regionIds));
    }
    if (derivedRegionName !== undefined) {
      pushSet('region_name', 'regionName', derivedRegionName);
    }
    if (updates.participants !== undefined) {
      const p = Array.isArray(updates.participants) ? updates.participants : [];
      pushSet('participants', 'participants', USE_POSTGRES ? p : JSON.stringify(p));
    }
    pushSet('created_by', 'created_by', updates.createdBy);

    if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });

    if (USE_POSTGRES) {
      sets.push(`updated_at = $${idx++}`);
      params.push(now);
      params.push(missionId);
      const q = `UPDATE missions SET ${sets.join(', ')} WHERE mission_id = $${idx} RETURNING *`;
      const row = await db.get(q, params);
      res.json({ ok: true, success: true, missionId, id: missionId, mission: normalizeMissionRow(row) });
    } else {
      sets.push('updatedAt = ?');
      params.push(now);
      params.push(missionId);
      const q = `UPDATE missions SET ${sets.join(', ')} WHERE missionId = ?`;
      await db.run(q, params);
      const row = await db.get('SELECT * FROM missions WHERE missionId = ?', [missionId]);
      res.json({ ok: true, success: true, missionId, id: missionId, mission: normalizeMissionRow(row) });
    }
  } catch (err) {
    logger.error('Error updating mission:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/missions/:missionId/participants
app.get('/api/missions/:missionId/participants', async (req, res) => {
  try {
    const missionId = req.params.missionId;
    if (!missionId) return res.status(400).json({ error: 'missionId required' });
    const rows = await getProgramParticipationRows('mission', missionId);
    res.json({ ok: true, success: true, missionId, participants: (rows || []).map(mapParticipantWithMember) });
  } catch (err) {
    logger.error('Error fetching mission participants:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/missions/:missionId/participants
app.patch('/api/missions/:missionId/participants', async (req, res) => {
  try {
    const missionId = req.params.missionId;
    const { memberId, status: participantStatus, adminId, reviewNote } = req.body || {};
    if (!missionId) return res.status(400).json({ error: 'missionId required' });
    if (!memberId || !participantStatus) {
      return res.status(400).json({ error: 'memberId and status required' });
    }

    const updated = await updateProgramParticipantReview('mission', missionId, memberId, {
      status: participantStatus,
      adminId,
      reviewNote,
    });
    if (!updated) return res.status(404).json({ error: 'Participant not found' });

    res.json({ ok: true, success: true, missionId, participant: normalizeParticipationRow(updated) });
  } catch (err) {
    logger.error('Error updating mission participant:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/events/:eventId/participants
app.get('/api/events/:eventId/participants', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    if (!eventId) return res.status(400).json({ error: 'eventId required' });
    const rows = await getProgramParticipationRows('event', eventId);
    res.json({ ok: true, success: true, eventId, participants: (rows || []).map(mapParticipantWithMember) });
  } catch (err) {
    logger.error('Error fetching event participants:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/events/:eventId/participants
app.patch('/api/events/:eventId/participants', async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const { memberId, status: participantStatus, adminId, reviewNote } = req.body || {};
    if (!eventId) return res.status(400).json({ error: 'eventId required' });
    if (!memberId || !participantStatus) {
      return res.status(400).json({ error: 'memberId and status required' });
    }

    const updated = await updateProgramParticipantReview('event', eventId, memberId, {
      status: participantStatus,
      adminId,
      reviewNote,
    });
    if (!updated) return res.status(404).json({ error: 'Participant not found' });

    res.json({ ok: true, success: true, eventId, participant: normalizeParticipationRow(updated) });
  } catch (err) {
    logger.error('Error updating event participant:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/missions/:id
app.delete('/api/missions/:id', async (req, res) => {
  try {
    const missionId = req.params.id;
    if (!missionId) return res.status(400).json({ error: 'missionId required' });
    
    const query = USE_POSTGRES
      ? 'DELETE FROM missions WHERE mission_id = $1'
      : 'DELETE FROM missions WHERE missionId = ?';
    await db.run(query, [missionId]);
    res.json({ ok: true, success: true, id: missionId, missionId });
  } catch (err) {
    logger.error('Error deleting mission:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// EVENTS API
// ============================================

// GET /api/events
app.get('/api/events', async (req, res) => {
  try {
    const regionId = req.query.regionId || null;
    const districtId = req.query.districtId || null;

    let baseQuery, params = [];
    if (USE_POSTGRES) {
      baseQuery = `
        SELECT e.*, COUNT(p.participation_id) as participants_count,
          (SELECT COUNT(DISTINCT p2.participation_id)
           FROM participations p2
           JOIN members mem2 ON p2.member_id = CAST(mem2.member_id AS TEXT)
           WHERE (p2.item_key = 'event:' || CAST(e.event_id AS TEXT)
                  OR p2.item_key = CAST(e.event_id AS TEXT)
                  OR p2.item_key LIKE 'event:' || CAST(e.event_id AS TEXT) || ':%')
             AND (p2.item_type IS NULL OR p2.item_type = '' OR LOWER(p2.item_type) = 'event')
             AND NOT (mem2.region_id = ANY(e.region_ids))) AS ext_participants_count
        FROM events e
        LEFT JOIN participations p ON (
          (p.item_key = 'event:' || CAST(e.event_id AS TEXT)
           OR p.item_key = CAST(e.event_id AS TEXT)
           OR p.item_key LIKE 'event:' || CAST(e.event_id AS TEXT) || ':%')
          AND (p.item_type IS NULL OR p.item_type = '' OR LOWER(p.item_type) = 'event'))
        WHERE 1=1`;
      if (regionId) {
        params.push(regionId);
        baseQuery += ` AND $${params.length} = ANY(e.region_ids)`;
        if (districtId) {
          params.push(districtId);
          baseQuery += ` AND e.district_id = $${params.length}`;
        }
      }
      baseQuery += ` GROUP BY e.event_id ORDER BY e.start_date DESC`;
    } else {
      baseQuery = `
        SELECT e.*, COUNT(p.participationId) as participantsCount
        FROM events e
        LEFT JOIN participations p ON (
          (p.itemKey = 'event:' || e.eventId
           OR p.itemKey = e.eventId
           OR p.itemKey LIKE 'event:' || e.eventId || ':%')
          AND p.itemType = 'event')
      `;
      if (regionId) {
        baseQuery += ` WHERE e.regionIds LIKE '%"' || ? || '"%'`;
        params.push(regionId);
      }
      baseQuery += ` GROUP BY e.eventId ORDER BY e.startDate DESC`;
    }
    const rows = await db.query(baseQuery, params);

    let regionEventRows = [];
    try {
      if (USE_POSTGRES) {
        const regionParams = [];
        let regionWhere = 'WHERE 1=1';
        if (regionId) {
          regionParams.push(String(regionId));
          regionWhere += ` AND region_id = $${regionParams.length}`;
        }
        regionEventRows = await db.query(
          `SELECT event_id, region_id, title, content, images, banner_url, mission_id, start_at, end_at, status, created_at, updated_at
             FROM region_events
             ${regionWhere}
            ORDER BY COALESCE(start_at, created_at) DESC
            LIMIT 100`,
          regionParams
        );
      } else {
        const regionParams = [];
        let regionWhere = 'WHERE 1=1';
        if (regionId) {
          regionWhere += ' AND regionId = ?';
          regionParams.push(String(regionId));
        }
        regionEventRows = await db.query(
          `SELECT eventId, regionId, title, content, images, bannerUrl, missionId, startAt, endAt, status, createdAt, updatedAt
             FROM region_events
             ${regionWhere}
            ORDER BY COALESCE(startAt, createdAt) DESC
            LIMIT 100`,
          regionParams
        );
      }
    } catch (regionErr) {
      logger.warn('Region events merge skipped for /api/events:', regionErr.message);
    }
    
    // PostgreSQL Date 객체를 문자열로 변환 (UTC 날짜 직접 추출)
    const normalized = (rows || []).map(row => {
      let startDate = null;
      let endDate = null;
      const images = normalizeContentImages(row.images);
      
      if (row.start_date) {
        if (row.start_date instanceof Date) {
          const d = new Date(row.start_date);
          startDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        } else {
          startDate = String(row.start_date).split('T')[0];
        }
      }
      if (row.end_date) {
        if (row.end_date instanceof Date) {
          const d = new Date(row.end_date);
          endDate = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        } else {
          endDate = String(row.end_date).split('T')[0];
        }
      }
      
      return {
        ...row,
        startDate,
        endDate,
        images,
        eventId: USE_POSTGRES ? row.event_id : row.eventId,
        isPublic: USE_POSTGRES ? row.is_public : row.isPublic,
        regionScope: USE_POSTGRES ? row.region_scope : row.regionScope,
        regionIds: USE_POSTGRES ? row.region_ids : (row.regionIds ? JSON.parse(row.regionIds) : []),
        rewardType: USE_POSTGRES ? (row.reward_type || 'points') : (row.rewardType || 'points'),
        points: USE_POSTGRES ? (row.points || 0) : (row.points || 0),
        participantsCount: USE_POSTGRES ? (parseInt(row.participants_count || 0, 10) || 0) : (parseInt(row.participantsCount || 0, 10) || 0),
        extParticipantsCount: USE_POSTGRES ? (parseInt(row.ext_participants_count || 0, 10) || 0) : 0,
        createdAt: USE_POSTGRES ? row.created_at : row.createdAt,
        updatedAt: USE_POSTGRES ? row.updated_at : row.updatedAt,
      };
    });

    const normalizedRegionEvents = (regionEventRows || []).map((row) => {
      const images = normalizeContentImages(row.images);
      const startAtValue = USE_POSTGRES ? row.start_at : row.startAt;
      const endAtValue = USE_POSTGRES ? row.end_at : row.endAt;
      const createdAtValue = USE_POSTGRES ? row.created_at : row.createdAt;
      const updatedAtValue = USE_POSTGRES ? row.updated_at : row.updatedAt;

      const toDateOnly = (value) => {
        if (!value) return null;
        if (value instanceof Date) {
          const d = new Date(value);
          return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
        }
        return String(value).split('T')[0];
      };

      return {
        event_id: USE_POSTGRES ? row.event_id : row.eventId,
        eventId: USE_POSTGRES ? row.event_id : row.eventId,
        id: USE_POSTGRES ? row.event_id : row.eventId,
        title: row.title || '',
        description: row.content || '',
        content: row.content || '',
        images,
        banner_url: USE_POSTGRES ? row.banner_url : row.bannerUrl,
        bannerUrl: USE_POSTGRES ? row.banner_url : row.bannerUrl,
        mission_id: USE_POSTGRES ? row.mission_id : row.missionId,
        missionId: USE_POSTGRES ? row.mission_id : row.missionId,
        startDate: toDateOnly(startAtValue),
        endDate: toDateOnly(endAtValue),
        start_at: startAtValue,
        end_at: endAtValue,
        isPublic: true,
        is_public: true,
        regionScope: 'REGION',
        region_scope: 'REGION',
        regionIds: [String(USE_POSTGRES ? row.region_id : row.regionId || '')].filter(Boolean),
        region_ids: [String(USE_POSTGRES ? row.region_id : row.regionId || '')].filter(Boolean),
        regionId: String(USE_POSTGRES ? row.region_id : row.regionId || ''),
        region_id: String(USE_POSTGRES ? row.region_id : row.regionId || ''),
        rewardType: 'points',
        reward_type: 'points',
        points: 0,
        participantsCount: 0,
        participants_count: 0,
        extParticipantsCount: 0,
        ext_participants_count: 0,
        status: row.status || 'active',
        isActive: String(row.status || 'active').toLowerCase() !== 'inactive',
        createdAt: createdAtValue,
        created_at: createdAtValue,
        updatedAt: updatedAtValue,
        updated_at: updatedAtValue,
      };
    });

    const merged = [...normalized];
    const seenEventIds = new Set(merged.map((row) => String(row.eventId || row.event_id || row.id || '')).filter(Boolean));
    for (const regionEvent of normalizedRegionEvents) {
      const nextId = String(regionEvent.eventId || regionEvent.event_id || regionEvent.id || '');
      if (nextId && seenEventIds.has(nextId)) continue;
      if (districtId && regionEvent.districtId && String(regionEvent.districtId) !== String(districtId)) continue;
      if (nextId) seenEventIds.add(nextId);
      merged.push(regionEvent);
    }

    merged.sort((a, b) => {
      const aTime = new Date(a.startDate || a.start_at || a.createdAt || a.created_at || 0).getTime();
      const bTime = new Date(b.startDate || b.start_at || b.createdAt || b.created_at || 0).getTime();
      return bTime - aTime;
    });

    res.json(merged);
  } catch (err) {
    logger.error('Error fetching events:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/events
app.post('/api/events', async (req, res) => {
  try {
    const e = req.body || {};
    if (!e.title) return res.status(400).json({ error: 'title required' });
    
    const eventId = e.id || e.eventId || `EVENT_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    let regionScope = String(e.regionScope || 'ALL').trim().toUpperCase();
    let regionIds = e.regionIds;
    if (Array.isArray(regionIds)) {
      regionIds = regionIds.map((value) => String(value || '').trim()).filter(Boolean);
    } else if (typeof regionIds === 'string') {
      regionIds = [String(regionIds).trim()].filter(Boolean);
    }
    if (regionScope !== 'REGION' || regionIds.length === 0 || regionIds.some((value) => value.toUpperCase() === 'ALL')) {
      regionScope = 'ALL';
      regionIds = [];
    }
    // regionScope REGION이면 regionIds 배열 강제
    if (regionScope === 'REGION') {
      if (Array.isArray(regionIds)) {
        if (regionIds.length === 0 && e.regionId) regionIds = [e.regionId];
      } else if (typeof regionIds === 'string') {
        regionIds = [regionIds];
      } else if (e.regionId) {
        regionIds = [e.regionId];
      } else {
        regionIds = [];
      }
      if (!Array.isArray(regionIds) || regionIds.length === 0) {
        logger.warn('[POST /api/events] regionScope=REGION인데 regionIds가 유효하지 않음', { regionIds, regionScope, body: e });
        return res.status(400).json({ error: 'regionIds required for regionScope=REGION' });
      }
    } else {
      regionIds = Array.isArray(regionIds) ? regionIds : (regionIds ? [regionIds] : []);
    }
    logger.info('[POST /api/events] regionScope/regionIds', { regionScope, regionIds });
    const images = normalizeContentImages(e.images);

    if (USE_POSTGRES) {
      const query = `
        INSERT INTO events(event_id, title, description, region, start_date, end_date, location, is_public, region_scope, region_ids, district_id, images, reward_type, points, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb, $13, $14, $15, $16)
        ON CONFLICT(event_id) DO UPDATE SET
          title=EXCLUDED.title,
          description=EXCLUDED.description,
          region=EXCLUDED.region,
          start_date=EXCLUDED.start_date,
          end_date=EXCLUDED.end_date,
          location=EXCLUDED.location,
          is_public=EXCLUDED.is_public,
          region_scope=EXCLUDED.region_scope,
          region_ids=EXCLUDED.region_ids,
          district_id=EXCLUDED.district_id,
          images=EXCLUDED.images,
          reward_type=EXCLUDED.reward_type,
          points=EXCLUDED.points,
          updated_at=EXCLUDED.updated_at
        RETURNING event_id
      `;
      await db.query(query, [
        eventId,
        e.title,
        e.description || '',
        e.region || '',
        e.startDate ? `${e.startDate}T12:00:00Z` : null,
        e.endDate ? `${e.endDate}T12:00:00Z` : null,
        e.location || '',
        e.isPublic || false,
        regionScope,
        regionIds,
        e.districtId || null,
        serializeContentImages(images),
        e.rewardType || 'points',
        parseInt(e.points) || 0,
        now,
        now
      ]);
    } else {
      const query = `
        INSERT INTO events(eventId, title, description, region, startDate, endDate, location, isPublic, regionScope, regionIds, images, rewardType, points, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(eventId) DO UPDATE SET
          title=excluded.title,
          description=excluded.description,
          region=excluded.region,
          startDate=excluded.startDate,
          endDate=excluded.endDate,
          location=excluded.location,
          isPublic=excluded.isPublic,
          regionScope=excluded.regionScope,
          regionIds=excluded.regionIds,
            images=excluded.images,
          rewardType=excluded.rewardType,
          points=excluded.points,
          updatedAt=excluded.updatedAt
      `;
      await db.run(query, [
        eventId,
        e.title,
        e.description || '',
        e.region || '',
        e.startDate || null,
        e.endDate || null,
        e.location || '',
        e.isPublic ? 1 : 0,
        regionScope,
        JSON.stringify(regionIds),
        serializeContentImages(images),
        e.rewardType || 'points',
        parseInt(e.points) || 0,
        now,
        now
      ]);
    }
    res.json({ ok: true, eventId });
  } catch (err) {
    logger.error('Error creating/updating event:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/events/:id
app.delete('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!eventId) return res.status(400).json({ error: 'eventId required' });
    
    const query = USE_POSTGRES
      ? 'DELETE FROM events WHERE event_id = $1'
      : 'DELETE FROM events WHERE eventId = ?';
    await db.run(query, [eventId]);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting event:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/events/:id — 이벤트 수정
app.put('/api/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    if (!eventId) return res.status(400).json({ error: 'eventId required' });

    const {
      title, description, region, startDate, start_date,
      endDate, end_date, location, isPublic, regionScope,
      regionIds, region_scope, region_ids, images, rewardType, points,
    } = req.body;

    const now = new Date().toISOString();

    // regionScope REGION이면 regionIds 배열 강제
    let nextRegionScope = String(regionScope ?? region_scope ?? 'ALL').trim().toUpperCase();
    let nextRegionIds = regionIds ?? region_ids ?? null;
    if (Array.isArray(nextRegionIds)) {
      nextRegionIds = nextRegionIds.map((value) => String(value || '').trim()).filter(Boolean);
    } else if (typeof nextRegionIds === 'string') {
      nextRegionIds = [String(nextRegionIds).trim()].filter(Boolean);
    }
    if (nextRegionScope !== 'REGION' || !Array.isArray(nextRegionIds) || nextRegionIds.length === 0 || nextRegionIds.some((value) => value.toUpperCase() === 'ALL')) {
      nextRegionScope = 'ALL';
      nextRegionIds = [];
    }
    if (nextRegionScope === 'REGION') {
      if (Array.isArray(nextRegionIds)) {
        if (nextRegionIds.length === 0 && req.body.regionId) nextRegionIds = [req.body.regionId];
      } else if (typeof nextRegionIds === 'string') {
        nextRegionIds = [nextRegionIds];
      } else if (req.body.regionId) {
        nextRegionIds = [req.body.regionId];
      } else {
        nextRegionIds = [];
      }
      if (!Array.isArray(nextRegionIds) || nextRegionIds.length === 0) {
        logger.warn('[PUT /api/events/:id] regionScope=REGION인데 regionIds가 유효하지 않음', { regionIds: nextRegionIds, regionScope: nextRegionScope, body: req.body });
        return res.status(400).json({ error: 'regionIds required for regionScope=REGION' });
      }
    } else {
      nextRegionIds = Array.isArray(nextRegionIds) ? nextRegionIds : (nextRegionIds ? [nextRegionIds] : []);
    }
    logger.info('[PUT /api/events/:id] regionScope/regionIds', { regionScope: nextRegionScope, regionIds: nextRegionIds });

    if (USE_POSTGRES) {
      await db.run(
        `UPDATE events SET
          title = COALESCE($1, title),
          description = COALESCE($2, description),
          region = COALESCE($3, region),
          start_date = COALESCE($4, start_date),
          end_date = COALESCE($5, end_date),
          location = COALESCE($6, location),
          is_public = COALESCE($7, is_public),
          region_scope = COALESCE($8, region_scope),
          region_ids = COALESCE($9, region_ids),
          images = COALESCE($10::jsonb, images),
          reward_type = COALESCE($11, reward_type),
          points = COALESCE($12, points),
          updated_at = $13
        WHERE event_id = $14`,
        [
          title ?? null,
          description ?? null,
          region ?? null,
          startDate ?? start_date ?? null,
          endDate ?? end_date ?? null,
          location ?? null,
          isPublic !== undefined ? isPublic : null,
          nextRegionScope,
          nextRegionIds,
          images !== undefined ? serializeContentImages(images) : null,
          rewardType !== undefined ? String(rewardType || 'points').trim().toLowerCase() : null,
          points !== undefined ? (parseInt(points, 10) || 0) : null,
          now,
          eventId,
        ]
      );
    } else {
      await db.run(
        `UPDATE events SET
          title = COALESCE(?, title),
          description = COALESCE(?, description),
          region = COALESCE(?, region),
          startDate = COALESCE(?, startDate),
          endDate = COALESCE(?, endDate),
          location = COALESCE(?, location),
          isPublic = COALESCE(?, isPublic),
          regionScope = COALESCE(?, regionScope),
          regionIds = COALESCE(?, regionIds),
          images = COALESCE(?, images),
          rewardType = COALESCE(?, rewardType),
          points = COALESCE(?, points),
          updatedAt = ?
        WHERE eventId = ?`,
        [
          title ?? null,
          description ?? null,
          region ?? null,
          startDate ?? start_date ?? null,
          endDate ?? end_date ?? null,
          location ?? null,
          isPublic !== undefined ? isPublic : null,
          nextRegionScope,
          JSON.stringify(nextRegionIds),
          images !== undefined ? serializeContentImages(images) : null,
          rewardType !== undefined ? String(rewardType || 'points').trim().toLowerCase() : null,
          points !== undefined ? (parseInt(points, 10) || 0) : null,
          now,
          eventId,
        ]
      );
    }

    res.json({ ok: true, id: eventId });
  } catch (err) {
    logger.error('Error updating event:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// AUDITIONS API
// ============================================

// GET /api/auditions
app.get('/api/auditions', async (req, res) => {
  try {
    const { regionId, status, districtId } = req.query;
    
    let query, params;
    if (USE_POSTGRES) {
      let conditions = [];
      params = [];
      
      if (regionId) {
        params.push(regionId);
        conditions.push(`a.region_id = $${params.length}`);
        if (districtId) {
          params.push(districtId);
          conditions.push(`a.district_id = $${params.length}`);
        }
        // district_id IS NULL 조건 제거: 특정 구/군 오디션도 내 지역 필터에 포함
      }
      if (status) {
        params.push(status);
        conditions.push(`a.status = $${params.length}`);
      }
      
      query = `SELECT a.*, reg.name AS region_name,
                      EXISTS(
                        SELECT 1
                          FROM audition_submissions s
                         WHERE s.audition_id = a.audition_id
                           AND COALESCE(NULLIF(s.rank_label, ''), '') <> ''
                      ) AS has_ranked_submissions
                 FROM auditions a
                 LEFT JOIN regions reg ON a.region_id = reg.region_id
                 ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
                 ORDER BY a.created_at DESC`;
    } else {
      let conditions = [];
      params = [];
      
      if (regionId) {
        params.push(regionId);
        conditions.push('regionId = ?');
        if (districtId) {
          params.push(districtId);
          conditions.push('district_id = ?');
        }
        // district_id IS NULL 조건 제거: 구/군 있는 오디션도 내 지역 필터에 포함
      }
      if (status) {
        params.push(status);
        conditions.push('status = ?');
      }
      
      query = `SELECT a.*,
                      EXISTS(
                        SELECT 1
                          FROM audition_submissions s
                         WHERE s.auditionId = a.auditionId
                           AND IFNULL(NULLIF(s.rankLabel, ''), '') <> ''
                      ) AS hasRankedSubmissions
                 FROM auditions a
                 ${conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''}
                 ORDER BY createdAt DESC`;
    }
    
    const rows = await db.query(query, params);
    
    // ✅ UPDATE: 응답 정규화 (camelCase 통일)
    const normalized = rows.map(r => USE_POSTGRES ? {
      id: r.audition_id,
      auditionId: r.audition_id,
      title: r.title,
      description: r.description,
      category: r.category,
      regionId: r.region_id,
      regionName: r.region_name,
      deadline: r.deadline,
      requirements: r.requirements,
      imageUrl: getPrimaryContentImage(r.images, r.poster_url || r.image_url),
      images: normalizeContentImages(r.images, [r.poster_url, r.image_url]),
      videoUrl: r.video_url,
      status: r.status,
      createdBy: r.created_by,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      type: r.type,
      published: r.published,
      startAt: r.start_at,
      endAt: r.end_at,
      districtId: r.district_id,
      posterUrl: getPrimaryContentImage(r.images, r.poster_url || r.image_url),
      hasRankedSubmissions: !!r.has_ranked_submissions
    } : {
      id: r.auditionId,
      auditionId: r.auditionId,
      title: r.title,
      description: r.description,
      category: r.category,
      regionId: r.regionId,
      districtId: r.district_id || r.districtId,
      deadline: r.deadline,
      requirements: r.requirements,
      imageUrl: getPrimaryContentImage(r.images, r.posterUrl || r.imageUrl),
      images: normalizeContentImages(r.images, [r.posterUrl, r.imageUrl]),
      videoUrl: r.videoUrl,
      status: r.status,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      type: r.type,
      published: r.published,
      startAt: r.startAt,
      endAt: r.endAt,
      posterUrl: getPrimaryContentImage(r.images, r.posterUrl || r.imageUrl),
      hasRankedSubmissions: !!r.hasRankedSubmissions
    });
    
    res.json(normalized || []);
  } catch (err) {
    logger.error('Error fetching auditions:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auditions/highlights', async (req, res) => {
  try {
    let latestAuditionRow = null;
    let topSubmissionRow = null;

    if (USE_POSTGRES) {
      latestAuditionRow = await db.get(
        `SELECT a.*, reg.name AS region_name
         FROM auditions a
         LEFT JOIN regions reg ON a.region_id = reg.region_id
         ORDER BY a.created_at DESC
         LIMIT 1`,
        []
      );

      topSubmissionRow = await db.get(
        `SELECT s.*, a.title AS audition_title, a.audition_id, a.poster_url, a.image_url, a.images,
                COALESCE((SELECT MAX(v.created_at) FROM audition_votes v WHERE v.submission_id = s.submission_id), s.created_at) AS last_vote_at
         FROM audition_submissions s
         JOIN auditions a ON a.audition_id = s.audition_id
         WHERE COALESCE(s.approval_status, 'pending') = 'approved'
         ORDER BY s.votes_count DESC, last_vote_at ASC
         LIMIT 1`,
        []
      );
    } else {
      latestAuditionRow = await db.get(
        `SELECT * FROM auditions ORDER BY createdAt DESC LIMIT 1`,
        []
      );

      topSubmissionRow = await db.get(
        `SELECT s.*, a.title AS audition_title, a.auditionId, a.posterUrl, a.imageUrl, a.images
         FROM audition_submissions s
         JOIN auditions a ON a.auditionId = s.auditionId
         WHERE COALESCE(s.approvalStatus, 'pending') = 'approved'
         ORDER BY s.votesCount DESC, s.createdAt ASC
         LIMIT 1`,
        []
      );
    }

    const latestAudition = latestAuditionRow
      ? (USE_POSTGRES ? {
          id: latestAuditionRow.audition_id,
          auditionId: latestAuditionRow.audition_id,
          title: latestAuditionRow.title,
          description: latestAuditionRow.description,
          regionId: latestAuditionRow.region_id,
          regionName: latestAuditionRow.region_name || null,
          status: latestAuditionRow.status,
          type: latestAuditionRow.type,
          published: latestAuditionRow.published,
          startAt: latestAuditionRow.start_at,
          endAt: latestAuditionRow.end_at,
          posterUrl: getPrimaryContentImage(latestAuditionRow.images, latestAuditionRow.poster_url || latestAuditionRow.image_url),
          imageUrl: getPrimaryContentImage(latestAuditionRow.images, latestAuditionRow.poster_url || latestAuditionRow.image_url),
          createdAt: latestAuditionRow.created_at,
        } : {
          id: latestAuditionRow.auditionId,
          auditionId: latestAuditionRow.auditionId,
          title: latestAuditionRow.title,
          description: latestAuditionRow.description,
          regionId: latestAuditionRow.regionId,
          regionName: latestAuditionRow.regionName || null,
          status: latestAuditionRow.status,
          type: latestAuditionRow.type,
          published: latestAuditionRow.published,
          startAt: latestAuditionRow.startAt,
          endAt: latestAuditionRow.endAt,
          posterUrl: getPrimaryContentImage(latestAuditionRow.images, latestAuditionRow.posterUrl || latestAuditionRow.imageUrl),
          imageUrl: getPrimaryContentImage(latestAuditionRow.images, latestAuditionRow.posterUrl || latestAuditionRow.imageUrl),
          createdAt: latestAuditionRow.createdAt,
        })
      : null;

    const topSubmission = topSubmissionRow
      ? (USE_POSTGRES ? {
          id: topSubmissionRow.submission_id,
          auditionId: topSubmissionRow.audition_id,
          auditionTitle: topSubmissionRow.audition_title,
          title: topSubmissionRow.title,
          mediaType: topSubmissionRow.media_type,
          mediaUrl: topSubmissionRow.media_url,
          thumbnailUrl: topSubmissionRow.thumbnail_url,
          rankLabel: topSubmissionRow.rank_label || '',
          votesCount: topSubmissionRow.votes_count || 0,
          createdAt: topSubmissionRow.created_at,
          posterUrl: getPrimaryContentImage(topSubmissionRow.images, topSubmissionRow.poster_url || topSubmissionRow.image_url),
        } : {
          id: topSubmissionRow.submissionId,
          auditionId: topSubmissionRow.auditionId,
          auditionTitle: topSubmissionRow.audition_title,
          title: topSubmissionRow.title,
          mediaType: topSubmissionRow.mediaType,
          mediaUrl: topSubmissionRow.mediaUrl,
          thumbnailUrl: topSubmissionRow.thumbnailUrl,
          rankLabel: topSubmissionRow.rankLabel || '',
          votesCount: topSubmissionRow.votesCount || 0,
          createdAt: topSubmissionRow.createdAt,
          posterUrl: getPrimaryContentImage(topSubmissionRow.images, topSubmissionRow.posterUrl || topSubmissionRow.imageUrl),
        })
      : null;

    res.json({ latestAudition, topSubmission });
  } catch (err) {
    logger.error('Error fetching audition highlights:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auditions/:id
app.get('/api/auditions/:id(\\d+)', async (req, res) => {
  try {
    const auditionId = req.params.id;
    
    const query = USE_POSTGRES
      ? 'SELECT a.*, reg.name AS region_name FROM auditions a LEFT JOIN regions reg ON a.region_id = reg.region_id WHERE a.audition_id = $1'
      : 'SELECT * FROM auditions WHERE auditionId = ?';
    
    const row = await db.get(query, [auditionId]);
    if (!row) {
      return res.status(404).json({ error: 'Audition not found' });
    }
    
    // ✅ UPDATE: 응답 정규화 (camelCase 통일)
    const normalized = USE_POSTGRES ? {
      id: row.audition_id,
      auditionId: row.audition_id,
      title: row.title,
      description: row.description,
      category: row.category,
      regionId: row.region_id,
      regionName: row.region_name || null,
      deadline: row.deadline,
      requirements: row.requirements,
      imageUrl: getPrimaryContentImage(row.images, row.poster_url || row.image_url),
      images: normalizeContentImages(row.images, [row.poster_url, row.image_url]),
      videoUrl: row.video_url,
      status: row.status,
      createdBy: row.created_by,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      type: row.type,
      published: row.published,
      startAt: row.start_at,
      endAt: row.end_at,
      posterUrl: getPrimaryContentImage(row.images, row.poster_url || row.image_url)
    } : {
      id: row.auditionId,
      auditionId: row.auditionId,
      title: row.title,
      description: row.description,
      category: row.category,
      regionId: row.regionId,
      deadline: row.deadline,
      requirements: row.requirements,
      imageUrl: getPrimaryContentImage(row.images, row.posterUrl || row.imageUrl),
      images: normalizeContentImages(row.images, [row.posterUrl, row.imageUrl]),
      videoUrl: row.videoUrl,
      status: row.status,
      createdBy: row.createdBy,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      type: row.type,
      published: row.published,
      startAt: row.startAt,
      endAt: row.endAt,
      posterUrl: getPrimaryContentImage(row.images, row.posterUrl || row.imageUrl)
    };
    
    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching audition:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auditions
app.post('/api/auditions', async (req, res) => {
  try {
    console.log('[POST /api/auditions] Received body:', JSON.stringify(req.body, null, 2));
    const a = req.body || {};
    if (!a.title) {
      console.error('[POST /api/auditions] Missing title');
      return res.status(400).json({ error: 'title required' });
    }

    const now = new Date().toISOString();
    const images = normalizeContentImages(a.images, [a.posterUrl, a.imageUrl]);

    // ✅ UPDATE: type, published, startAt, endAt, posterUrl 필드 추가
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO auditions(title, description, category, region_id, deadline, requirements, image_url, images, video_url, status, created_by, created_at, updated_at, type, published, start_at, end_at, poster_url)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING audition_id
      `;
      const result = await db.query(query, [
        a.title,
        a.description || '',
        a.category || '',
        a.regionId || null,
        a.deadline || null,
        a.requirements || '',
        images[0] || '',
        serializeContentImages(images),
        a.videoUrl || '',
        a.status || 'OPEN',
        a.createdBy || '',
        now,
        now,
        a.type || 'FREE',
        a.published !== undefined ? a.published : true,
        a.startAt || null,
        a.endAt || null,
        images[0] || ''
      ]);
      const auditionId = result && result[0] ? result[0].audition_id : null;
      console.log('[POST /api/auditions] Created successfully (Postgres):', auditionId);
      res.json({ ok: true, auditionId });
    } else {
      // ✅ UPDATE: SQLite에 type, published, startAt, endAt, posterUrl 추가
      const query = `
        INSERT INTO auditions(title, description, category, regionId, deadline, requirements, imageUrl, images, videoUrl, status, createdBy, createdAt, updatedAt, type, published, startAt, endAt, posterUrl)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      console.log('[POST /api/auditions] SQLite query params:', [
        a.title,
        a.description || '',
        a.category || '',
        a.regionId || null,
        a.deadline || null,
        a.requirements || '',
        images[0] || '',
        serializeContentImages(images),
        a.videoUrl || '',
        a.status || 'OPEN',
        a.createdBy || '',
        now,
        now,
        a.type || 'FREE',
        a.published !== undefined ? (a.published ? 1 : 0) : 1,
        a.startAt || null,
        a.endAt || null,
        images[0] || ''
      ]);
      const result = await db.run(query, [
        a.title,
        a.description || '',
        a.category || '',
        a.regionId || null,
        a.deadline || null,
        a.requirements || '',
        images[0] || '',
        serializeContentImages(images),
        a.videoUrl || '',
        a.status || 'OPEN',
        a.createdBy || '',
        now,
        now,
        a.type || 'FREE',
        a.published !== undefined ? (a.published ? 1 : 0) : 1,
        a.startAt || null,
        a.endAt || null,
        images[0] || ''
      ]);
      const auditionId = result && result.lastID ? result.lastID : null;
      console.log('[POST /api/auditions] Created successfully (SQLite):', auditionId);
      res.json({ ok: true, auditionId });
    }
  } catch (err) {
    console.error('[POST /api/auditions] Error:', err);
    console.error('[POST /api/auditions] Stack:', err.stack);
    logger.error('Error creating audition:', err, { body: req.body });
    // If body caused parse error or DB constraint, surface 400 when possible
    if (err && err.message && /NOT NULL|constraint|column .* is required/i.test(err.message)) {
      return res.status(400).json({ error: 'invalid audition data', detail: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/auditions/:id
app.put('/api/auditions/:id', async (req, res) => {
  try {
    const auditionId = req.params.id;
    const a = req.body || {};
    const now = new Date().toISOString();
    const images = normalizeContentImages(a.images, [a.posterUrl, a.imageUrl]);

    const existing = await db.get(
      USE_POSTGRES
        ? 'SELECT audition_id, status, start_at, end_at, region_id, type, published FROM auditions WHERE audition_id = $1'
        : 'SELECT auditionId, status, startAt, endAt, regionId, type, published FROM auditions WHERE auditionId = ?',
      [auditionId]
    );
    if (!existing) {
      return res.status(404).json({ error: 'Audition not found' });
    }

    const existingStatus = String(existing.status || 'OPEN').trim().toUpperCase();
    const existingEndAt = USE_POSTGRES ? existing.end_at : existing.endAt;
    const existingStartAt = USE_POSTGRES ? existing.start_at : existing.startAt;
    const existingRegionId = USE_POSTGRES ? existing.region_id : existing.regionId;
    const existingType = existing.type || 'FREE';
    const existingPublished = existing.published;
    const existingEndedByDate = !!(existingEndAt && !Number.isNaN(new Date(existingEndAt).getTime()) && new Date(existingEndAt).getTime() < Date.now());
    const existingClosed = existingStatus === 'CLOSED' || existingEndedByDate;

    let nextStatus = String(a.status || '').trim().toUpperCase() || existingStatus || 'OPEN';
    if (existingClosed && nextStatus === 'OPEN') {
      nextStatus = 'CLOSED';
    }

    const nextStartAt = a.startAt !== undefined ? (a.startAt || null) : (existingStartAt || null);
    const nextEndAt = a.endAt !== undefined ? (a.endAt || null) : (existingEndAt || null);
    const nextRegionId = a.regionId !== undefined ? (a.regionId || null) : (existingRegionId || null);
    const nextType = a.type || existingType || 'FREE';
    const nextPublished = a.published !== undefined ? a.published : existingPublished;
    
    // ✅ UPDATE: type, published, startAt, endAt, posterUrl 필드 추가
    if (USE_POSTGRES) {
      const query = `
        UPDATE auditions SET
          title = $1,
          description = $2,
          category = $3,
          region_id = $4,
          deadline = $5,
          requirements = $6,
          image_url = $7,
          images = $8::jsonb,
          video_url = $9,
          status = $10,
          updated_at = $11,
          type = $12,
          published = $13,
          start_at = $14,
          end_at = $15,
          poster_url = $16
        WHERE audition_id = $17
      `;
      await db.run(query, [
        a.title,
        a.description || '',
        a.category || '',
        nextRegionId,
        a.deadline || null,
        a.requirements || '',
        images[0] || '',
        serializeContentImages(images),
        a.videoUrl || '',
        nextStatus,
        now,
        nextType,
        nextPublished,
        nextStartAt,
        nextEndAt,
        images[0] || '',
        auditionId
      ]);
    } else {
      // ✅ UPDATE: SQLite UPDATE에 새 필드 추가
      const query = `
        UPDATE auditions SET
          title = ?,
          description = ?,
          category = ?,
          regionId = ?,
          deadline = ?,
          requirements = ?,
          imageUrl = ?,
          images = ?,
          videoUrl = ?,
          status = ?,
          updatedAt = ?,
          type = ?,
          published = ?,
          startAt = ?,
          endAt = ?,
          posterUrl = ?
        WHERE auditionId = ?
      `;
      await db.run(query, [
        a.title,
        a.description || '',
        a.category || '',
        nextRegionId,
        a.deadline || null,
        a.requirements || '',
        images[0] || '',
        serializeContentImages(images),
        a.videoUrl || '',
        nextStatus,
        now,
        nextType,
        nextPublished !== undefined ? (nextPublished ? 1 : 0) : 1,
        nextStartAt,
        nextEndAt,
        images[0] || '',
        auditionId
      ]);
    }
    
    res.json({ ok: true, auditionId });
  } catch (err) {
    logger.error('Error updating audition:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auditions/:id
app.delete('/api/auditions/:id', async (req, res) => {
  try {
    const auditionId = req.params.id;
    if (!auditionId) return res.status(400).json({ error: 'auditionId required' });
    
    const query = USE_POSTGRES
      ? 'DELETE FROM auditions WHERE audition_id = $1'
      : 'DELETE FROM auditions WHERE auditionId = ?';
    await db.run(query, [auditionId]);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting audition:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/auditions/:id/submissions - Get submissions for an audition
app.get('/api/auditions/:id/submissions', async (req, res) => {
  try {
    const auditionId = USE_POSTGRES ? parseInt(req.params.id, 10) : req.params.id;
    const auth = await getOptionalAuth(req);

    // detect current session (if any) to include 'voted' flag per submission
    const voterId = auth.memberId || null;

    let rows;
    if (USE_POSTGRES) {
      if (voterId) {
        const query = `SELECT s.*, m.name as member_name,
                       COALESCE((SELECT MAX(v2.created_at) FROM audition_votes v2 WHERE v2.submission_id = s.submission_id), s.created_at) AS last_vote_at,
                       (v.voter_id IS NOT NULL) as voted
                       FROM audition_submissions s
                       LEFT JOIN members m ON s.member_id = m.member_id
                       LEFT JOIN audition_votes v ON v.submission_id = s.submission_id AND v.voter_id = $2
                       WHERE s.audition_id = $1
                       ORDER BY s.votes_count DESC, last_vote_at ASC`;
        rows = await db.query(query, [auditionId, voterId]);
      } else {
        const query = `SELECT s.*, m.name as member_name,
                       COALESCE((SELECT MAX(v2.created_at) FROM audition_votes v2 WHERE v2.submission_id = s.submission_id), s.created_at) AS last_vote_at,
                       false as voted
                       FROM audition_submissions s
                       LEFT JOIN members m ON s.member_id = m.member_id
                       WHERE s.audition_id = $1
                       ORDER BY s.votes_count DESC, last_vote_at ASC`;
        rows = await db.query(query, [auditionId]);
      }
    } else {
      if (voterId) {
        const query = `SELECT s.*, m.name as member_name, (CASE WHEN v.voterId IS NOT NULL THEN 1 ELSE 0 END) as voted
                       FROM audition_submissions s
                       LEFT JOIN members m ON s.memberId = m.memberId
                       LEFT JOIN audition_votes v ON v.submissionId = s.submissionId AND v.voterId = ?
                       WHERE s.auditionId = ?
                       ORDER BY s.votesCount DESC, s.createdAt ASC`;
        rows = await db.query(query, [voterId, auditionId]);
      } else {
        const query = `SELECT s.*, m.name as member_name, 0 as voted
                       FROM audition_submissions s
                       LEFT JOIN members m ON s.memberId = m.memberId
                       WHERE s.auditionId = ?
                       ORDER BY s.createdAt DESC`;
        rows = await db.query(query, [auditionId]);
      }
    }

    const normalized = (rows || [])
      .map((r) => mapAuditionSubmissionForViewer(r, auth))
      .filter(Boolean);
    
    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching submissions:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auditions/:id/submissions - Create a submission
app.post('/api/auditions/:id/submissions', async (req, res) => {
  try {
    const auditionId = USE_POSTGRES ? parseInt(req.params.id, 10) : req.params.id;
    const token = getAuthToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get memberId from session
    const session = await db.get(
      USE_POSTGRES
        ? 'SELECT member_id FROM sessions WHERE session_id = $1'
        : 'SELECT memberId FROM sessions WHERE sessionId = ?',
      [token]
    );
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const memberId = USE_POSTGRES ? session.member_id : session.memberId;
    const { title, mediaType, mediaUrl, thumbnailUrl } = req.body;
    
    if (!mediaType || !mediaUrl) {
      return res.status(400).json({ error: 'mediaType and mediaUrl required' });
    }
    
    // ✅ YouTube URL 유효성 검증
    if (mediaType === 'youtube' && typeof mediaUrl === 'string') {
      const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|embed\/|shorts\/)[a-zA-Z0-9_-]{6,}|youtu\.be\/[a-zA-Z0-9_-]{6,})/;
      if (!youtubeRegex.test(mediaUrl)) {
        return res.status(400).json({ 
          error: '올바른 YouTube 영상 URL을 입력해주세요',
          details: '예: https://www.youtube.com/watch?v=... 또는 https://www.youtube.com/shorts/...'
        });
      }
    }
    
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO audition_submissions(audition_id, member_id, title, media_type, media_url, thumbnail_url, approval_status, created_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING submission_id
      `;
      const result = await db.query(query, [
        auditionId,
        memberId,
        title || '',
        mediaType,
        mediaUrl,
        thumbnailUrl || null,
        'pending',
        now
      ]);
      const submissionId = result && result[0] ? result[0].submission_id : null;
      res.json({ ok: true, submissionId, approvalStatus: 'pending' });
    } else {
      const query = `
        INSERT INTO audition_submissions(auditionId, memberId, title, mediaType, mediaUrl, thumbnailUrl, approvalStatus, createdAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const result = await db.run(query, [
        auditionId,
        memberId,
        title || '',
        mediaType,
        mediaUrl,
        thumbnailUrl || null,
        'pending',
        now
      ]);
      const submissionId = result && result.lastID ? result.lastID : null;
      res.json({ ok: true, submissionId, approvalStatus: 'pending' });
    }
  } catch (err) {
    logger.error('Error creating submission:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/auditions/:id/submissions/:sid - Delete own submission (ADMIN can delete anyone's)
app.delete('/api/auditions/:id/submissions/:sid', async (req, res) => {
  try {
    const { id: auditionId, sid: submissionId } = req.params;
    const token = getAuthToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get memberId + role from session
    const session = await db.get(
      USE_POSTGRES
        ? 'SELECT s.member_id, m.role FROM sessions s JOIN members m ON s.member_id = m.member_id WHERE s.session_id = $1'
        : 'SELECT s.memberId, m.role FROM sessions s JOIN members m ON s.memberId = m.memberId WHERE s.sessionId = ?',
      [token]
    );
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const memberId = USE_POSTGRES ? session.member_id : session.memberId;
    const role = String(session.role || 'USER').toUpperCase();
    
    // ADMIN은 소유권 체크 없이 삭제 가능
    if (role !== 'ADMIN') {
      const submission = await db.get(
        USE_POSTGRES
          ? 'SELECT member_id FROM audition_submissions WHERE submission_id = $1'
          : 'SELECT memberId FROM audition_submissions WHERE submissionId = ?',
        [submissionId]
      );
      
      if (!submission) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      const submissionMemberId = USE_POSTGRES ? submission.member_id : submission.memberId;
      if (submissionMemberId !== memberId) {
        return res.status(403).json({ error: 'Forbidden' });
      }
    }
    
    // Delete
    const query = USE_POSTGRES
      ? 'DELETE FROM audition_submissions WHERE submission_id = $1'
      : 'DELETE FROM audition_submissions WHERE submissionId = ?';
    
    await db.run(query, [submissionId]);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting submission:', err);
    res.status(500).json({ error: err.message });
  }
});

// ADMIN/REGION_ADMIN: PATCH /api/auditions/:id/submissions/:sid - 참가작 결과/제목 수정
app.patch('/api/auditions/:id/submissions/:sid', requireAuth, async (req, res) => {
  try {
    const { sid: submissionId } = req.params;
    const allowed = await canModerateAuditionSubmission(req.authMemberId, req.authRole, submissionId);
    if (!allowed) return res.status(403).json({ error: 'Forbidden' });

    const body = req.body || {};
    const nextTitle = body.title !== undefined ? String(body.title || '').trim() : undefined;
    const nextRankLabel = body.rankLabel !== undefined ? String(body.rankLabel || '').trim() : undefined;
    const rawApprovalStatus = body.approvalStatus !== undefined ? body.approvalStatus : body.approval_status;
    const nextApprovalStatus = rawApprovalStatus !== undefined
      ? String(rawApprovalStatus || '').trim().toLowerCase()
      : undefined;
    if (nextTitle === undefined && nextRankLabel === undefined && nextApprovalStatus === undefined) {
      return res.status(400).json({ error: 'no fields' });
    }
    if (nextTitle !== undefined && !nextTitle) {
      return res.status(400).json({ error: 'title required' });
    }
    if (nextApprovalStatus !== undefined && !['pending', 'approved', 'rejected'].includes(nextApprovalStatus)) {
      return res.status(400).json({ error: 'invalid approvalStatus' });
    }

    let updated = null;
    if (USE_POSTGRES) {
      const fields = [];
      const values = [];
      if (nextTitle !== undefined) {
        fields.push(`title = $${values.length + 1}`);
        values.push(nextTitle);
      }
      if (nextRankLabel !== undefined) {
        fields.push(`rank_label = $${values.length + 1}`);
        values.push(nextRankLabel || null);
      }
      if (nextApprovalStatus !== undefined) {
        fields.push(`approval_status = $${values.length + 1}`);
        values.push(nextApprovalStatus);
      }
      values.push(submissionId);
      updated = await db.get(
        `UPDATE audition_submissions
            SET ${fields.join(', ')}
          WHERE submission_id = $${values.length}
        RETURNING submission_id, audition_id, member_id, title, media_type, media_url, thumbnail_url, votes_count, rank_label, approval_status, created_at`,
        values
      );
    } else {
      const fields = [];
      const values = [];
      if (nextTitle !== undefined) {
        fields.push('title = ?');
        values.push(nextTitle);
      }
      if (nextRankLabel !== undefined) {
        fields.push('rankLabel = ?');
        values.push(nextRankLabel || null);
      }
      if (nextApprovalStatus !== undefined) {
        fields.push('approvalStatus = ?');
        values.push(nextApprovalStatus);
      }
      values.push(submissionId);
      await db.run(`UPDATE audition_submissions SET ${fields.join(', ')} WHERE submissionId = ?`, values);
      updated = await db.get(
        `SELECT submissionId, auditionId, memberId, title, mediaType, mediaUrl, thumbnailUrl, votesCount, rankLabel, approvalStatus, createdAt
           FROM audition_submissions
          WHERE submissionId = ?`,
        [submissionId]
      );
    }
    if (!updated) return res.status(404).json({ error: 'Submission not found' });

    console.log('[PATCH /api/auditions/:id/submissions/:sid] updated submission', USE_POSTGRES ? {
      submissionId: updated.submission_id,
      rankLabel: updated.rank_label || '',
      title: updated.title,
      approvalStatus: updated.approval_status,
    } : {
      submissionId: updated.submissionId,
      rankLabel: updated.rankLabel || '',
      title: updated.title,
      approvalStatus: updated.approvalStatus,
    });

    const mapped = mapAuditionSubmissionForViewer(updated, {
      memberId: req.authMemberId,
      role: req.authRole,
    }, { forceInclude: true });

    res.json({
      ok: true,
      submission: mapped || (USE_POSTGRES ? {
        id: updated.submission_id,
        submissionId: updated.submission_id,
        auditionId: updated.audition_id,
        memberId: updated.member_id,
        title: updated.title,
        mediaType: updated.media_type,
        mediaUrl: updated.media_url,
        thumbnailUrl: updated.thumbnail_url,
        votesCount: updated.votes_count || 0,
        rankLabel: updated.rank_label || '',
        approvalStatus: updated.approval_status || 'pending',
        createdAt: updated.created_at,
      } : {
        id: updated.submissionId,
        submissionId: updated.submissionId,
        auditionId: updated.auditionId,
        memberId: updated.memberId,
        title: updated.title,
        mediaType: updated.mediaType,
        mediaUrl: updated.mediaUrl,
        thumbnailUrl: updated.thumbnailUrl,
        votesCount: updated.votesCount || 0,
        rankLabel: updated.rankLabel || '',
        approvalStatus: updated.approvalStatus || 'pending',
        createdAt: updated.createdAt,
      })
    });
  } catch (err) {
    logger.error('Error updating submission:', err);
    res.status(500).json({ error: err.message });
  }
});

// ADMIN: DELETE /api/auditions/:id/submissions/:sid/admin - 관리자 강제 삭제 (소유권 불요)
app.delete('/api/auditions/:id/submissions/:sid/admin', async (req, res) => {
  try {
    const { sid: submissionId } = req.params;
    const query = USE_POSTGRES
      ? 'DELETE FROM audition_submissions WHERE submission_id = $1'
      : 'DELETE FROM audition_submissions WHERE submissionId = ?';
    await db.run(query, [submissionId]);
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error admin-deleting submission:', err);
    res.status(500).json({ error: err.message });
  }
});

// ✨ ADD: POST /api/auditions/:id/submissions/:sid/vote - 투표 (1인 1표)
app.post('/api/auditions/:id/submissions/:sid/vote', async (req, res) => {
  try {
    const { sid: submissionId } = req.params;
    const token = getAuthToken(req);
    
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get memberId from session
    const session = await db.get(
      USE_POSTGRES
        ? 'SELECT member_id FROM sessions WHERE session_id = $1'
        : 'SELECT memberId FROM sessions WHERE sessionId = ?',
      [token]
    );
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid session' });
    }
    
    const voterId = USE_POSTGRES ? session.member_id : session.memberId;

    const submissionRow = await db.get(
      USE_POSTGRES
        ? 'SELECT submission_id, approval_status FROM audition_submissions WHERE submission_id = $1'
        : 'SELECT submissionId, approvalStatus FROM audition_submissions WHERE submissionId = ?',
      [submissionId]
    );
    if (!submissionRow) {
      return res.status(404).json({ error: 'Submission not found' });
    }
    if (getSubmissionApprovalStatus(submissionRow) !== 'approved') {
      return res.status(403).json({ error: '승인된 참가작만 투표할 수 있습니다.' });
    }
    
    // Check if already voted
    const existing = await db.get(
      USE_POSTGRES
        ? 'SELECT * FROM audition_votes WHERE submission_id = $1 AND voter_id = $2'
        : 'SELECT * FROM audition_votes WHERE submissionId = ? AND voterId = ?',
      [submissionId, voterId]
    );
    
    if (existing) {
      return res.status(400).json({ error: 'Already voted' });
    }
    
    // Insert vote
    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run(
        'INSERT INTO audition_votes(submission_id, voter_id, created_at) VALUES($1, $2, $3)',
        [submissionId, voterId, now]
      );
      // Update votesCount
      await db.run('UPDATE audition_submissions SET votes_count = votes_count + 1 WHERE submission_id = $1', [submissionId]);
    } else {
      await db.run(
        'INSERT INTO audition_votes(submissionId, voterId, createdAt) VALUES(?, ?, ?)',
        [submissionId, voterId, now]
      );
      // Update votesCount
      await db.run('UPDATE audition_submissions SET votesCount = votesCount + 1 WHERE submissionId = ?', [submissionId]);
    }
    
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error voting:', err);
    res.status(500).json({ error: err.message });
  }
});

function normalizeAuditionSubmissionComment(row) {
  if (!row) return null;
  return USE_POSTGRES ? {
    id: row.comment_id,
    commentId: row.comment_id,
    submissionId: row.submission_id,
    authorId: row.author_id,
    authorName: row.author_name || '회원',
    content: row.content || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at || row.created_at,
  } : {
    id: row.commentId,
    commentId: row.commentId,
    submissionId: row.submissionId,
    authorId: row.authorId,
    authorName: row.authorName || '회원',
    content: row.content || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt || row.createdAt,
  };
}

app.get('/api/auditions/:id/submissions/:sid/comments', async (req, res) => {
  try {
    const auditionId = USE_POSTGRES ? parseInt(req.params.id, 10) : req.params.id;
    const submissionId = USE_POSTGRES ? parseInt(req.params.sid, 10) : req.params.sid;

    const rows = USE_POSTGRES
      ? await db.query(
          `SELECT c.comment_id, c.submission_id, c.author_id,
                  COALESCE(NULLIF(c.author_name, ''), m.name, '회원') AS author_name,
                  c.content, c.created_at, c.updated_at
             FROM audition_submission_comments c
             JOIN audition_submissions s ON s.submission_id = c.submission_id
             LEFT JOIN members m ON m.member_id = c.author_id
            WHERE s.audition_id = $1 AND c.submission_id = $2
            ORDER BY c.created_at DESC, c.comment_id DESC`,
          [auditionId, submissionId]
        )
      : await db.query(
          `SELECT c.commentId, c.submissionId, c.authorId,
                  COALESCE(NULLIF(c.authorName, ''), m.name, '회원') AS authorName,
                  c.content, c.createdAt, c.updatedAt
             FROM audition_submission_comments c
             JOIN audition_submissions s ON s.submissionId = c.submissionId
             LEFT JOIN members m ON m.memberId = c.authorId
            WHERE s.auditionId = ? AND c.submissionId = ?
            ORDER BY c.createdAt DESC, c.commentId DESC`,
          [auditionId, submissionId]
        );

    return res.json(Array.isArray(rows) ? rows.map(normalizeAuditionSubmissionComment) : []);
  } catch (err) {
    logger.error('Error fetching audition submission comments:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.post('/api/auditions/:id/submissions/:sid/comments', requireAuth, async (req, res) => {
  try {
    const auditionId = USE_POSTGRES ? parseInt(req.params.id, 10) : req.params.id;
    const submissionId = USE_POSTGRES ? parseInt(req.params.sid, 10) : req.params.sid;
    const content = String(req.body?.content || '').trim();

    if (!content) return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    if (content.length > 500) return res.status(400).json({ error: '댓글은 500자 이하로 입력해주세요.' });

    const submission = USE_POSTGRES
      ? await db.get('SELECT submission_id FROM audition_submissions WHERE submission_id = $1 AND audition_id = $2', [submissionId, auditionId])
      : await db.get('SELECT submissionId FROM audition_submissions WHERE submissionId = ? AND auditionId = ?', [submissionId, auditionId]);

    if (!submission) return res.status(404).json({ error: '참가 영상을 찾을 수 없습니다.' });

    const member = USE_POSTGRES
      ? await db.get('SELECT member_id, name FROM members WHERE member_id = $1', [req.authMemberId])
      : await db.get('SELECT memberId, name FROM members WHERE memberId = ?', [req.authMemberId]);

    if (!member) return res.status(401).json({ error: '회원 정보를 찾을 수 없습니다.' });

    const authorId = USE_POSTGRES ? member.member_id : member.memberId;
    const authorName = member.name || '회원';
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      const inserted = await db.get(
        `INSERT INTO audition_submission_comments(submission_id, author_id, author_name, content, created_at, updated_at)
         VALUES($1, $2, $3, $4, $5, $6)
         RETURNING comment_id, submission_id, author_id, author_name, content, created_at, updated_at`,
        [submissionId, authorId, authorName, content, now, now]
      );
      return res.json({ ok: true, comment: normalizeAuditionSubmissionComment(inserted) });
    }

    const result = await db.run(
      `INSERT INTO audition_submission_comments(submissionId, authorId, authorName, content, createdAt, updatedAt)
       VALUES(?, ?, ?, ?, ?, ?)`,
      [submissionId, authorId, authorName, content, now, now]
    );
    const inserted = await db.get('SELECT * FROM audition_submission_comments WHERE commentId = ?', [result.lastID]);
    return res.json({ ok: true, comment: normalizeAuditionSubmissionComment(inserted) });
  } catch (err) {
    logger.error('Error creating audition submission comment:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.patch('/api/auditions/:id/submissions/:sid/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const auditionId = USE_POSTGRES ? parseInt(req.params.id, 10) : req.params.id;
    const submissionId = USE_POSTGRES ? parseInt(req.params.sid, 10) : req.params.sid;
    const commentId = USE_POSTGRES ? parseInt(req.params.commentId, 10) : req.params.commentId;
    const content = String(req.body?.content || '').trim();

    if (!content) return res.status(400).json({ error: '댓글 내용을 입력해주세요.' });
    if (content.length > 500) return res.status(400).json({ error: '댓글은 500자 이하로 입력해주세요.' });

    const existing = USE_POSTGRES
      ? await db.get(
          `SELECT c.comment_id, c.author_id
             FROM audition_submission_comments c
             JOIN audition_submissions s ON s.submission_id = c.submission_id
            WHERE c.comment_id = $1 AND c.submission_id = $2 AND s.audition_id = $3`,
          [commentId, submissionId, auditionId]
        )
      : await db.get(
          `SELECT c.commentId, c.authorId
             FROM audition_submission_comments c
             JOIN audition_submissions s ON s.submissionId = c.submissionId
            WHERE c.commentId = ? AND c.submissionId = ? AND s.auditionId = ?`,
          [commentId, submissionId, auditionId]
        );

    if (!existing) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });

    const existingAuthorId = USE_POSTGRES ? existing.author_id : existing.authorId;
    if (String(existingAuthorId) !== String(req.authMemberId)) {
      return res.status(403).json({ error: '본인 댓글만 수정할 수 있습니다.' });
    }

    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      const updated = await db.get(
        `UPDATE audition_submission_comments
            SET content = $1, updated_at = $2
          WHERE comment_id = $3
          RETURNING comment_id, submission_id, author_id, author_name, content, created_at, updated_at`,
        [content, now, commentId]
      );
      return res.json({ ok: true, comment: normalizeAuditionSubmissionComment(updated) });
    }

    await db.run(
      'UPDATE audition_submission_comments SET content = ?, updatedAt = ? WHERE commentId = ?',
      [content, now, commentId]
    );
    const updated = await db.get('SELECT * FROM audition_submission_comments WHERE commentId = ?', [commentId]);
    return res.json({ ok: true, comment: normalizeAuditionSubmissionComment(updated) });
  } catch (err) {
    logger.error('Error updating audition submission comment:', err);
    return res.status(500).json({ error: err.message });
  }
});

app.delete('/api/auditions/:id/submissions/:sid/comments/:commentId', requireAuth, async (req, res) => {
  try {
    const auditionId = USE_POSTGRES ? parseInt(req.params.id, 10) : req.params.id;
    const submissionId = USE_POSTGRES ? parseInt(req.params.sid, 10) : req.params.sid;
    const commentId = USE_POSTGRES ? parseInt(req.params.commentId, 10) : req.params.commentId;

    const existing = USE_POSTGRES
      ? await db.get(
          `SELECT c.comment_id, c.author_id
             FROM audition_submission_comments c
             JOIN audition_submissions s ON s.submission_id = c.submission_id
            WHERE c.comment_id = $1 AND c.submission_id = $2 AND s.audition_id = $3`,
          [commentId, submissionId, auditionId]
        )
      : await db.get(
          `SELECT c.commentId, c.authorId
             FROM audition_submission_comments c
             JOIN audition_submissions s ON s.submissionId = c.submissionId
            WHERE c.commentId = ? AND c.submissionId = ? AND s.auditionId = ?`,
          [commentId, submissionId, auditionId]
        );

    if (!existing) return res.status(404).json({ error: '댓글을 찾을 수 없습니다.' });

    const existingAuthorId = USE_POSTGRES ? existing.author_id : existing.authorId;
    const canModerate = await canModerateAuditionSubmission(req.authMemberId, req.authRole, submissionId);
    if (String(existingAuthorId) !== String(req.authMemberId) && !canModerate) {
      return res.status(403).json({ error: '댓글을 삭제할 권한이 없습니다.' });
    }

    if (USE_POSTGRES) {
      await db.run('DELETE FROM audition_submission_comments WHERE comment_id = $1', [commentId]);
    } else {
      await db.run('DELETE FROM audition_submission_comments WHERE commentId = ?', [commentId]);
    }

    return res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting audition submission comment:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ============================================
// BANNERS API
// ============================================

// POST /api/banners/upload - Image upload with auto-resize
app.post('/api/banners/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFilename = `optimized_${req.file.filename}`;
    const outputPath = path.join(UPLOADS_DIR, outputFilename);

    // Auto-resize to 800x267 (3:1 ratio) and optimize
    await sharp(inputPath)
      .resize(800, 267, {
        fit: 'cover',
        position: 'center'
      })
      .jpeg({ quality: 85 })
      .toFile(outputPath);

    // Delete original file
    fs.unlinkSync(inputPath);

    // Return URL
    const imageUrl = `/uploads/banners/${outputFilename}`;
    
    res.json({
      ok: true,
      imageUrl,
      filename: outputFilename
    });
  } catch (err) {
    logger.error('Error uploading banner image:', err);
    // Clean up file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(500).json({ error: err.message });
  }
});

const CONTENT_UPLOADS_DIR = path.join(__dirname, 'uploads', 'content');
if (!fs.existsSync(CONTENT_UPLOADS_DIR)) {
  fs.mkdirSync(CONTENT_UPLOADS_DIR, { recursive: true });
}

const handleContentImageUpload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const inputPath = req.file.path;
    const outputFilename = `content_${Date.now()}_${Math.floor(Math.random() * 10000)}.webp`;
    const outputPath = path.join(CONTENT_UPLOADS_DIR, outputFilename);

    await sharp(inputPath)
      .rotate()
      .resize(1600, 1600, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86 })
      .toFile(outputPath);

    fs.unlinkSync(inputPath);

    res.json({
      ok: true,
      imageUrl: `/uploads/content/${outputFilename}`,
      filename: outputFilename,
    });
  } catch (err) {
    logger.error('Error uploading content image:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      try { fs.unlinkSync(req.file.path); } catch (cleanupError) {}
    }
    res.status(500).json({ error: err.message });
  }
};

app.post('/api/content-images/upload', upload.single('image'), handleContentImageUpload);
app.post('/api/upload/content-image', upload.single('image'), handleContentImageUpload);
app.post('/api/upload/content-images', upload.single('image'), handleContentImageUpload);

// POST /api/upload/region-image - Phase A-5: 지역 허브 이미지 업로드
const REGION_UPLOADS_DIR = path.join(__dirname, 'uploads', 'regions');
if (!fs.existsSync(REGION_UPLOADS_DIR)) {
  fs.mkdirSync(REGION_UPLOADS_DIR, { recursive: true });
}
const regionImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const regionId = req.params.regionId || req.body.regionId || 'common';
      const dir = path.join(REGION_UPLOADS_DIR, String(regionId).replace(/[^a-zA-Z0-9_-]/g, '_'));
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const regionId = req.params.regionId || req.body.regionId || 'common';
      cb(null, `region_${regionId}_${Date.now()}.webp`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('허용되지 않는 파일 형식 (jpeg/png/webp만 허용)'));
  },
});
app.post('/api/upload/region-image', requireAuth, regionImageUpload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const inputPath = req.file.path;
    const thumbName = `thumb_${path.basename(inputPath)}`;
    const thumbPath = path.join(path.dirname(inputPath), thumbName);
    // WebP 변환 + 썸네일 생성
    await sharp(inputPath).resize(1200).webp({ quality: 85 }).toFile(inputPath + '.tmp');
    fs.renameSync(inputPath + '.tmp', inputPath);
    await sharp(inputPath).resize(400).webp({ quality: 75 }).toFile(thumbPath);
    const relBase = inputPath.split(path.sep + 'uploads' + path.sep)[1];
    const url = `/uploads/${relBase.replace(/\\/g, '/')}`;
    const thumbUrl = `/uploads/${path.join('regions', path.relative(REGION_UPLOADS_DIR, thumbPath)).replace(/\\/g, '/')}`;
    return res.json({ ok: true, url, thumbUrl });
  } catch (err) {
    logger.error('Error uploading region image:', err);
    if (req.file && fs.existsSync(req.file.path)) { try { fs.unlinkSync(req.file.path); } catch (e) {} }
    return res.status(500).json({ error: err.message });
  }
});

// GET /api/banners - List banners with filters
app.get('/api/banners', async (req, res) => {
  try {
    const { regionId, activeOnly, type } = req.query;

    const parseBannerRegions = (raw) => {
      if (Array.isArray(raw)) return raw.map((v) => String(v || '').trim()).filter(Boolean);
      if (raw == null) return [];

      let value = raw;
      for (let i = 0; i < 2; i += 1) {
        if (typeof value !== 'string') break;
        const trimmed = value.trim();
        if (!trimmed) return [];
        try {
          value = JSON.parse(trimmed);
        } catch (e) {
          return [];
        }
      }

      if (Array.isArray(value)) {
        return value.map((v) => String(v || '').trim()).filter(Boolean);
      }
      return [];
    };
    
    let query, params = [];
    
    if (USE_POSTGRES) {
      query = 'SELECT * FROM banners WHERE 1=1';
      if (activeOnly === 'true') {
        query += ' AND is_active = true';
      }
      query += ' ORDER BY priority DESC, created_at DESC';
    } else {
      query = 'SELECT * FROM banners WHERE 1=1';
      if (activeOnly === 'true') {
        query += ' AND isActive = 1';
      }
      query += ' ORDER BY priority DESC, createdAt DESC';
    }
    
    let rows = await db.query(query, params);
    
    // Client-side filtering for regions and dates
    const now = new Date();
    rows = rows.filter(banner => {
      const bannerType = String((USE_POSTGRES ? banner.type : banner.type) || 'main').toLowerCase();
      if (type) {
        if (bannerType !== String(type).toLowerCase()) return false;
      }

      // Region filter
      if (regionId) {
        const rid = String(regionId);
        const regions = parseBannerRegions(banner.regions);
        const regionIdCol = String((USE_POSTGRES ? banner.region_id : banner.regionId) || '').trim();
        if (bannerType === 'region_portal') {
          if (regionIdCol && regionIdCol === rid) return true;
          if (regions.includes(rid)) return true;
          return false;
        }
        if (regions.length > 0 && !regions.includes(rid)) {
          return false;
        }
      }
      
      // Date filter (only if activeOnly)
      if (activeOnly === 'true') {
        const startField = USE_POSTGRES ? banner.start_date : banner.startDate;
        const endField = USE_POSTGRES ? banner.end_date : banner.endDate;
        
        if (startField) {
          const startDate = new Date(startField);
          if (now < startDate) return false;
        }
        if (endField) {
          const endDate = new Date(endField);
          if (now > endDate) return false;
        }
      }
      
      return true;
    });
    
    // Normalize to camelCase for client
    const normalized = rows.map(b => {
      if (USE_POSTGRES) {
        return {
          id: b.banner_id,
          title: b.title || '',
          description: b.description || '',
          imageUrl: b.image_url || null,
          videoUrl: b.video_url || null,
          alt: b.alt,
          linkUrl: b.link_url,
          regions: parseBannerRegions(b.regions),
          startDate: b.start_date,
          endDate: b.end_date,
          isActive: b.is_active,
          priority: b.priority,
          weight: b.weight,
          gradientEnabled: !!b.gradient_enabled,
          gradientPreset: b.gradient_preset || 'dark',
          gradientColor1: b.gradient_color1 || null,
          gradientColor2: b.gradient_color2 || null,
          gradientStop1: b.gradient_stop1 ?? 0,
          gradientStop2: b.gradient_stop2 ?? 100,
          chipLabel: b.chip_label || null,
          type: b.type || 'main',
          regionId: b.region_id || null,
          createdAt: b.created_at,
          updatedAt: b.updated_at
        };
      } else {
        return {
          id: b.bannerId,
          title: b.title || '',
          description: b.description || '',
          imageUrl: b.imageUrl || null,
          videoUrl: b.videoUrl || null,
          alt: b.alt,
          linkUrl: b.linkUrl,
          regions: parseBannerRegions(b.regions),
          startDate: b.startDate,
          endDate: b.endDate,
          isActive: !!b.isActive,
          priority: b.priority,
          weight: b.weight,
          gradientEnabled: !!b.gradientEnabled,
          gradientPreset: b.gradientPreset || 'dark',
          gradientColor1: b.gradientColor1 || null,
          gradientColor2: b.gradientColor2 || null,
          gradientStop1: b.gradientStop1 ?? 0,
          gradientStop2: b.gradientStop2 ?? 100,
          chipLabel: b.chipLabel || null,
          type: b.type || 'main',
          regionId: b.regionId || null,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt
        };
      }
    });
    
    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching banners:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/banners - Create or update banner
// POST /api/banners - Create banner (no upsert)
app.post('/api/banners', async (req, res) => {
  try {
    const b = req.body || {};
    // basic validation: title-less banners allowed, but id conflict should be handled
    const bannerId = b.id || b.bannerId || `BANNER_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    const regions = Array.isArray(b.regions) ? JSON.stringify(b.regions) : '[]';
    const bannerType = String(b.type || 'main').trim() || 'main';
    const regionIdToStore = b.regionId || b.region_id || (Array.isArray(b.regions) && b.regions[0] ? String(b.regions[0]) : null);

    // Check existence first
    const selectQuery = USE_POSTGRES ? 'SELECT banner_id FROM banners WHERE banner_id = $1' : 'SELECT bannerId FROM banners WHERE bannerId = ?';
    const existing = await db.get(selectQuery, [bannerId]);
    if (existing) {
      return res.status(409).json({ error: 'banner already exists' });
    }

    const imageUrlToStore = b.imageUrl || '';
    const videoUrlToStore = b.videoUrl || '';
    const titleToStore = (b.title || '').trim();
    const descriptionToStore = (b.description || '').trim();

    if (USE_POSTGRES) {
      const query = `
        INSERT INTO banners(banner_id, title, description, image_url, video_url, alt, link_url, regions, start_date, end_date, is_active, priority, weight, gradient_enabled, gradient_preset, gradient_color1, gradient_color2, gradient_stop1, gradient_stop2, chip_label, type, region_id, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24)
      `;
      await db.query(query, [
        bannerId,
        titleToStore || null,
        descriptionToStore || null,
        imageUrlToStore || null,
        videoUrlToStore || null,
        b.alt || titleToStore || '',
        b.linkUrl || '',
        regions,
        b.startDate || null,
        b.endDate || null,
        b.isActive !== undefined ? b.isActive : true,
        parseInt(b.priority) || 0,
        parseInt(b.weight) || 1,
        !!b.gradientEnabled,
        b.gradientPreset || 'dark',
        b.gradientColor1 || null,
        b.gradientColor2 || null,
        b.gradientStop1 ?? 0,
        b.gradientStop2 ?? 100,
        b.chipLabel || null,
        bannerType,
        regionIdToStore,
        now,
        now
      ]);
    } else {
      const query = `
        INSERT INTO banners(bannerId, title, description, imageUrl, videoUrl, alt, linkUrl, regions, startDate, endDate, isActive, priority, weight, gradientEnabled, gradientPreset, gradientColor1, gradientColor2, gradientStop1, gradientStop2, chipLabel, type, regionId, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await db.run(query, [
        bannerId,
        titleToStore || null,
        descriptionToStore || null,
        imageUrlToStore || null,
        videoUrlToStore || null,
        b.alt || titleToStore || '',
        b.linkUrl || '',
        regions,
        b.startDate || null,
        b.endDate || null,
        b.isActive !== undefined ? (b.isActive ? 1 : 0) : 1,
        parseInt(b.priority) || 0,
        parseInt(b.weight) || 1,
        b.gradientEnabled ? 1 : 0,
        b.gradientPreset || 'dark',
        b.gradientColor1 || null,
        b.gradientColor2 || null,
        b.gradientStop1 ?? 0,
        b.gradientStop2 ?? 100,
        b.chipLabel || null,
        bannerType,
        regionIdToStore,
        now,
        now
      ]);
    }
    res.json({ ok: true, bannerId });
  } catch (err) {
    logger.error('Error creating banner:', err, { body: req.body });
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/banners/:id - Partial update only (no insert)
app.patch('/api/banners/:id', async (req, res) => {
  try {
    const bannerId = req.params.id;
    const updates = req.body || {};
    if (!bannerId) return res.status(400).json({ error: 'bannerId required' });
    if (!updates || Object.keys(updates).length === 0) return res.status(400).json({ error: 'no fields to update' });

    // Allowed fields mapping for DB columns
    const setClauses = [];
    const params = [];
    const now = new Date().toISOString();

    const map = {
      title: 'title',
      description: 'description',
      imageUrl: USE_POSTGRES ? 'image_url' : 'imageUrl',
      videoUrl: USE_POSTGRES ? 'video_url' : 'videoUrl',
      alt: 'alt',
      linkUrl: USE_POSTGRES ? 'link_url' : 'linkUrl',
      regions: 'regions',
      startDate: USE_POSTGRES ? 'start_date' : 'startDate',
      endDate: USE_POSTGRES ? 'end_date' : 'endDate',
      isActive: USE_POSTGRES ? 'is_active' : 'isActive',
      priority: 'priority',
      weight: 'weight',
      gradientEnabled: USE_POSTGRES ? 'gradient_enabled' : 'gradientEnabled',
      gradientPreset: USE_POSTGRES ? 'gradient_preset' : 'gradientPreset',
      gradientColor1: USE_POSTGRES ? 'gradient_color1' : 'gradientColor1',
      gradientColor2: USE_POSTGRES ? 'gradient_color2' : 'gradientColor2',
      gradientStop1: USE_POSTGRES ? 'gradient_stop1' : 'gradientStop1',
      gradientStop2: USE_POSTGRES ? 'gradient_stop2' : 'gradientStop2',
      chipLabel: USE_POSTGRES ? 'chip_label' : 'chipLabel',
      type: 'type',
      regionId: USE_POSTGRES ? 'region_id' : 'regionId',
    };

    for (const key of Object.keys(updates)) {
      if (!map[key]) continue;
      let val = updates[key];
      if (key === 'regions') val = JSON.stringify(Array.isArray(val) ? val : []);
      params.push(val);
      setClauses.push(`${map[key]} = ${USE_POSTGRES ? `$${params.length}` : '?'} `);
    }

    if (setClauses.length === 0) return res.status(400).json({ error: 'no updatable fields' });

    // add updated_at
    params.push(now);
    setClauses.push(`${USE_POSTGRES ? 'updated_at' : 'updatedAt'} = ${USE_POSTGRES ? `$${params.length}` : '?'} `);

    // WHERE
    if (USE_POSTGRES) {
      const query = `UPDATE banners SET ${setClauses.join(', ')} WHERE banner_id = $${params.length + 1}`;
      params.push(bannerId);
      await db.run(query, params);
    } else {
      const query = `UPDATE banners SET ${setClauses.join(', ')} WHERE bannerId = ?`;
      params.push(bannerId);
      await db.run(query, params);
    }

    res.json({ ok: true, bannerId });
  } catch (err) {
    logger.error('Error patching banner:', err, { body: req.body });
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/banners/:id
app.delete('/api/banners/:id', async (req, res) => {
  try {
    const bannerId = req.params.id;
    if (!bannerId) return res.status(400).json({ error: 'bannerId required' });
    
    // Get banner to delete image file
    const selectQuery = USE_POSTGRES
      ? 'SELECT image_url FROM banners WHERE banner_id = $1'
      : 'SELECT imageUrl FROM banners WHERE bannerId = ?';
    const banner = await db.get(selectQuery, [bannerId]);
    
    // Delete from database
    const deleteQuery = USE_POSTGRES
      ? 'DELETE FROM banners WHERE banner_id = $1'
      : 'DELETE FROM banners WHERE bannerId = ?';
    await db.run(deleteQuery, [bannerId]);
    
    // Delete image file if local
    if (banner) {
      const imageUrl = USE_POSTGRES ? banner.image_url : banner.imageUrl;
      if (imageUrl && imageUrl.startsWith('/uploads/banners/')) {
        const filename = path.basename(imageUrl);
        const filePath = path.join(UPLOADS_DIR, filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info('Deleted banner image file:', filename);
        }
      }
    }
    
    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting banner:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== BROADCASTS API ====================

// POST /api/broadcasts/upload - Upload broadcast video
const broadcastUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_DIR, 'videos');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `broadcast_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    }
  }),
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['video/mp4', 'video/webm', 'video/ogg'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only mp4, webm, ogg allowed.'));
    }
  }
});

app.post('/api/broadcasts/upload', broadcastUpload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video file uploaded' });
    }
    
    const videoUrl = `/uploads/videos/${req.file.filename}`;
    const meta = {
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    };
    
    res.json({
      ok: true,
      videoUrl,
      meta
    });
  } catch (err) {
    logger.error('Error uploading broadcast video:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/broadcasts - Create or update broadcast
app.post('/api/broadcasts', async (req, res) => {
  try {
    const b = req.body || {};
    if (!b.title) {
      return res.status(400).json({ error: 'title required' });
    }

    const broadcastId = b.id || `BROADCAST_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();
    const uploadMeta = b.uploadMeta ? JSON.stringify(b.uploadMeta) : null;

    if (USE_POSTGRES) {
      const query = `
        INSERT INTO broadcasts(broadcast_id, title, video_kind, video_url, upload_url, upload_meta, region_id, district_id, is_public, published_at, legacy_id, created_by, created_at, updated_at)
        VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        ON CONFLICT(broadcast_id) DO UPDATE SET
          title=EXCLUDED.title,
          video_kind=EXCLUDED.video_kind,
          video_url=EXCLUDED.video_url,
          upload_url=EXCLUDED.upload_url,
          upload_meta=EXCLUDED.upload_meta,
          region_id=EXCLUDED.region_id,
          district_id=EXCLUDED.district_id,
          is_public=EXCLUDED.is_public,
          published_at=EXCLUDED.published_at,
          updated_at=EXCLUDED.updated_at
        RETURNING broadcast_id
      `;
      const params = [
        broadcastId,
        b.title,
        b.videoKind || null,
        b.videoUrl || null,
        b.uploadUrl || null,
        uploadMeta,
        b.regionId || null,
        b.districtId || null,
        b.isPublic !== undefined ? b.isPublic : false,
        b.publishedAt || now,
        b.legacyId || null,
        b.createdBy || null,
        now,
        now
      ];
      await db.query(query, params);
      logForensicWrite({
        route: '/api/broadcasts',
        method: 'POST',
        body: b,
        sql: query,
        params,
        dbResult: null,
        result: { ok: true, success: true, broadcastId, id: broadcastId },
      });
    } else {
      const query = `
        INSERT INTO broadcasts(broadcastId, title, videoKind, videoUrl, uploadUrl, uploadMeta, regionId, isPublic, publishedAt, legacyId, createdBy, createdAt, updatedAt)
        VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(broadcastId) DO UPDATE SET
          title=excluded.title,
          videoKind=excluded.videoKind,
          videoUrl=excluded.videoUrl,
          uploadUrl=excluded.uploadUrl,
          uploadMeta=excluded.uploadMeta,
          regionId=excluded.regionId,
          isPublic=excluded.isPublic,
          publishedAt=excluded.publishedAt,
          updatedAt=excluded.updatedAt
      `;
      const params = [
        broadcastId,
        b.title,
        b.videoKind || null,
        b.videoUrl || null,
        b.uploadUrl || null,
        uploadMeta,
        b.regionId || null,
        b.isPublic !== undefined ? (b.isPublic ? 1 : 0) : 0,
        b.publishedAt || now,
        b.legacyId || null,
        b.createdBy || null,
        now,
        now
      ];
      const dbResult = await db.run(query, params);
      logForensicWrite({
        route: '/api/broadcasts',
        method: 'POST',
        body: b,
        sql: query,
        params,
        dbResult,
        result: { ok: true, success: true, broadcastId, id: broadcastId },
      });
    }
    // Contract: old(admin) + new(shareBroadcastStore) 모두 호환
    res.json({ ok: true, success: true, broadcastId, id: broadcastId });
  } catch (err) {
    logger.error('Error creating/updating broadcast:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/broadcasts - List broadcasts
app.get('/api/broadcasts', async (req, res) => {
  try {
    const { region, isPublic, districtId } = req.query;
    let query, params = [];

    if (USE_POSTGRES) {
      query = 'SELECT * FROM broadcasts WHERE 1=1';
      if (region) {
        query += ' AND region_id = $' + (params.length + 1);
        params.push(region);
        if (districtId) {
          query += ' AND district_id = $' + (params.length + 1);
          params.push(districtId);
        }
      }
      if (isPublic !== undefined) {
        query += ' AND is_public = $' + (params.length + 1);
        params.push(isPublic === 'true');
      }
      query += ' ORDER BY published_at DESC';
    } else {
      query = 'SELECT * FROM broadcasts WHERE 1=1';
      if (region) {
        query += ' AND regionId = ?';
        params.push(region);
        if (districtId) {
          query += ' AND district_id = ?';
          params.push(districtId);
        } else {
          query += ' AND district_id IS NULL';
        }
      }
      if (isPublic !== undefined) {
        query += ' AND isPublic = ?';
        params.push(isPublic === 'true' ? 1 : 0);
      }
      query += ' ORDER BY publishedAt DESC';
    }

    const rows = await db.query(query, params);

    const normalized = rows.map(b => {
      if (USE_POSTGRES) {
        return {
          id: b.broadcast_id,
          title: b.title,
          videoKind: b.video_kind,
          videoUrl: b.video_url,
          uploadUrl: b.upload_url,
          uploadMeta: b.upload_meta ? JSON.parse(b.upload_meta) : null,
          regionId: b.region_id,
          districtId: b.district_id,
          isPublic: b.is_public,
          publishedAt: b.published_at,
          legacyId: b.legacy_id,
          createdBy: b.created_by,
          createdAt: b.created_at,
          updatedAt: b.updated_at,
          // shareBroadcastStore 호환 필드
          mediaUrl: b.video_url,
          type: b.video_kind || 'direct',
          time: b.published_at || b.created_at
        };
      } else {
        return {
          id: b.broadcastId,
          title: b.title,
          videoKind: b.videoKind,
          videoUrl: b.videoUrl,
          uploadUrl: b.uploadUrl,
          uploadMeta: b.uploadMeta ? JSON.parse(b.uploadMeta) : null,
          regionId: b.regionId,
          isPublic: !!b.isPublic,
          publishedAt: b.publishedAt,
          legacyId: b.legacyId,
          createdBy: b.createdBy,
          createdAt: b.createdAt,
          updatedAt: b.updatedAt,
          // shareBroadcastStore 호환 필드
          mediaUrl: b.videoUrl,
          type: b.videoKind || 'direct',
          time: b.publishedAt || b.createdAt
        };
      }
    });

    // Contract: shareBroadcastStore expects { broadcasts: [...] }
    res.json({ ok: true, success: true, broadcasts: normalized });
  } catch (err) {
    logger.error('Error fetching broadcasts:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/broadcasts/:id - Get broadcast detail
app.get('/api/broadcasts/:id', async (req, res) => {
  try {
    const broadcastId = req.params.id;
    const query = USE_POSTGRES
      ? 'SELECT * FROM broadcasts WHERE broadcast_id = $1'
      : 'SELECT * FROM broadcasts WHERE broadcastId = ?';
    const b = await db.get(query, [broadcastId]);

    if (!b) {
      return res.status(404).json({ error: 'Broadcast not found' });
    }

    const normalized = USE_POSTGRES ? {
      id: b.broadcast_id,
      title: b.title,
      videoKind: b.video_kind,
      videoUrl: b.video_url,
      uploadUrl: b.upload_url,
      uploadMeta: b.upload_meta ? JSON.parse(b.upload_meta) : null,
      regionId: b.region_id,
      isPublic: b.is_public,
      publishedAt: b.published_at,
      legacyId: b.legacy_id,
      createdBy: b.created_by,
      createdAt: b.created_at,
      updatedAt: b.updated_at,
      // shareBroadcastStore 호환 필드
      mediaUrl: b.video_url,
      type: b.video_kind || 'direct',
      time: b.published_at || b.created_at
    } : {
      id: b.broadcastId,
      title: b.title,
      videoKind: b.videoKind,
      videoUrl: b.videoUrl,
      uploadUrl: b.uploadUrl,
      uploadMeta: b.uploadMeta ? JSON.parse(b.uploadMeta) : null,
      regionId: b.regionId,
      isPublic: !!b.isPublic,
      publishedAt: b.publishedAt,
      legacyId: b.legacyId,
      createdBy: b.createdBy,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt,
      // shareBroadcastStore 호환 필드
      mediaUrl: b.videoUrl,
      type: b.videoKind || 'direct',
      time: b.publishedAt || b.createdAt
    };

    // Contract: shareBroadcastStore expects { broadcast: {...} }
    res.json({ ok: true, success: true, broadcast: normalized });
  } catch (err) {
    logger.error('Error fetching broadcast:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/broadcasts/:id - Update broadcast
app.put('/api/broadcasts/:id', async (req, res) => {
  try {
    const broadcastId = req.params.id;
    const updates = req.body || {};
    const now = new Date().toISOString();

    const fields = [];
    const params = [];
    let paramCounter = 1;

    if (updates.title !== undefined) {
      fields.push(USE_POSTGRES ? `title = $${paramCounter++}` : `title = ?`);
      params.push(updates.title);
    }
    if (updates.videoKind !== undefined) {
      fields.push(USE_POSTGRES ? `video_kind = $${paramCounter++}` : `videoKind = ?`);
      params.push(updates.videoKind);
    }
    if (updates.videoUrl !== undefined) {
      fields.push(USE_POSTGRES ? `video_url = $${paramCounter++}` : `videoUrl = ?`);
      params.push(updates.videoUrl);
    }
    if (updates.uploadUrl !== undefined) {
      fields.push(USE_POSTGRES ? `upload_url = $${paramCounter++}` : `uploadUrl = ?`);
      params.push(updates.uploadUrl);
    }
    if (updates.uploadMeta !== undefined) {
      fields.push(USE_POSTGRES ? `upload_meta = $${paramCounter++}` : `uploadMeta = ?`);
      params.push(JSON.stringify(updates.uploadMeta));
    }
    if (updates.regionId !== undefined) {
      fields.push(USE_POSTGRES ? `region_id = $${paramCounter++}` : `regionId = ?`);
      params.push(updates.regionId);
    }
    if (updates.districtId !== undefined) {
      fields.push(USE_POSTGRES ? `district_id = $${paramCounter++}` : `district_id = ?`);
      params.push(updates.districtId || null);
    }
    if (updates.isPublic !== undefined) {
      fields.push(USE_POSTGRES ? `is_public = $${paramCounter++}` : `isPublic = ?`);
      params.push(USE_POSTGRES ? updates.isPublic : (updates.isPublic ? 1 : 0));
    }
    if (updates.publishedAt !== undefined) {
      fields.push(USE_POSTGRES ? `published_at = $${paramCounter++}` : `publishedAt = ?`);
      params.push(updates.publishedAt);
    }

    fields.push(USE_POSTGRES ? `updated_at = $${paramCounter++}` : `updatedAt = ?`);
    params.push(now);

    params.push(broadcastId);

    const query = USE_POSTGRES
      ? `UPDATE broadcasts SET ${fields.join(', ')} WHERE broadcast_id = $${paramCounter}`
      : `UPDATE broadcasts SET ${fields.join(', ')} WHERE broadcastId = ?`;

    const dbResult = await db.run(query, params);
    const result = { ok: true, success: true, id: broadcastId, broadcastId };
    logForensicWrite({
      route: `/api/broadcasts/${broadcastId}`,
      method: 'PUT',
      body: updates,
      sql: query,
      params,
      dbResult,
      result,
    });
    res.json(result);
  } catch (err) {
    logger.error('Error updating broadcast:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/broadcasts/:id - Delete broadcast
app.delete('/api/broadcasts/:id', async (req, res) => {
  try {
    const broadcastId = req.params.id;

    // Get broadcast to delete video file
    const selectQuery = USE_POSTGRES
      ? 'SELECT upload_url FROM broadcasts WHERE broadcast_id = $1'
      : 'SELECT uploadUrl FROM broadcasts WHERE broadcastId = ?';
    const broadcast = await db.get(selectQuery, [broadcastId]);

    // Delete related comments first (SQLite has no FK cascade)
    if (!USE_POSTGRES) {
      try {
        await db.run('DELETE FROM broadcast_comments WHERE broadcastId = ?', [broadcastId]);
      } catch (e) {
        logger.warn('Failed to delete broadcast_comments for broadcastId:', broadcastId, e);
      }
    }

    // Delete from database (Postgres has FK cascade)
    const deleteQuery = USE_POSTGRES
      ? 'DELETE FROM broadcasts WHERE broadcast_id = $1'
      : 'DELETE FROM broadcasts WHERE broadcastId = ?';
    const dbResult = await db.run(deleteQuery, [broadcastId]);

    // Delete video file if local
    if (broadcast) {
      const uploadUrl = USE_POSTGRES ? broadcast.upload_url : broadcast.uploadUrl;
      if (uploadUrl && uploadUrl.startsWith('/uploads/videos/')) {
        const filename = path.basename(uploadUrl);
        const filePath = path.join(UPLOADS_DIR, 'videos', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info('Deleted broadcast video file:', filename);
        }
      }
    }

    const result = { ok: true, success: true, id: broadcastId, broadcastId };
    logForensicWrite({
      route: `/api/broadcasts/${broadcastId}`,
      method: 'DELETE',
      body: null,
      sql: deleteQuery,
      params: [broadcastId],
      dbResult,
      result,
    });
    res.json(result);
  } catch (err) {
    logger.error('Error deleting broadcast:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/broadcasts/:id/comments - Add comment
app.post('/api/broadcasts/:id/comments', async (req, res) => {
  try {
    const broadcastId = req.params.id;
    const { authorId, authorName, text } = req.body || {};

    if (!text) {
      return res.status(400).json({ error: 'text required' });
    }

    const commentId = `COMMENT_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();

    let sql;
    let params;
    let dbResult;
    if (USE_POSTGRES) {
      sql = `INSERT INTO broadcast_comments(comment_id, broadcast_id, author_id, author_name, text, created_at)
         VALUES($1, $2, $3, $4, $5, $6)`;
      params = [commentId, broadcastId, authorId || null, authorName || '익명', text, now];
      await db.run(sql, params);
      dbResult = null;
    } else {
      sql = `INSERT INTO broadcast_comments(commentId, broadcastId, authorId, authorName, text, createdAt)
         VALUES(?, ?, ?, ?, ?, ?)`;
      params = [commentId, broadcastId, authorId || null, authorName || '익명', text, now];
      dbResult = await db.run(sql, params);
    }

    const result = { ok: true, success: true, commentId, id: commentId, broadcastId };
    logForensicWrite({
      route: `/api/broadcasts/${broadcastId}/comments`,
      method: 'POST',
      body: req.body || {},
      sql,
      params,
      dbResult,
      result,
    });
    res.json(result);
  } catch (err) {
    logger.error('Error adding comment:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/broadcasts/:id/comments - Get comments
app.get('/api/broadcasts/:id/comments', async (req, res) => {
  try {
    const broadcastId = req.params.id;
    const query = USE_POSTGRES
      ? 'SELECT * FROM broadcast_comments WHERE broadcast_id = $1 ORDER BY created_at DESC'
      : 'SELECT * FROM broadcast_comments WHERE broadcastId = ? ORDER BY createdAt DESC';
    const rows = await db.query(query, [broadcastId]);

    const normalized = rows.map(c => {
      if (USE_POSTGRES) {
        return {
          id: c.comment_id,
          broadcastId: c.broadcast_id,
          authorId: c.author_id,
          authorName: c.author_name,
          text: c.text,
          createdAt: c.created_at
        };
      } else {
        return {
          id: c.commentId,
          broadcastId: c.broadcastId,
          authorId: c.authorId,
          authorName: c.authorName,
          text: c.text,
          createdAt: c.createdAt
        };
      }
    });

    res.json({ ok: true, success: true, comments: normalized });
  } catch (err) {
    logger.error('Error fetching comments:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==================== SUPPLIES API ====================

// POST /api/supplies/upload - Upload supply media (image/video/file)
const supplyUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = path.join(UPLOADS_DIR, 'supplies');
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const name = `supply_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`;
      cb(null, name);
    }
  }),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'application/pdf', 'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDF, Excel allowed.'));
    }
  }
});

app.post('/api/supplies/upload', supplyUpload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const mediaUrl = `/uploads/supplies/${req.file.filename}`;
    const meta = {
      originalName: req.file.originalname,
      size: req.file.size,
      mimeType: req.file.mimetype
    };
    
    res.json({ ok: true, mediaUrl, meta });
  } catch (err) {
    logger.error('Error uploading supply media:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supplies - Create/upsert supply
app.post('/api/supplies', async (req, res) => {
  try {
    const { 
      id, title, description, quantity, mediaUrl, uploadUrl, uploadMeta, 
      regionId, districtId, status, type, price, imageUrl, purchaseAmount, completedAt, 
      assignedTo, legacyId, createdBy 
    } = req.body || {};

    if (!title) {
      return res.status(400).json({ error: 'title required' });
    }

    const supplyId = id || `SUPPLY_${Date.now()}_${Math.floor(Math.random()*10000)}`;
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO supplies(
          supply_id, title, description, quantity, media_url, upload_url, upload_meta, 
          region_id, district_id, status, type, price, image_url, purchase_amount, completed_at, 
          assigned_to, legacy_id, created_by, created_at, updated_at
        )
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
         ON CONFLICT(supply_id) DO UPDATE SET
           title = EXCLUDED.title,
           description = EXCLUDED.description,
           quantity = EXCLUDED.quantity,
           media_url = EXCLUDED.media_url,
           upload_url = EXCLUDED.upload_url,
           upload_meta = EXCLUDED.upload_meta,
           region_id = EXCLUDED.region_id,
           district_id = EXCLUDED.district_id,
           status = EXCLUDED.status,
           type = EXCLUDED.type,
           price = EXCLUDED.price,
           image_url = EXCLUDED.image_url,
           purchase_amount = EXCLUDED.purchase_amount,
           completed_at = EXCLUDED.completed_at,
           assigned_to = EXCLUDED.assigned_to,
           updated_at = EXCLUDED.updated_at`,
        [
          supplyId, title, description || null, quantity || 0,
          mediaUrl || null, uploadUrl || null,
          uploadMeta ? JSON.stringify(uploadMeta) : null,
          regionId || null, districtId || null, status || 'available', type || null,
          (price !== undefined && price !== null && price !== '') ? Number(price) : null, imageUrl || null, purchaseAmount || null,
          completedAt || null, assignedTo || null, legacyId || null,
          createdBy || null, now, now
        ]
      );
    } else {
      await db.run(
        `INSERT OR REPLACE INTO supplies(
          supplyId, title, description, quantity, mediaUrl, uploadUrl, uploadMeta, 
          regionId, districtId, status, type, price, imageUrl, purchaseAmount, completedAt, 
          assignedTo, legacyId, createdBy, createdAt, updatedAt
        )
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          supplyId, title, description || null, quantity || 0,
          mediaUrl || null, uploadUrl || null,
          uploadMeta ? JSON.stringify(uploadMeta) : null,
          regionId || null, districtId || null, status || 'available', type || null,
          (price !== undefined && price !== null && price !== '') ? Number(price) : null, imageUrl || null, purchaseAmount || null,
          completedAt || null, assignedTo || null, legacyId || null,
          createdBy || null, now, now
        ]
      );
    }

    res.json({ ok: true, supplyId });
  } catch (err) {
    logger.error('Error creating supply:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supplies - List supplies
app.get('/api/supplies', async (req, res) => {
  try {
    const { region, status, createdBy, type, districtId } = req.query;
    let query = USE_POSTGRES
      ? 'SELECT s.*, m.name AS assigned_to_name FROM supplies s LEFT JOIN members m ON s.assigned_to = CAST(m.member_id AS TEXT)'
      : 'SELECT * FROM supplies';
    const params = [];
    const whereClauses = [];
    let paramCounter = 1;

    if (region) {
      whereClauses.push(USE_POSTGRES ? `s.region_id = $${paramCounter++}` : `regionId = ?`);
      params.push(region);
    }
    if (status) {
      whereClauses.push(USE_POSTGRES ? `s.status = $${paramCounter++}` : `status = ?`);
      params.push(status);
    }
    if (createdBy) {
      whereClauses.push(USE_POSTGRES ? `s.created_by = $${paramCounter++}` : `createdBy = ?`);
      params.push(createdBy);
    }
    if (type) {
      whereClauses.push(USE_POSTGRES ? `s.type = $${paramCounter++}` : `type = ?`);
      params.push(type);
    }
    if (districtId) {
      whereClauses.push(USE_POSTGRES ? `(s.district_id = $${paramCounter++} OR s.district_id IS NULL)` : `(district_id = ? OR district_id IS NULL)`);
      params.push(districtId);
    }

    if (whereClauses.length > 0) {
      query += ' WHERE ' + whereClauses.join(' AND ');
    }

    query += USE_POSTGRES ? ' ORDER BY s.created_at DESC' : ' ORDER BY createdAt DESC';

    const rows = await db.query(query, params);

    const normalized = rows.map(s => USE_POSTGRES ? {
      id: s.supply_id,
      title: s.title,
      description: s.description,
      quantity: s.quantity,
      mediaUrl: s.media_url,
      uploadUrl: s.upload_url,
      uploadMeta: s.upload_meta,
      regionId: s.region_id,
      status: s.status,
      type: s.type,
      price: s.price,
      image_url: s.image_url,
      imageUrl: s.image_url,
      purchase_amount: s.purchase_amount,
      purchaseAmount: s.purchase_amount,
      completed_at: s.completed_at,
      completedAt: s.completed_at,
      assigned_to: s.assigned_to,
      assignedTo: s.assigned_to,
      assignedToName: s.assigned_to_name || null,
      legacy_id: s.legacy_id,
      legacyId: s.legacy_id,
      created_by: s.created_by,
      createdBy: s.created_by,
      created_at: s.created_at,
      createdAt: s.created_at,
      updated_at: s.updated_at,
      updatedAt: s.updated_at
    } : {
      id: s.supplyId,
      title: s.title,
      description: s.description,
      quantity: s.quantity,
      mediaUrl: s.mediaUrl,
      uploadUrl: s.uploadUrl,
      uploadMeta: s.uploadMeta ? JSON.parse(s.uploadMeta) : null,
      regionId: s.regionId,
      status: s.status,
      type: s.type,
      price: s.price,
      imageUrl: s.imageUrl,
      image_url: s.imageUrl,
      purchaseAmount: s.purchaseAmount,
      purchase_amount: s.purchaseAmount,
      completedAt: s.completedAt,
      completed_at: s.completedAt,
      assignedTo: s.assignedTo,
      assigned_to: s.assignedTo,
      legacyId: s.legacyId,
      legacy_id: s.legacyId,
      createdBy: s.createdBy,
      created_by: s.createdBy,
      createdAt: s.createdAt,
      created_at: s.createdAt,
      updatedAt: s.updatedAt,
      updated_at: s.updatedAt
    });

    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching supplies:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supplies/:id - Get supply detail
app.get('/api/supplies/:id', async (req, res) => {
  try {
    const supplyId = req.params.id;
    const query = USE_POSTGRES
      ? 'SELECT * FROM supplies WHERE supply_id = $1'
      : 'SELECT * FROM supplies WHERE supplyId = ?';
    const rows = await db.query(query, [supplyId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Supply not found' });
    }

    const s = rows[0];
    const normalized = USE_POSTGRES ? {
      id: s.supply_id,
      title: s.title,
      description: s.description,
      quantity: s.quantity,
      mediaUrl: s.media_url,
      uploadUrl: s.upload_url,
      uploadMeta: s.upload_meta,
      regionId: s.region_id,
      status: s.status,
      createdBy: s.created_by,
      createdAt: s.created_at,
      updatedAt: s.updated_at
    } : {
      id: s.supplyId,
      title: s.title,
      description: s.description,
      quantity: s.quantity,
      mediaUrl: s.mediaUrl,
      uploadUrl: s.uploadUrl,
      uploadMeta: s.uploadMeta ? JSON.parse(s.uploadMeta) : null,
      regionId: s.regionId,
      status: s.status,
      createdBy: s.createdBy,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt
    };

    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching supply:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/supplies/:id - Update supply
app.put('/api/supplies/:id', async (req, res) => {
  try {
    const supplyId = req.params.id;
    const updates = req.body || {};
    const now = new Date().toISOString();

    const fields = [];
    const params = [];
    let paramCounter = 1;

    if (updates.title !== undefined) {
      fields.push(USE_POSTGRES ? `title = $${paramCounter++}` : `title = ?`);
      params.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(USE_POSTGRES ? `description = $${paramCounter++}` : `description = ?`);
      params.push(updates.description);
    }
    if (updates.quantity !== undefined) {
      fields.push(USE_POSTGRES ? `quantity = $${paramCounter++}` : `quantity = ?`);
      params.push(updates.quantity);
    }
    if (updates.mediaUrl !== undefined) {
      fields.push(USE_POSTGRES ? `media_url = $${paramCounter++}` : `mediaUrl = ?`);
      params.push(updates.mediaUrl);
    }
    if (updates.uploadUrl !== undefined) {
      fields.push(USE_POSTGRES ? `upload_url = $${paramCounter++}` : `uploadUrl = ?`);
      params.push(updates.uploadUrl);
    }
    if (updates.uploadMeta !== undefined) {
      fields.push(USE_POSTGRES ? `upload_meta = $${paramCounter++}` : `uploadMeta = ?`);
      params.push(updates.uploadMeta ? JSON.stringify(updates.uploadMeta) : null);
    }
    if (updates.regionId !== undefined) {
      fields.push(USE_POSTGRES ? `region_id = $${paramCounter++}` : `regionId = ?`);
      params.push(updates.regionId);
    }
    if (updates.status !== undefined) {
      fields.push(USE_POSTGRES ? `status = $${paramCounter++}` : `status = ?`);
      params.push(updates.status);
    }
    if (updates.type !== undefined) {
      fields.push(USE_POSTGRES ? `type = $${paramCounter++}` : `type = ?`);
      params.push(updates.type);
    }
    if (updates.price !== undefined) {
      fields.push(USE_POSTGRES ? `price = $${paramCounter++}` : `price = ?`);
      params.push(updates.price);
    }
    if (updates.imageUrl !== undefined || updates.image_url !== undefined) {
      fields.push(USE_POSTGRES ? `image_url = $${paramCounter++}` : `imageUrl = ?`);
      params.push(updates.imageUrl || updates.image_url);
    }
    if (updates.purchaseAmount !== undefined || updates.purchase_amount !== undefined) {
      fields.push(USE_POSTGRES ? `purchase_amount = $${paramCounter++}` : `purchaseAmount = ?`);
      params.push(updates.purchaseAmount || updates.purchase_amount);
    }
    if (updates.completedAt !== undefined || updates.completed_at !== undefined) {
      fields.push(USE_POSTGRES ? `completed_at = $${paramCounter++}` : `completedAt = ?`);
      params.push(updates.completedAt || updates.completed_at);
    }
    if (updates.assignedTo !== undefined || updates.assigned_to !== undefined) {
      fields.push(USE_POSTGRES ? `assigned_to = $${paramCounter++}` : `assignedTo = ?`);
      params.push(updates.assignedTo || updates.assigned_to);
    }

    fields.push(USE_POSTGRES ? `updated_at = $${paramCounter++}` : `updatedAt = ?`);
    params.push(now);
    params.push(supplyId);

    if (fields.length === 1) { // only updated_at was added
      return res.status(400).json({ error: 'No fields to update' });
    }

    const query = USE_POSTGRES
      ? `UPDATE supplies SET ${fields.join(', ')} WHERE supply_id = $${paramCounter}`
      : `UPDATE supplies SET ${fields.join(', ')} WHERE supplyId = ?`;

    await db.run(query, params);

    res.json({ ok: true });
  } catch (err) {
    logger.error('Error updating supply:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/supplies/:id - Delete supply
// PATCH /api/supplies/:id - 보급 항목 수정
app.patch('/api/supplies/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      const sets = [];
      const params = [];
      let idx = 1;
      if (updates.title !== undefined) { sets.push(`title=$${idx++}`); params.push(updates.title); }
      if (updates.description !== undefined) { sets.push(`description=$${idx++}`); params.push(updates.description); }
      if (updates.quantity !== undefined) { sets.push(`quantity=$${idx++}`); params.push(parseInt(updates.quantity)); }
      if (updates.status !== undefined) { sets.push(`status=$${idx++}`); params.push(updates.status); }
      if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
      sets.push(`updated_at=$${idx++}`); params.push(now);
      params.push(id);
      await db.run(`UPDATE supplies SET ${sets.join(', ')} WHERE supply_id = $${idx}`, params);
    } else {
      const sets = [];
      const params = [];
      if (updates.title !== undefined) { sets.push('title=?'); params.push(updates.title); }
      if (updates.description !== undefined) { sets.push('description=?'); params.push(updates.description); }
      if (updates.quantity !== undefined) { sets.push('quantity=?'); params.push(parseInt(updates.quantity)); }
      if (updates.status !== undefined) { sets.push('status=?'); params.push(updates.status); }
      if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
      sets.push('updatedAt=?'); params.push(now);
      params.push(id);
      await db.run(`UPDATE supplies SET ${sets.join(', ')} WHERE supplyId = ?`, params);
    }
    res.json({ ok: true, success: true });
  } catch (err) {
    logger.error('Error patching supply:', err);
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/supplies/:id', async (req, res) => {
  try {
    const supplyId = req.params.id;

    // Fetch to get file paths for cleanup
    const query = USE_POSTGRES
      ? 'SELECT upload_url FROM supplies WHERE supply_id = $1'
      : 'SELECT uploadUrl FROM supplies WHERE supplyId = ?';
    const rows = await db.query(query, [supplyId]);

    const deleteQuery = USE_POSTGRES
      ? 'DELETE FROM supplies WHERE supply_id = $1'
      : 'DELETE FROM supplies WHERE supplyId = ?';
    await db.run(deleteQuery, [supplyId]);

    // Cleanup uploaded file if exists
    if (rows.length > 0) {
      const uploadUrl = USE_POSTGRES ? rows[0].upload_url : rows[0].uploadUrl;
      if (uploadUrl && uploadUrl.startsWith('/uploads/supplies/')) {
        const filename = path.basename(uploadUrl);
        const filePath = path.join(UPLOADS_DIR, 'supplies', filename);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          logger.info('Deleted supply file:', filename);
        }
      }
    }

    res.json({ ok: true });
  } catch (err) {
    logger.error('Error deleting supply:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== POINTS API =====================
// GET /api/points/:memberId/balance - Get member's current point balance
app.get('/api/points/:memberId/balance', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!memberId) return jsonFail(res, 400, 'memberId required');
    if (!canViewMemberPoints({ memberId: req.authMemberId, role: req.authRole }, memberId)) {
      return jsonFail(res, 403, 'Forbidden');
    }
    
    const balance = await getMemberPointBalance(memberId);

    return jsonOk(res, { memberId, balance });
  } catch (err) {
    logger.error('Error fetching point balance:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Helper: description/referenceId에서 mission:/event: ID를 실제 제목으로 치환
async function enrichMissionTitles(transactions) {
  const missionIdSet = new Set();
  const eventIdSet = new Set();
  for (const t of transactions) {
    const src = (t.description || '') + ' ' + (t.referenceId || '');
    const mm = src.match(/mission:([A-Z0-9_]+)/gi);
    const em = src.match(/event:([A-Z0-9_]+)/gi);
    if (mm) mm.forEach(s => missionIdSet.add(s.replace(/^mission:/i, '')));
    if (em) em.forEach(s => eventIdSet.add(s.replace(/^event:/i, '')));
  }
  if (!missionIdSet.size && !eventIdSet.size) return transactions;
  const titleMap = {};
  try {
    if (missionIdSet.size) {
      const ids = [...missionIdSet];
      const rows = USE_POSTGRES
        ? await db.query(`SELECT mission_id, title FROM missions WHERE mission_id = ANY($1)`, [ids])
        : await db.query(`SELECT missionId as mission_id, title FROM missions WHERE missionId IN (${ids.map(() => '?').join(',')})`, ids);
      (rows || []).forEach(r => { titleMap['mission:' + r.mission_id] = r.title; });
    }
    if (eventIdSet.size) {
      const ids = [...eventIdSet];
      const rows = USE_POSTGRES
        ? await db.query(`SELECT event_id, title FROM events WHERE event_id = ANY($1)`, [ids])
        : await db.query(`SELECT eventId as event_id, title FROM events WHERE eventId IN (${ids.map(() => '?').join(',')})`, ids);
      (rows || []).forEach(r => { titleMap['event:' + r.event_id] = r.title; });
    }
  } catch (_) {}
  if (!Object.keys(titleMap).length) return transactions;
  return transactions.map(t => ({
    ...t,
    description: (t.description || '').replace(/(mission|event):([A-Z0-9_]+)/gi, (_, prefix, id) => titleMap[prefix.toLowerCase() + ':' + id] || (prefix + ':' + id)),
  }));
}

// GET /api/points/:memberId/history - Get point transaction history
app.get('/api/points/:memberId/history', requireAuth, async (req, res) => {
  try {
    const { memberId } = req.params;
    if (!memberId) return jsonFail(res, 400, 'memberId required');
    if (!canViewMemberPoints({ memberId: req.authMemberId, role: req.authRole }, memberId)) {
      return jsonFail(res, 403, 'Forbidden');
    }
    
    // ★ 관리자용 전체 조회: memberId가 'all'일 때
    if (memberId === 'all') {
      const { type, startDate, endDate, limit = 1000 } = req.query;
      let query = USE_POSTGRES
          ? `SELECT pl.*, pl.created_at AT TIME ZONE 'UTC' AS created_at_utc,
            COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name
            FROM point_ledger pl
            LEFT JOIN members m ON pl.member_id = m.member_id::text
           WHERE 1=1`
        : `SELECT pl.*, COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name
           FROM point_ledger pl
           LEFT JOIN members m ON pl.memberId = m.memberId
           WHERE 1=1`;
      const params = [];
      let paramCounter = 1;
      
      if (type) {
        params.push(type);
        query += USE_POSTGRES ? ` AND pl.type = $${paramCounter++}` : ' AND pl.type = ?';
      }
      if (startDate) {
        params.push(startDate);
        query += USE_POSTGRES ? ` AND pl.created_at >= $${paramCounter++}` : ' AND pl.createdAt >= ?';
      }
      if (endDate) {
        params.push(endDate);
        query += USE_POSTGRES ? ` AND pl.created_at <= $${paramCounter++}` : ' AND pl.createdAt <= ?';
      }
      
      query += USE_POSTGRES ? ' ORDER BY pl.created_at DESC' : ' ORDER BY pl.createdAt DESC';
      
      if (limit) {
        params.push(Number(limit));
        query += USE_POSTGRES ? ` LIMIT $${paramCounter++}` : ' LIMIT ?';
      }
      
      const rows = await db.query(query, params);
      const normalized = rows.map(r => USE_POSTGRES ? {
        id: r.ledger_id,
        memberId: r.member_id,
        memberName: r.member_name || r.user_name || '',
        userName: r.member_name || r.user_name || '',
        amount: r.amount,
        type: r.type,
        description: r.description,
        referenceId: r.reference_id,
        referenceType: r.reference_type,
        createdAt: r.created_at_utc || r.created_at,
        status: r.status
      } : {
        id: r.ledgerId,
        memberId: r.memberId,
        memberName: r.member_name || r.user_name || '',
        userName: r.member_name || r.user_name || '',
        amount: r.amount,
        type: r.type,
        description: r.description,
        referenceId: r.referenceId,
        referenceType: r.referenceType,
        createdAt: r.createdAt,
        status: r.status
      });

      const enriched = await enrichMissionTitles(normalized);
      return jsonOk(res, { transactions: enriched });
    }
    
    // 기존 로직: 특정 회원의 포인트 내역
    const { type, startDate, endDate, limit = 100 } = req.query;

    
    let query = USE_POSTGRES
           ? `SELECT pl.*, pl.created_at AT TIME ZONE 'UTC' AS created_at_utc,
             COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name
             FROM point_ledger pl
             LEFT JOIN members m ON pl.member_id = m.member_id::text
             WHERE pl.member_id = $1`
          : `SELECT pl.*, COALESCE(NULLIF(pl.user_name, ''), m.name, m.email, '') AS member_name
             FROM point_ledger pl
             LEFT JOIN members m ON pl.memberId = m.memberId
             WHERE pl.memberId = ?`;
    const params = [memberId];
    let paramCounter = 2;
    
    if (type) {
      params.push(type);
          query += USE_POSTGRES ? ` AND pl.type = $${paramCounter++}` : ' AND pl.type = ?';
    }
    if (startDate) {
      params.push(startDate);
          query += USE_POSTGRES ? ` AND pl.created_at >= $${paramCounter++}` : ' AND pl.createdAt >= ?';
    }
    if (endDate) {
      params.push(endDate);
          query += USE_POSTGRES ? ` AND pl.created_at <= $${paramCounter++}` : ' AND pl.createdAt <= ?';
    }
    
        query += USE_POSTGRES ? ' ORDER BY pl.created_at DESC' : ' ORDER BY pl.createdAt DESC';
    
    if (limit) {
      params.push(Number(limit));
      query += USE_POSTGRES ? ` LIMIT $${paramCounter++}` : ' LIMIT ?';
    }
    
    const rows = await db.query(query, params);
    
    const normalized = rows.map(r => USE_POSTGRES ? {
      id: r.ledger_id,
      memberId: r.member_id,
      memberName: r.member_name || r.user_name || '',
      userName: r.member_name || r.user_name || '',
      amount: r.amount,
      type: r.type,
      description: r.description,
      referenceId: r.reference_id,
      referenceType: r.reference_type,
      createdAt: r.created_at_utc || r.created_at,
      status: r.status
    } : {
      id: r.ledgerId,
      memberId: r.memberId,
      memberName: r.member_name || r.user_name || '',
      userName: r.member_name || r.user_name || '',
      amount: r.amount,
      type: r.type,
      description: r.description,
      referenceId: r.referenceId,
      referenceType: r.referenceType,
      createdAt: r.createdAt,
      status: r.status
    });

    const enriched = await enrichMissionTitles(normalized);
    return jsonOk(res, { transactions: enriched });
  } catch (err) {
    logger.error('Error fetching point history:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/points/admin/grant - Admin grant/deduct points
app.post('/api/points/admin/grant', requireAuth, async (req, res) => {
  try {
    if (!isAdminRole(req.authRole)) {
      return jsonFail(res, 403, 'Forbidden: 관리자만 포인트를 지급할 수 있습니다.');
    }
    const { memberId, amount, type, description, referenceId, referenceType } = req.body;
    
    if (!memberId || amount === undefined) {
      return jsonFail(res, 400, 'memberId and amount required');
    }

    const numericAmount = Number(amount);
    if (numericAmount < 0) {
      const currentBalance = await getMemberPointBalance(memberId);
      if (currentBalance + numericAmount < 0) {
        return jsonFail(res, 400, '포인트 잔액이 부족합니다.');
      }
    }
    
    const now = new Date().toISOString();
    await syncPointLedgerSeq(); // 지급 직전 시퀀스 보정

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, admin_id, status, created_at)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [memberId, numericAmount, type || 'ADMIN', description || '', referenceId || null, referenceType || null, null, 'active', now]
      );
    } else {
      await db.run(
        `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, admin_id, status, createdAt)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [memberId, numericAmount, type || 'ADMIN', description || '', referenceId || null, referenceType || null, null, 'active', now]
      );
    }

    return jsonOk(res, { memberId, amount: numericAmount });
  } catch (err) {
    logger.error('Error granting points:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/points/pay - QR code payment (deduct points)
app.post('/api/points/pay', requireAuth, async (req, res) => {
  try {
    const { storeId, amount, clientNonce } = req.body;
    // 세션 검증된 실제 memberId 사용 (Bearer 토큰 직접 신뢰 제거)
    const memberId = req.authMemberId;
    
    if (!memberId || !storeId || !amount || amount <= 0) {
      return jsonFail(res, 400, 'storeId and positive amount required');
    }

    const debitAmount = Math.abs(Number(amount));
    const now = new Date().toISOString();
    const description = `상점 ${storeId} 결제`;
    const referenceId = String(clientNonce || storeId || '').trim();
    const referenceType = referenceId.startsWith('DIST_ORDER_') ? 'DISTRIBUTION_ORDER' : 'STORE';

    await syncPointLedgerSeq();

    let currentBalance = 0;
    if (USE_POSTGRES) {
      await db.run('BEGIN');
      try {
        await lockMemberPointLedger(memberId);
        currentBalance = await getMemberPointBalance(memberId);
        if (currentBalance < debitAmount) {
          await db.run('ROLLBACK');
          return jsonFail(res, 400, '포인트 잔액이 부족합니다.');
        }
        await db.run(
          `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, status, created_at)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [memberId, -debitAmount, 'PAYMENT', description, referenceId, referenceType, 'active', now]
        );
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      await db.run('BEGIN');
      try {
        currentBalance = await getMemberPointBalance(memberId);
        if (currentBalance < debitAmount) {
          await db.run('ROLLBACK');
          return jsonFail(res, 400, '포인트 잔액이 부족합니다.');
        }
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, status, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
          [memberId, -debitAmount, 'PAYMENT', description, referenceId, referenceType, 'active', now]
        );
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    }
    
    logger.info(`Payment processed: memberId=${memberId}, storeId=${storeId}, amount=${debitAmount}`);
    return jsonOk(res, { memberId, storeId, amount: debitAmount, balance: currentBalance - debitAmount, clientNonce: clientNonce || null });
  } catch (err) {
    logger.error('Error processing payment:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/points/transfer - member to member point transfer
app.post('/api/points/transfer', requireAuth, async (req, res) => {
  try {
    const senderId = String(req.authMemberId || '').trim();
    const {
      toMemberId,
      toMemberName,
      amount,
      description,
    } = req.body || {};

    if (!senderId) {
      return jsonFail(res, 401, 'Unauthorized: 로그인이 필요합니다.');
    }

    const receiverId = String(toMemberId || '').trim();
    const transferAmount = Math.trunc(Number(amount) || 0);

    if (!receiverId || transferAmount <= 0) {
      return jsonFail(res, 400, 'toMemberId and positive amount required');
    }

    if (senderId === receiverId) {
      return jsonFail(res, 400, '본인에게는 전송할 수 없습니다.');
    }

    const transferEnabledRow = USE_POSTGRES
      ? await db.get('SELECT config_value FROM configs WHERE config_key = $1', ['points_transfer_enabled'])
      : await db.get('SELECT configValue FROM configs WHERE configKey = ?', ['points_transfer_enabled']);
    const transferEnabledValue = USE_POSTGRES ? transferEnabledRow?.config_value : transferEnabledRow?.configValue;
    if (!isPointsTransferEnabledValue(transferEnabledValue)) {
      return jsonFail(res, 403, '현재 포인트 전송이 중지되어 있습니다.');
    }

    const senderMember = USE_POSTGRES
      ? await db.get('SELECT member_id, name FROM members WHERE member_id = $1', [senderId])
      : await db.get('SELECT memberId, name FROM members WHERE memberId = ?', [senderId]);
    const receiverMember = USE_POSTGRES
      ? await db.get('SELECT member_id, name FROM members WHERE member_id = $1', [receiverId])
      : await db.get('SELECT memberId, name FROM members WHERE memberId = ?', [receiverId]);

    if (!senderMember) {
      return jsonFail(res, 404, '보내는 회원을 찾을 수 없습니다.');
    }
    if (!receiverMember) {
      return jsonFail(res, 404, '받는 회원을 찾을 수 없습니다.');
    }

    const senderName = String(senderMember?.name || senderId).trim();
    const receiverName = String(receiverMember?.name || toMemberName || receiverId).trim();
    const now = new Date().toISOString();
    const transferId = `POINT_TRANSFER_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const senderDescription = String(description || `포인트 전송 (→ ${receiverName})`).trim();
    const receiverDescription = `포인트 수신 (← ${senderName})`;

    await syncPointLedgerSeq();
    let senderBalance = 0;
    if (USE_POSTGRES) {
      await db.run('BEGIN');
      try {
        await lockMemberPointLedger(senderId);
        senderBalance = await getMemberPointBalance(senderId);
        if (senderBalance < transferAmount) {
          await db.run('ROLLBACK');
          return jsonFail(res, 400, '포인트 잔액이 부족합니다.');
        }
        await db.run(
          `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, user_name, status, created_at)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [senderId, -Math.abs(transferAmount), 'TRANSFER_OUT', senderDescription, transferId, 'POINT_TRANSFER', senderName, 'active', now]
        );
        await db.run(
          `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, user_name, status, created_at)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [receiverId, Math.abs(transferAmount), 'TRANSFER_IN', receiverDescription, transferId, 'POINT_TRANSFER', receiverName, 'active', now]
        );
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      await db.run('BEGIN');
      try {
        senderBalance = await getMemberPointBalance(senderId);
        if (senderBalance < transferAmount) {
          await db.run('ROLLBACK');
          return jsonFail(res, 400, '포인트 잔액이 부족합니다.');
        }
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, user_name, status, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [senderId, -Math.abs(transferAmount), 'TRANSFER_OUT', senderDescription, transferId, 'POINT_TRANSFER', senderName, 'active', now]
        );
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, user_name, status, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [receiverId, Math.abs(transferAmount), 'TRANSFER_IN', receiverDescription, transferId, 'POINT_TRANSFER', receiverName, 'active', now]
        );
        await db.run('COMMIT');
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    }

    return jsonOk(res, {
      transferId,
      fromMemberId: senderId,
      fromMemberName: senderName,
      toMemberId: receiverId,
      toMemberName: receiverName,
      amount: transferAmount,
      balance: senderBalance - transferAmount,
    });
  } catch (err) {
    logger.error('Error transferring points:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ===================== PARTICIPATIONS API =====================
function normalizeParticipationImages(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((entry) => String(entry || '').trim()).filter(Boolean).slice(0, 3);
  }
  if (typeof value === 'string') {
    const text = String(value || '').trim();
    if (!text) return [];
    if (text.startsWith('[')) {
      try {
        return normalizeParticipationImages(JSON.parse(text));
      } catch (e) {
        return [text].filter(Boolean);
      }
    }
    return text.split(',').map((entry) => String(entry || '').trim()).filter(Boolean).slice(0, 3);
  }
  return [];
}

function serializeParticipationImages(images) {
  const normalized = normalizeParticipationImages(images);
  return USE_POSTGRES ? JSON.stringify(normalized) : JSON.stringify(normalized);
}

function deriveParticipationStatus(row) {
  const rawStatus = USE_POSTGRES ? row?.status : row?.status;
  const normalized = String(rawStatus || '').trim().toLowerCase();
  const selected = USE_POSTGRES ? !!row?.selected : !!row?.selected;
  const rewardedAt = USE_POSTGRES ? row?.rewarded_at : row?.rewardedAt;
  if (rewardedAt) return 'rewarded';
  if (selected) return 'selected';
  if (normalized) return normalized;
  return 'submitted';
}

function normalizeParticipationRow(row) {
  const images = USE_POSTGRES
    ? normalizeParticipationImages(row?.submission_images)
    : normalizeParticipationImages(row?.submissionImages);
  const rewardAmount = USE_POSTGRES ? row?.reward_amount : row?.rewardAmount;
  return USE_POSTGRES ? {
    id: row.participation_id,
    itemKey: row.item_key,
    itemId: row.item_id,
    itemType: row.item_type,
    title: row.title,
    memberId: row.member_id,
    regionId: row.region_id,
    crossRegion: !!row.cross_region,
    joinedAt: row.joined_at,
    status: deriveParticipationStatus(row),
    submissionText: row.submission_text || '',
    submissionLink: row.submission_link || '',
    submissionImages: images,
    reviewNote: row.review_note || '',
    reviewedAt: row.reviewed_at || null,
    reviewedBy: row.reviewed_by || null,
    selected: !!row.selected,
    selectedAt: row.selected_at || null,
    rewardType: row.reward_type || null,
    rewardAmount: Number(rewardAmount || 0),
    rewardDescription: row.reward_description || '',
    rewardedAt: row.rewarded_at || null,
  } : {
    id: row.participationId,
    itemKey: row.itemKey,
    itemId: row.itemId,
    itemType: row.itemType,
    title: row.title,
    memberId: row.memberId,
    regionId: row.regionId,
    crossRegion: !!row.crossRegion,
    joinedAt: row.joinedAt,
    status: deriveParticipationStatus(row),
    submissionText: row.submissionText || '',
    submissionLink: row.submissionLink || '',
    submissionImages: images,
    reviewNote: row.reviewNote || '',
    reviewedAt: row.reviewedAt || null,
    reviewedBy: row.reviewedBy || null,
    selected: !!row.selected,
    selectedAt: row.selectedAt || null,
    rewardType: row.rewardType || null,
    rewardAmount: Number(rewardAmount || 0),
    rewardDescription: row.rewardDescription || '',
    rewardedAt: row.rewardedAt || null,
  };
}

function getParticipationKeyCandidates(itemType, itemId) {
  const safeType = String(itemType || '').trim().toLowerCase();
  const safeId = String(itemId || '').trim();
  return [`${safeType}:${safeId}`, safeId];
}

async function getProgramParticipationRows(itemType, itemId) {
  const [typedKey, legacyKey] = getParticipationKeyCandidates(itemType, itemId);
  const query = USE_POSTGRES
    ? `SELECT p.*, m.name, m.email, m.phone, m.region_id AS member_region_id
       FROM participations p
       LEFT JOIN members m ON p.member_id = CAST(m.member_id AS TEXT)
       WHERE (p.item_key = $1 OR p.item_key = $2)
       ORDER BY p.joined_at DESC`
    : `SELECT p.*, m.name, m.email, m.phone, m.regionId AS memberRegionId
       FROM participations p
       LEFT JOIN members m ON p.memberId = m.memberId
       WHERE (p.itemKey = ? OR p.itemKey = ?)
       ORDER BY p.joinedAt DESC`;
  return await db.all(query, [typedKey, legacyKey]);
}

async function getProgramParticipant(itemType, itemId, memberId) {
  const [typedKey, legacyKey] = getParticipationKeyCandidates(itemType, itemId);
  const query = USE_POSTGRES
    ? `SELECT * FROM participations WHERE member_id = $1 AND (item_key = $2 OR item_key = $3) LIMIT 1`
    : `SELECT * FROM participations WHERE memberId = ? AND (itemKey = ? OR itemKey = ?) LIMIT 1`;
  return await db.get(query, [String(memberId), typedKey, legacyKey]);
}

function mapParticipantWithMember(row) {
  const normalized = normalizeParticipationRow(row);
  return {
    ...normalized,
    name: row.name || 'Unknown',
    email: row.email || '',
    phone: row.phone || '',
    memberRegionId: USE_POSTGRES ? row.member_region_id || null : row.memberRegionId || null,
  };
}

async function updateProgramParticipantReview(itemType, itemId, memberId, updates = {}) {
  const participant = await getProgramParticipant(itemType, itemId, memberId);
  if (!participant) return null;
  const now = new Date().toISOString();
  const nextStatus = String(updates.status || deriveParticipationStatus(participant) || 'submitted').trim().toLowerCase();
  const nextSelected = nextStatus === 'selected' || nextStatus === 'rewarded';
  const nextSelectedAt = nextSelected ? (USE_POSTGRES ? participant.selected_at : participant.selectedAt) || now : null;
  const nextReviewedAt = ['reviewing', 'rejected', 'selected', 'rewarded'].includes(nextStatus) ? now : null;
  const nextReviewedBy = updates.adminId ? String(updates.adminId) : null;
  const nextReviewNote = updates.reviewNote !== undefined ? String(updates.reviewNote || '').trim() : (USE_POSTGRES ? participant.review_note : participant.reviewNote) || '';

  if (USE_POSTGRES) {
    await db.run(
      `UPDATE participations
       SET status = $1,
           review_note = $2,
           reviewed_at = $3,
           reviewed_by = $4,
           selected = $5,
           selected_at = $6
       WHERE participation_id = $7`,
      [nextStatus, nextReviewNote || null, nextReviewedAt, nextReviewedBy, nextSelected, nextSelectedAt, participant.participation_id]
    );
  } else {
    await db.run(
      `UPDATE participations
       SET status = ?,
           reviewNote = ?,
           reviewedAt = ?,
           reviewedBy = ?,
           selected = ?,
           selectedAt = ?
       WHERE participationId = ?`,
      [nextStatus, nextReviewNote || null, nextReviewedAt, nextReviewedBy, nextSelected ? 1 : 0, nextSelectedAt, participant.participationId]
    );
  }

  return await getProgramParticipant(itemType, itemId, memberId);
}

// POST /api/participations - Add participation record
app.post('/api/participations', async (req, res) => {
  try {
    const { itemKey, itemId, itemType, title, memberId, regionId, crossRegion, submissionText, submissionLink, submissionImages } = req.body;
    
    if (!itemKey || !memberId) {
      return res.status(400).json({ error: 'itemKey and memberId required' });
    }

    // ★ 지역미션 검증: mission 참여일 때 regionScope != 'ALL'이면 회원 지역 확인
    if ((itemType === 'mission' || itemType === 'event') && itemId) {
      const tableName = itemType === 'mission' ? 'missions' : 'events';
      const idCol = itemType === 'mission' ? 'mission_id' : 'event_id';
      try {
        const itemRow = await db.get(
          USE_POSTGRES
            ? `SELECT region_scope, region_ids FROM ${tableName} WHERE ${idCol} = $1`
            : `SELECT regionScope, regionIds FROM ${tableName} WHERE ${itemType === 'mission' ? 'missionId' : 'eventId'} = ?`,
          [String(itemId)]
        );
        if (itemRow) {
          const rawScope = USE_POSTGRES ? itemRow.region_scope : itemRow.regionScope;
          const rawRegionIds = USE_POSTGRES
            ? (Array.isArray(itemRow.region_ids) ? itemRow.region_ids : [])
            : (() => { try { return JSON.parse(itemRow.regionIds || '[]'); } catch { return []; } })();
          const normalizedRegionIds = rawRegionIds.map((value) => String(value || '').trim()).filter(Boolean);
          const hasAllRegionToken = normalizedRegionIds.some((value) => value.toUpperCase() === 'ALL');
          const scope = (String(rawScope || '').trim().toUpperCase() === 'REGION' && normalizedRegionIds.length > 0 && !hasAllRegionToken)
            ? 'REGION'
            : 'ALL';
          if (scope === 'REGION') {
            // 회원의 home regionId 조회
            const memberRow = await db.get(
              USE_POSTGRES
                ? `SELECT region_id FROM members WHERE member_id = $1`
                : `SELECT regionId FROM members WHERE memberId = ?`,
              [String(memberId)]
            );
            const memberRegion = String(USE_POSTGRES ? memberRow?.region_id : memberRow?.regionId || '').trim();
            if (!memberRegion || !normalizedRegionIds.includes(memberRegion)) {
              // crossRegion: true 파라미터가 있으면 타지역 참여 허용
              if (crossRegion === true) {
                logger.info(`[POST /api/participations] crossRegion 허용: memberId=${memberId}, itemId=${itemId}, memberRegion=${memberRegion}`);
                // 허용 통과
              } else {
                return res.status(403).json({ error: 'REGION_RESTRICTED', message: `이 ${itemType === 'mission' ? '미션' : '이벤트'}은 해당 지역 회원만 참여할 수 있습니다.` });
              }
            }
          }
        }
      } catch (regionErr) {
        logger.warn('[POST /api/participations] region check warn:', regionErr.message);
        // 검증 실패 시 통과 (서비스 중단 방지)
      }
    }
    
    const now = new Date().toISOString();
    const safeStatus = 'submitted';
    const safeCrossRegion = crossRegion === true;
    const safeSubmissionText = String(submissionText || '').trim();
    const safeSubmissionLink = String(submissionLink || '').trim();
    const safeSubmissionImages = normalizeParticipationImages(submissionImages);
    if (!safeSubmissionText) {
      return res.status(400).json({ error: 'submission_text_required' });
    }
    
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO participations(item_key, item_id, item_type, title, member_id, region_id, cross_region, joined_at, status, submission_text, submission_link, submission_images)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
         ON CONFLICT(item_key, member_id) DO NOTHING`,
        [itemKey, itemId || null, itemType || null, title || '', memberId, regionId || null, safeCrossRegion, now, safeStatus, safeSubmissionText, safeSubmissionLink || null, serializeParticipationImages(safeSubmissionImages)]
      );
    } else {
      // Check duplicate first in SQLite
      const existing = await db.get(
        'SELECT participationId FROM participations WHERE itemKey = ? AND memberId = ?',
        [itemKey, memberId]
      );
      
      if (existing) {
        return res.status(409).json({ error: 'already participated' });
      }
      
      await db.run(
        `INSERT INTO participations(itemKey, itemId, itemType, title, memberId, regionId, crossRegion, joinedAt, status, submissionText, submissionLink, submissionImages)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [itemKey, itemId || null, itemType || null, title || '', memberId, regionId || null, safeCrossRegion ? 1 : 0, now, safeStatus, safeSubmissionText, safeSubmissionLink || null, serializeParticipationImages(safeSubmissionImages)]
      );
    }
    
    res.json({ ok: true, itemKey, memberId, status: safeStatus });
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'already participated' });
    }
    logger.error('Error adding participation:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/participations/:memberId - Get member's participations
app.get('/api/participations/:memberId', async (req, res) => {
  try {
    const { memberId } = req.params;
    
    let rows;
    if (USE_POSTGRES) {
      rows = await db.query(
        `SELECT p.*,
          CASE WHEN LOWER(p.item_type) = 'mission' THEN m.start_date
               WHEN LOWER(p.item_type) = 'event'   THEN e.start_date
          END AS item_start_date,
          CASE WHEN LOWER(p.item_type) = 'mission' THEN m.end_date
               WHEN LOWER(p.item_type) = 'event'   THEN e.end_date
          END AS item_end_date
        FROM participations p
        LEFT JOIN missions m ON LOWER(p.item_type) = 'mission' AND m.mission_id = p.item_id
        LEFT JOIN events   e ON LOWER(p.item_type) = 'event'   AND e.event_id   = p.item_id
        WHERE p.member_id = $1
        ORDER BY p.joined_at DESC`,
        [memberId]
      );
    } else {
      rows = await db.query('SELECT * FROM participations WHERE memberId = ? ORDER BY joinedAt DESC', [memberId]);
    }
    
    const normalized = rows.map((row) => {
      const base = normalizeParticipationRow(row);
      if (USE_POSTGRES) {
        base.startDate = row.item_start_date ? String(row.item_start_date).slice(0, 10) : null;
        base.endDate   = row.item_end_date   ? String(row.item_end_date).slice(0, 10)   : null;
      }
      return base;
    });
    
    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching participations:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/participations/select - 선정 처리만 수행 (보상 지급 분리)
app.put('/api/participations/select', async (req, res) => {
  try {
    const { itemKey, memberId, selected } = req.body;
    
    if (!itemKey || !memberId) {
      return res.status(400).json({ error: 'itemKey and memberId required' });
    }
    
    // 참여자 조회 (404 방지)
    const participant = await db.get(
      USE_POSTGRES
        ? 'SELECT * FROM participations WHERE item_key = $1 AND member_id = $2'
        : 'SELECT * FROM participations WHERE itemKey = ? AND memberId = ?',
      [itemKey, memberId]
    );
    
    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }
    
    // Issue 4-C: 재선정 방지 - 이미 selected면 409 반환
    const alreadySelected = USE_POSTGRES ? !!participant.selected : !!participant.selected;
    if (alreadySelected && selected) {
      return res.status(409).json({ 
        error: 'Already selected', 
        message: '이미 선정된 참여자입니다.',
        participant: {
          itemKey: USE_POSTGRES ? participant.item_key : participant.itemKey,
          memberId: USE_POSTGRES ? participant.member_id : participant.memberId,
          selectedAt: USE_POSTGRES ? participant.selected_at : participant.selectedAt
        }
      });
    }
    
    const now = new Date().toISOString();
    
    const nextStatus = selected ? 'selected' : 'submitted';

    if (USE_POSTGRES) {
      await db.run(
        `UPDATE participations 
         SET selected = $1, selected_at = $2, status = $3, reviewed_at = $4 
         WHERE item_key = $5 AND member_id = $6`,
        [!!selected, selected ? now : null, nextStatus, now, itemKey, memberId]
      );
    } else {
      await db.run(
        `UPDATE participations 
         SET selected = ?, selectedAt = ?, status = ?, reviewedAt = ? 
         WHERE itemKey = ? AND memberId = ?`,
        [selected ? 1 : 0, selected ? now : null, nextStatus, now, itemKey, memberId]
      );
    }
    
    // Issue 4-C: 업데이트된 참여 정보 재조회 (클라이언트 state 동기화용)
    const updatedParticipant = await db.get(
      USE_POSTGRES
        ? 'SELECT * FROM participations WHERE item_key = $1 AND member_id = $2'
        : 'SELECT * FROM participations WHERE itemKey = ? AND memberId = ?',
      [itemKey, memberId]
    );
    
    const normalized = USE_POSTGRES ? {
      id: updatedParticipant.participation_id,
      itemKey: updatedParticipant.item_key,
      memberId: updatedParticipant.member_id,
      selected: !!updatedParticipant.selected,
      selectedAt: updatedParticipant.selected_at
    } : {
      id: updatedParticipant.participationId,
      itemKey: updatedParticipant.itemKey,
      memberId: updatedParticipant.memberId,
      selected: !!updatedParticipant.selected,
      selectedAt: updatedParticipant.selectedAt
    };
    
    // 회원 새 잔액 조회 (point_ledger 합계)
    let memberNewBalance = 0;
    try {
      const balanceQuery = USE_POSTGRES
        ? "SELECT COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 0 ELSE amount END), 0) as balance FROM point_ledger WHERE member_id = $1"
        : "SELECT COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 0 ELSE amount END), 0) as balance FROM point_ledger WHERE memberId = ?";
      const balanceRow = await db.get(balanceQuery, [String(memberId)]);
      memberNewBalance = Number(balanceRow?.balance || 0);
    } catch (e) {
      logger.warn('Failed to get member balance:', e.message);
    }

    res.json({
      ok: true,
      updatedParticipation: normalized,
      pointsAwarded: 0,
      memberNewBalance
    });
  } catch (err) {
    logger.error('Error marking selection:', err);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/participations/reward', async (req, res) => {
  try {
    const { itemKey, memberId, rewardType, rewardAmount, rewardDescription, adminId } = req.body || {};
    if (!itemKey || !memberId || !rewardType) {
      return res.status(400).json({ error: 'itemKey, memberId and rewardType required' });
    }

    const participant = await db.get(
      USE_POSTGRES
        ? 'SELECT * FROM participations WHERE item_key = $1 AND member_id = $2'
        : 'SELECT * FROM participations WHERE itemKey = ? AND memberId = ?',
      [String(itemKey), String(memberId)]
    );

    if (!participant) {
      return res.status(404).json({ error: 'Participant not found' });
    }

    const alreadyRewardedAt = USE_POSTGRES ? participant.rewarded_at : participant.rewardedAt;
    if (alreadyRewardedAt) {
      return res.status(409).json({ error: 'already_rewarded', message: '이미 보상이 지급되었습니다.' });
    }

    const isSelected = USE_POSTGRES ? !!participant.selected : !!participant.selected;
    if (!isSelected) {
      return res.status(400).json({ error: 'not_selected', message: '선정된 참여자에게만 보상을 지급할 수 있습니다.' });
    }

    const now = new Date().toISOString();
    const requestedRewardType = String(rewardType || '').trim().toLowerCase();
    const requestedRewardAmount = Math.max(0, parseInt(rewardAmount, 10) || 0);
    const safeRewardDescription = String(rewardDescription || '').trim();
    const itemType = USE_POSTGRES ? participant.item_type : participant.itemType;
    const itemId = USE_POSTGRES ? participant.item_id : participant.itemId;
    const title = USE_POSTGRES ? participant.title : participant.title;

    // 보상 소스는 프로그램 설정값(미션/이벤트)을 우선 사용한다.
    let configuredRewardType = null;
    let configuredRewardAmount = 0;
    const normalizedItemType = String(itemType || '').trim().toLowerCase();
    const normalizedItemKey = String(itemKey || '').trim();
    const parsedKeyId = normalizedItemKey.includes(':') ? normalizedItemKey.split(':')[1] : normalizedItemKey;
    const programId = String(itemId || parsedKeyId || '').trim();

    if ((normalizedItemType === 'mission' || normalizedItemType === 'event') && programId) {
      if (USE_POSTGRES) {
        const tableName = normalizedItemType === 'mission' ? 'missions' : 'events';
        const idCol = normalizedItemType === 'mission' ? 'mission_id' : 'event_id';
        const program = await db.get(
          `SELECT reward_type, points FROM ${tableName} WHERE ${idCol} = $1 LIMIT 1`,
          [programId]
        );
        configuredRewardType = String(program?.reward_type || '').trim().toLowerCase() || null;
        configuredRewardAmount = Math.max(0, parseInt(program?.points, 10) || 0);
      } else {
        const tableName = normalizedItemType === 'mission' ? 'missions' : 'events';
        const idCol = normalizedItemType === 'mission' ? 'missionId' : 'eventId';
        const program = await db.get(
          `SELECT rewardType, points FROM ${tableName} WHERE ${idCol} = ? LIMIT 1`,
          [programId]
        );
        configuredRewardType = String(program?.rewardType || '').trim().toLowerCase() || null;
        configuredRewardAmount = Math.max(0, parseInt(program?.points, 10) || 0);
      }
    }

    const safeRewardType = configuredRewardType || requestedRewardType || 'points';
    let safeRewardAmount = requestedRewardAmount;
    if (safeRewardType === 'points') {
      safeRewardAmount = configuredRewardAmount > 0 ? configuredRewardAmount : requestedRewardAmount;
    } else if (safeRewardType === 'vip' || safeRewardType === 'voucher') {
      safeRewardAmount = configuredRewardAmount > 0 ? configuredRewardAmount : requestedRewardAmount;
    }

    let pointsAwarded = 0;
    let voucherIssued = null;

    if (safeRewardType === 'points') {
      if (safeRewardAmount <= 0) {
        return res.status(400).json({ error: 'reward_amount_required', message: '포인트 보상 금액이 필요합니다.' });
      }
      const description = safeRewardDescription || `${title || itemKey} 포인트 보상`;
      if (USE_POSTGRES) {
        await db.run(
          `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, status, created_at)
           VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
          [String(memberId), safeRewardAmount, 'PARTICIPATION', description, String(itemKey), String(itemType || '').toUpperCase() || 'MISSION', 'active', now]
        );
      } else {
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, status, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
          [String(memberId), safeRewardAmount, 'PARTICIPATION', description, String(itemKey), String(itemType || '').toUpperCase() || 'MISSION', 'active', now]
        );
      }
      pointsAwarded = safeRewardAmount;
    } else if (safeRewardType === 'vip' || safeRewardType === 'voucher') {
      if (safeRewardAmount <= 0) {
        return res.status(400).json({ error: 'reward_amount_required', message: '상품권 보상 수량이 필요합니다.' });
      }
      const voucherType = safeRewardType === 'vip' ? 'SHOP_USE' : 'MISSION_REWARD';
      const voucherAmount = safeRewardAmount;
      const description = safeRewardDescription || (safeRewardType === 'vip' ? `${title || itemKey} VIP 상품권 지급` : `${title || itemKey} 보상 상품권 지급`);
      if (USE_POSTGRES) {
        await db.run(
          `INSERT INTO voucher_ledger(member_id, type_code, amount, status, source, reference_id, description, admin_id, created_at)
           VALUES($1, $2, $3, 'active', $4, $5, $6, $7, $8)`,
          [String(memberId), voucherType, voucherAmount, String(itemType || '').toUpperCase() || 'MISSION', String(itemKey), description, adminId ? String(adminId) : null, now]
        );
      } else {
        await db.run(
          `INSERT INTO voucher_ledger(member_id, type_code, amount, status, source, reference_id, description, admin_id, created_at)
           VALUES(?, ?, ?, 'active', ?, ?, ?, ?, ?)`,
          [String(memberId), voucherType, voucherAmount, String(itemType || '').toUpperCase() || 'MISSION', String(itemKey), description, adminId ? String(adminId) : null, now]
        );
      }
      voucherIssued = { typeCode: voucherType, amount: voucherAmount };
    }

    if (USE_POSTGRES) {
      await db.run(
        `UPDATE participations
         SET status = $1,
             reward_type = $2,
             reward_amount = $3,
             reward_description = $4,
             rewarded_at = $5,
             reviewed_at = $6,
             reviewed_by = $7
         WHERE participation_id = $8`,
        ['rewarded', safeRewardType, safeRewardAmount, safeRewardDescription || null, now, now, adminId ? String(adminId) : null, participant.participation_id]
      );
    } else {
      await db.run(
        `UPDATE participations
         SET status = ?,
             rewardType = ?,
             rewardAmount = ?,
             rewardDescription = ?,
             rewardedAt = ?,
             reviewedAt = ?,
             reviewedBy = ?
         WHERE participationId = ?`,
        ['rewarded', safeRewardType, safeRewardAmount, safeRewardDescription || null, now, now, adminId ? String(adminId) : null, participant.participationId]
      );
    }

    const updatedParticipant = await db.get(
      USE_POSTGRES
        ? 'SELECT * FROM participations WHERE item_key = $1 AND member_id = $2'
        : 'SELECT * FROM participations WHERE itemKey = ? AND memberId = ?',
      [String(itemKey), String(memberId)]
    );

    res.json({
      ok: true,
      participation: normalizeParticipationRow(updatedParticipant),
      pointsAwarded,
      voucherIssued,
    });
  } catch (err) {
    logger.error('Error rewarding participation:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== CONFIG ENDPOINTS ==========

// GET /api/configs/:key - Get config value
app.get('/api/configs/:key', async (req, res) => {
  try {
    const { key } = req.params;
    
    // Default values for known configs
    const defaults = {
      points_transfer_enabled: 'true'
    };
    
    if (USE_POSTGRES) {
      const rows = await db.query('SELECT config_value FROM configs WHERE config_key = $1', [key]);
      if (rows.length === 0) {
        // Return default value if exists, otherwise 404
        if (defaults[key] !== undefined) {
          return res.json({ key, value: defaults[key] });
        }
        return res.status(404).json({ error: 'Config not found' });
      }
      res.json({ key, value: rows[0].config_value });
    } else {
      const row = await db.get('SELECT configValue FROM configs WHERE configKey = ?', [key]);
      if (!row) {
        // Return default value if exists, otherwise 404
        if (defaults[key] !== undefined) {
          return res.json({ key, value: defaults[key] });
        }
        return res.status(404).json({ error: 'Config not found' });
      }
      res.json({ key, value: row.configValue });
    }
  } catch (err) {
    logger.error('Error fetching config:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/configs - Set or update config value
app.post('/api/configs', async (req, res) => {
  try {
    const { key, value } = req.body;
    
    if (!key || value === undefined) {
      return res.status(400).json({ error: 'key and value required' });
    }
    
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO configs (config_key, config_value, updated_at) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (config_key) DO UPDATE SET config_value = $2, updated_at = $3`,
        [key, value, now]
      );
    } else {
      await db.run(
        `INSERT OR REPLACE INTO configs (configKey, configValue, updatedAt) 
         VALUES (?, ?, ?)`,
        [key, value, now]
      );
    }
    
    res.json({ ok: true, key, value });
  } catch (err) {
    logger.error('Error setting config:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== POSTS API ==========

// GET /api/posts - Get posts with filters
app.get('/api/posts', async (req, res) => {
  try {
    const { region, boardType, tag, publicOnly } = req.query;
    
    let query, params;
    if (USE_POSTGRES) {
      const conditions = [];
      const values = [];
      let idx = 1;
      
      if (region) {
        conditions.push(`region = $${idx++}`);
        values.push(region);
      }
      if (boardType) {
        conditions.push(`board_type = $${idx++}`);
        values.push(boardType);
      }
      if (tag) {
        conditions.push(`tags LIKE $${idx++}`);
        values.push(`%${tag}%`);
      }
      if (publicOnly === 'true') {
        conditions.push(`is_public = true`);
      }
      
      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      query = `SELECT * FROM posts ${where} ORDER BY is_pinned DESC, created_at DESC`;
      params = values;
    } else {
      const conditions = [];
      const values = [];
      
      if (region) {
        conditions.push('region = ?');
        values.push(region);
      }
      if (boardType) {
        conditions.push('board_type = ?');
        values.push(boardType);
      }
      if (tag) {
        conditions.push('tags LIKE ?');
        values.push(`%${tag}%`);
      }
      if (publicOnly === 'true') {
        conditions.push('isPublic = 1');
      }
      
      const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      query = `SELECT * FROM posts ${where} ORDER BY isPinned DESC, created_at DESC`;
      params = values;
    }
    
    const rows = await db.all(query, params);
    res.json(rows || []);
  } catch (err) {
    logger.error('Error fetching posts:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/posts - Create post
app.post('/api/posts', async (req, res) => {
  try {
    const { title, body, boardType, region, authorId, isPinned, tags, attachments, isPublic } = req.body;
    
    if (!title || !body) {
      return res.status(400).json({ error: 'title and body are required' });
    }
    
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO posts (title, body, board_type, region, author_id, is_pinned, tags, attachments, is_public, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const row = await db.get(query, [
        title, body, boardType || '', region || '', authorId || '', 
        !!isPinned, tags || '', attachments ? JSON.stringify(attachments) : null,
        isPublic !== false, now, now
      ]);
      res.json({ ok: true, post: row });
    } else {
      const postId = Date.now() + '_' + Math.floor(Math.random() * 10000);
      const query = `
        INSERT INTO posts (postId, title, body, board_type, region, authorId, isPinned, tags, attachments, isPublic, views, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)
      `;
      await db.run(query, [
        postId, title, body, boardType || '', region || '', authorId || '',
        isPinned ? 1 : 0, tags || '', attachments ? JSON.stringify(attachments) : null,
        isPublic !== false ? 1 : 0, now, now
      ]);
      const post = await db.get('SELECT * FROM posts WHERE postId = ?', [postId]);
      res.json({ ok: true, post });
    }
  } catch (err) {
    logger.error('Error creating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/posts/:id - Update post
app.patch('/api/posts/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    
    const sets = [];
    const params = [];
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      let idx = 1;
      if (updates.title !== undefined) { sets.push(`title=$${idx++}`); params.push(updates.title); }
      if (updates.body !== undefined) { sets.push(`body=$${idx++}`); params.push(updates.body); }
      if (updates.isPinned !== undefined) { sets.push(`is_pinned=$${idx++}`); params.push(!!updates.isPinned); }
      if (updates.tags !== undefined) { sets.push(`tags=$${idx++}`); params.push(updates.tags); }
      if (updates.attachments !== undefined) { sets.push(`attachments=$${idx++}`); params.push(JSON.stringify(updates.attachments)); }
      if (updates.isPublic !== undefined) { sets.push(`is_public=$${idx++}`); params.push(!!updates.isPublic); }
      if (updates.incrementViews) { sets.push(`views = views + 1`); }
      
      if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
      
      sets.push(`updated_at=$${idx++}`);
      params.push(now);
      params.push(id);
      
      const query = `UPDATE posts SET ${sets.join(', ')} WHERE post_id = $${idx} RETURNING *`;
      const row = await db.get(query, params);
      res.json({ ok: true, post: row });
    } else {
      if (updates.title !== undefined) { sets.push('title = ?'); params.push(updates.title); }
      if (updates.body !== undefined) { sets.push('body = ?'); params.push(updates.body); }
      if (updates.isPinned !== undefined) { sets.push('isPinned = ?'); params.push(updates.isPinned ? 1 : 0); }
      if (updates.tags !== undefined) { sets.push('tags = ?'); params.push(updates.tags); }
      if (updates.attachments !== undefined) { sets.push('attachments = ?'); params.push(JSON.stringify(updates.attachments)); }
      if (updates.isPublic !== undefined) { sets.push('isPublic = ?'); params.push(updates.isPublic ? 1 : 0); }
      if (updates.incrementViews) { sets.push('views = views + 1'); }
      
      if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
      
      sets.push('updated_at = ?');
      params.push(now);
      params.push(id);
      
      const query = `UPDATE posts SET ${sets.join(', ')} WHERE postId = ?`;
      await db.run(query, params);
      const post = await db.get('SELECT * FROM posts WHERE postId = ?', [id]);
      res.json({ ok: true, post });
    }
  } catch (err) {
    logger.error('Error updating post:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/missions/:id/participate - Participate in mission with point reward (transaction)
app.post('/api/missions/:id/participate', async (req, res) => {
  try {
    const { id: missionId } = req.params;
    const { memberId } = req.body;
    
    if (!memberId) {
      return res.status(400).json({ error: 'memberId required' });
    }
    
    // Get mission details
    const missionQuery = USE_POSTGRES
      ? 'SELECT * FROM missions WHERE mission_id = $1'
      : 'SELECT * FROM missions WHERE missionId = ?';
    const missions = await db.query(missionQuery, [missionId]);
    
    if (missions.length === 0) {
      return res.status(404).json({ error: 'Mission not found' });
    }
    
    const mission = missions[0];
    const points = USE_POSTGRES ? mission.points : mission.points;
    const title = USE_POSTGRES ? mission.title : mission.title;
    const itemKey = `mission:${missionId}`;
    
    // Check duplicate
    const dupQuery = USE_POSTGRES
      ? 'SELECT participation_id FROM participations WHERE item_key = $1 AND member_id = $2'
      : 'SELECT participationId FROM participations WHERE itemKey = ? AND memberId = ?';
    const existing = await db.get(dupQuery, [itemKey, memberId]);
    
    if (existing) {
      return res.status(409).json({ error: 'already participated' });
    }
    
    const now = new Date().toISOString();
    
    // Transaction: Add participation + grant points
    if (USE_POSTGRES) {
      await db.run('BEGIN');
      await db.run(
        `INSERT INTO participations(item_key, item_id, item_type, title, member_id, joined_at)
         VALUES($1, $2, $3, $4, $5, $6)`,
        [itemKey, missionId, 'mission', title, memberId, now]
      );
      await db.run(
        `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, created_at)
         VALUES($1, $2, $3, $4, $5, $6, $7)`,
        [memberId, points, 'MISSION', `미션 참여: ${title}`, missionId, 'mission', now]
      );
      await db.run('COMMIT');
    } else {
      // SQLite: Simulate transaction with try-catch
      try {
        await db.run(
          `INSERT INTO participations(itemKey, itemId, itemType, title, memberId, joinedAt)
           VALUES(?, ?, ?, ?, ?, ?)`,
          [itemKey, missionId, 'mission', title, memberId, now]
        );
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?)`,
          [memberId, points, 'MISSION', `미션 참여: ${title}`, missionId, 'mission', now]
        );
      } catch (err) {
        // Rollback is not easy in SQLite without WAL, log error
        logger.error('SQLite mission participation failed:', err);
        throw err;
      }
    }
    
    res.json({ ok: true, points, missionId, memberId });
  } catch (err) {
    logger.error('Error participating in mission:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===================== LIVE BROADCAST API =====================
// POST /api/broadcasts/live/start - Start live broadcast
app.post('/api/broadcasts/live/start', async (req, res) => {
  try {
    const { broadcastId, title, createdBy } = req.body;
    
    if (!broadcastId || !title) {
      return res.status(400).json({ error: 'broadcastId and title required' });
    }
    
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO broadcasts(broadcast_id, title, is_live, live_started_at, created_by, created_at, updated_at)
         VALUES($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT(broadcast_id) DO UPDATE SET
           is_live = true,
           live_started_at = EXCLUDED.live_started_at,
           updated_at = EXCLUDED.updated_at`,
        [broadcastId, title, true, now, createdBy || null, now, now]
      );
    } else {
      await db.run(
        `INSERT OR REPLACE INTO broadcasts(broadcastId, title, isLive, liveStartedAt, createdBy, createdAt, updatedAt)
         VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [broadcastId, title, 1, now, createdBy || null, now, now]
      );
    }
    
    res.json({ ok: true, broadcastId, isLive: true });
  } catch (err) {
    logger.error('Error starting live broadcast:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/broadcasts/live/stop - Stop live broadcast
app.post('/api/broadcasts/live/stop', async (req, res) => {
  try {
    const { broadcastId } = req.body;
    
    if (!broadcastId) {
      return res.status(400).json({ error: 'broadcastId required' });
    }
    
    const now = new Date().toISOString();
    
    const query = USE_POSTGRES
      ? `UPDATE broadcasts SET is_live = false, updated_at = $1 WHERE broadcast_id = $2`
      : `UPDATE broadcasts SET isLive = 0, updatedAt = ? WHERE broadcastId = ?`;
    
    await db.run(query, USE_POSTGRES ? [now, broadcastId] : [now, broadcastId]);
    
    res.json({ ok: true, broadcastId, isLive: false });
  } catch (err) {
    logger.error('Error stopping live broadcast:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/broadcasts/live/status - Check if any broadcast is live
app.get('/api/broadcasts/live/status', async (req, res) => {
  try {
    const query = USE_POSTGRES
      ? 'SELECT * FROM broadcasts WHERE is_live = true LIMIT 1'
      : 'SELECT * FROM broadcasts WHERE isLive = 1 LIMIT 1';
    
    const rows = await db.query(query);
    
    if (rows.length === 0) {
      return res.json({ isLive: false, broadcast: null });
    }
    
    const b = rows[0];
    const normalized = USE_POSTGRES ? {
      id: b.broadcast_id,
      title: b.title,
      isLive: b.is_live,
      liveStartedAt: b.live_started_at,
      createdBy: b.created_by
    } : {
      id: b.broadcastId,
      title: b.title,
      isLive: !!b.isLive,
      liveStartedAt: b.liveStartedAt,
      createdBy: b.createdBy
    };
    
    res.json({ isLive: true, broadcast: normalized });
  } catch (err) {
    logger.error('Error checking live status:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ========================================
 * Region API Extensions (P1-C)
 * ========================================
 */

// Toggle region public status
app.put('/api/regions/:id/public', async (req, res) => {
  try {
    const { id } = req.params;
    const { isPublic } = req.body;
    
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE regions SET is_public = $1, updated_at = NOW() WHERE region_id = $2`,
        [!!isPublic, id]
      );
    } else {
      await db.run(
        `UPDATE regions SET isPublic = ?, updatedAt = ? WHERE regionId = ?`,
        [isPublic ? 1 : 0, new Date().toISOString(), id]
      );
    }
    
    res.json({ success: true, regionId: id, isPublic: !!isPublic });
  } catch (err) {
    logger.error('Error updating region public status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get region statistics
app.get('/api/regions/:id/stats', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Count participations for this region
    let participationCount = 0;
    if (USE_POSTGRES) {
      const result = await db.get(
        `SELECT COUNT(*) as count FROM participations WHERE region_id = $1`,
        [id]
      );
      participationCount = result?.count || 0;
    } else {
      const result = await db.get(
        `SELECT COUNT(*) as count FROM participations WHERE regionId = ?`,
        [id]
      );
      participationCount = result?.count || 0;
    }
    
    // Count missions/events for this region
    let missionCount = 0;
    let eventCount = 0;
    if (USE_POSTGRES) {
      const mResult = await db.get(
        `SELECT COUNT(*) as count FROM missions WHERE region_scope = 'REGION' AND $1 = ANY(region_ids)`,
        [id]
      );
      missionCount = mResult?.count || 0;
      
      const eResult = await db.get(
        `SELECT COUNT(*) as count FROM events WHERE region_scope = 'REGION' AND $1 = ANY(region_ids)`,
        [id]
      );
      eventCount = eResult?.count || 0;
    } else {
      // SQLite: region_ids stored as JSON string
      const missions = await db.all(`SELECT regionIds FROM missions WHERE regionScope = 'REGION'`);
      missionCount = missions.filter(m => {
        try {
          const ids = JSON.parse(m.regionIds || '[]');
          return ids.includes(id);
        } catch { return false; }
      }).length;
      
      const events = await db.all(`SELECT regionIds FROM events WHERE regionScope = 'REGION'`);
      eventCount = events.filter(e => {
        try {
          const ids = JSON.parse(e.regionIds || '[]');
          return ids.includes(id);
        } catch { return false; }
      }).length;
    }
    
    res.json({
      regionId: id,
      participationCount,
      missionCount,
      eventCount,
      totalActivities: missionCount + eventCount
    });
  } catch (err) {
    logger.error('Error getting region stats:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * ========================================
 * User Card API (P1-D)
 * ========================================
 */

// GET /api/cards/check/:slug — 슬러그 중복 확인
app.get('/api/cards/check/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!slug || !/^[a-z0-9-_]{2,60}$/.test(slug)) {
      return res.json({ available: false, reason: '2~60자 영문 소문자/숫자/하이픈만 허용됩니다.' });
    }
    if (!USE_POSTGRES) return res.json({ available: true });
    const row = await db.get(`SELECT member_id FROM members WHERE card_slug = $1`, [slug]);
    return res.json({ available: !row });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cards/by-slug/:slug — 슬러그로 공개 명함 조회
app.get('/api/cards/by-slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    if (!USE_POSTGRES) return res.status(404).json({ error: 'Card not found' });
    const user = await db.get(
      `SELECT member_id, name, phone, email, region, bio, links, card_public, card_slug
       FROM members WHERE card_slug = $1`,
      [slug]
    );
    if (!user) return res.status(404).json({ error: 'Card not found' });
    if (!user.card_public) {
      return res.json({ card: { memberId: user.member_id, cardSlug: user.card_slug, name: user.name, cardPublic: false } });
    }
    return res.json({
      card: {
        memberId: user.member_id,
        cardSlug: user.card_slug,
        name: user.name,
        phone: user.phone,
        email: user.email,
        region: user.region,
        bio: user.bio,
        links: user.links,
        cardPublic: user.card_public,
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cards/:cardId - contract: { card }
// 현재 cardId는 memberId와 동일하게 취급 (SSOT: members)
app.get('/api/cards/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;
    if (!cardId) return res.status(400).json({ error: 'cardId required' });

    // Reuse the same member fields as user card
    const user = USE_POSTGRES
      ? await db.get(
        `SELECT member_id, name, phone, email, region, bio, links, card_public, card_slug
         FROM members WHERE member_id = $1`,
        [cardId]
      )
      : await db.get(
        `SELECT memberId, name, phone, email, region, bio, links, cardPublic
         FROM members WHERE memberId = ?`,
        [cardId]
      );

    if (!user) return res.status(404).json({ error: 'Card not found' });

    if (USE_POSTGRES) {
      if (!user.card_public) {
        return res.json({
          card: {
            memberId: user.member_id,
            cardId: user.member_id,
            cardSlug: user.card_slug || null,
            name: user.name,
            cardPublic: false,
          }
        });
      }
      return res.json({
        card: {
          memberId: user.member_id,
          cardId: user.member_id,
          cardSlug: user.card_slug || null,
          name: user.name,
          phone: user.phone,
          email: user.email,
          region: user.region,
          bio: user.bio,
          links: user.links,
          cardPublic: user.card_public,
        }
      });
    }

    let links = [];
    try {
      links = user.links ? JSON.parse(user.links) : [];
    } catch (e) {
      links = [];
    }

    if (!user.cardPublic) {
      return res.json({
        card: {
          memberId: user.memberId,
          cardId: user.memberId,
          name: user.name,
          cardPublic: false,
        }
      });
    }

    return res.json({
      card: {
        memberId: user.memberId,
        cardId: user.memberId,
        name: user.name,
        phone: user.phone,
        email: user.email,
        region: user.region,
        bio: user.bio,
        links,
        cardPublic: !!user.cardPublic,
      }
    });
  } catch (err) {
    logger.error('Error getting card:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user card (with privacy check)
app.get('/api/users/:id/card', async (req, res) => {
  try {
    const { id } = req.params;
    
    let user;
    if (USE_POSTGRES) {
      user = await db.get(
        `SELECT member_id, name, phone, email, region, bio, links, card_public 
         FROM members WHERE member_id = $1`,
        [id]
      );
      
      if (user && !user.card_public) {
        // Privacy: only return basic info if card is not public
        return res.json({
          memberId: user.member_id,
          name: user.name,
          cardPublic: false
        });
      }
      
      if (user) {
        res.json({
          memberId: user.member_id,
          name: user.name,
          phone: user.phone,
          email: user.email,
          region: user.region,
          bio: user.bio,
          links: user.links,
          cardPublic: user.card_public
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      user = await db.get(
        `SELECT memberId, name, phone, email, region, bio, links, cardPublic 
         FROM members WHERE memberId = ?`,
        [id]
      );
      
      if (user && !user.cardPublic) {
        return res.json({
          memberId: user.memberId,
          name: user.name,
          cardPublic: false
        });
      }
      
      if (user) {
        let links = [];
        try {
          links = user.links ? JSON.parse(user.links) : [];
        } catch (e) {}
        
        res.json({
          memberId: user.memberId,
          name: user.name,
          phone: user.phone,
          email: user.email,
          region: user.region,
          bio: user.bio,
          links,
          cardPublic: !!user.cardPublic
        });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    }
  } catch (err) {
    logger.error('Error getting user card:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user card (slug 포함)
app.put('/api/users/:id/card', async (req, res) => {
  try {
    const { id } = req.params;
    const { bio, links, cardPublic, cardSlug } = req.body;
    
    if (USE_POSTGRES) {
      // slug 변경 시 중복 확인
      if (cardSlug) {
        const existing = await db.get(
          `SELECT member_id FROM members WHERE card_slug = $1 AND member_id != $2`,
          [cardSlug, id]
        );
        if (existing) return res.status(409).json({ error: '이미 사용 중인 주소입니다.' });
      }
      await db.run(
        `UPDATE members 
         SET bio = $1, links = $2, card_public = $3, card_slug = COALESCE($4, card_slug), updated_at = NOW() 
         WHERE member_id = $5`,
        [bio || null, links || null, !!cardPublic, cardSlug || null, id]
      );
    } else {
      const linksStr = links ? JSON.stringify(links) : null;
      await db.run(
        `UPDATE members 
         SET bio = ?, links = ?, cardPublic = ?, updatedAt = ? 
         WHERE memberId = ?`,
        [bio || null, linksStr, cardPublic ? 1 : 0, new Date().toISOString(), id]
      );
    }
    
    res.json({ success: true, memberId: id });
  } catch (err) {
    logger.error('Error updating user card:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/members/:id/card — 명함 upsert (슬러그 포함)
app.patch('/api/members/:id/card', async (req, res) => {
  try {
    const { id } = req.params;
    const memberId = req.headers['x-member-id'];
    if (!memberId || String(memberId) !== String(id)) {
      return res.status(403).json({ error: '본인 명함만 수정 가능합니다.' });
    }
    const { bio, links, cardPublic, cardSlug } = req.body;
    if (!USE_POSTGRES) return res.status(400).json({ error: 'PostgreSQL only' });

    if (cardSlug) {
      if (!/^[a-z0-9-_]{2,60}$/.test(cardSlug)) {
        return res.status(400).json({ error: '슬러그는 2~60자 영문 소문자/숫자/하이픈만 허용됩니다.' });
      }
      const existing = await db.get(
        `SELECT member_id FROM members WHERE card_slug = $1 AND member_id != $2`,
        [cardSlug, id]
      );
      if (existing) return res.status(409).json({ error: '이미 사용 중인 주소입니다.' });
    }

    const linksJson = links ? JSON.stringify(links) : null;
    await db.run(
      `UPDATE members
       SET bio = COALESCE($1, bio),
           links = COALESCE($2::jsonb, links),
           card_public = COALESCE($3, card_public),
           card_slug = COALESCE($4, card_slug),
           updated_at = NOW()
       WHERE member_id = $5`,
      [bio ?? null, linksJson, cardPublic !== undefined ? !!cardPublic : null, cardSlug || null, id]
    );

    const updated = await db.get(
      `SELECT member_id, name, bio, links, card_public, card_slug FROM members WHERE member_id = $1`,
      [id]
    );
    return res.json({
      success: true,
      card: {
        memberId: updated.member_id,
        cardSlug: updated.card_slug,
        bio: updated.bio,
        links: updated.links,
        cardPublic: updated.card_public,
      }
    });
  } catch (err) {
    logger.error('Error patching card:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/members/:id/card — 명함 삭제 (slug, bio, links 초기화)
app.delete('/api/members/:id/card', async (req, res) => {
  try {
    const { id } = req.params;
    const memberId = req.headers['x-member-id'];
    if (!memberId || String(memberId) !== String(id)) {
      return res.status(403).json({ error: '본인 명함만 삭제 가능합니다.' });
    }
    if (!USE_POSTGRES) return res.status(400).json({ error: 'PostgreSQL only' });
    await db.run(
      `UPDATE members SET card_slug = NULL, bio = NULL, links = NULL, card_public = false, updated_at = NOW()
       WHERE member_id = $1`,
      [id]
    );
    return res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting card:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== Schedule Routes ==========

function isValidYyyyMmDd(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

// Get schedules for a user
app.get('/api/schedules', async (req, res) => {
  try {
    const userId = req.query.userId || req.headers['x-member-id'];
    if (!userId) return res.status(400).json({ error: 'userId is required (query userId or x-member-id header)' });

    let schedules = [];
    if (USE_POSTGRES) {
      schedules = await db.query(
        `SELECT schedule_id as id, user_id as "userId", title, description, 
                schedule_date as "scheduleDate", schedule_time as "scheduleTime", 
                status, created_at as "createdAt", updated_at as "updatedAt"
         FROM schedules 
         WHERE user_id = $1 
         ORDER BY schedule_date DESC, schedule_time DESC`,
        [userId]
      );
      if (!Array.isArray(schedules)) schedules = [];
    } else {
      const rows = await db.query(
        `SELECT scheduleId as id, userId, title, description, 
                scheduleDate, scheduleTime, status, createdAt, updatedAt
         FROM schedules 
         WHERE userId = ? 
         ORDER BY scheduleDate DESC, scheduleTime DESC`,
        [userId]
      );
      schedules = rows || [];
    }

    // SSOT enforcement: scheduleDate must not be null. Attempt safe repair using createdAt (YYYY-MM-DD).
    const repaired = [];
    for (const s of schedules) {
      // ★ PG DATE 컬럼은 JS Date 객체로 반환될 수 있음 → YYYY-MM-DD 문자열로 정규화
      let rawDate = s.scheduleDate;
      if (rawDate instanceof Date) {
        rawDate = rawDate.toISOString().slice(0, 10);
      } else if (rawDate && typeof rawDate === 'string') {
        // 타임스탬프 형태 처리: '2026-03-15T...' → '2026-03-15'
        rawDate = rawDate.slice(0, 10);
      }
      const scheduleDate = rawDate;
      if (scheduleDate && isValidYyyyMmDd(String(scheduleDate))) {
        repaired.push({ ...s, scheduleDate });
        continue;
      }

      const createdAt = s.createdAt || s.created_at || null;
      const rawFallback = createdAt ? String(createdAt).slice(0, 10) : null;
      const fallbackDate = (rawFallback && isValidYyyyMmDd(rawFallback))
        ? rawFallback
        : new Date().toISOString().slice(0, 10); // 오늘 날짜로 최종 fallback

      try {
        if (USE_POSTGRES) {
          const q = 'UPDATE schedules SET schedule_date = $1, updated_at = NOW() WHERE schedule_id = $2';
          await db.run(q, [fallbackDate, s.id]);
        } else {
          const q = 'UPDATE schedules SET scheduleDate = ?, updatedAt = ? WHERE scheduleId = ?';
          await db.run(q, [fallbackDate, new Date().toISOString(), s.id]);
        }
        repaired.push({ ...s, scheduleDate: fallbackDate });
      } catch (e) {
        logger.error('Failed to repair scheduleDate:', e);
        return res.status(500).json({ error: 'failed to repair scheduleDate', scheduleId: s.id });
      }
    }

    res.json({ schedules: repaired });
  } catch (err) {
    logger.error('Error fetching schedules:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create a new schedule
app.post('/api/schedules', async (req, res) => {
  try {
    const body = req.body || {};
    const userId = body.userId || req.headers['x-member-id'];
    const { title, description, scheduleDate, scheduleTime, status } = body;
    
    if (!userId || !title) return res.status(400).json({ error: 'userId and title are required' });
    if (!scheduleDate || !isValidYyyyMmDd(String(scheduleDate))) {
      return res.status(400).json({ error: 'scheduleDate is required (YYYY-MM-DD)' });
    }

    const scheduleId = Date.now().toString();
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO schedules 
         (schedule_id, user_id, title, description, schedule_date, schedule_time, status, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [
          scheduleId,
          userId,
          title,
          description || null,
          scheduleDate,
          scheduleTime || null,
          status || 'pending'
        ]
      );
    } else {
      await db.run(
        `INSERT INTO schedules 
         (scheduleId, userId, title, description, scheduleDate, scheduleTime, status, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          scheduleId,
          userId,
          title,
          description || null,
          scheduleDate,
          scheduleTime || null,
          status || 'pending',
          now,
          now
        ]
      );
    }

    const schedule = {
      id: scheduleId,
      userId,
      title,
      description,
      scheduleDate,
      scheduleTime,
      status: status || 'pending',
      createdAt: now,
      updatedAt: now
    };

    res.json({ success: true, schedule });
  } catch (err) {
    logger.error('Error creating schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update a schedule
async function handleUpdateSchedule(req, res) {
  try {
    const { id } = req.params;
    const { title, description, scheduleDate, scheduleTime, status } = req.body;

    if (scheduleDate !== undefined && scheduleDate !== null && !isValidYyyyMmDd(String(scheduleDate))) {
      return res.status(400).json({ error: 'scheduleDate must be YYYY-MM-DD' });
    }

    if (USE_POSTGRES) {
      const updates = [];
      const values = [];
      let paramCount = 1;

      if (title !== undefined) {
        updates.push(`title = $${paramCount++}`);
        values.push(title);
      }
      if (description !== undefined) {
        updates.push(`description = $${paramCount++}`);
        values.push(description);
      }
      if (scheduleDate !== undefined) {
        updates.push(`schedule_date = $${paramCount++}`);
        values.push(scheduleDate);
      }
      if (scheduleTime !== undefined) {
        updates.push(`schedule_time = $${paramCount++}`);
        values.push(scheduleTime);
      }
      if (status !== undefined) {
        updates.push(`status = $${paramCount++}`);
        values.push(status);
      }

      updates.push(`updated_at = NOW()`);
      values.push(id);

      await db.run(
        `UPDATE schedules SET ${updates.join(', ')} WHERE schedule_id = $${paramCount}`,
        values
      );
    } else {
      const updates = [];
      const values = [];

      if (title !== undefined) {
        updates.push('title = ?');
        values.push(title);
      }
      if (description !== undefined) {
        updates.push('description = ?');
        values.push(description);
      }
      if (scheduleDate !== undefined) {
        updates.push('scheduleDate = ?');
        values.push(scheduleDate);
      }
      if (scheduleTime !== undefined) {
        updates.push('scheduleTime = ?');
        values.push(scheduleTime);
      }
      if (status !== undefined) {
        updates.push('status = ?');
        values.push(status);
      }

      updates.push('updatedAt = ?');
      values.push(new Date().toISOString());
      values.push(id);

      await db.run(
        `UPDATE schedules SET ${updates.join(', ')} WHERE scheduleId = ?`,
        values
      );
    }

    res.json({ success: true, schedule: { id, title, description, scheduleDate, scheduleTime, status } });
  } catch (err) {
    logger.error('Error updating schedule:', err);
    res.status(500).json({ error: err.message });
  }
}

app.put('/api/schedules/:id', handleUpdateSchedule);
app.patch('/api/schedules/:id', handleUpdateSchedule);

// Delete a schedule
app.delete('/api/schedules/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (USE_POSTGRES) {
      await db.run('DELETE FROM schedules WHERE schedule_id = $1', [id]);
    } else {
      await db.run('DELETE FROM schedules WHERE scheduleId = ?', [id]);
    }

    res.json({ success: true });
  } catch (err) {
    logger.error('Error deleting schedule:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== Chat Routes ==========

// ========== Messages (SSOT alias) ==========
// GET /api/messages?memberId=SU...&with=SU...
// or use x-member-id header as memberId
app.get('/api/messages', async (req, res) => {
  try {
    const memberId = String(req.headers['x-member-id'] || req.query.memberId || '').trim();
    const withId = String(req.query.with || '').trim();
    if (!memberId) return jsonFail(res, 400, 'memberId required');
    if (!withId) return jsonFail(res, 400, 'with required');

    let messages = [];
    if (USE_POSTGRES) {
      const result = await db.query(
        `SELECT chat_id as id, from_user_id as "from", to_user_id as "to", text, created_at as "createdAt"
         FROM chats
         WHERE (from_user_id = $1 AND to_user_id = $2)
            OR (from_user_id = $2 AND to_user_id = $1)
         ORDER BY created_at ASC`,
        [memberId, withId]
      );
      messages = result.rows;
    } else {
      const rows = await db.query(
        `SELECT chatId as id, fromUserId as "from", toUserId as "to", text, createdAt
         FROM chats
         WHERE (fromUserId = ? AND toUserId = ?)
            OR (fromUserId = ? AND toUserId = ?)
         ORDER BY createdAt ASC`,
        [memberId, withId, withId, memberId]
      );
      messages = rows || [];
    }
    return jsonOk(res, { messages });
  } catch (err) {
    logger.error('Error fetching messages:', err);
    return jsonFail(res, 500, err.message);
  }
});

// POST /api/messages
app.post('/api/messages', async (req, res) => {
  try {
    const { fromId, toId, text } = req.body || {};
    
    if (!fromId) return jsonFail(res, 400, 'fromId required');
    if (!toId) return jsonFail(res, 400, 'toId required');
    if (!text) return jsonFail(res, 400, 'text required');

    const chatId = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO chats (chat_id, from_user_id, to_user_id, text, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [chatId, fromId, toId, text]
      );
    } else {
      await db.run(
        `INSERT INTO chats (chatId, fromUserId, toUserId, text, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [chatId, fromId, toId, text, now]
      );
    }

    logForensicWrite({
      route: '/api/messages',
      method: 'POST',
      body: { fromId, toId, text },
      sql: 'INSERT INTO chats(...)',
      params: [chatId, fromId, toId],
      dbResult: { changes: 1 },
      result: { ok: true, success: true, messageId: chatId },
    });

    return jsonOk(res, { messageId: chatId });
  } catch (err) {
    logger.error('Error sending message:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Get conversation between two users
app.get('/api/chats', async (req, res) => {
  try {
    const { user1, user2 } = req.query;
    if (!user1 || !user2) {
      return jsonFail(res, 400, 'user1 and user2 are required');
    }

    let messages = [];
    if (USE_POSTGRES) {
      const result = await db.query(
        `SELECT chat_id as id, from_user_id as "from", to_user_id as "to", 
                text, created_at as "createdAt"
         FROM chats 
         WHERE (from_user_id = $1 AND to_user_id = $2) 
            OR (from_user_id = $2 AND to_user_id = $1)
         ORDER BY created_at ASC`,
        [user1, user2]
      );
      messages = result.rows;
    } else {
      const rows = await db.query(
        `SELECT chatId as id, fromUserId as "from", toUserId as "to", 
                text, createdAt
         FROM chats 
         WHERE (fromUserId = ? AND toUserId = ?) 
            OR (fromUserId = ? AND toUserId = ?)
         ORDER BY createdAt ASC`,
        [user1, user2, user2, user1]
      );
      messages = rows || [];
    }

    return jsonOk(res, { messages });
  } catch (err) {
    logger.error('Error fetching conversation:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Send a message
app.post('/api/chats', async (req, res) => {
  try {
    const { from, to, text } = req.body;
    
    if (!from || !to || !text) {
      return jsonFail(res, 400, 'from, to, and text are required');
    }

    const chatId = 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO chats (chat_id, from_user_id, to_user_id, text, created_at)
         VALUES ($1, $2, $3, $4, NOW())`,
        [chatId, from, to, text]
      );
    } else {
      await db.run(
        `INSERT INTO chats (chatId, fromUserId, toUserId, text, createdAt)
         VALUES (?, ?, ?, ?, ?)`,
        [chatId, from, to, text, now]
      );
    }

    const message = {
      id: chatId,
      from,
      to,
      text,
      createdAt: now
    };

    return jsonOk(res, { message });
  } catch (err) {
    logger.error('Error sending message:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Get conversations list for a user
app.get('/api/chats/conversations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let conversations = [];
    if (USE_POSTGRES) {
      // Get distinct conversation partners with last message
      const result = await db.query(
        `WITH ranked_messages AS (
          SELECT 
            chat_id as id,
            from_user_id as "from",
            to_user_id as "to",
            text,
            created_at as "createdAt",
            CASE 
              WHEN from_user_id = $1 THEN to_user_id 
              ELSE from_user_id 
            END as partner_id,
            ROW_NUMBER() OVER (
              PARTITION BY CASE 
                WHEN from_user_id = $1 THEN to_user_id 
                ELSE from_user_id 
              END 
              ORDER BY created_at DESC
            ) as rn
          FROM chats
          WHERE from_user_id = $1 OR to_user_id = $1
        )
        SELECT * FROM ranked_messages WHERE rn = 1
        ORDER BY "createdAt" DESC`,
        [userId]
      );
      conversations = result.rows;
    } else {
      // SQLite version
      const rows = await db.query(
        `SELECT 
          chatId as id,
          fromUserId as "from",
          toUserId as "to",
          text,
          createdAt,
          CASE 
            WHEN fromUserId = ? THEN toUserId 
            ELSE fromUserId 
          END as partnerId
         FROM chats
         WHERE fromUserId = ? OR toUserId = ?
         GROUP BY partnerId
         HAVING MAX(createdAt)
         ORDER BY createdAt DESC`,
        [userId, userId, userId]
      );
      conversations = rows || [];
    }

    return jsonOk(res, { conversations });
  } catch (err) {
    logger.error('Error fetching conversations:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ========== Region Group Chat Rooms (MVP) ==========
let regionChatSchemaEnsured = false;
const REGION_CHAT_MAX_ROOMS_PER_CREATOR = 3;
const REGION_CHAT_MAX_MEMBERS_PER_ROOM = 100;

async function ensureRegionChatSchema() {
  if (regionChatSchemaEnsured) return;

  if (USE_POSTGRES) {
    await db.run(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        room_id VARCHAR(255) PRIMARY KEY,
        region_id VARCHAR(255) NOT NULL,
        name VARCHAR(120) NOT NULL,
        room_type VARCHAR(20) DEFAULT 'public',
        password_hash VARCHAR(255),
        creator_id VARCHAR(255) NOT NULL,
        creator_name VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS chat_room_members (
        room_id VARCHAR(255) NOT NULL,
        member_id VARCHAR(255) NOT NULL,
        member_name VARCHAR(255),
        role VARCHAR(20) DEFAULT 'member',
        invited_by VARCHAR(255),
        joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (room_id, member_id),
        CONSTRAINT fk_chat_room_members_room FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS chat_room_messages (
        message_id VARCHAR(255) PRIMARY KEY,
        room_id VARCHAR(255) NOT NULL,
        member_id VARCHAR(255) NOT NULL,
        member_name VARCHAR(255),
        message_type VARCHAR(20) DEFAULT 'text',
        image_url TEXT,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_chat_room_messages_room FOREIGN KEY (room_id) REFERENCES chat_rooms(room_id) ON DELETE CASCADE
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_region ON chat_rooms(region_id, created_at DESC)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_chat_room_members_member ON chat_room_members(member_id, joined_at DESC)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room ON chat_room_messages(room_id, created_at DESC)`);
    await db.run(`ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS room_type VARCHAR(20) DEFAULT 'public'`);
    await db.run(`ALTER TABLE chat_rooms ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255)`);
    await db.run(`ALTER TABLE chat_room_messages ADD COLUMN IF NOT EXISTS message_type VARCHAR(20) DEFAULT 'text'`);
    await db.run(`ALTER TABLE chat_room_messages ADD COLUMN IF NOT EXISTS image_url TEXT`);
  } else {
    await db.run(`
      CREATE TABLE IF NOT EXISTS chat_rooms (
        roomId TEXT PRIMARY KEY,
        regionId TEXT NOT NULL,
        name TEXT NOT NULL,
        roomType TEXT DEFAULT 'public',
        passwordHash TEXT,
        creatorId TEXT NOT NULL,
        creatorName TEXT,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS chat_room_members (
        roomId TEXT NOT NULL,
        memberId TEXT NOT NULL,
        memberName TEXT,
        role TEXT DEFAULT 'member',
        invitedBy TEXT,
        joinedAt TEXT DEFAULT (datetime('now')),
        PRIMARY KEY (roomId, memberId)
      )
    `);
    await db.run(`
      CREATE TABLE IF NOT EXISTS chat_room_messages (
        messageId TEXT PRIMARY KEY,
        roomId TEXT NOT NULL,
        memberId TEXT NOT NULL,
        memberName TEXT,
        messageType TEXT DEFAULT 'text',
        imageUrl TEXT,
        text TEXT NOT NULL,
        createdAt TEXT DEFAULT (datetime('now'))
      )
    `);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_chat_rooms_region ON chat_rooms(regionId, createdAt DESC)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_chat_room_members_member ON chat_room_members(memberId, joinedAt DESC)`);
    await db.run(`CREATE INDEX IF NOT EXISTS idx_chat_room_messages_room ON chat_room_messages(roomId, createdAt DESC)`);
    try { await db.run(`ALTER TABLE chat_rooms ADD COLUMN roomType TEXT DEFAULT 'public'`); } catch (e) {}
    try { await db.run(`ALTER TABLE chat_rooms ADD COLUMN passwordHash TEXT`); } catch (e) {}
    try { await db.run(`ALTER TABLE chat_room_messages ADD COLUMN messageType TEXT DEFAULT 'text'`); } catch (e) {}
    try { await db.run(`ALTER TABLE chat_room_messages ADD COLUMN imageUrl TEXT`); } catch (e) {}
  }

  regionChatSchemaEnsured = true;
}

async function getMemberNameById(memberId) {
  if (!memberId) return '';
  const normalized = String(memberId || '').trim();
  let row = null;

  if (USE_POSTGRES) {
    const numericId = Number(normalized);
    if (Number.isInteger(numericId) && numericId > 0) {
      row = await db.get('SELECT name FROM members WHERE member_id = $1', [numericId]);
    }
    if (!row) {
      row = await db.get('SELECT name FROM members WHERE CAST(member_id AS TEXT) = $1', [normalized]);
    }
  } else {
    row = await db.get('SELECT name FROM members WHERE memberId = ?', [normalized]);
  }

  return String(row?.name || '').trim();
}

async function getMemberRegionIdById(memberId) {
  if (!memberId) return '';
  const normalized = String(memberId || '').trim();
  let row = null;

  if (USE_POSTGRES) {
    const numericId = Number(normalized);
    if (Number.isInteger(numericId) && numericId > 0) {
      row = await db.get('SELECT region_id FROM members WHERE member_id = $1', [numericId]);
    }
    if (!row) {
      row = await db.get('SELECT region_id FROM members WHERE CAST(member_id AS TEXT) = $1', [normalized]);
    }
  } else {
    row = await db.get('SELECT regionId FROM members WHERE memberId = ?', [normalized]);
  }

  return String(row?.region_id || row?.regionId || '').trim();
}

async function getChatRoomById(roomId) {
  if (!roomId) return null;
  const row = USE_POSTGRES
    ? await db.get('SELECT room_id, region_id, name, room_type, password_hash, creator_id, creator_name, created_at FROM chat_rooms WHERE room_id = $1', [String(roomId)])
    : await db.get('SELECT roomId, regionId, name, roomType, passwordHash, creatorId, creatorName, createdAt FROM chat_rooms WHERE roomId = ?', [String(roomId)]);
  if (!row) return null;
  return {
    roomId: String(row.room_id || row.roomId),
    regionId: String(row.region_id || row.regionId || ''),
    name: row.name,
    roomType: String(row.room_type || row.roomType || 'public').toLowerCase() === 'private' ? 'private' : 'public',
    passwordHash: row.password_hash || row.passwordHash || null,
    creatorId: String(row.creator_id || row.creatorId || ''),
    creatorName: row.creator_name || row.creatorName || '',
    createdAt: row.created_at || row.createdAt,
  };
}

async function getChatRoomMemberCount(roomId) {
  if (!roomId) return 0;
  const row = USE_POSTGRES
    ? await db.get('SELECT COUNT(*) AS count FROM chat_room_members WHERE room_id = $1', [String(roomId)])
    : await db.get('SELECT COUNT(*) AS count FROM chat_room_members WHERE roomId = ?', [String(roomId)]);
  return Number(row?.count || 0);
}

async function assertRoomMember(roomId, memberId) {
  const row = USE_POSTGRES
    ? await db.get('SELECT 1 FROM chat_room_members WHERE room_id = $1 AND member_id = $2', [String(roomId), String(memberId)])
    : await db.get('SELECT 1 FROM chat_room_members WHERE roomId = ? AND memberId = ?', [String(roomId), String(memberId)]);
  if (!row) {
    const error = new Error('채팅방 접근 권한이 없습니다.');
    error.statusCode = 403;
    throw error;
  }
}

// GET /api/chat-rooms?regionId=...
app.get('/api/chat-rooms', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const regionId = String(req.query.regionId || '').trim();
    if (!regionId) return res.status(400).json({ error: 'regionId required' });

    let rows;
    if (USE_POSTGRES) {
      rows = await db.query(
        `SELECT r.room_id, r.region_id, r.name, r.creator_id, r.creator_name, r.created_at,
                (SELECT COUNT(*) FROM chat_room_members m WHERE m.room_id = r.room_id) AS member_count,
                (SELECT msg.text FROM chat_room_messages msg WHERE msg.room_id = r.room_id ORDER BY msg.created_at DESC LIMIT 1) AS last_message,
                (SELECT msg.created_at FROM chat_room_messages msg WHERE msg.room_id = r.room_id ORDER BY msg.created_at DESC LIMIT 1) AS last_message_at
           FROM chat_rooms r
           JOIN chat_room_members me ON me.room_id = r.room_id AND me.member_id = $1
          WHERE r.region_id = $2
          ORDER BY COALESCE((SELECT msg.created_at FROM chat_room_messages msg WHERE msg.room_id = r.room_id ORDER BY msg.created_at DESC LIMIT 1), r.created_at) DESC`,
        [req.authMemberId, regionId]
      );
    } else {
      rows = await db.query(
        `SELECT r.roomId, r.regionId, r.name, r.creatorId, r.creatorName, r.createdAt,
                (SELECT COUNT(*) FROM chat_room_members m WHERE m.roomId = r.roomId) AS memberCount,
                (SELECT msg.text FROM chat_room_messages msg WHERE msg.roomId = r.roomId ORDER BY msg.createdAt DESC LIMIT 1) AS lastMessage,
                (SELECT msg.createdAt FROM chat_room_messages msg WHERE msg.roomId = r.roomId ORDER BY msg.createdAt DESC LIMIT 1) AS lastMessageAt
           FROM chat_rooms r
           JOIN chat_room_members me ON me.roomId = r.roomId AND me.memberId = ?
          WHERE r.regionId = ?
          ORDER BY COALESCE((SELECT msg.createdAt FROM chat_room_messages msg WHERE msg.roomId = r.roomId ORDER BY msg.createdAt DESC LIMIT 1), r.createdAt) DESC`,
        [req.authMemberId, regionId]
      );
    }

    const rooms = (rows || []).map((row) => ({
      roomId: String(row.room_id || row.roomId),
      regionId: row.region_id || row.regionId,
      name: row.name,
      roomType: String(row.room_type || row.roomType || 'public').toLowerCase() === 'private' ? 'private' : 'public',
      creatorId: String(row.creator_id || row.creatorId || ''),
      creatorName: row.creator_name || row.creatorName || '회원',
      memberCount: Number(row.member_count || row.memberCount || 1),
      lastMessage: row.last_message || row.lastMessage || '',
      lastMessageAt: row.last_message_at || row.lastMessageAt || row.created_at || row.createdAt,
      createdAt: row.created_at || row.createdAt,
    }));

    return res.json({ ok: true, rooms });
  } catch (err) {
    logger.error('Error fetching chat rooms:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/chat-rooms
app.post('/api/chat-rooms', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const regionId = String(req.body?.regionId || '').trim();
    const name = String(req.body?.name || '').trim();
    const roomTypeRaw = String(req.body?.roomType || 'public').trim().toLowerCase();
    const roomType = roomTypeRaw === 'private' ? 'private' : 'public';
    const password = String(req.body?.password || '').trim();
    const inviteeIdsRaw = Array.isArray(req.body?.inviteeIds) ? req.body.inviteeIds : [];
    if (!regionId) return res.status(400).json({ error: 'regionId required' });
    if (!name) return res.status(400).json({ error: 'name required' });
    if (roomType === 'private' && password.length < 4) {
      return res.status(400).json({ error: '비밀 채팅방 비밀번호는 4자 이상이어야 합니다.' });
    }

    const creatorId = String(req.authMemberId || '').trim();
    const creatorName = await getMemberNameById(creatorId) || '회원';
    const creatorRegionId = await getMemberRegionIdById(creatorId);
    if (!creatorRegionId || creatorRegionId !== regionId) {
      return res.status(403).json({ error: '해당 지역 회원만 채팅방을 개설할 수 있습니다.' });
    }

    const createdCountRow = USE_POSTGRES
      ? await db.get('SELECT COUNT(*) AS count FROM chat_rooms WHERE creator_id = $1 AND region_id = $2', [creatorId, regionId])
      : await db.get('SELECT COUNT(*) AS count FROM chat_rooms WHERE creatorId = ? AND regionId = ?', [creatorId, regionId]);
    const createdCount = Number(createdCountRow?.count || 0);
    if (createdCount >= REGION_CHAT_MAX_ROOMS_PER_CREATOR) {
      return res.status(400).json({ error: `채팅방은 1인당 최대 ${REGION_CHAT_MAX_ROOMS_PER_CREATOR}개까지 만들 수 있습니다.` });
    }

    const roomId = `room_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const passwordHash = roomType === 'private' ? await bcrypt.hash(password, 10) : null;

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO chat_rooms (room_id, region_id, name, room_type, password_hash, creator_id, creator_name)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [roomId, regionId, name, roomType, passwordHash, creatorId, creatorName]
      );
      await db.run(
        `INSERT INTO chat_room_members (room_id, member_id, member_name, role)
         VALUES ($1, $2, $3, 'owner')
         ON CONFLICT (room_id, member_id) DO NOTHING`,
        [roomId, creatorId, creatorName]
      );
    } else {
      await db.run(
        `INSERT INTO chat_rooms (roomId, regionId, name, roomType, passwordHash, creatorId, creatorName)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [roomId, regionId, name, roomType, passwordHash, creatorId, creatorName]
      );
      await db.run(
        `INSERT OR IGNORE INTO chat_room_members (roomId, memberId, memberName, role)
         VALUES (?, ?, ?, 'owner')`,
        [roomId, creatorId, creatorName]
      );
    }

    const inviteeIds = Array.from(new Set(inviteeIdsRaw.map((value) => String(value || '').trim()).filter(Boolean)))
      .filter((id) => id !== creatorId)
      .slice(0, 100);

    let currentMemberCount = 1;

    for (const inviteeId of inviteeIds) {
      if (currentMemberCount >= REGION_CHAT_MAX_MEMBERS_PER_ROOM) break;
      const inviteeRegionId = await getMemberRegionIdById(inviteeId);
      if (!inviteeRegionId || inviteeRegionId !== regionId) continue;
      const inviteeName = await getMemberNameById(inviteeId);
      if (USE_POSTGRES) {
        await db.run(
          `INSERT INTO chat_room_members (room_id, member_id, member_name, role, invited_by)
           VALUES ($1, $2, $3, 'member', $4)
           ON CONFLICT (room_id, member_id) DO NOTHING`,
          [roomId, inviteeId, inviteeName || null, creatorId]
        );
      } else {
        await db.run(
          `INSERT OR IGNORE INTO chat_room_members (roomId, memberId, memberName, role, invitedBy)
           VALUES (?, ?, ?, 'member', ?)`,
          [roomId, inviteeId, inviteeName || null, creatorId]
        );
      }
      currentMemberCount += 1;
    }

    return res.status(201).json({ ok: true, roomId });
  } catch (err) {
    logger.error('Error creating chat room:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/chat-rooms/:roomId/verify-password
app.post('/api/chat-rooms/:roomId/verify-password', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const roomId = String(req.params.roomId || '').trim();
    const password = String(req.body?.password || '').trim();
    if (!roomId) return res.status(400).json({ error: 'roomId required' });

    const room = await getChatRoomById(roomId);
    if (!room) return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });
    await assertRoomMember(roomId, req.authMemberId);

    if (room.roomType !== 'private') return res.json({ ok: true, verified: true });
    if (!password) return res.status(400).json({ error: '비밀번호를 입력해 주세요.' });

    const ok = room.passwordHash ? await bcrypt.compare(password, room.passwordHash) : false;
    if (!ok) return res.status(403).json({ error: '비밀번호가 일치하지 않습니다.' });
    return res.json({ ok: true, verified: true });
  } catch (err) {
    logger.error('Error verifying chat room password:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/chat-rooms/:roomId/invite
app.post('/api/chat-rooms/:roomId/invite', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const roomId = String(req.params.roomId || '').trim();
    const inviterId = String(req.authMemberId || '').trim();
    const memberIds = Array.isArray(req.body?.memberIds) ? req.body.memberIds : [];
    if (!roomId) return res.status(400).json({ error: 'roomId required' });

    const room = await getChatRoomById(roomId);
    if (!room) return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });

    const roleRow = USE_POSTGRES
      ? await db.get(`SELECT role FROM chat_room_members WHERE room_id = $1 AND member_id = $2`, [roomId, inviterId])
      : await db.get(`SELECT role FROM chat_room_members WHERE roomId = ? AND memberId = ?`, [roomId, inviterId]);
    const role = String(roleRow?.role || '').toLowerCase();
    if (role !== 'owner') return res.status(403).json({ error: '초대 권한이 없습니다.' });

    const cleanIds = Array.from(new Set(memberIds.map((value) => String(value || '').trim()).filter(Boolean)))
      .filter((id) => id !== inviterId)
      .slice(0, 100);

    let currentMemberCount = await getChatRoomMemberCount(roomId);
    if (currentMemberCount >= REGION_CHAT_MAX_MEMBERS_PER_ROOM) {
      return res.status(400).json({ error: `채팅방 최대 인원(${REGION_CHAT_MAX_MEMBERS_PER_ROOM}명)에 도달했습니다.` });
    }

    let invitedCount = 0;

    for (const memberId of cleanIds) {
      if (currentMemberCount >= REGION_CHAT_MAX_MEMBERS_PER_ROOM) break;
      const memberRegionId = await getMemberRegionIdById(memberId);
      if (!memberRegionId || memberRegionId !== room.regionId) continue;
      const memberName = await getMemberNameById(memberId);
      if (USE_POSTGRES) {
        await db.run(
          `INSERT INTO chat_room_members (room_id, member_id, member_name, role, invited_by)
           VALUES ($1, $2, $3, 'member', $4)
           ON CONFLICT (room_id, member_id) DO NOTHING`,
          [roomId, memberId, memberName || null, inviterId]
        );
      } else {
        await db.run(
          `INSERT OR IGNORE INTO chat_room_members (roomId, memberId, memberName, role, invitedBy)
           VALUES (?, ?, ?, 'member', ?)`,
          [roomId, memberId, memberName || null, inviterId]
        );
      }
      invitedCount += 1;
      currentMemberCount += 1;
    }

    return res.json({ ok: true, invitedCount, maxMembers: REGION_CHAT_MAX_MEMBERS_PER_ROOM });
  } catch (err) {
    logger.error('Error inviting chat room members:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// GET /api/chat-rooms/:roomId/messages?limit=120
app.get('/api/chat-rooms/:roomId/messages', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const roomId = String(req.params.roomId || '').trim();
    if (!roomId) return res.status(400).json({ error: 'roomId required' });
    await assertRoomMember(roomId, req.authMemberId);

    const rawLimit = Number(req.query.limit || 120);
    const limit = Math.max(1, Math.min(300, Number.isFinite(rawLimit) ? rawLimit : 120));

    let rows;
    if (USE_POSTGRES) {
      rows = await db.query(
        `SELECT message_id, room_id, member_id, member_name, message_type, image_url, text, created_at
           FROM (
             SELECT message_id, room_id, member_id, member_name, message_type, image_url, text, created_at
               FROM chat_room_messages
              WHERE room_id = $1
              ORDER BY created_at DESC
              LIMIT $2
           ) q
          ORDER BY created_at ASC`,
        [roomId, limit]
      );
    } else {
      rows = await db.query(
        `SELECT messageId, roomId, memberId, memberName, messageType, imageUrl, text, createdAt
           FROM (
             SELECT messageId, roomId, memberId, memberName, messageType, imageUrl, text, createdAt
               FROM chat_room_messages
              WHERE roomId = ?
              ORDER BY createdAt DESC
              LIMIT ?
           ) q
          ORDER BY createdAt ASC`,
        [roomId, limit]
      );
    }

    const messages = (rows || []).map((row) => ({
      messageId: String(row.message_id || row.messageId),
      roomId: String(row.room_id || row.roomId),
      memberId: String(row.member_id || row.memberId || ''),
      memberName: row.member_name || row.memberName || '회원',
      messageType: String(row.message_type || row.messageType || 'text').toLowerCase() === 'image' ? 'image' : 'text',
      imageUrl: row.image_url || row.imageUrl || '',
      text: row.text,
      createdAt: row.created_at || row.createdAt,
    }));
    return res.json({ ok: true, messages });
  } catch (err) {
    logger.error('Error fetching chat room messages:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// POST /api/chat-rooms/:roomId/messages
app.post('/api/chat-rooms/:roomId/messages', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const roomId = String(req.params.roomId || '').trim();
    const rawText = String(req.body?.text || '').trim();
    const messageType = String(req.body?.messageType || 'text').trim().toLowerCase() === 'image' ? 'image' : 'text';
    const imageUrl = String(req.body?.imageUrl || '').trim();
    const text = messageType === 'image' ? (rawText || '[image]') : rawText;
    if (!roomId) return res.status(400).json({ error: 'roomId required' });
    if (messageType === 'image' && !imageUrl) return res.status(400).json({ error: 'imageUrl required' });
    if (messageType === 'text' && !text) return res.status(400).json({ error: 'text required' });
    if (imageUrl && !imageUrl.startsWith('/uploads/')) return res.status(400).json({ error: '유효하지 않은 이미지 경로입니다.' });
    if (text.length > 2000) return res.status(400).json({ error: '메시지는 2000자 이하로 입력해 주세요.' });

    await assertRoomMember(roomId, req.authMemberId);
    const memberName = String(req.authMemberName || '').trim() || '회원';
    const messageId = `crm_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    let savedRow = null;

    if (USE_POSTGRES) {
      savedRow = await db.get(
        `INSERT INTO chat_room_messages (message_id, room_id, member_id, member_name, message_type, image_url, text)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING message_id, room_id, member_id, member_name, message_type, image_url, text, created_at`,
        [messageId, roomId, req.authMemberId, memberName, messageType, imageUrl || null, text]
      );
    } else {
      await db.run(
        `INSERT INTO chat_room_messages (messageId, roomId, memberId, memberName, messageType, imageUrl, text)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [messageId, roomId, req.authMemberId, memberName, messageType, imageUrl || null, text]
      );
      savedRow = {
        messageId,
        roomId,
        memberId: String(req.authMemberId),
        memberName,
        messageType,
        imageUrl: imageUrl || '',
        text,
        createdAt: new Date().toISOString(),
      };
    }

    const message = {
      messageId: String(savedRow?.message_id || savedRow?.messageId || messageId),
      roomId: String(savedRow?.room_id || savedRow?.roomId || roomId),
      memberId: String(savedRow?.member_id || savedRow?.memberId || req.authMemberId || ''),
      memberName: savedRow?.member_name || savedRow?.memberName || memberName,
      messageType: String(savedRow?.message_type || savedRow?.messageType || messageType).toLowerCase() === 'image' ? 'image' : 'text',
      imageUrl: savedRow?.image_url || savedRow?.imageUrl || '',
      text: savedRow?.text || text,
      createdAt: savedRow?.created_at || savedRow?.createdAt || new Date().toISOString(),
    };

    return res.status(201).json({ ok: true, messageId: message.messageId, message });
  } catch (err) {
    logger.error('Error sending chat room message:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// DELETE /api/chat-rooms/:roomId/leave
app.delete('/api/chat-rooms/:roomId/leave', requireAuth, async (req, res) => {
  try {
    await ensureRegionChatSchema();
    const roomId = String(req.params.roomId || '').trim();
    const memberId = String(req.authMemberId || '').trim();
    if (!roomId) return res.status(400).json({ error: 'roomId required' });

    await assertRoomMember(roomId, memberId);
    const room = await getChatRoomById(roomId);
    if (!room) return res.status(404).json({ error: '채팅방을 찾을 수 없습니다.' });

    if (USE_POSTGRES) {
      await db.run(`DELETE FROM chat_room_members WHERE room_id = $1 AND member_id = $2`, [roomId, memberId]);
    } else {
      await db.run(`DELETE FROM chat_room_members WHERE roomId = ? AND memberId = ?`, [roomId, memberId]);
    }

    const remainingCount = await getChatRoomMemberCount(roomId);
    if (remainingCount <= 0) {
      if (USE_POSTGRES) {
        await db.run(`DELETE FROM chat_rooms WHERE room_id = $1`, [roomId]);
      } else {
        await db.run(`DELETE FROM chat_rooms WHERE roomId = ?`, [roomId]);
      }
      return res.json({ ok: true, left: true, deleted: true });
    }

    if (room.creatorId === memberId) {
      let nextOwner;
      if (USE_POSTGRES) {
        nextOwner = await db.get(
          `SELECT member_id FROM chat_room_members WHERE room_id = $1 ORDER BY joined_at ASC LIMIT 1`,
          [roomId]
        );
        if (nextOwner?.member_id) {
          await db.run(`UPDATE chat_room_members SET role = 'owner' WHERE room_id = $1 AND member_id = $2`, [roomId, String(nextOwner.member_id)]);
          await db.run(`UPDATE chat_rooms SET creator_id = $1, creator_name = $2 WHERE room_id = $3`, [String(nextOwner.member_id), await getMemberNameById(String(nextOwner.member_id)), roomId]);
        }
      } else {
        nextOwner = await db.get(
          `SELECT memberId FROM chat_room_members WHERE roomId = ? ORDER BY joinedAt ASC LIMIT 1`,
          [roomId]
        );
        if (nextOwner?.memberId) {
          await db.run(`UPDATE chat_room_members SET role = 'owner' WHERE roomId = ? AND memberId = ?`, [roomId, String(nextOwner.memberId)]);
          await db.run(`UPDATE chat_rooms SET creatorId = ?, creatorName = ? WHERE roomId = ?`, [String(nextOwner.memberId), await getMemberNameById(String(nextOwner.memberId)), roomId]);
        }
      }
    }

    return res.json({ ok: true, left: true });
  } catch (err) {
    logger.error('Error leaving chat room:', err);
    return res.status(err.statusCode || 500).json({ error: err.message });
  }
});

// ========== Friends Routes ==========

// Get friends list for a user
app.get('/api/friends/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    let friends = [];
    if (USE_POSTGRES) {
      const rows = await db.query(
        `SELECT friend_id as "friendId" FROM friends WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      );
      friends = (rows || []).map(r => r.friendId);
    } else {
      const rows = await db.query(
        `SELECT friendId FROM friends WHERE userId = ? ORDER BY createdAt DESC`,
        [userId]
      );
      friends = (rows || []).map(r => r.friendId);
    }

    return jsonOk(res, { friends });
  } catch (err) {
    logger.error('Error fetching friends:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Add a friend
app.post('/api/friends', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    
    if (!userId || !friendId) {
      return jsonFail(res, 400, 'userId and friendId are required');
    }

    const now = new Date().toISOString();

    try {
      if (USE_POSTGRES) {
        await db.run(
          `INSERT INTO friends (user_id, friend_id, created_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (user_id, friend_id) DO NOTHING`,
          [userId, friendId]
        );
      } else {
        await db.run(
          `INSERT OR IGNORE INTO friends (userId, friendId, createdAt)
           VALUES (?, ?, ?)`,
          [userId, friendId, now]
        );
      }
    } catch (e) {
      // Ignore unique constraint errors
      if (!e.message.includes('UNIQUE') && !e.message.includes('duplicate')) {
        throw e;
      }
    }

    // Get updated friends list
    let friends = [];
    if (USE_POSTGRES) {
      const rows = await db.query(
        `SELECT friend_id as "friendId" FROM friends WHERE user_id = $1`,
        [userId]
      );
      friends = (rows || []).map(r => r.friendId);
    } else {
      const rows = await db.all(
        `SELECT friendId FROM friends WHERE userId = ?`,
        [userId]
      );
      friends = (rows || []).map(r => r.friendId);
    }

    return jsonOk(res, { friends });
  } catch (err) {
    logger.error('Error adding friend:', err);
    return jsonFail(res, 500, err.message);
  }
});

// Remove a friend
app.delete('/api/friends', async (req, res) => {
  try {
    const { userId, friendId } = req.body;
    
    if (!userId || !friendId) {
      return jsonFail(res, 400, 'userId and friendId are required');
    }

    if (USE_POSTGRES) {
      await db.run(
        `DELETE FROM friends WHERE user_id = $1 AND friend_id = $2`,
        [userId, friendId]
      );
    } else {
      await db.run(
        `DELETE FROM friends WHERE userId = ? AND friendId = ?`,
        [userId, friendId]
      );
    }

    // Get updated friends list
    let friends = [];
    if (USE_POSTGRES) {
      const rows = await db.query(
        `SELECT friend_id as "friendId" FROM friends WHERE user_id = $1`,
        [userId]
      );
      friends = (rows || []).map(r => r.friendId);
    } else {
      const rows = await db.all(
        `SELECT friendId FROM friends WHERE userId = ?`,
        [userId]
      );
      friends = (rows || []).map(r => r.friendId);
    }

    return jsonOk(res, { friends });
  } catch (err) {
    logger.error('Error removing friend:', err);
    return jsonFail(res, 500, err.message);
  }
});

// ============================================
// Supply Support API
// ============================================

// POST /api/supply-items - 보급지원 물품 등록 (담당자만 가능)
app.post('/api/supply-items', async (req, res) => {
  try {
    const { name, description, quantity, managerId } = req.body;
    
    if (!name || !managerId) {
      return res.status(400).json({ error: 'name and managerId are required' });
    }
    
    // Verify manager has supplyManager permission
    const managerQuery = USE_POSTGRES
      ? 'SELECT supply_manager FROM members WHERE member_id = $1'
      : 'SELECT supplyManager FROM members WHERE memberId = ?';
    const manager = await db.get(managerQuery, [managerId]);
    
    if (!manager || !(manager.supply_manager || manager.supplyManager)) {
      return res.status(403).json({ error: 'Only supply managers can create items' });
    }
    
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      const query = `
        INSERT INTO supply_items (name, description, quantity, manager_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING item_id, name, description, quantity, manager_id, status, created_at, updated_at
      `;
      const params = [name, description || '', parseInt(quantity) || 0, managerId, now, now];
      const row = await db.get(query, params);
      const result = { ok: true, success: true, item: row };
      logForensicWrite({ route: '/api/supply-items', method: 'POST', body: req.body || {}, sql: query, params, dbResult: null, result });
      res.json(result);
    } else {
      const query = `
        INSERT INTO supply_items (name, description, quantity, managerId, status, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, 'available', ?, ?)
      `;
      const params = [name, description || '', parseInt(quantity) || 0, managerId, now, now];
      const dbResult = await db.run(query, params);
      const itemId = dbResult && dbResult.lastID ? dbResult.lastID : null;
      const item = itemId ? await db.get('SELECT * FROM supply_items WHERE itemId = ?', [itemId]) : null;
      const result = { ok: true, success: true, item };
      logForensicWrite({ route: '/api/supply-items', method: 'POST', body: req.body || {}, sql: query, params, dbResult, result });
      res.json(result);
    }
  } catch (err) {
    logger.error('Error creating supply item:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supply-items - 보급지원 물품 목록 조회
app.get('/api/supply-items', async (req, res) => {
  try {
    const { managerId } = req.query;
    
    let query, params;
    if (USE_POSTGRES) {
      if (managerId) {
        query = 'SELECT * FROM supply_items WHERE manager_id = $1 ORDER BY created_at DESC';
        params = [managerId];
      } else {
        query = 'SELECT * FROM supply_items ORDER BY created_at DESC';
        params = [];
      }
    } else {
      if (managerId) {
        query = 'SELECT * FROM supply_items WHERE managerId = ? ORDER BY createdAt DESC';
        params = [managerId];
      } else {
        query = 'SELECT * FROM supply_items ORDER BY createdAt DESC';
        params = [];
      }
    }
    
    const rows = await db.all(query, params);
    res.json({ ok: true, success: true, items: rows || [] });
  } catch (err) {
    logger.error('Error fetching supply items:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/supply-items/:id - 보급지원 물품 수정
app.patch('/api/supply-items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const updates = req.body || {};
    
    const sets = [];
    const params = [];
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      let idx = 1;
      if (updates.name !== undefined) { sets.push(`name=$${idx++}`); params.push(updates.name); }
      if (updates.description !== undefined) { sets.push(`description=$${idx++}`); params.push(updates.description); }
      if (updates.quantity !== undefined) { sets.push(`quantity=$${idx++}`); params.push(parseInt(updates.quantity)); }
      if (updates.status !== undefined) { sets.push(`status=$${idx++}`); params.push(updates.status); }
      
      if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
      
      sets.push(`updated_at=$${idx++}`);
      params.push(now);
      params.push(id);
      
      const query = `UPDATE supply_items SET ${sets.join(', ')} WHERE item_id = $${idx} RETURNING *`;
      const row = await db.get(query, params);
      const result = { ok: true, success: true, item: row };
      logForensicWrite({ route: `/api/supply-items/${id}`, method: 'PATCH', body: updates, sql: query, params, dbResult: null, result });
      res.json(result);
    } else {
      if (updates.name !== undefined) { sets.push('name = ?'); params.push(updates.name); }
      if (updates.description !== undefined) { sets.push('description = ?'); params.push(updates.description); }
      if (updates.quantity !== undefined) { sets.push('quantity = ?'); params.push(parseInt(updates.quantity)); }
      if (updates.status !== undefined) { sets.push('status = ?'); params.push(updates.status); }
      
      if (sets.length === 0) return res.status(400).json({ error: 'no fields to update' });
      
      sets.push('updatedAt = ?');
      params.push(now);
      params.push(id);
      
      const query = `UPDATE supply_items SET ${sets.join(', ')} WHERE itemId = ?`;
      const dbResult = await db.run(query, params);
      const item = await db.get('SELECT * FROM supply_items WHERE itemId = ?', [id]);
      const result = { ok: true, success: true, item };
      logForensicWrite({ route: `/api/supply-items/${id}`, method: 'PATCH', body: updates, sql: query, params, dbResult, result });
      res.json(result);
    }
  } catch (err) {
    logger.error('Error updating supply item:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/supply-items/:id - 보급지원 물품 삭제
app.delete('/api/supply-items/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (USE_POSTGRES) {
      await db.run(`DELETE FROM supply_items WHERE item_id = $1`, [id]);
    } else {
      await db.run(`DELETE FROM supply_items WHERE itemId = ?`, [id]);
    }
    res.json({ ok: true, success: true });
  } catch (err) {
    logger.error('Error deleting supply item:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/supply-requests - 보급지원 신청
app.post('/api/supply-requests', async (req, res) => {
  try {
    const body = req.body || {};
    const supplyIdRaw = body.supplyItemId ?? body.supplyId;
    const requesterIdRaw = body.requesterId ?? body.requester_id ?? null;
    const quantityRaw = body.quantity;
    const messageRaw = body.message;
    const requesterNameRaw = body.requesterName;
    const requesterContactRaw = body.requesterContact;
    const requestTypeRaw = body.requestType;
    const orderStatusRaw = body.orderStatus;
    const receiveMethodRaw = body.receiveMethod;
    const paymentReferenceIdRaw = body.paymentReferenceId;
    const paymentAmountRaw = body.paymentAmount;

    // ★ FIX Issue #3: supplyId is TEXT, not NUMBER
    const supplyItemId = String(supplyIdRaw || '').trim();
    if (!supplyItemId) {
      return res.status(400).json({ error: 'invalid supplyId', details: { supplyId: supplyIdRaw } });
    }

    // ★ 신청예정/품절/재고: supplies 테이블에서 status·quantity 확인 (파싱 후 검증)
    let supplyTitle = null;
    let managerName = null;
    const requesterId = (requesterIdRaw === null || requesterIdRaw === undefined) ? '' : String(requesterIdRaw).trim();
    if (!requesterId) {
      return res.status(400).json({ error: 'requesterId required' });
    }
    const quantity = (quantityRaw === undefined || quantityRaw === null || quantityRaw === '') ? 1 : Number(quantityRaw);
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return res.status(400).json({ error: 'invalid quantity', details: { quantity: quantityRaw } });
    }
    const requesterName = requesterNameRaw ? String(requesterNameRaw).trim() : null;
    const requesterContact = requesterContactRaw ? String(requesterContactRaw).trim() : null;
    const message = messageRaw ? String(messageRaw).trim() : null;
    const requestType = String(requestTypeRaw || 'supply').trim().toLowerCase() === 'distribution' ? 'distribution' : 'supply';

    try {
      const supplyRow = USE_POSTGRES
        ? await db.get('SELECT status, title, quantity, created_by FROM supplies WHERE supply_id = $1', [supplyItemId])
        : await db.get('SELECT status, title, quantity, createdBy FROM supplies WHERE supplyId = ?', [supplyItemId]);
      if (!supplyRow) {
        return res.status(404).json({ error: '상품을 찾을 수 없습니다.' });
      }
      const supplyStatus = String(supplyRow.status || '').toLowerCase();
      if (supplyStatus === 'scheduled') {
        return res.status(403).json({ error: '신청예정 상태입니다. 아직 신청을 받지 않습니다.' });
      }
      if (['soldout', 'hidden', 'deleted'].includes(supplyStatus)) {
        return res.status(403).json({ error: '품절 또는 판매 중지된 상품입니다.' });
      }
      const stockQty = Math.max(0, Math.trunc(Number(supplyRow.quantity ?? 0)));
      if (stockQty <= 0) {
        return res.status(403).json({ error: '재고가 없는 상품입니다.' });
      }
      if (requestType === 'distribution' && quantity > stockQty) {
        return res.status(400).json({ error: `재고(${stockQty}개)보다 많은 수량을 주문할 수 없습니다.` });
      }
      supplyTitle = supplyRow.title || null;
      const managerId = supplyRow.created_by || supplyRow.createdBy;
      if (managerId) {
        const managerRow = USE_POSTGRES
          ? await db.get('SELECT name FROM members WHERE member_id = $1', [managerId])
          : await db.get('SELECT name FROM members WHERE memberId = ?', [managerId]);
        managerName = managerRow?.name || String(managerId);
      }
    } catch (_) { /* 조회 실패 시 차단하지 않고 통과 */ }
    const receiveMethod = receiveMethodRaw ? String(receiveMethodRaw).trim().toLowerCase() : null;
    const paymentReferenceId = paymentReferenceIdRaw ? String(paymentReferenceIdRaw).trim() : null;
    const paymentAmount = Math.max(0, Math.trunc(Number(paymentAmountRaw || 0)));
    const defaultOrderStatus = orderStatusRaw
      ? String(orderStatusRaw).trim().toUpperCase()
      : (requestType === 'distribution' ? 'ORDERED' : null);

    const isPaidDistributionOrder = requestType === 'distribution' && paymentAmount > 0;

    if (isPaidDistributionOrder) {
      const token = getAuthToken(req);
      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: 로그인이 필요합니다.' });
      }
      const session = USE_POSTGRES
        ? await db.get('SELECT s.member_id FROM sessions s WHERE s.session_id = $1 AND s.status = $2', [token, 'ACTIVE'])
        : await db.get('SELECT s.memberId FROM sessions s WHERE s.sessionId = ? AND s.status = ?', [token, 'ACTIVE']);
      const authMemberId = String(session?.member_id || session?.memberId || '').trim();
      if (!authMemberId) {
        return res.status(401).json({ error: 'Unauthorized: 세션이 만료되었습니다.' });
      }
      if (authMemberId !== requesterId) {
        return res.status(403).json({ error: '본인 계정으로만 유통 주문 결제가 가능합니다.' });
      }
      if (!paymentReferenceId) {
        return res.status(400).json({ error: 'paymentReferenceId required for distribution payment' });
      }

      const duplicateOrder = USE_POSTGRES
        ? await db.get(
            `SELECT request_id FROM supply_requests WHERE payment_reference_id = $1 AND COALESCE(request_type, 'supply') = 'distribution' LIMIT 1`,
            [paymentReferenceId]
          )
        : await db.get(
            `SELECT requestId FROM supply_requests WHERE paymentReferenceId = ? AND COALESCE(requestType, 'supply') = 'distribution' LIMIT 1`,
            [paymentReferenceId]
          );
      if (duplicateOrder) {
        return res.status(409).json({ error: '이미 처리된 유통 주문입니다.' });
      }

      const balanceQuery = USE_POSTGRES
        ? "SELECT COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 0 ELSE amount END), 0) as balance FROM point_ledger WHERE member_id = $1"
        : "SELECT COALESCE(SUM(CASE WHEN status = 'cancelled' THEN 0 ELSE amount END), 0) as balance FROM point_ledger WHERE memberId = ?";
      const balanceRow = await db.get(balanceQuery, [authMemberId]);
      const currentBalance = Number(balanceRow?.balance || 0);
      if (currentBalance < paymentAmount) {
        return res.status(400).json({ error: '포인트 잔액이 부족합니다.', required: paymentAmount, available: currentBalance });
      }
    }

    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      await db.run('BEGIN');
      try {
        if (isPaidDistributionOrder) {
          await db.run(
            `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, status, created_at)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              requesterId,
              -Math.abs(paymentAmount),
              'PAYMENT',
              `유통 상품 ${supplyTitle || supplyItemId} 결제`,
              paymentReferenceId,
              'DISTRIBUTION_ORDER',
              'active',
              now,
            ]
          );
        }

      const query = `
        INSERT INTO supply_requests (
          supply_item_id, requester_id, requester_name, requester_contact, quantity, message,
          item_name, manager_name, request_type, order_status, receive_method, payment_reference_id, payment_amount,
          status, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'PENDING', $14, $15)
        RETURNING *
      `;
      const params = [
        supplyItemId,
        requesterId,
        requesterName,
        requesterContact,
        quantity,
        message,
        supplyTitle,
        managerName,
        requestType,
        defaultOrderStatus,
        receiveMethod,
        paymentReferenceId,
        paymentAmount,
        now,
        now,
      ];
      const row = await db.get(query, params);
      await db.run('COMMIT');
      res.json({ ok: true, success: true, request: row });
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      await db.run('BEGIN');
      try {
        if (isPaidDistributionOrder) {
          await db.run(
            `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, status, createdAt)
             VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              requesterId,
              -Math.abs(paymentAmount),
              'PAYMENT',
              `유통 상품 ${supplyTitle || supplyItemId} 결제`,
              paymentReferenceId,
              'DISTRIBUTION_ORDER',
              'active',
              now,
            ]
          );
        }

      const query = `
        INSERT INTO supply_requests (
          supplyItemId, requesterId, requesterName, requesterContact, quantity, message,
          item_name, manager_name, requestType, orderStatus, receiveMethod, paymentReferenceId, paymentAmount,
          status, createdAt, updatedAt
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
      `;
      const params = [
        supplyItemId,
        requesterId,
        requesterName,
        requesterContact,
        quantity,
        message,
        supplyTitle,
        managerName,
        requestType,
        defaultOrderStatus,
        receiveMethod,
        paymentReferenceId,
        paymentAmount,
        now,
        now,
      ];
      const result = await db.run(query, params);
      const requestId = result && result.lastID ? result.lastID : null;
      const request = requestId
        ? await db.get('SELECT * FROM supply_requests WHERE requestId = ?', [requestId])
        : null;
      await db.run('COMMIT');
      res.json({ ok: true, success: true, request });
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    }
  } catch (err) {
    try {
      console.error('[FORENSIC] [POST /api/supply-requests] sqlite error:', err && (err.message || err));
    } catch (e) {}
    logger.error('Error creating supply request:', err);
    res.status(500).json({ error: err.message, details: err && err.code ? { code: err.code } : undefined });
  }
});

// GET /api/my/supply-requests/managed - 내가 담당하는 보급품 요청 목록 (Issue B-2)
app.get('/api/my/supply-requests/managed', async (req, res) => {
  try {
    const token = getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    
    // 세션에서 memberId 조회
    const session = await db.get(
      USE_POSTGRES
        ? 'SELECT member_id FROM sessions WHERE session_id = $1'
        : 'SELECT memberId FROM sessions WHERE sessionId = ?',
      [token]
    );
    if (!session) return res.status(401).json({ error: 'Invalid session' });
    const managerId = USE_POSTGRES ? session.member_id : session.memberId;
    const requestType = String(req.query?.requestType || 'supply').trim().toLowerCase();
    const safeRequestType = requestType === 'distribution' ? 'distribution' : 'supply';

    let query, params;
    if (USE_POSTGRES) {
      query = `
        SELECT sr.*, s.title as item_name, s.created_by as manager_id,
               s.region_id as supply_region_id,
               r.name as region_name,
               m.name as applicant_name, m.phone as applicant_phone
        FROM supply_requests sr
        JOIN supplies s ON sr.supply_item_id = s.supply_id
        LEFT JOIN regions r ON s.region_id = r.region_id
        LEFT JOIN members m ON sr.requester_id = CAST(m.member_id AS TEXT)
        WHERE s.created_by = $1
          AND COALESCE(sr.request_type, 'supply') = $2
        ORDER BY sr.created_at DESC
      `;
      params = [managerId, safeRequestType];
    } else {
      query = `
        SELECT sr.*, s.title as item_name, s.createdBy as manager_id,
               s.regionId as supply_region_id,
               r.name as region_name,
               m.name as applicant_name, m.phone as applicantPhone
        FROM supply_requests sr
        JOIN supplies s ON sr.supplyItemId = s.supplyId
        LEFT JOIN regions r ON s.regionId = r.regionId
        LEFT JOIN members m ON sr.requesterId = m.memberId
        WHERE s.createdBy = ?
          AND COALESCE(sr.requestType, 'supply') = ?
        ORDER BY sr.createdAt DESC
      `;
      params = [managerId, safeRequestType];
    }

    const rows = await db.all(query, params);
    
    // Normalize logic if needed, but for now sending rows with joined columns
    // Include applicant phone (from joined members) as fallback for requester contact
    const normalized = rows.map(r => USE_POSTGRES ? {
      id: r.request_id,
      supplyItemId: r.supply_item_id,
      requesterId: r.requester_id,
      requesterName: r.applicant_name || r.requesterName || '(이름없음)', // Fallback
      requesterContact: r.requester_contact || r.applicant_phone || null,
      itemName: r.item_name,
      regionId: r.supply_region_id || null,
      regionName: r.region_name || null,
      requestType: r.request_type || 'supply',
      orderStatus: r.order_status || null,
      receiveMethod: r.receive_method || null,
      paymentReferenceId: r.payment_reference_id || null,
      paymentAmount: Number(r.payment_amount || 0),
      status: r.status,
      message: r.message,
      createdAt: r.created_at,
      buyerConfirmedAt: r.buyer_confirmed_at,
      cancelledAt: r.cancelled_at,
      returnRequestedAt: r.return_requested_at,
      returnedAt: r.returned_at,
      completedAt: r.completed_at
    } : {
      id: r.requestId,
      supplyItemId: r.supplyItemId,
      requesterId: r.requesterId,
      requesterName: r.applicant_name || r.requesterName || '(이름없음)', // Fallback
      requesterContact: r.requesterContact || r.applicantPhone || null,
      itemName: r.item_name,
      regionId: r.supply_region_id || null,
      regionName: r.region_name || null,
      requestType: r.requestType || 'supply',
      orderStatus: r.orderStatus || null,
      receiveMethod: r.receiveMethod || null,
      paymentReferenceId: r.paymentReferenceId || null,
      paymentAmount: Number(r.paymentAmount || 0),
      status: r.status,
      message: r.message,
      createdAt: r.createdAt,
      buyerConfirmedAt: r.buyerConfirmedAt,
      cancelledAt: r.cancelledAt,
      returnRequestedAt: r.returnRequestedAt,
      returnedAt: r.returnedAt,
      completedAt: r.completedAt
    });

    res.json({ ok: true, requests: normalized });
  } catch (err) {
    logger.error('Error fetching managed supply requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/supply-requests/:id/complete - 보급지원 신청 완료 처리 (Issue B-2)
// ============================================================
// Distribution Wallet API
// ============================================================

async function getDistWalletSummary(sellerId) {
  const sid = String(sellerId || '').trim();
  const empty = {
    totalEarned: 0,
    totalPending: 0,
    totalPaidOut: 0,
    totalWithdrawn: 0,
    eraWithdrawn: 0,
    available: 0,
    overpaidLegacy: false,
    withdrawals: [],
  };
  if (!sid) return empty;

  // payment_amount=0 인 구 유통 주문 복구 (판매자별)
  try {
    if (USE_POSTGRES) {
      await db.run(`
        UPDATE supply_requests sr
        SET payment_amount = COALESCE(sr.quantity, 1) * COALESCE(s.price, 0)
        FROM supplies s
        WHERE sr.supply_item_id::text = s.supply_id::text
          AND COALESCE(sr.request_type, 'supply') = 'distribution'
          AND COALESCE(sr.payment_amount, 0) = 0
          AND COALESCE(s.price, 0) > 0
          AND (
            s.created_by::text = $1
            OR COALESCE(s.assigned_to::text, '') = $1
            OR COALESCE(s.upload_meta::jsonb->>'sellerId', '') = $1
          )
      `, [sid]);
    } else {
      await db.run(`
        UPDATE supply_requests
        SET paymentAmount = COALESCE(quantity, 1) * COALESCE(
          (SELECT price FROM supplies s WHERE s.supplyId = supply_requests.supplyItemId LIMIT 1), 0
        )
        WHERE COALESCE(requestType, 'supply') = 'distribution'
          AND COALESCE(paymentAmount, 0) = 0
          AND supplyItemId IN (
            SELECT supplyId FROM supplies
            WHERE createdBy = ? OR COALESCE(assignedTo, '') = ?
          )
      `, [sid, sid]);
    }
  } catch (e) {
    logger.warn('[dist wallet] payment_amount repair skipped:', e.message);
  }

  let totalEarned = 0;
  if (USE_POSTGRES) {
    const earnRow = await db.get(`
      SELECT COALESCE(SUM(sr.payment_amount), 0) AS total
      FROM supply_requests sr
      INNER JOIN supplies s ON sr.supply_item_id::text = s.supply_id::text
      WHERE COALESCE(sr.request_type, 'supply') = 'distribution'
        AND COALESCE(sr.payment_amount, 0) > 0
        AND UPPER(COALESCE(sr.order_status, '')) NOT IN ('CANCELLED', 'RETURNED')
        AND (
          s.created_by::text = $1
          OR COALESCE(s.assigned_to::text, '') = $1
          OR COALESCE(s.upload_meta::jsonb->>'sellerId', '') = $1
        )
    `, [sid]);
    totalEarned = Number(earnRow?.total || 0);
  } else {
    const earnRow = await db.get(`
      SELECT COALESCE(SUM(sr.paymentAmount), 0) AS total
      FROM supply_requests sr
      INNER JOIN supplies s ON sr.supplyItemId = s.supplyId
      WHERE COALESCE(sr.requestType, 'supply') = 'distribution'
        AND COALESCE(sr.paymentAmount, 0) > 0
        AND UPPER(COALESCE(sr.orderStatus, '')) NOT IN ('CANCELLED', 'RETURNED')
        AND (s.createdBy = ? OR COALESCE(s.assignedTo, '') = ?)
    `, [sid, sid]);
    totalEarned = Number(earnRow?.total || 0);
  }

  let totalPending = 0;
  let totalPaidOut = 0;
  if (USE_POSTGRES) {
    const pendingRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM dist_payout_requests WHERE seller_id::text = $1 AND status IN ('PENDING', 'APPROVED')`,
      [sid]
    );
    const paidRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM dist_payout_requests WHERE seller_id::text = $1 AND status = 'PAID'`,
      [sid]
    );
    totalPending = Number(pendingRow?.total || 0);
    totalPaidOut = Number(paidRow?.total || 0);
  } else {
    const pendingRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM dist_payout_requests WHERE seller_id = ? AND status IN ('PENDING', 'APPROVED')`,
      [sid]
    );
    const paidRow = await db.get(
      `SELECT COALESCE(SUM(amount), 0) AS total FROM dist_payout_requests WHERE seller_id = ? AND status = 'PAID'`,
      [sid]
    );
    totalPending = Number(pendingRow?.total || 0);
    totalPaidOut = Number(paidRow?.total || 0);
  }

  let withdrawals = [];
  if (USE_POSTGRES) {
    withdrawals = await db.all(
      `SELECT * FROM dist_payout_requests WHERE seller_id::text = $1 ORDER BY requested_at DESC LIMIT 20`,
      [sid]
    );
  } else {
    withdrawals = await db.all(
      `SELECT * FROM dist_payout_requests WHERE seller_id = ? ORDER BY requested_at DESC LIMIT 20`,
      [sid]
    );
  }

  const totalWithdrawn = totalPending + totalPaidOut;
  // 과거 과다지급(테스트/마이그레이션) 데이터: 지급완료가 누적판매의 2배 초과면 legacy 모드
  const overpaidLegacy = totalPaidOut > totalEarned * 2;

  let eraWithdrawn = totalWithdrawn;
  if (overpaidLegacy) {
    try {
      let firstSaleAt = null;
      if (USE_POSTGRES) {
        const firstRow = await db.get(`
          SELECT MIN(sr.created_at) AS first_at
          FROM supply_requests sr
          INNER JOIN supplies s ON sr.supply_item_id::text = s.supply_id::text
          WHERE COALESCE(sr.request_type, 'supply') = 'distribution'
            AND COALESCE(sr.payment_amount, 0) > 0
            AND UPPER(COALESCE(sr.order_status, '')) NOT IN ('CANCELLED', 'RETURNED')
            AND (
              s.created_by::text = $1
              OR COALESCE(s.assigned_to::text, '') = $1
              OR COALESCE(s.upload_meta::jsonb->>'sellerId', '') = $1
            )
        `, [sid]);
        firstSaleAt = firstRow?.first_at || null;
        if (firstSaleAt) {
          const eraRow = await db.get(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM dist_payout_requests
             WHERE seller_id::text = $1 AND status IN ('PENDING', 'APPROVED', 'PAID') AND requested_at >= $2`,
            [sid, firstSaleAt]
          );
          eraWithdrawn = Number(eraRow?.total || 0);
        }
      } else {
        const firstRow = await db.get(`
          SELECT MIN(sr.createdAt) AS first_at
          FROM supply_requests sr
          INNER JOIN supplies s ON sr.supplyItemId = s.supplyId
          WHERE COALESCE(sr.requestType, 'supply') = 'distribution'
            AND COALESCE(sr.paymentAmount, 0) > 0
            AND UPPER(COALESCE(sr.orderStatus, '')) NOT IN ('CANCELLED', 'RETURNED')
            AND (s.createdBy = ? OR COALESCE(s.assignedTo, '') = ?)
        `, [sid, sid]);
        firstSaleAt = firstRow?.first_at || firstRow?.firstAt || null;
        if (firstSaleAt) {
          const eraRow = await db.get(
            `SELECT COALESCE(SUM(amount), 0) AS total FROM dist_payout_requests
             WHERE seller_id = ? AND status IN ('PENDING', 'APPROVED', 'PAID') AND requested_at >= ?`,
            [sid, firstSaleAt]
          );
          eraWithdrawn = Number(eraRow?.total || 0);
        }
      }
    } catch (e) {
      logger.warn('[dist wallet] era withdrawal calc skipped:', e.message);
      eraWithdrawn = totalWithdrawn;
    }
  }

  const available = overpaidLegacy
    ? Math.max(0, totalEarned - eraWithdrawn)
    : Math.max(0, totalEarned - totalPending - totalPaidOut);

  return {
    totalEarned,
    totalPending,
    totalPaidOut,
    totalWithdrawn,
    eraWithdrawn: overpaidLegacy ? eraWithdrawn : totalWithdrawn,
    available,
    overpaidLegacy,
    withdrawals,
  };
}

// GET /api/dist/wallet - 유통판매 포인트지갑 (잔액+영수증)
app.get('/api/dist/wallet', async (req, res) => {
  try {
    const token = getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const session = await db.get(
      USE_POSTGRES ? 'SELECT member_id FROM sessions WHERE session_id = $1' : 'SELECT memberId FROM sessions WHERE sessionId = ?',
      [token]
    );
    if (!session) return res.status(401).json({ error: 'Invalid session' });
    const sellerId = USE_POSTGRES ? session.member_id : session.memberId;

    const summary = await getDistWalletSummary(sellerId);
    res.json({ ok: true, ...summary });
  } catch (err) {
    logger.error('Error fetching dist wallet:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dist/wallet/withdraw - 출금 요청
app.post('/api/dist/wallet/withdraw', async (req, res) => {
  try {
    const token = getAuthToken(req);
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    const session = await db.get(
      USE_POSTGRES ? 'SELECT member_id, member_id FROM sessions WHERE session_id = $1' : 'SELECT memberId FROM sessions WHERE sessionId = ?',
      [token]
    );
    if (!session) return res.status(401).json({ error: 'Invalid session' });
    const sellerId = USE_POSTGRES ? session.member_id : session.memberId;

    const amount = Math.max(0, Math.trunc(Number(req.body?.amount || 0)));
    if (!amount || amount <= 0) return res.status(400).json({ error: '출금 금액을 입력하세요.' });
    const { bankName, accountNumber, depositorName, memo } = req.body || {};
    if (!bankName || !accountNumber || !depositorName) return res.status(400).json({ error: '은행명, 계좌번호, 예금주명을 입력하세요.' });

    const summary = await getDistWalletSummary(sellerId);
    const available = summary.available;
    if (amount > available) return res.status(400).json({ error: `출금 가능 잔액(${available}P)을 초과할 수 없습니다.` });

    // 판매자 이름 조회
    const memberRow = await db.get(
      USE_POSTGRES ? 'SELECT name FROM members WHERE member_id=$1' : 'SELECT name FROM members WHERE memberId=?',
      [sellerId]
    );
    const sellerName = memberRow?.name || '';
    const now = new Date().toISOString();

    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO dist_payout_requests(seller_id, seller_name, amount, bank_name, account_number, depositor_name, memo, status, requested_at) VALUES($1,$2,$3,$4,$5,$6,$7,'PENDING',$8)`,
        [sellerId, sellerName, amount, bankName, accountNumber, depositorName, memo || null, now]
      );
    } else {
      await db.run(
        `INSERT INTO dist_payout_requests(seller_id, seller_name, amount, bank_name, account_number, depositor_name, memo, status, requested_at) VALUES(?,?,?,?,?,?,?,'PENDING',?)`,
        [sellerId, sellerName, amount, bankName, accountNumber, depositorName, memo || null, now]
      );
    }
    logger.info(`Dist withdrawal requested: sellerId=${sellerId}, amount=${amount}`);
    res.json({ ok: true, message: '출금 요청이 접수되었습니다.' });
  } catch (err) {
    logger.error('Error requesting dist withdrawal:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/admin/dist-payouts - 관리자: 출금 요청 목록
app.get('/api/admin/dist-payouts', async (req, res) => {
  try {
    const rows = USE_POSTGRES
      ? await db.all(`SELECT * FROM dist_payout_requests ORDER BY requested_at DESC`)
      : await db.all(`SELECT * FROM dist_payout_requests ORDER BY requested_at DESC`);
    res.json({ ok: true, payouts: rows });
  } catch (err) {
    logger.error('Error fetching dist payouts (admin):', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/admin/dist-payouts/:id - 관리자: 출금 승인/거절/지급완료
app.patch('/api/admin/dist-payouts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectReason } = req.body || {};
    if (!['APPROVED', 'PAID', 'REJECTED'].includes(String(status || '').toUpperCase())) {
      return res.status(400).json({ error: 'status는 APPROVED, PAID, REJECTED 중 하나여야 합니다.' });
    }
    const newStatus = String(status).toUpperCase();
    const now = new Date().toISOString();
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE dist_payout_requests SET status=$1, handled_at=$2, reject_reason=$3 WHERE id=$4`,
        [newStatus, now, rejectReason || null, id]
      );
    } else {
      await db.run(
        `UPDATE dist_payout_requests SET status=?, handled_at=?, reject_reason=? WHERE id=?`,
        [newStatus, now, rejectReason || null, id]
      );
    }
    logger.info(`Dist payout handled: id=${id}, status=${newStatus}`);
    res.json({ ok: true, message: `출금 요청이 ${newStatus === 'APPROVED' ? '승인' : newStatus === 'PAID' ? '지급완료' : '거절'}되었습니다.` });
  } catch (err) {
    logger.error('Error handling dist payout:', err);
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/supply-requests/:id/complete - 보급지원 신청 완료 처리 (Issue B-2)
app.put('/api/supply-requests/:id/complete', async (req, res) => {
  try {
    const { id } = req.params;
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE supply_requests 
         SET status = 'COMPLETED', completed_at = $1, updated_at = $2
         WHERE request_id = $3`,
        [now, now, id]
      );
    } else {
      await db.run(
        `UPDATE supply_requests 
         SET status = 'COMPLETED', completedAt = ?, updatedAt = ?
         WHERE requestId = ?`,
        [now, now, id]
      );
    }
    
    // 업데이트된 로우 조회
    const updated = await db.get(
      USE_POSTGRES
        ? 'SELECT * FROM supply_requests WHERE request_id = $1'
        : 'SELECT * FROM supply_requests WHERE requestId = ?',
      [id]
    );

    const normalized = USE_POSTGRES ? {
      id: updated.request_id,
      status: updated.status,
      completedAt: updated.completed_at
    } : {
      id: updated.requestId,
      status: updated.status,
      completedAt: updated.completedAt
    };

    res.json({ ok: true, updated: normalized });
  } catch (err) {
    logger.error('Error completing supply request:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/supply-requests - 보급지원 신청 목록 조회
app.get('/api/supply-requests', async (req, res) => {
  try {
    const { managerId, requesterId } = req.query;
    const requestType = String(req.query?.requestType || '').trim().toLowerCase();
    const hasRequestType = requestType === 'distribution' || requestType === 'supply';
    
    let query, params;
    if (USE_POSTGRES) {
      if (managerId) {
        query = `
          SELECT sr.*, s.title as item_name, s.created_by as manager_id, m.name as applicant_name, m.phone as applicant_phone
          FROM supply_requests sr
          JOIN supplies s ON sr.supply_item_id = s.supply_id
          LEFT JOIN members m ON sr.requester_id = CAST(m.member_id AS TEXT)
          WHERE s.created_by = $1
          ${hasRequestType ? "AND COALESCE(sr.request_type, 'supply') = $2" : ''}
          ORDER BY sr.created_at DESC
        `;
        params = hasRequestType ? [managerId, requestType] : [managerId];
      } else if (requesterId) {
        query = `
          SELECT sr.*, s.title as item_name, s.created_by as manager_id, m.name as applicant_name, m.phone as applicant_phone
          FROM supply_requests sr
          LEFT JOIN supplies s ON sr.supply_item_id = s.supply_id
          LEFT JOIN members m ON sr.requester_id = CAST(m.member_id AS TEXT)
          WHERE sr.requester_id = $1
          ${hasRequestType ? "AND COALESCE(sr.request_type, 'supply') = $2" : ''}
          ORDER BY sr.created_at DESC
        `;
        params = hasRequestType ? [requesterId, requestType] : [requesterId];
      } else {
        query = `
          SELECT sr.*,
            COALESCE(sr.item_name, s.title) AS item_name,
            COALESCE(sr.manager_name, m2.name, s.created_by::TEXT) AS manager_name
          FROM supply_requests sr
          LEFT JOIN supplies s ON sr.supply_item_id = s.supply_id
          LEFT JOIN members m2 ON s.created_by = CAST(m2.member_id AS TEXT)
          ${hasRequestType ? "WHERE COALESCE(sr.request_type, 'supply') = $1" : ''}
          ORDER BY sr.created_at DESC
        `;
        params = hasRequestType ? [requestType] : [];
      }
    } else {
      if (managerId) {
        query = `
          SELECT sr.*, s.title as item_name, s.createdBy as manager_id
          FROM supply_requests sr
          JOIN supplies s ON sr.supplyItemId = s.supplyId
          WHERE s.createdBy = ?
          ${hasRequestType ? "AND COALESCE(sr.requestType, 'supply') = ?" : ''}
          ORDER BY sr.createdAt DESC
        `;
        params = hasRequestType ? [managerId, requestType] : [managerId];
      } else if (requesterId) {
        query = `
          SELECT sr.*, s.title as item_name, s.createdBy as manager_id
          FROM supply_requests sr
          LEFT JOIN supplies s ON sr.supplyItemId = s.supplyId
          WHERE sr.requesterId = ?
          ${hasRequestType ? "AND COALESCE(sr.requestType, 'supply') = ?" : ''}
          ORDER BY sr.createdAt DESC
        `;
        params = hasRequestType ? [requesterId, requestType] : [requesterId];
      } else {
        query = `
          SELECT sr.*, s.title as item_name, s.createdBy as manager_id
          FROM supply_requests sr
          LEFT JOIN supplies s ON sr.supplyItemId = s.supplyId
          ${hasRequestType ? "WHERE COALESCE(sr.requestType, 'supply') = ?" : ''}
          ORDER BY sr.createdAt DESC
        `;
        params = hasRequestType ? [requestType] : [];
      }
    }
    
    const rows = await db.all(query, params);
    
    // ✅ Normalize response
    const normalized = (rows || []).map(r => USE_POSTGRES ? {
      id: r.request_id,
      supplyItemId: r.supply_item_id,
      requesterId: r.requester_id,
      // prefer explicit requester_* columns, fall back to applicant_* (joined member)
      requesterName: r.requester_name || r.applicant_name || '',
      requesterContact: r.requester_contact || r.applicant_phone || '',
      itemName: r.item_name,
      managerName: r.manager_name || null,
      requestType: r.request_type || 'supply',
      orderStatus: r.order_status || null,
      receiveMethod: r.receive_method || null,
      paymentReferenceId: r.payment_reference_id || null,
      paymentAmount: Number(r.payment_amount || 0),
      status: r.status,
      message: r.message,
      quantity: r.quantity,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      completedAt: r.completed_at,
      buyerConfirmedAt: r.buyer_confirmed_at,
      cancelledAt: r.cancelled_at,
      returnRequestedAt: r.return_requested_at,
      returnedAt: r.returned_at,
      managerName: r.manager_name || r.manager_id || ''
    } : {
      id: r.requestId,
      supplyItemId: r.supplyItemId,
      requesterId: r.requesterId,
      requesterName: r.requesterName || r.applicantName || '',
      requesterContact: r.requesterContact || r.applicantPhone || '',
      itemName: r.item_name,
      requestType: r.requestType || 'supply',
      orderStatus: r.orderStatus || null,
      receiveMethod: r.receiveMethod || null,
      paymentReferenceId: r.paymentReferenceId || null,
      paymentAmount: Number(r.paymentAmount || 0),
      status: r.status,
      message: r.message,
      quantity: r.quantity,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      completedAt: r.completedAt,
      buyerConfirmedAt: r.buyerConfirmedAt,
      cancelledAt: r.cancelledAt,
      returnRequestedAt: r.returnRequestedAt,
      returnedAt: r.returnedAt,
      managerName: r.manager_name || r.manager_id || ''
    });
    
    // 🔍 Issue #3 FIX: Return consistent format { requests: [...] }
    res.json({ requests: normalized });
  } catch (err) {
    logger.error('Error fetching supply requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/supply-requests/:id - 보급지원 신청 상태 변경
app.patch('/api/supply-requests/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const {
      status,
      orderStatus,
      buyerConfirmed,
      requestType,
      returnReason,
      cancelReason,
    } = req.body || {};

    if (!status && !orderStatus && !buyerConfirmed && !requestType) {
      return res.status(400).json({ error: 'status or orderStatus or buyerConfirmed is required' });
    }
    
    const now = new Date().toISOString();
    const normalizedOrderStatus = orderStatus ? String(orderStatus).trim().toUpperCase() : null;
    
    if (USE_POSTGRES) {
      const sets = ['updated_at = $1'];
      const params = [now];
      let idx = 2;

      if (status) {
        sets.push(`status = $${idx++}`);
        params.push(status);
      }
      if (normalizedOrderStatus) {
        sets.push(`order_status = $${idx++}`);
        params.push(normalizedOrderStatus);
      }
      if (requestType) {
        sets.push(`request_type = $${idx++}`);
        params.push(String(requestType).trim().toLowerCase() === 'distribution' ? 'distribution' : 'supply');
      }
      if (buyerConfirmed) {
        sets.push(`buyer_confirmed_at = $${idx++}`);
        params.push(now);
      }
      if (normalizedOrderStatus === 'CANCELLED') {
        sets.push(`cancelled_at = $${idx++}`);
        params.push(now);
      }
      if (normalizedOrderStatus === 'RETURN_REQUESTED') {
        sets.push(`return_requested_at = $${idx++}`);
        params.push(now);
      }
      if (normalizedOrderStatus === 'RETURNED') {
        sets.push(`returned_at = $${idx++}`);
        params.push(now);
      }
      if (normalizedOrderStatus === 'COMPLETED') {
        sets.push(`completed_at = $${idx++}`);
        params.push(now);
      }
      if (buyerConfirmed && !normalizedOrderStatus) {
        sets.push(`order_status = $${idx++}`);
        params.push('COMPLETED');
        sets.push(`completed_at = $${idx++}`);
        params.push(now);
      }

      const query = `UPDATE supply_requests SET ${sets.join(', ')} WHERE request_id = $${idx} RETURNING *`;
      params.push(id);
      const row = await db.get(query, params);
      if (!row) {
        return res.status(404).json({ error: 'request not found' });
      }

      const rowRequestType = String(row.request_type || 'supply').toLowerCase();
      const rowOrderStatus = String(row.order_status || '').toUpperCase();
      const shouldCancelPoint = rowRequestType === 'distribution' && (rowOrderStatus === 'RETURNED' || rowOrderStatus === 'CANCELLED');

      if (shouldCancelPoint && row.payment_reference_id) {
        const targetLedger = await db.get(
          `SELECT ledger_id, status
           FROM point_ledger
           WHERE member_id = $1 AND reference_id = $2 AND amount < 0
           ORDER BY created_at DESC
           LIMIT 1`,
          [String(row.requester_id || ''), String(row.payment_reference_id || '')]
        );
        if (targetLedger && String(targetLedger.status || '').toLowerCase() !== 'cancelled') {
          await db.run('UPDATE point_ledger SET status = $1 WHERE ledger_id = $2', ['cancelled', targetLedger.ledger_id]);
          await db.run(
            `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, status, created_at)
             VALUES($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
              String(row.requester_id || ''),
              0,
              'CANCEL',
              rowOrderStatus === 'RETURNED'
                ? `유통 주문 반품 취소 처리${returnReason ? ` (${String(returnReason)})` : ''}`
                : `유통 주문 취소 처리${cancelReason ? ` (${String(cancelReason)})` : ''}`,
              String(targetLedger.ledger_id),
              'DISTRIBUTION_CANCEL',
              'active',
              now,
            ]
          );
        }
      }

      return res.json({ ok: true, request: row });
    }

    const sets = ['updatedAt = ?'];
    const params = [now];

    if (status) {
      sets.push('status = ?');
      params.push(status);
    }
    if (normalizedOrderStatus) {
      sets.push('orderStatus = ?');
      params.push(normalizedOrderStatus);
    }
    if (requestType) {
      sets.push('requestType = ?');
      params.push(String(requestType).trim().toLowerCase() === 'distribution' ? 'distribution' : 'supply');
    }
    if (buyerConfirmed) {
      sets.push('buyerConfirmedAt = ?');
      params.push(now);
    }
    if (normalizedOrderStatus === 'CANCELLED') {
      sets.push('cancelledAt = ?');
      params.push(now);
    }
    if (normalizedOrderStatus === 'RETURN_REQUESTED') {
      sets.push('returnRequestedAt = ?');
      params.push(now);
    }
    if (normalizedOrderStatus === 'RETURNED') {
      sets.push('returnedAt = ?');
      params.push(now);
    }
    if (buyerConfirmed && !normalizedOrderStatus) {
      sets.push('orderStatus = ?');
      params.push('COMPLETED');
      sets.push('completedAt = ?');
      params.push(now);
    }

    const query = `UPDATE supply_requests SET ${sets.join(', ')} WHERE requestId = ?`;
    params.push(id);
    await db.run(query, params);
    const request = await db.get('SELECT * FROM supply_requests WHERE requestId = ?', [id]);
    if (!request) {
      return res.status(404).json({ error: 'request not found' });
    }

    const rowRequestType = String(request.requestType || 'supply').toLowerCase();
    const rowOrderStatus = String(request.orderStatus || '').toUpperCase();
    const shouldCancelPoint = rowRequestType === 'distribution' && (rowOrderStatus === 'RETURNED' || rowOrderStatus === 'CANCELLED');

    if (shouldCancelPoint && request.paymentReferenceId) {
      const targetLedger = await db.get(
        `SELECT ledgerId, status
         FROM point_ledger
         WHERE memberId = ? AND referenceId = ? AND amount < 0
         ORDER BY createdAt DESC
         LIMIT 1`,
        [String(request.requesterId || ''), String(request.paymentReferenceId || '')]
      );
      if (targetLedger && String(targetLedger.status || '').toLowerCase() !== 'cancelled') {
        await db.run('UPDATE point_ledger SET status = ? WHERE ledgerId = ?', ['cancelled', targetLedger.ledgerId]);
        await db.run(
          `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, status, createdAt)
           VALUES(?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            String(request.requesterId || ''),
            0,
            'CANCEL',
            rowOrderStatus === 'RETURNED'
              ? `유통 주문 반품 취소 처리${returnReason ? ` (${String(returnReason)})` : ''}`
              : `유통 주문 취소 처리${cancelReason ? ` (${String(cancelReason)})` : ''}`,
            String(targetLedger.ledgerId),
            'DISTRIBUTION_CANCEL',
            'active',
            now,
          ]
        );
      }
    }

    res.json({ ok: true, request });
  } catch (err) {
    logger.error('Error updating supply request:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/supply-requests/:id - 보급지원 신청 삭제
app.delete('/api/supply-requests/:id', async (req, res) => {
  try {
    const id = req.params.id;
    if (USE_POSTGRES) {
      await db.run(`DELETE FROM supply_requests WHERE request_id = $1`, [id]);
    } else {
      await db.run(`DELETE FROM supply_requests WHERE requestId = ?`, [id]);
    }
    res.json({ ok: true, success: true });
  } catch (err) {
    logger.error('Error deleting supply request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Serve uploaded files — SPA fallback에서 next()로 여기까지 도달
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// 구 버전 DB 경로 호환: /uploads/banner_xxx → uploads/banners/banner_xxx 폴백
app.use('/uploads', express.static(path.join(__dirname, 'uploads', 'banners')));

// ============================================
// PV3 완전 복원: API 엔드포인트
// ============================================

// ========== 공지사항 API ==========
// GET /api/notices - 공지사항 목록 조회
app.get('/api/notices', async (req, res) => {
  try {
    const { scope, region_id, status, districtId } = req.query;
    
    let query = 'SELECT * FROM notices WHERE 1=1';
    const params = [];
    let paramCounter = 1;
    
    if (scope) {
      params.push(scope);
      query += USE_POSTGRES ? ` AND scope = $${paramCounter++}` : ' AND scope = ?';
    }
    
    if (region_id) {
      params.push(region_id);
      if (USE_POSTGRES) {
        query += ` AND (region_id = $${paramCounter++} OR region_ids @> $${paramCounter}::jsonb)`;
        params.push(JSON.stringify([region_id]));
        paramCounter++;
      } else {
        query += ` AND (region_id = ? OR region_ids LIKE '%"' || ? || '"%')`;
        params.push(region_id);
      }
      // district filter: region 있을 때만 적용 (scope=ALL 항목은 자연 제외됨)
      if (districtId) {
        params.push(districtId);
        query += USE_POSTGRES ? ` AND district_id = $${paramCounter++}` : ' AND district_id = ?';
      }
    }
    
    if (status) {
      params.push(status);
      query += USE_POSTGRES ? ` AND UPPER(status) = UPPER($${paramCounter++})` : ' AND UPPER(status) = UPPER(?)';
    }
    
    query += USE_POSTGRES ? ' ORDER BY created_at DESC' : ' ORDER BY created_at DESC';
    
    const rows = await db.all(query, params);
    
    const normalized = rows.map(r => USE_POSTGRES ? {
      id: r.id || (r.notice_id != null ? `notice_${r.notice_id}` : null),
      title: r.title,
      content: r.content,
      scope: r.scope,
      regionId: r.region_id,
      regionIds: r.region_ids,
      isPopup: !!r.is_popup,
      isPinned: !!r.is_pinned,
      isPublic: (r.is_public == null) ? true : !!r.is_public,
      status: r.status,
      author: r.author,
      authorId: r.author_id,
      districtId: r.district_id,
      imageUrl: r.image_url || r.imageUrl || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    } : {
      id: r.id || (r.notice_id != null ? `notice_${r.notice_id}` : null),
      title: r.title,
      content: r.content,
      scope: r.scope,
      regionId: r.region_id,
      regionIds: r.region_ids ? JSON.parse(r.region_ids) : null,
      isPopup: !!r.is_popup,
      isPinned: !!r.is_pinned,
      isPublic: (r.is_public == null) ? true : !!r.is_public,
      status: r.status,
      author: r.author,
      authorId: r.author_id,
      imageUrl: r.image_url || r.imageUrl || null,
      createdAt: r.created_at,
      updatedAt: r.updated_at
    });
    
    res.json(normalized);
  } catch (err) {
    logger.error('Error fetching notices:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/notices/:id - 공지사항 상세 조회
app.get('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const legacyNoticePk = parseLegacyNoticePk(id);
    
    const query = USE_POSTGRES
      ? (legacyNoticePk != null ? 'SELECT * FROM notices WHERE id = $1 OR notice_id = $2 LIMIT 1' : 'SELECT * FROM notices WHERE id = $1 LIMIT 1')
      : (legacyNoticePk != null ? 'SELECT * FROM notices WHERE id = ? OR notice_id = ? LIMIT 1' : 'SELECT * FROM notices WHERE id = ? LIMIT 1');
    
    const row = await db.get(query, legacyNoticePk != null ? [id, legacyNoticePk] : [id]);
    
    if (!row) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    const notice = USE_POSTGRES ? {
      id: row.id || (row.notice_id != null ? `notice_${row.notice_id}` : null),
      title: row.title,
      content: row.content,
      scope: row.scope,
      regionId: row.region_id,
      regionIds: row.region_ids,
      isPopup: !!row.is_popup,
      isPinned: !!row.is_pinned,
      isPublic: row.is_public !== undefined ? !!row.is_public : true,
      status: row.status,
      author: row.author,
      authorId: row.author_id,
      imageUrl: row.image_url || row.imageUrl || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    } : {
      id: row.id || (row.notice_id != null ? `notice_${row.notice_id}` : null),
      title: row.title,
      content: row.content,
      scope: row.scope,
      regionId: row.region_id,
      regionIds: row.region_ids ? JSON.parse(row.region_ids) : null,
      isPopup: !!row.is_popup,
      isPinned: !!row.is_pinned,
      isPublic: row.is_public !== undefined ? !!row.is_public : true,
      status: row.status,
      author: row.author,
      authorId: row.author_id,
      imageUrl: row.image_url || row.imageUrl || null,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
    
    res.json(notice);
  } catch (err) {
    logger.error('Error fetching notice:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/notices - 공지사항 생성
app.post('/api/notices', async (req, res) => {
  try {
    const { id, title, content, scope, regionId, regionIds, status, author, authorId, isPopup, isPinned, isPublic, districtId, imageUrl } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ error: 'title and content required' });
    }
    
    const noticeId = id || `notice_${Date.now()}`;
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      await db.run(
        `INSERT INTO notices(id, title, content, scope, region_id, region_ids, is_popup, is_pinned, is_public, status, author, author_id, district_id, image_url, created_at, updated_at)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
        [
          noticeId,
          title,
          content,
          scope || 'ALL',
          regionId || null,
          regionIds ? JSON.stringify(regionIds) : null,
          !!isPopup,
          isPinned ? true : false,
          isPublic === undefined ? true : !!isPublic,
          status || 'ACTIVE',
          author || null,
          authorId || null,
          districtId || null,
          imageUrl || null,
          now,
          now
        ]
      );
    } else {
      await db.run(
        `INSERT INTO notices(id, title, content, scope, region_id, region_ids, is_popup, is_pinned, is_public, status, author, author_id, district_id, image_url, created_at, updated_at)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          noticeId,
          title,
          content,
          scope || 'ALL',
          regionId || null,
          regionIds ? JSON.stringify(regionIds) : null,
          isPopup ? 1 : 0,
          isPinned ? 1 : 0,
          isPublic === undefined ? 1 : (isPublic ? 1 : 0),
          status || 'ACTIVE',
          author || null,
          authorId || null,
          districtId || null,
          imageUrl || null,
          now,
          now
        ]
      );
    }
    
    res.json({ ok: true, id: noticeId });
  } catch (err) {
    logger.error('Error creating notice:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/notices/:id - 공지사항 수정
app.patch('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const legacyNoticePk = parseLegacyNoticePk(id);
    const { title, content, scope, regionId, regionIds, status, isPopup, isPinned, isPublic, districtId, imageUrl } = req.body;
    
    const now = new Date().toISOString();
    const updates = [];
    const params = [];
    let paramCounter = 1;
    
    if (title !== undefined) {
      params.push(title);
      updates.push(USE_POSTGRES ? `title = $${paramCounter++}` : 'title = ?');
    }
    if (content !== undefined) {
      params.push(content);
      updates.push(USE_POSTGRES ? `content = $${paramCounter++}` : 'content = ?');
    }
    if (scope !== undefined) {
      params.push(scope);
      updates.push(USE_POSTGRES ? `scope = $${paramCounter++}` : 'scope = ?');
    }
    if (regionId !== undefined) {
      params.push(regionId);
      updates.push(USE_POSTGRES ? `region_id = $${paramCounter++}` : 'region_id = ?');
    }
    if (regionIds !== undefined) {
      params.push(regionIds ? JSON.stringify(regionIds) : null);
      updates.push(USE_POSTGRES ? `region_ids = $${paramCounter++}` : 'region_ids = ?');
    }
    if (districtId !== undefined) {
      params.push(districtId || null);
      updates.push(USE_POSTGRES ? `district_id = $${paramCounter++}` : 'district_id = ?');
    }
    if (isPopup !== undefined) {
      params.push(USE_POSTGRES ? !!isPopup : (isPopup ? 1 : 0));
      updates.push(USE_POSTGRES ? `is_popup = $${paramCounter++}` : 'is_popup = ?');
    }
    if (isPinned !== undefined) {
      params.push(USE_POSTGRES ? !!isPinned : (isPinned ? 1 : 0));
      updates.push(USE_POSTGRES ? `is_pinned = $${paramCounter++}` : 'is_pinned = ?');
    }
    if (isPublic !== undefined) {
      params.push(USE_POSTGRES ? !!isPublic : (isPublic ? 1 : 0));
      updates.push(USE_POSTGRES ? `is_public = $${paramCounter++}` : 'is_public = ?');
    }
    if (status !== undefined) {
      params.push(status);
      updates.push(USE_POSTGRES ? `status = $${paramCounter++}` : 'status = ?');
    }
    if (imageUrl !== undefined) {
      params.push(imageUrl || null);
      updates.push(USE_POSTGRES ? `image_url = $${paramCounter++}` : 'image_url = ?');
    }

    const existing = await db.get(
      USE_POSTGRES
        ? (legacyNoticePk != null ? 'SELECT notice_id FROM notices WHERE id = $1 OR notice_id = $2 LIMIT 1' : 'SELECT notice_id FROM notices WHERE id = $1 LIMIT 1')
        : (legacyNoticePk != null ? 'SELECT notice_id FROM notices WHERE id = ? OR notice_id = ? LIMIT 1' : 'SELECT notice_id FROM notices WHERE id = ? LIMIT 1'),
      legacyNoticePk != null ? [id, legacyNoticePk] : [id]
    );
    if (!existing) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    params.push(now);
    updates.push(USE_POSTGRES ? `updated_at = $${paramCounter++}` : 'updated_at = ?');
    if (legacyNoticePk != null) {
      params.push(id, legacyNoticePk);
    } else {
      params.push(id);
    }
    
    const query = `UPDATE notices SET ${updates.join(', ')} WHERE ${USE_POSTGRES ? (legacyNoticePk != null ? `(id = $${paramCounter++} OR notice_id = $${paramCounter++})` : `id = $${paramCounter++}`) : (legacyNoticePk != null ? '(id = ? OR notice_id = ?)' : 'id = ?')}`;
    
    await db.run(query, params);
    
    res.json({ ok: true, id });
  } catch (err) {
    logger.error('Error updating notice:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/notices/:id - 공지사항 삭제
app.delete('/api/notices/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const legacyNoticePk = parseLegacyNoticePk(id);
    const existing = await db.get(
      USE_POSTGRES
        ? (legacyNoticePk != null ? 'SELECT notice_id FROM notices WHERE id = $1 OR notice_id = $2 LIMIT 1' : 'SELECT notice_id FROM notices WHERE id = $1 LIMIT 1')
        : (legacyNoticePk != null ? 'SELECT notice_id FROM notices WHERE id = ? OR notice_id = ? LIMIT 1' : 'SELECT notice_id FROM notices WHERE id = ? LIMIT 1'),
      legacyNoticePk != null ? [id, legacyNoticePk] : [id]
    );
    if (!existing) {
      return res.status(404).json({ error: 'Notice not found' });
    }
    
    const query = USE_POSTGRES
      ? (legacyNoticePk != null ? 'DELETE FROM notices WHERE id = $1 OR notice_id = $2' : 'DELETE FROM notices WHERE id = $1')
      : (legacyNoticePk != null ? 'DELETE FROM notices WHERE id = ? OR notice_id = ?' : 'DELETE FROM notices WHERE id = ?');
    
    await db.run(query, legacyNoticePk != null ? [id, legacyNoticePk] : [id]);
    
    res.json({ ok: true, id });
  } catch (err) {
    logger.error('Error deleting notice:', err);
    res.status(500).json({ error: err.message });
  }
});

// ========== 포인트 취소 API ==========
async function handleCancelPointTransaction(req, res, transactionIdOverride = null) {
  try {
    if (!isAdminRole(req.authRole)) {
      return jsonFail(res, 403, 'Forbidden: 관리자만 거래를 취소할 수 있습니다.');
    }

    const { transactionId: bodyTransactionId, reason } = req.body || {};
    const transactionId = transactionIdOverride || bodyTransactionId;
    const adminId = req.authMemberId || null;
    
    if (!transactionId) {
      return jsonFail(res, 400, 'transactionId required');
    }
    
    const transactionQuery = USE_POSTGRES
      ? 'SELECT * FROM point_ledger WHERE ledger_id = $1 LIMIT 1'
      : 'SELECT * FROM point_ledger WHERE ledgerId = ? LIMIT 1';
    
    const transaction = await db.get(transactionQuery, [transactionId]);
    
    if (!transaction) {
      return jsonFail(res, 404, 'Transaction not found');
    }
    
    const existingStatus = transaction.status;
    if (existingStatus === 'cancelled') {
      return jsonFail(res, 409, 'Transaction already cancelled');
    }

    const refType = USE_POSTGRES ? transaction.reference_type : transaction.referenceType;
    const refId = USE_POSTGRES ? transaction.reference_id : transaction.referenceId;
    const now = new Date().toISOString();
    const reasonSuffix = reason ? ` (${reason})` : '';

    if (refType === 'POINT_TRANSFER' && refId) {
      const siblings = USE_POSTGRES
        ? await db.query(
            `SELECT ledger_id, member_id, description, status FROM point_ledger
             WHERE reference_id = $1 AND reference_type = 'POINT_TRANSFER' AND status != 'cancelled'`,
            [refId]
          )
        : await db.query(
            `SELECT ledgerId as ledger_id, memberId as member_id, description, status FROM point_ledger
             WHERE referenceId = ? AND referenceType = 'POINT_TRANSFER' AND status != 'cancelled'`,
            [refId]
          );

      if (!siblings || siblings.length === 0) {
        return jsonFail(res, 404, 'Transfer transactions not found');
      }

      if (USE_POSTGRES) {
        await db.run('BEGIN');
        try {
          for (const row of siblings) {
            const cancelDescription = `거래 취소: ${row.description || ''}${reasonSuffix}`;
            await db.run(`UPDATE point_ledger SET status = 'cancelled' WHERE ledger_id = $1`, [row.ledger_id]);
            await db.run(
              `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, admin_id, status, created_at)
               VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
              [row.member_id, 0, 'CANCEL', cancelDescription, String(row.ledger_id), 'CANCEL', adminId, 'active', now]
            );
          }
          await db.run('COMMIT');
        } catch (error) {
          await db.run('ROLLBACK');
          throw error;
        }
      } else {
        await db.run('BEGIN');
        try {
          for (const row of siblings) {
            const cancelDescription = `거래 취소: ${row.description || ''}${reasonSuffix}`;
            await db.run(`UPDATE point_ledger SET status = 'cancelled' WHERE ledgerId = ?`, [row.ledger_id]);
            await db.run(
              `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, admin_id, status, createdAt)
               VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [row.member_id, 0, 'CANCEL', cancelDescription, String(row.ledger_id), 'CANCEL', adminId, 'active', now]
            );
          }
          await db.run('COMMIT');
        } catch (error) {
          await db.run('ROLLBACK');
          throw error;
        }
      }

      logger.info(`Point transfer cancelled: transferId=${refId}, adminId=${adminId}`);
      return jsonOk(res, { transactionId: String(transactionId), transferId: refId });
    }

    const cancelDescription = `거래 취소: ${transaction.description || ''}${reasonSuffix}`;
    const memberId = USE_POSTGRES ? transaction.member_id : transaction.memberId;

    if (USE_POSTGRES) {
      await db.run('UPDATE point_ledger SET status = $1 WHERE ledger_id = $2', ['cancelled', transactionId]);
      await db.run(
        `INSERT INTO point_ledger(member_id, amount, type, description, reference_id, reference_type, admin_id, status, created_at)
         VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [memberId, 0, 'CANCEL', cancelDescription, String(transactionId), 'CANCEL', adminId, 'active', now]
      );
    } else {
      await db.run('UPDATE point_ledger SET status = ? WHERE ledgerId = ?', ['cancelled', transactionId]);
      await db.run(
        `INSERT INTO point_ledger(memberId, amount, type, description, referenceId, referenceType, admin_id, status, createdAt)
         VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [memberId, 0, 'CANCEL', cancelDescription, String(transactionId), 'CANCEL', adminId, 'active', now]
      );
    }
    
    logger.info(`Point transaction cancelled: transactionId=${transactionId}, adminId=${adminId}`);
    return jsonOk(res, { transactionId: String(transactionId) });
  } catch (err) {
    logger.error('Error cancelling point transaction:', err);
    return jsonFail(res, 500, err.message);
  }
}

// POST /api/points/cancel - 포인트 거래 취소 (legacy)
app.post('/api/points/cancel', requireAuth, async (req, res) => {
  return handleCancelPointTransaction(req, res, null);
});

// POST /api/points/admin/cancel/:transactionId - AdminPoints용 별칭
app.post('/api/points/admin/cancel/:transactionId', requireAuth, async (req, res) => {
  const { transactionId } = req.params;
  return handleCancelPointTransaction(req, res, transactionId);
});

// ========== 정산 처리 이력 API ==========
// PATCH /api/shop-payout-requests/:id/handle - 정산 요청 처리
app.patch('/api/shop-payout-requests/:id/handle', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, handledBy, rejectReason } = req.body;
    
    if (!status || !handledBy) {
      return res.status(400).json({ error: 'status and handledBy required' });
    }
    
    const now = new Date().toISOString();
    
    if (USE_POSTGRES) {
      await db.run(
        `UPDATE shop_payout_requests 
         SET status = $1, handled_at = $2, handled_by = $3, reject_reason = $4, updated_at = $5
         WHERE request_id = $6`,
        [status, now, handledBy, rejectReason || null, now, id]
      );
    } else {
      await db.run(
        `UPDATE shop_payout_requests 
         SET status = ?, handled_at = ?, handled_by = ?, reject_reason = ?, updatedAt = ?
         WHERE requestId = ?`,
        [status, now, handledBy, rejectReason || null, now, id]
      );
    }
    
    logger.info(`Payout request handled: requestId=${id}, status=${status}, handledBy=${handledBy}`);
    res.json({ ok: true, id, status });
  } catch (err) {
    logger.error('Error handling payout request:', err);
    res.status(500).json({ error: err.message });
  }
});

// point_ledger SERIAL 시퀀스 보정 — OVERRIDING SYSTEM VALUE 삽입 후 시퀀스가 뒤처지는 것 방지
async function syncPointLedgerSeq() {
  if (!USE_POSTGRES) return;
  try {
    await db.run(`SELECT setval('point_ledger_ledger_id_seq', GREATEST(COALESCE((SELECT MAX(ledger_id) FROM point_ledger), 1), 1))`);
  } catch(e) {
    logger.warn('[syncPointLedgerSeq] 시퀀스 보정 실패:', e.message);
  }
}

// 서버 시작 시 reviews.status 정제 + shops.rating/review_count 일괄 재계산
async function repairRatingData() {
  if (!USE_POSTGRES) return;
  try {
    await db.query(`UPDATE reviews SET status='visible' WHERE status NOT IN ('visible','removed')`);
    await db.query(`
      UPDATE shops s SET
        rating = sub.avg_r,
        review_count = sub.cnt
      FROM (
        SELECT shop_id, ROUND(AVG(rating)::numeric,1) AS avg_r, COUNT(*) AS cnt
        FROM reviews WHERE status='visible' GROUP BY shop_id
      ) sub
      WHERE s.shop_id = sub.shop_id
    `);
    logger.info('[repairRatingData] 완료');
  } catch (e) {
    logger.error('[repairRatingData] error:', e.message);
  }
}

// ═══════════════════════════════════════════════════════
// Push Subscription & Reservation APIs
// ═══════════════════════════════════════════════════════

// GET /api/push/vapid-key — 프론트에서 VAPID 공개키 조회
app.get('/api/push/vapid-key', (req, res) => {
  res.json({ publicKey: VAPID_PUBLIC_KEY });
});

// POST /api/push/subscribe — 푸시 구독 등록
app.post('/api/push/subscribe', async (req, res) => {
  try {
    const memberId = req.headers['x-member-id'];
    if (!memberId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.auth || !keys?.p256dh) return res.status(400).json({ error: '구독 정보가 올바르지 않습니다.' });

    if (USE_POSTGRES) {
      await db.run(`INSERT INTO push_subscriptions(member_id, endpoint, auth_key, p256dh_key) VALUES($1,$2,$3,$4) ON CONFLICT(member_id, endpoint) DO UPDATE SET auth_key=EXCLUDED.auth_key, p256dh_key=EXCLUDED.p256dh_key`, [memberId, endpoint, keys.auth, keys.p256dh]);
    } else {
      await db.run(`INSERT OR REPLACE INTO push_subscriptions(member_id, endpoint, auth_key, p256dh_key, created_at) VALUES(?,?,?,?,datetime('now'))`, [memberId, endpoint, keys.auth, keys.p256dh]);
    }
    res.json({ ok: true });
  } catch (err) {
    logger.error('push subscribe error:', err);
    res.status(500).json({ error: err.message });
  }
});

// 푸시 전송 헬퍼
async function sendPushToMember(memberId, payload) {
  try {
    const subs = await db.query(
      USE_POSTGRES
        ? 'SELECT endpoint, auth_key, p256dh_key FROM push_subscriptions WHERE member_id = $1'
        : 'SELECT endpoint, auth_key, p256dh_key FROM push_subscriptions WHERE member_id = ?',
      [memberId]
    );
    for (const sub of subs) {
      try {
        await webpush.sendNotification({
          endpoint: sub.endpoint,
          keys: { auth: sub.auth_key, p256dh: sub.p256dh_key }
        }, JSON.stringify(payload));
      } catch (e) {
        if (e.statusCode === 410 || e.statusCode === 404) {
          await db.run(
            USE_POSTGRES ? 'DELETE FROM push_subscriptions WHERE endpoint = $1' : 'DELETE FROM push_subscriptions WHERE endpoint = ?',
            [sub.endpoint]
          );
        }
      }
    }
  } catch (err) {
    logger.error('sendPushToMember error:', err);
  }
}

// POST /api/shops/:shopId/reservations — 예약 생성
app.post('/api/shops/:shopId/reservations', async (req, res) => {
  try {
    const memberId = req.headers['x-member-id'];
    if (!memberId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    const shopId = req.params.shopId;
    const { reservedDate, reservedTime, serviceName, numberOfPeople, guestName, guestPhone, notes } = req.body;
    if (!reservedDate || !reservedTime) return res.status(400).json({ error: '날짜와 시간을 선택해주세요.' });

    const reservationId = `rsv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    if (USE_POSTGRES) {
      await db.run(`INSERT INTO reservations(reservation_id, shop_id, member_id, reserved_date, reserved_time, service_name, number_of_people, guest_name, guest_phone, notes) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [reservationId, shopId, memberId, reservedDate, reservedTime, serviceName || null, numberOfPeople || 1, guestName || null, guestPhone || null, notes || null]);
    } else {
      await db.run(`INSERT INTO reservations(reservation_id, shop_id, member_id, reserved_date, reserved_time, service_name, number_of_people, guest_name, guest_phone, notes, created_at, updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,datetime('now'),datetime('now'))`,
        [reservationId, shopId, memberId, reservedDate, reservedTime, serviceName || null, numberOfPeople || 1, guestName || null, guestPhone || null, notes || null]);
    }

    // 상점 주인에게 푸시 알림
    const shopRows = await db.query(
      USE_POSTGRES ? 'SELECT owner_id, name FROM shops WHERE shop_id = $1' : 'SELECT owner_id, name FROM shops WHERE shop_id = ?',
      [shopId]
    );
    if (shopRows.length > 0) {
      const ownerId = shopRows[0].owner_id;
      await sendPushToMember(ownerId, {
        title: '📅 새 예약이 도착했습니다!',
        body: `${guestName || '고객'}님 | ${reservedDate} ${reservedTime}${serviceName ? ' | ' + serviceName : ''}`,
        tag: 'reservation-new',
        url: `/my?tab=reservations`
      });
    }

    res.json({ ok: true, reservationId });
  } catch (err) {
    logger.error('create reservation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/shops/:shopId/reservations — 상점의 예약 목록 (상점 주인용)
app.get('/api/shops/:shopId/reservations', async (req, res) => {
  try {
    const shopId = req.params.shopId;
    const rows = await db.query(
      USE_POSTGRES
        ? `SELECT r.*, m.name AS member_name, m.phone AS member_phone FROM reservations r LEFT JOIN members m ON r.member_id = m.member_id WHERE r.shop_id = $1 ORDER BY r.reserved_date DESC, r.reserved_time DESC`
        : `SELECT r.*, m.name AS member_name FROM reservations r LEFT JOIN members m ON r.member_id = m.member_id WHERE r.shop_id = ? ORDER BY r.reserved_date DESC, r.reserved_time DESC`,
      [shopId]
    );
    const normalized = rows.map(r => {
      let rd = r.reserved_date;
      if (rd instanceof Date) rd = rd.toISOString().slice(0, 10);
      else if (typeof rd === 'string' && rd.length > 10) rd = rd.slice(0, 10);
      return {
        id: r.reservation_id,
        shopId: r.shop_id,
        memberId: r.member_id,
        memberName: r.member_name || r.guest_name || '고객',
        memberPhone: r.member_phone || r.guest_phone || '',
        reservedDate: rd,
        reservedTime: r.reserved_time,
        serviceName: r.service_name,
        numberOfPeople: r.number_of_people,
        guestName: r.guest_name,
        guestPhone: r.guest_phone,
        notes: r.notes,
        status: r.status,
        rejectReason: r.reject_reason,
        createdAt: r.created_at
      };
    });
    res.json({ ok: true, reservations: normalized });
  } catch (err) {
    logger.error('get shop reservations error:', err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/members/:memberId/reservations — 내 예약 목록
app.get('/api/members/:memberId/reservations', async (req, res) => {
  try {
    const memberId = req.params.memberId;
    const rows = await db.query(
      USE_POSTGRES
        ? `SELECT r.*, s.name AS shop_name FROM reservations r LEFT JOIN shops s ON r.shop_id = s.shop_id WHERE r.member_id = $1 ORDER BY r.reserved_date DESC, r.reserved_time DESC`
        : `SELECT r.*, s.name AS shop_name FROM reservations r LEFT JOIN shops s ON r.shop_id = s.shop_id WHERE r.member_id = ? ORDER BY r.reserved_date DESC, r.reserved_time DESC`,
      [memberId]
    );
    const normalized = rows.map(r => {
      let rd = r.reserved_date;
      if (rd instanceof Date) rd = rd.toISOString().slice(0, 10);
      else if (typeof rd === 'string' && rd.length > 10) rd = rd.slice(0, 10);
      return {
        id: r.reservation_id,
        shopId: r.shop_id,
        shopName: r.shop_name || '상점',
        reservedDate: rd,
        reservedTime: r.reserved_time,
        serviceName: r.service_name,
        numberOfPeople: r.number_of_people,
        guestName: r.guest_name,
        guestPhone: r.guest_phone,
        notes: r.notes,
        status: r.status,
        rejectReason: r.reject_reason,
        createdAt: r.created_at
      };
    });
    res.json({ ok: true, reservations: normalized });
  } catch (err) {
    logger.error('get member reservations error:', err);
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reservations/:id — 예약 승인/거절
app.patch('/api/reservations/:id', async (req, res) => {
  try {
    const memberId = req.headers['x-member-id'];
    if (!memberId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    const { status, rejectReason } = req.body;
    if (!['confirmed', 'rejected', 'cancelled'].includes(status)) return res.status(400).json({ error: '올바르지 않은 상태값입니다.' });

    const reservationId = req.params.id;
    const rows = await db.query(
      USE_POSTGRES ? 'SELECT * FROM reservations WHERE reservation_id = $1' : 'SELECT * FROM reservations WHERE reservation_id = ?',
      [reservationId]
    );
    if (rows.length === 0) return res.status(404).json({ error: '예약을 찾을 수 없습니다.' });
    const rsv = rows[0];

    if (USE_POSTGRES) {
      await db.run(
        `UPDATE reservations SET status = $1, reject_reason = $2, updated_at = CURRENT_TIMESTAMP WHERE reservation_id = $3`,
        [status, rejectReason || null, reservationId]
      );
    } else {
      await db.run(
        `UPDATE reservations SET status = ?, reject_reason = ?, updated_at = datetime('now') WHERE reservation_id = ?`,
        [status, rejectReason || null, reservationId]
      );
    }

    // 상점 이름 조회
    const shopRows = await db.query(
      USE_POSTGRES ? 'SELECT name FROM shops WHERE shop_id = $1' : 'SELECT name FROM shops WHERE shop_id = ?',
      [rsv.shop_id]
    );
    const shopName = shopRows[0]?.name || '상점';

    // 고객에게 푸시 알림
    const statusLabel = status === 'confirmed' ? '확정' : status === 'rejected' ? '거절' : '취소';
    await sendPushToMember(rsv.member_id, {
      title: status === 'confirmed' ? '✅ 예약이 확정되었습니다!' : `❌ 예약이 ${statusLabel}되었습니다`,
      body: `${shopName} | ${rsv.reserved_date} ${rsv.reserved_time}${rejectReason ? '\n사유: ' + rejectReason : ''}`,
      tag: 'reservation-update',
      url: `/my?tab=activity`
    });

    res.json({ ok: true, status });
  } catch (err) {
    logger.error('update reservation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/reservations/:id — 예약 삭제
app.delete('/api/reservations/:id', async (req, res) => {
  try {
    const memberId = req.headers['x-member-id'];
    if (!memberId) return res.status(401).json({ error: '로그인이 필요합니다.' });
    const reservationId = req.params.id;
    await db.run(
      USE_POSTGRES ? 'DELETE FROM reservations WHERE reservation_id = $1' : 'DELETE FROM reservations WHERE reservation_id = ?',
      [reservationId]
    );
    res.json({ ok: true });
  } catch (err) {
    logger.error('delete reservation error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Initialize database before starting server
async function startServer() {
  try {
    await initDatabase();
    await repairRatingData();
    await syncPointLedgerSeq(); // 모든 마이그레이션 완료 후 최종 시퀀스 보정
    const httpServer = http.createServer(app);

    // ── WebRTC 시그널링 (Socket.io) ──────────────────────────────────
    const io = new SocketIOServer(httpServer, {
      cors: { origin: '*', methods: ['GET', 'POST'] },
    });

    let broadcasterId = null; // 현재 방송 중인 소켓 ID

    io.on('connection', (socket) => {
      logger.info(`[Socket.io] connected: ${socket.id}`);

      // 관리자가 방송 시작 알림
      socket.on('broadcaster', () => {
        broadcasterId = socket.id;
        socket.broadcast.emit('broadcaster-ready');
        logger.info('[Socket.io] broadcaster registered:', socket.id);
      });

      // 시청자가 방송 요청
      socket.on('watcher', () => {
        if (broadcasterId) {
          io.to(broadcasterId).emit('watcher', socket.id);
        }
      });

      // offer: broadcaster → watcher
      socket.on('offer', (watcherId, description) => {
        io.to(watcherId).emit('offer', socket.id, description);
      });

      // answer: watcher → broadcaster
      socket.on('answer', (broadcasterId, description) => {
        io.to(broadcasterId).emit('answer', socket.id, description);
      });

      // ICE candidate 교환
      socket.on('candidate', (targetId, candidate) => {
        io.to(targetId).emit('candidate', socket.id, candidate);
      });

      // 방송 종료
      socket.on('stop-broadcast', () => {
        broadcasterId = null;
        socket.broadcast.emit('broadcast-ended');
        logger.info('[Socket.io] broadcast stopped');
      });

      socket.on('disconnect', () => {
        if (socket.id === broadcasterId) {
          broadcasterId = null;
          socket.broadcast.emit('broadcast-ended');
        }
        io.emit('disconnectPeer', socket.id);
        logger.info(`[Socket.io] disconnected: ${socket.id}`);
      });
    });
    // ─────────────────────────────────────────────────────────────────

    httpServer.listen(PORT, '0.0.0.0', () => {
      logger.info(`Server listening on http://0.0.0.0:${PORT}`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
