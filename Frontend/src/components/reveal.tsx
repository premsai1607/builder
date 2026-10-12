import { Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'

export function Reveal({ value, mask, label }: { value: string; mask: string; label: string }) {
  const [open, setOpen] = useState(false)
  return (
    <span className="inline-flex items-center gap-2">
      <span className="tabular-nums">{open ? value : mask}</span>
      <button
        type="button"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground"
        aria-label={open ? `Hide ${label}` : `Show ${label}`}
        aria-pressed={open}
        onClick={() => setOpen((current) => !current)}
      >
        {open ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </span>
  )
}
