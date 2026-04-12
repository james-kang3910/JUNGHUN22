#!/usr/bin/env node
/**
 * set_must_change_flag.js
 * Usage: node server/set_must_change_flag.js user@example.com
 * Marks the member record's must_change_password = true without touching password.
 */
const path = require('path');
try { require('dotenv').config({ path: path.resolve(process.cwd(), '.env') }); } catch (e) {}
const { Client } = require('pg');
const email = process.argv[2] || 'abc50082002@gmail.com';
async function main(){
  const DATABASE_URL = process.env.DATABASE_URL;
  if(!DATABASE_URL){ console.error('DATABASE_URL not set'); process.exit(2); }
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try{
    const r = await client.query('UPDATE members SET must_change_password = true, updated_at = now() WHERE lower(email) = lower($1) RETURNING member_id, email, must_change_password', [email]);
    if(r.rowCount===0){ console.error('No row updated'); process.exitCode=3; }
    else console.log('Updated', r.rows[0]);
  }catch(e){ console.error(e); process.exitCode=4; }
  await client.end();
}
main();
