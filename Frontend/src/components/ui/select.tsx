import * as Popover from '@radix-ui/react-popover'
import { Check, ChevronDown, Plus } from 'lucide-react'
import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Field } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export type SelectOption = {
  value: string
  label: string
  description?: string
}

type SelectProps = {
  label: string
  required?: boolean
  optional?: boolean
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  error?: string | null
  valid?: boolean
  creatable?: boolean
  onCreate?: (label: string) => void
  onAddNew?: () => void
  addLabel?: string
  pinned?: SelectOption[]
}

export function Select({
  label,
  required,
  optional,
  value,
  onChange,
  options,
  placeholder = 'Select',
  error,
  valid,
  creatable,
  onCreate,
  onAddNew,
  addLabel = 'Add new',
  pinned = [],
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)
  const [draft, setDraft] = useState('')
  const [adding, setAdding] = useState(false)
  const listId = useId()
  const selected = options.find((option) => option.value === value)
  const visible = useMemo(() => {
    const text = query.trim().toLowerCase()
    const pin = pinned.filter((option) => options.some((item) => item.value === option.value))
    const rest = options.filter((option) => !pin.some((item) => item.value === option.value))
    const all = [...pin, ...rest]
    if (!text) return all
    return all.filter((option) => `${option.label} ${option.description ?? ''}`.toLowerCase().includes(text))
  }, [options, pinned, query])

  useEffect(() => {
    setActive(0)
  }, [query, open])

  const optionRefs = useRef<Array<HTMLButtonElement | null>>([])
  useEffect(() => {
    optionRefs.current[active]?.scrollIntoView({ block: 'nearest' })
  }, [active])

  function choose(next: string) {
    onChange(next)
    setOpen(false)
    setQuery('')
    setAdding(false)
  }

  function create() {
    const labelText = draft.trim()
    if (!labelText || !onCreate) return
    onCreate(labelText)
    setDraft('')
    setAdding(false)
    setOpen(false)
  }

  return (
    <Field label={label} required={required} optional={optional} error={error} valid={valid && !open}>
      <Popover.Root
        open={open}
        onOpenChange={(next) => {
          setOpen(next)
          if (!next) {
            setQuery('')
            setAdding(false)
          }
        }}
      >
        <Popover.Trigger asChild>
          <button
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={listId}
            className={cn(
              'flex min-h-12 w-full items-center justify-between gap-3 rounded-lg border bg-card px-3 text-left text-sm',
              error ? 'border-danger' : valid ? 'border-success' : 'border-border',
            )}
          >
            <span className={selected ? 'text-foreground' : 'text-muted-foreground'}>{selected?.label ?? placeholder}</span>
            <span className="flex items-center gap-1">
              {valid ? <Check size={18} className="text-success" aria-hidden /> : null}
              <ChevronDown size={18} className="text-muted-foreground" aria-hidden />
            </span>
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content
            align="start"
            sideOffset={6}
            className="z-50 w-[var(--radix-popover-trigger-width)] rounded-xl border border-border bg-card p-2 shadow-popover"
          >
            <input
              autoFocus
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              aria-label={`Search ${label}`}
              className="mb-2 min-h-12 w-full rounded-lg border border-border px-3 text-sm outline-none"
              onKeyDown={(event) => {
                if (event.key === 'ArrowDown') {
                  event.preventDefault()
                  setActive((index) => Math.min(index + 1, Math.max(visible.length - 1, 0)))
                }
                if (event.key === 'ArrowUp') {
                  event.preventDefault()
                  setActive((index) => Math.max(index - 1, 0))
                }
                if (event.key === 'Enter' && visible[active]) {
                  event.preventDefault()
                  choose(visible[active].value)
                }
              }}
            />
            <div id={listId} role="listbox" aria-label={label} className="max-h-56 overflow-auto">
              {visible.length === 0 ? <p className="px-2 py-3 text-sm text-muted-foreground">No matches</p> : null}
              {visible.map((option, index) => (
                <button
                  key={option.value}
                  ref={(node) => {
                    optionRefs.current[index] = node
                  }}
                  type="button"
                  role="option"
                  aria-selected={option.value === value}
                  className={cn(
                    'flex min-h-12 w-full flex-col items-start justify-center rounded-lg px-3 text-left text-sm',
                    index === active ? 'bg-primary-soft' : 'hover:bg-muted',
                  )}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => choose(option.value)}
                >
                  <span className="font-medium">{option.label}</span>
                  {option.description ? <span className="text-xs text-muted-foreground">{option.description}</span> : null}
                </button>
              ))}
            </div>
            {creatable || onAddNew ? (
              <div className="mt-2 border-t border-border pt-2">
                {adding ? (
                  <div className="flex gap-2">
                    <input
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      placeholder={`New ${label.toLowerCase()}`}
                      aria-label={`New ${label}`}
                      className="min-h-12 flex-1 rounded-lg border border-border px-3 text-sm outline-none"
                      onKeyDown={(event) => {
                        if (event.key === 'Enter') {
                          event.preventDefault()
                          create()
                        }
                      }}
                    />
                    <button type="button" className="min-h-12 rounded-lg bg-primary px-3 text-sm font-semibold text-white" onClick={create}>
                      Add
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="flex min-h-12 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-semibold text-primary-dark"
                    onClick={() => {
                      if (onAddNew && !creatable) {
                        setOpen(false)
                        onAddNew()
                        return
                      }
                      setAdding(true)
                    }}
                  >
                    <Plus size={16} /> {addLabel}
                  </button>
                )}
              </div>
            ) : null}
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
    </Field>
  )
}
