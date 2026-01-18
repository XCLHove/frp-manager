function getItem<T = any>(key: string): T | null {
  const str = localStorage.getItem(key)
  if (str === null) return null
  try {
    return JSON.parse(str).value
  } catch (e) {
    localStorage.removeItem(key)
    return null
  }
}

function setItem<T = any>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify({ value }))
}

const localStorageUtil = {
  getItem,
  setItem,
}
export default localStorageUtil
