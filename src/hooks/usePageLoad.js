/**
 * usePageLoad - 공통 페이지 데이터 로딩 훅
 * 
 * 목적:
 * - authReady gate 통일 (auth 준비 전에는 API 호출 차단)
 * - AbortController로 레이스 방지
 * - data=null 로딩 표준화 (무한 로딩 방지)
 * - reloadKey 기반 재조회 통일
 * 
 * 사용법:
 * const { data, setData, error, reload, authReady, me } = usePageLoad(loaderFn, deps);
 * 
 * loaderFn 시그니처:
 * async ({ me, signal }) => result
 * - me: authStore.getCurrentUser() 결과
 * - signal: AbortController.signal (요청 취소용)
 * - return: 로드된 데이터 (null/undefined 금지, 빈 배열/객체는 허용)
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { isAuthReady, getCurrentUser, getBootStatus } from '../lib/authStore';

export function usePageLoad(loaderFn, deps = []) {
  const [data, setData] = useState([]); // 초기값을 []로 변경하여 즉시 로딩 해제
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [authReadyFlag, setAuthReadyFlag] = useState(isAuthReady());
  const [bootStatus, setBootStatus] = useState(getBootStatus());
  
  // loaderFn의 최신 참조를 유지 (매 렌더마다 새 함수가 전달되어도 무한루프 방지)
  const loaderFnRef = useRef(loaderFn);
  useEffect(() => {
    loaderFnRef.current = loaderFn;
  });
  
  // auth 상태 변경 감지
  useEffect(() => {
    const onAuth = () => {
      setAuthReadyFlag(isAuthReady());
      setBootStatus(getBootStatus());
    };
    window.addEventListener('su:auth:changed', onAuth);
    setAuthReadyFlag(isAuthReady());
    setBootStatus(getBootStatus());
    return () => window.removeEventListener('su:auth:changed', onAuth);
  }, []);

  // me 객체 (auth 준비 후에만 유효)
  const me = useMemo(() => {
    if (!authReadyFlag) return null;
    return getCurrentUser();
  }, [authReadyFlag]);

  // 재조회 함수
  const reload = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  // 데이터 로드 effect
  useEffect(() => {
    let ac = new AbortController();
    
    const load = async () => {
      // bootStatus 차단 제거 - 로더 함수가 me 체크하도록 위임
      try {
        setError(null);
        // loaderFn 호출 (me, signal 전달)
        const result = await loaderFnRef.current({ me, signal: ac.signal });
        
        // abort된 경우 state 업데이트 스킵
        if (ac.signal.aborted) return;
        
        // 결과 확정 (null/undefined는 빈 배열로 폴백)
        if (result === null || result === undefined) {
          setData([]);
        } else {
          setData(result);
        }
      } catch (err) {
        if (ac.signal.aborted) return;
        console.error('[usePageLoad] loader error:', err);
        setError(err);
        // 에러여도 data를 확정 (무한 로딩 방지)
        setData([]);
      }
    };

    load();

    return () => {
      ac.abort();
    };
  }, [authReadyFlag, reloadKey, ...deps]);

  return {
    data,
    setData,
    error,
    reload,
    authReady: authReadyFlag,
    me,
    loading: data === null,
  };
}

/**
 * usePageLoadMulti - 여러 데이터를 동시 로드
 * 
 * 사용법:
 * const { data, reload } = usePageLoadMulti({
 *   missions: async ({ me, signal }) => getMissions(),
 *   events: async ({ me, signal }) => getEvents(),
 * });
 * // data.missions, data.events로 접근
 */
export function usePageLoadMulti(loaders = {}) {
  const [data, setData] = useState({}); // 초기값을 {}로 변경
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [authReadyFlag, setAuthReadyFlag] = useState(isAuthReady());
  const [bootStatus, setBootStatus] = useState(getBootStatus());
  
  // loaders의 최신 참조를 유지
  const loadersRef = useRef(loaders);
  useEffect(() => {
    loadersRef.current = loaders;
  });

  useEffect(() => {
    const onAuth = () => {
      setAuthReadyFlag(isAuthReady());
      setBootStatus(getBootStatus());
    };
    window.addEventListener('su:auth:changed', onAuth);
    setAuthReadyFlag(isAuthReady());
    setBootStatus(getBootStatus());
    return () => window.removeEventListener('su:auth:changed', onAuth);
  }, []);

  const me = useMemo(() => {
    if (!authReadyFlag) return null;
    return getCurrentUser();
  }, [authReadyFlag]);

  const reload = useCallback(() => {
    setReloadKey(prev => prev + 1);
  }, []);

  useEffect(() => {
    let ac = new AbortController();

    const load = async () => {
      // bootStatus 차단 제거
      try {
        setError(null);
        const keys = Object.keys(loadersRef.current);
        const promises = keys.map(key => loadersRef.current[key]({ me, signal: ac.signal }));
        const results = await Promise.all(promises);

        if (ac.signal.aborted) return;

        const resultObj = {};
        keys.forEach((key, idx) => {
          resultObj[key] = results[idx] ?? [];
        });
        setData(resultObj);
      } catch (err) {
        if (ac.signal.aborted) return;
        console.error('[usePageLoadMulti] loader error:', err);
        setError(err);
        // 에러여도 빈 객체로 확정
        const resultObj = {};
        Object.keys(loadersRef.current).forEach(key => {
          resultObj[key] = [];
        });
        setData(resultObj);
      }
    };

    load();

    return () => {
      ac.abort();
    };
  }, [authReadyFlag, reloadKey]);

  return {
    data,
    setData,
    error,
    reload,
    authReady: authReadyFlag,
    me,
    loading: data === null,
  };
}
