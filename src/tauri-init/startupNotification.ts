import { simpleNotification } from '@/utils/tauriNotificationUtils.ts'
import { getAndIncrement } from '@/invoke-apis/number-map.ts'

export async function startupNotification() {
  const n = await getAndIncrement(startupNotification.name)
  if (n > 1) return
  await simpleNotification('已启动！')
}
