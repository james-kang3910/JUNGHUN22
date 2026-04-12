const http = require('http');

const API_HOST = 'localhost';
const API_PORT = 8787;

// HTTP 요청 헬퍼
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: API_HOST,
      port: API_PORT,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve(parsed);
        } catch (e) {
          resolve(body);
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function testRegionSettings() {
  console.log('=== 지역 설정 API 테스트 시작 ===\n');

  try {
    // 1. 먼저 사용 가능한 지역 목록 조회
    console.log('1. 사용 가능한 지역 조회');
    const regionsData = await makeRequest('GET', '/api/regions');
    console.log(`   응답:`, JSON.stringify(regionsData, null, 2).substring(0, 500));
    
    const regions = regionsData.regions || [];
    if (regions.length === 0) {
      console.log('   ❌ 사용 가능한 지역이 없습니다.');
      return;
    }
    
    // 테스트용 지역 ID 선택 (처음 2개)
    const testRegionIds = regions.slice(0, 2).map(r => r.id);
    console.log(`   테스트용 지역 ID: ${JSON.stringify(testRegionIds)}\n`);

    // 2. 특정 지역으로 미션 생성
    const testMissionId = `TEST_REGION_${Date.now()}`;
    console.log('2. 특정 지역으로 미션 생성');
    console.log(`   missionId: ${testMissionId}`);
    console.log(`   regionScope: SPECIFIC`);
    console.log(`   regionIds: ${JSON.stringify(testRegionIds)}`);
    
    const createData = {
      id: testMissionId,
      title: '지역테스트미션',
      description: '울산/부산 지역 미션',
      points: 200,
      type: 'general',
      status: 'ACTIVE',
      startDate: '2026-02-10',
      endDate: '2026-02-20',
      regionScope: 'SPECIFIC',
      regionIds: testRegionIds
    };
    
    const createResponse = await makeRequest('POST', '/api/missions', createData);
    console.log(`   응답:`, JSON.stringify(createResponse, null, 2));
    
    if (!createResponse.ok) {
      console.log('   ❌ 미션 생성 실패');
      return;
    }
    console.log('   ✓ 미션 생성 성공\n');

    // 3. 미션 조회하여 지역 설정 확인
    console.log('3. 생성된 미션 조회');
    const missionsResponse = await makeRequest('GET', '/api/missions');
    
    const createdMission = missionsResponse.missions.find(m => m.id === testMissionId);
    
    if (!createdMission) {
      console.log('   ❌ 생성된 미션을 찾을 수 없습니다.');
      return;
    }
    
    console.log(`   찾은 미션:`);
    console.log(`   - missionId: ${createdMission.id}`);
    console.log(`   - title: ${createdMission.title}`);
    console.log(`   - regionScope: ${createdMission.regionScope}`);
    console.log(`   - regionIds: ${JSON.stringify(createdMission.regionIds)}`);
    console.log(`   - typeof regionIds: ${typeof createdMission.regionIds}`);
    console.log(`   - Array.isArray(regionIds): ${Array.isArray(createdMission.regionIds)}\n`);

    // 4. 지역 설정 검증
    console.log('4. 지역 설정 검증:');
    console.log(`   원본 regionScope: SPECIFIC`);
    console.log(`   조회된 regionScope: ${createdMission.regionScope}`);
    console.log(`   일치 여부: ${createdMission.regionScope === 'SPECIFIC'}`);
    
    console.log(`   원본 regionIds: ${JSON.stringify(testRegionIds)}`);
    console.log(`   조회된 regionIds: ${JSON.stringify(createdMission.regionIds)}`);
    
    const regionIdsMatch = Array.isArray(createdMission.regionIds) && 
                           createdMission.regionIds.length === testRegionIds.length &&
                           testRegionIds.every(id => createdMission.regionIds.includes(id));
    console.log(`   일치 여부: ${regionIdsMatch}\n`);

    // 5. 미션 수정 - 다른 지역으로 변경
    const newRegionIds = regions.slice(1, 3).map(r => r.id); // 다른 2개 지역 선택
    console.log('5. 미션 수정 - 다른 지역으로 변경');
    console.log(`   새 regionIds: ${JSON.stringify(newRegionIds)}`);
    
    const updateData = {
      regionScope: 'SPECIFIC',
      regionIds: newRegionIds
    };
    
    const updateResponse = await makeRequest('PUT', `/api/missions/${testMissionId}`, updateData);
    console.log(`   응답:`, JSON.stringify(updateResponse, null, 2));
    
    if (!updateResponse.ok) {
      console.log('   ❌ 미션 수정 실패');
    } else {
      console.log('   ✓ 미션 수정 성공\n');
    }

    // 6. 수정된 미션 다시 조회
    console.log('6. 수정된 미션 다시 조회');
    const missionsResponse2 = await makeRequest('GET', '/api/missions');
    const updatedMission = missionsResponse2.missions.find(m => m.id === testMissionId);
    
    if (updatedMission) {
      console.log(`   수정된 regionScope: ${updatedMission.regionScope}`);
      console.log(`   수정된 regionIds: ${JSON.stringify(updatedMission.regionIds)}`);
      
      const updatedMatch = Array.isArray(updatedMission.regionIds) && 
                           updatedMission.regionIds.length === newRegionIds.length &&
                           newRegionIds.every(id => updatedMission.regionIds.includes(id));
      console.log(`   수정 반영 여부: ${updatedMatch}\n`);
    }

    // 7. 전체 지역으로 변경 테스트
    console.log('7. 전체 지역으로 변경 테스트');
    const updateToAllData = {
      regionScope: 'ALL',
      regionIds: []
    };
    
    const updateToAllResponse = await makeRequest('PUT', `/api/missions/${testMissionId}`, updateToAllData);
    console.log(`   응답:`, JSON.stringify(updateToAllResponse, null, 2));
    
    if (updateToAllResponse.ok) {
      const missionsResponse3 = await makeRequest('GET', '/api/missions');
      const allRegionMission = missionsResponse3.missions.find(m => m.id === testMissionId);
      
      console.log(`   변경된 regionScope: ${allRegionMission.regionScope}`);
      console.log(`   변경된 regionIds: ${JSON.stringify(allRegionMission.regionIds)}`);
      console.log(`   전체 지역 변경 성공: ${allRegionMission.regionScope === 'ALL'}\n`);
    }

    // 8. 테스트 미션 삭제
    console.log('8. 테스트 미션 삭제');
    const deleteData = { ids: [testMissionId] };
    await makeRequest('DELETE', '/api/missions', deleteData);
    console.log('   ✓ 삭제 완료\n');

    console.log('=== 테스트 결과 요약 ===');
    console.log(`✓ 지역 생성 테스트: ${createResponse.ok ? '성공' : '실패'}`);
    console.log(`✓ 지역 조회 테스트: ${regionIdsMatch ? '성공' : '실패'}`);
    console.log(`✓ 지역 수정 테스트: ${updateResponse.ok ? '성공' : '실패'}`);
    console.log(`✓ 전체 지역 변경 테스트: ${updateToAllResponse.ok ? '성공' : '실패'}`);

  } catch (error) {
    console.error('테스트 중 오류 발생:', error.message);
    console.error(error.stack);
  }

  console.log('\n=== 테스트 종료 ===');
}

testRegionSettings();
