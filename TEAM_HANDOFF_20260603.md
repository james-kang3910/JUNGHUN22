# 팀 인수인계 · 배포 준비 메모 (2026-06-03)

**브랜치:** `0518`  
**기준 커밋 이전:** `d4197ed` (오디션 참가영상 승인 잠금)  
**작성 목적:** 동료 개발자가 이어서 작업·배포할 수 있도록 변경 범위·주의사항 정리

---

## 1. 이번에 반영된 핵심 기능 (요약)

| 영역 | 내용 |
|------|------|
| **유통지원 · 품절** | `POST /api/supply-requests`에서 `soldout` / `hidden` / `deleted` / 재고 0 주문 차단 |
| **판매자 출금 지갑** | `getDistWalletSummary()` — 과거 과다지급 데이터 시 `overpaidLegacy` 로 신규 판매분만 출금 가능 |
| **관리자 출금** | `AdminPoints` / `storageAdapter.getAdminDistPayouts()` — 관리자 토큰으로 출금 목록 조회 |
| **라이브 방송** | `AdminLiveBroadcast` 카메라 미리보기·WebRTC·Socket.io(`window.location.origin`) |
| **시청** | `LiveBroadcastPlayer` — video ref 타이밍·스트림 연결 수정 |
| **포인트·결제** | QR/전송/취소 API 인증·트랜잭션 보강 (서버·프론트 일부) |
| **지역·상권·명함** | `RegionSearchModal`, `BusinessCardPreview`, `businessCardCore`, `SiteAlertModal` 등 |
| **UI 리디자인** | **적용 후 사용자 요청으로 전부 원복** — `regional-life.css`, `home-main.css`, `distribution-market.css` 삭제됨 |

---

## 2. 서버 (`server/index.js`) — 배포 시 필수

### 2.1 유통 주문 검증 (`POST /api/supply-requests`)

- `supplyId` 기준 `supplies` 테이블 조회
- 차단: `scheduled`, `soldout`, `hidden`, `deleted`, 재고 0, 수량 > 재고
- 유통 결제(`requestType=distribution`) 시 세션·포인트 차감 로직 유지

### 2.2 판매 포인트 지갑

- `GET /api/dist/wallet` — `getDistWalletSummary(sellerId)`
- `POST /api/dist/wallet/withdraw` — 동일 summary로 가용 잔액 검증
- `GET /api/admin/dist-payouts` — 관리자 출금 요청 목록

**출금가능(`available`) 계산:**

- 일반: `totalEarned - totalPending - totalPaidOut`
- `overpaidLegacy` (지급완료 > 누적판매×2): 첫 유통 판매일 이후 출금만 차감  
  → 과거 테스트/마이그레이션 과다지급 후에도 **신규 판매 대금** 출금 가능

**배포 후:** 서버 재시작 필수. 판매자는 마이오피스 → 유통지원 → 판매 포인트지갑에서 확인.

### 2.3 Socket.io / 라이브

- WebRTC 시그널링은 기존 `socket.io` 경로 사용
- Vite 프록시: `vite.config.js`의 `/socket.io` → 백엔드 (로컬·동일 origin 배포 확인)

---

## 3. 프론트 주요 변경 파일

| 파일 | 변경 요약 |
|------|-----------|
| `src/pages/admin/AdminLiveBroadcast.jsx` | 방송 시작 전 카메라 미리보기, offer/answer, DB live start/stop |
| `src/components/LiveBroadcastPlayer.jsx` | 수신 스트림 `useEffect` 연결, origin 소켓 URL |
| `src/lib/storageAdapter.js` | `getDistWallet`, `requestDistWithdraw` 세션 헤더, 관리자 출금 API |
| `src/pages/admin/AdminPoints.jsx` | 유통 판매자 출금 탭·목록 |
| `src/pages/admin/AdminDistribution.jsx` | 출금 연동·seller_name 표시 |
| `src/pages/admin/AdminMembers.jsx` | 회원 관리 보강 |
| `src/pages/admin/RegionalAdminConsole.jsx` | 지역 관리·라이브 연동 |
| `src/App.jsx` | 라우팅·가드 조정 |
| `src/pages/ShopDetail.jsx` | 상점 상세 대폭 수정 |
| `src/components/CardCreateModal.jsx` | 명함/카드 생성 UI |
| `src/components/RegionSearchModal.jsx` | **신규** 지역 검색 모달 |
| `src/components/BusinessCardPreview.jsx` | **신규** |
| `src/components/SiteAlertModal.jsx` | **신규** 공통 알림 |
| `src/lib/businessCardCore.js` | **신규** |
| `src/lib/authStore.js`, `pointStore.js` | 세션·포인트 관련 |
| `src/styles/App.css` | 전역 스타일 일부 |

