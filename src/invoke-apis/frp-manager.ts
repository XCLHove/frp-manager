import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export function writeConfigApi(config: string) {
  return invokeWrapper<void>('write_config', {
    config: config,
  })
}

export function readConfigApi() {
  return invokeWrapper<string>('read_config')
}
