const statusConfig = {
  Submitted: 'status-submitted',
  Assigned: 'status-assigned',
  'In Progress': 'status-progress',
  Resolved: 'status-resolved',
  Closed: 'status-closed',
  Pending: 'status-pending',
  Approved: 'status-approved',
  Rejected: 'status-rejected',
  'Under Review': 'status-progress',
  Ready: 'status-approved',
  Active: 'status-approved',
  Inactive: 'status-closed',
}

export default function StatusBadge({ status }) {
  const cls = statusConfig[status] || 'badge bg-gray-100 text-gray-600'
  return <span className={cls}>{status}</span>
}
