import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export function RowMenu({
  label,
  items,
}: {
  label: string
  items: { label: string; onSelect: () => void; destructive?: boolean }[]
}) {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="flex h-12 w-12 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted" aria-label={label}>
          <MoreHorizontal size={18} />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content align="end" sideOffset={6} className="z-50 min-w-44 rounded-xl border border-border bg-card p-1 border border-border shadow-popover">
          {items.map((item) => (
            <DropdownMenu.Item
              key={item.label}
              onSelect={item.onSelect}
              className={cn(
                'flex min-h-12 cursor-pointer items-center rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-muted',
                item.destructive ? 'text-danger' : 'text-foreground',
              )}
            >
              {item.label}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
