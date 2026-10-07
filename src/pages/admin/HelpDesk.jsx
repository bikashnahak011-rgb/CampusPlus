import { useCallback, useEffect, useRef, useState } from 'react'
import { CheckCircle2, ClipboardList, CloudUpload, Headphones, RefreshCw, Send, Smartphone, WifiOff } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import { StatusBadge, EmptyState } from '../../components/ui/States'

const REQUEST_TYPES = ['Academic', 'Hostel', 'Facilities', 'Fees', 'Documents', 'Other']
const OFFLINE_QUEUE_KEY = 'campusplus_helpdesk_offline_queue'

function getLocalDateTimeValue() {
  const localDate = new Date(Date.now() - new Date().getTimezoneOffset() * 60_000)
  return localDate.toISOString().slice(0, 16)
}

function readOfflineQueue(key) {
  try {
    const savedQueue = window.localStorage.getItem(key)
    if (!savedQueue) return []
    const parsedQueue = JSON.parse(savedQueue)
    if (!Array.isArray(parsedQueue)) throw new Error('Saved offline request data is not a list.')
    return parsedQueue
  } catch (error) {
    console.error('Could not read offline Help Desk requests:', error)
    return []
  }
}

const EMPTY_FORM = {
  studentIdentifier: '',
  studentName: '',
  hostelDepartment: '',
  requestType: '',
  description: '',
}

const EMPTY_OFFLINE_FORM = {
  studentIdentifier: '',
  studentName: '',
  requestType: '',
  description: '',
  dateTime: getLocalDateTimeValue(),
}

function getNextStatus(status) {
  if (status === 'Pending') return 'In Progress'
  if (status === 'In Progress') return 'Resolved'
  return null
}

