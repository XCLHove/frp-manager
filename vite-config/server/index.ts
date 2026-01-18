import { type ServerOptions } from 'vite'
import { proxy } from './proxy'
import { HOST } from '../commons/var'

export const server: ServerOptions = {
  port: 11420,
  strictPort: true,
  host: HOST || false,
  hmr: HOST
    ? {
        protocol: 'ws',
        host: HOST,
        port: 1421,
      }
    : undefined,
  watch: {
    // 3. tell vite to ignore watching `src-tauri`
    ignored: ['**/src-tauri/**'],
  },
  proxy,
}

export * from './proxy'
