import { useEffect, useState } from 'react'

export function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia('(max-width: 1023px)').matches)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 1023px)')
    const onChange = () => setMobile(media.matches)
    media.addEventListener('change', onChange)
    return () => media.removeEventListener('change', onChange)
  }, [])

  return mobile
}
