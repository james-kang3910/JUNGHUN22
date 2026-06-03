import {
  memberContactDisplay,
  memberDisplayName,
  memberIdOf,
} from '../lib/memberSearchUtils';

/**
 * 친구/채팅 초대 검색 결과 한 줄 라벨
 * @param {boolean} showContactWithName - 동명이인 등: 이름 · 연락처
 */
export default function MemberSearchResultLabel({ member, showContactWithName = false }) {
  const name = memberDisplayName(member) || '회원';
  const contact = memberContactDisplay(member);
  const memberId = memberIdOf(member);

  if (showContactWithName) {
    return (
      <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 4 }}>
        <span style={{ fontWeight: 700 }}>{name}</span>
        <span style={{ color: '#64748b', fontWeight: 600 }}>
          · {contact || '연락처 없음'}
        </span>
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 4 }}>
      <span style={{ fontWeight: 700 }}>{name}</span>
      {memberId ? <span style={{ color: '#94a3b8', fontSize: 11 }}>({memberId})</span> : null}
    </span>
  );
}
