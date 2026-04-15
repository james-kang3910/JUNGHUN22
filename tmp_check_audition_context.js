const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const auditions = await c.query("SELECT audition_id, title FROM auditions ORDER BY audition_id DESC LIMIT 5");
  const sessions = await c.query("SELECT session_id, member_id, expires_at FROM sessions ORDER BY expires_at DESC NULLS LAST LIMIT 5");
  console.log(JSON.stringify({ auditions: auditions.rows, sessions: sessions.rows }, null, 2));
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
