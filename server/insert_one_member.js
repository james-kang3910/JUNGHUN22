#!/usr/bin/env node
// Read one member row from SQLite and attempt to INSERT into Postgres public.members
// Prints the SQL attempted and full error on failure

const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');
const path = require('path');
const fs = require('fs');

function camelToSnake(s) {
  return s.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
}

function printableValue(v) {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'number') return v.toString();
  // escape single quotes
  return `'${String(v).replace(/'/g, "''")}'`;
}

async function getFirstMemberFromSqlite(dbPath) {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(dbPath)) return reject(new Error('SQLite file not found: ' + dbPath));
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return reject(err);
      db.get('SELECT * FROM members LIMIT 1;', (e, row) => {
        db.close(() => {
          if (e) return reject(e);
          if (!row) return reject(new Error('No member row found in SQLite'));
          resolve(row);
        });
      });
    });
  });
}

async function getPgColumns(client, table) {
  const sql = `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1`;
  const r = await client.query(sql, [table]);
  return r.rows.map(r => r.column_name);
}

(async function main(){
  try {
    const argv = require('minimist')(process.argv.slice(2));
    const sqlitePath = argv.sqlite || path.join(__dirname, 'db.sqlite');
    const DATABASE_URL = process.env.DATABASE_URL;
    if (!DATABASE_URL) throw new Error('Please set DATABASE_URL env var');

    const row = await getFirstMemberFromSqlite(sqlitePath);
    console.log('Read row from SQLite (keys):', Object.keys(row));

    const client = new Client({ connectionString: DATABASE_URL });
    await client.connect();
    const pgCols = await getPgColumns(client, 'members');
    if (!pgCols.length) throw new Error('Postgres table public.members not found or has no columns');

    // build insert using intersection of sqlite row mapped keys -> snake_case and pgCols
    const mapped = {};
    Object.keys(row).forEach(k => {
      const col = camelToSnake(k);
      if (pgCols.includes(col)) mapped[col] = row[k];
    });
    if (!Object.keys(mapped).length) throw new Error('No matching columns between SQLite row and Postgres members');

    const cols = Object.keys(mapped);
    const vals = cols.map(c => mapped[c]);
    const placeholders = vals.map((_, i) => `$${i+1}`).join(',');
    const paramSql = `INSERT INTO public.members (${cols.join(',')}) VALUES (${placeholders})`;

    // printable SQL with values interpolated (for debug only)
    const interpolated = `INSERT INTO public.members (${cols.join(',')}) VALUES (${vals.map(printableValue).join(',')})`;

    console.log('\n1) INSERT 시도 SQL (parameterized):');
    console.log(paramSql);
    console.log('\n1b) INSERT 시도 SQL (interpolated for display):');
    console.log(interpolated);

    try {
      const res = await client.query(paramSql, vals);
      console.log('\nInsert succeeded:', res.rowCount || 0);
    } catch (err) {
      console.error('\n2) 실패 에러 메시지 원문:');
      // print full error object
      console.error(err && err.stack ? err.stack : err);

      // simple inference
      const msg = (err && err.message) ? err.message : '';
      let cause = 'unknown';
      if (/null value in column/.test(msg)) cause = 'constraint: NOT NULL violation';
      else if (/invalid input syntax for type/.test(msg)) cause = 'type mismatch';
      else if (/column .* does not exist/.test(msg)) cause = 'column mismatch (missing column)';
      else if (/violates foreign key constraint/.test(msg)) cause = 'foreign key constraint';
      console.log('\n3) 문제 원인(추정):', cause);
    }

    await client.end();
  } catch (e) {
    console.error('Script failed:', e && e.stack ? e.stack : e);
    process.exit(1);
  }
})();
