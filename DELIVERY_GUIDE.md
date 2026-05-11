# 🚀 배포 설명서

**버전**: 2026-05-11 (QR 코드 + 음성 ON + 확인 팝업 UI 개선)

---

## 📦 배포용 파일 구성

```
dist/                          # 프론트엔드 빌드 결과물 (Vite 생성)
server/                        # 백엔드 (Express + Node.js)
  ├── index.js                 # 메인 서버 파일
  ├── package.json
  ├── package-lock.json
  ├── migrations/              # DB 마이그레이션 스크립트
  ├── uploads/                 # 이미지/파일 저장 폴더 (운영 서버에 유지)
  └── backups/                 # DB 백업 (필요시)
.env.production               # 운영 환경변수 (서버에 맞게 수정)
README.md
package.json
package-lock.json
nginx/                        # Nginx 설정 (필요시)
```

---

## 🔧 배포 전 체크리스트

### 1. 운영 서버 환경변수 설정 (.env.production)

```bash
NODE_ENV=production
PORT=8787
DATABASE_URL=postgresql://user:password@host:port/dbname
QR_SECRET=운영용_QR_시크릿
JWT_SECRET=운영용_JWT_시크릿
VITE_PUBLIC_SITE_URL=https://운영도메인  # ⭐ QR 링크 도메인
ALLOWED_ORIGINS=https://운영도메인
```

**⭐ 주의:** `VITE_PUBLIC_SITE_URL`은 실제 운영 도메인으로 설정해야 QR이 정확한 링크를 생성합니다.

---

## 📋 배포 단계

### Step 1: 운영 서버에 코드 반영

```bash
# 프론트엔드 빌드 결과 반영
cp -r dist/* /운영서버/public/

# 백엔드 코드 반영
cp -r server/* /운영서버/server/
cp package.json package-lock.json /운영서버/

# 운영 환경변수 설정
cp .env.production /운영서버/.env
# → 서버의 DATABASE_URL, JWT_SECRET, QR_SECRET 등 실제 값으로 수정

# 의존성 설치 (필요시)
cd /운영서버
npm install
cd server
npm install
cd ..
```

### Step 2: 서버 재시작

```bash
# PM2 사용 시
pm2 restart smi
pm2 save

# systemd 사용 시
systemctl restart smi

# 또는 직접 실행
node server/index.js
```

### Step 3: 배포 확인

```bash
# 헬스 체크
curl https://운영도메인/api/health

# 로그 확인
tail -f /운영서버/app.log
```

---

## ✨ 주요 변경사항 (이번 배포)

### 1. QR 코드 기능 ⭐
- 상점 상세 페이지: QR 코드 생성 + 다운로드
- 지역포털 페이지: QR 코드 생성 + 다운로드
- QR 스캔 시 해당 페이지로 자동 이동
- **도메인 설정 필수**: `.env.production`의 `VITE_PUBLIC_SITE_URL`

### 2. 영상/방송 음성 기본 ON
- 라이브 방송 진입 시: 음성 기본 ON
- 영상 진입 시: 음성 기본 ON
- 사용자가 수동으로 음소거/음량 조절 가능 (controls)

### 3. 불필요 버튼 제거
- 지역포털: "포털 열기" 버튼 삭제 (QR 다운로드만 유지)
- 상점: "링크 열기" 버튼 삭제 (QR 다운로드만 유지)

### 4. 확인 팝업 UI 개선
- 메인홈 버튼 클릭 시 사이트형 확인 팝업 표시 (문구: "메인홈으로 이동하시겠습니까?")
- 포인트 보내기/상점 결제/회원 전송 실행 시 기본 브라우저 confirm 대신 커스텀 확인 팝업 사용
- 버튼 문구 통일: "확인" / "취소"

---

## ⚠️ 주의사항

### 운영 데이터 보존 (필수)

**절대 삭제하지 말 것:**
- PostgreSQL DB의 모든 운영 데이터
  - 회원정보, 포인트, 공지, 오디션 등
  - 상점, 지역, 미션, 이벤트 등
- `server/uploads/` 폴더의 모든 이미지/파일
- DB 백업 파일

**코드만 덮어쓰기:**
- dist/ 폴더 (프론트엔드)
- server/ 폴더의 코드 (DB 마이그레이션 제외)

### DB 마이그레이션 (필요시만)

만약 새로운 테이블/컬럼이 필요한 경우:

```bash
cd /운영서버
psql $DATABASE_URL < server/migrations/새_마이그레이션.sql
```

---

## 🆘 트러블슈팅

### QR 링크가 작동 안 함
→ `.env.production`의 `VITE_PUBLIC_SITE_URL` 확인 (도메인 형식: `https://example.com`)

### 영상/방송이 재생 안 됨
→ 백엔드 API 응답 상태 확인 (network 탭 / 서버 로그)

### 포인트/공지 데이터 사라짐
→ DB 백업에서 복구 (운영 서버 관리자 문의)

---

## 📞 배포 완료 후 확인

1. 상점 상세 페이지 진입 → QR 코드 표시 확인
2. 지역포털 진입 → QR 코드 표시 확인
3. QR 코드 스캔 → 정확한 페이지로 이동 확인
4. 라이브 방송 진입 → 음성 ON 상태 확인
5. 음량 조절 가능 확인
6. 메인홈 이동 확인 팝업 표시 확인
7. 포인트/상점결제/회원전송 확인 팝업 스타일 확인

---

## 📝 체크리스트

- [ ] 백업 완료
- [ ] `.env.production` 운영 값으로 설정
- [ ] dist/ 폴더 반영 완료
- [ ] server/ 코드 반영 완료
- [ ] npm install 완료
- [ ] 서버 재시작 완료
- [ ] 헬스 체크 성공
- [ ] QR 코드 동작 확인
- [ ] 영상/방송 음성 ON 확인
- [ ] 메인홈 확인 팝업 확인
- [ ] 포인트/상점결제/회원전송 확인 팝업 확인
- [ ] 포인트/공지/회원정보 유지 확인

---

**배포 완료되면 이 파일의 체크리스트를 모두 확인했는지 최종 검증하세요.**
