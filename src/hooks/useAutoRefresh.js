import { useEffect, useRef } from 'react';

// focus 이벤트 제거: 모바일에서 앱 전환 시 마운트된 모든 컴포넌트가 동시에
// API 요청을 폭발적으로 발사하는 현상 방지 (가장 큰 체감 느림 원인)
const DEFAULT_EVENTS = ['su:ssot:changed'];

export default function useAutoRefresh(refreshFn, options = {}) {
  const {
    enabled = true,
    intervalMs = 60000,
    events = DEFAULT_EVENTS,
    minTriggerMs = 3000,
  } = options;

  const refreshRef = useRef(refreshFn);
  const lastRunAtRef = useRef(0);

  useEffect(() => {
    refreshRef.current = refreshFn;
  }, [refreshFn]);

  useEffect(() => {
    if (!enabled) return undefined;

    const runRefresh = () => {
      const now = Date.now();
      if (now - lastRunAtRef.current < Number(minTriggerMs || 0)) return;
      lastRunAtRef.current = now;
      try {
        refreshRef.current?.();
      } catch (error) {}
    };

    const onVisibilityChange = () => {
      if (!document.hidden) runRefresh();
    };

    const timers = [];
    if (Number(intervalMs) > 0) {
      const timerId = window.setInterval(() => {
        if (!document.hidden) runRefresh();
      }, intervalMs);
      timers.push(timerId);
    }

    events.forEach((eventName) => window.addEventListener(eventName, runRefresh));
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      timers.forEach((timerId) => window.clearInterval(timerId));
      events.forEach((eventName) => window.removeEventListener(eventName, runRefresh));
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [enabled, intervalMs, events, minTriggerMs]);
}