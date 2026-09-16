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
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Loader2 size={32} className="text-blue-500 animate-spin" />
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  )
}

export function ErrorState({ message = 'Something went wrong.', onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <AlertCircle size={32} className="text-red-400" />
      <p className="text-gray-600 text-sm">{message}</p>
      {onRetry && <button onClick={onRetry} className="btn-secondary text-sm mt-1"><RefreshCw size={14} /> Retry</button>}
    </div>
  )
}

export function EmptyState({ message = 'No data found.', icon: Icon = Inbox }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <Icon size={32} className="text-gray-300" />
      <p className="text-gray-400 text-sm">{message}</p>
    </div>
  )
}
