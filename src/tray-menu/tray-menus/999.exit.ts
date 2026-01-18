import { defineTrayMenuItem } from '@/tray-menu/index.ts'
import { exitApp } from '@/utils/TauriUtils.ts'

export default defineTrayMenuItem({
  text: '退出',
  action(id) {
    exitApp()
  },
})
