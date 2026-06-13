#!/usr/bin/env node
/**
 * 팀원 배포 안내 (실제 배포는 하지 않음 — Railway가 Git push 후 자동 빌드)
 * 실행: npm run deploy:help
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function git(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const branch = git('git rev-parse --abbrev-ref HEAD');
const commit = git('git rev-parse --short HEAD');
const dirty = git('git status --porcelain') ? '있음 (push 전 커밋 필요)' : '없음';
const ahead = git(`git rev-list --count origin/${branch}..HEAD 2>nul`) || '?';

console.log(`
══════════════════════════════════════════════════════════
  SMI 배포 가이드 (팀원용) — smi.ceo / Railway
══════════════════════════════════════════════════════════

▶ 실운영: Railway (Git 연동 자동 빌드)
▶ 이 PC:  브랜치=${branch}  커밋=${commit || '?'}
▶ push 안 된 커밋: ${ahead}개
▶ 미커밋 변경: ${dirty}

── 배포 전 체크 ──
  1. git add / commit / push  (브랜치 ${branch} → origin)
  2. Railway 대시보드 → Service → Settings
     · Source branch = ${branch} (또는 main merge 후 main)
     · Variables: .env.production.example 참고
  3. 로컬 검증 (배포 담당자 필수):
     npm run deploy:check -- --build

── Railway가 하는 일 (railway.toml) ──
  npm ci → server npm ci → build:production → verify:deploy → npm start

── 배포 후 확인 ──
  · https://smi.ceo/api/health  → status ok
  · https://smi.ceo/view-source  → /assets/index-XXXX.js 해시 변경 확인
  · 사용자: 강력 새로고침(Ctrl+Shift+R) 또는 탭 재접속

── 주의 ──
  · GitHub Actions "Deploy to Production (Legacy VPS)" = 옛 VPS용, 수동만
  · main과 ${branch}가 다르면 Railway 브랜치 확인 필수
  · VITE_* 변수는 빌드 시 박힘 → Railway Variables 변경 후 재배포
  · 상세 절차: tools/DEPLOY_TEAM.txt
`);

if (dirty !== '없음') {
  console.log('⚠️  커밋되지 않은 파일이 있습니다. push만으로는 반영되지 않습니다.');
  console.log('   → npm run deploy:check -- --build 로 전체 검증\n');
  process.exitCode = 1;
} else {
  console.log('✅ Git working tree clean — commit 후 push 하세요.');
  console.log('   → npm run deploy:check -- --build\n');
}
