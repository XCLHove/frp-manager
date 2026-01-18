import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export function log_debug(content: string) {
  return invokeWrapper<void>('log_debug', { content })
}

export function log_info(content: string) {
  return invokeWrapper<void>('log_info', {
    content,
  })
}

export function log_warn(content: string) {
  return invokeWrapper<void>('log_warn', { content })
}

export function log_error(content: string) {
  return invokeWrapper<void>('log_error', { content })
}
