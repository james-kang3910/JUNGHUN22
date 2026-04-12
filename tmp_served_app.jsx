
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Error</title>
            <script type="module">
              const error = {"message":"URI malformed","stack":"    at decodeURI (\u003canonymous>)\n    at viteTransformMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:62024:13)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at viteServePublicMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:51663:14)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at viteHMRPingMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:63369:7)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41286:14)\n    at viteProxyMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:61863:5)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at viteCachedTransformMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:62011:5)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at viteHostCheckMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:59324:12)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at cors (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41836:7)\n    at file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41872:17\n    at originCallback (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41862:15)\n    at file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41867:13\n    at optionsCallback (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41847:9)\n    at corsMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41852:7)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at viteRejectInvalidRequestMiddleware (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:63007:12)\n    at call (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41364:7)\n    at next (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41308:5)\n    at Function.handle (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41311:3)\n    at Server.app (file:///C:/Users/kmh/Desktop/smi-project/node_modules/vite/dist/node/chunks/dep-BK3b2jBa.js:41176:37)\n    at Server.emit (node:events:519:28)\n    at parserOnIncoming (node:_http_server:1173:12)\n    at HTTPParser.parserOnHeadersComplete (node:_http_common:121:17)","frame":""}
              try {
                const { ErrorOverlay } = await import("/@vite/client")
                document.body.appendChild(new ErrorOverlay(error))
              } catch {
                const h = (tag, text) => {
                  const el = document.createElement(tag)
                  el.textContent = text
                  return el
                }
                document.body.appendChild(h('h1', 'Internal Server Error'))
                document.body.appendChild(h('h2', error.message))
                document.body.appendChild(h('pre', error.stack))
                document.body.appendChild(h('p', '(Error overlay failed to load)'))
              }
            </script>
          </head>
          <body>
          </body>
        </html>
      