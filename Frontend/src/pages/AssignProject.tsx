import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { BottomSheet } from '@/components/ui/bottom-sheet'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, toggleSort, type SortState } from '@/components/ui/data-table'
import { DetailDrawer, DetailRow } from '@/components/ui/detail-drawer'
import { EmptyState, ErrorState, PageFrame } from '@/components/ui/empty-state'
import { DateField, Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Fab, PageHeader } from '@/components/ui/page-header'
import { RowMenu } from '@/components/ui/row-menu'
import { Select } from '@/components/ui/select'
import { ListSkeleton } from '@/components/ui/skeleton'
import { StatusChip } from '@/components/ui/status-chip'
import { useData } from '@/context/DataContext'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePageReady } from '@/hooks/usePageReady'
import { formatDate } from '@/lib/format'
import type { Assignment, AssignmentStatus } from '@/types'

const pageSize = 5

type Draft = { employeeId: string; projectId: string; effectiveDate: string; status: AssignmentStatus | '' }

const emptyDraft: Draft = { employeeId: '', projectId: '', effectiveDate: '', status: 'Active' }

export function AssignProject() {
  const ready = usePageReady()
  const mobile = useIsMobile()
  const navigate = useNavigate()
  const data = useData()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<SortState>({ key: 'employee', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<Assignment | null>(null)
  const [draft, setDraft] = useState<Draft>(emptyDraft)
  const [touched, setTouched] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loadError, setLoadError] = useState(false)

  const rowsSource = useMemo(() => {
    return data.assignments
      .map((assignment) => {
        const employee = data.employees.find((item) => item.id === assignment.employeeId)
        const project = data.projects.find((item) => item.id === assignment.projectId)
        return { assignment, employee, project }
      })
      .filter((row) => row.employee && row.project)
      .filter((row) => data.projectFilter === 'all' || row.project?.id === data.projectFilter)
  }, [data.assignments, data.employees, data.projects, data.projectFilter])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const next = rowsSource.filter((row) => {
      if (status !== 'all' && row.assignment.status !== status) return false
      if (!query) return true
      return `${row.employee?.name} ${row.project?.name}`.toLowerCase().includes(query)
    })
    next.sort((a, b) => {
      const left = sort.key === 'project' ? a.project?.name ?? '' : sort.key === 'date' ? a.assignment.effectiveDate : sort.key === 'status' ? a.assignment.status : a.employee?.name ?? ''
      const right = sort.key === 'project' ? b.project?.name ?? '' : sort.key === 'date' ? b.assignment.effectiveDate : sort.key === 'status' ? b.assignment.status : b.employee?.name ?? ''
      const cmp = left.localeCompare(right)
      return sort.dir === 'asc' ? cmp : -cmp
    })
    return next
  }, [rowsSource, search, status, sort])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selected = rowsSource.find((row) => row.assignment.id === selectedId) ?? null
  const pendingDelete = rowsSource.find((row) => row.assignment.id === deleteId) ?? null

  function openForm(assignment?: Assignment) {
    setEditing(assignment ?? null)
    setDraft(
      assignment
        ? {
            employeeId: assignment.employeeId,
            projectId: assignment.projectId,
            effectiveDate: assignment.effectiveDate,
            status: assignment.status,
          }
        : emptyDraft,
    )
    setTouched(false)
    setOpen(true)
  }

  const duplicate = data.assignments.some(
    (item) => item.employeeId === draft.employeeId && item.projectId === draft.projectId && item.id !== editing?.id,
  )
  const errors = {
    employeeId: draft.employeeId ? '' : 'Choose an employee.',
    projectId: draft.projectId ? '' : 'Choose a project.',
    effectiveDate: draft.effectiveDate ? '' : 'Choose an effective date.',
    status: draft.status ? '' : 'Choose a status.',
    duplicate: duplicate ? 'This employee is already assigned to that project.' : '',
  }
  const show = (field: keyof typeof errors) => (touched ? errors[field] : null)

  function save() {
    setTouched(true)
    if (Object.values(errors).some(Boolean) || !draft.status) return
    const payload = {
      employeeId: draft.employeeId,
      projectId: draft.projectId,
      effectiveDate: draft.effectiveDate,
      status: draft.status,
    }
    if (editing) data.updateAssignment(editing.id, payload)
    else data.addAssignment(payload)
    toast.success(editing ? 'Assignment updated' : 'Project assigned')
    setOpen(false)
  }

  const form = (
    <div className="grid gap-4">
      <Select
        label="Employee"
        required
        value={draft.employeeId}
        error={show('employeeId')}
        valid={Boolean(draft.employeeId)}
        options={data.employees.filter((employee) => employee.status !== 'Inactive').map((employee) => ({ value: employee.id, label: employee.name, description: employee.employeeCode }))}
        onChange={(employeeId) => setDraft({ ...draft, employeeId })}
        onAddNew={() => navigate('/employees/new')}
      />
      <Select
        label="Project"
        required
        value={draft.projectId}
        error={show('projectId') || show('duplicate')}
        valid={Boolean(draft.projectId) && !duplicate}
        options={data.projects.map((project) => ({ value: project.id, label: project.name, description: project.address }))}
        onChange={(projectId) => setDraft({ ...draft, projectId })}
        onAddNew={() => navigate('/projects/new')}
      />
      <DateField label="Effective date" required name="effectiveDate" value={draft.effectiveDate} error={show('effectiveDate')} valid={Boolean(draft.effectiveDate)} onChange={(effectiveDate) => setDraft({ ...draft, effectiveDate })} />
      <Select
        label="Status"
        required
        value={draft.status}
        error={show('status')}
        valid={Boolean(draft.status)}
        options={[
          { value: 'Active', label: 'Active' },
          { value: 'Pending', label: 'Pending' },
          { value: 'Completed', label: 'Completed' },
        ]}
        onChange={(value) => setDraft({ ...draft, status: value as AssignmentStatus })}
      />
      <div className="flex gap-3">
        <Button variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
        <Button className="flex-1" onClick={save}>Save assignment</Button>
      </div>
    </div>
  )

  if (loadError) {
    return (
      <PageFrame>
        <ErrorState description="Assignments could not be loaded." onRetry={() => setLoadError(false)} />
      </PageFrame>
    )
  }

  if (ready === 'loading') {
    return (
      <PageFrame>
        <ListSkeleton />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader title="Assign project" description="Put a person on a project from a date, and set whether that assignment is active.">
        <Button onClick={() => openForm()}>Assign project</Button>
      </PageHeader>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
        <Input label="Search" name="search" placeholder="Employee or project" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
        <Select label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={[{ value: 'all', label: 'All statuses' }, { value: 'Active', label: 'Active' }, { value: 'Pending', label: 'Pending' }, { value: 'Completed', label: 'Completed' }]} />
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No assignments yet"
          description="Assign an employee to a project, or clear the search to see the full list."
          actionLabel={search || status !== 'all' ? 'Clear filters' : 'Assign project'}
          onAction={() => {
            if (search || status !== 'all') {
              setSearch('')
              setStatus('all')
              data.setProjectFilter('all')
              return
            }
            openForm()
          }}
        />
      ) : (
        <>
          <div className="hidden lg:block">
            <DataTable
              rows={rows}
              getRowId={(row) => row.assignment.id}
              sort={sort}
              onSort={(key) => setSort(toggleSort(sort, key))}
              page={currentPage}
              pageCount={pageCount}
              onPage={setPage}
              total={filtered.length}
              columns={[
                { key: 'employee', header: 'Employee', sortable: true, cell: (row) => <span className="font-medium">{row.employee?.name}</span> },
                { key: 'project', header: 'Project', sortable: true, cell: (row) => row.project?.name },
                { key: 'date', header: 'Effective date', sortable: true, cell: (row) => formatDate(row.assignment.effectiveDate) },
                { key: 'status', header: 'Status', sortable: true, cell: (row) => <StatusChip status={row.assignment.status} /> },
              ]}
              renderActions={(row) => (
                <RowMenu
                  label={`Actions for ${row.employee?.name}`}
                  items={[
                    { label: 'View details', onSelect: () => setSelectedId(row.assignment.id) },
                    { label: 'Edit', onSelect: () => openForm(row.assignment) },
                    { label: 'Delete', destructive: true, onSelect: () => setDeleteId(row.assignment.id) },
                  ]}
                />
              )}
            />
          </div>
          <div className="grid gap-3 lg:hidden">
            {rows.map((row) => (
              <article key={row.assignment.id} className="rounded-xl bg-card p-4 border border-border shadow-card">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold">{row.employee?.name}</p>
                    <p className="text-sm text-muted-foreground">{row.project?.name}</p>
                  </div>
                  <RowMenu
                    label={`Actions for ${row.employee?.name}`}
                    items={[
                      { label: 'View details', onSelect: () => setSelectedId(row.assignment.id) },
                      { label: 'Edit', onSelect: () => openForm(row.assignment) },
                      { label: 'Delete', destructive: true, onSelect: () => setDeleteId(row.assignment.id) },
                    ]}
                  />
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm">{formatDate(row.assignment.effectiveDate)}</span>
                  <StatusChip status={row.assignment.status} />
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      <Fab label="Assign project" onClick={() => openForm()} />
      {mobile ? (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={editing ? 'Edit assignment' : 'Assign project'}>
          {form}
        </BottomSheet>
      ) : (
        <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit assignment' : 'Assign project'}>
          {form}
        </Modal>
      )}
      <DetailDrawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title="Assignment">
        {selected ? (
          <div>
            <DetailRow label="Employee" value={`${selected.employee?.name} · ${selected.employee?.employeeCode}`} />
            <DetailRow label="Project" value={selected.project?.name} />
            <DetailRow label="Address" value={selected.project?.address} />
            <DetailRow label="Effective date" value={formatDate(selected.assignment.effectiveDate)} />
            <DetailRow label="Status" value={<StatusChip status={selected.assignment.status} />} />
          </div>
        ) : null}
      </DetailDrawer>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Remove assignment?"
        message={pendingDelete ? `${pendingDelete.employee?.name} will no longer be assigned to ${pendingDelete.project?.name}.` : ''}
        confirmLabel="Remove"
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          data.deleteAssignment(pendingDelete.assignment.id)
          toast.success('Assignment removed')
          setDeleteId(null)
        }}
      />
    </PageFrame>
  )
}
