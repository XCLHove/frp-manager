import { sendNotification } from '@tauri-apps/plugin-notification'
import { getName } from '@tauri-apps/api/app'

export const getNotificationId = (() => {
  let idIndex = 0
  return () => idIndex++
})()

export const simpleNotification = async (message?: string) => {
  sendNotification({
    title: await getName(),
    body: message,
  })
}
