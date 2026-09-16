import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { INITIAL_COMPLAINTS, INITIAL_REQUESTS, INITIAL_LEAVE, INITIAL_NOTIFICATIONS, INITIAL_NOTICES, DEMO_STUDENTS_ADMIN } from '../data/demoData'

const AppContext = createContext(null)
let cmpNum = 2032, reqNum = 1046, lvNum = 302

export function AppProvider({ children }) {
  const [liteMode, setLiteMode] = useState(() => localStorage.getItem('cp_lite') === 'true')
  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS)
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE)
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)
  const [notices, setNotices] = useState(INITIAL_NOTICES)
  const [messFeedback, setMessFeedback] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    localStorage.setItem('cp_lite', liteMode)
    document.body.classList.toggle('lite-mode', liteMode)
  }, [liteMode])

  const addNotif = useCallback((userId, title, message, type = 'info', link = '') => {
    setNotifications(p => [{ id: `n${Date.now()}`, user_id: userId, title, message, type, read: false, created_at: new Date().toISOString(), link }, ...p])
  }, [])

  const submitComplaint = useCallback((data, studentId, studentName) => {
    const id = `CMP-${cmpNum++}`
    setComplaints(p => [{ id, student_id: studentId, student_name: studentName, ...data, status: 'Submitted', assigned_to: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), updates: [{ status: 'Submitted', note: 'Complaint submitted by student', time: new Date().toISOString() }] }, ...p])
    addNotif(studentId, 'Complaint Submitted', `Your complaint ${id} has been submitted.`, 'success', '/student/complaints')
    return id
  }, [addNotif])

  const updateComplaint = useCallback((id, status, note, assignedTo = null) => {
    setComplaints(p => p.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, status, assigned_to: assignedTo ?? c.assigned_to, updated_at: new Date().toISOString(), updates: [...c.updates, { status, note, time: new Date().toISOString() }] }
      addNotif(c.student_id, `Complaint ${status}`, `Your complaint ${id} is now: ${status}`, status === 'Resolved' ? 'success' : 'info', '/student/complaints')
      return updated
    }))
  }, [addNotif])

  const submitRequest = useCallback((data, studentId, studentName) => {
    const id = `REQ-${reqNum++}`
    setRequests(p => [{ id, student_id: studentId, student_name: studentName, ...data, status: 'Submitted', admin_comment: '', file_url: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() }, ...p])
    addNotif(studentId, 'Request Submitted', `Your ${data.type} request ${id} has been submitted.`, 'info', '/student/documents')
    return id
  }, [addNotif])

  const updateRequest = useCallback((id, status, comment = '', fileUrl = null) => {
    setRequests(p => p.map(r => {
      if (r.id !== id) return r
      const updated = { ...r, status, admin_comment: comment, file_url: fileUrl ?? r.file_url, updated_at: new Date().toISOString() }
      addNotif(r.student_id, `Document ${status}`, `Your ${r.type} request ${id} has been ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'info', '/student/documents')
      return updated
    }))
  }, [addNotif])

  const submitLeave = useCallback((data, studentId, studentName) => {
    const id = `${data.type === 'Gate Pass' ? 'GP' : 'LV'}-${lvNum++}`
    setLeaveRequests(p => [{ id, student_id: studentId, student_name: studentName, ...data, status: 'Pending', admin_comment: '', created_at: new Date().toISOString() }, ...p])
    addNotif(studentId, `${data.type} Submitted`, `Your ${data.type} ${id} submitted for approval.`, 'info', '/student/leave')
    return id
  }, [addNotif])

  const updateLeave = useCallback((id, status, comment = '') => {
    setLeaveRequests(p => p.map(l => {
      if (l.id !== id) return l
      addNotif(l.student_id, `${l.type} ${status}`, `Your ${l.type} ${id} has been ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'warning', '/student/leave')
      return { ...l, status, admin_comment: comment }
    }))
  }, [addNotif])

  const markRead = useCallback((id) => setNotifications(p => p.map(n => n.id === id ? { ...n, read: true } : n)), [])
  const markAllRead = useCallback(() => setNotifications(p => p.map(n => ({ ...n, read: true }))), [])
  const addNotice = useCallback((data, adminName) => setNotices(p => [{ id: `nc${Date.now()}`, ...data, created_by: adminName, created_at: new Date().toISOString() }, ...p]), [])
  const addMessFeedback = useCallback((data, studentId) => setMessFeedback(p => [...p, { id: `mf${Date.now()}`, student_id: studentId, ...data, created_at: new Date().toISOString() }]), [])

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <AppContext.Provider value={{
      liteMode, setLiteMode,
      complaints, submitComplaint, updateComplaint,
      requests, submitRequest, updateRequest,
      leaveRequests, submitLeave, updateLeave,
      notifications, markRead, markAllRead, unreadCount,
      notices, addNotice,
      messFeedback, addMessFeedback,
      searchQuery, setSearchQuery,
      students: DEMO_STUDENTS_ADMIN,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
