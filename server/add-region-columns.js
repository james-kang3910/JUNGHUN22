// 간단한 ALTER TABLE 스크립트
// 서버 실행 시 환경변수 확인: echo $env:DATABASE_URL (PowerShell) 또는 printenv DATABASE_URL (bash)

const { Pool } = require('pg');

// PostgreSQL 연결 (로컬 기본값 사용 또는 환경변수)
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/smi';

console.log('Connecting to PostgreSQL...');
console.log('Connection:', connectionString.replace(/:[^:]*@/, ':***@'));

const pool = new Pool({
  connectionString,
  ssl: false // 로컬 개발환경
});

async function addColumns() {
  const client = await pool.connect();
  try {
    console.log('Adding region_scope and region_ids columns to missions table...');
    
    // missions 테이블에 컬럼 추가
    await client.query(`
      ALTER TABLE missions 
      ADD COLUMN IF NOT EXISTS region_scope TEXT DEFAULT 'ALL',
      ADD COLUMN IF NOT EXISTS region_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
    `);
    
    console.log('Adding region_scope and region_ids columns to events table...');
    
    // events 테이블에 컬럼 추가
    await client.query(`
      ALTER TABLE events 
      ADD COLUMN IF NOT EXISTS region_scope TEXT DEFAULT 'ALL',
      ADD COLUMN IF NOT EXISTS region_ids TEXT[] DEFAULT ARRAY[]::TEXT[]
    `);
    
    console.log('✅ Columns added successfully!');
    
    // 확인
    const missionsSchema = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'missions' 
      AND column_name IN ('region_scope', 'region_ids')
    `);
    
    const eventsSchema = await client.query(`
      SELECT column_name, data_type, column_default 
      FROM information_schema.columns 
      WHERE table_name = 'events' 
      AND column_name IN ('region_scope', 'region_ids')
    `);
    
    console.log('\nMissions table columns:');
    console.table(missionsSchema.rows);
    
    console.log('\nEvents table columns:');
    console.table(eventsSchema.rows);
    
  } catch (error) {
    console.error('Error adding columns:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addColumns().catch(console.error);
