import { useEffect, useRef } from 'react';

const DEFAULT_EVENTS = ['su:ssot:changed', 'focus'];

export default function useAutoRefresh(refreshFn, options = {}) {
  const {
    enabled = true,
    intervalMs = 15000,
    events = DEFAULT_EVENTS,
    minTriggerMs = 1200,
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