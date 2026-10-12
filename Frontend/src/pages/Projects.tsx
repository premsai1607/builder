import { LayoutGrid, List } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { DataTable, toggleSort, type SortState } from '@/components/ui/data-table'
import { DetailDrawer, DetailRow } from '@/components/ui/detail-drawer'
import { EmptyState, PageFrame } from '@/components/ui/empty-state'
import { Input } from '@/components/ui/input'
import { Fab, PageHeader } from '@/components/ui/page-header'
import { RowMenu } from '@/components/ui/row-menu'
import { Select } from '@/components/ui/select'
import { ListSkeleton } from '@/components/ui/skeleton'
import { StatusChip } from '@/components/ui/status-chip'
import { useData } from '@/context/DataContext'
import { usePageReady } from '@/hooks/usePageReady'
import { formatDate, formatInr } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Project } from '@/types'

const pageSize = 5

export function Projects() {
  const ready = usePageReady()
  const navigate = useNavigate()
  const { projects, projectFilter, setProjectFilter, deleteProject } = useData()
  const [mode, setMode] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [type, setType] = useState('all')
  const [status, setStatus] = useState('all')
  const [sort, setSort] = useState<SortState>({ key: 'name', dir: 'asc' })
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    const next = projects.filter((project) => {
      if (projectFilter !== 'all' && project.id !== projectFilter) return false
      if (type !== 'all' && project.type !== type) return false
      if (status !== 'all' && project.status !== status) return false
      if (!query) return true
      return `${project.name} ${project.address} ${project.about}`.toLowerCase().includes(query)
    })
    next.sort((a, b) => compareProject(a, b, sort))
    return next
  }, [projects, search, type, status, sort, projectFilter])

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const rows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize)
  const selected = projects.find((project) => project.id === selectedId) ?? null
  const pendingDelete = projects.find((project) => project.id === deleteId) ?? null
  const filtersActive = Boolean(search || type !== 'all' || status !== 'all' || projectFilter !== 'all')

  if (ready === 'loading') {
    return (
      <PageFrame>
        <ListSkeleton />
      </PageFrame>
    )
  }

  return (
    <PageFrame>
      <PageHeader title="Projects" description="Internal jobs and client work, with budget and price per sq ft.">
        <Button onClick={() => navigate('/projects/new')}>Add project</Button>
      </PageHeader>
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_200px_auto]">
        <Input label="Search" name="search" placeholder="Name or address" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1) }} />
        <Select label="Type" value={type} onChange={(value) => { setType(value); setPage(1) }} options={[{ value: 'all', label: 'All types' }, { value: 'internal', label: 'Internal' }, { value: 'client', label: 'Client' }]} />
        <Select label="Status" value={status} onChange={(value) => { setStatus(value); setPage(1) }} options={['all', 'Pending', 'Active', 'In Progress', 'Completed', 'Cancelled'].map((item) => ({ value: item, label: item === 'all' ? 'All statuses' : item }))} />
        <div className="flex items-end gap-2">
          <button type="button" aria-pressed={mode === 'grid'} aria-label="Card grid" className={cn('flex h-12 w-12 items-center justify-center rounded-lg border', mode === 'grid' ? 'border-primary bg-primary-soft text-primary-dark' : 'border-border bg-card')} onClick={() => setMode('grid')}>
            <LayoutGrid size={18} />
          </button>
          <button type="button" aria-pressed={mode === 'list'} aria-label="List" className={cn('flex h-12 w-12 items-center justify-center rounded-lg border', mode === 'list' ? 'border-primary bg-primary-soft text-primary-dark' : 'border-border bg-card')} onClick={() => setMode('list')}>
            <List size={18} />
          </button>
        </div>
      </div>
      {filtered.length === 0 ? (
        <EmptyState
          title="No projects to show"
          description="Add a project, or clear the search and filters."
          actionLabel={filtersActive ? 'Clear filters' : 'Add project'}
          onAction={() => {
            if (filtersActive) {
              setSearch('')
              setType('all')
              setStatus('all')
              setProjectFilter('all')
              return
            }
            navigate('/projects/new')
          }}
        />
      ) : mode === 'grid' ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {rows.map((project) => (
              <article key={project.id} className="rounded-xl bg-card p-5 border border-border shadow-card">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{project.type}</p>
                    <h2 className="mt-1 text-lg font-semibold">{project.name}</h2>
                    <p className="text-sm text-muted-foreground">{project.address}</p>
                  </div>
                  <RowMenu
                    label={`Actions for ${project.name}`}
                    items={[
                      { label: 'View details', onSelect: () => setSelectedId(project.id) },
                      { label: 'Edit', onSelect: () => navigate(`/projects/${project.id}`) },
                      { label: 'Delete', destructive: true, onSelect: () => setDeleteId(project.id) },
                    ]}
                  />
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <StatusChip status={project.status} />
                  <p className="text-sm font-medium">{formatInr(project.expectedBudget)}</p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{formatInr(project.pricePerSqft)} / sq ft · starts {formatDate(project.startDate)}</p>
              </article>
            ))}
          </div>
          <Pager page={currentPage} pageCount={pageCount} onPage={setPage} />
        </>
      ) : (
        <DataTable
          rows={rows}
          getRowId={(row) => row.id}
          sort={sort}
          onSort={(key) => { setSort(toggleSort(sort, key)); setPage(1) }}
          page={currentPage}
          pageCount={pageCount}
          onPage={setPage}
          total={filtered.length}
          columns={[
            { key: 'name', header: 'Name', sortable: true, cell: (row) => <span className="font-medium">{row.name}</span> },
            { key: 'type', header: 'Type', sortable: true, cell: (row) => <span className="capitalize">{row.type}</span> },
            { key: 'status', header: 'Status', sortable: true, cell: (row) => <StatusChip status={row.status} /> },
            { key: 'expectedBudget', header: 'Budget', sortable: true, cell: (row) => formatInr(row.expectedBudget) },
            { key: 'startDate', header: 'Start', sortable: true, cell: (row) => formatDate(row.startDate) },
          ]}
          renderActions={(row) => (
            <RowMenu
              label={`Actions for ${row.name}`}
              items={[
                { label: 'View details', onSelect: () => setSelectedId(row.id) },
                { label: 'Edit', onSelect: () => navigate(`/projects/${row.id}`) },
                { label: 'Delete', destructive: true, onSelect: () => setDeleteId(row.id) },
              ]}
            />
          )}
        />
      )}
      <Fab label="Add project" onClick={() => navigate('/projects/new')} />
      <DetailDrawer open={Boolean(selected)} onClose={() => setSelectedId(null)} title={selected?.name ?? 'Project'}>
        {selected ? (
          <div>
            <DetailRow label="Type" value={<span className="capitalize">{selected.type}</span>} />
            <DetailRow label="Status" value={<StatusChip status={selected.status} />} />
            <DetailRow label="About" value={selected.about} />
            <DetailRow label="Expected budget" value={formatInr(selected.expectedBudget)} />
            <DetailRow label="Price per sq ft" value={formatInr(selected.pricePerSqft)} />
            <DetailRow label="Start date" value={formatDate(selected.startDate)} />
            <DetailRow label="Address" value={selected.address} />
            <DetailRow label="Amenities" value={selected.amenities.length ? selected.amenities.join(', ') : '—'} />
            <DetailRow label="Progress" value={`${selected.progress}%`} />
            <Button className="mt-5 w-full" onClick={() => navigate(`/projects/${selected.id}`)}>Edit project</Button>
          </div>
        ) : null}
      </DetailDrawer>
      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete project?"
        message={pendingDelete ? `${pendingDelete.name} and its assignments will be removed.` : ''}
        onClose={() => setDeleteId(null)}
        onConfirm={() => {
          if (!pendingDelete) return
          deleteProject(pendingDelete.id)
          toast.success('Project deleted')
          setDeleteId(null)
          setSelectedId(null)
        }}
      />
    </PageFrame>
  )
}

function Pager({ page, pageCount, onPage }: { page: number; pageCount: number; onPage: (page: number) => void }) {
  return (
    <div className="flex items-center justify-between text-sm text-muted-foreground">
      <span>Page {page} of {pageCount}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>Previous</Button>
        <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>Next</Button>
      </div>
    </div>
  )
}

function compareProject(a: Project, b: Project, sort: SortState) {
  const value = (project: Project) => {
    if (sort.key === 'expectedBudget') return project.expectedBudget
    if (sort.key === 'startDate') return project.startDate
    if (sort.key === 'type') return project.type
    if (sort.key === 'status') return project.status
    return project.name
  }
  const left = value(a)
  const right = value(b)
  const cmp = typeof left === 'number' && typeof right === 'number' ? left - right : String(left).localeCompare(String(right))
  return sort.dir === 'asc' ? cmp : -cmp
}
