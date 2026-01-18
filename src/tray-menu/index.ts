import { Menu, MenuOptions } from '@tauri-apps/api/menu/menu'
import { defaultWindowIcon, getName } from '@tauri-apps/api/app'
import { TrayIcon, TrayIconOptions } from '@tauri-apps/api/tray'
import { showMainWindow } from '@/utils/TauriUtils.ts'
import { getCurrentWindow } from '@tauri-apps/api/window'

type TrayMenuItem = ReturnType<typeof defineTrayMenuItem>

type Exclude<T, E> = T extends E ? never : T

export function defineTrayMenuItem(item: Exclude<MenuOptions['items'], undefined>[number]) {
  return item
}

const trayMenuItems: TrayMenuItem[] = []
const modules = import.meta.glob(['./tray-menus/*.ts'], {
  eager: true,
  import: 'default',
})
Object.entries(modules).forEach(([path, module]) => {
  const item = module as ReturnType<typeof defineTrayMenuItem>

  path = path.replace(/^\.\/tray-menus\//g, '')
  path = path.replace(/\.ts$/g, '')

  // @ts-ignore
  item.id = item.id || path

  trayMenuItems.push(item)
})

export async function createTrayMenu() {
  const currentWindow = getCurrentWindow()
  if (currentWindow.label !== 'main') return

  const appName = await getName()

  let trayMenu = await Menu.new({
    id: appName,
    items: trayMenuItems,
  })
  let tray = await TrayIcon.getById(appName)
  if (!tray) {
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
    tray = await TrayIcon.new(options)
    await tray.setShowMenuOnLeftClick(false)
  }
  await tray.setMenu(trayMenu)
}
