import { ref, watch } from 'vue'

export const sessionStorageRef = <T>(key: string, defaultValue: T) => {
  const sessionStorageStrValue = sessionStorage.getItem(key)
  if (sessionStorageStrValue) {
    defaultValue = JSON.parse(sessionStorageStrValue).value
  }
  const value = ref(defaultValue)

  watch(
    value,
    (newValue) => {
      sessionStorage.setItem(key, JSON.stringify({ value: newValue }))
    },
    {
      deep: true,
    },
  )

  return value
}
