#!/usr/bin/env node
/**
 * 배포 전 팀원 검증 (실제 배포 X)
 * npm run deploy:check
 */
const { execSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const isWin = process.platform === 'win32';

function run(cmd, opts = {}) {
  return spawnSync(isWin ? 'cmd.exe' : 'sh', isWin ? ['/c', cmd] : ['-c', cmd], {
    cwd: root,
    encoding: 'utf8',
    stdio: opts.silent ? 'pipe' : 'inherit',
    ...opts,
  });
}

function git(cmd) {
  try {
    return execSync(cmd, { cwd: root, encoding: 'utf8' }).trim();
  } catch {
    return '';
  }
}

const errors = [];
const warnings = [];

function fail(msg) {
  errors.push(msg);
}
function warn(msg) {
  warnings.push(msg);
}

// ── 1. 필수 파일 ──
const requiredFiles = [
  'railway.toml',
  'package.json',
  'server/index.js',
  'server/package.json',
  'server/package-lock.json',
  '.env.production.example',
  'tools/verify_deploy_build.js',
];

requiredFiles.forEach((rel) => {
  if (!fs.existsSync(path.join(root, rel))) fail(`필수 파일 없음: ${rel}`);
});

// ── 2. Git 상태 ──
const branch = git('git rev-parse --abbrev-ref HEAD') || '?';
const commit = git('git rev-parse --short HEAD') || '?';
const porcelain = git('git status --porcelain');
const dirty = !!porcelain;
const ahead = git(`git rev-list --count origin/${branch}..HEAD`) || '0';

if (branch !== '0518' && branch !== 'main') {
  warn(`현재 브랜치 '${branch}' — Railway는 보통 0518 또는 main 연동`);
}

if (dirty) {
  fail('커밋되지 않은 변경 있음 → push해도 Railway에 반영 안 됨');
  porcelain.split('\n').slice(0, 15).forEach((line) => {
    if (line.trim()) console.log('   ', line);
  });
  if (porcelain.split('\n').length > 15) console.log('    ...');
}

if (Number(ahead) > 0) {
  warn(`push 안 된 커밋 ${ahead}개 — git push origin ${branch} 필요`);
}

// 커밋하면 안 되는 파일
const badPatterns = [/\.zip$/i, /^backups\//, /^server\/uploads\//, /^\.env$/];
porcelain.split('\n').forEach((line) => {
  const file = line.replace(/^\?\?\s+|^.+\s+/g, '').trim();
  if (!file) return;
  if (badPatterns.some((re) => re.test(file.replace(/\\/g, '/')))) {
    fail(`커밋 금지 파일 포함: ${file}`);
  }
});

// ── 3. dist / 빌드 ──
const distIndex = path.join(root, 'dist', 'index.html');
const needBuild = !fs.existsSync(distIndex) || process.argv.includes('--build');

if (needBuild) {
  console.log('\n[deploy:check] production 빌드 실행...\n');
  const ci = run('npm ci');
  if (ci.status !== 0) fail('npm ci 실패');
  const sci = run('npm ci --prefix server');
  if (sci.status !== 0) fail('server npm ci 실패');
  const build = run('npm run build:production');
  if (build.status !== 0) fail('npm run build:production 실패');
}

const verify = run('npm run verify:deploy', { silent: true });
if (verify.status !== 0) {
  fail('verify:deploy 실패');
  if (verify.stdout) console.log(verify.stdout);
  if (verify.stderr) console.error(verify.stderr);
} else if (verify.stdout) {
  verify.stdout.trim().split('\n').forEach((line) => console.log(line));
}

// ── 4. Railway 환경변수 안내 ──
const envExample = path.join(root, '.env.production.example');
const requiredEnvKeys = [
  'DATABASE_URL',
  'JWT_SECRET',
  'QR_SECRET',
  'VITE_PUBLIC_SITE_URL',
  'ALLOWED_ORIGINS',
  'APP_REGION_HOST',
];

if (fs.existsSync(envExample)) {
  const text = fs.readFileSync(envExample, 'utf8');
  requiredEnvKeys.forEach((key) => {
    if (!text.includes(key)) warn(`.env.production.example에 ${key} 없음`);
  });
}

// ── 결과 ──
console.log('\n══════════════════════════════════════════════════════════');
console.log('  배포 전 검증 결과');
console.log('══════════════════════════════════════════════════════════');
console.log(`  브랜치: ${branch}  커밋: ${commit}`);
console.log(`  push 대기 커밋: ${ahead}개  미커밋: ${dirty ? '있음' : '없음'}`);

if (warnings.length) {
  console.log('\n⚠️  경고:');
  warnings.forEach((w) => console.log(`   · ${w}`));
}

if (errors.length) {
  console.log('\n❌ 배포 불가 (아래 해결 후 재실행):');
  errors.forEach((e) => console.log(`   · ${e}`));
  console.log('\n팀원 배포 순서:');
  console.log('  1. npm run deploy:check -- --build');
  console.log('  2. git add (소스만) → git commit → git push origin ' + branch);
  console.log('  3. Railway Deployments 로그에서 build 성공 확인');
  console.log('  4. https://smi.ceo/api/health 확인\n');
  process.exit(1);
}

console.log('\n✅ 로컬 검증 통과 — commit + push 후 Railway 배포 가능');
console.log('\n팀원 Railway 설정 확인:');
console.log('  · Source branch = ' + branch);
console.log('  · Variables ← .env.production.example');
console.log('  · VITE_REGION_URL_MODE=path (2차 DNS 전까지)');
console.log('  · uploads Volume 연결 여부 (이미지 유지)');
console.log('  · 배포 전 smi.ceo admin 백업 1회');
console.log('  · admin "복원"에 로컬 JSON 올리지 말 것\n');
