import { useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

export function useCount(value: number) {
  const reduce = useReducedMotion()
  const [current, setCurrent] = useState(reduce ? value : 0)

  useEffect(() => {
    if (reduce) {
      setCurrent(value)
      return
    }
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / 700)
      const eased = 1 - (1 - progress) ** 3
      setCurrent(value * eased)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduce, value])

  return current
}

export function CountUp({ value, format }: { value: number; format: (value: number) => string }) {
  return <>{format(useCount(value))}</>
}
