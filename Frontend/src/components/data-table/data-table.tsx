import {
  flexRender,
  type ColumnVisibilityState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table'
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from '@tanstack/react-table/legacy'
import { useWindowVirtualizer } from '@tanstack/react-virtual'
import { Columns3, Download } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { useIsMobile } from '@/hooks/useIsMobile'
import { cn } from '@/lib/utils'

export type DataColumn<T extends Record<string, any>> = LegacyColumnDef<T, unknown>

type DataTableProps<T extends Record<string, any>> = {
  data: T[]
  columns: DataColumn<T>[]
  getRowId: (row: T) => string
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder?: string
  resetKey?: string
  toolbar?: ReactNode
  isLoading?: boolean
  empty?: ReactNode
  onRowClick?: (row: T) => void
  renderCard?: (row: T) => ReactNode
  onExport?: (rows: T[]) => void
  bulkActions?: (rows: T[]) => ReactNode
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  getRowId,
  search,
  onSearchChange,
  searchPlaceholder = 'Search',
  resetKey = '',
  toolbar,
  isLoading,
  empty,
  onRowClick,
  renderCard,
  onExport,
  bulkActions,
}: DataTableProps<T>) {
  const reduce = useReducedMotion()
  const mobile = useIsMobile()
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<ColumnVisibilityState>({})
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnsOpen, setColumnsOpen] = useState(false)
  const parentRef = useRef<HTMLDivElement>(null)
  const [scrollMargin, setScrollMargin] = useState(0)

  const selectColumn = useMemo<DataColumn<T>>(
    () => ({
      id: '_select',
      enableSorting: false,
      enableHiding: false,
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          ref={(node) => {
            if (node) node.indeterminate = table.getIsSomePageRowsSelected()
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          aria-label="Select all rows on this page"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={(event) => event.stopPropagation()}
          aria-label="Select row"
        />
      ),
    }),
    [],
  )

  const table = useLegacyTable({
    data,
    columns: [selectColumn, ...columns],
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    enableRowSelection: true,
    initialState: { pagination: { pageIndex: 0, pageSize: 5 } },
  })

  const tableRef = useRef(table)
  tableRef.current = table

  useEffect(() => {
    tableRef.current.setPageIndex(0)
    setRowSelection({})
  }, [resetKey])

  useEffect(() => {
    setScrollMargin(parentRef.current?.offsetTop ?? 0)
  }, [data.length, mobile])

  const virtualizer = useWindowVirtualizer({
    count: mobile && renderCard ? data.length : 0,
    estimateSize: () => 136,
    overscan: 4,
    scrollMargin,
  })

  const selected = table.getSelectedRowModel().rows.map((row) => row.original)
  const exportRows = table.getSortedRowModel().rows.map((row) => row.original)
  const pageRows = table.getRowModel().rows

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="min-h-12 w-full rounded-lg border border-border bg-card px-3 text-sm transition-colors duration-200 outline-none placeholder:text-muted-foreground lg:max-w-sm"
        />
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {toolbar}
          <div className="relative ml-auto flex gap-2">
            <Button variant="secondary" size="sm" aria-expanded={columnsOpen} onClick={() => setColumnsOpen((open) => !open)}>
              <Columns3 size={16} /> Columns
            </Button>
            {onExport ? (
              <Button variant="secondary" size="sm" onClick={() => onExport(selected.length ? selected : exportRows)}>
                <Download size={16} /> Export
              </Button>
            ) : null}
            {columnsOpen ? (
              <div className="absolute top-12 right-0 z-20 w-52 rounded-xl border border-border bg-card p-2 shadow-popover">
                {table
                  .getAllLeafColumns()
                  .filter((column) => column.getCanHide())
                  .map((column) => (
                    <label key={column.id} className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm hover:bg-muted">
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={column.getToggleVisibilityHandler()}
                        aria-label={`Show ${columnLabel(column.id, column.columnDef.header)}`}
                      />
                      {columnLabel(column.id, column.columnDef.header)}
                    </label>
                  ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2" aria-hidden>
          {Array.from({ length: 5 }, (_, index) => (
            <div key={index} className="h-12 animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : data.length === 0 && empty ? (
        empty
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-xl border border-border bg-card shadow-card lg:block">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-muted/70 text-muted-foreground">
                {table.getHeaderGroups().map((group) => (
                  <tr key={group.id}>
                    {group.headers.map((header) => (
                      <th key={header.id} className="px-3 py-3 font-medium">
                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                          <button
                            type="button"
                            className="inline-flex min-h-8 items-center gap-1 rounded-md px-1 transition-colors duration-200 hover:text-foreground"
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            <span aria-hidden>{header.column.getIsSorted() === 'asc' ? '↑' : header.column.getIsSorted() === 'desc' ? '↓' : ''}</span>
                          </button>
                        ) : (
                          flexRender(header.column.columnDef.header, header.getContext())
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {pageRows.map((row) => (
                    <motion.tr
                      key={row.id}
                      initial={reduce ? false : { opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={reduce ? undefined : { opacity: 0 }}
                      transition={{ duration: 0.18 }}
                      className={cn('border-t border-border', onRowClick && 'cursor-pointer hover:bg-muted/70')}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-3 py-3 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
            <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
              <p>
                {table.getRowCount()} records · page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
                  Previous
                </Button>
                <Button variant="secondary" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
                  Next
                </Button>
              </div>
            </div>
          </div>

          {renderCard ? (
            <div ref={parentRef} className="relative lg:hidden" style={{ height: virtualizer.getTotalSize() }}>
              {virtualizer.getVirtualItems().map((item) => (
                <div
                  key={item.key}
                  data-index={item.index}
                  ref={virtualizer.measureElement}
                  className="absolute top-0 left-0 w-full pb-3"
                  style={{ transform: `translateY(${item.start - scrollMargin}px)` }}
                >
                  {renderCard(data[item.index])}
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}

      {selected.length > 0 && bulkActions ? (
        <div className="fixed inset-x-4 bottom-28 z-30 flex min-h-14 items-center justify-between gap-3 rounded-xl border border-border bg-foreground px-4 text-background shadow-popover lg:bottom-6">
          <p className="text-sm font-medium">{selected.length} selected</p>
          <div className="flex gap-2">{bulkActions(selected)}</div>
        </div>
      ) : null}
    </div>
  )
}

function columnLabel(id: string, header: unknown) {
  if (typeof header === 'string') return header
  return id.replaceAll('_', ' ')
}
