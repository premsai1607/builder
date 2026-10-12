import type { ReactNode } from 'react'
import { Sparkline } from '@/components/sparkline'

export function StatCard({
  label,
  value,
  hint,
  trend,
  spark,
}: {
  label: string
  value: ReactNode
  hint: string
  trend?: ReactNode
  spark: number[]
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{label}</p>
        <Sparkline data={spark} />
      </div>
      <p className="mt-3 text-[1.75rem] leading-none font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-2 text-xs text-muted-foreground">
        {trend}
        {trend ? ' · ' : null}
        {hint}
      </p>
    </article>
  )
}
