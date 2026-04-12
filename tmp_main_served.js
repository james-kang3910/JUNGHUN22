import.meta.env = {"BASE_URL": "/", "DEV": true, "MODE": "development", "PROD": false, "SSR": false, "VITE_USER_NODE_ENV": "development"};import __vite__cjsImport0_react_jsxDevRuntime from "/node_modules/.vite/deps/react_jsx-dev-runtime.js?v=d4e35f9f"; const jsxDEV = __vite__cjsImport0_react_jsxDevRuntime["jsxDEV"];
import __vite__cjsImport1_react from "/node_modules/.vite/deps/react.js?v=d4e35f9f"; const React = __vite__cjsImport1_react.__esModule ? __vite__cjsImport1_react.default : __vite__cjsImport1_react;
import __vite__cjsImport2_reactDom_client from "/node_modules/.vite/deps/react-dom_client.js?v=e0b67627"; const ReactDOM = __vite__cjsImport2_reactDom_client.__esModule ? __vite__cjsImport2_reactDom_client.default : __vite__cjsImport2_reactDom_client;
import { BrowserRouter } from "/node_modules/.vite/deps/react-router-dom.js?v=19e9f73f";
import App from "/src/App.jsx";
import "/src/index.css";
import "/src/styles/admin-inputs.css";
import "/src/styles/home-responsive.css";
import { initProductionMode } from "/src/lib/clearLegacyData.js";
import { runMigrations } from "/src/lib/migrations.js";
import { setupConsoleHelpers } from "/src/lib/localStorageManager.js";
initProductionMode();
const migrationResult = runMigrations();
if (import.meta.env.DEV) {
  console.log("[App] Migration completed:", migrationResult);
}
setupConsoleHelpers();
ReactDOM.createRoot(document.getElementById("root")).render(
  /* @__PURE__ */ jsxDEV(React.StrictMode, { children: /* @__PURE__ */ jsxDEV(BrowserRouter, { children: /* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/main.jsx",
    lineNumber: 28,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/main.jsx",
    lineNumber: 27,
    columnNumber: 5
  }, this) }, void 0, false, {
    fileName: "C:/Users/kmh/Desktop/smi-project/src/main.jsx",
    lineNumber: 26,
    columnNumber: 3
  }, this)
);
if (import.meta.env && import.meta.env.PROD) {
  import("/src/registerSW.js").catch((err) => {
    console.error("[SW] could not load register module:", err);
  });
}

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJtYXBwaW5ncyI6IkFBMkJNO0FBM0JOLE9BQU9BLFdBQVc7QUFDbEIsT0FBT0MsY0FBYztBQUNyQixTQUFTQyxxQkFBcUI7QUFDOUIsT0FBT0MsU0FBUztBQUNoQixPQUFPO0FBQ1AsT0FBTztBQUNQLE9BQU87QUFDUCxTQUFTQywwQkFBMEI7QUFDbkMsU0FBU0MscUJBQXFCO0FBQzlCLFNBQVNDLDJCQUEyQjtBQUdwQ0YsbUJBQW1CO0FBR25CLE1BQU1HLGtCQUFrQkYsY0FBYztBQUN0QyxJQUFJRyxZQUFZQyxJQUFJQyxLQUFLO0FBQ3ZCQyxVQUFRQyxJQUFJLDhCQUE4QkwsZUFBZTtBQUMzRDtBQUdBRCxvQkFBb0I7QUFHcEJMLFNBQVNZLFdBQVdDLFNBQVNDLGVBQWUsTUFBTSxDQUFDLEVBQUVDO0FBQUFBLEVBQ25ELHVCQUFDLE1BQU0sWUFBTixFQUNDLGlDQUFDLGlCQUNDLGlDQUFDLFNBQUQ7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUFJLEtBRE47QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUVBLEtBSEY7QUFBQTtBQUFBO0FBQUE7QUFBQSxTQUlBO0FBQ0Y7QUFLQSxJQUFJUixZQUFZQyxPQUFPRCxZQUFZQyxJQUFJUSxNQUFNO0FBQzNDLFNBQU8saUJBQWlCLEVBQUVDLE1BQU0sQ0FBQUMsUUFBTztBQUVyQ1IsWUFBUVMsTUFBTSx3Q0FBd0NELEdBQUc7QUFBQSxFQUMzRCxDQUFDO0FBQ0giLCJuYW1lcyI6WyJSZWFjdCIsIlJlYWN0RE9NIiwiQnJvd3NlclJvdXRlciIsIkFwcCIsImluaXRQcm9kdWN0aW9uTW9kZSIsInJ1bk1pZ3JhdGlvbnMiLCJzZXR1cENvbnNvbGVIZWxwZXJzIiwibWlncmF0aW9uUmVzdWx0IiwiaW1wb3J0IiwiZW52IiwiREVWIiwiY29uc29sZSIsImxvZyIsImNyZWF0ZVJvb3QiLCJkb2N1bWVudCIsImdldEVsZW1lbnRCeUlkIiwicmVuZGVyIiwiUFJPRCIsImNhdGNoIiwiZXJyIiwiZXJyb3IiXSwiaWdub3JlTGlzdCI6W10sInNvdXJjZXMiOlsibWFpbi5qc3giXSwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IFJlYWN0IGZyb20gXCJyZWFjdFwiO1xuaW1wb3J0IFJlYWN0RE9NIGZyb20gXCJyZWFjdC1kb20vY2xpZW50XCI7XG5pbXBvcnQgeyBCcm93c2VyUm91dGVyIH0gZnJvbSBcInJlYWN0LXJvdXRlci1kb21cIjtcbmltcG9ydCBBcHAgZnJvbSBcIi4vQXBwLmpzeFwiO1xuaW1wb3J0IFwiLi9pbmRleC5jc3NcIjtcbmltcG9ydCBcIi4vc3R5bGVzL2FkbWluLWlucHV0cy5jc3NcIjtcbmltcG9ydCBcIi4vc3R5bGVzL2hvbWUtcmVzcG9uc2l2ZS5jc3NcIjtcbmltcG9ydCB7IGluaXRQcm9kdWN0aW9uTW9kZSB9IGZyb20gXCIuL2xpYi9jbGVhckxlZ2FjeURhdGFcIjtcbmltcG9ydCB7IHJ1bk1pZ3JhdGlvbnMgfSBmcm9tIFwiLi9saWIvbWlncmF0aW9uc1wiO1xuaW1wb3J0IHsgc2V0dXBDb25zb2xlSGVscGVycyB9IGZyb20gXCIuL2xpYi9sb2NhbFN0b3JhZ2VNYW5hZ2VyXCI7XG5cbi8vIOKchSBQUk9EVUNUSU9OOiDroIjqsbDsi5wg7IOY7ZSMIOuNsOydtO2EsCDsoJzqsbAgKOuPmeq4sClcbmluaXRQcm9kdWN0aW9uTW9kZSgpO1xuXG4vLyBsb2NhbFN0b3JhZ2Ug66eI7J206re466CI7J207IWYICjrj5nquLApXG5jb25zdCBtaWdyYXRpb25SZXN1bHQgPSBydW5NaWdyYXRpb25zKCk7XG5pZiAoaW1wb3J0Lm1ldGEuZW52LkRFVikge1xuICBjb25zb2xlLmxvZygnW0FwcF0gTWlncmF0aW9uIGNvbXBsZXRlZDonLCBtaWdyYXRpb25SZXN1bHQpO1xufVxuXG4vLyBsb2NhbFN0b3JhZ2Ug6rSA66asIOuPhOq1rOulvCDsvZjshpTsl5Ag64W47LacXG5zZXR1cENvbnNvbGVIZWxwZXJzKCk7XG5cbi8vIOKaoSDshLHriqUg6rCc7ISgOiBSZWFjdCDroIzrjZTrp4Eg66i87KCAIOyLnOyekSAo7Z2wIO2ZlOuptCDsoJzqsbApXG5SZWFjdERPTS5jcmVhdGVSb290KGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwicm9vdFwiKSkucmVuZGVyKFxuICA8UmVhY3QuU3RyaWN0TW9kZT5cbiAgICA8QnJvd3NlclJvdXRlcj5cbiAgICAgIDxBcHAgLz5cbiAgICA8L0Jyb3dzZXJSb3V0ZXI+XG4gIDwvUmVhY3QuU3RyaWN0TW9kZT5cbik7XG5cbi8vIFNlcnZpY2Ugd29ya2VyIHJlZ2lzdHJhdGlvbjogb25seSBhdHRlbXB0IGluIHByb2R1Y3Rpb24gYnVpbGRzLlxuLy8gVGhpcyBpbXBvcnQgaXMgZHluYW1pYyBzbyB0aGF0IHRoZSBtb2R1bGUgKHdoaWNoIHBlcmZvcm1zIHJlZ2lzdHJhdGlvbiBzaWRlLWVmZmVjdHMpXG4vLyBpcyBvbmx5IGxvYWRlZCBpbiBwcm9kdWN0aW9uLiBUaGUgYWN0dWFsIHJlZ2lzdHJhdGlvbiB3aWxsIGNhbGwgbmF2aWdhdG9yLnNlcnZpY2VXb3JrZXIucmVnaXN0ZXIoJy9zdy5qcycpLlxuaWYgKGltcG9ydC5tZXRhLmVudiAmJiBpbXBvcnQubWV0YS5lbnYuUFJPRCkge1xuICBpbXBvcnQoJy4vcmVnaXN0ZXJTVy5qcycpLmNhdGNoKGVyciA9PiB7XG4gICAgLy8gc3dhbGxvdyBpbXBvcnQvcnVudGltZSBmYWlsdXJlcyDigJQgbm9uLWNyaXRpY2FsXG4gICAgY29uc29sZS5lcnJvcignW1NXXSBjb3VsZCBub3QgbG9hZCByZWdpc3RlciBtb2R1bGU6JywgZXJyKTtcbiAgfSk7XG59XG4iXSwiZmlsZSI6IkM6L1VzZXJzL2ttaC9EZXNrdG9wL3NtaS1wcm9qZWN0L3NyYy9tYWluLmpzeCJ9
