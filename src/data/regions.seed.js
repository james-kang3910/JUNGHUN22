/**
 * 50개 지역 자동 생성 시드 데이터
 * - regions, missions, events, stores 모두 자동 생성
 * - regionId로 연결
 * - isRegistered: 관리자가 등록(공개)한 지역만 사용자에게 노출
 */

// ★ 관리자 모드 상수 (일반 사용자에게 노출 금지, 개발용)
export const ADMIN_MODE = false;

// ★ 시/도 리스트
export const PROVINCES = [
  "서울특별시", "경기도", "인천광역시", "부산광역시", "대구광역시",
  "대전광역시", "광주광역시", "울산광역시", "세종특별자치시",
  "강원도", "충청북도", "충청남도", "전라북도", "전라남도",
  "경상북도", "경상남도", "제주특별자치도"
];

// ★ 구/군/시 리스트 (시/도별)
export const DISTRICTS = {
  "서울특별시": ["강남구", "서초구", "송파구", "강동구", "마포구", "영등포구", "용산구", "종로구", "중구", "성동구", "광진구", "동대문구", "성북구", "강북구", "도봉구", "노원구", "은평구", "서대문구", "양천구", "강서구", "구로구", "금천구", "관악구", "동작구"],
  "경기도": ["수원시", "성남시", "고양시", "용인시", "부천시", "안산시", "안양시", "남양주시", "화성시", "평택시", "의정부시", "시흥시", "파주시", "김포시", "광명시", "광주시", "군포시", "하남시", "오산시", "이천시", "안성시", "의왕시", "양주시", "포천시", "여주시", "동두천시", "과천시", "구리시"],
  "인천광역시": ["중구", "동구", "미추홀구", "연수구", "남동구", "부평구", "계양구", "서구", "강화군", "옹진군"],
  "부산광역시": ["중구", "서구", "동구", "영도구", "부산진구", "동래구", "남구", "북구", "해운대구", "사하구", "금정구", "강서구", "연제구", "수영구", "사상구", "기장군"],
  "대구광역시": ["중구", "동구", "서구", "남구", "북구", "수성구", "달서구", "달성군"],
  "대전광역시": ["동구", "중구", "서구", "유성구", "대덕구"],
  "광주광역시": ["동구", "서구", "남구", "북구", "광산구"],
  "울산광역시": ["중구", "남구", "동구", "북구", "울주군"],
  "세종특별자치시": ["조치원읍", "연기면", "연동면", "부강면", "금남면", "장군면", "연서면", "전의면", "전동면", "소정면", "한솔동", "새롬동", "도담동", "아름동", "종촌동", "고운동", "보람동", "대평동", "소담동"],
  "강원도": ["춘천시", "원주시", "강릉시", "동해시", "태백시", "속초시", "삼척시", "홍천군", "횡성군", "영월군", "평창군", "정선군", "철원군", "화천군", "양구군", "인제군", "고성군", "양양군"],
  "충청북도": ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"],
  "충청남도": ["천안시", "공주시", "보령시", "아산시", "서산시", "논산시", "계룡시", "당진시", "금산군", "부여군", "서천군", "청양군", "홍성군", "예산군", "태안군"],
  "전라북도": ["전주시", "군산시", "익산시", "정읍시", "남원시", "김제시", "완주군", "진안군", "무주군", "장수군", "임실군", "순창군", "고창군", "부안군"],
  "전라남도": ["목포시", "여수시", "순천시", "나주시", "광양시", "담양군", "곡성군", "구례군", "고흥군", "보성군", "화순군", "장흥군", "강진군", "해남군", "영암군", "무안군", "함평군", "영광군", "장성군", "완도군", "진도군", "신안군"],
  "경상북도": ["포항시", "경주시", "김천시", "안동시", "구미시", "영주시", "영천시", "상주시", "문경시", "경산시", "군위군", "의성군", "청송군", "영양군", "영덕군", "청도군", "고령군", "성주군", "칠곡군", "예천군", "봉화군", "울진군", "울릉군"],
  "경상남도": ["창원시", "진주시", "통영시", "사천시", "김해시", "밀양시", "거제시", "양산시", "의령군", "함안군", "창녕군", "고성군", "남해군", "하동군", "산청군", "함양군", "거창군", "합천군"],
  "제주특별자치도": ["제주시", "서귀포시"]
};

