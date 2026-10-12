import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { CommandPalette } from '@/components/command-palette'
import { BottomNav } from '@/components/layout/BottomNav'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { PageBoundary } from '@/components/page-boundary'
import { ShortcutsDialog } from '@/components/shortcuts-dialog'
import { useData } from '@/context/DataContext'
import { useUi } from '@/stores/ui'

function screenTitle(pathname: string) {
  if (pathname === '/dashboard') return { title: 'Home' }
  if (pathname === '/projects/new') return { title: 'New project', backTo: '/projects' }
  if (pathname.startsWith('/projects/')) return { title: 'Edit project', backTo: '/projects' }
  if (pathname === '/projects') return { title: 'Projects' }
  if (pathname === '/employees/new') return { title: 'New employee', backTo: '/employees' }
  if (pathname.startsWith('/employees/')) return { title: 'Edit employee', backTo: '/employees' }
  if (pathname === '/employees') return { title: 'Employees' }
  if (pathname === '/assign') return { title: 'Assign project' }
  if (pathname === '/design') return { title: 'Design system' }
  return { title: 'BuildPro' }
}

export function AppShell() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { projects, projectFilter, setProjectFilter } = useData()
  const setCommandOpen = useUi((state) => state.setCommandOpen)
  const shortcutsOpen = useUi((state) => state.shortcutsOpen)
  const setShortcutsOpen = useUi((state) => state.setShortcutsOpen)
  const toggleSidebar = useUi((state) => state.toggleSidebar)
  const screen = screenTitle(pathname)
  const form = Boolean(screen.backTo)
  const projectSwitcher = pathname === '/employees' || pathname === '/projects' || pathname === '/assign'

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const target = event.target
      const typing = target instanceof HTMLElement && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setCommandOpen(!useUi.getState().commandOpen)
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'b') {
        event.preventDefault()
        toggleSidebar()
        return
      }
      if (!typing && event.key === '?') {
        event.preventDefault()
        setShortcutsOpen(true)
      }
      if (!typing && event.key.toLowerCase() === 'n' && pathname === '/employees') {
        event.preventDefault()
        navigate('/employees/new')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [navigate, pathname, setCommandOpen, setShortcutsOpen, toggleSidebar])

  return (
    <div className="min-h-screen bg-background lg:flex">
      <a href="#content" className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:rounded-lg focus:bg-card focus:px-3 focus:py-2">
        Skip to content
      </a>
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar title={screen.title} backTo={screen.backTo} />
        {projectSwitcher ? (
          <div className="border-b border-border bg-card px-4 py-2 lg:hidden">
            <label className="block text-xs font-medium text-muted-foreground">
              Project
              <select
                value={projectFilter}
                onChange={(event) => setProjectFilter(event.target.value)}
                className="mt-1 min-h-12 w-full rounded-lg border border-border bg-card px-3 text-sm"
              >
                <option value="all">All projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        ) : null}
        <AnimatePresence mode="wait">
          <motion.main
            id="content"
            key={pathname}
            className={form ? 'flex-1 px-4 py-4 lg:px-8 lg:py-8' : 'flex-1 px-4 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-8'}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <PageBoundary resetKey={pathname}>
              <Outlet />
            </PageBoundary>
          </motion.main>
        </AnimatePresence>
        {form ? null : <BottomNav />}
      </div>
      <CommandPalette />
      <ShortcutsDialog open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  )
}
