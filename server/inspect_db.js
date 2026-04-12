const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

const arg = process.argv[2];
if (!arg) {
  console.error('Usage: node inspect_db.js <db-file-path>');
  process.exit(2);
}

const DB_PATH = path.isAbsolute(arg) ? arg : path.join(__dirname, arg);
const out = { db_path: DB_PATH, is_sqlite: false, tables: [], counts: {}, members_last5: [], error: null };

try {
  if (!fs.existsSync(DB_PATH)) throw new Error('DB file not found: ' + DB_PATH);
  const fd = fs.openSync(DB_PATH, 'r');
  const headerBuf = Buffer.alloc(16);
  fs.readSync(fd, headerBuf, 0, 16, 0);
  fs.closeSync(fd);
  // Properly check full 16-byte SQLite header
  out.is_sqlite = headerBuf.toString('ascii', 0, 16) === 'SQLite format 3\u0000';

  if (!out.is_sqlite) {
    console.log(JSON.stringify(out, null, 2));
    process.exit(0);
  }

  const db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READONLY, (err) => {
    if (err) {
      out.error = err.message;
      console.log(JSON.stringify(out, null, 2));
      process.exit(0);
    }

    db.all("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;", (err, rows) => {
      if (err) {
        out.error = err.message;
        console.log(JSON.stringify(out, null, 2));
        db.close();
        return;
      }
      out.tables = rows.map(r => r.name);

      const targetTables = ['members','missions','events','schedules','shops','supplies','participations','broadcasts'];
      let pending = targetTables.length;

      targetTables.forEach(t => {
        if (!out.tables.includes(t)) {
          out.counts[t] = 0;
          if (--pending === 0) fetchMembers();
          return;
        }
        db.get(`SELECT COUNT(*) as c FROM ${t};`, (err, r) => {
          out.counts[t] = err ? ("error: " + err.message) : (r && r.c != null ? r.c : 0);
          if (--pending === 0) fetchMembers();
        });
      });

      function fetchMembers() {
        if (!out.tables.includes('members')) {
          console.log(JSON.stringify(out, null, 2));
          db.close();
          return;
        }
        // try createdAt then created_at
        db.all("SELECT * FROM members ORDER BY createdAt DESC LIMIT 5;", (err, rows) => {
          if (!err) {
            out.members_last5 = rows;
            console.log(JSON.stringify(out, null, 2));
            db.close();
            return;
          }
          db.all("SELECT * FROM members ORDER BY created_at DESC LIMIT 5;", (err2, rows2) => {
            if (!err2) out.members_last5 = rows2;
            else out.members_last5 = "error: " + (err.message || err2.message);
            console.log(JSON.stringify(out, null, 2));
            db.close();
          });
        });
      }
    });
  });
} catch (e) {
  out.error = e.message;
  console.log(JSON.stringify(out, null, 2));
}
