import { Menu, MenuOptions } from '@tauri-apps/api/menu/menu'
import { defaultWindowIcon, getName } from '@tauri-apps/api/app'
import { TrayIcon, TrayIconOptions } from '@tauri-apps/api/tray'
import { showMainWindow } from '@/utils/TauriUtils.ts'
import { getCurrentWindow } from '@tauri-apps/api/window'

type MenuOptionsItem = NonNullable<MenuOptions['items']>[number]

const MenuOptionsItemList: Array<MenuOptionsItem> = []
const modules = import.meta.glob(['./tray-menus/*.ts'], {
  eager: true,
  import: 'default',
})
Object.entries(modules).forEach(([_path, module]) => {
  const itemGetter = module as ReturnType<typeof defineMenuOptions>
  const item = itemGetter()
  MenuOptionsItemList.push(item)
})

export function defineMenuOptions(getter: () => MenuOptionsItem) {
  return getter
}

export async function createTrayMenu() {
  const currentWindow = getCurrentWindow()
  if (currentWindow.label !== 'main') return

  const appName = await getName()

  // 移除已有托盘图标，确保 action 回调的 Channel 是新的
  // 避免 HMR 重载页面后 Rust 端通道失效导致 "Couldn't find callback id" 警告
  const existingTray = await TrayIcon.getById(appName)
  if (existingTray) {
    await TrayIcon.removeById(appName)
  }

  let trayMenu = await Menu.new({
    id: appName,
    items: MenuOptionsItemList,
  })
  const options: TrayIconOptions = {
    id: appName,
    title: appName,
    tooltip: appName,
    icon: (await defaultWindowIcon()) as any,
    action(event) {
      switch (event.type) {
        case 'DoubleClick': {
          showMainWindow()
          break
        }
      }
    },
  }
  const tray = await TrayIcon.new(options)
  await tray.setShowMenuOnLeftClick(false)
  await tray.setMenu(trayMenu)
}