// ★ 교통 옵션
const TRANSPORT_OPTIONS = [
  "지하철 1호선", "지하철 2호선", "지하철 3호선", "지하철 4호선", "지하철 5호선",
  "지하철 6호선", "지하철 7호선", "지하철 8호선", "지하철 9호선",
  "KTX역", "SRT역", "GTX-A", "GTX-B", "버스터미널", "공항버스",
  "광역버스", "간선버스", "마을버스", "BRT", "경전철",
  "수인분당선", "신분당선", "경의중앙선", "경춘선", "공항철도"
];

// ★ 관광지 이름 풀
const ATTRACTION_NAMES = [
  "중앙공원", "시민공원", "생태공원", "역사박물관", "미술관", "문화센터",
  "전통시장", "해변공원", "산책로", "호수공원", "식물원", "동물원",
  "체육공원", "청소년수련관", "도서관", "문화의거리", "벽화마을",
  "전망대", "수목원", "온천", "폭포", "해수욕장", "등산로",
  "유적지", "사찰", "성당", "교회", "향교", "서원", "고분군"
];

// ★ 축제 이름 풀
const FESTIVAL_PREFIXES = ["전국", "지역", "시민", "문화", "예술", "전통", "청년", "가족"];
const FESTIVAL_TYPES = ["축제", "페스티벌", "마켓", "박람회", "대회", "한마당", "잔치", "행사"];
const FESTIVAL_THEMES = ["꽃", "음식", "음악", "예술", "영화", "책", "맥주", "와인", "커피", "한우", "인삼", "딸기", "포도", "사과", "배", "감", "굴", "대게", "한방", "도자기", "한지", "도깨비", "등불", "불꽃"];

// ★ 미션 타입
const MISSION_TYPES = ["daily", "weekly", "special", "challenge"];
const MISSION_TITLES = [
  "지역 상점 방문하기", "리뷰 작성하기", "친구 초대하기", "이벤트 참여하기",
  "포인트 적립하기", "출석 체크하기", "설문 참여하기", "SNS 공유하기",
  "첫 구매 달성", "단골 되기", "추천인 등록", "프로필 완성하기",
  "지역 축제 참여", "환경 캠페인 참여", "봉사활동 참여", "커뮤니티 활동"
];

// ★ 이벤트 타입
const EVENT_TYPES = ["promotion", "giveaway", "competition", "community"];
const EVENT_TITLES = [
  "신규가입 이벤트", "포인트 2배 적립", "럭키드로우", "스탬프 투어",
  "얼리버드 할인", "시즌 특가", "회원 감사 이벤트", "리뷰 이벤트",
  "SNS 인증샷 이벤트", "친구추천 이벤트", "첫구매 할인", "생일 축하 이벤트"
];

// ★ 상점 카테고리
const STORE_CATEGORIES = ["food", "cafe", "life", "beauty", "health", "education", "service", "etc"];
const STORE_PREFIXES = ["행복한", "즐거운", "맛있는", "예쁜", "깨끗한", "친절한", "정성가득", "사랑가득", "건강한", "신선한", "프리미엄", "로컬", "우리동네"];
const STORE_SUFFIXES = {
  food: ["식당", "밥집", "분식", "한식당", "중식당", "일식당", "양식당", "고깃집", "횟집", "국밥집", "찌개집", "냉면집", "칼국수", "떡볶이"],
  cafe: ["카페", "커피숍", "베이커리", "디저트카페", "브런치카페", "북카페", "루프탑카페"],
  life: ["마트", "슈퍼", "편의점", "잡화점", "철물점", "문구점", "꽃집", "세탁소", "수선집"],
  beauty: ["미용실", "헤어샵", "네일샵", "피부관리", "속눈썹", "왁싱샵", "바버샵"],
  health: ["약국", "병원", "의원", "치과", "한의원", "헬스장", "필라테스", "요가원"],
  education: ["학원", "공부방", "독서실", "어학원", "피아노학원", "태권도장", "미술학원"],
  service: ["부동산", "세무사", "법무사", "인쇄소", "사진관", "수리점", "대리운전"],
  etc: ["펫샵", "동물병원", "PC방", "노래방", "당구장", "볼링장"]
};

