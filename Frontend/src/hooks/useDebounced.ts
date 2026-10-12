import { useEffect, useState } from 'react'

export function useDebounced<T>(value: T, delay = 200) {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay)
    return () => window.clearTimeout(timer)
  }, [delay, value])

  return debounced
}
