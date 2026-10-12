import { useRef, useState, type ReactNode, type TouchEvent } from 'react'
import { useIsMobile } from '@/hooks/useIsMobile'

export function PullToRefresh({ onRefresh, children }: { onRefresh: () => Promise<unknown>; children: ReactNode }) {
  const mobile = useIsMobile()
  const startY = useRef<number | null>(null)
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  function onTouchStart(event: TouchEvent) {
    if (!mobile || window.scrollY > 8 || refreshing) return
    startY.current = event.touches[0]?.clientY ?? null
  }

  function onTouchMove(event: TouchEvent) {
    if (startY.current == null) return
    const next = (event.touches[0]?.clientY ?? startY.current) - startY.current
    if (next > 0) setPull(Math.min(next, 88))
  }

  function onTouchEnd() {
    if (pull > 64 && !refreshing) {
      setRefreshing(true)
      void onRefresh().finally(() => {
        setRefreshing(false)
        setPull(0)
      })
    } else {
      setPull(0)
    }
    startY.current = null
  }

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="overflow-hidden text-center text-xs text-muted-foreground lg:hidden" style={{ height: refreshing ? 32 : pull * 0.4 }} aria-live="polite">
        {refreshing ? 'Refreshing…' : pull > 64 ? 'Release to refresh' : pull > 12 ? 'Pull to refresh' : ''}
      </div>
      {children}
    </div>
  )
}
