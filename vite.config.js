/**
 * =======================================================
 * SMI 프로젝트 프론트엔드 — 기본 환경 정보
 * =======================================================
 * 프레임워크  : React 18 + Vite
 * 개발 포트   : 5174 (strictPort)
 * API 프록시  : /api → http://127.0.0.1:8787 (개발 시)
 * 빌드 출력   : dist/
 * DB         : PostgreSQL (백엔드 서버가 직접 연결)
 *              프론트는 DB 직접 접근 없음 — 모두 /api 경유
 * 인증        : adminToken (localStorage) → x-admin-token 헤더
 *              회원 세션 → x-member-id 헤더
 * 환경변수    : VITE_API_URL (미설정 시 Vite proxy 사용)
 * PWA         : vite-plugin-pwa (sw.js 자동 생성)
 * =======================================================
 */
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      injectRegister: "auto",
      workbox: {
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
      },
      includeAssets: ["favicon.svg"],
      manifest: {
        name: "지역공유발전플랫폼",
        short_name: "ShareUnity",
        start_url: "/",
        scope: "/",
        display: "standalone",
        background_color: "#0b1020",
        theme_color: "#0b1020",
        icons: [
          { src: "/pwa-192.png", sizes: "192x192", type: "image/png" },
          { src: "/pwa-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ],
  server: {
    host: true,
    port: 5174,
    strictPort: true,
    // Proxy `/api` to the local backend to avoid CORS / PNA issues in development
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
        headers: {
          // ensure Host/Origin forwarded consistently
          host: 'localhost:8787'
        }
      },
      '/uploads': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
      },
      '/terms': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
      },
      '/privacy': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:8787',
        changeOrigin: true,
        secure: false,
        ws: true,
      }
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // 프로덕션에서 소스맵 제거
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,  // 모든 console.* 제거
        drop_debugger: true, // debugger 문 제거
      },
    },
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React 핵심 라이브러리
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react-vendor';
          }
          // React Router
          if (id.includes('node_modules/react-router-dom')) {
            return 'router';
          }
          // 관리자 페이지
          if (id.includes('/pages/admin/')) {
            return 'admin';
          }
          // 방송 관련
          if (id.includes('/pages/broadcast/') || id.includes('/pages/audition/')) {
            return 'media';
          }
          // 기타 큰 라이브러리가 있다면 추가
        },
      },
    },
  },
});
