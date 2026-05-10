import { defineMenuOptions } from '@/tray-menu/index.ts'
import { showMainWindow } from '@/utils/TauriUtils.ts'

export default defineMenuOptions(() => ({
  text: '主界面',
  action(id) {
    showMainWindow()
  },
}))
