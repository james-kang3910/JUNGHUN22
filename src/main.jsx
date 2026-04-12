import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import "./styles/admin-inputs.css";
import "./styles/home-responsive.css";
import { initProductionMode } from "./lib/clearLegacyData";
import { runMigrations } from "./lib/migrations";
import { setupConsoleHelpers } from "./lib/localStorageManager";

// ✅ PRODUCTION: 레거시 샘플 데이터 제거 (동기)
initProductionMode();

// localStorage 마이그레이션 (동기)
const migrationResult = runMigrations();
if (import.meta.env.DEV) {
  console.log('[App] Migration completed:', migrationResult);
}

// localStorage 관리 도구를 콘솔에 노출
setupConsoleHelpers();

// ⚡ 성능 개선: React 렌더링 먼저 시작 (흰 화면 제거)
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

// Service worker registration: only attempt in production builds.
// This import is dynamic so that the module (which performs registration side-effects)
// is only loaded in production. The actual registration will call navigator.serviceWorker.register('/sw.js').
if (import.meta.env && import.meta.env.PROD) {
  import('./registerSW.js').catch(err => {
    // swallow import/runtime failures — non-critical
    console.error('[SW] could not load register module:', err);
  });
}
