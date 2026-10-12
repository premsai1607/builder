import { Building2, LayoutDashboard, Menu, Package, ShoppingBag } from 'lucide-react'
import { useState, type ComponentType } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { sidebarGroups, materialLinks, salesLinks } from '@/components/layout/nav'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { soon } from '@/lib/soon'
import { cn } from '@/lib/utils'

const tabs = [
  { label: 'Home', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', to: '/projects', icon: Building2 },
  { label: 'Sales', sheet: 'sales' as const, icon: ShoppingBag },
  { label: 'Materials', sheet: 'materials' as const, icon: Package },
  { label: 'More', sheet: 'more' as const, icon: Menu },
]

export function BottomNav() {
  const { pathname } = useLocation()
  const [sheet, setSheet] = useState<'sales' | 'materials' | 'more' | null>(null)
  const moreGroups = sidebarGroups.filter((group) => ['Projects', 'People', 'Finance', 'Settings'].includes(group.label))

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Primary">
        <ul className="grid grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            if (tab.to) {
              const on = tab.to === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(tab.to)
              return (
                <li key={tab.label}>
                  <NavLink to={tab.to} className={cn('flex min-h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 active:scale-95', on ? 'text-primary-dark' : 'text-muted-foreground')}>
                    <Icon size={20} aria-hidden />
                    {tab.label}
                  </NavLink>
                </li>
              )
            }
            const sectionOn =
              (tab.sheet === 'more' && (pathname.startsWith('/employees') || pathname.startsWith('/assign'))) || false
            return (
              <li key={tab.label}>
                <button
                  type="button"
                  className={cn('flex min-h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-200 active:scale-95', sectionOn || sheet === tab.sheet ? 'text-primary-dark' : 'text-muted-foreground')}
                  aria-expanded={sheet === tab.sheet}
                  onClick={() => setSheet(tab.sheet ?? null)}
                >
                  <Icon size={20} aria-hidden />
                  {tab.label}
                </button>
              </li>
            )
          })}
        </ul>
      </nav>
      <BottomSheet open={sheet === 'sales'} onClose={() => setSheet(null)} title="Sales">
        <SheetLinks items={salesLinks} onClose={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === 'materials'} onClose={() => setSheet(null)} title="Materials">
        <SheetLinks items={materialLinks} onClose={() => setSheet(null)} />
      </BottomSheet>
      <BottomSheet open={sheet === 'more'} onClose={() => setSheet(null)} title="More">
        <div className="space-y-5">
          {moreGroups.map((group) => (
            <div key={group.label}>
              <p className="px-1 text-xs font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</p>
              <SheetLinks
                items={group.items.filter((item) => item.to !== '/projects')}
                onClose={() => setSheet(null)}
              />
            </div>
          ))}
        </div>
      </BottomSheet>
    </>
  )
}

function SheetLinks({
  items,
  onClose,
}: {
  items: { label: string; to?: string; icon: ComponentType<{ size?: number }> }[]
  onClose: () => void
}) {
  return (
    <ul className="mt-1">
      {items.map((item) => {
        const Icon = item.icon
        if (!item.to) {
          return (
            <li key={item.label}>
              <button
                type="button"
                className="flex min-h-12 w-full items-center gap-3 rounded-lg px-2 text-left text-sm transition-colors duration-200 hover:bg-muted active:scale-[0.99]"
                onClick={() => soon(item.label)}
              >
                <Icon size={18} />
                {item.label}
              </button>
            </li>
          )
        }
        return (
          <li key={item.label}>
            <NavLink to={item.to} onClick={onClose} className="flex min-h-12 items-center gap-3 rounded-lg px-2 text-sm font-medium transition-colors duration-200 hover:bg-muted active:scale-[0.99]">
              <Icon size={18} />
              {item.label}
            </NavLink>
          </li>
        )
      })}
    </ul>
  )
}
