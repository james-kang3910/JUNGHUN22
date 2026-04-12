/**
 * 포인트 디버깅 스크립트 - point_ledger 데이터 확인
 */
require('dotenv').config();
const { Pool } = require('pg');

async function debugPoints() {
  const DATABASE_URL = process.env.DATABASE_URL;
  
  if (!DATABASE_URL) {
    console.error('❌ DATABASE_URL not configured');
    process.exit(1);
  }

  const pool = new Pool({ 
    connectionString: DATABASE_URL, 
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false } 
  });

  try {
    // 1. point_ledger 테이블 전체 조회 (최근 20개)
    console.log('\n━━━ 1. point_ledger 최근 20개 레코드 ━━━');
    const ledgerRows = await pool.query(`
      SELECT ledger_id, member_id, amount, type, description, status, created_at 
      FROM point_ledger 
      ORDER BY created_at DESC 
      LIMIT 20
    `);
    console.table(ledgerRows.rows);

    // 2. members 테이블 컬럼 확인
    console.log('\n━━━ 2. members 테이블 구조 확인 ━━━');
    const columnsResult = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'members' 
      ORDER BY ordinal_position
    `);
    console.table(columnsResult.rows);
    
    console.log('\n━━━ 2-2. members 최근 10명 ━━━');
    const membersRows = await pool.query(`
      SELECT member_id, name, phone, created_at 
      FROM members 
      ORDER BY created_at DESC
      LIMIT 10
    `);
    console.table(membersRows.rows);

    // 3. participations 테이블에서 selected된 항목 확인
    console.log('\n━━━ 3. participations 테이블 선정된 참여자 ━━━');
    const participationsRows = await pool.query(`
      SELECT participation_id, item_key, member_id, selected, selected_at, joined_at 
      FROM participations 
      WHERE selected = true 
      ORDER BY selected_at DESC NULLS LAST
      LIMIT 10
    `);
    console.table(participationsRows.rows);

    // 4. point_transactions 테이블 조회
    console.log('\n━━━ 4. point_transactions 최근 20개 ━━━');
    try {
      const txRows = await pool.query(`
        SELECT transaction_id, member_id, type, amount, balance_after, description, created_at 
        FROM point_transactions 
        ORDER BY created_at DESC 
        LIMIT 20
      `);
      console.table(txRows.rows);
    } catch (e) {
      console.log('⚠️  point_transactions 테이블 없음 또는 오류:', e.message);
    }

    // 5. 특정 회원의 포인트 조회 시뮬레이션
    console.log('\n━━━ 5. 서버 API 시뮬레이션: 특정 회원 포인트 조회 ━━━');
    const testMemberId = ledgerRows.rows[0]?.member_id;
    if (testMemberId) {
      console.log(`✅ 테스트 회원 ID: ${testMemberId} (타입: ${typeof testMemberId})`);
      
      // member_id를 문자열로 조회
      const historyStr = await pool.query(`
        SELECT ledger_id, member_id, amount, type, description, created_at 
        FROM point_ledger 
        WHERE member_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10
      `, [String(testMemberId)]);
      console.log(`\n📝 문자열 조회 (member_id = '${testMemberId}'):`);
      console.table(historyStr.rows);
      
      // member_id를 숫자로 조회 (타입 변환)
      if (!isNaN(testMemberId)) {
        const historyNum = await pool.query(`
          SELECT ledger_id, member_id, amount, type, description, created_at 
          FROM point_ledger 
          WHERE CAST(member_id AS INTEGER) = $1 
          ORDER BY created_at DESC 
          LIMIT 10
        `, [parseInt(testMemberId)]);
        console.log(`\n🔢 숫자 조회 (CAST(member_id AS INTEGER) = ${parseInt(testMemberId)}):`);
        console.table(historyNum.rows);
      }
      
      // members 테이블에서 해당 회원 조회
      const memberRow = await pool.query(`
        SELECT member_id, name, phone 
        FROM members 
        WHERE member_id = $1
      `, [parseInt(testMemberId)]);
      console.log(`\n👤 members 테이블 조회 (member_id = ${parseInt(testMemberId)}):`);
      console.table(memberRow.rows);
      
    } else {
      console.log('⚠️  point_ledger에 데이터가 없습니다.');
    }

  } catch (err) {
    console.error('❌ 디버깅 실패:', err);
  } finally {
    await pool.end();
  }
}

debugPoints();
