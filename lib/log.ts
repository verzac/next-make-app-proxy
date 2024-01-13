export function log(message: string, ...args: unknown[]) {
  const now = new Date()
  console.log(`${now.toLocaleString()} >> ${message}`, ...args)
}
