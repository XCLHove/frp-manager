import { createPinia } from 'pinia'
import { App } from 'vue'

let pinia: ReturnType<typeof createPinia>

export function loadPinia(app: App) {
  const pinia = createPinia()
  app.use(pinia)
}

function getPinia() {
  if (pinia) return pinia
  pinia = createPinia()
  return pinia
}
