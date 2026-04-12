#!/usr/bin/env node
/**
 * set_temp_pw_for_email.js
 *
 * Usage:
 *   node server/set_temp_pw_for_email.js user@example.com
 *
 * This script:
 *  - loads DATABASE_URL from project .env
 *  - generates a random temporary password
 *  - bcrypt-hashes it
 *  - writes { email, password, hash, updatedAt } to server/tmp_admin_pw.json (local artifact)
 *  - updates members.password_hash in Postgres for the given email
 *
 * Security: The plaintext temporary password is written only to a local file under server/ and
 * is NOT printed to stdout. Retrieve it locally if needed and remove the file after use.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { Client } = require('pg');

// Load .env if present
try { require('dotenv').config({ path: path.resolve(process.cwd(), '.env') }); } catch (e) {}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('ERROR: DATABASE_URL not set in environment or .env');
  process.exit(2);
}

const email = process.argv[2] || 'abc50082002@gmail.com';

function generatePassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  let out = '';
  const b = crypto.randomBytes(len);
  for (let i = 0; i < len; i++) {
    out += chars[b[i] % chars.length];
  }
  return out;
}

async function main() {
  const pw = generatePassword(10);
  const hash = bcrypt.hashSync(pw, 10);

  const artifact = {
    email,
    password: pw,
    hash,
    updatedAt: new Date().toISOString(),
  };

  const artifactPath = path.resolve(__dirname, 'tmp_admin_pw.json');
  fs.writeFileSync(artifactPath, JSON.stringify(artifact, null, 2), { mode: 0o600 });

  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();
  try {
    const res = await client.query(
        `UPDATE members SET password_hash = $1, must_change_password = true, updated_at = now() WHERE lower(email) = lower($2) RETURNING member_id, email, role, status, must_change_password`,
        [hash, email]
      );
    if (res.rowCount === 0) {
      console.error('No member row updated. Is the email correct?');
      console.error('Artifact saved at', artifactPath);
      process.exitCode = 3;
    } else {
      console.log('SUCCESS: updated member password_hash for', res.rows[0].email);
      console.log('member_id:', res.rows[0].member_id, 'role:', res.rows[0].role, 'status:', res.rows[0].status);
      console.log('Artifact (with plaintext temp password) written to:', artifactPath);
      // NOTE: plaintext not printed to stdout for security
    }
  } catch (err) {
    console.error('DB error:', err.message || err);
    console.error('Artifact saved at', artifactPath);
    process.exitCode = 4;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
