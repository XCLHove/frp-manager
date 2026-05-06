import { createTrayMenu } from '@/tray-menu'
import { hideMainWindowOnClose } from '@/utils/TauriUtils.ts'
import { hideMainWindowOnFirstStartUp } from '@/tauri-init/hideMainWindowOnFirstStartUp.ts'
import { log_error } from '@/invoke-apis/file-log.ts'
import { startFrpcOnAppStartUp } from '@/tauri-init/startFrpcOnAppStartUp.ts'
import { toHomePageOnWindowHide } from '@/tauri-init/toHomePageOnWindowHide.ts'
import { addCronJob } from 'tauri-plugin-cron'
import { cleanupFrpcLogsApi } from '@/invoke-apis/frpc.ts'

export function tauriInit() {
  Promise.resolve()
    .then(async () => {
      await hideMainWindowOnClose()
      await hideMainWindowOnFirstStartUp()
      await createTrayMenu()
      await startFrpcOnAppStartUp()
      await toHomePageOnWindowHide()
      await setupLogCleanupCron()
    })
    .catch((e: any) => {
      console.error(e)
      log_error(`tauriInit: ${e?.message || e}`)
    })
}

async function setupLogCleanupCron() {
  try {
    await addCronJob('cleanup-frpc-logs', '0 0 * * * *', () => {
      cleanupFrpcLogsApi().then((deleted) => {
        if (deleted > 0) {
          console.log(`已清理 ${deleted} 条过期 frpc 日志`)
        }
      })
    })
  } catch (_: any) {
  }
}
