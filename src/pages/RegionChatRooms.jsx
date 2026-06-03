import { useEffect, useMemo, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useRegion } from '../context/RegionContext';
import { getSession } from '../lib/authStore';
import * as storageAdapter from '../lib/storageAdapter';
import { filterMembersByExactSearchQuery, normalizeExactName } from '../lib/memberSearchUtils';

const API_BASE = import.meta.env.VITE_API_BASE || '';
const MAX_ROOMS_PER_CREATOR = 3;
const CHAT_SOUND_PREF_KEY = 'su:chat:notify:sound';
const CHAT_VOICE_PREF_KEY = 'su:chat:notify:voice';
const KEYBOARD_THRESHOLD = 120;
const APP_BOTTOM_NAV_HEIGHT = 68;
const KEYBOARD_CLOSE_THRESHOLD = 64;

function authHeaders() {
  const token = getSession()?.token || '';
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJson(path, options = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    credentials: 'include',
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...authHeaders(),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || `요청 실패 (${response.status})`);
  }
  return data;
}

export default function RegionChatRooms() {
  const { regionId } = useRegion();
  const outletCtx = useOutletContext() || {};
  const regionName = outletCtx.regionName || regionId || '지역';
  const me = getSession();
  const myMemberId = String(me?.memberId || '').trim();

  const [rooms, setRooms] = useState([]);
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [roomViewOpen, setRoomViewOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [members, setMembers] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [roomName, setRoomName] = useState('');
  const [roomType, setRoomType] = useState('public');
  const [roomPassword, setRoomPassword] = useState('');
  const [memberQuery, setMemberQuery] = useState('');
  const [inviteeIds, setInviteeIds] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [leavingRoom, setLeavingRoom] = useState(false);
  const [invitePanelOpen, setInvitePanelOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState('');
  const [inviteTargetIds, setInviteTargetIds] = useState([]);
  const [invitingMembers, setInvitingMembers] = useState(false);
  const [verifiedPrivateRooms, setVerifiedPrivateRooms] = useState({});
  const [chatToast, setChatToast] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(() => {
    try {
      const value = localStorage.getItem(CHAT_SOUND_PREF_KEY);
      return value == null ? true : value === '1';
    } catch (e) {
      return true;
    }
  });
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    try {
      const value = localStorage.getItem(CHAT_VOICE_PREF_KEY);
      return value == null ? false : value === '1';
    } catch (e) {
      return false;
    }
  });
  const [error, setError] = useState('');
  const seenMessageIdsRef = useRef({});
  const initializedRoomRef = useRef({});
  const messageListRef = useRef(null);
  const messageEndRef = useRef(null);
  const messageInputRef = useRef(null);
  const isUserDraggingMessagesRef = useRef(false);
  const forceScrollToBottomRef = useRef(false);
  const prevLastMessageIdRef = useRef('');
  const isMessageInputFocusedRef = useRef(false);
  const isComposingRef = useRef(false);
  const lastForcedSyncAtRef = useRef(0);
  const baseViewportHeightRef = useRef(window.innerHeight);
  const focusedMinVisualHeightRef = useRef(window.innerHeight);
  const lockedKeyboardInsetRef = useRef(0);
  const lastKeyboardDetectedAtRef = useRef(0);
  const [visualViewportHeight, setVisualViewportHeight] = useState(window.innerHeight);
  const [keyboardInset, setKeyboardInset] = useState(0);

  const selectedRoom = useMemo(
    () => rooms.find((room) => String(room.roomId) === String(selectedRoomId)) || null,
    [rooms, selectedRoomId]
  );

  const myCreatedRoomsCount = useMemo(() => {
    return (rooms || []).filter((room) => String(room.creatorId || '').trim() === myMemberId).length;
  }, [rooms, myMemberId]);
  const canCreateRoom = myCreatedRoomsCount < MAX_ROOMS_PER_CREATOR;
  const isRoomOwner = String(selectedRoom?.creatorId || '').trim() === myMemberId;

  const inviteCandidates = useMemo(() => {
    const normalize = (value) => String(value || '').trim().toLowerCase();
    const regionTokens = [
      normalize(regionId),
      normalize(regionName),
      normalize(outletCtx.regionCode),
    ].filter(Boolean);

    const base = (members || []).filter((member) => {
      const memberId = String(member?.memberId || member?.member_id || member?.id || '').trim();
      if (!memberId || memberId === myMemberId) return false;
      return true;
    });

    if (regionTokens.length === 0) return base;

    const strict = base.filter((member) => {
      const memberTokens = [
        normalize(member?.regionId),
        normalize(member?.region_id),
        normalize(member?.regionName),
        normalize(member?.region_name),
        normalize(member?.region),
      ].filter(Boolean);
      return memberTokens.some((token) => regionTokens.includes(token));
    });

    // 데이터 정합이 맞지 않는 환경에서는 검색 자체가 막히지 않도록 fallback 허용
    return strict.length > 0 ? strict : base;
  }, [members, myMemberId, outletCtx.regionCode, regionId, regionName]);

  const filteredInviteCandidates = useMemo(
    () => filterMembersByExactSearchQuery(inviteCandidates, memberQuery),
    [inviteCandidates, memberQuery]
  );

  useEffect(() => {
    if (!regionId) return;
    loadRooms();
    loadMembers();
  }, [regionId]);

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_SOUND_PREF_KEY, soundEnabled ? '1' : '0');
    } catch (e) {}
  }, [soundEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_VOICE_PREF_KEY, voiceEnabled ? '1' : '0');
      window.dispatchEvent(new CustomEvent('su:chat:voice-pref:changed', { detail: { enabled: voiceEnabled } }));
    } catch (e) {}
  }, [voiceEnabled]);

  useEffect(() => {
    if (!chatToast) return undefined;
    const timer = window.setTimeout(() => setChatToast(''), 2200);
    return () => window.clearTimeout(timer);
  }, [chatToast]);

  useEffect(() => {
    if (!regionId) return undefined;
    const timer = window.setInterval(() => {
      if (roomViewOpen || isMessageInputFocusedRef.current || isComposingRef.current) return;
      loadRooms(true);
    }, 4000);
    return () => window.clearInterval(timer);
  }, [regionId, roomViewOpen]);

  useEffect(() => {
    if (!selectedRoomId) {
      setMessages([]);
      setRoomViewOpen(false);
      prevLastMessageIdRef.current = '';
      forceScrollToBottomRef.current = false;
      isUserDraggingMessagesRef.current = false;
      return undefined;
    }
    loadMessages(selectedRoomId);
    const timer = window.setInterval(() => {
      // 입력 중에도 장시간 동기화가 끊기지 않도록 주기적 강제 동기화 허용
      if (isMessageInputFocusedRef.current || isComposingRef.current) {
        const now = Date.now();
        if (now - lastForcedSyncAtRef.current < 5000) return;
        lastForcedSyncAtRef.current = now;
      }
      loadMessages(selectedRoomId, true);
    }, 2500);
    return () => window.clearInterval(timer);
  }, [selectedRoomId]);

  useEffect(() => {
    if (!roomViewOpen || !selectedRoomId) return;

    const listEl = messageListRef.current;
    const lastMessage = Array.isArray(messages) && messages.length > 0 ? messages[messages.length - 1] : null;
    const lastMessageId = String(lastMessage?.messageId || lastMessage?.id || '');
    const hasNewTail = !!lastMessageId && lastMessageId !== prevLastMessageIdRef.current;
    const isMine = String(lastMessage?.memberId || '') === myMemberId;
    const isNearBottom = (() => {
      if (!listEl) return true;
      const remain = listEl.scrollHeight - listEl.scrollTop - listEl.clientHeight;
      return remain <= 56;
    })();

    const shouldAutoScroll =
      forceScrollToBottomRef.current ||
      (!prevLastMessageIdRef.current && !!lastMessageId) ||
      (hasNewTail && (isMine || true));

    if (shouldAutoScroll) {
      isUserDraggingMessagesRef.current = false;
      window.requestAnimationFrame(() => {
        try {
          if (messageEndRef.current) {
            messageEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
            return;
          }
          if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
          }
        } catch (e) {}
      });
    }

    forceScrollToBottomRef.current = false;
    prevLastMessageIdRef.current = lastMessageId;
  }, [messages, roomViewOpen, selectedRoomId, myMemberId]);

  useEffect(() => {
    const vv = window.visualViewport;
    const updateViewport = () => {
      const currentVisualHeight = Math.round(vv ? vv.height + vv.offsetTop : window.innerHeight);
      const baseHeight = baseViewportHeightRef.current;
      const estimatedKeyboard = Math.max(0, baseHeight - currentVisualHeight);
      const now = Date.now();
      let nextInset = 0;

      // 안드로이드 뒤로가기 등으로 키보드가 닫힌 경우 즉시 레이아웃 원복
      if (isMessageInputFocusedRef.current && estimatedKeyboard < KEYBOARD_CLOSE_THRESHOLD && lockedKeyboardInsetRef.current > 0) {
        isMessageInputFocusedRef.current = false;
        isComposingRef.current = false;
        lockedKeyboardInsetRef.current = 0;
        lastKeyboardDetectedAtRef.current = 0;
        focusedMinVisualHeightRef.current = Math.max(baseHeight, currentVisualHeight);
        setVisualViewportHeight(currentVisualHeight);
        setKeyboardInset(0);
        try { messageInputRef.current?.blur(); } catch (e) {}
        return;
      }

      if (isMessageInputFocusedRef.current) {
        focusedMinVisualHeightRef.current = Math.min(focusedMinVisualHeightRef.current, currentVisualHeight);
        setVisualViewportHeight(focusedMinVisualHeightRef.current);

        if (estimatedKeyboard > KEYBOARD_THRESHOLD) {
          lockedKeyboardInsetRef.current = Math.max(lockedKeyboardInsetRef.current, estimatedKeyboard);
          lastKeyboardDetectedAtRef.current = now;
        }
        const recentKeyboard = now - lastKeyboardDetectedAtRef.current < 5000;
        nextInset = recentKeyboard && lockedKeyboardInsetRef.current > 0 ? lockedKeyboardInsetRef.current : 0;
      } else {
        setVisualViewportHeight(currentVisualHeight);
        nextInset = 0;
      }

      setKeyboardInset(nextInset);

      if (!isMessageInputFocusedRef.current && estimatedKeyboard < 40) {
        baseViewportHeightRef.current = Math.max(baseHeight, currentVisualHeight, window.innerHeight);
        focusedMinVisualHeightRef.current = baseViewportHeightRef.current;
        lockedKeyboardInsetRef.current = 0;
        lastKeyboardDetectedAtRef.current = 0;
      }
    };

    updateViewport();
    if (vv) {
      vv.addEventListener('resize', updateViewport);
      vv.addEventListener('scroll', updateViewport);
    }
    window.addEventListener('resize', updateViewport);

    return () => {
      if (vv) {
        vv.removeEventListener('resize', updateViewport);
        vv.removeEventListener('scroll', updateViewport);
      }
      window.removeEventListener('resize', updateViewport);
    };
  }, []);

  async function loadMembers() {
    try {
      const list = await storageAdapter.getMembers();
      if (Array.isArray(list) && list.length > 0) {
        setMembers(list);
        return;
      }

      const fallback = await fetchJson('/api/members');
      const fallbackList = Array.isArray(fallback)
        ? fallback
        : (Array.isArray(fallback?.members) ? fallback.members : []);
      setMembers(fallbackList);
    } catch (err) {
      // 멤버 로드는 실패해도 채팅 동작은 유지
      setMembers([]);
    }
  }

  async function loadRooms(background = false) {
    if (!background) setLoadingRooms(true);
    try {
      const data = await fetchJson(`/api/chat-rooms?regionId=${encodeURIComponent(regionId)}`);
      const nextRooms = Array.isArray(data?.rooms) ? data.rooms : [];
      setRooms(nextRooms);
      if (!selectedRoomId && nextRooms.length > 0) {
        setSelectedRoomId(String(nextRooms[0].roomId));
      }
      if (selectedRoomId && !nextRooms.some((room) => String(room.roomId) === String(selectedRoomId))) {
        setSelectedRoomId(nextRooms[0] ? String(nextRooms[0].roomId) : '');
      }
      if (!background) setError('');
    } catch (err) {
      if (!background) setError(err.message || '채팅방을 불러오지 못했습니다.');
    } finally {
      if (!background) setLoadingRooms(false);
    }
  }

  async function loadMessages(roomId, background = false) {
    if (!roomId) return;
    if (!background) setLoadingMessages(true);
    try {
      const data = await fetchJson(`/api/chat-rooms/${encodeURIComponent(roomId)}/messages?limit=120`);
      const nextMessages = Array.isArray(data?.messages) ? data.messages : [];
      setMessages((prev) => {
        const localUnsent = prev.filter((item) => {
          const id = String(item?.messageId || item?.id || '');
          const status = String(item?.localStatus || '');
          return id.startsWith('local_') && (status === 'pending' || status === 'failed' || status === 'sent');
        });

        // 서버 목록 + 로컬 전송 상태 메시지를 합쳐 누락 체감을 방지
        const merged = [...nextMessages];
        for (const localMsg of localUnsent) {
          const localId = String(localMsg?.messageId || localMsg?.id || '');
          const serverMessageId = String(localMsg?.serverMessageId || '');
          const confirmedByServerId = !!serverMessageId && merged.some((m) => String(m?.messageId || m?.id || '') === serverMessageId);
          if (confirmedByServerId) continue;

          const localText = String(localMsg?.text || '').trim();
          const localMemberId = String(localMsg?.memberId || '');
          const localCreatedAt = new Date(localMsg?.createdAt || 0).getTime();
          const confirmedBySimilarity = merged.some((m) => {
            const serverMemberId = String(m?.memberId || '');
            const serverText = String(m?.text || '').trim();
            const serverCreatedAt = new Date(m?.createdAt || 0).getTime();
            if (!localText || !serverText) return false;
            if (localMemberId !== serverMemberId) return false;
            if (localText !== serverText) return false;
            if (!Number.isFinite(localCreatedAt) || !Number.isFinite(serverCreatedAt)) return false;
            return Math.abs(serverCreatedAt - localCreatedAt) <= 15000;
          });
          if (confirmedBySimilarity) continue;

          if (!merged.some((m) => String(m?.messageId || m?.id || '') === localId)) {
            merged.push(localMsg);
          }
        }
        return merged;
      });

      const roomKey = String(roomId);
      let seen = seenMessageIdsRef.current[roomKey];
      if (!seen) {
        seen = new Set();
        seenMessageIdsRef.current[roomKey] = seen;
      }

      const isFirstLoad = !initializedRoomRef.current[roomKey];
      let incomingFromOthers = null;

      for (const msg of nextMessages) {
        const messageId = String(msg?.messageId || msg?.id || '');
        if (!messageId) continue;
        const alreadySeen = seen.has(messageId);
        if (!alreadySeen && !isFirstLoad && String(msg?.memberId || '') !== myMemberId) {
          incomingFromOthers = msg;
        }
        seen.add(messageId);
      }
      initializedRoomRef.current[roomKey] = true;

      if (incomingFromOthers) {
        notifyIncomingMessage(incomingFromOthers);
      }

      if (!background) setError('');
    } catch (err) {
      if (!background) setError(err.message || '메시지를 불러오지 못했습니다.');
    } finally {
      if (!background) setLoadingMessages(false);
    }
  }

  function playNotifySound() {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();

      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);

      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(now);
      oscillator.stop(now + 0.3);
      oscillator.onended = () => {
        try { ctx.close(); } catch (e) {}
      };
    } catch (e) {}
  }

  function speakIncomingMessage(sender, preview) {
    try {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
      const synth = window.speechSynthesis;
      if (!synth) return;
      if (synth.speaking) {
        synth.cancel();
      }
      const utterance = new SpeechSynthesisUtterance(`${sender}님 새 메시지. ${preview}`);
      utterance.lang = 'ko-KR';
      utterance.rate = 1;
      utterance.pitch = 1;
      synth.speak(utterance);
    } catch (e) {}
  }

  function notifyIncomingMessage(message) {
    const sender = message?.memberName || '회원';
    const preview = (String(message?.messageType || 'text') === 'image')
      ? '이미지를 보냈습니다.'
      : String(message?.text || '새 메시지').slice(0, 60);

    setChatToast(`${sender}: ${preview}`);
    if (soundEnabled) {
      playNotifySound();
    }
    if (voiceEnabled) {
      speakIncomingMessage(sender, preview);
    }

    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('새 채팅 메시지', { body: `${sender}: ${preview}` });
      }
    } catch (e) {}
  }

  async function handleCreateRoom() {
    const trimmedName = String(roomName || '').trim();
    if (!trimmedName) {
      setError('채팅방 이름을 입력해 주세요.');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        regionId,
        name: trimmedName,
        roomType,
        password: roomType === 'private' ? roomPassword : '',
        inviteeIds,
      };
      const data = await fetchJson('/api/chat-rooms', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setCreateOpen(false);
      setRoomName('');
      setRoomType('public');
      setRoomPassword('');
      setMemberQuery('');
      setInviteeIds([]);
      await loadRooms();
      if (data?.roomId) {
        setSelectedRoomId(String(data.roomId));
        setRoomViewOpen(true);
      }
      setError('');
    } catch (err) {
      setError(err.message || '채팅방 생성에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLeaveRoom() {
    if (!selectedRoomId) return;
    const confirmed = window.confirm('채팅방에서 나가시겠습니까?');
    if (!confirmed) return;
    setLeavingRoom(true);
    try {
      await fetchJson(`/api/chat-rooms/${encodeURIComponent(selectedRoomId)}/leave`, { method: 'DELETE' });
      setSelectedRoomId('');
      setRoomViewOpen(false);
      setMessages([]);
      await loadRooms();
    } catch (err) {
      setError(err.message || '채팅방 나가기에 실패했습니다.');
    } finally {
      setLeavingRoom(false);
    }
  }

  async function handleInviteMembers() {
    if (!selectedRoomId || !isRoomOwner) return;
    if (inviteTargetIds.length === 0) {
      setError('초대할 회원을 선택해 주세요.');
      return;
    }
    setInvitingMembers(true);
    try {
      const data = await fetchJson(`/api/chat-rooms/${encodeURIComponent(selectedRoomId)}/invite`, {
        method: 'POST',
        body: JSON.stringify({ memberIds: inviteTargetIds }),
      });
      const invitedCount = Number(data?.invitedCount || 0);
      setError(invitedCount > 0 ? `${invitedCount}명을 채팅방에 초대했습니다.` : '초대 가능한 회원이 없거나 이미 참여 중입니다.');
      setInviteTargetIds([]);
      setInviteQuery('');
      setInvitePanelOpen(false);
      await loadRooms(true);
    } catch (err) {
      setError(err.message || '회원 초대에 실패했습니다.');
    } finally {
      setInvitingMembers(false);
    }
  }

  function createLocalMessageId() {
    try {
      if (window.crypto && typeof window.crypto.randomUUID === 'function') {
        return `local_${window.crypto.randomUUID()}`;
      }
    } catch (e) {}
    return `local_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }

  async function handleSendMessage() {
    const text = String(messageText || '').trim();
    if (!text || !selectedRoomId) return;
    const optimisticId = createLocalMessageId();
    const optimisticMessage = {
      messageId: optimisticId,
      id: optimisticId,
      memberId: myMemberId,
      memberName: me?.name || '나',
      text,
      messageType: 'text',
      createdAt: new Date().toISOString(),
      localStatus: 'pending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setMessageText('');
    forceScrollToBottomRef.current = true;

    window.requestAnimationFrame(() => {
      messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });

    (async () => {
      try {
        const data = await fetchJson(`/api/chat-rooms/${encodeURIComponent(selectedRoomId)}/messages`, {
          method: 'POST',
          body: JSON.stringify({ text }),
        });

        const savedMessage = data?.message;
        if (savedMessage && typeof savedMessage === 'object') {
          setMessages((prev) => prev.map((item) => {
            const itemId = String(item?.messageId || item?.id || '');
            return itemId === optimisticId ? savedMessage : item;
          }));
        } else {
          const responseMessageId = String(data?.messageId || '').trim();
          setMessages((prev) => prev.map((item) => {
            const itemId = String(item?.messageId || item?.id || '');
            if (itemId !== optimisticId) return item;
            return {
              ...item,
              localStatus: 'sent',
              serverMessageId: responseMessageId || item.serverMessageId,
            };
          }));
        }

        // 전송 직후 즉시 1회 동기화해 누락 체감 최소화
        loadMessages(selectedRoomId, true).catch(() => {});
      } catch (err) {
        setMessages((prev) => prev.map((item) => {
          const itemId = String(item?.messageId || item?.id || '');
          if (itemId !== optimisticId) return item;
          return {
            ...item,
            localStatus: 'failed',
          };
        }));
        setError(err.message || '메시지 전송에 실패했습니다.');
      }
    })();

    setTimeout(() => {
      messageInputRef.current?.focus({ preventScroll: true });
    }, 0);
  }

  function toggleInvitee(memberId) {
    setInviteeIds((prev) => (
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    ));
  }

  async function openRoom(room) {
    const roomId = String(room?.roomId || '').trim();
    if (!roomId) return;
    if (String(room?.roomType || 'public').toLowerCase() === 'private' && !verifiedPrivateRooms[roomId]) {
      const password = window.prompt('비밀 채팅방 비밀번호를 입력해 주세요.');
      if (!password) return;
      try {
        await fetchJson(`/api/chat-rooms/${encodeURIComponent(roomId)}/verify-password`, {
          method: 'POST',
          body: JSON.stringify({ password }),
        });
        setVerifiedPrivateRooms((prev) => ({ ...prev, [roomId]: true }));
      } catch (err) {
        setError(err.message || '비밀번호 확인에 실패했습니다.');
        return;
      }
    }
    setSelectedRoomId(roomId);
    setRoomViewOpen(true);
  }

  function closeRoomView() {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setRoomViewOpen(false);
    setInvitePanelOpen(false);
    setInviteQuery('');
    setInviteTargetIds([]);
    isUserDraggingMessagesRef.current = false;
    forceScrollToBottomRef.current = false;
    prevLastMessageIdRef.current = '';
  }

  const roomInviteCandidates = useMemo(() => {
    if (!selectedRoom || !isRoomOwner) return [];
    return filterMembersByExactSearchQuery(inviteCandidates, inviteQuery);
  }, [inviteCandidates, inviteQuery, isRoomOwner, selectedRoom]);

  function toggleInviteTarget(memberId) {
    setInviteTargetIds((prev) => (
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    ));
  }

  const showRoomView = roomViewOpen && !!selectedRoom;
  const viewportShrink = Math.max(0, window.innerHeight - visualViewportHeight);
  const keyboardLift = keyboardInset > 0 ? Math.max(0, keyboardInset - viewportShrink) : 0;
  const roomBottomInset = keyboardInset > 0 ? 0 : APP_BOTTOM_NAV_HEIGHT;
  const roomPanelHeight = Math.max(360, visualViewportHeight - roomBottomInset);
  const rootBottomPadding = 'calc(170px + env(safe-area-inset-bottom, 0px))';

  return (
    <div style={{ padding: `6px 10px ${rootBottomPadding}`, background: 'linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 100%)', minHeight: 'calc(100vh - 110px)', overflow: showRoomView ? 'hidden' : 'visible' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'grid', gap: 6 }}>
        {!showRoomView ? (
          <>
            <section className="su-panel" style={{ margin: 0, borderRadius: 20, border: '1px solid rgba(148,163,184,0.22)', background: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(248,250,252,0.95))', boxShadow: '0 12px 28px rgba(15,23,42,0.06)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{regionName} 채팅</div>
                  <div style={{ marginTop: 2, fontSize: 12, color: '#64748b' }}>내 채팅방 목록</div>
                </div>
                <button
                  type="button"
                  className="su-chip"
                  disabled={!canCreateRoom}
                  onClick={() => setCreateOpen((prev) => !prev)}
                  style={{ opacity: canCreateRoom ? 1 : 0.6, cursor: canCreateRoom ? 'pointer' : 'not-allowed', borderRadius: 999, border: '1px solid rgba(14,116,144,0.26)', background: 'linear-gradient(180deg,#ffffff,#eef8fb)', color: '#0e7490', boxShadow: '0 4px 12px rgba(14,116,144,0.10)' }}
                >
                  {createOpen ? '닫기' : '+ 채팅방'}
                </button>
              </div>

              <div style={{ fontSize: 11, color: '#64748b', marginBottom: 8 }}>
                내 개설 채팅방: {myCreatedRoomsCount}/{MAX_ROOMS_PER_CREATOR}
              </div>

              {createOpen && canCreateRoom && (
                <div style={{ border: '1px solid var(--c-border)', borderRadius: 14, padding: 12, background: 'rgba(255,255,255,0.92)' }}>
                  <div style={{ fontSize: 12, color: '#334155', fontWeight: 700, marginBottom: 6 }}>방 이름</div>
                  <input
                    value={roomName}
                    onChange={(event) => setRoomName(event.target.value.slice(0, 40))}
                    placeholder="예: 강남구 수다방"
                    style={{
                      width: '100%',
                      marginBottom: 10,
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      padding: '10px 12px',
                      fontSize: 13,
                      background: '#ffffff',
                      color: '#0f172a',
                      WebkitTextFillColor: '#0f172a',
                      caretColor: '#0f172a',
                    }}
                  />

                  <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
                    <button
                      type="button"
                      onClick={() => setRoomType('public')}
                      style={{
                        flex: 1,
                        borderRadius: 999,
                        border: roomType === 'public' ? '1px solid #0284c7' : '1px solid #cbd5e1',
                        background: roomType === 'public' ? '#e0f2fe' : '#fff',
                        color: roomType === 'public' ? '#075985' : '#334155',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '8px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      공개방
                    </button>
                    <button
                      type="button"
                      onClick={() => setRoomType('private')}
                      style={{
                        flex: 1,
                        borderRadius: 999,
                        border: roomType === 'private' ? '1px solid #b45309' : '1px solid #cbd5e1',
                        background: roomType === 'private' ? '#fef3c7' : '#fff',
                        color: roomType === 'private' ? '#92400e' : '#334155',
                        fontSize: 12,
                        fontWeight: 800,
                        padding: '8px 10px',
                        cursor: 'pointer',
                      }}
                    >
                      비밀방
                    </button>
                  </div>

                  {roomType === 'private' ? (
                    <input
                      value={roomPassword}
                      onChange={(event) => setRoomPassword(event.target.value.slice(0, 24))}
                      placeholder="비밀번호 4자 이상"
                      type="password"
                      style={{ width: '100%', marginBottom: 10, borderRadius: 10, border: '1px solid #f59e0b', padding: '10px 12px', fontSize: 12, background: '#fffbeb' }}
                    />
                  ) : null}

                  <div style={{ fontSize: 12, color: '#334155', fontWeight: 700, marginBottom: 6 }}>
                    초대할 회원 ({inviteeIds.length}명)
                  </div>
                  <input
                    value={memberQuery}
                    onChange={(event) => setMemberQuery(event.target.value)}
                    placeholder="회원 이름을 정확히 입력 (예: 홍길동)"
                    style={{
                      width: '100%',
                      marginBottom: 8,
                      borderRadius: 10,
                      border: '1px solid #cbd5e1',
                      padding: '9px 11px',
                      fontSize: 12,
                      background: '#ffffff',
                      color: '#0f172a',
                      WebkitTextFillColor: '#0f172a',
                      caretColor: '#0f172a',
                    }}
                  />
                  <div style={{ maxHeight: 180, overflowY: 'auto', borderRadius: 10, border: '1px solid var(--c-border)', background: '#fff', padding: 8, display: 'grid', gap: 6 }}>
                    {filteredInviteCandidates.length === 0 ? (
                      <div style={{ fontSize: 12, color: '#94a3b8', padding: '4px 6px' }}>
                        {normalizeExactName(memberQuery) ? '이름이 정확히 일치하는 회원이 없습니다.' : '이름을 정확히 입력하면 검색됩니다.'}
                      </div>
                    ) : filteredInviteCandidates.map((member) => {
                      const memberId = String(member?.memberId || member?.member_id || member?.id || '');
                      const checked = inviteeIds.includes(memberId);
                      return (
                        <label key={memberId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#0f172a' }}>
                          <input type="checkbox" checked={checked} onChange={() => toggleInvitee(memberId)} />
                          <span>{member?.name || memberId}</span>
                          <span style={{ color: '#94a3b8' }}>({memberId})</span>
                        </label>
                      );
                    })}
                  </div>

                  <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                    <button type="button" className="su-btnGhost" onClick={() => { setCreateOpen(false); setInviteeIds([]); setRoomName(''); setRoomType('public'); setRoomPassword(''); setMemberQuery(''); }}>
                      취소
                    </button>
                    <button type="button" className="su-primaryBtn" disabled={submitting} onClick={handleCreateRoom}>
                      {submitting ? '생성 중...' : '생성'}
                    </button>
                  </div>
                </div>
              )}

              {error ? <div style={{ marginTop: 10, fontSize: 12, color: '#dc2626', fontWeight: 700 }}>{error}</div> : null}
            </section>

            <section className="su-panel" style={{ margin: 0, borderRadius: 20, border: '1px solid rgba(148,163,184,0.22)', background: 'linear-gradient(180deg, rgba(255,255,255,0.97), rgba(248,250,252,0.95))', boxShadow: '0 12px 28px rgba(15,23,42,0.06)' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', marginBottom: 10 }}>채팅방</div>
              {loadingRooms ? (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>불러오는 중...</div>
              ) : rooms.length === 0 ? (
                <div style={{ fontSize: 13, color: '#94a3b8' }}>참여 중인 채팅방이 없습니다.</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {rooms.map((room) => (
                    <button
                      key={room.roomId}
                      type="button"
                      onClick={() => openRoom(room)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        borderRadius: 16,
                        border: '1px solid rgba(148,163,184,0.28)',
                        background: 'linear-gradient(180deg, #ffffff, #f8fafc)',
                        padding: '12px 13px',
                        cursor: 'pointer',
                        boxShadow: '0 4px 12px rgba(15,23,42,0.05)',
                        transition: 'transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease',
                      }}
                      onMouseEnter={(event) => {
                        event.currentTarget.style.transform = 'translateY(-1px)';
                        event.currentTarget.style.boxShadow = '0 10px 18px rgba(14,116,144,0.10)';
                        event.currentTarget.style.borderColor = 'rgba(14,116,144,0.32)';
                      }}
                      onMouseLeave={(event) => {
                        event.currentTarget.style.transform = 'none';
                        event.currentTarget.style.boxShadow = '0 4px 12px rgba(15,23,42,0.05)';
                        event.currentTarget.style.borderColor = 'rgba(148,163,184,0.28)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: 'linear-gradient(180deg,#2dd4bf,#0891b2)', boxShadow: '0 0 0 3px rgba(45,212,191,0.12)' }} />
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.name}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 800, borderRadius: 999, padding: '3px 7px', background: room.roomType === 'private' ? '#fef3c7' : '#dbeafe', color: room.roomType === 'private' ? '#92400e' : '#1d4ed8' }}>
                          {room.roomType === 'private' ? '비밀방' : '공개방'}
                        </span>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {room.memberCount || 1}명 · {room.lastMessage || '메시지 없음'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="su-panel" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: roomBottomInset,
            transform: 'none',
            width: '100vw',
            margin: 0,
            height: roomPanelHeight,
            minHeight: 360,
            maxHeight: roomPanelHeight,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            background: '#f7f7f8',
            border: 'none',
            borderRadius: 0,
            padding: '12px 10px calc(10px + env(safe-area-inset-bottom, 0px))',
            boxSizing: 'border-box',
            zIndex: 4000,
          }}>
            <div style={{ display: 'grid', gap: 8, marginBottom: 8, flexShrink: 0 }}>
              <div
                style={{
                  border: '1px solid #dbe3ee',
                  background: '#eef3f8',
                  borderRadius: 14,
                  minHeight: 52,
                  padding: '8px 10px',
                  display: 'grid',
                  gridTemplateColumns: 'auto 1fr auto',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <button
                  type="button"
                  onClick={closeRoomView}
                  style={{ border: 'none', background: 'none', color: '#0f766e', fontWeight: 800, cursor: 'pointer', fontSize: 14, padding: 0 }}
                >
                  ← 채팅방 목록
                </button>
                <div
                  style={{
                    fontSize: 15,
                    fontWeight: 900,
                    color: '#0f172a',
                    textAlign: 'center',
                    lineHeight: 1.3,
                    wordBreak: 'break-word',
                  }}
                >
                  {selectedRoom?.name || '채팅방'}
                </div>
                <div style={{ width: 8, height: 1 }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8, flexWrap: 'nowrap', marginTop: 0, overflowX: 'auto', padding: '2px 0 4px' }}>
                <div style={{ fontSize: 11, color: '#64748b' }}>{selectedRoom?.memberCount || 1}명</div>
                {isRoomOwner ? (
                  <button
                    type="button"
                    onClick={() => setInvitePanelOpen((prev) => !prev)}
                    style={{ border: '1px solid #bfdbfe', background: '#eff6ff', color: '#1d4ed8', borderRadius: 999, padding: '5px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                  >
                    친구추가
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={handleLeaveRoom}
                  disabled={leavingRoom}
                  style={{ border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', borderRadius: 999, padding: '5px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
                >
                  {leavingRoom ? '나가는 중...' : '나가기'}
                </button>
              <button
                type="button"
                onClick={() => setSoundEnabled((prev) => !prev)}
                style={{ border: '1px solid #cbd5e1', background: soundEnabled ? '#e0f2fe' : '#f8fafc', color: soundEnabled ? '#075985' : '#64748b', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
              >
                공유 알림음 {soundEnabled ? 'ON' : 'OFF'}
              </button>
              <button
                type="button"
                onClick={() => setVoiceEnabled((prev) => !prev)}
                style={{ border: '1px solid #cbd5e1', background: voiceEnabled ? '#dcfce7' : '#f8fafc', color: voiceEnabled ? '#166534' : '#64748b', borderRadius: 999, padding: '4px 10px', fontSize: 11, fontWeight: 800, cursor: 'pointer' }}
              >
                음성알림 {voiceEnabled ? 'ON' : 'OFF'}
              </button>
            </div>
            </div>

            {invitePanelOpen && isRoomOwner ? (
              <div style={{ marginBottom: 10, border: '1px solid #bfdbfe', borderRadius: 12, background: '#f8fbff', padding: 10, flexShrink: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#1e3a8a', marginBottom: 6 }}>회원 검색 후 채팅방 초대</div>
                <input
                  value={inviteQuery}
                  onChange={(event) => setInviteQuery(event.target.value)}
                  placeholder="회원 이름을 정확히 입력 (예: 홍길동)"
                  style={{ width: '100%', borderRadius: 10, border: '1px solid #cbd5e1', padding: '9px 10px', fontSize: 12, marginBottom: 8, background: '#fff' }}
                />
                <div style={{ maxHeight: 150, overflowY: 'auto', borderRadius: 10, border: '1px solid #dbeafe', background: '#fff', padding: 8, display: 'grid', gap: 6 }}>
                  {roomInviteCandidates.length === 0 ? (
                    <div style={{ fontSize: 12, color: '#94a3b8' }}>{normalizeExactName(inviteQuery) ? '이름이 정확히 일치하는 회원이 없습니다.' : '이름을 정확히 입력하면 검색됩니다.'}</div>
                  ) : roomInviteCandidates.map((member) => {
                    const memberId = String(member?.memberId || member?.member_id || member?.id || '');
                    if (!memberId) return null;
                    return (
                      <label key={memberId} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#0f172a' }}>
                        <input type="checkbox" checked={inviteTargetIds.includes(memberId)} onChange={() => toggleInviteTarget(memberId)} />
                        <span style={{ fontWeight: 700 }}>{member?.name || '회원'}</span>
                        <span style={{ color: '#94a3b8' }}>({memberId})</span>
                      </label>
                    );
                  })}
                </div>
                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button
                    type="button"
                    className="su-btnGhost"
                    onClick={() => {
                      setInvitePanelOpen(false);
                      setInviteQuery('');
                      setInviteTargetIds([]);
                    }}
                  >
                    닫기
                  </button>
                  <button type="button" className="su-primaryBtn" disabled={invitingMembers || inviteTargetIds.length === 0} onClick={handleInviteMembers}>
                    {invitingMembers ? '초대 중...' : '선택 회원 초대'}
                  </button>
                </div>
              </div>
            ) : null}

            {error ? <div style={{ marginBottom: 8, fontSize: 12, color: '#b91c1c', fontWeight: 700, flexShrink: 0 }}>{error}</div> : null}

            <div
              ref={messageListRef}
              onScroll={(event) => {
                const el = event.currentTarget;
                const remain = el.scrollHeight - el.scrollTop - el.clientHeight;
                isUserDraggingMessagesRef.current = remain > 56;
              }}
              onTouchStart={() => {
                isUserDraggingMessagesRef.current = true;
              }}
              onMouseDown={() => {
                isUserDraggingMessagesRef.current = true;
              }}
              onTouchEnd={() => {
                const el = messageListRef.current;
                if (!el) return;
                const remain = el.scrollHeight - el.scrollTop - el.clientHeight;
                if (remain <= 56) isUserDraggingMessagesRef.current = false;
              }}
              style={{ flex: 1, minHeight: 0, border: '1px solid #b8c4d4', borderRadius: 12, background: '#b8c8da', padding: 10, overflowY: 'auto', marginTop: -2 }}
            >
              {loadingMessages ? (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>메시지 불러오는 중...</div>
              ) : messages.length === 0 ? (
                <div style={{ fontSize: 12, color: '#94a3b8' }}>첫 메시지를 남겨 보세요.</div>
              ) : (
                <div style={{ display: 'grid', gap: 8 }}>
                  {messages.map((message) => {
                    const isMine = String(message.memberId || '') === myMemberId;
                    const isImageMessage = String(message.messageType || 'text') === 'image' && !!message.imageUrl;
                    const messageTextOnly = String(message.text || '').trim();
                    const showText = !isImageMessage || (messageTextOnly && messageTextOnly !== '[image]');
                    return (
                      <div key={message.messageId || message.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                        <div style={{ maxWidth: '88%', padding: '2px 0', background: 'transparent', border: 'none', boxShadow: 'none', color: '#0f172a' }}>
                          <div style={{ fontSize: 12, fontWeight: 800, opacity: 0.78, marginBottom: 3, textAlign: isMine ? 'right' : 'left' }}>{message.memberName || '회원'}</div>
                          {isImageMessage ? (
                            <a href={message.imageUrl} target="_blank" rel="noreferrer" style={{ display: 'block', marginTop: 6 }}>
                              <img src={message.imageUrl} alt="chat-image" style={{ width: '100%', maxWidth: 230, borderRadius: 10, border: '1px solid rgba(15,23,42,0.08)', objectFit: 'cover' }} />
                            </a>
                          ) : null}
                          {showText ? (
                            <div
                              style={{
                                display: 'inline-block',
                                fontSize: 15,
                                marginTop: 2,
                                lineHeight: 1.45,
                                whiteSpace: 'pre-wrap',
                                wordBreak: 'break-word',
                                overflowWrap: 'anywhere',
                                padding: '8px 11px',
                                borderRadius: isMine ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                                background: isMine ? '#fee500' : '#ffffff',
                                color: '#191919',
                                border: isMine ? '1px solid rgba(0,0,0,0.05)' : '1px solid rgba(15,23,42,0.10)',
                                boxShadow: '0 2px 6px rgba(15,23,42,0.08)',
                              }}
                            >
                              {message.text}
                            </div>
                          ) : null}
                          <div style={{ fontSize: 10, marginTop: 4, opacity: 0.58, textAlign: isMine ? 'right' : 'left' }}>
                            {message.createdAt ? new Date(message.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) : ''}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messageEndRef} />
                </div>
              )}
            </div>

            <div style={{ marginTop: 8, marginBottom: keyboardLift, display: 'flex', gap: 8, flexShrink: 0, background: '#f7f7f8', paddingBottom: keyboardInset > 0 ? 0 : 4 }}>
              <input
                ref={messageInputRef}
                value={messageText}
                onChange={(event) => setMessageText(event.target.value)}
                onCompositionStart={() => {
                  isComposingRef.current = true;
                }}
                onCompositionEnd={(event) => {
                  isComposingRef.current = false;
                  setMessageText(event.currentTarget.value);
                }}
                onFocus={() => {
                  isMessageInputFocusedRef.current = true;
                  baseViewportHeightRef.current = Math.max(baseViewportHeightRef.current, window.innerHeight);
                  lockedKeyboardInsetRef.current = 0;
                  lastKeyboardDetectedAtRef.current = 0;
                  focusedMinVisualHeightRef.current = Math.min(baseViewportHeightRef.current, Math.round(window.visualViewport ? window.visualViewport.height + window.visualViewport.offsetTop : window.innerHeight));
                  setTimeout(() => {
                    messageEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
                  }, 80);
                }}
                onBlur={() => {
                  isMessageInputFocusedRef.current = false;
                  isComposingRef.current = false;
                  lockedKeyboardInsetRef.current = 0;
                  lastKeyboardDetectedAtRef.current = 0;
                  setVisualViewportHeight(Math.round(window.visualViewport ? window.visualViewport.height + window.visualViewport.offsetTop : window.innerHeight));
                  setKeyboardInset(0);
                }}
                onKeyDown={(event) => {
                  if (event.nativeEvent && event.nativeEvent.isComposing) return;
                  if (isComposingRef.current) return;
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="메시지를 입력하세요"
                style={{
                  flex: 1,
                  borderRadius: 999,
                  border: '1px solid #d1d5db',
                  background: '#ffffff',
                  color: '#0f172a',
                  WebkitTextFillColor: '#0f172a',
                  caretColor: '#0f172a',
                  colorScheme: 'light',
                  padding: '10px 12px',
                  fontSize: 14,
                  fontWeight: 700,
                  outline: 'none',
                  appearance: 'none',
                }}
              />
              <button
                type="button"
                disabled={!messageText.trim()}
                onPointerDown={(event) => {
                  event.preventDefault();
                  messageInputRef.current?.focus({ preventScroll: true });
                }}
                onMouseDown={(event) => {
                  event.preventDefault();
                  messageInputRef.current?.focus({ preventScroll: true });
                }}
                onTouchStart={(event) => {
                  event.preventDefault();
                  messageInputRef.current?.focus({ preventScroll: true });
                }}
                onClick={handleSendMessage}
                style={{
                  border: '1px solid #e7cd00',
                  background: !messageText.trim() ? '#f6e991' : '#fee500',
                  color: '#1f2937',
                  borderRadius: 14,
                  minWidth: 88,
                  padding: '0 16px',
                  fontSize: 16,
                  fontWeight: 900,
                  cursor: !messageText.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                전송
              </button>
            </div>
          </section>
        )}
      </div>
      {chatToast ? (
        <div style={{ position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)', zIndex: 2005, background: 'rgba(15,23,42,0.94)', color: '#f8fafc', border: '1px solid rgba(14,165,233,0.35)', boxShadow: '0 12px 34px rgba(2,6,23,0.35)', borderRadius: 12, padding: '10px 14px', fontSize: 12, fontWeight: 700 }}>
          {chatToast}
        </div>
      ) : null}
    </div>
  );
}
