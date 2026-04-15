(async () => {
  const res = await fetch('http://127.0.0.1:8787/api/auditions');
  const list = await res.json();
  const getStatus = (item) => {
    const now = new Date();
    const start = item.startAt ? new Date(item.startAt) : null;
    const end = item.endAt ? new Date(item.endAt) : null;
    const rawStatus = String(item.status || 'OPEN').trim().toUpperCase();
    if (rawStatus === 'CLOSED' || rawStatus === 'CLOSE' || rawStatus === 'ENDED' || rawStatus === 'END') return 'closed';
    if (end && now > end) return 'closed';
    if (start && now < start) return 'upcoming';
    return 'active';
  };
  const priority = (item) => {
    const status = getStatus(item);
    const rawStatus = String(item.status || '').trim().toUpperCase();
    const published = item.published !== false;
    if (!published) return 0;
    if (status === 'active') return 4;
    if (status === 'upcoming') return 3;
    if (rawStatus === 'OPEN' || rawStatus === 'ACTIVE') return 2;
    return 1;
  };
  const picked = [...list].sort((a, b) => {
    const p = priority(b) - priority(a);
    if (p !== 0) return p;
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  })[0];
  console.log(JSON.stringify({ pickedId: picked?.id, pickedTitle: picked?.title, pickedStatus: picked?.status }, null, 2));
})().catch(err => { console.error(err); process.exit(1); });
