#!/usr/bin/env node
/**
 * add_must_change_column.js
 * Adds must_change_password column to members table if missing.
 */
const path = require('path');
try { require('dotenv').config({ path: path.resolve(process.cwd(), '.env') }); } catch (e) {}
const { Client } = require('pg');
async function main(){
  const DATABASE_URL = process.env.DATABASE_URL;
  if(!DATABASE_URL){ console.error('DATABASE_URL not set'); process.exit(2); }
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try{
    await client.query("ALTER TABLE members ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT false");
    console.log('OK: ensured must_change_password column exists');
  }catch(e){ console.error('ERR', e.message); process.exitCode=3; }
  await client.end();
}
main();
