import type { DataColumn } from '@/components/data-table/data-table'
import { DataTable } from '@/components/data-table/data-table'
import { PullToRefresh } from '@/components/pull-to-refresh'
import { Reveal } from '@/components/reveal'
import { SwipeRow } from '@/components/swipe-row'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DetailRow, EntityDrawer } from '@/components/ui/detail-drawer'
import { EmptyState, ErrorState, PageFrame } from '@/components/ui/empty-state'
import { Fab, PageHeader } from '@/components/ui/page-header'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { Select } from '@/components/ui/select'
import { ListSkeleton } from '@/components/ui/skeleton'
import { StatusChip } from '@/components/ui/status-chip'
import { useData } from '@/context/DataContext'
import { useDebounced } from '@/hooks/useDebounced'
import { useEmployeesQuery, usePatchEmployee, useRemoveEmployees } from '@/lib/employee-api'
import { formatDate, formatInr, formatPhone, maskAadhaar, maskAccount, maskPan, maskSalary } from '@/lib/format'
import type { SavedView } from '@/stores/ui'
import { useUi } from '@/stores/ui'
import type { Employee, EmployeeStatus } from '@/types'
import { Reorder, useReducedMotion } from 'framer-motion'
import { Star, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { toast } from 'sonner'

const statuses = [
  { value: 'all', label: 'All statuses' },
  { value: 'Active', label: 'Active' },
  { value: 'Pending', label: 'Pending' },
  { value: 'Inactive', label: 'Inactive' },
]

export function Employees() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [params, setParams] = useSearchParams()
  const query = useEmployeesQuery()
  const patch = usePatchEmployee()
  const remove = useRemoveEmployees()
  const { assignments, departments, projectFilter, setProjectFilter } = useData()
  const favorites = useUi((state) => state.favorites)
  const toggleFavorite = useUi((state) => state.toggleFavorite)
  const pushRecent = useUi((state) => state.pushRecent)
  const views = useUi((state) => state.views)
  const saveView = useUi((state) => state.saveView)
  const removeView = useUi((state) => state.removeView)
  const reorderViews = useUi((state) => state.reorderViews)
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search)
  const [department, setDepartment] = useState('all')
  const [status, setStatus] = useState('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [pendingIds, setPendingIds] = useState<string[]>([])
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [naming, setNaming] = useState(false)
  const [viewName, setViewName] = useState('')

  useEffect(() => {
    const open = params.get('open')
    if (!open) return
    setSelectedId(open)
    pushRecent(open)
    const next = new URLSearchParams(params)
    next.delete('open')
    setParams(next, { replace: true })
  }, [params, pushRecent, setParams])

  const employees = query.data ?? []
  const rows = useMemo(() => {
    const text = debounced.trim().toLowerCase()
    const scoped =
      projectFilter === 'all'
        ? employees
        : employees.filter((employee) => assignments.some((item) => item.employeeId === employee.id && item.projectId === projectFilter))
    return scoped.filter((employee) => {
      const matchesText = !text || `${employee.name} ${employee.employeeCode} ${employee.phone} ${employee.email}`.toLowerCase().includes(text)
      const matchesDepartment = department === 'all' || employee.department === department
      const matchesStatus = status === 'all' || employee.status === status
      return matchesText && matchesDepartment && matchesStatus
    })
  }, [assignments, debounced, department, employees, projectFilter, status])

  const selected = employees.find((employee) => employee.id === selectedId) ?? null

  const columns = useMemo<DataColumn<Employee>[]>(
    () => [
      {
        id: 'favorite',
        header: 'Favorite',
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => {
          const on = favorites.includes(row.original.id)
          return (
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-muted"
              aria-pressed={on}
              aria-label={on ? `Remove ${row.original.name} from favorites` : `Add ${row.original.name} to favorites`}
              onClick={(event) => {
                event.stopPropagation()
                toggleFavorite(row.original.id)
              }}
            >
              <Star size={16} className={on ? 'fill-primary text-primary' : 'text-muted-foreground'} />
            </button>
          )
        },
      },
      { accessorKey: 'employeeCode', header: 'ID' },
      { accessorKey: 'name', header: 'Name' },
      { accessorKey: 'department', header: 'Department' },
      { accessorKey: 'designation', header: 'Designation' },
      { id: 'phone', accessorKey: 'phone', header: 'Phone', cell: ({ row }) => formatPhone(row.original.phone) },
      {
        id: 'status',
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <select
            aria-label={`Status for ${row.original.name}`}
            className="h-9 rounded-lg border border-border bg-card px-2"
            value={row.original.status}
            onClick={(event) => event.stopPropagation()}
            onChange={(event) => patch.mutate({ id: row.original.id, patch: { status: event.target.value as EmployeeStatus } })}
          >
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        ),
      },
      {
        id: 'salary',
        header: 'Salary',
        cell: ({ row }) => <Reveal label="salary" value={formatInr(row.original.salary)} mask={maskSalary()} />,
      },
    ],
    [favorites, patch, toggleFavorite],
  )

  function applyView(view: SavedView) {
    setDepartment(view.department)
    setStatus(view.status)
  }

  function rememberView() {
    const name = viewName.trim()
    if (!name) return
    saveView({ id: `view-${Date.now()}`, name, department, status })
    setViewName('')
    setNaming(false)
    toast.success('View saved')
  }

  if (query.isPending) {
    return (
      <PageFrame>
        <ListSkeleton />
      </PageFrame>
    )
  }

  if (query.isError) {
    return <ErrorState description="Employees could not be loaded." onRetry={() => void query.refetch()} />
  }

  const filterControls = (
    <>
      <Select
        label="Department"
        value={department}
        onChange={setDepartment}
        options={[{ value: 'all', label: 'All departments' }, ...departments.map((item) => ({ value: item, label: item }))]}
      />
      <Select label="Status" value={status} onChange={setStatus} options={statuses} />
    </>
  )

  return (
    <PageFrame>
      <PageHeader title="Employees" description="People on payroll. Open a row for the private details, or edit inline.">
        <Button onClick={() => navigate('/employees/new')}>Add employee</Button>
      </PageHeader>
      <PullToRefresh onRefresh={() => query.refetch()}>
        <div className="mb-3 flex items-center gap-2 overflow-x-auto">
          {reduce ? (
            views.map((view) => (
              <ViewChip key={view.id} view={view} active={view.department === department && view.status === status} onApply={applyView} onRemove={removeView} />
            ))
          ) : (
            <Reorder.Group axis="x" values={views} onReorder={reorderViews} className="flex gap-2">
              {views.map((view) => (
                <Reorder.Item key={view.id} value={view} className="shrink-0">
                  <ViewChip view={view} active={view.department === department && view.status === status} onApply={applyView} onRemove={removeView} />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          )}
          {naming ? (
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault()
                rememberView()
              }}
            >
              <input
                value={viewName}
                onChange={(event) => setViewName(event.target.value)}
                aria-label="View name"
                placeholder="View name"
                className="h-10 w-36 rounded-lg border border-border bg-card px-3 text-sm"
              />
              <Button size="sm" type="submit">
                Save
              </Button>
            </form>
          ) : (
            <button type="button" className="h-10 shrink-0 rounded-lg px-3 text-sm font-medium text-primary-dark hover:bg-muted" onClick={() => setNaming(true)}>
              Save view
            </button>
          )}
        </div>
        <div className="mb-3 hidden gap-3 md:grid md:grid-cols-2">{filterControls}</div>
        <div className="mb-3 md:hidden">
          <Button variant="secondary" onClick={() => setFiltersOpen(true)}>
            Filters
          </Button>
        </div>
        <p className="sr-only" aria-live="polite">
          {rows.length} employees
        </p>
        <DataTable
          data={rows}
          columns={columns}
          getRowId={(row) => row.id}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search name, ID, or phone"
          resetKey={`${debounced}|${department}|${status}|${projectFilter}`}
          onRowClick={(row) => {
            setSelectedId(row.id)
            pushRecent(row.id)
          }}
          onExport={exportEmployees}
          bulkActions={(selectedRows) => (
            <Button variant="danger" size="sm" onClick={() => setPendingIds(selectedRows.map((row) => row.id))}>
              Delete
            </Button>
          )}
          empty={
            employees.length === 0 ? (
              <EmptyState title="No employees yet" description="Add the first person on payroll. You can fill the bank details in a later step." actionLabel="Add employee" onAction={() => navigate('/employees/new')} />
            ) : (
              <EmptyState
                title="No one matches"
                description="Try another name, or clear the department and status filters."
                actionLabel="Clear filters"
                onAction={() => {
                  setSearch('')
                  setDepartment('all')
                  setStatus('all')
                  setProjectFilter('all')
                }}
              />
            )
          }
          renderCard={(employee) => (
            <SwipeRow
              actions={[
                { label: 'Call', onClick: () => window.location.assign(`tel:${employee.phone}`) },
                { label: 'Edit', onClick: () => navigate(`/employees/${employee.id}`) },
                { label: 'Delete', tone: 'danger', onClick: () => setPendingIds([employee.id]) },
              ]}
            >
              <button type="button" className="w-full rounded-xl border border-border bg-card p-4 text-left shadow-card" onClick={() => { setSelectedId(employee.id); pushRecent(employee.id) }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-xs text-muted-foreground">{employee.employeeCode} · {employee.department}</p>
                  </div>
                  <StatusChip status={employee.status} />
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{formatPhone(employee.phone)}</p>
              </button>
            </SwipeRow>
          )}
        />
      </PullToRefresh>
      <Fab label="Add employee" onClick={() => navigate('/employees/new')} />
      <BottomSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filters">
        <div className="grid gap-4">{filterControls}</div>
        <Button className="mt-4 w-full" onClick={() => setFiltersOpen(false)}>
          Show results
        </Button>
      </BottomSheet>
      <EntityDrawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.name ?? 'Employee'}>
        {selected ? (
          <>
            <DetailRow label="ID" value={selected.employeeCode} />
            <DetailRow label="Email" value={selected.email} />
            <DetailRow label="Phone" value={formatPhone(selected.phone)} />
            <DetailRow label="Address" value={selected.address} />
            <DetailRow label="Designation" value={selected.designation} />
            <DetailRow label="Department" value={selected.department} />
            <DetailRow label="Joined" value={formatDate(selected.joiningDate)} />
            <DetailRow label="Experience" value={`${selected.experience} years`} />
            <DetailRow label="Status" value={<StatusChip status={selected.status} />} />
            <DetailRow label="Salary" value={<Reveal label="salary" value={formatInr(selected.salary)} mask={maskSalary()} />} />
            <DetailRow label="Bank" value={selected.bankName} />
            <DetailRow label="Account" value={<Reveal label="account number" value={selected.accountNumber} mask={maskAccount(selected.accountNumber)} />} />
            <DetailRow label="Branch" value={selected.branch} />
            <DetailRow label="PAN" value={<Reveal label="PAN" value={selected.pan} mask={maskPan(selected.pan)} />} />
            <DetailRow label="Aadhaar" value={<Reveal label="Aadhaar" value={selected.aadhaar} mask={maskAadhaar(selected.aadhaar)} />} />
            <DetailRow label="Emergency" value={`${selected.emergencyName} · ${formatPhone(selected.emergencyPhone)}`} />
            <DetailRow label="Qualifications" value={selected.qualifications} />
            <Button className="mt-5 w-full" onClick={() => navigate(`/employees/${selected.id}`)}>
              Edit employee
            </Button>
          </>
        ) : null}
      </EntityDrawer>
      <ConfirmDialog
        open={pendingIds.length > 0}
        title={pendingIds.length > 1 ? `Delete ${pendingIds.length} employees?` : 'Delete this employee?'}
        message="Their project assignments will be removed too. You can undo this from the toast."
        onClose={() => setPendingIds([])}
        onConfirm={() => {
          const ids = pendingIds
          setPendingIds([])
          setSelectedId(null)
          remove.mutate(ids)
        }}
      />
    </PageFrame>
  )
}

