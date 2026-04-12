const fs = require('fs');
const path = require('path');
const file = process.argv[2] || 'db.sqlite';
const p = path.isAbsolute(file) ? file : path.join(__dirname, file);
try {
  const fd = fs.openSync(p, 'r');
  const buf = Buffer.alloc(64);
  const bytes = fs.readSync(fd, buf, 0, 64, 0);
  fs.closeSync(fd);
  console.log('path:', p);
  console.log('bytesRead:', bytes);
  console.log('hex:', buf.slice(0, bytes).toString('hex'));
  console.log('ascii:', buf.slice(0, bytes).toString('ascii'));
} catch (e) {
  console.error('error:', e.message);
}
