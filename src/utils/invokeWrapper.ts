import { invoke, InvokeArgs, InvokeOptions } from '@tauri-apps/api/core'
import { ElMessage } from 'element-plus'
import { log_error } from '@/invoke-apis/file-log.ts'

export function invokeWrapper<T>(
  cmd: string,
  args?: InvokeArgs,
  options?: InvokeOptions,
  customOptions?: {
    errorCallback?: (e: any) => any
  },
) {
  let errorCallback = customOptions?.errorCallback
  errorCallback ||= (e: any) => {
    const errorMessage = `${e?.message || e}`
    ElMessage.error(errorMessage)
    throw e
  }
  return invoke(cmd, args, options).catch((e: any) => {
    const errorMessage = `${e?.message || e}`
    const invokeInfo = {
      cmd,
      args,
      options,
      errorMessage,
    }
    log_error(JSON.stringify(invokeInfo, null, 4))
    return errorCallback(e)
  }) as Promise<T>
}
