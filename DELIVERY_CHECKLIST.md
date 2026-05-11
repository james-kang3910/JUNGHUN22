# 📦 배포용 파일 전달 체크리스트

**배포 대상**: 운영 서버
**버전**: 2026-05-11
**주요 기능**: QR 코드 + 음성 기본 ON + 확인 팝업 UI 개선

---

## ✅ 전달할 파일/폴더

```
smi-release-20260511/
├── dist/                          ⭐ 프론트엔드 빌드 (정적 파일)
│   ├── index.html
│   ├── assets/
│   ├── manifest.webmanifest
│   └── sw.js (PWA 서비스 워커)
│
├── server/                        ⭐ 백엔드 코드
│   ├── index.js
│   ├── logger.js
│   ├── migrations/                (DB 마이그레이션, 필요시만 실행)
│   ├── uploads/                   (이미지/파일 - 기존 파일 유지)
│   ├── backups/                   (DB 백업 - 필수 유지)
│   ├── package.json
│   └── package-lock.json
│
├── public/                        (PWA 정적 파일)
│   ├── manifest.webmanifest
│   ├── privacy.html
│   ├── terms.html
│   └── sw.js
│
├── nginx/                         (Nginx 설정, 필요시)
│   └── smi.ceo.conf
│
├── package.json                   (루트 의존성)
├── package-lock.json
│
├── .env.production                ⭐ 운영 환경변수 (서버에서 수정)
├── .env.production.example        (환경변수 예시)
│
├── DELIVERY_GUIDE.md              📋 배포 설명서 (이 파일을 읽고 진행하세요)
├── DEPLOYMENT_CHECKLIST.md        (배포 체크리스트)
├── README.md
└── package-lock.json
```

---

## 🚀 배포 절차 (운영 팀용)

### 1️⃣ 파일 압축 후 전달
```bash
zip -r smi-release-20260511.zip smi-release-20260511/
```

### 2️⃣ 운영 서버에 업로드 및 복구
```bash
unzip smi-release-20260511.zip
cd smi-release-20260511

# .env.production 수정 (운영 데이터베이스 정보 입력)
cp .env.production.example .env.production
# → DATABASE_URL, QR_SECRET, JWT_SECRET 등 수정

# 의존성 설치
npm install
cd server && npm install && cd ..

# 프론트엔드 정적 파일 웹서버에 반영
cp -r dist/* /웹서버경로/

# 백엔드 시작
npm start
```

### 3️⃣ 배포 확인
```bash
# QR 코드 확인
curl https://도메인/api/shops/1

# 라이브 방송 확인
curl https://도메인/api/broadcasts

# 포인트/회원 유지 확인
curl https://도메인/api/members
```

---

## 📌 중요 파일 설명

| 파일 | 용도 | 수정 필요? |
|------|------|-----------|
| `dist/` | 프론트엔드 빌드 결과 (정적 HTML/CSS/JS) | ❌ 그대로 사용 |
| `server/` | Express 백엔드 API 코드 | ❌ 그대로 사용 |
| `.env.production` | 운영 환경변수 | ✅ **필수 수정** |
| `server/uploads/` | 운영 이미지/파일 (기존 유지) | ⚠️ 건드리지 않기 |
| `server/backups/` | DB 백업 (운영 데이터 안전) | ⚠️ 건드리지 않기 |

---

## ⭐ 핵심 체크포인트

### QR 코드 동작
- [ ] `.env.production`에 `VITE_PUBLIC_SITE_URL=https://운영도메인` 설정
- [ ] 상점 상세 페이지에 QR 코드 표시됨
- [ ] 지역포털에 QR 코드 표시됨
- [ ] QR 스캔 시 정확한 페이지로 이동

### 영상/방송
- [ ] 라이브 방송 진입 시 음성 ON (기본)
- [ ] 사용자가 수동으로 음소거 가능 (controls 표시)
- [ ] 홈 영상도 음성 ON

### 확인 팝업
- [ ] 메인홈 클릭 시 "메인홈으로 이동하시겠습니까?" 팝업 표시
- [ ] 포인트 보내기 실행 전 커스텀 확인 팝업 표시
- [ ] 상점 결제 실행 전 커스텀 확인 팝업 표시
- [ ] 회원 전송 실행 전 커스텀 확인 팝업 표시
- [ ] 팝업 버튼 문구 "확인" / "취소" 확인

### 운영 데이터
- [ ] 기존 회원정보 유지 ✓
- [ ] 기존 포인트 데이터 유지 ✓
- [ ] 기존 공지 유지 ✓
- [ ] 기존 오디션 유지 ✓
- [ ] 기존 이미지 유지 ✓

---

## 🆘 배포 중 문제 발생

### 문제: QR 링크가 틀렸음
**원인**: `VITE_PUBLIC_SITE_URL`이 잘못된 도메인  
**해결**: 
```bash
# .env.production 수정
VITE_PUBLIC_SITE_URL=https://정확한도메인
# 백엔드 재시작
npm start
```

### 문제: 데이터가 사라짐
**원인**: DB 덮어쓰기 또는 백업 누락  
**해결**:
```bash
# 즉시 백업 파일에서 복구
psql $DATABASE_URL < server/backups/latest.sql
```

### 문제: 영상이 재생 안 됨
**원인**: 백엔드 API 오류 또는 네트워크  
**해결**:
```bash
# 서버 로그 확인
tail -f server/server.log
# API 응답 확인
curl -v https://도메인/api/broadcasts
```

---

## 📞 전달 완료 후

1. **코드 전달**: 이 파일을 운영 팀에 넘기고 DELIVERY_GUIDE.md 참고하도록 안내
2. **환경변수 확인**: 운영 팀이 `.env.production` 수정 완료 확인
3. **배포 실행**: 운영 팀이 배포 절차 진행
4. **최종 테스트**: 
   - QR 코드 생성 및 스캔 테스트
   - 영상/방송 음성 ON 테스트
   - 기존 회원/포인트/공지 데이터 확인

---

**배포 완료 후 이 체크리스트를 운영 팀과 공유하세요.**
