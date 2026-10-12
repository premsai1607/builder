import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children?: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p> : null}
      </div>
      <div className="hidden lg:flex lg:gap-2">{children}</div>
    </div>
  )
}

export function Fab({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="fixed right-4 bottom-24 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-medium text-primary-foreground shadow-popover transition-transform duration-200 active:scale-95 lg:hidden"
    >
      +
    </button>
  )
}
