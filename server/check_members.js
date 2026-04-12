// Quick DB query script
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'db.sqlite');
const db = new sqlite3.Database(dbPath);

db.all('SELECT memberId, name, email, status FROM members ORDER BY memberId', [], (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  console.log('\n📊 Current Members:');
  console.table(rows);
  
  console.log('\n🔍 Status Distribution:');
  const statusCount = rows.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  console.table(statusCount);
  
  db.close();
  process.exit(0);
});
