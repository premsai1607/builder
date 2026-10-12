import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'

export function EmptyArt() {
  return (
    <svg width="168" height="120" viewBox="0 0 168 120" aria-hidden className="mx-auto">
      <rect x="18" y="78" width="132" height="10" rx="5" fill="var(--muted)" />
      <rect x="46" y="38" width="76" height="48" rx="8" fill="var(--card)" stroke="var(--foreground)" strokeWidth="2" />
      <path d="M58 38V28h20v10" fill="none" stroke="var(--foreground)" strokeWidth="2" />
      <rect x="58" y="52" width="16" height="12" rx="2" fill="var(--primary)" />
      <rect x="80" y="52" width="28" height="8" rx="2" fill="var(--muted)" />
      <rect x="80" y="66" width="20" height="8" rx="2" fill="var(--muted)" />
      <circle cx="124" cy="34" r="14" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="2" />
      <path d="M124 28v8M120 32h8" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-xl bg-card px-6 py-14 text-center border border-border shadow-card">
      <EmptyArt />
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {actionLabel && onAction ? (
        <Button className="mt-6" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }: { title?: string; description: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-danger/20 bg-card px-6 py-14 text-center border border-border shadow-card" role="alert">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-danger-soft text-2xl text-danger">!</div>
      <h2 className="mt-4 text-lg font-semibold">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      {onRetry ? (
        <Button className="mt-6" variant="secondary" onClick={onRetry}>
          Try again
        </Button>
      ) : null}
    </div>
  )
}

export function PageFrame({ children }: { children: ReactNode }) {
  return <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">{children}</div>
}