**원복되어 이번 커밋 diff에 없는 UI:** `Home.jsx`, `Distribution.jsx`, `My.jsx`, `Broadcast.jsx` (마지막 UI 실험 전 상태)

---

## 4. 배포 절차 (동료용)

```bash
# 1) 브랜치
git fetch origin
git checkout 0518
git pull origin 0518

# 2) 의존성
npm install
cd server && npm install && cd ..

# 3) 환경변수 — DELIVERY_GUIDE.md / .env.production 참고
# DATABASE_URL, JWT_SECRET, VITE_API_BASE(빌드 시) 등

# 4) 프론트 빌드
npm run build

# 5) 서버 재시작 (PM2 예시)
pm2 restart smi
```

**운영 주의**

- `server/data/`, `server/uploads/`, `server/backups/` 덮어쓰지 않기
- DB 마이그레이션 필요 시 `server/migrations/` 및 `MIGRATION_GUIDE.md` 참고
- 라이브 방송: HTTPS 또는 localhost에서 카메라 권한 필요

---

## 5. 커밋에 포함하지 않은 파일 (의도적)

| 경로 | 이유 |
|------|------|
| `smi-backup-20260603.zip`, `smi-final-reference-20260511.zip` | 로컬 백업 아카이브 (용량) |
| `backups/*.zip` | 동일 |
| `tmp_check_dist_data.js` | 임시 디버그 스크립트 |

로컬 DB 스냅샷: `server/backups/database.backup.20260603-042359.db` (필요 시 수동 복사)

---

## 6. 보안·안정화 패치 (2026-06-03 추가 커밋)

| 항목 | 내용 |
|------|------|
| **requireAdmin** | 백업·출금·바우처·지역뉴스·상점승인 등 `/api/admin/*` 민감 API에 관리자 세션+role 검증 |
| **회원 API** | `POST/PUT/PATCH /api/members` 제한, 응답에서 비밀번호 필드 제거, `GET :id` 안전 컬럼만 |
| **PG 채팅** | `result.rows` → 배열 직접 사용 (채팅 목록 빈 화면 수정) |
| **유통 주문** | 품절 조회 실패 시 503, 유료 결제 잔액 검증을 트랜잭션·잠금 안으로 이동 |
| **supply PATCH** | 로그인 필수 + 신청자·보급담당·관리자만 상태 변경 |
| **관리자 UI** | `AdminContents` 배너 드래그·미리보기·공지 팝업 검증 보강 |
| **env** | `chatService`/`friendService` — `VITE_API_BASE` \|\| `VITE_API_URL` 통일 |

**배포 시:** 관리자 화면 API는 `sessionStorage.su_admin_token` (Bearer) 필수. 일반 회원 토큰만으로는 403.

---

## 7. 알려진 이슈 · 후속 작업 제안

1. **공유방송 목록 (`src/pages/broadcast/Broadcast.jsx`)**  
   `PageHeader` import 포함됨. 빈 화면 시 `videoUrl`/방송 데이터·네트워크 탭 확인.

2. **유통 쇼핑몰 UI**  
   쿠팡형 UI(`distribution-market.css`)는 원복됨. 재적용 시 별도 브랜치 권장.

3. **메인 홈 UI 리디자인**  
   `home-main.css` 실험분 삭제됨. 재작업 시 `regional-life` 디자인 시스템부터 브랜치 분리.

4. **출금 테스트**  
   `overpaidLegacy` 케이스: 누적 판매 2,000P / 지급완료 29,554P 등 — 스테이징에서 `GET /api/dist/wallet` 응답 확인.

5. **품절**  
   서버 차단은 적용됨. 마이오피스에서 `soldout` + `quantity: 0` 저장은 HEAD 기준 UI; 필요 시 `My.jsx` `handleDistributionStatus` 재적용.

---

## 8. 테스트 체크리스트 (배포 전)

- [ ] 로그인 → 마이오피스 → 유통 상품 품절 → 유통지원 상세에서 구매 불가
- [ ] 판매자 출금 요청 → 관리자 출금 탭에 노출 → 승인/지급 후 `available` 갱신
- [ ] 관리자 라이브 방송 시작 → 홈/공유방송에서 시청 (또는 LiveBroadcastPlayer)
- [ ] 포인트 QR·전송 (운영 정책 ON/OFF 반영)
- [ ] `npm run build` 성공

---

- [ ] 비로그인 `GET /api/admin/dist-payouts` → 401/403
- [ ] PostgreSQL 환경에서 채팅 메시지 목록 조회

## 9. 문의·참고 문서

- `DELIVERY_GUIDE.md` — 배포 패키지 구성
- `DEPLOYMENT_CHECKLIST.md` — 운영 체크
- `server/backups/README.md` — DB 백업/복구

문서·코드 불일치 시 **이 커밋의 `server/index.js`와 `storageAdapter.js`** 를 기준으로 한다.
