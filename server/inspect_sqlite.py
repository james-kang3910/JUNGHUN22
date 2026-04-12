import sqlite3
import json
import sys
from pathlib import Path

DB_PATH = Path(__file__).parent / 'database.backup.2026-01-29T19-06-44.db'
output = {
    'db_path': str(DB_PATH),
    'is_sqlite': False,
    'tables': [],
    'counts': {},
    'members_last5': [],
    'error': None
}

try:
    if not DB_PATH.exists():
        raise FileNotFoundError(f"DB file not found: {DB_PATH}")

    # Quick header check
    with open(DB_PATH, 'rb') as f:
        header = f.read(16)
    output['is_sqlite'] = header.startswith(b'SQLite format 3\x00')

    if not output['is_sqlite']:
        print(json.dumps(output))
        sys.exit(0)

    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;")
    tables = [r[0] for r in cur.fetchall()]
    output['tables'] = tables

    target_tables = ['members','missions','events','schedules','shops','supplies','participations','broadcasts']
    for t in target_tables:
        if t in tables:
            try:
                cur.execute(f"SELECT COUNT(*) as c FROM {t};")
                output['counts'][t] = cur.fetchone()['c']
            except Exception as e:
                output['counts'][t] = f"error: {e}"
        else:
            output['counts'][t] = 0

    if 'members' in tables:
        try:
            cur.execute("SELECT * FROM members ORDER BY createdAt DESC LIMIT 5;")
            rows = [dict(r) for r in cur.fetchall()]
            output['members_last5'] = rows
        except Exception:
            # try alternate column name
            try:
                cur.execute("SELECT * FROM members ORDER BY created_at DESC LIMIT 5;")
                rows = [dict(r) for r in cur.fetchall()]
                output['members_last5'] = rows
            except Exception as e:
                output['members_last5'] = f"error: {e}"

    conn.close()
except Exception as e:
    output['error'] = str(e)

print(json.dumps(output, ensure_ascii=False, indent=2))
