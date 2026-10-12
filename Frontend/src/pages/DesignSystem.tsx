import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { PageFrame } from '@/components/ui/empty-state'
import { StatusChip } from '@/components/ui/status-chip'
import { useUi, type ThemeMode } from '@/stores/ui'

const oranges = ['bg-orange-50', 'bg-orange-100', 'bg-orange-200', 'bg-orange-300', 'bg-orange-400', 'bg-orange-500', 'bg-orange-600', 'bg-orange-700', 'bg-orange-800', 'bg-orange-900']
const slates = ['bg-slate-50', 'bg-slate-100', 'bg-slate-200', 'bg-slate-300', 'bg-slate-400', 'bg-slate-500', 'bg-slate-600', 'bg-slate-700', 'bg-slate-800', 'bg-slate-900']
const semantics = [
  ['Success', 'bg-success-soft text-success'],
  ['Warning', 'bg-warning-soft text-warning'],
  ['Danger', 'bg-danger-soft text-danger'],
  ['Info', 'bg-info-soft text-info'],
]

export function DesignSystem() {
  const theme = useUi((state) => state.theme)
  const setTheme = useUi((state) => state.setTheme)

  return (
    <PageFrame>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Design system</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Every color on this page comes from a CSS variable. Components use those tokens, so light and dark stay in step.
        </p>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Appearance</h2>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Theme">
          {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => (
            <Button key={mode} variant={theme === mode ? 'primary' : 'secondary'} aria-pressed={theme === mode} onClick={() => setTheme(mode)}>
              {mode}
            </Button>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Primary scale</h2>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {oranges.map((className) => (
            <div key={className}>
              <div className={`h-14 rounded-lg border border-border ${className}`} />
              <p className="mt-1 text-xs text-muted-foreground">{className.replace('bg-orange-', '')}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Slate neutrals</h2>
        <div className="mt-3 grid grid-cols-5 gap-2 sm:grid-cols-10">
          {slates.map((className) => (
            <div key={className}>
              <div className={`h-14 rounded-lg border border-border ${className}`} />
              <p className="mt-1 text-xs text-muted-foreground">{className.replace('bg-slate-', '')}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Semantic</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {semantics.map(([label, className]) => (
            <span key={label} className={`inline-flex min-h-8 items-center rounded-full px-3 text-xs font-medium ${className}`}>
              {label}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-5 shadow-card">
        <h2 className="text-sm font-semibold">Type</h2>
        <p className="mt-4 text-2xl font-semibold tracking-tight">Page title, 24px</p>
        <p className="mt-2 text-lg font-medium">Section, 16px</p>
        <p className="mt-2 text-sm">Body copy stays at 14px, with the slate foreground and a quieter secondary line.</p>
        <p className="mt-1 text-xs text-muted-foreground">Caption, 12px</p>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold">Buttons</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold">Fields</h2>
          <div className="mt-4 grid gap-4">
            <Input label="Valid phone" value="9845012345" valid readOnly onChange={() => undefined} />
            <Input label="Email" value="not-an-email" error="Enter a valid email address." readOnly onChange={() => undefined} />
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold">Status</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {['Active', 'Pending', 'In Progress', 'Completed', 'Cancelled', 'Inactive'].map((status) => (
            <StatusChip key={status} status={status} />
          ))}
        </div>
      </section>
    </PageFrame>
  )
}
