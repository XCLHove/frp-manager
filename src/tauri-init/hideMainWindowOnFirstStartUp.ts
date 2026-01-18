import { getCurrentWindow } from '@tauri-apps/api/window'
import { getAndIncrement } from '@/invoke-apis/number-map.ts'
import { getTauriStore, storeKey } from '@/utils/tauriStore.ts'
import { log_info } from '@/invoke-apis/file-log.ts'

export async function hideMainWindowOnFirstStartUp() {
  const window = getCurrentWindow()
  if (window.label !== 'main') return
  const number = await getAndIncrement(hideMainWindowOnFirstStartUp.name)
  if (number !== 1) return
  const store = await getTauriStore()
  const hideOnFirstStartUp = await store.get<boolean>(storeKey.HIDE_ON_FIRST_START_UP)
  log_info(`hideOnFirstStartUp: ${hideOnFirstStartUp}`)
  if (!hideOnFirstStartUp) return
  await window.hide()
}
