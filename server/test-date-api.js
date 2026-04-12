// API를 통한 날짜 테스트
const http = require('http');

async function apiCall(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8787,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test() {
  try {
    console.log('=== 날짜 API 테스트 시작 ===\n');
    
    const testDate = '2026-02-09';
    console.log('1. 저장할 날짜:', testDate);
    
    // 테스트 미션 생성
    const createData = {
      id: `TEST_DATE_${Date.now()}`,
      title: '날짜테스트미션',
      description: '테스트',
      points: 100,
      type: 'general',
      status: 'ACTIVE',
      startDate: testDate,
      endDate: '2026-02-15',
      regionScope: 'ALL',
      regionIds: []
    };
    
    console.log('2. API 호출 - POST /api/missions');
    console.log('   전송 데이터:', JSON.stringify(createData, null, 2));
    const createResult = await apiCall('POST', '/api/missions', createData);
    console.log('   응답:', JSON.stringify(createResult, null, 2));
    console.log('');
    
    // 미션 조회
    console.log('3. API 호출 - GET /api/missions');
    const missionsData = await apiCall('GET', '/api/missions');
    console.log('   응답 타입:', typeof missionsData);
    console.log('   응답:', JSON.stringify(missionsData).substring(0, 200));
    
    const missions = Array.isArray(missionsData) ? missionsData : (missionsData?.missions || []);
    const testMission = missions.find(m => m.missionId === createData.id || m.id === createData.id);
    
    if (testMission) {
      console.log('   찾은 미션:');
      console.log('   - missionId:', testMission.missionId);
      console.log('   - title:', testMission.title);
      console.log('   - startDate:', testMission.startDate);
      console.log('   - endDate:', testMission.endDate);
      console.log('   - typeof startDate:', typeof testMission.startDate);
      console.log('');
      console.log('4. 날짜 비교:');
      console.log('   원본 startDate:', testDate);
      console.log('   조회된 startDate:', testMission.startDate);
      console.log('   일치 여부:', testDate === testMission.startDate);
      console.log('');
      
      // 삭제
      console.log('5. 테스트 미션 삭제');
      await apiCall('DELETE', `/api/missions/${createData.id}`);
      console.log('   ✓ 삭제 완료');
    } else {
      console.log('   ❌ 미션을 찾을 수 없습니다');
    }
    
  } catch (error) {
    console.error('❌ 에러:', error.message);
    console.error(error);
  }
  
  console.log('\n=== 테스트 종료 ===');
}

test();
