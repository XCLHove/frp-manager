import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export function addFrpcApi(request: { id: string }) {
  return invokeWrapper<void>('add_frpc', request)
}

export function deleteFrpcApi(request: { id: string }) {
  return invokeWrapper<void>('delete_frpc', request)
}

export function readFrpcConfigApi(request: { id: string }) {
  return invokeWrapper<string>('read_frpc_config', request)
}

export function writeFrpcConfigApi(request: { id: string; config: string }) {
  return invokeWrapper<void>('write_frpc_config', request)
}

export function queryFrpcLogsApi(request: { id: string; orderNumber: number }) {
  return invokeWrapper<any[]>('query_frpc_logs', request)
}

export function runFrpcApi(request: { id: string; binaryFile: string; args: string }) {
  return invokeWrapper<boolean>('run_frpc', request)
}

export function stopFrpcApi(request: { id: string }) {
  return invokeWrapper<void>('stop_frpc', request)
}

export function stopAllFrpcApi() {
  return invokeWrapper<void>('stop_all_frpc')
}

export function checkFrpcIsRunningApi(request: { id: string }) {
  return invokeWrapper<boolean>('check_frpc_is_running', request)
}
