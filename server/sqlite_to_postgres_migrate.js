#!/usr/bin/env node
/**
 * sqlite_to_postgres_migrate.js
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL = "postgres://user:pass@host:5432/smi_db"
 *   node server\sqlite_to_postgres_migrate.js --sqlite server/db.sqlite
 *
 * Notes:
 * - This script reads selected tables from a local SQLite file and inserts rows into
 *   the target PostgreSQL database pointed by DATABASE_URL (environment variable).
 * - It only creates a migration (INSERT) and uses ON CONFLICT DO NOTHING on primary key
 *   collisions where possible. It will not modify existing server source files.
 * - Tables migrated (in this order): members, shops, broadcasts, missions, schedules
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const { Client } = require('pg');

function camelToSnake(s) {
  return s.replace(/([A-Z])/g, (m) => `_${m.toLowerCase()}`);
}

function chunkArray(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function inspectSqliteAll(dbPath, table) {
  return new Promise((res, rej) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
      if (err) return rej(err);
      db.all(`SELECT * FROM ${table};`, (e, rows) => {
        db.close(() => {
          if (e) return rej(e);
          return res(rows || []);
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

async function insertBatch(client, table, rows, pgColumns) {
  if (!rows.length) return { inserted: 0 };
  // map each row to only pgColumns
  const prepared = rows.map(r => {
    const out = {};
    Object.keys(r).forEach(k => {
      const col = camelToSnake(k);
      if (pgColumns.includes(col)) out[col] = r[k];
    });
    return out;
  });

  // remove empty rows
  const nonEmpty = prepared.filter(o => Object.keys(o).length > 0);
  if (!nonEmpty.length) return { inserted: 0 };

  // Build multi-row insert in a transaction
  const cols = Object.keys(nonEmpty[0]);
  const values = [];
  const placeholders = nonEmpty.map((r, i) => {
    const vals = cols.map(c => r[c]);
    values.push(...vals);
    const base = i * cols.length;
    return `(${cols.map((_, j) => `$${base + j + 1}`).join(',')})`;
  }).join(',');

  // ON CONFLICT DO NOTHING (best-effort). Rely on DB constraints for id conflicts.
  const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES ${placeholders} ON CONFLICT DO NOTHING;`;
  try {
    await client.query('BEGIN');
    const r = await client.query(sql, values);
    await client.query('COMMIT');
    return { inserted: r.rowCount || nonEmpty.length };
  } catch (e) {
    await client.query('ROLLBACK');
    // fallback to single-row inserts (more tolerant)
    let count = 0;
    for (const rRow of nonEmpty) {
      const vals = Object.values(rRow);
      const placeholdersSingle = vals.map((_, i) => `$${i + 1}`).join(',');
      const sqlSingle = `INSERT INTO ${table} (${Object.keys(rRow).join(',')}) VALUES (${placeholdersSingle}) ON CONFLICT DO NOTHING;`;
      try {
        const rr = await client.query(sqlSingle, vals);
        if (rr && typeof rr.rowCount === 'number') count += rr.rowCount;
      } catch (e2) {
        // ignore individual row failure
      }
    }
    return { inserted: count, error: e.message };
  }
}

// Special-case members: preserve original sqlite member_id into external_id and let Postgres assign serial member_id
async function ensureMembersExternalId(client) {
  const cols = await getPgColumns(client, 'members');
  if (!cols.includes('external_id')) {
    console.log("Adding members.external_id column to Postgres (to store original SQLite member id)");
    await client.query(`ALTER TABLE members ADD COLUMN IF NOT EXISTS external_id VARCHAR;`);
    // add unique index to avoid duplicates
    await client.query(`CREATE UNIQUE INDEX IF NOT EXISTS members_external_id_idx ON members (external_id);`);
  }
}

async function buildMemberMap(client) {
  // external_id -> member_id
  const r = await client.query(`SELECT member_id, external_id FROM members WHERE external_id IS NOT NULL`);
  const map = new Map();
  for (const row of r.rows) {
    map.set(String(row.external_id), row.member_id);
  }
  return map;
}

async function migrateMembers(sqlitePath, client, batchSize = 200) {
  const rows = await inspectSqliteAll(sqlitePath, 'members');
  console.log(`Read ${rows.length} rows from SQLite table 'members'`);
  const pgCols = await getPgColumns(client, 'members');
  if (!pgCols.length) {
    console.warn(`Postgres table 'members' has no columns or does not exist in public schema; skipping.`);
    return { migrated: 0, source: rows.length };
  }

  await ensureMembersExternalId(client);

  // Prepare rows: map original sqlite member_id -> external_id column, and drop any member_id column so Postgres will assign serial
  const prepared = rows.map(r => {
    const out = {};
    Object.keys(r).forEach(k => {
      const col = camelToSnake(k);
      // store original id in external_id
      if (col === 'member_id') {
        if (pgCols.includes('external_id')) out['external_id'] = r[k];
        return;
      }
      if (pgCols.includes(col)) out[col] = r[k];
    });
    return out;
  }).filter(o => Object.keys(o).length > 0);

  // insert in chunks
  const chunks = chunkArray(prepared, batchSize);
  let totalInserted = 0;
  for (const ch of chunks) {
    const res = await insertBatch(client, 'members', ch, await getPgColumns(client, 'members'));
    totalInserted += res.inserted || 0;
  }
  return { migrated: totalInserted, source: rows.length };
}

async function migrateTableWithMemberRemap(sqlitePath, client, table, batchSize = 200, memberMap) {
  const rows = await inspectSqliteAll(sqlitePath, table);
  console.log(`Read ${rows.length} rows from SQLite table '${table}'`);
  const pgCols = await getPgColumns(client, table);
  if (!pgCols.length) {
    console.warn(`Postgres table '${table}' has no columns or does not exist in public schema; skipping.`);
    return { migrated: 0, source: rows.length };
  }

  // Convert rows, remapping member_id if needed
  const prepared = rows.map(r => {
    const out = {};
    Object.keys(r).forEach(k => {
      const col = camelToSnake(k);
      if (!pgCols.includes(col)) return;
      // remap member references
      if (col === 'member_id' && r[k] != null) {
        const key = String(r[k]);
        if (memberMap.has(key)) {
          out['member_id'] = memberMap.get(key);
        } else if (!Number.isInteger(r[k])) {
          // unknown external id -> null
          out['member_id'] = null;
        } else {
          out['member_id'] = r[k];
        }
        return;
      }
      out[col] = r[k];
    });
    return out;
  }).filter(o => Object.keys(o).length > 0);

  const chunks = chunkArray(prepared, batchSize);
  let totalInserted = 0;
  for (const ch of chunks) {
    const res = await insertBatch(client, table, ch, pgCols);
    totalInserted += res.inserted || 0;
  }
  return { migrated: totalInserted, source: rows.length };
}

async function main() {
  const argv = require('minimist')(process.argv.slice(2));
  const sqlitePath = argv.sqlite || argv.s || path.join(__dirname, 'db.sqlite');
  const tables = ['members','shops','broadcasts','missions','schedules'];

  if (!fs.existsSync(sqlitePath)) {
    console.error('SQLite file not found:', sqlitePath);
    process.exit(2);
  }

  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    console.error('Please set DATABASE_URL environment variable to target Postgres.');
    process.exit(2);
  }

  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    console.log('Connected to Postgres. Starting migration...');

    const results = {};
    // Migrate members first using special logic (store original id into external_id)
    try {
      const r = await migrateMembers(sqlitePath, client, 200);
      results['members'] = r;
      console.log(`Table members: migrated ${r.migrated}/${r.source}`);
    } catch (e) {
      console.error('Error migrating members:', e.message);
      results['members'] = { migrated: 0, source: 0, error: e.message };
    }

    // build member id map for remapping foreign keys
    const memberMap = await buildMemberMap(client);

    // migrate remaining tables using member remapping where appropriate
    for (const t of tables.filter(x => x !== 'members')) {
      try {
        const r = await migrateTableWithMemberRemap(sqlitePath, client, t, 200, memberMap);
        results[t] = r;
        console.log(`Table ${t}: migrated ${r.migrated}/${r.source}`);
      } catch (e) {
        console.error(`Error migrating ${t}:`, e.message);
        results[t] = { migrated: 0, source: 0, error: e.message };
      }
    }

    console.log('\nMigration summary:');
    console.log(JSON.stringify(results, null, 2));
    console.log('\nVerification (run on Postgres): SELECT COUNT(*) FROM members;');
    await client.end();
  } catch (e) {
    console.error('Migration failed:', e.message);
    try { await client.end(); } catch (er) {}
    process.exit(1);
  }
}

if (require.main === module) main();
