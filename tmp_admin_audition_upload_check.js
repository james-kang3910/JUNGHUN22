const fs = require('fs');
const path = require('path');
const FormData = globalThis.FormData;
const Blob = globalThis.Blob;
(async () => {
  const filePath = path.join(process.cwd(), 'src', 'assets', 'logo.png');
  const buf = fs.readFileSync(filePath);
  const form = new FormData();
  form.append('image', new Blob([buf], { type: 'image/png' }), 'logo.png');
  const uploadRes = await fetch('http://127.0.0.1:8787/api/content-images/upload', { method: 'POST', body: form });
  const uploadText = await uploadRes.text();
  console.log('UPLOAD_STATUS', uploadRes.status, uploadText);
  const uploaded = JSON.parse(uploadText);
  const payload = {
    title: '업로드검증_' + Date.now(),
    description: 'temp',
    status: 'OPEN',
    type: 'FREE',
    published: true,
    startAt: '2026-04-14',
    endAt: '2026-04-22',
    images: [uploaded.imageUrl],
    posterUrl: uploaded.imageUrl,
    imageUrl: uploaded.imageUrl,
  };
  const createRes = await fetch('http://127.0.0.1:8787/api/auditions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const createText = await createRes.text();
  console.log('CREATE_STATUS', createRes.status, createText);
})();
