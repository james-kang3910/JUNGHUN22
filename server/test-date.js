// 날짜 저장/조회 테스트
const { Pool } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

async function test() {
  try {
    console.log('=== 날짜 테스트 시작 ===\n');
    
    // 1. 테스트 데이터 저장
    const testDate = '2026-02-09';
    console.log('1. 저장할 날짜 (입력값):', testDate);
    
    await pool.query(`
      INSERT INTO missions(mission_id, title, description, points, type, status, start_date, end_date, created_at, updated_at)
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT(mission_id) DO UPDATE SET start_date=EXCLUDED.start_date, end_date=EXCLUDED.end_date
    `, [
      'TEST_DATE_MISSION',
      'Test Mission',
      'Test',
      0,
      'general',
      'ACTIVE',
      testDate,
      testDate,
      new Date().toISOString(),
      new Date().toISOString()
    ]);
    console.log('✓ DB에 저장 완료\n');
    
    // 2. DB에서 조회 (raw)
    const rawResult = await pool.query('SELECT start_date, end_date FROM missions WHERE mission_id = $1', ['TEST_DATE_MISSION']);
    const rawRow = rawResult.rows[0];
    console.log('2. DB에서 조회한 raw 데이터:');
    console.log('   start_date:', rawRow.start_date);
    console.log('   typeof start_date:', typeof rawRow.start_date);
    console.log('   start_date instanceof Date:', rawRow.start_date instanceof Date);
    console.log('');
    
    // 3. Date 객체로 받은 경우 변환 테스트
    if (rawRow.start_date instanceof Date) {
      console.log('3. Date 객체 변환 테스트:');
      console.log('   toISOString():', rawRow.start_date.toISOString());
      console.log('   toISOString().split("T")[0]:', rawRow.start_date.toISOString().split('T')[0]);
      console.log('   getDate():', rawRow.start_date.getDate());
      console.log('   getUTCDate():', rawRow.start_date.getUTCDate());
      console.log('');
    }
    
    // 4. 현재 코드 방식으로 변환
    const normalized = rawRow.start_date ? new Date(rawRow.start_date).toISOString().split('T')[0] : null;
    console.log('4. 현재 코드 변환 결과:', normalized);
    console.log('   원본과 비교:', testDate, '===', normalized, '→', testDate === normalized);
    console.log('');
    
    // 5. JSON 직렬화 테스트
    const jsonStr = JSON.stringify(rawRow);
    console.log('5. JSON 직렬화:', jsonStr);
    const parsed = JSON.parse(jsonStr);
    console.log('   파싱 후 start_date:', parsed.start_date);
    console.log('');
    
    // 6. 정리
    await pool.query('DELETE FROM missions WHERE mission_id = $1', ['TEST_DATE_MISSION']);
    console.log('✓ 테스트 데이터 삭제 완료');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    console.error(error);
  } finally {
    await pool.end();
    console.log('\n=== 테스트 종료 ===');
  }
}

test();
