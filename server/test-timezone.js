// Test timezone handling
require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
  try {
    console.log('🕐 Timezone Test\n');
    console.log('='.repeat(80));
    
    // 1. Node.js 현재 시간
    const nodeNow = new Date();
    console.log('\n📍 Node.js 현재 시간:');
    console.log('   Date object:', nodeNow);
    console.log('   toISOString():', nodeNow.toISOString());
    console.log('   toLocaleString("ko-KR"):', nodeNow.toLocaleString('ko-KR'));
    console.log('   getTimezoneOffset():', nodeNow.getTimezoneOffset(), 'minutes');
    
    // 2. PostgreSQL 현재 시간
    const pgTime = await pool.query(`
      SELECT 
        NOW() as now_with_tz,
        CURRENT_TIMESTAMP as current_ts,
        LOCALTIMESTAMP as local_ts,
        NOW()::text as now_text,
        EXTRACT(TIMEZONE FROM NOW()) as tz_offset_seconds
    `);
    console.log('\n📍 PostgreSQL 현재 시간:');
    console.log('   NOW() (with timezone):', pgTime.rows[0].now_with_tz);
    console.log('   CURRENT_TIMESTAMP:', pgTime.rows[0].current_ts);
    console.log('   LOCALTIMESTAMP:', pgTime.rows[0].local_ts);
    console.log('   NOW()::text:', pgTime.rows[0].now_text);
    console.log('   Timezone offset:', pgTime.rows[0].tz_offset_seconds / 3600, 'hours');
    
    // 3. 테스트 데이터 삽입
    const testTime = new Date().toISOString();
    console.log('\n📍 테스트 INSERT:');
    console.log('   삽입할 값 (toISOString()):', testTime);
    
    await pool.query(`
      INSERT INTO supply_requests (supply_item_id, requester_id, status, created_at, updated_at)
      VALUES ('test', 'test-user', 'TEST', $1, $2)
      RETURNING request_id, created_at, created_at::text as created_text
    `, [testTime, testTime]).then(result => {
      console.log('   INSERT 결과:');
      console.log('   - request_id:', result.rows[0].request_id);
      console.log('   - created_at (객체):', result.rows[0].created_at);
      console.log('   - created_at (text):', result.rows[0].created_text);
      
      // JavaScript Date로 변환
      const jsDate = new Date(result.rows[0].created_at);
      console.log('   - JavaScript Date:', jsDate);
      console.log('   - toISOString():', jsDate.toISOString());
      console.log('   - toLocaleString("ko-KR"):', jsDate.toLocaleString('ko-KR'));
      
      // 차이 계산
      const diff = jsDate.getTime() - nodeNow.getTime();
      console.log('   - 시간 차이:', Math.round(diff / 1000), '초');
      
      // 삭제
      return pool.query('DELETE FROM supply_requests WHERE request_id = $1', [result.rows[0].request_id]);
    });
    
    // 4. 컬럼 타입 확인
    const columnInfo = await pool.query(`
      SELECT 
        column_name, 
        data_type, 
        datetime_precision,
        is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'supply_requests' 
        AND column_name IN ('created_at', 'updated_at', 'completed_at')
      ORDER BY ordinal_position
    `);
    
    console.log('\n📍 supply_requests 타임스탬프 컬럼 타입:');
    columnInfo.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}${col.datetime_precision ? `(${col.datetime_precision})` : ''}`);
    });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Test complete\n');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
})();
