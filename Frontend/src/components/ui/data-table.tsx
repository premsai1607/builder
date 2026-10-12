import { ChevronDown, ChevronUp } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type SortState = { key: string; dir: 'asc' | 'desc' }

export function toggleSort(current: SortState, key: string): SortState {
  if (current.key === key) return { key, dir: current.dir === 'asc' ? 'desc' : 'asc' }
  return { key, dir: 'asc' }
}

export type Column<T> = {
  key: string
  header: string
  sortable?: boolean
  className?: string
  cell: (row: T) => ReactNode
}

export function DataTable<T>({
  rows,
  columns,
  getRowId,
  sort,
  onSort,
  page,
  pageCount,
  onPage,
  total,
  renderActions,
}: {
  rows: T[]
  columns: Column<T>[]
  getRowId: (row: T) => string
  sort: SortState
  onSort: (key: string) => void
  page: number
  pageCount: number
  onPage: (page: number) => void
  total: number
  renderActions?: (row: T) => ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-xl bg-card border border-border shadow-card">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="bg-muted text-muted-foreground">
            <tr>
              {columns.map((column) => {
                const active = sort.key === column.key
                return (
                  <th key={column.key} className={cn('px-4 py-3 font-medium', column.className)} aria-sort={active ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
                    {column.sortable ? (
                      <button type="button" className="inline-flex min-h-12 items-center gap-1" onClick={() => onSort(column.key)}>
                        {column.header}
                        {active ? sort.dir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} /> : null}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                )
              })}
              {renderActions ? <th className="px-2 py-3 text-right font-medium">Actions</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={getRowId(row)} className="border-t border-border">
                {columns.map((column) => (
                  <td key={column.key} className={cn('px-4 py-2 align-middle', column.className)}>
                    {column.cell(row)}
                  </td>
                ))}
                {renderActions ? <td className="px-2 py-2 text-right">{renderActions(row)}</td> : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
        <p>
          Page {page} of {pageCount} · {total} records
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
            Previous
          </Button>
          <Button variant="secondary" size="sm" disabled={page >= pageCount} onClick={() => onPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
