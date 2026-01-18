import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export function isEnabled() {
  return invokeWrapper<boolean>('is_enabled_auto_start')
}

export function enable() {
  return invokeWrapper<boolean>('enable_auto_start')
}

export function disable() {
  return invokeWrapper<boolean>('disable_auto_start')
}
