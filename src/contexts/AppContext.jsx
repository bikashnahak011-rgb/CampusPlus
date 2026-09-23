import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'

import {
  INITIAL_COMPLAINTS,
  INITIAL_REQUESTS,
  INITIAL_LEAVE,
  INITIAL_NOTIFICATIONS,
  INITIAL_NOTICES,
  DEMO_STUDENTS_ADMIN,
} from '../data/demoData'

import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

let cmpNum = 2032
let reqNum = 1046
let lvNum = 302

const AI_API_URL =
  import.meta.env.VITE_AI_API_URL || 'http://localhost:8000'

export function AppProvider({ children }) {
  const { user } = useAuth()

  const [liteMode, setLiteMode] = useState(
    () => localStorage.getItem('cp_lite') === 'true'
  )

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS)
  const [requests, setRequests] = useState(INITIAL_REQUESTS)
  const [leaveRequests, setLeaveRequests] = useState(INITIAL_LEAVE)

  const [notifications, setNotifications] = useState(
    INITIAL_NOTIFICATIONS
  )

  const [notices, setNotices] = useState(INITIAL_NOTICES)
  const [messFeedback, setMessFeedback] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  /*
  ============================================================
  FETCH NOTIFICATIONS FROM FASTAPI
  ============================================================
  */

  const fetchNotifications = useCallback(async () => {
    try {
      // Demo users use the local demo notification system.
      if (user?.isDemo) {
        return
      }

      if (!supabase || !user) {
        return
      }

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) {
        console.error(
          'Session error:',
          sessionError.message
        )
        return
      }

      if (!session?.access_token) {
        console.warn('No Supabase access token found.')
        return
      }

      const response = await fetch(
        `${AI_API_URL}/api/notifications/me`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      if (!response.ok) {
        const errorText = await response.text()

        console.error(
          'Notification API error:',
          response.status,
          errorText
        )

        return
      }

      const data = await response.json()

      console.log(
        'Notifications received from FastAPI:',
        data
      )

      if (Array.isArray(data)) {
        setNotifications(data)
      }
    } catch (error) {
      console.error(
        'Failed to fetch notifications:',
        error
      )
    }
  }, [user])

  /*
  ============================================================
  LOAD REAL NOTIFICATIONS
  ============================================================
  */

  useEffect(() => {
    if (!user || user.isDemo) {
      return
    }

    fetchNotifications()

    /*
      Check for new notifications every 5 seconds.
      This makes admin notifications appear automatically
      without manually refreshing the page.
    */

    const interval = setInterval(() => {
      fetchNotifications()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [user, fetchNotifications])

  /*
  ============================================================
  LITE MODE
  ============================================================
  */

  useEffect(() => {
    localStorage.setItem('cp_lite', liteMode)
    document.body.classList.toggle(
      'lite-mode',
      liteMode
    )
  }, [liteMode])

  /*
  ============================================================
  LOCAL NOTIFICATION
  ============================================================
  */

  const addNotif = useCallback(
    (
      userId,
      title,
      message,
      type = 'info',
      link = ''
    ) => {
      setNotifications((previous) => [
        {
          id: `n${Date.now()}`,
          user_id: userId,
          title,
          message,
          type,
          read: false,
          created_at: new Date().toISOString(),
          link,
        },
        ...previous,
      ])
    },
    []
  )

  /*
  ============================================================
  COMPLAINTS
  ============================================================
  */

  const submitComplaint = useCallback(
    (data, studentId, studentName) => {
      const id = `CMP-${cmpNum++}`

      setComplaints((previous) => [
        {
          id,
          student_id: studentId,
          student_name: studentName,
          ...data,
          status: 'Submitted',
          assigned_to: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          updates: [
            {
              status: 'Submitted',
              note: 'Complaint submitted by student',
              time: new Date().toISOString(),
            },
          ],
        },
        ...previous,
      ])

      addNotif(
        studentId,
        'Complaint Submitted',
        `Your complaint ${id} has been submitted.`,
        'success',
        '/student/complaints'
      )

      return id
    },
    [addNotif]
  )

  const updateComplaint = useCallback(
    (id, status, note, assignedTo = null) => {
      setComplaints((previous) =>
        previous.map((complaint) => {
          if (complaint.id !== id) {
            return complaint
          }

          const updated = {
            ...complaint,
            status,
            assigned_to:
              assignedTo ?? complaint.assigned_to,
            updated_at: new Date().toISOString(),
            updates: [
              ...complaint.updates,
              {
                status,
                note,
                time: new Date().toISOString(),
              },
            ],
          }

          addNotif(
            complaint.student_id,
            `Complaint ${status}`,
            `Your complaint ${id} is now: ${status}`,
            status === 'Resolved'
              ? 'success'
              : 'info',
            '/student/complaints'
          )

          return updated
        })
      )
    },
    [addNotif]
  )

  /*
  ============================================================
  REQUESTS
  ============================================================
  */

  const submitRequest = useCallback(
    (data, studentId, studentName) => {
      const id = `REQ-${reqNum++}`

      setRequests((previous) => [
        {
          id,
          student_id: studentId,
          student_name: studentName,
          ...data,
          status: 'Submitted',
          admin_comment: '',
          file_url: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        ...previous,
      ])

      addNotif(
        studentId,
        'Request Submitted',
        `Your ${data.type} request ${id} has been submitted.`,
        'info',
        '/student/documents'
      )

      return id
    },
    [addNotif]
  )

  const updateRequest = useCallback(
    (
      id,
      status,
      comment = '',
      fileUrl = null
    ) => {
      setRequests((previous) =>
        previous.map((request) => {
          if (request.id !== id) {
            return request
          }

          const updated = {
            ...request,
            status,
            admin_comment: comment,
            file_url:
              fileUrl ?? request.file_url,
            updated_at:
              new Date().toISOString(),
          }

          addNotif(
            request.student_id,
            `Document ${status}`,
            `Your ${request.type} request ${id} has been ${status.toLowerCase()}.`,
            status === 'Approved'
              ? 'success'
              : 'info',
            '/student/documents'
          )

          return updated
        })
      )
    },
    [addNotif]
  )

  /*
  ============================================================
  LEAVE
  ============================================================
  */

  const submitLeave = useCallback(
    (data, studentId, studentName) => {
      const id = `${
        data.type === 'Gate Pass'
          ? 'GP'
          : 'LV'
      }-${lvNum++}`

      setLeaveRequests((previous) => [
        {
          id,
          student_id: studentId,
          student_name: studentName,
          ...data,
          status: 'Pending',
          admin_comment: '',
          created_at:
            new Date().toISOString(),
        },
        ...previous,
      ])

      addNotif(
        studentId,
        `${data.type} Submitted`,
        `Your ${data.type} ${id} submitted for approval.`,
        'info',
        '/student/leave'
      )

      return id
    },
    [addNotif]
  )

  const updateLeave = useCallback(
    (id, status, comment = '') => {
      setLeaveRequests((previous) =>
        previous.map((leave) => {
          if (leave.id !== id) {
            return leave
          }

          addNotif(
            leave.student_id,
            `${leave.type} ${status}`,
            `Your ${leave.type} ${id} has been ${status.toLowerCase()}.`,
            status === 'Approved'
              ? 'success'
              : 'warning',
            '/student/leave'
          )

          return {
            ...leave,
            status,
            admin_comment: comment,
          }
        })
      )
    },
    [addNotif]
  )

  /*
  ============================================================
  READ NOTIFICATIONS
  ============================================================
  */

  const markRead = useCallback(
    async (id) => {
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
                is_read: true,
              }
            : notification
        )
      )

      /*
        The current backend only exposes GET /me and
        POST /admin. Therefore we update the UI locally
        for now.
      */
    },
    []
  )

  const markAllRead = useCallback(() => {
    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        read: true,
        is_read: true,
      }))
    )
  }, [])

  /*
  ============================================================
  NOTICES
  ============================================================
  */

  const addNotice = useCallback(
    (data, adminName) => {
      setNotices((previous) => [
        {
          id: `nc${Date.now()}`,
          ...data,
          created_by: adminName,
          created_at:
            new Date().toISOString(),
        },
        ...previous,
      ])
    },
    []
  )

  /*
  ============================================================
  MESS FEEDBACK
  ============================================================
  */

  const addMessFeedback = useCallback(
    (data, studentId) => {
      setMessFeedback((previous) => [
        ...previous,
        {
          id: `mf${Date.now()}`,
          student_id: studentId,
          ...data,
          created_at:
            new Date().toISOString(),
        },
      ])
    },
    []
  )

  /*
  ============================================================
  UNREAD COUNT
  ============================================================
  */

  const unreadCount = notifications.filter(
    (notification) =>
      !notification.read &&
      !notification.is_read
  ).length

  /*
  ============================================================
  PROVIDER
  ============================================================
  */

  return (
    <AppContext.Provider
      value={{
        liteMode,
        setLiteMode,

        complaints,
        submitComplaint,
        updateComplaint,

        requests,
        submitRequest,
        updateRequest,

        leaveRequests,
        submitLeave,
        updateLeave,

        notifications,
        markRead,
        markAllRead,
        unreadCount,

        notices,
        addNotice,

        messFeedback,
        addMessFeedback,

        searchQuery,
        setSearchQuery,

        students: DEMO_STUDENTS_ADMIN,

        // Useful if another component needs to manually refresh.
        fetchNotifications,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () =>
  useContext(AppContext)