// ★ 유틸리티 함수
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randomPick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randomPicks = (arr, min, max) => {
  const count = randomInt(min, max);
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};
const slugify = (str) => str.toLowerCase().replace(/[^a-z0-9가-힣]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

// ★ 지역 ID 생성 (영문 슬러그)
const PROVINCE_SLUG = {
  "서울특별시": "seoul", "경기도": "gyeonggi", "인천광역시": "incheon",
  "부산광역시": "busan", "대구광역시": "daegu", "대전광역시": "daejeon",
  "광주광역시": "gwangju", "울산광역시": "ulsan", "세종특별자치시": "sejong",
  "강원도": "gangwon", "충청북도": "chungbuk", "충청남도": "chungnam",
  "전라북도": "jeonbuk", "전라남도": "jeonnam", "경상북도": "gyeongbuk",
  "경상남도": "gyeongnam", "제주특별자치도": "jeju"
};

const DISTRICT_SLUG = {
  // 서울
  "강남구": "gangnam", "서초구": "seocho", "송파구": "songpa", "강동구": "gangdong",
  "마포구": "mapo", "영등포구": "yeongdeungpo", "용산구": "yongsan", "종로구": "jongno",
  "중구": "jung", "성동구": "seongdong", "광진구": "gwangjin", "동대문구": "dongdaemun",
  "성북구": "seongbuk", "강북구": "gangbuk", "도봉구": "dobong", "노원구": "nowon",
  "은평구": "eunpyeong", "서대문구": "seodaemun", "양천구": "yangcheon", "강서구": "gangseo",
  "구로구": "guro", "금천구": "geumcheon", "관악구": "gwanak", "동작구": "dongjak",
  // 경기
  "수원시": "suwon", "성남시": "seongnam", "고양시": "goyang", "용인시": "yongin",
  "부천시": "bucheon", "안산시": "ansan", "안양시": "anyang", "남양주시": "namyangju",
  "화성시": "hwaseong", "평택시": "pyeongtaek", "의정부시": "uijeongbu", "시흥시": "siheung",
  "파주시": "paju", "김포시": "gimpo", "광명시": "gwangmyeong", "광주시": "gwangju-si",
  "군포시": "gunpo", "하남시": "hanam", "오산시": "osan", "이천시": "icheon",
  "안성시": "anseong", "의왕시": "uiwang", "양주시": "yangju", "포천시": "pocheon",
  "여주시": "yeoju", "동두천시": "dongducheon", "과천시": "gwacheon", "구리시": "guri",
  // 인천
  "미추홀구": "michuhol", "연수구": "yeonsu", "남동구": "namdong", "부평구": "bupyeong",
  "계양구": "gyeyang", "서구": "seo", "강화군": "ganghwa", "옹진군": "ongjin",
  "동구": "dong",
  // 부산
  "영도구": "yeongdo", "부산진구": "busanjin", "동래구": "dongnae", "남구": "nam",
  "북구": "buk", "해운대구": "haeundae", "사하구": "saha", "금정구": "geumjeong",
  "연제구": "yeonje", "수영구": "suyeong", "사상구": "sasang", "기장군": "gijang",
  // 대구
  "수성구": "suseong", "달서구": "dalseo", "달성군": "dalseong",
  // 대전
  "유성구": "yuseong", "대덕구": "daedeok",
  // 광주
  "광산구": "gwangsan",
  // 울산
  "울주군": "ulju",
  // 세종
  "조치원읍": "jochiwon", "한솔동": "hansol", "새롬동": "saerom", "도담동": "dodam",
  // 기타
  "춘천시": "chuncheon", "원주시": "wonju", "강릉시": "gangneung", "속초시": "sokcho",
  "청주시": "cheongju", "충주시": "chungju", "천안시": "cheonan", "아산시": "asan",
  "전주시": "jeonju", "군산시": "gunsan", "익산시": "iksan", "여수시": "yeosu",
  "순천시": "suncheon", "목포시": "mokpo", "포항시": "pohang", "경주시": "gyeongju",
  "구미시": "gumi", "안동시": "andong", "창원시": "changwon", "진주시": "jinju",
  "김해시": "gimhae", "거제시": "geoje", "제주시": "jeju-si", "서귀포시": "seogwipo"
};

const getRegionSlug = (province, district, index) => {
  const pSlug = PROVINCE_SLUG[province] || slugify(province);
  let dSlug = DISTRICT_SLUG[district];
  if (!dSlug) {
    // 한글 그대로 로마자 변환 시도 (간단히 인덱스 사용)
    dSlug = `district-${index}`;
  }
  return `${pSlug}-${dSlug}`;
};

// ★ 지역 생성 함수
function createRegions(count = 50) {
  const usedIds = new Set();
  const regions = [];
  
  // 모든 시/도-구/군 조합 생성
  const allCombinations = [];
  for (const province of PROVINCES) {
    const districts = DISTRICTS[province] || [];
    for (const district of districts) {
      allCombinations.push({ province, district });
    }
  }
  
  // 셔플
  const shuffled = [...allCombinations].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < count && i < shuffled.length; i++) {
    const { province, district } = shuffled[i];
    let id = getRegionSlug(province, district, i);
    
    // 중복 방지
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${getRegionSlug(province, district, i)}-${suffix++}`;
    }
    usedIds.add(id);
    
    // 아파트 정보 (현실적 범위)
    const isMetro = ["서울특별시", "경기도", "인천광역시", "부산광역시"].includes(province);
    const householdsMin = isMetro ? 50000 : 10000;
    const householdsMax = isMetro ? 300000 : 100000;
    const households = randomInt(householdsMin, householdsMax);
    
    const priceMin = isMetro ? 4 : 2;
    const priceMax = isMetro ? 18 : 8;
    const avgPrice = (randomInt(priceMin * 10, priceMax * 10) / 10).toFixed(1);
    
    const complexNames = [`${district} 푸르지오`, `${district} 자이`, `${district} 힐스테이트`, `${district} 래미안`, `${district} 롯데캐슬`];
    
    // 교통
    const transports = randomPicks(TRANSPORT_OPTIONS, 1, 4);
    
    // 관광지
    const attractionCount = randomInt(0, 3);
    const attractions = [];
    for (let a = 0; a < attractionCount; a++) {
      attractions.push({
        name: `${district} ${randomPick(ATTRACTION_NAMES)}`,
        thumb: null
      });
    }
    
    // 축제
    const festivalCount = randomInt(0, 3);
    const festivals = [];
    for (let f = 0; f < festivalCount; f++) {
      const month = randomInt(1, 12);
      const day = randomInt(1, 28);
      festivals.push({
        title: `${randomPick(FESTIVAL_PREFIXES)} ${randomPick(FESTIVAL_THEMES)} ${randomPick(FESTIVAL_TYPES)}`,
        date: `2026-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
        place: `${district} 일원`
      });
    }

    // ★ isRegistered: 앞에서 10개만 등록(공개) 상태로 설정 (테스트용)
    const isRegistered = i < 10;
    const registeredAt = isRegistered ? `2026-01-${String(randomInt(1, 20)).padStart(2, "0")}T10:00:00Z` : null;
    
    regions.push({
      id,
      name: district,
      province,
      district, // 구/군 이름 추가 (필터링용)
      intro: `${province} ${district}의 생활 정보와 커뮤니티를 확인하세요.`,
      heroImage: null,
      apartment: {
        households: `${(households / 10000).toFixed(1)}만`,
        avgSalePrice: `${avgPrice}억`,
        topComplex: randomPick(complexNames)
      },
      households, // 숫자값 유지 (정렬/필터용)
      avgPrice: parseFloat(avgPrice), // 숫자값 유지
      complexes: complexNames, // 배열로 저장
      transports, // 교통 배열
      transport: transports, // 기존 호환성
      attractions,
      festivals,
      // ★ 관리자 등록 관련 필드
      isRegistered,      // 등록(공개) 여부
      registeredAt       // 등록 일시
    });
  }
  
  return regions;
}

