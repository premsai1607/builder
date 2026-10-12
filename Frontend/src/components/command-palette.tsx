import { Command } from 'cmdk'
import { useMemo, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { sidebarGroups } from '@/components/layout/nav'
import { useData } from '@/context/DataContext'
import { soon } from '@/lib/soon'
import { useUi } from '@/stores/ui'

export function CommandPalette() {
  const open = useUi((state) => state.commandOpen)
  const setOpen = useUi((state) => state.setCommandOpen)
  const setTheme = useUi((state) => state.setTheme)
  const favorites = useUi((state) => state.favorites)
  const recent = useUi((state) => state.recent)
  const navigate = useNavigate()
  const { employees, projects } = useData()

  const favoritePeople = useMemo(
    () => favorites.map((id) => employees.find((employee) => employee.id === id)).filter((employee) => employee != null),
    [employees, favorites],
  )
  const recentPeople = useMemo(
    () =>
      recent
        .filter((id) => !favorites.includes(id))
        .map((id) => employees.find((employee) => employee.id === id))
        .filter((employee) => employee != null),
    [employees, favorites, recent],
  )

  function go(to: string) {
    setOpen(false)
    navigate(to)
  }

  function run(action: () => void) {
    setOpen(false)
    action()
  }

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      vimBindings={false}
      overlayClassName="fixed inset-0 z-50 bg-overlay"
      contentClassName="fixed top-[12%] left-1/2 z-50 w-[min(36rem,calc(100%-2rem))] -translate-x-1/2 overflow-hidden rounded-xl border border-border bg-card shadow-popover"
    >
      <Command.Input
        placeholder="Search employees, projects, or actions"
        className="h-12 w-full border-b border-border bg-transparent px-4 text-sm outline-none placeholder:text-muted-foreground"
      />
      <Command.List className="max-h-[min(24rem,60vh)] overflow-auto p-2">
        <Command.Empty className="px-3 py-6 text-center text-sm text-muted-foreground">No matches. Try an employee, a project, or “Add”.</Command.Empty>
        <Command.Group heading="Actions" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
          <PaletteItem value="Add employee" onSelect={() => go('/employees/new')}>Add employee</PaletteItem>
          <PaletteItem value="Add customer" onSelect={() => run(() => soon('Customers'))}>Add customer</PaletteItem>
          <PaletteItem value="Issue stock" onSelect={() => run(() => soon('Stock issue'))}>Issue stock</PaletteItem>
          <PaletteItem value="New project" onSelect={() => go('/projects/new')}>New project</PaletteItem>
          <PaletteItem value="Assign project" onSelect={() => go('/assign')}>Assign project</PaletteItem>
          <PaletteItem value="Light mode appearance" onSelect={() => run(() => setTheme('light'))}>Light appearance</PaletteItem>
          <PaletteItem value="Dark mode appearance" onSelect={() => run(() => setTheme('dark'))}>Dark appearance</PaletteItem>
          <PaletteItem value="System appearance" onSelect={() => run(() => setTheme('system'))}>Use system appearance</PaletteItem>
        </Command.Group>
        <Command.Group heading="Go to" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:tracking-wide [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
          {sidebarGroups.flatMap((group) =>
            group.items.map((item) =>
              item.to ? (
                <PaletteItem key={item.to} value={`Go to ${item.label} ${group.label}`} onSelect={() => go(item.to!)}>
                  {item.label}
                </PaletteItem>
              ) : (
                <PaletteItem key={item.label} value={`Go to ${item.label}`} onSelect={() => run(() => soon(item.label))}>
                  {item.label}
                </PaletteItem>
              ),
            ),
          )}
        </Command.Group>
        {favoritePeople.length ? (
          <Command.Group heading="Favorites" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
            {favoritePeople.map((employee) => (
              <PaletteItem key={`fav-${employee.id}`} value={`Favorite ${employee.name} ${employee.employeeCode}`} onSelect={() => go(`/employees?open=${employee.id}`)}>
                {employee.name}
                <span className="ml-2 text-xs text-muted-foreground">{employee.employeeCode}</span>
              </PaletteItem>
            ))}
          </Command.Group>
        ) : null}
        {recentPeople.length ? (
          <Command.Group heading="Recent" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
            {recentPeople.map((employee) => (
              <PaletteItem key={`recent-${employee.id}`} value={`Recent ${employee.name} ${employee.employeeCode}`} onSelect={() => go(`/employees?open=${employee.id}`)}>
                {employee.name}
                <span className="ml-2 text-xs text-muted-foreground">{employee.employeeCode}</span>
              </PaletteItem>
            ))}
          </Command.Group>
        ) : null}
        <Command.Group heading="Records" className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground [&_[cmdk-group-heading]]:uppercase">
          {projects.map((project) => (
            <PaletteItem key={project.id} value={`Project ${project.name} ${project.address}`} onSelect={() => go(`/projects/${project.id}`)}>
              {project.name}
            </PaletteItem>
          ))}
          {employees.map((employee) => (
            <PaletteItem key={employee.id} value={`Employee ${employee.name} ${employee.employeeCode} ${employee.department}`} onSelect={() => go(`/employees?open=${employee.id}`)}>
              {employee.name}
              <span className="ml-2 text-xs text-muted-foreground">{employee.employeeCode}</span>
            </PaletteItem>
          ))}
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}

function PaletteItem({ value, onSelect, children }: { value: string; onSelect: () => void; children: ReactNode }) {
  return (
    <Command.Item
      value={value}
      onSelect={onSelect}
      className="flex min-h-11 cursor-pointer items-center rounded-lg px-3 text-sm data-[selected=true]:bg-muted"
    >
      {children}
    </Command.Item>
  )
}
