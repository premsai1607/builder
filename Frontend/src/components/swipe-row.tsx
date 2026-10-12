import { motion, useMotionValue, useReducedMotion, animate } from 'framer-motion'
import type { ReactNode } from 'react'

type SwipeAction = {
  label: string
  onClick: () => void
  tone?: 'danger'
}

export function SwipeRow({ children, actions }: { children: ReactNode; actions: SwipeAction[] }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const width = actions.length * 72

  if (reduce) {
    return (
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-card">
        {children}
        <div className="flex border-t border-border">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`min-h-12 flex-1 text-sm font-medium ${action.tone === 'danger' ? 'text-danger' : 'text-foreground'}`}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="relative overflow-hidden rounded-xl">
      <div className="absolute inset-y-0 right-0 flex">
        {actions.map((action) => (
          <button
            key={action.label}
            type="button"
            className={`h-full w-[72px] text-xs font-semibold ${action.tone === 'danger' ? 'bg-danger-solid text-white' : 'bg-primary text-primary-foreground'}`}
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ))}
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -width, right: 0 }}
        dragElastic={0.08}
        style={{ x }}
        onDragEnd={(_, info) => {
          const next = info.offset.x < -width / 2 ? -width : 0
          animate(x, next, { duration: 0.2 })
        }}
        className="relative bg-card"
      >
        {children}
      </motion.div>
    </div>
  )
}
