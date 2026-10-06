import { Loader2, AlertCircle, RefreshCw, Inbox } from 'lucide-react'

const statusMap = {
  Submitted: 'status-submitted', Assigned: 'status-assigned', 'In Progress': 'status-progress',
  Resolved: 'status-resolved', Closed: 'status-closed', Pending: 'status-pending',
  Approved: 'status-approved', Rejected: 'status-rejected', 'Under Review': 'status-review',
  Ready: 'status-ready', Active: 'status-approved', Inactive: 'status-closed',
}

export function StatusBadge({ status }) {
  return <span className={`badge ${statusMap[status] || 'status-submitted'}`}>{status}</span>
}

export function LoadingState({ message = 'Loading...' }) {
  return (
    <div role="status" aria-live="polite" className="internal-state-panel flex flex-col justify-center gap-4">
      <div className="space-y-3" aria-hidden="true">
        <div className="internal-state-skeleton h-4 w-2/5 rounded-lg" />
        <div className="internal-state-skeleton h-3 w-4/5 rounded-lg" />
        <div className="internal-state-skeleton h-3 w-3/5 rounded-lg" />
      </div>
      <p className="flex items-center gap-2 text-sm text-gray-500"><Loader2 size={16} className="animate-spin text-violet-600" />{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div role="alert" className="internal-state-panel flex flex-col items-center justify-center gap-3 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-red-50"><AlertCircle size={25} className="text-red-500" /></span>
      <p className="max-w-xl text-sm text-gray-600">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary text-sm mt-1"><RefreshCw size={14} /> Retry</button>}
    </div>
  )
}

export function EmptyState({ message = 'No data found.', icon: Icon = Inbox }) {
  return (
    <div className="internal-state-panel flex flex-col items-center justify-center gap-3 text-center">
      <span className="internal-empty-icon grid h-14 w-14 place-items-center rounded-2xl bg-violet-50"><Icon size={27} className="text-violet-500" /></span>
      <p className="max-w-xl text-sm font-semibold text-gray-700">{message}</p>
    </div>
  )
}
