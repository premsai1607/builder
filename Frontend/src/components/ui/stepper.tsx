import { Check } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

export function FormStepper({
  steps,
  current,
  onStep,
}: {
  steps: string[]
  current: number
  onStep?: (index: number) => void
}) {
  const reduce = useReducedMotion()
  const progress = ((current + 1) / steps.length) * 100

  return (
    <div>
      <div className="mb-4 h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
        <motion.div
          className="h-full rounded-full bg-primary"
          initial={false}
          animate={{ width: `${progress}%` }}
          transition={reduce ? { duration: 0 } : { duration: 0.25, ease: 'easeOut' }}
        />
      </div>
      <ol className="flex gap-2 overflow-x-auto pb-1">
        {steps.map((step, index) => {
          const done = index < current
          const active = index === current
          return (
            <li key={step} className="min-w-36 flex-1">
              <button
                type="button"
                disabled={!onStep || index > current}
                aria-current={active ? 'step' : undefined}
                onClick={() => onStep?.(index)}
                className={cn(
                  'flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 text-left text-sm transition-colors duration-200',
                  active ? 'border-primary bg-primary-soft' : 'border-border bg-card hover:bg-muted',
                  index > current && 'cursor-default opacity-70',
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold',
                    done || active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
                  )}
                >
                  {done ? <Check size={14} aria-hidden /> : index + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Step {index + 1}</span>
                  <span className="block truncate font-medium">{step}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
