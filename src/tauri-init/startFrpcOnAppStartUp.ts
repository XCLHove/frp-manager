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

  const duRun = (index = 0) => {
    if (index >= frpcList.length) return
    const frpc = frpcList[index]
    if (!frpc.followAppStart) return
    return runFrpcApi({
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
      .finally(() => duRun(index + 1))
  }
  await duRun()
}