export default function HelpDesk() {
  const { user } = useAuth()
  const { complaints, submitAssistedComplaint, updateComplaint } = useApp()
  const toast = useToast()
  const [form, setForm] = useState(EMPTY_FORM)
  const [offlineForm, setOfflineForm] = useState(EMPTY_OFFLINE_FORM)
  const [search, setSearch] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)
  const [submittedId, setSubmittedId] = useState('')
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)
  const offlineQueueKey = `${OFFLINE_QUEUE_KEY}:${user?.id || 'staff'}`
  const [offlineQueue, setOfflineQueue] = useState(() => readOfflineQueue(offlineQueueKey))
  const offlineQueueRef = useRef(offlineQueue)
  const syncingRef = useRef(false)

  const persistOfflineQueue = useCallback((nextQueue) => {
    try {
      window.localStorage.setItem(offlineQueueKey, JSON.stringify(nextQueue))
      offlineQueueRef.current = nextQueue
      setOfflineQueue(nextQueue)
      return true
    } catch (error) {
      console.error('Could not save offline Help Desk requests:', error)
      toast('Offline request could not be saved on this device. Check browser storage and try again.', 'error')
      return false
    }
  }, [offlineQueueKey, toast])

  const assistedRequests = complaints.filter(complaint => complaint.submission_method === 'Help Desk Assisted')
  const filteredRequests = assistedRequests.filter(request =>
    !search || `${request.id} ${request.student_identifier} ${request.student_name} ${request.category}`.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async event => {
    event.preventDefault()
    if (Object.values(form).some(value => !value.trim())) {
      toast('Please complete every field before submitting.', 'warning')
      return
    }

    setSubmitting(true)
    try {
      const requestId = await submitAssistedComplaint(form)
      setSubmittedId(requestId)
      setForm(EMPTY_FORM)
      toast(`Help Desk request ${requestId} created.`, 'success')
    } catch (error) {
      toast(error.message || 'Help Desk request could not be submitted.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const syncPendingRequests = useCallback(async () => {
    if (!navigator.onLine || syncingRef.current) return
    syncingRef.current = true
    try {
      const pendingRequests = offlineQueueRef.current.filter(request => request.status === 'Pending Sync')
      for (const request of pendingRequests) {
        try {
          const requestId = await submitAssistedComplaint({
            ...request,
            hostelDepartment: 'Campus Help Desk',
            requestId: request.requestId,
            createdAt: request.dateTime,
          })
          const syncedAt = new Date().toISOString()
          const updatedQueue = offlineQueueRef.current.map(item => item.localId === request.localId
            ? {
                localId: item.localId,
                requestType: item.requestType,
                dateTime: item.dateTime,
                status: 'Synced',
                requestId,
                syncedAt,
                syncError: '',
              }
            : item)
          if (persistOfflineQueue(updatedQueue)) {
            toast('Offline request synced.', `Request ID: ${requestId}`, 'success')
          }
        } catch (error) {
          console.error(`Could not sync offline Help Desk request ${request.localId}:`, error)
          const updatedQueue = offlineQueueRef.current.map(item => item.localId === request.localId
            ? { ...item, syncError: error.message || 'Sync failed. It will retry when connected.' }
            : item)
          persistOfflineQueue(updatedQueue)
          toast('Offline request is still waiting to sync.', error.message || 'It will retry when connected.', 'warning')
        }
      }
    } finally {
      syncingRef.current = false
    }
  }, [persistOfflineQueue, submitAssistedComplaint, toast])

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      void syncPendingRequests()
    }
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    if (navigator.onLine) void syncPendingRequests()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [syncPendingRequests])

  const handleOfflineSubmit = event => {
    event.preventDefault()
    if (!offlineForm.studentIdentifier.trim() || !offlineForm.studentName.trim() || !offlineForm.requestType || !offlineForm.description.trim() || !offlineForm.dateTime) {
      toast('Complete all offline request fields before saving.', 'warning')
      return
    }

    const offlineRequest = {
      ...offlineForm,
      localId: crypto.randomUUID(),
      requestId: `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
      studentIdentifier: offlineForm.studentIdentifier.trim(),
      studentName: offlineForm.studentName.trim(),
      description: offlineForm.description.trim(),
      dateTime: new Date(offlineForm.dateTime).toISOString(),
      status: 'Pending Sync',
      syncError: '',
    }
    if (!persistOfflineQueue([offlineRequest, ...offlineQueueRef.current])) return

    setOfflineForm({ ...EMPTY_OFFLINE_FORM, dateTime: getLocalDateTimeValue() })
    toast('Request saved on this device.', isOnline ? 'Syncing with NexCampus…' : 'It will sync automatically when the connection returns.', 'info')
    if (navigator.onLine) void syncPendingRequests()
  }

  const retrySync = () => {
    if (navigator.onLine) void syncPendingRequests()
    else toast('No internet connection.', 'The saved requests will retry automatically when you are online.', 'warning')
  }

  const advanceRequest = async request => {
    const nextStatus = getNextStatus(request.status)
    if (!nextStatus) return

    setUpdatingId(request.id)
    try {
      await updateComplaint(request.id, nextStatus, `Help Desk staff updated the request to ${nextStatus}.`)
      toast(`Request ${request.id} moved to ${nextStatus}.`, 'success')
    } catch (error) {
      toast(error.message || 'Request status could not be updated.', 'error')
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="space-y-6">
      {!isOnline && (
        <div role="alert" className="flex items-start gap-3 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-950 shadow-sm">
          <WifiOff size={20} className="mt-0.5 shrink-0" />
          <p className="text-sm font-semibold">No Internet Connection — Your request can be recorded and submitted later.</p>
        </div>
      )}

      <header>
        <h1 className="text-2xl font-bold text-gray-900">Campus Help Desk</h1>
        <p className="mt-1 text-sm text-gray-500">Create and track requests for students who need in-person or kiosk assistance.</p>
      </header>

      <section className="card overflow-hidden border border-violet-100 bg-gradient-to-br from-white via-white to-violet-50">
        <div className="flex items-start gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-100 text-violet-700">
            <Headphones size={24} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">No Smartphone? Get Help</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-gray-600">
              Students can visit the campus help desk or use a shared kiosk. A staff member can enter the request below and share its Request ID with the student.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="help-student-id" className="mb-1.5 block text-sm font-medium text-gray-700">Student ID *</label>
              <input id="help-student-id" value={form.studentIdentifier} onChange={event => setForm(previous => ({ ...previous, studentIdentifier: event.target.value }))} className="input" autoComplete="off" required />
            </div>
            <div>
              <label htmlFor="help-student-name" className="mb-1.5 block text-sm font-medium text-gray-700">Student Name *</label>
              <input id="help-student-name" value={form.studentName} onChange={event => setForm(previous => ({ ...previous, studentName: event.target.value }))} className="input" autoComplete="name" required />
            </div>
            <div>
              <label htmlFor="help-hostel-department" className="mb-1.5 block text-sm font-medium text-gray-700">Hostel / Department *</label>
              <input id="help-hostel-department" value={form.hostelDepartment} onChange={event => setForm(previous => ({ ...previous, hostelDepartment: event.target.value }))} className="input" required />
            </div>
            <div>
              <label htmlFor="help-request-type" className="mb-1.5 block text-sm font-medium text-gray-700">Request Type *</label>
              <select id="help-request-type" value={form.requestType} onChange={event => setForm(previous => ({ ...previous, requestType: event.target.value }))} className="input" required>
                <option value="">Select request type</option>
                {REQUEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="help-description" className="mb-1.5 block text-sm font-medium text-gray-700">Request Description *</label>
            <textarea id="help-description" value={form.description} onChange={event => setForm(previous => ({ ...previous, description: event.target.value }))} className="input min-h-28 resize-y" rows={4} required />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 text-xs text-gray-500"><Smartphone size={15} /> No student smartphone or personal account is needed.</p>
            <button type="submit" disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-800 disabled:cursor-not-allowed disabled:opacity-60">
              <Send size={16} /> {submitting ? 'Submitting…' : 'Submit Help Desk Request'}
            </button>
          </div>
        </form>

        {submittedId && (
          <div role="status" className="mt-5 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-900">
            <CheckCircle2 size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Request submitted successfully</p>
              <p className="mt-1 text-sm">Share this Request ID with the student: <strong className="font-mono">{submittedId}</strong></p>
            </div>
          </div>
        )}
      </section>

      <section className="card space-y-5">
        <div className="flex items-start gap-3">
          <div className={`grid h-10 w-10 shrink-0 place-items-center rounded-xl ${isOnline ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
            {isOnline ? <CloudUpload size={20} /> : <WifiOff size={20} />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Offline Fallback</h2>
            <p className="mt-1 text-sm text-gray-600">
              Save a request securely in this browser while offline. It will sync to NexCampus automatically when the connection returns.
            </p>
          </div>
        </div>

        <form onSubmit={handleOfflineSubmit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="offline-student-id" className="mb-1.5 block text-sm font-medium text-gray-700">Student ID *</label>
              <input id="offline-student-id" value={offlineForm.studentIdentifier} onChange={event => setOfflineForm(previous => ({ ...previous, studentIdentifier: event.target.value }))} className="input" required />
            </div>
            <div>
              <label htmlFor="offline-student-name" className="mb-1.5 block text-sm font-medium text-gray-700">Student Name *</label>
              <input id="offline-student-name" value={offlineForm.studentName} onChange={event => setOfflineForm(previous => ({ ...previous, studentName: event.target.value }))} className="input" required />
            </div>
            <div>
              <label htmlFor="offline-request-type" className="mb-1.5 block text-sm font-medium text-gray-700">Request Type *</label>
              <select id="offline-request-type" value={offlineForm.requestType} onChange={event => setOfflineForm(previous => ({ ...previous, requestType: event.target.value }))} className="input" required>
                <option value="">Select request type</option>
                {REQUEST_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="offline-request-datetime" className="mb-1.5 block text-sm font-medium text-gray-700">Date and Time *</label>
              <input id="offline-request-datetime" type="datetime-local" value={offlineForm.dateTime} onChange={event => setOfflineForm(previous => ({ ...previous, dateTime: event.target.value }))} className="input" required />
            </div>
          </div>
          <div>
            <label htmlFor="offline-request-description" className="mb-1.5 block text-sm font-medium text-gray-700">Description *</label>
            <textarea id="offline-request-description" value={offlineForm.description} onChange={event => setOfflineForm(previous => ({ ...previous, description: event.target.value }))} className="input min-h-24 resize-y" rows={3} required />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">Saved locally on this device until it is synchronized.</p>
            <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-violet-800">
              <CloudUpload size={16} /> Save Offline Request
            </button>
          </div>
        </form>

        {offlineQueue.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <div className="flex items-center justify-between gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Requests Saved on This Device</h3>
                <p className="text-xs text-gray-500">{offlineQueue.filter(request => request.status === 'Pending Sync').length} waiting to sync</p>
              </div>
              {offlineQueue.some(request => request.status === 'Pending Sync') && (
                <button type="button" onClick={retrySync} className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50">
                  <RefreshCw size={14} /> Retry Sync
                </button>
              )}
            </div>
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  {['Student', 'Type', 'Date and Time', 'Sync Status', 'Request ID'].map(label => (
                    <th key={label} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {offlineQueue.map(request => (
                  <tr key={request.localId} className="border-b border-gray-50 last:border-0">
                    <td className="whitespace-nowrap px-4 py-3">
                      {request.status === 'Synced'
                        ? <p className="text-xs text-gray-500">Details synced</p>
                        : <>
                            <p className="font-medium text-gray-800">{request.studentName}</p>
                            <p className="text-xs text-gray-500">{request.studentIdentifier}</p>
                          </>}
                    </td>
                    <td className="px-4 py-3 text-gray-700">{request.requestType}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-xs text-gray-600">{new Date(request.dateTime).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${request.status === 'Synced' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>{request.status}</span>
                      {request.syncError && <p className="mt-1 max-w-52 text-xs text-rose-600">{request.syncError}</p>}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-violet-700">{request.status === 'Synced' ? request.requestId : 'Assigned after sync'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Assisted Requests</h2>
            <p className="mt-1 text-sm text-gray-500">{assistedRequests.length} requests created through the Campus Help Desk</p>
          </div>
          <input value={search} onChange={event => setSearch(event.target.value)} aria-label="Search assisted requests" placeholder="Search ID, student, or type" className="input w-full sm:max-w-xs" />
        </div>

        <div className="card overflow-x-auto p-0">
          {filteredRequests.length === 0 ? (
            <EmptyState message="No assisted requests found." icon={ClipboardList} />
          ) : (
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {['Request ID', 'Student', 'Hostel / Department', 'Request', 'Status', 'Next step'].map(label => (
                    <th key={label} className="whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase text-gray-500">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map(request => {
                  const nextStatus = getNextStatus(request.status)
                  return (
                    <tr key={request.id} className="border-b border-gray-50 align-top last:border-0 hover:bg-violet-50/40">
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs font-semibold text-violet-700">{request.id}<div className="mt-1 font-sans text-gray-500">{request.student_identifier}</div></td>
                      <td className="px-4 py-3 font-medium text-gray-800">{request.student_name}</td>
                      <td className="px-4 py-3 text-gray-600">{request.department || request.location}</td>
                      <td className="min-w-56 px-4 py-3">
                        <p className="font-medium text-gray-800">{request.category}</p>
                        <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-gray-500">{request.description}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3"><StatusBadge status={request.status} /></td>
                      <td className="whitespace-nowrap px-4 py-3">
                        {nextStatus ? (
                          <button type="button" onClick={() => advanceRequest(request)} disabled={updatingId === request.id} className="rounded-lg bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100 disabled:opacity-50">
                            {updatingId === request.id ? 'Updating…' : `Move to ${nextStatus}`}
                          </button>
                        ) : <span className="text-xs font-medium text-emerald-700">Complete</span>}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
