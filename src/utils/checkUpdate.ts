import { check } from '@tauri-apps/plugin-updater'
import { ElMessageBox } from 'element-plus'
import router from '@/router'

export function checkUpdate() {
  check().then((update) => {
    if (!update) return
    ElMessageBox.confirm(`检测到新版本：${update.version}，是否立即前往更新？`, '更新')
      .then(() => {
        router.push('/update')
      })
      .catch(() => {})
  })
}