// ★ 미션 생성 함수 (지역당 0~5개)
function createMissions(regions) {
  const missions = [];
  let missionId = 1;
  
  for (const region of regions) {
    const count = randomInt(0, 5);
    for (let i = 0; i < count; i++) {
      const type = randomPick(MISSION_TYPES);
      const points = type === "daily" ? randomInt(10, 50) : type === "weekly" ? randomInt(50, 200) : randomInt(100, 500);
      
      missions.push({
        id: `mission-${missionId++}`,
        regionId: region.id,
        type,
        title: randomPick(MISSION_TITLES),
        description: `${region.name} 지역에서 진행되는 미션입니다.`,
        points,
        startDate: "2026-01-01",
        endDate: type === "daily" ? null : `2026-${String(randomInt(2, 12)).padStart(2, "0")}-${String(randomInt(1, 28)).padStart(2, "0")}`,
        status: "active"
      });
    }
  }
  
  return missions;
}

// ★ 이벤트 생성 함수 (지역당 0~3개)
function createEvents(regions) {
  const events = [];
  let eventId = 1;
  
  for (const region of regions) {
    const count = randomInt(0, 3);
    for (let i = 0; i < count; i++) {
      const startMonth = randomInt(1, 10);
      const endMonth = startMonth + randomInt(1, 2);
      
      events.push({
        id: `event-${eventId++}`,
        regionId: region.id,
        type: randomPick(EVENT_TYPES),
        title: `${region.name} ${randomPick(EVENT_TITLES)}`,
        description: `${region.province} ${region.name}에서 진행되는 특별 이벤트입니다.`,
        thumbnail: null,
        startDate: `2026-${String(startMonth).padStart(2, "0")}-01`,
        endDate: `2026-${String(Math.min(endMonth, 12)).padStart(2, "0")}-${String(randomInt(20, 28)).padStart(2, "0")}`,
        status: "active"
      });
    }
  }
  
  return events;
}

