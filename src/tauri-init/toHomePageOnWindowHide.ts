import { addCronJob } from 'tauri-plugin-cron'
import { getCurrentWindow } from '@tauri-apps/api/window'
import router from '@/router'

export async function toHomePageOnWindowHide() {
  await addCronJob('to-home-page-on-window-hide', '0 * * * * *', async () => {
    const window = getCurrentWindow()
    if (window.label !== 'main') return
    const isVisible = await window.isVisible()
    if (isVisible) return
    await router.push('/')
  })
}
