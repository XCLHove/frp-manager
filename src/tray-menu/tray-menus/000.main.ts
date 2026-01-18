import { defineTrayMenuItem } from '@/tray-menu/index.ts'
import { showMainWindow } from '@/utils/TauriUtils.ts'

export default defineTrayMenuItem({
  text: '主界面',
  action(id) {
    showMainWindow()
  },
})
