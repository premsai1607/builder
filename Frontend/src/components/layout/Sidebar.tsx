import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavLink, useLocation } from 'react-router-dom'
import { sidebarGroups } from '@/components/layout/nav'
import { soon } from '@/lib/soon'
import { cn } from '@/lib/utils'
import { useUi } from '@/stores/ui'

function active(to: string, pathname: string) {
  if (to === '/dashboard') return pathname === '/dashboard'
  return pathname === to || pathname.startsWith(`${to}/`)
}

export function Sidebar() {
  const { pathname } = useLocation()
  const collapsed = useUi((state) => state.sidebarCollapsed)
  const toggle = useUi((state) => state.toggleSidebar)

  return (
    <aside
      className={cn(
        'sticky top-0 hidden h-screen shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 lg:flex',
        collapsed ? 'w-[76px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center gap-3 px-4', collapsed && 'justify-center px-2')}>
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">BP</span>
        {collapsed ? null : (
          <span>
            <span className="block text-sm font-semibold">BuildPro</span>
            <span className="block text-xs text-muted-foreground">Site operations</span>
          </span>
        )}
      </div>
      <nav className="flex-1 space-y-5 overflow-auto px-2 pb-4" aria-label="Main">
        {sidebarGroups.map((group) => (
          <div key={group.label}>
            {collapsed ? null : (
              <p className="px-3 pb-1 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{group.label}</p>
            )}
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon
                if (!item.to) {
                  return (
                    <li key={item.label}>
                      <button
                        type="button"
                        title={item.label}
                        onClick={() => soon(item.label)}
                        className={cn(
                          'flex min-h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted hover:text-foreground active:scale-[0.99]',
                          collapsed && 'justify-center px-0',
                        )}
                      >
                        <Icon size={18} aria-hidden />
                        {collapsed ? null : item.label}
                      </button>
                    </li>
                  )
                }
                const on = active(item.to, pathname)
                return (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      title={item.label}
                      className={cn(
                        'flex min-h-10 items-center gap-3 rounded-lg px-3 text-sm transition-colors duration-200 active:scale-[0.99]',
                        on ? 'bg-primary-soft font-medium text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                        collapsed && 'justify-center px-0',
                      )}
                    >
                      <Icon size={18} className={on ? 'text-primary-dark' : undefined} aria-hidden />
                      {collapsed ? null : item.label}
                    </NavLink>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>
      <button
        type="button"
        onClick={toggle}
        className="m-3 flex min-h-12 items-center justify-center gap-2 rounded-lg text-sm text-muted-foreground transition-colors duration-200 hover:bg-muted"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        {collapsed ? null : 'Collapse'}
      </button>
    </aside>
  )
}
