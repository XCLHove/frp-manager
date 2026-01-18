import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export function runFrpDocServerApi() {
  return invokeWrapper<string>('run_frp_doc_server')
}
