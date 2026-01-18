import { type ProxyOptions } from 'vite'

const createProxyConfig = (sourceBasePath: string, targetBasePath: string) => {
  const pathReplace = (path: string) => path.replace(new RegExp(`^${sourceBasePath}`), '')

  const proxyOptions: ProxyOptions = {
    target: targetBasePath,
    rewrite: (requestPath) => pathReplace(requestPath),
    changeOrigin: true,
    configure: (proxy, _options) => {
      proxy.on('proxyReq', (_proxyReq, req, res) => {
        const requestPath = pathReplace(req.url || '')
        let proxyTarget = `${targetBasePath}/${requestPath}`
        proxyTarget = proxyTarget.replace(/\/+/g, '/')
        res.setHeader('X-Proxy-Target', proxyTarget)
      })
    },
  }

  return {
    [sourceBasePath]: proxyOptions,
  }
}

export const proxy: Record<string, string | ProxyOptions> = {}
