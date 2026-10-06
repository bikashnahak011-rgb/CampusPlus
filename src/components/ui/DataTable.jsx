import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, Inbox, Search } from 'lucide-react'

export default function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No records found.',
  pageSize = 10,
  searchable = true,
}) {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState(null)
  const [page, setPage] = useState(1)
  const filteredData = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    let rows = normalizedQuery
      ? data.filter(row => columns.some(column => {
        const value = row[column.key]
        if (value === null || value === undefined || typeof value === 'object') return false
        return String(value).toLowerCase().includes(normalizedQuery)
      }))
      : [...data]

    if (sort) {
      rows = rows.sort((left, right) => {
        const leftValue = left[sort.key]
        const rightValue = right[sort.key]
        const comparison = typeof leftValue === 'number' && typeof rightValue === 'number'
          ? leftValue - rightValue
          : String(leftValue ?? '').localeCompare(String(rightValue ?? ''), undefined, { numeric: true, sensitivity: 'base' })
        return sort.direction === 'asc' ? comparison : -comparison
      })
    }
    return rows
  }, [columns, data, query, sort])
  const pageCount = Math.max(1, Math.ceil(filteredData.length / pageSize))
  const currentPage = Math.min(page, pageCount)
  const pageData = filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="space-y-3">
      {searchable && (
        <label className="relative block max-w-sm">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={query}
            onChange={event => { setPage(1); setQuery(event.target.value) }}
            placeholder="Search records…"
            aria-label="Search table rows"
            className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-3 text-sm focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-100"
          />
        </label>
      )}
      {pageData.length === 0 ? (
        <div className="internal-state-panel internal-table-empty flex flex-col items-center justify-center gap-2 text-center" role="status">
          <span className="internal-empty-icon"><Inbox size={23} /></span>
          <p className="text-sm font-semibold text-gray-800">Nothing to show yet</p>
          <p className="max-w-md text-xs text-gray-500">{emptyMessage}</p>
        </div>
      ) : (
        <div className="internal-table-shell overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {columns.map(column => (
                  <th key={column.key} scope="col" aria-sort={sort?.key === column.key ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none'} className="whitespace-nowrap px-4 py-3 text-left text-xs uppercase tracking-wide">
                    {column.sortable === false ? column.label : (
                      <button
                        type="button"
                        className="rounded-md text-left hover:text-violet-800 focus-visible:outline-violet-500"
                        onClick={() => {
                          setPage(1)
                          setSort(current => current?.key === column.key
                            ? { key: column.key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
                            : { key: column.key, direction: 'asc' })
                        }}
                      >
                        {column.label}{sort?.key === column.key ? (sort.direction === 'asc' ? ' ↑' : ' ↓') : ''}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageData.map((row, index) => (
                <tr key={row.id || index} className={`border-b border-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`} onClick={() => onRowClick?.(row)}>
                  {columns.map(column => <td key={column.key} className="whitespace-nowrap px-4 py-3 text-gray-700">{column.render ? column.render(row[column.key], row) : row[column.key]}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {pageCount > 1 && (
        <div className="flex items-center justify-between gap-3 text-sm text-gray-500">
          <span>Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length}</span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} aria-label="Previous table page" className="rounded-lg border border-gray-200 bg-white p-2 disabled:cursor-not-allowed disabled:opacity-40"><ChevronLeft size={16} /></button>
            <span>{currentPage} / {pageCount}</span>
            <button type="button" disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} aria-label="Next table page" className="rounded-lg border border-gray-200 bg-white p-2 disabled:cursor-not-allowed disabled:opacity-40"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}
    </div>
  )
}
