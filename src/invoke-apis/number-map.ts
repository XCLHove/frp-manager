import { invokeWrapper } from '@/utils/invokeWrapper.ts'

export function getAndIncrement(key: string) {
  return invokeWrapper<number>('get_and_increment', { key })
}
