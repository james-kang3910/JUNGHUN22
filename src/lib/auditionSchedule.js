export function getAuditionDateFloorInput() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const offset = now.getTimezoneOffset();
  const normalized = new Date(now.getTime() - offset * 60 * 1000);
  return normalized.toISOString().slice(0, 16);
}

function parseDate(value) {
  if (!value) return null;
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getAuditionScheduleStatus(item) {
  const source = item || {};
  const now = new Date();
  const start = parseDate(source.startAt || source.start_at || null);
  const end = parseDate(source.endAt || source.end_at || source.deadline || null);
  const published = source.published !== false;
  const type = String(source.type || 'FREE').toUpperCase();
  const rawStatus = String(source.status || 'OPEN').trim().toUpperCase();

  if (type === 'NOTICE' && !published) return 'draft';
  if (rawStatus === 'CLOSED' || rawStatus === 'CLOSE' || rawStatus === 'ENDED' || rawStatus === 'END') return 'closed';
  if (end && now > end) return 'closed';
  if (start && now < start) return 'upcoming';
  return 'active';
}

export function isAuditionClosed(item) {
  return getAuditionScheduleStatus(item) === 'closed';
}

export function validateAuditionDateRange(startAt, endAt) {
  const floorText = getAuditionDateFloorInput();
  const floor = new Date(floorText);
  const start = parseDate(startAt);
  const end = parseDate(endAt);

  if (start && start < floor) {
    return '신청 시작일은 오늘 이전으로 설정할 수 없습니다.';
  }
  if (end && end < floor) {
    return '신청 종료일은 오늘 이전으로 설정할 수 없습니다.';
  }
  if (start && end && end < start) {
    return '신청 종료일은 시작일보다 빠를 수 없습니다.';
  }
  return '';
}

export function normalizeAuditionRankLabel(label) {
  return String(label || '').trim();
}

export function getAuditionRankPriority(label) {
  const text = normalizeAuditionRankLabel(label);
  if (!text) return Number.MAX_SAFE_INTEGER;

  const numericMatch = text.match(/(\d+)/);
  if (numericMatch) return Number(numericMatch[1]);

  const presets = [
    ['대상', 1],
    ['최우수상', 2],
    ['금상', 3],
    ['은상', 4],
    ['동상', 5],
    ['우수상', 6],
    ['장려상', 7],
    ['인기상', 8],
  ];
  const found = presets.find(([keyword]) => text.includes(keyword));
  return found ? found[1] : 100;
}

export function sortAuditionSubmissions(items, auditionClosed) {
  const list = Array.isArray(items) ? [...items] : [];
  if (auditionClosed) {
    return list.sort((left, right) => {
      const leftLabel = normalizeAuditionRankLabel(left?.rankLabel || left?.rank_label);
      const rightLabel = normalizeAuditionRankLabel(right?.rankLabel || right?.rank_label);
      const leftHasLabel = leftLabel ? 1 : 0;
      const rightHasLabel = rightLabel ? 1 : 0;
      if (leftHasLabel !== rightHasLabel) return rightHasLabel - leftHasLabel;

      const leftPriority = getAuditionRankPriority(leftLabel);
      const rightPriority = getAuditionRankPriority(rightLabel);
      if (leftPriority !== rightPriority) return leftPriority - rightPriority;

      const rightVotes = Number(right?.votesCount || right?.votes_count || 0);
      const leftVotes = Number(left?.votesCount || left?.votes_count || 0);
      if (rightVotes !== leftVotes) return rightVotes - leftVotes;

      const leftTime = parseDate(left?.createdAt || left?.created_at)?.getTime() || 0;
      const rightTime = parseDate(right?.createdAt || right?.created_at)?.getTime() || 0;
      return leftTime - rightTime;
    });
  }

  return list.sort((left, right) => {
    const rightVotes = Number(right?.votesCount || right?.votes_count || 0);
    const leftVotes = Number(left?.votesCount || left?.votes_count || 0);
    if (rightVotes !== leftVotes) return rightVotes - leftVotes;

    const leftTime = parseDate(left?.createdAt || left?.created_at)?.getTime() || 0;
    const rightTime = parseDate(right?.createdAt || right?.created_at)?.getTime() || 0;
    return leftTime - rightTime;
  });
}

export function getAuditionDisplayBadge(item, voteRank, auditionClosed) {
  const rankLabel = normalizeAuditionRankLabel(item?.rankLabel || item?.rank_label);
  if (auditionClosed && rankLabel) return rankLabel;
  if (Number(voteRank) >= 1 && Number(voteRank) <= 3) return `${voteRank}위`;
  return '';
}

export function getAuditionLatestTimestamp(item) {
  const updated = parseDate(item?.updatedAt || item?.updated_at)?.getTime() || 0;
  const created = parseDate(item?.createdAt || item?.created_at)?.getTime() || 0;
  return Math.max(updated, created);
}

export function isAuditionOngoingForHome(item) {
  const status = getAuditionScheduleStatus(item);
  return status === 'active' || status === 'upcoming';
}

export function compareAuditionsByLatest(left, right) {
  const leftTs = getAuditionLatestTimestamp(left);
  const rightTs = getAuditionLatestTimestamp(right);
  if (rightTs !== leftTs) return rightTs - leftTs;

  const leftId = Number(left?.auditionId || left?.audition_id || left?.id || 0);
  const rightId = Number(right?.auditionId || right?.audition_id || right?.id || 0);
  return rightId - leftId;
}

/** 메인/하이라이트용: 공개·진행중(접수예정/접수중) 오디션 중 최신 1건 */
export function pickLatestAudition(list) {
  const rows = (Array.isArray(list) ? list : []).filter(Boolean);
  if (!rows.length) return null;

  const published = rows.filter((item) => item?.published !== false);
  const pool = published.length ? published : rows;
  const ongoing = pool.filter(isAuditionOngoingForHome);
  if (!ongoing.length) return null;
  return [...ongoing].sort(compareAuditionsByLatest)[0] || null;
}