// Test PATCH /api/members/:id - 회원 상태 변경 시뮬레이션
const targetMemberId = 'SU17690220411322079'; // test2
const newStatus = 'SUSPENDED';

async function testMemberStatusUpdate() {
  console.log('\n🧪 테스트 시작: 회원 상태 변경');
  console.log('Target:', targetMemberId);
  console.log('New Status:', newStatus);
  
  try {
    const response = await fetch(`http://localhost:8787/api/members/${targetMemberId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status: newStatus }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    console.log('\n✅ API Response:');
    console.log(JSON.stringify(result, null, 2));
    
    // Verify in DB
    console.log('\n🔍 DB 검증 중...');
    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for DB write
    
    const path = require('path');
    const sqlite3 = require('sqlite3').verbose();
    const db = new sqlite3.Database(path.join(__dirname, 'db.sqlite'));
    
    db.all('SELECT memberId, name, status FROM members ORDER BY memberId', [], (err, rows) => {
      if (err) {
        console.error('DB Error:', err.message);
        process.exit(1);
      }
      
      console.log('\n📊 전체 회원 상태:');
      console.table(rows);
      
      const targetRow = rows.find(r => r.memberId === targetMemberId);
      const suspendedCount = rows.filter(r => r.status === 'SUSPENDED').length;
      const activeCount = rows.filter(r => r.status === 'ACTIVE').length;
      
      console.log('\n🎯 테스트 결과:');
      console.log(`- 대상 회원 상태: ${targetRow?.status || 'NOT FOUND'}`);
      console.log(`- SUSPENDED 회원 수: ${suspendedCount}`);
      console.log(`- ACTIVE 회원 수: ${activeCount}`);
      
      if (suspendedCount === 1 && targetRow?.status === 'SUSPENDED') {
        console.log('\n✅ 성공: 1명만 정지됨 (정상 동작)');
      } else if (suspendedCount > 1) {
        console.log('\n❌ 실패: 전체 회원에게 적용됨! (버그 확인)');
      } else {
        console.log('\n⚠️  예상 밖 결과');
      }
      
      db.close();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
}

testMemberStatusUpdate();
