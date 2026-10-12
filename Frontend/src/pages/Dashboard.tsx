import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { CountUp } from '@/components/count-up'
import { Button } from '@/components/ui/button'
import { ErrorState, PageFrame } from '@/components/ui/empty-state'
import { DashboardSkeleton } from '@/components/ui/skeleton'
import { StatCard } from '@/components/ui/stat-card'
import { StatusChip } from '@/components/ui/status-chip'
import { useAuth } from '@/context/AuthContext'
import { useData } from '@/context/DataContext'
import { useDashboardQuery } from '@/lib/employee-api'
import { formatInr } from '@/lib/format'
import { soon } from '@/lib/soon'

function compactInr(value: number) {
  const sign = value < 0 ? '-' : ''
  const amount = Math.abs(value)
  if (amount >= 10000000) return `${sign}₹${(amount / 10000000).toFixed(1)} Cr`
  if (amount >= 100000) return `${sign}₹${(amount / 100000).toFixed(1)} L`
  return `${sign}${formatInr(amount)}`
}

function trendLabel(series: number[] | undefined, money = false, lowerIsBetter = false) {
  if (!series || series.length < 2) return <span>No change</span>
  const last = series.at(-1) ?? 0
  const previous = series.at(-2) ?? last
  const diff = last - previous
  if (diff === 0) return <span>No change</span>
  const good = lowerIsBetter ? diff < 0 : diff > 0
  return (
    <span className={good ? 'text-success' : 'text-danger'}>
      {diff > 0 ? '+' : ''}
      {money ? compactInr(diff) : diff} vs last month
    </span>
  )
}

