import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Popover from '@radix-ui/react-popover'
import { ArrowLeft, Bell, ChevronDown, Search } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useUi } from '@/stores/ui'

const mac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.platform)

function crumbs(pathname: string): { label: string; to?: string }[] {
  if (pathname === '/dashboard') return [{ label: 'Dashboard' }]
  if (pathname === '/employees') return [{ label: 'People' }, { label: 'Employees' }]
  if (pathname === '/employees/new') return [{ label: 'Employees', to: '/employees' }, { label: 'New employee' }]
  if (pathname.startsWith('/employees/')) return [{ label: 'Employees', to: '/employees' }, { label: 'Edit employee' }]
  if (pathname === '/projects/new') return [{ label: 'Projects', to: '/projects' }, { label: 'New project' }]
  if (pathname.startsWith('/projects/')) return [{ label: 'Projects', to: '/projects' }, { label: 'Project' }]
  if (pathname === '/projects') return [{ label: 'Projects' }]
  if (pathname === '/assign') return [{ label: 'Projects' }, { label: 'Assign' }]
  if (pathname === '/design') return [{ label: 'Settings' }, { label: 'Design system' }]
  return [{ label: 'BuildPro' }]
}

export function TopBar({ title, backTo }: { title: string; backTo?: string }) {
  const { pathname } = useLocation()
  const { user, logout } = useAuth()
  const { projects, projectFilter, setProjectFilter, notifications, markNotificationsRead } = useData()
  const setCommandOpen = useUi((state) => state.setCommandOpen)
  const setShortcutsOpen = useUi((state) => state.setShortcutsOpen)
  const theme = useUi((state) => state.theme)
  const setTheme = useUi((state) => state.setTheme)
  const unread = notifications.filter((item) => !item.read).length
  const trail = crumbs(pathname)

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-card/90 px-4 backdrop-blur lg:px-6">
      {backTo ? (
        <Link to={backTo} className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted lg:hidden" aria-label="Go back">
          <ArrowLeft size={20} />
        </Link>
      ) : null}
      <div className="min-w-0 flex-1 lg:hidden">
        <p className="truncate text-base font-semibold">{title}</p>
      </div>
      <nav className="hidden min-w-0 items-center gap-2 text-sm lg:flex" aria-label="Breadcrumb">
        {trail.map((item, index) => (
          <span key={item.label} className="flex min-w-0 items-center gap-2">
            {index > 0 ? <span className="text-muted-foreground">/</span> : null}
            {item.to ? (
              <Link to={item.to} className="truncate text-muted-foreground transition-colors duration-200 hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className="truncate font-medium">{item.label}</span>
            )}
          </span>
        ))}
      </nav>
      <button
        type="button"
        onClick={() => setCommandOpen(true)}
        className="hidden h-10 max-w-md flex-1 items-center gap-2 rounded-lg border border-border bg-muted px-3 text-sm text-muted-foreground transition-colors duration-200 hover:bg-background lg:flex"
      >
        <Search size={16} />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="rounded-md border border-border bg-card px-1.5 py-0.5 text-[11px]">{mac ? '⌘K' : 'Ctrl K'}</kbd>
      </button>
      {pathname === '/employees' || pathname === '/projects' || pathname === '/assign' ? (
      <label className="hidden min-w-48 lg:block">
        <span className="sr-only">Project</span>
        <span className="relative block">
          <select
            value={projectFilter}
            onChange={(event) => setProjectFilter(event.target.value)}
            className="h-10 w-full appearance-none rounded-lg border border-border bg-card pr-9 pl-3 text-sm"
            aria-label="Project switcher"
          >
            <option value="all">All projects</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-muted-foreground" size={16} />
        </span>
      </label>
      ) : null}
      <button type="button" className="flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted lg:hidden" aria-label="Search" onClick={() => setCommandOpen(true)}>
        <Search size={20} />
      </button>
      <Popover.Root>
        <Popover.Trigger asChild>
          <button
            type="button"
            className="relative flex h-12 w-12 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-muted"
            aria-label={`Notifications${unread ? `, ${unread} unread` : ''}`}
            onClick={markNotificationsRead}
          >
            <Bell size={20} />
            {unread ? <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary" /> : null}
          </button>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Content align="end" sideOffset={8} className="z-50 w-80 rounded-xl border border-border bg-card p-2 shadow-popover">
            <p className="px-2 py-2 text-sm font-semibold">Notifications</p>
            <ul>
              {notifications.map((item) => (
                <li key={item.id} className="rounded-lg px-2 py-3 hover:bg-muted">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.time}</p>
                </li>
              ))}
            </ul>
          </Popover.Content>
        </Popover.Portal>
      </Popover.Root>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button type="button" className="flex min-h-12 items-center gap-2 rounded-lg px-1 transition-colors duration-200 hover:bg-muted lg:px-2" aria-label="Profile menu">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">{user?.name.slice(0, 1)}</span>
            <span className="hidden text-left lg:block">
              <span className="block text-sm font-semibold">{user?.name}</span>
              <span className="block text-xs text-muted-foreground">{user?.role}</span>
            </span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content align="end" className="z-50 w-60 rounded-xl border border-border bg-card p-1 shadow-popover">
            <div className="px-3 py-2">
              <p className="text-sm font-semibold">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <p className="px-3 pt-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">Appearance</p>
            {(['light', 'dark', 'system'] as const).map((mode) => (
              <DropdownMenu.Item
                key={mode}
                className="flex min-h-10 cursor-pointer items-center justify-between rounded-lg px-3 text-sm capitalize outline-none data-[highlighted]:bg-muted"
                onSelect={() => setTheme(mode)}
              >
                {mode}
                {theme === mode ? <span aria-hidden>•</span> : null}
              </DropdownMenu.Item>
            ))}
            <DropdownMenu.Item
              className="flex min-h-10 cursor-pointer items-center rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-muted"
              onSelect={() => setShortcutsOpen(true)}
            >
              Keyboard shortcuts
            </DropdownMenu.Item>
            <DropdownMenu.Item
              className="flex min-h-12 cursor-pointer items-center rounded-lg px-3 text-sm outline-none data-[highlighted]:bg-muted"
              onSelect={() => logout()}
            >
              Log out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </header>
  )
}
