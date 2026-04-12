import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ContextHeader from "../components/ContextHeader";
import { getSession } from "../lib/authStore";
import * as storageAdapter from "../lib/storageAdapter";
import * as chatService from "../lib/chatService";

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const partnerId = searchParams.get("partnerId");
  const COMPOSER_HEIGHT = 88;
  const KEYBOARD_THRESHOLD = 120;
  
  const session = getSession();
  const currentUserId = session?.memberId || null;
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [partner, setPartner] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [keyboardInset, setKeyboardInset] = useState(0);
  const isInputFocusedRef = useRef(false);
  const baseViewportHeightRef = useRef(window.innerHeight);

  // Load partner info
  useEffect(() => {
    if (!partnerId) return;
    let mounted = true;
    (async () => {
      try {
        const found = await storageAdapter.getMemberById(partnerId);
        if (mounted) setPartner(found || { name: '사용자', memberId: partnerId });
      } catch (e) {
        console.error('[Chat] getMemberById error:', e);
        if (mounted) setPartner({ name: '사용자', memberId: partnerId });
      }
    })();
    return () => { mounted = false; };
  }, [partnerId]);
  
  // ★ Computed style 로그 (DEV 1회)
  useEffect(() => {
    if (inputRef.current && process.env.NODE_ENV === 'development') {
      const computed = window.getComputedStyle(inputRef.current);
      console.log('[Chat] ✅ Input computed style:', {
        color: computed.color,
        background: computed.background,
        backgroundColor: computed.backgroundColor,
        border: computed.border
      });
    }
  }, []);

  // Load messages
  useEffect(() => {
    if (!currentUserId || !partnerId) return;
    let mounted = true;
    
    async function loadMessages() {
      try {
        const msgs = await chatService.getConversation(currentUserId, partnerId);
        if (mounted) setMessages(msgs);
      } catch (e) {
        console.error('[Chat] Failed to load messages:', e);
      }
    }
    
    loadMessages();
    
    const interval = setInterval(loadMessages, 3000); // Poll every 3s
    const onUpdate = () => { loadMessages(); };
    window.addEventListener('su:ssot:changed', onUpdate);
    
    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('su:ssot:changed', onUpdate);
    };
  }, [currentUserId, partnerId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 모바일 키보드 대응: visualViewport 기반 키보드 높이 계산
  useEffect(() => {
    const vv = window.visualViewport;
    const updateViewport = () => {
      if (!vv) {
        setKeyboardInset(0);
        return;
      }
      const currentVisualHeight = Math.round(vv.height + vv.offsetTop);
      const baseHeight = baseViewportHeightRef.current;
      const estimatedKeyboard = Math.max(0, baseHeight - currentVisualHeight);
      const nextInset = isInputFocusedRef.current && estimatedKeyboard > KEYBOARD_THRESHOLD
        ? estimatedKeyboard
        : 0;
      setKeyboardInset(nextInset);

      if (!isInputFocusedRef.current && estimatedKeyboard < 40) {
        baseViewportHeightRef.current = Math.max(baseHeight, currentVisualHeight, window.innerHeight);
      }
    };

    updateViewport();

    if (vv) {
      vv.addEventListener("resize", updateViewport);
      vv.addEventListener("scroll", updateViewport);
    }
    window.addEventListener("resize", updateViewport);

    return () => {
      if (vv) {
        vv.removeEventListener("resize", updateViewport);
        vv.removeEventListener("scroll", updateViewport);
      }
      window.removeEventListener("resize", updateViewport);
    };
  }, []);

  // 입력 포커스/키보드 변경 시 항상 최신 메시지 위치를 유지
  useEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    const scrollToBottom = () => {
      isInputFocusedRef.current = true;
      baseViewportHeightRef.current = Math.max(baseViewportHeightRef.current, window.innerHeight);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
      }, 80);
    };

    const handleBlur = () => {
      isInputFocusedRef.current = false;
      setKeyboardInset(0);
    };

    input.addEventListener("focus", scrollToBottom);
    input.addEventListener("blur", handleBlur);
    return () => {
      input.removeEventListener("focus", scrollToBottom);
      input.removeEventListener("blur", handleBlur);
    };
  }, []);

  // 뒤로가기 시 키보드가 열린 상태면 먼저 닫힘 처리
  useEffect(() => {
    const hideKeyboard = () => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    };

    const handlePopState = () => {
      hideKeyboard();
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || !currentUserId || !partnerId) return;
    
    const tempId = `temp_${Date.now()}`;
    const optimisticMsg = {
      id: tempId,
      from: currentUserId,
      to: partnerId,
      text: newMessage,
      createdAt: new Date().toISOString()
    };
    
    // Optimistic UI
    setMessages(prev => [...prev, optimisticMsg]);
    const msgToSend = newMessage;
    setNewMessage("");
    
    try {
      const result = await chatService.sendMessage(currentUserId, partnerId, msgToSend);
      // Replace temp message with real one
      setMessages(prev => prev.map(m => 
        m.id === tempId ? { ...result, createdAt: result.createdAt || new Date().toISOString() } : m
      ));
      // 모바일에서 연속 입력이 가능하도록 전송 후 포커스를 유지
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 0);
    } catch (e) {
      // Remove optimistic message on error
      setMessages(prev => prev.filter(m => m.id !== tempId));
      alert('메시지 전송 실패: ' + e.message);
      setTimeout(() => {
        inputRef.current?.focus({ preventScroll: true });
      }, 0);
    }
  };

  const handleBack = () => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    navigate('/my');
  };

  if (!partnerId) {
    return (
      <div className="su-page" style={{ padding: 20, textAlign: 'center' }}>
        <h2>채팅</h2>
        <p>대화 상대를 선택해주세요.</p>
        <button onClick={() => navigate('/home')} style={{ marginTop: 20, padding: '10px 20px' }}>
          홈으로
        </button>
      </div>
    );
  }

  return (
    <div className="su-page" style={{
      position: 'fixed',
      inset: 0,
      height: '100dvh',
      minHeight: '100svh',
      padding: 0,
      overflow: 'hidden',
      overscrollBehavior: 'none',
      background: '#F5F8FA',
    }}>
      {/* Header (상단 고정) */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 101,
        maxWidth: 600,
        margin: '0 auto',
        width: '100%',
        background: '#F5F8FA',
      }}>
        <ContextHeader
          tone="dark"
          title={partner?.name || partner?.nickname || '사용자'}
          onBack={handleBack}
        />
      </div>

      {/* Messages (상단/하단 고정 사이 꽉 채움) */}
      <div style={{
        position: 'absolute',
        top: 56, // ContextHeader 높이 (px)
        left: 0,
        right: 0,
        bottom: COMPOSER_HEIGHT + keyboardInset,
        overflowY: 'auto',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        boxSizing: 'border-box',
        maxWidth: 600,
        margin: '0 auto',
        background: '#F5F8FA',
      }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', opacity: 0.6, marginTop: 40 }}>
            대화를 시작해보세요!
          </div>
        )}
        {messages.map(msg => {
          const isMe = String(msg.from) === String(currentUserId);
          return (
            <div 
              key={msg.id} 
              style={{
                display: 'flex',
                justifyContent: isMe ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '10px 14px',
                borderRadius: 12,
                background: isMe ? 'linear-gradient(135deg,#0C5460,#083D4A)' : '#EEF1F5',
                color: isMe ? '#fff' : '#2C3E45'
              }}>
                <div style={{ fontSize: 14 }}>{msg.text}</div>
                <div style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
                  {msg.createdAt && !isNaN(new Date(msg.createdAt).getTime()) 
                    ? new Date(msg.createdAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
                    : '-'}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {/* 입력창 (하단 고정) */}
      <div style={{
        position: 'fixed',
        left: 0,
        right: 0,
        bottom: keyboardInset,
        zIndex: 102,
        padding: 12,
        borderTop: '1px solid #DDE3EA',
        background: '#F5F7FA',
        display: 'flex',
        gap: 8,
        paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
        boxSizing: 'border-box',
        maxWidth: 600,
        margin: '0 auto',
      }}>
        <input
          ref={inputRef}
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => { if (e.key === 'Enter') handleSend(); }}
          placeholder="메시지 입력..."
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: 20,
            border: '1px solid #DDE3EA',
            background: '#FFFFFF',
            color: '#0D1B21',
            outline: 'none'
          }}
        />
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            inputRef.current?.focus({ preventScroll: true });
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            inputRef.current?.focus({ preventScroll: true });
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            inputRef.current?.focus({ preventScroll: true });
          }}
          onClick={handleSend}
          style={{
            padding: '10px 20px',
            borderRadius: 20,
            border: 'none',
            background: 'linear-gradient(135deg,#0C5460,#083D4A)',
            color: '#fff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