export function Dashboard() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const { user } = useAuth()
  const { projects } = useData()
  const query = useDashboardQuery()
  const [done, setDone] = useState<string[]>([])

  if (query.isPending) {
    return (
      <PageFrame>
        <DashboardSkeleton />
      </PageFrame>
    )
  }

  if (query.isError || !query.data) {
    return <ErrorState description="The dashboard could not be loaded." onRetry={() => void query.refetch()} />
  }

  const stats = query.data
  const hour = new Date().getHours()
  const hello = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const projectList = Array.isArray(projects) ? projects : []
  const activeCount = projectList.filter((project) => project.status === 'Active' || project.status === 'In Progress').length
  const stock = stats.lowStock ?? []
  const tasks = stats.tasks ?? []
  const bills = stats.dueBills ?? []
  const cashflow = stats.cashflow ?? []
  const trends = stats.trends
  const firstName = user?.name?.split(' ')[0] || 'there'
  const today = new Intl.DateTimeFormat('en-IN', { weekday: 'long', day: 'numeric', month: 'long' }).format(new Date())

  return (
    <PageFrame>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {hello}, {firstName}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">{today}. Here is what needs a decision.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => navigate('/employees/new')}>Add employee</Button>
          <Button variant="secondary" onClick={() => navigate('/projects/new')}>New project</Button>
          <Button variant="secondary" onClick={() => navigate('/assign')}>Assign project</Button>
          <Button variant="secondary" onClick={() => soon('Stock issue')}>Issue stock</Button>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-label="Summary">
        <StatCard label="Active projects" value={<CountUp value={activeCount} format={(value) => String(Math.round(value))} />} hint="On site or in progress" trend={trendLabel(trends?.projects)} spark={trends?.projects ?? []} />
        <StatCard label="Today's follow-ups" value={<CountUp value={stats.followUpsToday} format={(value) => String(Math.round(value))} />} hint="Calls and site visits" trend={trendLabel(trends?.followUps)} spark={trends?.followUps ?? []} />
        <StatCard label="Purchase requests" value={<CountUp value={stats.pendingPurchaseRequests} format={(value) => String(Math.round(value))} />} hint="Waiting for approval" trend={trendLabel(trends?.purchases)} spark={trends?.purchases ?? []} />
        <StatCard label="Payments due" value={<CountUp value={stats.paymentsDueAmount} format={(value) => formatInr(Math.round(value))} />} hint={`${stats.paymentsDue} bills this week`} trend={trendLabel(trends?.payments, true, true)} spark={trends?.payments ?? []} />
      </section>

      <section className="grid gap-4 lg:grid-cols-5">
        <article className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Cash in and out</h2>
            <p className="text-xs text-muted-foreground">
              <span className="mr-3 inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-success" /> In</span>
              <span className="inline-flex items-center gap-1"><span className="size-1.5 rounded-full bg-primary" /> Out</span>
            </p>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%" initialDimension={{ width: 480, height: 240 }}>
              <BarChart data={cashflow} barGap={4}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tickFormatter={compactInr} tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} axisLine={false} tickLine={false} width={72} />
                <Tooltip
                  formatter={(value) => formatInr(Number(value ?? 0))}
                  contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--foreground)' }}
                />
                <Bar dataKey="inflow" name="Cash in" fill="var(--success)" radius={[4, 4, 0, 0]} isAnimationActive={!reduce} />
                <Bar dataKey="outflow" name="Cash out" fill="var(--primary)" radius={[4, 4, 0, 0]} isAnimationActive={!reduce} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-card lg:col-span-2">
          <h2 className="text-sm font-semibold">Today's tasks</h2>
          <ul className="mt-3 space-y-1">
            {tasks.map((task) => {
              const checked = done.includes(task.id)
              return (
                <li key={task.id}>
                  <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg px-1 py-2 hover:bg-muted">
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={checked}
                      onChange={() => setDone((current) => (current.includes(task.id) ? current.filter((id) => id !== task.id) : [...current, task.id]))}
                    />
                    <span>
                      <span className={`block text-sm ${checked ? 'text-muted-foreground line-through' : 'font-medium'}`}>{task.title}</span>
                      <span className="block text-xs text-muted-foreground">{task.detail}</span>
                    </span>
                  </label>
                </li>
              )
            })}
          </ul>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold">Project progress</h2>
          <ul className="mt-4 space-y-4">
            {projectList.length === 0 ? <li className="text-sm text-muted-foreground">No projects in this view.</li> : null}
            {projectList.map((project) => (
              <li key={project.id}>
                <Link to={`/projects/${project.id}`} className="block rounded-lg transition-colors duration-200 hover:bg-muted">
                  <span className="flex items-center justify-between gap-3 text-sm">
                    <span className="font-medium">{project.name}</span>
                    <StatusChip status={project.status} />
                  </span>
                  <span className="mt-2 block h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.span
                      className="block h-full rounded-full bg-primary"
                      initial={reduce ? false : { width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 0.55, ease: 'easeOut' }}
                    />
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">{project.progress}% · {formatInr(Number(project.expectedBudget) || 0)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold">Low stock</h2>
          {stock.length === 0 ? <p className="mt-4 text-sm text-muted-foreground">Nothing is below its reorder level for this project.</p> : null}
          <ul className="mt-3 divide-y divide-border">
            {stock.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-sm font-medium">{item.item}</span>
                  <span className="block text-xs text-muted-foreground">On hand {item.onHand} · reorder {item.reorder}</span>
                </span>
                <StatusChip status="Low" />
              </li>
            ))}
          </ul>
        </article>
        <article className="rounded-xl border border-border bg-card p-5 shadow-card">
          <h2 className="text-sm font-semibold">Payments due</h2>
          <p className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{formatInr(Number(stats.paymentsDueAmount) || 0)}</p>
          <ul className="mt-3 divide-y divide-border">
            {bills.map((bill) => (
              <li key={bill.id} className="py-3">
                <span className="flex items-center justify-between gap-3 text-sm">
                  <span className="font-medium">{bill.vendor}</span>
                  <span className="tabular-nums">{formatInr(bill.amount)}</span>
                </span>
                <span className="block text-xs text-muted-foreground">{bill.project} · {bill.due}</span>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </PageFrame>
  )
}
