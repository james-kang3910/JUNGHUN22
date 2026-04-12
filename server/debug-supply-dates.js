// Debug: Check supply_requests dates in database
require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
  try {
    console.log('📊 Checking supply_requests table dates...\n');
    
    // 0. Check table schema first
    const schemaResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'supply_requests' 
      ORDER BY ordinal_position
    `);
    console.log('📋 supply_requests table schema:');
    schemaResult.rows.forEach(col => {
      console.log(`   ${col.column_name}: ${col.data_type}`);
    });
    console.log();
    
    // 1. Check current server time
    const serverTime = new Date();
    console.log('🕐 Current Server Time:', serverTime.toISOString());
    console.log('🕐 Server Timezone Offset:', serverTime.getTimezoneOffset(), 'minutes');
    console.log();
    
    // 2. Check PostgreSQL current time
    const pgTimeResult = await pool.query('SELECT NOW() as db_time, CURRENT_TIMESTAMP as current_ts');
    console.log('🗄️  PostgreSQL Current Time:', pgTimeResult.rows[0]);
    console.log();
    
    // 3. Check PostgreSQL timezone setting
    const tzResult = await pool.query('SHOW timezone');
    console.log('🌍 PostgreSQL Timezone:', tzResult.rows[0]);
    console.log();
    
    // 4. Check actual supply_requests data
    const requestsResult = await pool.query(`
      SELECT 
        request_id,
        requester_id,
        status,
        created_at,
        updated_at,
        completed_at,
        created_at::text as created_at_text,
        EXTRACT(EPOCH FROM created_at) as created_at_epoch,
        EXTRACT(EPOCH FROM NOW() - created_at) as seconds_ago
      FROM supply_requests 
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    
    console.log('📋 Recent supply_requests (최근 5개):');
    console.log('='.repeat(100));
    
    if (requestsResult.rows.length === 0) {
      console.log('No supply requests found.');
    } else {
      requestsResult.rows.forEach((row, idx) => {
        console.log(`\n${idx + 1}. Request ID: ${row.request_id}`);
        console.log(`   신청자 ID: ${row.requester_id}`);
        console.log(`   상태: ${row.status}`);
        console.log(`   created_at (DB): ${row.created_at}`);
        console.log(`   created_at (text): ${row.created_at_text}`);
        console.log(`   created_at (epoch): ${row.created_at_epoch}`);
        console.log(`   몇 초 전: ${Math.floor(row.seconds_ago)} seconds ago`);
        console.log(`   몇 분 전: ${Math.floor(row.seconds_ago / 60)} minutes ago`);
        
        if (row.completed_at) {
          console.log(`   completed_at: ${row.completed_at}`);
        }
        
        // JavaScript Date로 변환해서 출력
        const jsDate = new Date(row.created_at);
        console.log(`   JavaScript Date: ${jsDate.toISOString()}`);
        console.log(`   JavaScript toLocaleDateString(): ${jsDate.toLocaleDateString()}`);
        console.log(`   JavaScript toLocaleString('ko-KR'): ${jsDate.toLocaleString('ko-KR')}`);
      });
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('\n✅ Diagnosis complete');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
})();