function ViewChip({
  view,
  active,
  onApply,
  onRemove,
}: {
  view: SavedView
  active: boolean
  onApply: (view: SavedView) => void
  onRemove: (id: string) => void
}) {
  return (
    <span className={`inline-flex h-10 items-center rounded-full border ${active ? 'border-primary bg-primary-soft' : 'border-border bg-card'}`}>
      <button type="button" className="px-3 text-sm font-medium" aria-pressed={active} onClick={() => onApply(view)}>
        {view.name}
      </button>
      {view.builtIn ? null : (
        <button
          type="button"
          className="mr-1 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
          aria-label={`Remove ${view.name}`}
          onClick={() => {
            onRemove(view.id)
            toast(`${view.name} removed`, { action: { label: 'Undo', onClick: () => useUi.getState().saveView(view) } })
          }}
        >
          <X size={14} />
        </button>
      )}
    </span>
  )
}

function exportEmployees(rows: Employee[]) {
  const header = ['ID', 'Name', 'Email', 'Phone', 'Department', 'Designation', 'Status']
  const body = rows.map((row) =>
    [row.employeeCode, row.name, row.email, row.phone, row.department, row.designation, row.status].map(csvCell).join(','),
  )
  const blob = new Blob([[header.join(','), ...body].join('\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'employees.csv'
  link.click()
  URL.revokeObjectURL(url)
}

function csvCell(value: string) {
  return `"${value.replaceAll('"', '""')}"`
}
