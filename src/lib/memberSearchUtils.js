/**
 * 회원 이름 검색 — 부분 일치(contains) 금지, 정확히 일치할 때만 노출
 */

export function normalizeExactName(value) {
  return String(value || '')
    .trim()
    .replace(/\s+/g, ' ');
}

export function memberDisplayName(member) {
  return normalizeExactName(member?.name || member?.nickname || '');
}

export function memberIdOf(member) {
  return String(member?.memberId || member?.member_id || member?.id || '').trim();
}

/**
 * @param {object} member
 * @param {string} query - 사용자 입력 (이름 또는 전체 회원 ID)
 * @returns {boolean}
 */
export function memberMatchesExactSearchQuery(member, query) {
  const q = normalizeExactName(query);
  if (!q) return false;

  const name = memberDisplayName(member);
  if (name && name === q) return true;

  const memberId = memberIdOf(member);
  if (memberId && memberId === q) return true;

  return false;
}

/**
 * @param {Array} members
 * @param {string} query
 * @returns {Array}
 */
export function filterMembersByExactSearchQuery(members, query) {
  const q = normalizeExactName(query);
  if (!q) return [];
  const list = Array.isArray(members) ? members : [];
  return list.filter((member) => memberMatchesExactSearchQuery(member, q));
}

/** 표시용 연락처 (전화 우선, 없으면 이메일) */
export function memberContactDisplay(member) {
  const phone = String(member?.phone || member?.phoneNumber || '').trim();
  if (phone) return phone;
  const email = String(member?.email || '').trim();
  if (email) return email;
  return '';
}

/**
 * 동일 이름으로 검색된 회원이 2명 이상인지 (연락처 표시 필요)
 */
export function hasDuplicateExactNameMatches(members, query) {
  const q = normalizeExactName(query);
  if (!q) return false;
  const list = filterMembersByExactSearchQuery(members, query);
  const sameNameCount = list.filter((member) => memberDisplayName(member) === q).length;
  return sameNameCount > 1;
}
