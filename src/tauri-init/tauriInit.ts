import { createTrayMenu } from '@/tray-menu'
import { hideMainWindowOnClose } from '@/utils/TauriUtils.ts'
import { hideMainWindowOnFirstStartUp } from '@/tauri-init/hideMainWindowOnFirstStartUp.ts'
import { log_error } from '@/invoke-apis/file-log.ts'
import { startFrpcOnAppStartUp } from '@/tauri-init/startFrpcOnAppStartUp.ts'
import { toHomePageOnWindowHide } from '@/tauri-init/toHomePageOnWindowHide.ts'
import { setupLogCleanupCron } from '@/tauri-init/setupLogCleanupCron.ts'
import { requestPermission } from '@tauri-apps/plugin-notification'
import { simpleNotification } from '@/utils/tauriNotificationUtils.ts'
import { startupNotification } from '@/tauri-init/startupNotification.ts'

export function tauriInit() {
  Promise.resolve()
    .then(async () => {
      await requestPermission()
      await hideMainWindowOnClose()
      await hideMainWindowOnFirstStartUp()
      await createTrayMenu()
      await startFrpcOnAppStartUp()
      await toHomePageOnWindowHide()
      await setupLogCleanupCron()
      await startupNotification()
    })
    .catch((e: any) => {
      console.error(e)
      log_error(`tauriInit: ${e?.message || e}`)
    })
}
