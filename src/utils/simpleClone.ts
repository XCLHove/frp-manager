export function simpleClone<T = any>(data: T) {
  if (!data) return data
  return JSON.parse(JSON.stringify(data)) as T
}
