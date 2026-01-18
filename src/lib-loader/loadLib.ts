import { App } from 'vue'
import { loadPinia } from './loadPinia.ts'
import { loadRouter } from './loadRouter.ts'
import { loadTailwind } from './loadTailwind.ts'
import { loadCss } from '@/lib-loader/loadCss.ts'

export function loadLib(app: App) {
  loadRouter(app)
  loadTailwind(app)
  loadCss(app)
  loadPinia(app)
}
