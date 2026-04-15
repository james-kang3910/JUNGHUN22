const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  const max = await c.query("SELECT COALESCE(MAX(submission_id),0) AS max_id, COUNT(*) AS cnt FROM audition_submissions");
  const seq = await c.query("SELECT pg_get_serial_sequence('audition_submissions','submission_id') AS seq");
  const seqName = seq.rows[0].seq;
  const seqState = await c.query(`SELECT last_value, is_called FROM ${seqName}`);
  console.log(JSON.stringify({ max: max.rows[0], seqName, seqState: seqState.rows[0] }, null, 2));
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
