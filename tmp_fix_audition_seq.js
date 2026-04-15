const { Client } = require('pg');
(async () => {
  const c = new Client({ connectionString: process.env.DATABASE_URL });
  await c.connect();
  await c.query("SELECT setval('audition_submissions_submission_id_seq', GREATEST((SELECT COALESCE(MAX(submission_id),1) FROM audition_submissions), 1))");
  await c.query("SELECT setval('audition_votes_vote_id_seq', GREATEST((SELECT COALESCE(MAX(vote_id),1) FROM audition_votes), 1))");
  await c.query("SELECT setval('audition_submission_comments_comment_id_seq', GREATEST((SELECT COALESCE(MAX(comment_id),1) FROM audition_submission_comments), 1))");
  const rows = await c.query("SELECT (SELECT last_value FROM audition_submissions_submission_id_seq) AS submission_seq, (SELECT COALESCE(MAX(submission_id),0) FROM audition_submissions) AS submission_max, (SELECT last_value FROM audition_votes_vote_id_seq) AS vote_seq, (SELECT last_value FROM audition_submission_comments_comment_id_seq) AS comment_seq");
  console.log(JSON.stringify(rows.rows[0], null, 2));
  await c.end();
})().catch(err => { console.error(err); process.exit(1); });
