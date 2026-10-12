import { cn } from '@/lib/utils'

const tones: Record<string, string> = {
  Active: 'bg-success-soft text-success',
  Completed: 'bg-success-soft text-success',
  Pending: 'bg-warning-soft text-warning',
  'In Progress': 'bg-info-soft text-info',
  Cancelled: 'bg-danger-soft text-danger',
  Overdue: 'bg-danger-soft text-danger',
  Inactive: 'bg-muted text-muted-foreground',
  Low: 'bg-warning-soft text-warning',
}

export function StatusChip({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex min-h-7 items-center gap-1.5 rounded-full px-2.5 text-xs font-medium', tones[status] ?? 'bg-muted text-muted-foreground')}>
      <span className="size-1.5 rounded-full bg-current" aria-hidden />
      {status}
    </span>
  )
}
