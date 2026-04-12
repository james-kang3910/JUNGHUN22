const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set. Set $env:DATABASE_URL in PowerShell or export in shell.');
  process.exit(2);
}

(async () => {
  const client = new Client({ connectionString: DATABASE_URL });
  try {
    await client.connect();
    const resVer = await client.query('SELECT version()');
    console.log(JSON.stringify({ ok: true, version: resVer.rows[0].version }));

    // List tables in public schema
    const tablesRes = await client.query(
      `SELECT table_schema, table_name FROM information_schema.tables
       WHERE table_type='BASE TABLE' AND table_schema NOT IN ('pg_catalog','information_schema')
       ORDER BY table_schema, table_name;`
    );
    const tables = tablesRes.rows.map(r => `${r.table_schema}.${r.table_name}`);

    // Target tables (without schema)
    const target = ['members','missions','events','schedules','shops','supplies','participations','broadcasts'];
    const counts = {};

    for (const t of target) {
      try {
        const q = await client.query(`SELECT COUNT(*)::int as c FROM ${t};`);
        counts[t] = q.rows[0].c;
      } catch (e) {
        // try public schema
        try {
          const q2 = await client.query(`SELECT COUNT(*)::int as c FROM public.${t};`);
          counts[t] = q2.rows[0].c;
        } catch (e2) {
          counts[t] = `error: ${e2.message}`;
        }
      }
    }

    // recent 5 members
    let members = [];
    try {
      const m = await client.query(`SELECT * FROM members ORDER BY created_at DESC LIMIT 5;`);
      members = m.rows;
    } catch (e) {
      try {
        const m2 = await client.query(`SELECT * FROM public.members ORDER BY created_at DESC LIMIT 5;`);
        members = m2.rows;
      } catch (e2) {
        members = `error: ${e2.message}`;
      }
    }

    console.log(JSON.stringify({ tables, counts, members }, null, 2));
    await client.end();
  } catch (err) {
    console.error(JSON.stringify({ ok: false, error: err.message }));
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
})();
