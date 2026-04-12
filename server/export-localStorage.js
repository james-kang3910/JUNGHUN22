/**
 * 브라우저 localStorage 데이터 추출 스크립트
 * 
 * 사용법:
 * 1. 브라우저에서 F12 (개발자 도구) 열기
 * 2. Console 탭으로 이동
 * 3. 이 파일의 전체 코드를 복사해서 붙여넣기
 * 4. 출력된 JSON을 복사해서 export-data.json 파일로 저장
 * 5. 서버에서: node migrate-data.js --input-file export-data.json --execute
 */

(function exportLocalStorageData() {
  console.log('🔍 localStorage 데이터 추출 중...\n');
  
  const dataKeys = [
    'su_regions_v1',
    'su_members_v1',
    'su_point_ledger',
    'su_auditions_v1',
    'su_broadcasts_v1',
    'su_missions_v1',
    'su_events_v1',
    'su_shops_v1',
    'su_notices_v1',
  ];
  
  const exportData = {};
  let totalItems = 0;
  
  dataKeys.forEach(key => {
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        const count = Array.isArray(parsed) ? parsed.length : 0;
        exportData[key] = value;
        totalItems += count;
        console.log(`✅ ${key}: ${count}개 항목`);
      } catch (err) {
        console.warn(`⚠️  ${key}: 파싱 오류`, err.message);
      }
    } else {
      console.log(`⚠️  ${key}: 데이터 없음`);
    }
  });
  
  console.log(`\n📊 총 ${totalItems}개 항목 발견\n`);
  console.log('📋 아래 JSON을 복사하여 export-data.json 파일로 저장하세요:\n');
  console.log('======================================\n');
  console.log(JSON.stringify(exportData, null, 2));
  console.log('\n======================================\n');
  
  // 자동으로 클립보드에 복사 시도
  if (navigator.clipboard) {
    navigator.clipboard.writeText(JSON.stringify(exportData, null, 2))
      .then(() => {
        console.log('✅ 클립보드에 복사되었습니다!');
        console.log('   이제 export-data.json 파일에 붙여넣기 하세요.');
      })
      .catch(err => {
        console.log('⚠️  클립보드 복사 실패. 수동으로 복사해주세요.');
      });
  } else {
    console.log('💡 위의 JSON을 수동으로 복사하여 export-data.json에 저장하세요.');
  }
  
  return exportData;
})();
