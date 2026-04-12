#!/usr/bin/env node
/**
 * 데이터 마이그레이션 도구
 * localStorage 데이터를 서버 DB로 이전
 * 
 * 사용법:
 *   node migrate-data.js --dry-run  (미리보기)
 *   node migrate-data.js --execute  (실제 실행)
 */

const fs = require('fs');
const path = require('path');

const isDryRun = process.argv.includes('--dry-run');
const isExecute = process.argv.includes('--execute');
const inputFileArg = process.argv.find(arg => arg.startsWith('--input-file='));
const inputFile = inputFileArg ? inputFileArg.split('=')[1] : null;

if (!isDryRun && !isExecute) {
  console.log('사용법:');
  console.log('  node migrate-data.js --dry-run   # 마이그레이션 미리보기');
  console.log('  node migrate-data.js --execute   # 실제 마이그레이션 실행');
  console.log('  node migrate-data.js --execute --input-file=export-data.json  # 파일에서 데이터 로드');
  process.exit(1);
}

// ★ 마이그레이션할 데이터 키 목록
const DATA_KEYS = [
  { key: 'su_regions_v1', type: 'regions', desc: '지역 정보' },
  { key: 'su_members_v1', type: 'members', desc: '회원 정보' },
  { key: 'su_point_ledger', type: 'points', desc: '포인트 원장' },
  { key: 'su_auditions_v1', type: 'auditions', desc: '오디션' },
  { key: 'su_broadcasts_v1', type: 'broadcasts', desc: '공유방송' },
  { key: 'su_missions_v1', type: 'missions', desc: '미션' },
  { key: 'su_events_v1', type: 'events', desc: '이벤트' },
  { key: 'su_shops_v1', type: 'shops', desc: '상점' },
  { key: 'su_notices_v1', type: 'notices', desc: '공지사항' },
];

// ★ 데이터 디렉토리 (서버의 db.json 위치)
const DB_FILE = path.join(__dirname, 'db.json');
const BACKUP_DIR = path.join(__dirname, 'backups');

// ★ 백업 디렉토리 생성
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

// ★ 현재 DB 데이터 로드
function loadCurrentDB() {
  if (!fs.existsSync(DB_FILE)) {
    console.log('⚠️  db.json 파일이 없습니다. 새로 생성합니다.');
    return { regions: [], members: [], points: [], auditions: [], broadcasts: [], missions: [], events: [], shops: [], notices: [] };
  }
  try {
    const content = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('❌ db.json 파싱 오류:', err.message);
    process.exit(1);
  }
}

// ★ localStorage 데이터 로드
function loadLocalStorageData() {
  if (inputFile) {
    console.log(`📂 파일에서 데이터 로드: ${inputFile}\n`);
    try {
      const content = fs.readFileSync(inputFile, 'utf-8');
      return JSON.parse(content);
    } catch (err) {
      console.error(`❌ 파일 로드 오류: ${err.message}`);
      process.exit(1);
    }
  } else {
    console.log('⚠️  --input-file 옵션이 없습니다. 예시 데이터를 사용합니다.\n');
    console.log('💡 실제 데이터를 마이그레이션하려면:');
    console.log('   1. 브라우저에서 export-localStorage.js 실행');
    console.log('   2. 출력된 JSON을 export-data.json에 저장');
    console.log('   3. node migrate-data.js --execute --input-file=export-data.json\n');
    return getMockLocalStorageData();
  }
}

// ★ localStorage 데이터 시뮬레이션 (실제로는 브라우저에서 추출해야 함)
// 여기서는 예시 데이터 구조만 보여줍니다
function getMockLocalStorageData() {
  return {
    su_regions_v1: JSON.stringify([
      { id: 'seoul', name: '서울', isPublic: true, createdAt: new Date().toISOString() }
    ]),
    su_members_v1: JSON.stringify([
      { id: 'user1', username: 'testuser', regionId: 'seoul', status: 'ACTIVE', createdAt: new Date().toISOString() }
    ]),
    su_point_ledger: JSON.stringify([
      { id: 1, memberId: 'user1', points: 100, reason: '가입 축하', createdAt: new Date().toISOString() }
    ])
  };
}

// ★ 마이그레이션 실행
function migrate() {
  console.log('🚀 데이터 마이그레이션 시작\n');
  console.log(`모드: ${isDryRun ? '🔍 미리보기 (DRY RUN)' : '⚡ 실제 실행'}\n`);
  
  // 1. 현재 DB 백업
  const currentDB = loadCurrentDB();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = path.join(BACKUP_DIR, `db-backup-${timestamp}.json`);
  
  if (isExecute) {
    fs.writeFileSync(backupFile, JSON.stringify(currentDB, null, 2));
    console.log(`✅ 백업 완료: ${backupFile}\n`);
  }
  
  // 2. localStorage 데이터 로드
  console.log('📦 localStorage 데이터 확인 중...\n');
  
  const localData = loadLocalStorageData();
  const newDB = { ...currentDB };
  let totalMigrated = 0;
  
  // 3. 각 데이터 타입별 마이그레이션
  DATA_KEYS.forEach(({ key, type, desc }) => {
    const rawData = localData[key];
    if (!rawData) {
      console.log(`⚠️  ${desc} (${key}): 데이터 없음`);
      return;
    }
    
    try {
      const data = JSON.parse(rawData);
      const count = Array.isArray(data) ? data.length : 0;
      
      console.log(`✅ ${desc} (${type}): ${count}개 항목`);
      
      if (isExecute && Array.isArray(data)) {
        // 기존 데이터와 병합 (중복 제거)
        const existingIds = new Set((newDB[type] || []).map(item => item.id));
        const newItems = data.filter(item => !existingIds.has(item.id));
        
        newDB[type] = [...(newDB[type] || []), ...newItems];
        totalMigrated += newItems.length;
        
        console.log(`   → 새로 추가: ${newItems.length}개, 중복 제외: ${count - newItems.length}개`);
      }
    } catch (err) {
      console.error(`❌ ${desc} 파싱 오류:`, err.message);
    }
  });
  
  console.log(`\n총 ${totalMigrated}개 항목 마이그레이션\n`);
  
  // 4. 새 DB 저장
  if (isExecute) {
    fs.writeFileSync(DB_FILE, JSON.stringify(newDB, null, 2));
    console.log(`✅ db.json 업데이트 완료\n`);
    console.log('📊 마이그레이션 요약:');
    Object.entries(newDB).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        console.log(`   - ${key}: ${value.length}개`);
      }
    });
  } else {
    console.log('💡 --execute 옵션으로 실제 마이그레이션을 실행하세요.');
  }
}

// ★ 실행
try {
  migrate();
} catch (err) {
  console.error('\n❌ 마이그레이션 실패:', err.message);
  console.error(err.stack);
  process.exit(1);
}
