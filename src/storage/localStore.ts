/** Reads and parses a JSON value, returning `undefined` when storage is unavailable or corrupt. */
export const readJson = (key: string): unknown => {
  try {
    const raw = globalThis.localStorage?.getItem(key)
    return raw ? JSON.parse(raw) : undefined
  } catch {
    return undefined
  }
}

/** Serializes a value to storage, silently giving up when storage is unavailable or full. */
export const writeJson = (key: string, value: unknown): void => {
  try {
    globalThis.localStorage?.setItem(key, JSON.stringify(value))
  } catch {
    return
  }
}
