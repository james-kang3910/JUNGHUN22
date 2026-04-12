-- ============================================
-- PV3 완전 복원: 데이터베이스 스키마 마이그레이션
-- ============================================
-- 작성일: 2026-01-28
-- 목적: PV3의 모든 기능을 서버 DB 기반으로 복원
-- ============================================

-- ────────────────────────────────────────────
-- 1. members 테이블 확장 (지역 정보)
-- ────────────────────────────────────────────

-- SQLite용
ALTER TABLE members ADD COLUMN region TEXT;
ALTER TABLE members ADD COLUMN region_id TEXT;
ALTER TABLE members ADD COLUMN region_name TEXT;
ALTER TABLE members ADD COLUMN memo TEXT;

-- PostgreSQL용 (IF NOT EXISTS는 PostgreSQL 9.6+에서만 지원)
-- ALTER TABLE members ADD COLUMN IF NOT EXISTS region VARCHAR(100);
-- ALTER TABLE members ADD COLUMN IF NOT EXISTS region_id VARCHAR(50);
-- ALTER TABLE members ADD COLUMN IF NOT EXISTS region_name VARCHAR(100);
-- ALTER TABLE members ADD COLUMN IF NOT EXISTS memo TEXT;

-- ────────────────────────────────────────────
-- 2. notices 테이블 생성 (공지사항 시스템)
-- ────────────────────────────────────────────

-- SQLite용
CREATE TABLE IF NOT EXISTS notices (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  scope TEXT DEFAULT 'ALL', -- 'ALL', 'REGION'
  region_id TEXT,
  region_ids TEXT, -- JSON 배열 문자열
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE'
  author TEXT,
  author_id TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- PostgreSQL용
-- CREATE TABLE IF NOT EXISTS notices (
--   notice_id SERIAL PRIMARY KEY,
--   id VARCHAR(50) UNIQUE,
--   title TEXT NOT NULL,
--   content TEXT,
--   scope VARCHAR(20) DEFAULT 'ALL',
--   region_id VARCHAR(50),
--   region_ids JSONB,
--   status VARCHAR(20) DEFAULT 'ACTIVE',
--   author VARCHAR(100),
--   author_id VARCHAR(50),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_notices_scope ON notices(scope);
CREATE INDEX IF NOT EXISTS idx_notices_status ON notices(status);
CREATE INDEX IF NOT EXISTS idx_notices_region_id ON notices(region_id);

-- ────────────────────────────────────────────
-- 3. point_ledger 테이블 확장 (감사 추적)
-- ────────────────────────────────────────────

-- SQLite용
ALTER TABLE point_ledger ADD COLUMN admin_id TEXT;
ALTER TABLE point_ledger ADD COLUMN user_name TEXT;
ALTER TABLE point_ledger ADD COLUMN status TEXT DEFAULT 'active'; -- 'active', 'cancelled'

-- PostgreSQL용
-- ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS admin_id VARCHAR(50);
-- ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS user_name VARCHAR(100);
-- ALTER TABLE point_ledger ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_point_ledger_status ON point_ledger(status);
CREATE INDEX IF NOT EXISTS idx_point_ledger_admin_id ON point_ledger(admin_id);

-- ────────────────────────────────────────────
-- 4. shop_payout_requests 테이블 확장 (정산 추적)
-- ────────────────────────────────────────────

-- SQLite용
ALTER TABLE shop_payout_requests ADD COLUMN handled_at TEXT;
ALTER TABLE shop_payout_requests ADD COLUMN handled_by TEXT;
ALTER TABLE shop_payout_requests ADD COLUMN reject_reason TEXT;

-- PostgreSQL용
-- ALTER TABLE shop_payout_requests ADD COLUMN IF NOT EXISTS handled_at TIMESTAMP;
-- ALTER TABLE shop_payout_requests ADD COLUMN IF NOT EXISTS handled_by VARCHAR(50);
-- ALTER TABLE shop_payout_requests ADD COLUMN IF NOT EXISTS reject_reason TEXT;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_shop_payout_handled_by ON shop_payout_requests(handled_by);

-- ────────────────────────────────────────────
-- 5. missions 테이블 확장 (참여자 관리)
-- ────────────────────────────────────────────

-- missions 테이블이 없을 경우 생성
CREATE TABLE IF NOT EXISTS missions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  points INTEGER DEFAULT 0,
  max_participants INTEGER,
  start_date TEXT,
  end_date TEXT,
  status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'INACTIVE', 'COMPLETED'
  participants TEXT, -- JSON 배열: [{memberId, status, completedAt}]
  created_by TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

-- PostgreSQL용
-- CREATE TABLE IF NOT EXISTS missions (
--   mission_id SERIAL PRIMARY KEY,
--   id VARCHAR(50) UNIQUE,
--   title TEXT NOT NULL,
--   description TEXT,
--   points INTEGER DEFAULT 0,
--   max_participants INTEGER,
--   start_date TIMESTAMP,
--   end_date TIMESTAMP,
--   status VARCHAR(20) DEFAULT 'ACTIVE',
--   participants JSONB,
--   created_by VARCHAR(50),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_missions_status ON missions(status);
CREATE INDEX IF NOT EXISTS idx_missions_created_by ON missions(created_by);

-- ────────────────────────────────────────────
-- 6. shops 테이블 확장 (리뷰 시스템, 선택)
-- ────────────────────────────────────────────

-- SQLite용
ALTER TABLE shops ADD COLUMN thumbnail TEXT;
ALTER TABLE shops ADD COLUMN rating REAL DEFAULT 0;
ALTER TABLE shops ADD COLUMN review_count INTEGER DEFAULT 0;

-- PostgreSQL용
-- ALTER TABLE shops ADD COLUMN IF NOT EXISTS thumbnail TEXT;
-- ALTER TABLE shops ADD COLUMN IF NOT EXISTS rating REAL DEFAULT 0;
-- ALTER TABLE shops ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- ────────────────────────────────────────────
-- 7. 초기 공지사항 데이터 (샘플)
-- ────────────────────────────────────────────

INSERT OR IGNORE INTO notices (id, title, content, scope, status, author, created_at)
VALUES 
  ('notice_welcome', '서비스 오픈 안내', '안녕하세요. 지역 연합 플랫폼이 정식 오픈하였습니다.', 'ALL', 'ACTIVE', '관리자', datetime('now')),
  ('notice_seoul', '서울 지역 이벤트', '서울 지역 회원님들을 위한 특별 이벤트를 진행합니다.', 'REGION', 'ACTIVE', '관리자', datetime('now'));

-- 서울 지역 공지에 region_id 설정
UPDATE notices SET region_id = 'seoul' WHERE id = 'notice_seoul';

-- PostgreSQL용
-- INSERT INTO notices (id, title, content, scope, status, author)
-- VALUES 
--   ('notice_welcome', '서비스 오픈 안내', '안녕하세요. 지역 연합 플랫폼이 정식 오픈하였습니다.', 'ALL', 'ACTIVE', '관리자'),
--   ('notice_seoul', '서울 지역 이벤트', '서울 지역 회원님들을 위한 특별 이벤트를 진행합니다.', 'REGION', 'ACTIVE', '관리자')
-- ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 마이그레이션 완료
-- ============================================
-- 다음 단계: server/index.js에 initDatabase() 함수 업데이트
