/**
 * 배포 전/시작 전 dist·서버 의존성 존재 확인
 * Railway start 직전에 실행 (npm prestart)
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const indexHtml = path.join(root, 'dist', 'index.html');
const serverPkg = path.join(root, 'server', 'node_modules', 'express');

const errors = [];

if (!fs.existsSync(indexHtml)) {
  errors.push('dist/index.html 없음 — npm run build:production 실행 필요');
}

if (!fs.existsSync(serverPkg)) {
  errors.push('server/node_modules 없음 — npm run install:server 실행 필요');
}

if (fs.existsSync(indexHtml)) {
  const html = fs.readFileSync(indexHtml, 'utf8');
  const assetMatch = html.match(/\/assets\/index-([A-Za-z0-9_-]+)\.js/);
  const swExists = fs.existsSync(path.join(root, 'dist', 'sw.js'));
  if (assetMatch) {
    console.log('[verify:deploy] dist OK — bundle:', assetMatch[0]);
  } else {
    errors.push('dist/index.html에 Vite 번들 참조 없음 — 빌드 실패 가능');
  }
  if (!swExists) {
    errors.push('dist/sw.js 없음 — PWA 빌드 확인 필요');
  }
}

if (errors.length) {
  console.error('[verify:deploy] 배포 불가:');
  errors.forEach((msg) => console.error('  -', msg));
  process.exit(1);
}

console.log('[verify:deploy] OK');
