const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

(async () => {
  try {
    console.log('=== supply_requests 테이블 스키마 ===');
    const sr = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='supply_requests' 
      AND column_name IN ('supply_item_id', 'requester_id')
    `);
    console.log(JSON.stringify(sr.rows, null, 2));
    
    console.log('\n=== supplies 테이블 스키마 ===');
    const s = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='supplies' 
      AND column_name IN ('supply_id', 'created_by')
    `);
    console.log(JSON.stringify(s.rows, null, 2));
    
    console.log('\n=== members 테이블 member_id 타입 ===');
    const m = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='members' 
      AND column_name='member_id'
    `);
    console.log(JSON.stringify(m.rows, null, 2));
    
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await pool.end();
  }
})();
