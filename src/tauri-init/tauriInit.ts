import { createTrayMenu } from '@/tray-menu'
import { hideMainWindowOnClose } from '@/utils/TauriUtils.ts'
import { hideMainWindowOnFirstStartUp } from '@/tauri-init/hideMainWindowOnFirstStartUp.ts'
import { log_error } from '@/invoke-apis/file-log.ts'
import { startFrpcOnAppStartUp } from '@/tauri-init/startFrpcOnAppStartUp.ts'
import { toHomePageOnWindowHide } from '@/tauri-init/toHomePageOnWindowHide.ts'

export function tauriInit() {
  Promise.resolve()
    .then(async () => {
      await hideMainWindowOnClose()
      await hideMainWindowOnFirstStartUp()
      await createTrayMenu()
      await startFrpcOnAppStartUp()
      await toHomePageOnWindowHide()
    })
    .catch((e: any) => {
      console.error(e)
      log_error(`tauriInit: ${e?.message || e}`)
    })
}
