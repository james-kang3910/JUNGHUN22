/**
 * 마이그레이션 스크립트: localStorage broadcasts → Server DB
 * 
 * 사용법:
 * 1. 클라이언트에서 localStorage 데이터를 JSON 파일로 내보내기
 * 2. 이 스크립트로 서버 DB에 삽입
 * 
 * node migrations/migrate-broadcasts.js <localStorage-export.json>
 */

const fs = require('fs');
const path = require('path');

// 서버 DB 커넥션 (본 서버와 동일한 로직)
const DATABASE_URL = process.env.DATABASE_URL;
const isPostgres = DATABASE_URL && DATABASE_URL.startsWith('postgres');

let db;

if (isPostgres) {
  const { Pool } = require('pg');
  db = new Pool({ connectionString: DATABASE_URL });
  console.log('✓ PostgreSQL connection initialized');
} else {
  const Database = require('better-sqlite3');
  const dbPath = path.join(__dirname, '..', 'sumi.db');
  db = new Database(dbPath);
  console.log('✓ SQLite connection initialized:', dbPath);
}

async function migrateBroadcasts(filePath) {
  console.log('\n=== Broadcast Migration Start ===\n');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  let localStorageData;
  
  try {
    localStorageData = JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error.message);
    process.exit(1);
  }

  // localStorage 키: su_broadcast_v1
  const broadcasts = localStorageData['su_broadcast_v1'] || [];
  console.log(`📦 Found ${broadcasts.length} broadcasts in localStorage export`);

  if (broadcasts.length === 0) {
    console.log('⚠️  No broadcasts to migrate.');
    return;
  }

  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  for (const broadcast of broadcasts) {
    try {
      const {
        id,
        title,
        videoUrl,
        videoKind,
        regionId,
        isPublic,
        publishedAt,
        createdAt,
      } = broadcast;

      if (!title) {
        console.warn(`⚠️  Skipping broadcast with no title:`, broadcast);
        skipped++;
        continue;
      }

      // DB 삽입
      if (isPostgres) {
        await db.query(
          `INSERT INTO broadcasts (legacy_id, title, video_kind, video_url, region_id, is_public, published_at, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
           ON CONFLICT (legacy_id) DO NOTHING`,
          [
            id,
            title,
            videoKind || 'youtube',
            videoUrl,
            regionId || null,
            isPublic !== false, // default true
            publishedAt ? new Date(publishedAt) : null,
            createdAt ? new Date(createdAt) : new Date(),
          ]
        );
      } else {
        const stmt = db.prepare(
          `INSERT OR IGNORE INTO broadcasts (legacyId, title, videoKind, videoUrl, regionId, isPublic, publishedAt, createdAt)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
        );
        stmt.run(
          id,
          title,
          videoKind || 'youtube',
          videoUrl,
          regionId || null,
          isPublic !== false ? 1 : 0,
          publishedAt || null,
          createdAt || Date.now(),
        );
      }
      
      console.log(`✓ Inserted: ${title} (legacy_id: ${id})`);
      inserted++;
    } catch (error) {
      console.error(`❌ Error inserting broadcast:`, broadcast, error.message);
      errors++;
    }
  }

  console.log(`\n=== Migration Summary ===`);
  console.log(`✓ Inserted: ${inserted}`);
  console.log(`⚠️  Skipped: ${skipped}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n=== Migration Complete ===\n`);
}

async function migrateBroadcastComments(filePath) {
  console.log('\n=== Broadcast Comments Migration Start ===\n');

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(filePath, 'utf8');
  let localStorageData;
  
  try {
    localStorageData = JSON.parse(rawData);
  } catch (error) {
    console.error('❌ Failed to parse JSON:', error.message);
    process.exit(1);
  }

  // localStorage 키: broadcast_comments_* (broadcast id별로 여러 키)
  const commentKeys = Object.keys(localStorageData).filter(k => k.startsWith('broadcast_comments_'));
  console.log(`📦 Found ${commentKeys.length} broadcast comment keys`);

  if (commentKeys.length === 0) {
    console.log('⚠️  No comments to migrate.');
    return;
  }

  let inserted = 0;
  let errors = 0;

  for (const key of commentKeys) {
    const broadcastId = parseInt(key.replace('broadcast_comments_', ''), 10);
    const comments = localStorageData[key] || [];
    
    console.log(`📝 Migrating ${comments.length} comments for broadcast #${broadcastId}`);

    for (const comment of comments) {
      try {
        const { text, authorId, authorName, createdAt } = comment;

        if (!text) {
          console.warn(`⚠️  Skipping empty comment for broadcast #${broadcastId}`);
          continue;
        }

        // DB 삽입
        if (isPostgres) {
          await db.query(
            `INSERT INTO broadcast_comments (broadcast_id, text, author_id, author_name, created_at)
             VALUES ($1, $2, $3, $4, $5)`,
            [
              broadcastId,
              text,
              authorId || null,
              authorName || '익명',
              createdAt ? new Date(createdAt) : new Date(),
            ]
          );
        } else {
          const stmt = db.prepare(
            `INSERT INTO broadcast_comments (broadcastId, text, authorId, authorName, createdAt)
             VALUES (?, ?, ?, ?, ?)`
          );
          stmt.run(
            broadcastId,
            text,
            authorId || null,
            authorName || '익명',
            createdAt || Date.now(),
          );
        }
        
        inserted++;
      } catch (error) {
        console.error(`❌ Error inserting comment for broadcast #${broadcastId}:`, error.message);
        errors++;
      }
    }
  }

  console.log(`\n=== Comments Migration Summary ===`);
  console.log(`✓ Inserted: ${inserted}`);
  console.log(`❌ Errors: ${errors}`);
  console.log(`\n=== Migration Complete ===\n`);
}

// CLI 인터페이스
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log(`
Usage:
  node migrations/migrate-broadcasts.js <localStorage-export.json>
  
Options:
  --broadcasts-only   Migrate only broadcasts (not comments)
  --comments-only     Migrate only comments (not broadcasts)
  
Example:
  node migrations/migrate-broadcasts.js data/localStorage-backup-2026-01-26.json
  `);
  process.exit(0);
}

const filePath = path.resolve(args[0]);
const broadcastsOnly = args.includes('--broadcasts-only');
const commentsOnly = args.includes('--comments-only');

(async () => {
  try {
    if (!commentsOnly) {
      await migrateBroadcasts(filePath);
    }
    if (!broadcastsOnly) {
      await migrateBroadcastComments(filePath);
    }
    
    if (isPostgres) {
      await db.end();
    } else {
      db.close();
    }
    
    console.log('✓ Database connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
})();
