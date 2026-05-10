import { defineMenuOptions } from '@/tray-menu/index.ts'
import { exitApp } from '@/utils/TauriUtils.ts'

export default defineMenuOptions(() => ({
  text: '退出',
  action(id) {
    exitApp()
  },
}))
