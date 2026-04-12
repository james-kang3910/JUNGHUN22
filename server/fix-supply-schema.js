const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false
});

(async () => {
  try {
    console.log('=== supply_requests.supply_item_id 타입 변경: INTEGER → TEXT ===\n');
    
    // 1. Foreign Key 제약 삭제
    console.log('1. Foreign Key 제약 삭제...');
    await pool.query(`
      ALTER TABLE supply_requests 
      DROP CONSTRAINT IF EXISTS supply_requests_supply_item_id_fkey
    `);
    console.log('✅ FK 제약 삭제 완료\n');
    
    // 2. supply_item_id 타입 변경
    console.log('2. supply_item_id 타입 변경...');
    await pool.query(`
      ALTER TABLE supply_requests 
      ALTER COLUMN supply_item_id TYPE TEXT USING supply_item_id::TEXT
    `);
    console.log('✅ supply_item_id 타입 변경 완료\n');
    
    // 2. 확인
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name='supply_requests' 
      AND column_name='supply_item_id'
    `);
    
    console.log('변경 후 스키마:');
    console.log(JSON.stringify(result.rows, null, 2));
    
  } catch (e) {
    console.error('Error:', e.message);
    console.error(e);
  } finally {
    await pool.end();
  }
})();