// ★ 상점 생성 함수 (지역당 1~10개)
function createStores(regions) {
  const stores = [];
  let storeId = 1;
  
  for (const region of regions) {
    const count = randomInt(1, 10);
    for (let i = 0; i < count; i++) {
      const category = randomPick(STORE_CATEGORIES);
      const suffixes = STORE_SUFFIXES[category];
      const name = `${randomPick(STORE_PREFIXES)} ${randomPick(suffixes)}`;
      
      stores.push({
        id: `store-${storeId++}`,
        regionId: region.id,
        category,
        name,
        description: `${region.name}의 인기 ${category === "food" ? "맛집" : category === "cafe" ? "카페" : "상점"}입니다.`,
        address: `${region.province} ${region.name} ${randomInt(1, 999)}번지`,
        phone: `0${randomInt(2, 6)}${randomInt(1, 9)}-${randomInt(1000, 9999)}-${randomInt(1000, 9999)}`,
        rating: (randomInt(35, 50) / 10).toFixed(1),
        reviewCount: randomInt(0, 500),
        thumbnail: null,
        isPartner: Math.random() > 0.7,
        status: "approved"
      });
    }
  }
  
  return stores;
}

// ★ 데이터 생성 및 export
export const regions = createRegions(50);

// ★ 회원가입 시 최소한으로 선택할 수 있도록 보장할 필수 지역 하나 추가
// (예: 서울특별시 강남구)
const REQUIRED_REGION = {
  id: 'seoul-gangnam',
  name: '강남구',
  province: '서울특별시',
  district: '강남구',
  intro: '서울특별시 강남구의 생활 정보와 커뮤니티를 확인하세요.',
  heroImage: null,
  apartment: { households: '30.0만', avgSalePrice: '15.0억', topComplex: '강남 힐스테이트' },
  households: 300000,
  avgPrice: 15.0,
  complexes: ['강남 푸르지오','강남 자이','강남 힐스테이트'],
  transports: ['지하철 2호선','강남역'],
  transport: ['지하철 2호선','강남역'],
  attractions: [],
  festivals: [],
  isRegistered: true,
  registeredAt: '2026-01-01T10:00:00Z'
};

// 중복으로 존재하지 않으면 맨 앞에 추가하여 항상 노출되도록 보장
if (!regions.some(r => r.id === REQUIRED_REGION.id)) {
  regions.unshift(REQUIRED_REGION);
}
export const missions = createMissions(regions);
export const events = createEvents(regions);
export const stores = createStores(regions);

// ★ 헬퍼 함수들
export const getRegionById = (id) => regions.find(r => r.id === id);
export const getMissionsByRegion = (regionId) => missions.filter(m => m.regionId === regionId);
export const getEventsByRegion = (regionId) => events.filter(e => e.regionId === regionId);
export const getStoresByRegion = (regionId) => stores.filter(s => s.regionId === regionId);

// ★ 등록된 지역만 필터링 (사용자에게 노출되는 지역)
export const getRegisteredRegions = () => regions.filter(r => r.isRegistered === true);

// ★ 지역이 등록(공개)되었는지 확인
export const isRegionRegistered = (id) => {
  const region = getRegionById(id);
  return region ? region.isRegistered === true : false;
};

// ★ 통계 정보 (디버그용)
export const stats = {
  totalRegions: regions.length,
  registeredRegions: regions.filter(r => r.isRegistered).length,
  totalMissions: missions.length,
  totalEvents: events.length,
  totalStores: stores.length,
  avgMissionsPerRegion: (missions.length / regions.length).toFixed(1),
  avgEventsPerRegion: (events.length / regions.length).toFixed(1),
  avgStoresPerRegion: (stores.length / regions.length).toFixed(1),
};

console.log("[regions.seed.js] Generated:", stats);
