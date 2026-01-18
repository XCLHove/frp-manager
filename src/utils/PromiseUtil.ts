export function sleep(ms: number = 0) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms))
}

export function sleepAsync(ms: number = 0) {
  const start = Date.now()
  while (Date.now() - start <= ms) {}
}
