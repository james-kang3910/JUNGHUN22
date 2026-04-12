/**
 * localStorage supplies 데이터를 서버 DB로 마이그레이션
 * 
 * 사용법:
 *   node server/migrations/import_supplies_from_local.js [options]
 * 
 * 옵션:
 *   --dry-run    실제 DB 변경 없이 미리보기만
 *   --legacy-file <path>  로컬스토리지 JSON 파일 경로 (기본: ./su_supply_v1_backup.json)
 */

const fs = require('fs');
const path = require('path');

// 환경변수 또는 기본 DB 경로
const DATABASE_URL = process.env.DATABASE_URL;
const isProduction = !!DATABASE_URL;

let db;
if (isProduction) {
  // PostgreSQL
  const { Client } = require('pg');
  db = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
} else {
  // SQLite
  const sqlite3 = require('sqlite3').verbose();
  const dbPath = path.join(__dirname, '../smi.db');
  db = new sqlite3.Database(dbPath);
}

// CLI arguments
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const legacyFileIndex = args.indexOf('--legacy-file');
const legacyFile = legacyFileIndex !== -1 && args[legacyFileIndex + 1]
  ? args[legacyFileIndex + 1]
  : path.join(__dirname, '../su_supply_v1_backup.json');

console.log('=== 보급지원 데이터 마이그레이션 ===');
console.log(`DB: ${isProduction ? 'PostgreSQL' : 'SQLite'}`);
console.log(`모드: ${isDryRun ? 'DRY-RUN (미리보기)' : '실제 마이그레이션'}`);
console.log(`소스 파일: ${legacyFile}`);
console.log('');

async function migrate() {
  // 1. 파일 읽기
  if (!fs.existsSync(legacyFile)) {
    console.error(`❌ 파일을 찾을 수 없습니다: ${legacyFile}`);
    console.log('');
    console.log('사용 예시:');
    console.log('  node server/migrations/import_supplies_from_local.js --dry-run');
    console.log('  node server/migrations/import_supplies_from_local.js --legacy-file ./backup.json');
    process.exit(1);
  }

  const rawData = fs.readFileSync(legacyFile, 'utf8');
  const supplies = JSON.parse(rawData);

  if (!Array.isArray(supplies)) {
    console.error('❌ 파일 형식 오류: 배열이 아닙니다.');
    process.exit(1);
  }

  console.log(`📦 ${supplies.length}개 항목 발견`);
  console.log('');

  // 2. DB 연결
  if (isProduction) {
    await db.connect();
  }

  // 3. 데이터 변환 및 삽입
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of supplies) {
    try {
      // 필드 매핑
      const supply = {
        title: item.title || item.item || '제목 없음',
        description: item.description || item.details || '',
        quantity: item.quantity || 1,
        type: item.type || 'request', // 'request' | 'offer'
        status: item.status || 'pending',
        price: item.price || null,
        image_url: item.image || item.image_url || null,
        created_by: item.userId || item.applicantName || null,
        created_at: item.date || item.created_at || new Date().toISOString(),
        legacy_id: item.id, // 원본 ID 저장 (중복 방지용)
      };

      if (isDryRun) {
        console.log(`[DRY-RUN] ${supply.type}: ${supply.title} (legacy_id: ${supply.legacy_id})`);
        inserted++;
        continue;
      }

      // 중복 체크 (legacy_id 기준)
      const checkQuery = isProduction
        ? 'SELECT id FROM supplies WHERE legacy_id = $1 LIMIT 1'
        : 'SELECT id FROM supplies WHERE legacy_id = ? LIMIT 1';
      
      const existing = isProduction
        ? (await db.query(checkQuery, [supply.legacy_id])).rows[0]
        : await new Promise((resolve, reject) => {
            db.get(checkQuery, [supply.legacy_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
            });
          });

      if (existing) {
        console.log(`⏭️  스킵 (이미 존재): ${supply.title} (legacy_id: ${supply.legacy_id})`);
        skipped++;
        continue;
      }

      // 삽입
      const insertQuery = isProduction
        ? `INSERT INTO supplies (title, description, quantity, type, status, price, image_url, created_by, created_at, legacy_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`
        : `INSERT INTO supplies (title, description, quantity, type, status, price, image_url, created_by, created_at, legacy_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      const params = [
        supply.title,
        supply.description,
        supply.quantity,
        supply.type,
        supply.status,
        supply.price,
        supply.image_url,
        supply.created_by,
        supply.created_at,
        supply.legacy_id,
      ];

      if (isProduction) {
        await db.query(insertQuery, params);
      } else {
        await new Promise((resolve, reject) => {
          db.run(insertQuery, params, (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
      }

      console.log(`✅ 삽입: ${supply.type} - ${supply.title}`);
      inserted++;
    } catch (err) {
      console.error(`❌ 오류 (${item.id}): ${err.message}`);
      errors++;
    }
  }

  // 4. 연결 종료
  if (isProduction) {
    await db.end();
  } else {
    db.close();
  }

  // 5. 결과 출력
  console.log('');
  console.log('=== 마이그레이션 완료 ===');
  console.log(`✅ 삽입: ${inserted}개`);
  console.log(`⏭️  스킵: ${skipped}개`);
  console.log(`❌ 오류: ${errors}개`);
  
  if (isDryRun) {
    console.log('');
    console.log('💡 DRY-RUN 모드입니다. 실제 DB는 변경되지 않았습니다.');
    console.log('   실제 마이그레이션을 하려면 --dry-run 옵션을 제거하세요.');
  }
}

migrate().catch((err) => {
  console.error('❌ 마이그레이션 실패:', err);
  process.exit(1);
});
