import { useEffect, useState } from 'react'

export function usePageReady() {
  const [status, setStatus] = useState<'loading' | 'ready'>('loading')

  useEffect(() => {
    const timer = window.setTimeout(() => setStatus('ready'), 400)
    return () => window.clearTimeout(timer)
  }, [])

  return status
}
