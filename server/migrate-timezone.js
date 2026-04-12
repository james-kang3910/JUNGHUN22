// Migrate supply_requests timestamp columns to TIMESTAMPTZ
require('dotenv').config({ path: '../.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

(async () => {
  try {
    console.log('🔄 Migrating supply_requests timestamp columns to TIMESTAMPTZ\n');
    
    // 1. Add new columns if they don't exist
    console.log('1️⃣ Adding missing columns...');
    try {
      await pool.query(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS requester_name VARCHAR(255)`);
      await pool.query(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS requester_contact VARCHAR(255)`);
      await pool.query(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1`);
      await pool.query(`ALTER TABLE supply_requests ADD COLUMN IF NOT EXISTS message TEXT`);
      console.log('   ✅ Missing columns added\n');
    } catch (e) {
      console.log('   ⚠️  Columns might already exist:', e.message, '\n');
    }
    
    // 2. Convert timestamp columns to timestamptz
    console.log('2️⃣ Converting TIMESTAMP to TIMESTAMPTZ...');
    console.log('   이 작업은 기존 데이터를 Asia/Seoul 타임존으로 해석합니다.\n');
    
    try {
      // created_at
      await pool.query(`
        ALTER TABLE supply_requests 
        ALTER COLUMN created_at TYPE TIMESTAMPTZ 
        USING created_at AT TIME ZONE 'Asia/Seoul'
      `);
      console.log('   ✅ created_at converted to TIMESTAMPTZ');
      
      // updated_at  
      await pool.query(`
        ALTER TABLE supply_requests 
        ALTER COLUMN updated_at TYPE TIMESTAMPTZ 
        USING updated_at AT TIME ZONE 'Asia/Seoul'
      `);
      console.log('   ✅ updated_at converted to TIMESTAMPTZ');
      
      // completed_at
      await pool.query(`
        ALTER TABLE supply_requests 
        ALTER COLUMN completed_at TYPE TIMESTAMPTZ 
        USING completed_at AT TIME ZONE 'Asia/Seoul'
      `);
      console.log('   ✅ completed_at converted to TIMESTAMPTZ\n');
      
    } catch (e) {
      console.error('   ❌ Migration failed:', e.message, '\n');
      throw e;
    }
    
    // 3. Verify the changes
    console.log('3️⃣ Verifying changes...');
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'supply_requests' 
        AND column_name IN ('created_at', 'updated_at', 'completed_at')
      ORDER BY ordinal_position
    `);
    
    console.log('   Timestamp columns:');
    result.rows.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type}`);
    });
    
    // 4. Test with sample data
    console.log('\n4️⃣ Testing with sample data...');
    const testResult = await pool.query(`
      SELECT 
        request_id,
        created_at,
        created_at::text as created_text
      FROM supply_requests 
      ORDER BY created_at DESC 
      LIMIT 1
    `);
    
    if (testResult.rows.length > 0) {
      const row = testResult.rows[0];
      console.log('   Latest request:');
      console.log('   - request_id:', row.request_id);
      console.log('   - created_at (JS Date):', row.created_at);
      console.log('   - created_at (text):', row.created_text);
      console.log('   - toLocaleString("ko-KR"):', new Date(row.created_at).toLocaleString('ko-KR'));
    }
    
    console.log('\n✅ Migration completed successfully!\n');
    
  } catch (error) {
    console.error('\n❌ Migration error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
})();
