import useFrpStore from '@/stores/useFrpStore.ts'
import { simpleClone } from '@/utils/simpleClone.ts'
import { runFrpcApi } from '@/invoke-apis/frpc.ts'
import { log_error, log_info } from '@/invoke-apis/file-log.ts'
import { getAndIncrement } from '@/invoke-apis/number-map.ts'

export async function startFrpcOnAppStartUp() {
  const number = await getAndIncrement(startFrpcOnAppStartUp.name)
  if (number !== 1) return

  const frpStore = useFrpStore()
  await frpStore.refresh()
  const frpcList = simpleClone(frpStore.frpcList)

  for (const frpc of frpcList) {
    if (!frpc.followAppStart) continue
    await runFrpcApi({
      id: frpc.id,
      args: frpc.startUpArgs,
      binaryFile: frpc.binaryFile,
    })
      .then(() => {
        log_info(`startFrpcOnAppStartUp: 启动 frpc 成功【${frpc.name}】`)
      })
      .catch((e) => {
        console.error(e)
        log_error(`startFrpcOnAppStartUp: ${e?.message || e}`)
      })
  }
}
