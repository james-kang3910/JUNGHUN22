const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

// Usage: node migrate-local-shops.js [path/to/local_shops.json] [apiBase]
// Example: node migrate-local-shops.js ../local_shops.json http://127.0.0.1:8787

async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error('Usage: node migrate-local-shops.js [local_shops.json] [apiBase]');
    process.exit(2);
  }
  const filePath = path.resolve(process.cwd(), args[0]);
  const apiBase = args[1] || 'http://127.0.0.1:8787';

  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    process.exit(2);
  }

  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    console.error('Failed to read file:', e.message);
    process.exit(2);
  }

  let shops;
  try {
    shops = JSON.parse(raw);
  } catch (e) {
    console.error('Invalid JSON:', e.message);
    process.exit(2);
  }

  if (!Array.isArray(shops)) {
    console.error('Expected JSON array of shops');
    process.exit(2);
  }

  console.log(`Found ${shops.length} shops to migrate`);

  for (const s of shops) {
    // Normalize minimal shop shape
    const payload = {
      name: s.name || s.title || 'Unnamed Shop',
      category: s.category || s.cat || '',
      address: s.address || s.location || '',
      phone: s.phone || s.ownerPhone || '',
      description: s.description || s.sub || '',
      hours: s.businessHours || s.hours || '',
      status: s.status || 'approved',
      menus: s.menus || s.recommendedMenus || null,
    };

    const shopId = s.shopId || s.id || s.shop_id || undefined;
    if (shopId) payload.id = shopId;

    try {
      const res = await fetch(`${apiBase}/api/shops`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      console.log('Migrated:', payload.name, '->', res.status, text.slice(0, 200));
    } catch (e) {
      console.error('Failed to POST shop', payload.name, e.message);
    }
  }

  console.log('Migration complete');
}

main();
