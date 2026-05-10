import { listen, type UnlistenFn } from '@tauri-apps/api/event'
import { invokeWrapper } from '@/utils/invokeWrapper.ts'

type FrpcEventCallback = (payload: Record<string, unknown>) => void

const listenerCount = new Map<string, number>()

export async function registerFrpcEvent(
  type: 'log' | 'status',
  id: string,
  callback: FrpcEventCallback,
): Promise<UnlistenFn> {
  const eventName = `frpc-${id}-${type}`

  const key = id
  const count = listenerCount.get(key) ?? 0
  if (count === 0) {
    await invokeWrapper<void>('register_frpc_event', { id })
  }
  listenerCount.set(key, count + 1)

  const unlisten = await listen<Record<string, unknown>>(eventName, (event) => {
    callback(event.payload)
  })

  return () => {
    unlisten()
    const newCount = (listenerCount.get(key) ?? 1) - 1
    if (newCount <= 0) {
      listenerCount.delete(key)
      invokeWrapper<void>('unregister_frpc_event', { id })
    } else {
      listenerCount.set(key, newCount)
    }
  }
}
