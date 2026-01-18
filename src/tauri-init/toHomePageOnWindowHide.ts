import localStorageUtil from '@/utils/localStorageUtil.ts'
import { getCurrentWindow } from '@tauri-apps/api/window'
import router from '@/router'

export function toHomePageOnWindowHide() {
  const window = getCurrentWindow()
  if (window.label !== 'main') return

  const timerKey = 'toHomePageOnWindowHide:timer'
  let timer: ReturnType<typeof setInterval> | null = localStorageUtil.getItem(timerKey)
  if (timer !== null) clearInterval(timer)
  timer = setInterval(async () => {
    const isVisible = await window.isVisible()
    if (isVisible) return
    await router.push('/')
  }, 10 * 1000)
  localStorageUtil.setItem(timerKey, timer)
}
