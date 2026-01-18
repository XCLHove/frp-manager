import { load } from '@tauri-apps/plugin-store'

export const storeKey = {
  HIDE_ON_FIRST_START_UP: 'hideOnFirstStartUp',
}

let store: ReturnType<typeof load> | null = null

export function getTauriStore() {
  if (!store) {
    store = load('store/frp_manager.bin')
  }
  return store
}
