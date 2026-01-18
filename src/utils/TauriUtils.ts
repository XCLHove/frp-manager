import { getAllWindows, getCurrentWindow } from '@tauri-apps/api/window'
import { exit } from '@tauri-apps/plugin-process'
import { stopAllFrpcApi } from '@/invoke-apis/frpc.ts'

export function showMainWindow() {
  return getAllWindows().then((windows) => {
    for (let window of windows) {
      if (window.label !== 'main') continue
      return window.show().then(() => window.setFocus())
    }
  })
}

export async function hideMainWindowOnClose() {
  const currentWindow = getCurrentWindow()
  if (currentWindow.label !== 'main') return
  await currentWindow.onCloseRequested((event) => {
    event.preventDefault()
    currentWindow.hide()
  })
}

export async function exitApp(code?: number) {
  await stopAllFrpcApi()
  return exit(code)
}
