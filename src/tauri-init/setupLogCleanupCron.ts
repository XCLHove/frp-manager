import { addCronJob } from 'tauri-plugin-cron'
import { cleanupFrpcLogsApi } from '@/invoke-apis/frpc.ts'

export async function setupLogCleanupCron() {
  await addCronJob('cleanup-frpc-logs', '0 0 * * * *', () => {
    cleanupFrpcLogsApi({
      keepCount: 100,
      id: '',
    }).catch((_) => {})
  })
}
