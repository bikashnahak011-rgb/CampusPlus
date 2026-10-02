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
  DEMO_MESS_MENU,
  INITIAL_BUS_ROUTES,
  INITIAL_CAMPUS_ROOMS,
  INITIAL_FACULTY,
  DEMO_STUDENTS_ADMIN,
  DEMO_EXAM_RESULTS,
  INITIAL_CAMPUS_JOURNAL,
} from '../data/demoData.js'

import {
  DASHBOARD_VIDEOS_STORAGE_KEY,
  getStoredDashboardVideos,
  normalizeDashboardVideo,
  sanitizeDashboardVideos,
} from '../lib/dashboardVideos'
import { requestBackend } from '../lib/backendApi'
import { matchesNoticeTarget } from '../lib/noticeAudience'
import { normalizeLanguage, translateText } from '../lib/translations'
import { useAuth } from './AuthContext'
import { supabase } from '../lib/supabase'

const AppContext = createContext(null)

const AI_API_URL =
  import.meta.env.VITE_AI_API_URL || (import.meta.env.DEV ? 'http://localhost:8000' : '')

let cmpNum = 2032
const DEMO_NOTIFICATIONS_KEY = 'campusplus_demo_notifications'
const DEMO_NOTICES_KEY = 'campusplus_demo_notices'
const DEMO_EXAM_RESULTS_KEY = 'campusplus_demo_exam_results'
const DEMO_CAMPUS_JOURNAL_KEY = 'campusplus_demo_campus_journal'

function getStoredDemoValue(key, fallback) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || 'null')
    return Array.isArray(saved) ? saved : fallback
  } catch {
    return fallback
  }
}

function normalizeBusRoute(route) {
  return {
    ...route,
    number: route.number ?? route.bus_number,
    name: route.name ?? route.route_name,
    stops: route.stops ?? route.route_name?.split('→').map(stop => stop.trim()) ?? [],
    departure: route.departure ?? 'Not scheduled',
    arrival: route.arrival ?? 'Not scheduled',
    frequency: route.frequency ?? 'See timetable',
    notice: route.notice ?? '',
    status: route.status === 'Running' ? 'Running today' : route.status,
  }
}

function normalizeCampusRoom(room) {
  const code = room.code ?? room.room_number ?? room.id
  const status = room.status === 'Occupied' ? 'In use' : room.status
  return {
    ...room,
    code,
    name: room.name ?? room.current_subject ?? code,
    floor: String(room.floor ?? 'Not listed'),
    type: room.type ?? (/lab/i.test(code) ? 'Lab' : 'Classroom'),
    status,
    note: room.note ?? (room.current_subject ? `Class in progress: ${room.current_subject}` : status === 'Available' ? 'Available now.' : ''),
  }
}

export function AppProvider({ children }) {
  const { user } = useAuth()

  // ============================================================
  // LITE MODE
  // ============================================================

  const [liteMode, setLiteMode] = useState(
    () => localStorage.getItem('cp_lite') === 'true'
  )

  const [language, setLanguage] = useState(() => {
    if (typeof localStorage === 'undefined') return 'en'
    return normalizeLanguage(localStorage.getItem('cp_language'))
  })

  const t = useCallback((key, fallback, params) => translateText(language, key, fallback, params ?? (typeof fallback === 'object' && fallback !== null ? fallback : undefined)), [language])

  // ============================================================
  // DATA
  // ============================================================

  const [complaints, setComplaints] = useState(INITIAL_COMPLAINTS)
  const [liveComplaints, setLiveComplaints] = useState({ userId: null, items: [] })
  const [requests, setRequests] = useState([])
  const [leaveRequests, setLeaveRequests] = useState([])

  const [notifications, setNotifications] = useState(() => getStoredDemoValue(DEMO_NOTIFICATIONS_KEY, INITIAL_NOTIFICATIONS))

  const [notices, setNotices] = useState(() => getStoredDemoValue(DEMO_NOTICES_KEY, INITIAL_NOTICES))
  const [campusJournalItems, setCampusJournalItems] = useState([])
  const [campusJournalError, setCampusJournalError] = useState('')

  const [messFeedback, setMessFeedback] = useState([])
  const [messMenu, setMessMenu] = useState({})
  const [dashboardVideos, setDashboardVideos] = useState(getStoredDashboardVideos)

  // Bus and classroom data
  const [busRoutes, setBusRoutes] = useState([])

  const [campusRooms, setCampusRooms] = useState([])
  const [faculty, setFaculty] = useState([])
  const [students, setStudents] = useState([])
  const [examResults, setExamResults] = useState(() => getStoredDemoValue(DEMO_EXAM_RESULTS_KEY, DEMO_EXAM_RESULTS))

  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (!user) {
      setNotices([])
      setCampusJournalItems([])
      setCampusJournalError('')
      setFaculty([])
      setStudents([])
      setBusRoutes([])
      setCampusRooms([])
      setMessMenu({})
      setMessFeedback([])
      return undefined
    }
    if (user.isDemo) {
      setNotices(getStoredDemoValue(DEMO_NOTICES_KEY, INITIAL_NOTICES))
      setCampusJournalItems(getStoredDemoValue(DEMO_CAMPUS_JOURNAL_KEY, INITIAL_CAMPUS_JOURNAL))
      setCampusJournalError('')
      setFaculty(INITIAL_FACULTY)
      setStudents(DEMO_STUDENTS_ADMIN)
      setBusRoutes(INITIAL_BUS_ROUTES.map(normalizeBusRoute))
      setCampusRooms(INITIAL_CAMPUS_ROOMS.map(normalizeCampusRoom))
      setMessMenu(DEMO_MESS_MENU)
      setMessFeedback([])
      return undefined
    }
    setNotices([])
    setCampusJournalItems([])
    setCampusJournalError('')
    setFaculty([])
    setStudents([])
    setBusRoutes([])
    setCampusRooms([])
    setMessMenu({})
    setMessFeedback([])
    if (!supabase) {
      setCampusJournalError('Campus Journal requires a configured Supabase connection.')
      return undefined
    }

    let active = true
    const loadDirectoryData = async () => {
      const results = await Promise.all([
        supabase.from('notices').select('*').order('created_at', { ascending: false }),
        supabase.from('faculty').select('*').order('name'),
        supabase.from('mess_menu').select('*').order('day'),
        supabase.from('bus_routes').select('*').order('number'),
        supabase.from('campus_rooms').select('*').order('code'),
        user.role === 'admin'
          ? supabase.from('profiles').select('id,name,roll_no,department,year,hostel_block,room_number').eq('role', 'student').order('name')
          : Promise.resolve({ data: [], error: null }),
        user.role === 'admin'
          ? supabase.from('mess_feedback').select('*').order('created_at', { ascending: false })
          : Promise.resolve({ data: [], error: null }),
        supabase.from('campus_journal').select('*').order('created_at', { ascending: false }),
      ])
      if (!active) return
      const [noticesResult, facultyResult, menuResult] = results
      if (noticesResult.error) console.error('Failed to load notices:', noticesResult.error.message)
      else setNotices(noticesResult.data || [])
      if (facultyResult.error) console.error('Failed to load faculty:', facultyResult.error.message)
      else setFaculty(facultyResult.data || [])
      if (menuResult.error) console.error('Failed to load mess menu:', menuResult.error.message)
      else setMessMenu((menuResult.data || []).reduce((menu, row) => ({ ...menu, [row.day]: row }), {}))
      if (results[3].error) console.error('Failed to load bus routes:', results[3].error.message)
      else setBusRoutes((results[3].data || []).map(normalizeBusRoute))
      if (results[4].error) console.error('Failed to load campus rooms:', results[4].error.message)
      else setCampusRooms((results[4].data || []).map(normalizeCampusRoom))
      if (user.role === 'admin') {
        if (results[5].error) console.error('Failed to load student directory:', results[5].error.message)
        else setStudents((results[5].data || []).map(student => ({
          ...student,
          roll: student.roll_no || '',
          dept: student.department || 'Unassigned',
          hostel: student.hostel_block ? `${student.hostel_block}-${student.room_number || 'Unassigned'}` : 'Day Scholar',
          status: 'Active',
        })))
        if (results[6].error) console.error('Failed to load mess feedback:', results[6].error.message)
        else setMessFeedback(results[6].data || [])
      }
      if (results[7].error) {
        console.error('Failed to load Campus Journal:', results[7].error.message)
        setCampusJournalItems([])
        setCampusJournalError('Campus Journal database setup is incomplete. Apply supabase/campus_journal.sql.')
      } else {
        setCampusJournalItems(results[7].data || [])
        setCampusJournalError('')
      }
    }

    loadDirectoryData()
    const channel = supabase
      .channel(`directory-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'faculty' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mess_menu' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'mess_feedback' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bus_routes' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_rooms' }, loadDirectoryData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'campus_journal' }, loadDirectoryData)
      .subscribe()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadDirectoryData()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setRequests([])
      setLeaveRequests([])
      return undefined
    }

    if (user.isDemo) {
      setRequests(INITIAL_REQUESTS.map(request => ({
        ...request,
        student_id: user.role === 'student' ? user.id : request.student_id,
        student_name: user.role === 'student' ? user.name : request.student_name,
      })))
      setLeaveRequests(INITIAL_LEAVE.map(request => ({
        ...request,
        student_id: user.role === 'student' ? user.id : request.student_id,
        student_name: user.role === 'student' ? user.name : request.student_name,
      })))
      return undefined
    }

    if (!supabase) {
      setRequests([])
      setLeaveRequests([])
      return undefined
    }

    let active = true
    const loadRequests = async () => {
      const [documentsResult, leaveResult] = await Promise.all([
        supabase.from('requests').select('*').order('created_at', { ascending: false }),
        supabase.from('leave_requests').select('*').order('created_at', { ascending: false }),
      ])
      if (!active) return
      if (documentsResult.error) console.error('Failed to load document requests:', documentsResult.error.message)
      else setRequests(documentsResult.data || [])
      if (leaveResult.error) console.error('Failed to load leave requests:', leaveResult.error.message)
      else setLeaveRequests(leaveResult.data || [])
    }

    loadRequests()
    const channel = supabase
      .channel(`requests-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'requests' }, loadRequests)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leave_requests' }, loadRequests)
      .subscribe()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadRequests()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [user])

  useEffect(() => {
    if (!user) {
      setExamResults([])
      return undefined
    }

    if (user.isDemo) {
      setExamResults(getStoredDemoValue(DEMO_EXAM_RESULTS_KEY, DEMO_EXAM_RESULTS))
      return undefined
    }

    setExamResults([])
    if (!supabase) return undefined

    let active = true
    const loadExamResults = async () => {
      let query = supabase.from('exam_results').select('*').order('published_at', { ascending: false })
      if (user.role !== 'admin') query = query.eq('student_id', user.id).eq('published', true)
      const { data, error } = await query
      if (!active) return
      if (error) console.error('Failed to load exam results:', error.message)
      else setExamResults(data || [])
    }

    loadExamResults()
    const channel = supabase
      .channel(`exam-results-${user.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'exam_results' }, loadExamResults)
      .subscribe()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadExamResults()
    }, 10000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
      supabase.removeChannel(channel)
    }
  }, [user])

  const saveFaculty = useCallback(async (entry) => {
    const record = {
      id: entry.id || crypto.randomUUID(),
      name: entry.name.trim(),
      qualification: entry.qualification.trim(),
      classes_taught: entry.classes_taught,
      subjects: entry.subjects,
      updated_at: new Date().toISOString(),
    }

    let saved = record
    if (supabase && user && !user.isDemo) {
      const { data, error } = await supabase.from('faculty').upsert(record).select().single()
      if (error) throw error
      saved = data
    }

    setFaculty(previous => {
      const next = previous.some(item => item.id === saved.id)
        ? previous.map(item => item.id === saved.id ? saved : item)
        : [...previous, saved]
      return next.sort((first, second) => first.name.localeCompare(second.name))
    })
    return saved
  }, [user])

  const deleteFaculty = useCallback(async (id) => {
    if (supabase && user && !user.isDemo) {
      const { error } = await supabase.from('faculty').delete().eq('id', id)
      if (error) throw error
    }
    setFaculty(previous => previous.filter(item => item.id !== id))
  }, [user])

  const updateMessMenu = useCallback(async (day, updates) => {
    const existing = messMenu[day]
    const record = { day, breakfast: updates.breakfast, lunch: updates.lunch, snacks: updates.snacks, dinner: updates.dinner }
    if (user?.isDemo) {
      const saved = { ...existing, ...record }
      setMessMenu(previous => ({ ...previous, [day]: saved }))
      return saved
    }
    if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can edit the mess menu.')

    const query = existing?.id
      ? supabase.from('mess_menu').update(record).eq('id', existing.id)
      : supabase.from('mess_menu').insert(record)
    const { data, error } = await query.select().single()
    if (error) throw new Error(`Mess menu could not be saved: ${error.message}`)
    setMessMenu(previous => ({ ...previous, [day]: data }))
    return data
  }, [messMenu, user])

  const fetchComplaints = useCallback(async () => {
    if (!supabase || !user || user.isDemo) {
      return
    }

    let query = supabase
      .from('complaints')
      .select('*, updates:complaint_updates(status,note,created_at)')
      .order('created_at', { ascending: false })

    if (user.role !== 'admin') {
      query = query.eq('student_id', user.id)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch complaints:', error.message)
      return
    }

    setLiveComplaints({
      userId: user.id,
      items: (data || []).map(complaint => ({
        ...complaint,
        updates: (complaint.updates || []).map(update => ({
          ...update,
          time: update.created_at,
        })),
      })),
    })
  }, [user])

  useEffect(() => {
    if (!user || user.isDemo || !supabase) {
      return
    }

    fetchComplaints()

    const channel = supabase
      .channel(`complaints-${user.id}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'complaints',
        ...(user.role === 'admin' ? {} : { filter: `student_id=eq.${user.id}` }),
      }, fetchComplaints)
      .subscribe(status => {
        if (status === 'CHANNEL_ERROR') {
          console.error('Complaint realtime subscription failed.')
        }
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, fetchComplaints])

  const updateBusRoute = useCallback(async (id, updates) => {
    if (!user?.isDemo) {
      if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can edit bus routes.')
      const { error } = await supabase.from('bus_routes').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw new Error(`Bus route could not be saved: ${error.message}`)
    }
    setBusRoutes(previous =>
      previous.map(route =>
        route.id === id
          ? normalizeBusRoute({ ...route, ...updates })
          : route
      )
    )
  }, [user])

  const addBusRoute = useCallback(async route => {
    const record = { ...route, id: route.id || crypto.randomUUID() }
    if (!user?.isDemo) {
      if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can add bus routes.')
      const { data, error } = await supabase.from('bus_routes').insert(record).select().single()
      if (error) throw new Error(`Bus route could not be created: ${error.message}`)
      setBusRoutes(previous => [...previous, normalizeBusRoute(data)])
      return data
    }
    setBusRoutes(previous => [...previous, normalizeBusRoute(record)])
    return record
  }, [user])

  const updateCampusRoom = useCallback(async (id, updates) => {
    if (!user?.isDemo) {
      if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can edit room availability.')
      const { error } = await supabase.from('campus_rooms').update({ ...updates, updated_at: new Date().toISOString() }).eq('id', id)
      if (error) throw new Error(`Room status could not be saved: ${error.message}`)
    }
    setCampusRooms(previous =>
      previous.map(room =>
        room.id === id
          ? { ...room, ...updates }
          : room
      )
    )
  }, [user])

  const addDashboardVideo = useCallback((video) => {
    const normalized = normalizeDashboardVideo(video)
    if (!normalized.embedUrl) {
      throw new Error('Add a valid YouTube link to show on the dashboard.')
    }

    setDashboardVideos(previous => sanitizeDashboardVideos([
      ...previous,
      normalized,
    ]))
  }, [])

  const removeDashboardVideo = useCallback((id) => {
    setDashboardVideos(previous => previous.filter(video => video.id !== id))
  }, [])

  const addCampusRoom = useCallback(async room => {
    const record = { ...room, id: room.id || crypto.randomUUID() }
    if (!user?.isDemo) {
      if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can add campus rooms.')
      const { data, error } = await supabase.from('campus_rooms').insert(record).select().single()
      if (error) throw new Error(`Campus room could not be created: ${error.message}`)
      setCampusRooms(previous => [...previous, normalizeCampusRoom(data)])
      return data
    }
    setCampusRooms(previous => [...previous, normalizeCampusRoom(record)])
    return record
  }, [user])

  // ============================================================
  // FETCH NOTIFICATIONS FROM FASTAPI
  // ============================================================

  const fetchNotifications = useCallback(async () => {
    try {
      // Demo users use local demo notifications
      if (user?.isDemo) {
        return
      }

      if (!supabase || !user) {
        return
      }

      if (!AI_API_URL) {
        console.warn('Live notifications are unavailable: VITE_AI_API_URL is not configured.')
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
        console.warn(
          'No Supabase access token found.'
        )
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

  // ============================================================
  // LOAD REAL NOTIFICATIONS
  // ============================================================

  useEffect(() => {
    if (!user || user.isDemo) {
      return
    }

    fetchNotifications()

    // Check every 5 seconds
    const interval = setInterval(() => {
      fetchNotifications()
    }, 5000)

    return () => {
      clearInterval(interval)
    }
  }, [user, fetchNotifications])

  // ============================================================
  // LITE MODE
  // ============================================================

  useEffect(() => {
    localStorage.setItem('cp_lite', liteMode)

    document.body.classList.toggle(
      'lite-mode',
      liteMode
    )
  }, [liteMode])

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cp_language', language)
    }

    document.documentElement.lang = language
  }, [language])

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(DASHBOARD_VIDEOS_STORAGE_KEY, JSON.stringify(sanitizeDashboardVideos(dashboardVideos)))
    }
  }, [dashboardVideos])

  useEffect(() => {
    if (user?.isDemo) {
      localStorage.setItem(DEMO_NOTIFICATIONS_KEY, JSON.stringify(notifications))
      localStorage.setItem(DEMO_NOTICES_KEY, JSON.stringify(notices))
    }
  }, [notifications, notices, user])

  useEffect(() => {
    if (user?.isDemo) {
      localStorage.setItem(DEMO_EXAM_RESULTS_KEY, JSON.stringify(examResults))
    }
  }, [examResults, user])

  // ============================================================
  // LOCAL NOTIFICATION
  // ============================================================

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
          id: crypto.randomUUID(),
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

  // ============================================================
  // COMPLAINTS
  // ============================================================

  const submitComplaint = useCallback(
    async (data, studentId, studentName) => {
      if (!user?.isDemo) {
        if (!supabase || !user) {
          throw new Error('Sign in with a configured campus account to submit a complaint.')
        }

        const id = `CMP-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
        const createdAt = new Date().toISOString()
        const { error } = await supabase.from('complaints').insert({
          id,
          student_id: studentId,
          student_name: studentName,
          category: data.category,
          location: data.location,
          description: data.description,
          priority: data.priority,
          department: data.department,
          ai_category: data.ai_category,
        })

        if (error) {
          throw new Error(`Complaint could not be saved: ${error.message}`)
        }

        setLiveComplaints(previous => ({
          userId: studentId,
          items: [{
            id,
            student_id: studentId,
            student_name: studentName,
            ...data,
            status: 'Submitted',
            assigned_to: null,
            created_at: createdAt,
            updated_at: createdAt,
            updates: [{ status: 'Submitted', note: 'Complaint submitted by student', time: createdAt }],
          }, ...(previous.userId === studentId ? previous.items : [])],
        }))

        return id
      }

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
    [addNotif, user]
  )

  const updateComplaint = useCallback(
    async (
      id,
      status,
      note,
      assignedTo = null
    ) => {
      if (!user?.isDemo) {
        if (!supabase || !user) {
          throw new Error('Sign in with a configured campus account to update a complaint.')
        }

        const updatedAt = new Date().toISOString()
        const { error } = await supabase.rpc('update_complaint_status', {
          p_complaint_id: id,
          p_status: status,
          p_note: note,
          p_assigned_to: assignedTo,
        })

        if (error) {
          throw new Error(`Complaint could not be updated: ${error.message}`)
        }

        setLiveComplaints(previous => ({
          userId: user.id,
          items: previous.userId === user.id
            ? previous.items.map(complaint =>
                complaint.id === id
                  ? {
                      ...complaint,
                      status,
                      assigned_to: assignedTo ?? complaint.assigned_to,
                      updated_at: updatedAt,
                      updates: [...(complaint.updates || []), { status, note, time: updatedAt }],
                    }
                  : complaint
              )
            : [],
        }))
        return
      }

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

            updated_at:
              new Date().toISOString(),

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
    [addNotif, user]
  )

  // ============================================================
  // REQUESTS
  // ============================================================

  const submitRequest = useCallback(
    async (data, studentId, studentName) => {
      const id = `REQ-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
      const createdAt = new Date().toISOString()
      const request = {
        id,
        student_id: studentId,
        student_name: studentName,
        ...data,
        status: 'Submitted',
        admin_comment: '',
        file_url: null,
        created_at: createdAt,
        updated_at: createdAt,
      }

      if (!user?.isDemo) {
        if (!supabase || !user) throw new Error('Sign in with a configured campus account to submit a document request.')
        const { error } = await supabase.from('requests').insert(request)
        if (error) throw new Error(`Request could not be saved: ${error.message}`)
      }

      setRequests(previous => [request, ...previous])

      if (user?.isDemo) {
        addNotif(studentId, 'Request Submitted', `Your ${data.type} request ${id} has been submitted.`, 'info', '/student/documents')
      }

      return id
    },
    [addNotif, user]
  )

  const updateRequest = useCallback(
    async (
      id,
      status,
      comment = '',
      fileUrl = null
    ) => {
      const updatedAt = new Date().toISOString()
      const request = requests.find(item => item.id === id)
      if (!user?.isDemo) {
        if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can update requests.')
        const { error } = await supabase.from('requests').update({
          status,
          admin_comment: comment,
          file_url: fileUrl,
          updated_at: updatedAt,
        }).eq('id', id)
        if (error) throw new Error(`Request could not be updated: ${error.message}`)
      }

      setRequests(previous => previous.map(item => item.id === id ? {
        ...item,
        status,
        admin_comment: comment,
        file_url: fileUrl ?? item.file_url,
        updated_at: updatedAt,
      } : item))

      if (user?.isDemo && request) {
        const notificationType = status === 'Approved' && /certificate/i.test(request.type) ? 'certificate' : status === 'Approved' ? 'success' : 'info'
        addNotif(request.student_id, `${request.type} ${status}`, `Your ${request.type} request ${id} has been ${status.toLowerCase()}.`, notificationType, '/student/documents')
      }
    },
    [addNotif, requests, user]
  )

  // ============================================================
  // EXAM RESULTS
  // ============================================================

  const publishExamResult = useCallback(async data => {
    if (user?.role !== 'admin') throw new Error('Only administrators can publish exam results.')

    const result = {
      id: crypto.randomUUID(),
      student_id: data.student_id,
      result_type: data.result_type,
      result_value: Number(data.result_value),
      academic_year: data.academic_year.trim(),
      semester: Number(data.semester),
      published: true,
      published_at: new Date().toISOString(),
      created_by: user.id,
    }
    if (!result.student_id || !['SGPA', 'CGPA'].includes(result.result_type) || !result.academic_year) throw new Error('Complete all required result details.')
    if (!Number.isInteger(result.semester) || result.semester < 1 || result.semester > 12) throw new Error('Semester must be between 1 and 12.')
    if (!Number.isFinite(result.result_value) || result.result_value < 0 || result.result_value > 10) throw new Error('GPA must be between 0 and 10.')

    let saved = result
    if (!user.isDemo) {
      if (!supabase) throw new Error('Supabase is not configured.')
      const { data: created, error } = await supabase.from('exam_results').insert(result).select().single()
      if (error?.code === 'PGRST205' || /could not find the table .*exam_results/i.test(error?.message || '')) {
        throw new Error('Exam results are not set up in Supabase. Run supabase/exam_results.sql in the SQL Editor, then retry.')
      }
      if (error) throw new Error(`Exam result could not be published: ${error.message}`)
      saved = created
    } else {
      const student = students.find(item => item.id === result.student_id)
      if (!student) throw new Error('Choose a student from the current directory.')
      saved.student_name = student.name
      saved.student_roll = student.roll
      addNotif(student.id, 'Exam result published', `${result.result_type} ${result.result_value.toFixed(2)} is ready for semester ${result.semester}.`, 'exam_result', '/student/results')
    }

    setExamResults(previous => [saved, ...previous])
    return saved
  }, [addNotif, students, user])

  // ============================================================
  // LEAVE / GATE PASS
  // ============================================================

  const submitLeave = useCallback(
    async (data, studentId, studentName) => {
      const id = `${data.type === 'Gate Pass' ? 'GP' : 'LV'}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`
      const request = {
        id,
        student_id: studentId,
        student_name: studentName,
        ...data,
        from_time: data.from_time || null,
        to_time: data.to_time || null,
        status: 'Pending',
        admin_comment: '',
        created_at: new Date().toISOString(),
      }

      if (!user?.isDemo) {
        if (!supabase || !user) throw new Error('Sign in with a configured campus account to submit a leave request.')
        const { error } = await supabase.from('leave_requests').insert(request)
        if (error) throw new Error(`Leave request could not be saved: ${error.message}`)
      }

      setLeaveRequests(previous => [request, ...previous])

      if (user?.isDemo) {
        addNotif(studentId, `${data.type} Submitted`, `Your ${data.type} ${id} submitted for approval.`, 'info', '/student/leave')
      }

      return id
    },
    [addNotif, user]
  )

  const updateLeave = useCallback(
    async (
      id,
      status,
      comment = ''
    ) => {
      if (!user?.isDemo) {
        if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can update leave requests.')
        const { error } = await supabase.from('leave_requests').update({ status, admin_comment: comment }).eq('id', id)
        if (error) throw new Error(`Leave request could not be updated: ${error.message}`)
      }

      setLeaveRequests((previous) =>
        previous.map((leave) => {
          if (leave.id !== id) {
            return leave
          }

          if (user?.isDemo) {
            addNotif(leave.student_id, `${leave.type} ${status}`, `Your ${leave.type} ${id} has been ${status.toLowerCase()}.`, status === 'Approved' ? 'success' : 'warning', '/student/leave')
          }

          return {
            ...leave,
            status,
            admin_comment: comment,
          }
        })
      )
    },
    [addNotif, user]
  )

  // ============================================================
  // NOTIFICATIONS
  // ============================================================

  const markRead = useCallback(
    async (id) => {
      if (user && !user.isDemo && supabase) {
        const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id).eq('user_id', user.id)
        if (error) {
          console.error('Could not mark notification as read:', error.message)
          return
        }
      }
      setNotifications((previous) =>
        previous.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification
        )
      )
    },
    [user]
  )

  const markAllRead = useCallback(async () => {
    if (user && !user.isDemo && supabase) {
      const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
      if (error) {
        console.error('Could not mark notifications as read:', error.message)
        return
      }
    }
    setNotifications((previous) =>
      previous.map(notification => notification.user_id === user?.id
        ? { ...notification, read: true }
        : notification)
    )
  }, [user])

  const sendStudentMessage = useCallback(async (student, { title, message }) => {
    if (user?.role !== 'admin') throw new Error('Only administrators can message students.')
    const notification = {
      user_id: student.id,
      title: title.trim(),
      message: message.trim(),
      type: 'message',
      link: '/student/notifications',
    }
    if (!notification.title || !notification.message) throw new Error('Enter a title and message.')

    if (user.isDemo) {
      addNotif(notification.user_id, notification.title, notification.message, notification.type, notification.link)
      return notification
    }

    return requestBackend('notifications/admin', { method: 'POST', body: notification })
  }, [addNotif, user])

  // ============================================================
  // NOTICES
  // ============================================================

  const addNotice = useCallback(
    async (data, adminName) => {
      const notice = {
        id: crypto.randomUUID(),
        ...data,
        created_by: adminName,
        created_at: new Date().toISOString(),
      }

      if (!user?.isDemo) {
        if (!supabase || user?.role !== 'admin') throw new Error('Only a signed-in administrator can publish notices.')

        const { data: saved, error } = await supabase.from('notices').insert(notice).select().single()
        if (error) throw new Error(`Notice could not be published: ${error.message}`)

        try {
          await requestBackend('notifications/push-notice', {
            method: 'POST',
            body: {
              title: saved.title,
              body: saved.content,
              target: saved.target || 'All Students',
              important: Boolean(saved.important),
            },
          })
        } catch (pushError) {
          console.warn('Notice was saved, but push delivery is unavailable:', pushError.message)
        }

        setNotices(previous => [saved, ...previous])
        return saved
      }

      students
        .filter(student => matchesNoticeTarget(notice.target, student))
        .forEach(student => addNotif(
          student.id,
          notice.title,
          notice.content,
          'notice',
          '/student/notifications'
        ))

      setNotices(previous => [notice, ...previous])
      return notice
    },
    [addNotif, students, user]
  )

  const submitCampusJournalItem = useCallback(async data => {
    if (!user || user.role !== 'student') throw new Error('Only signed-in students can submit journal entries.')

    const createdAt = new Date().toISOString()
    const item = {
      id: crypto.randomUUID(),
      student_id: user.id,
      author_name: user.name,
      title: data.title.trim(),
      summary: data.summary.trim(),
      content: data.content.trim(),
      category: data.category,
      subcategory: data.subcategory || null,
      status: 'pending',
      is_featured: false,
      created_at: createdAt,
      updated_at: createdAt,
    }
    if (!item.title || !item.summary || !item.content) throw new Error('Complete the title, summary, and article fields.')

    let saved = item
    if (user.isDemo) {
      const next = [item, ...getStoredDemoValue(DEMO_CAMPUS_JOURNAL_KEY, INITIAL_CAMPUS_JOURNAL)]
      localStorage.setItem(DEMO_CAMPUS_JOURNAL_KEY, JSON.stringify(next))
    } else {
      if (!supabase) throw new Error('Campus Journal requires a configured Supabase connection.')
      const { data: result, error } = await supabase.from('campus_journal').insert(item).select().single()
      if (error) throw new Error(`Journal submission could not be saved: ${error.message}`)
      saved = result
    }
    setCampusJournalItems(previous => [saved, ...previous.filter(existing => existing.id !== saved.id)])
    return saved
  }, [user])

  const reviewCampusJournalItem = useCallback(async (id, status) => {
    if (!user || user.role !== 'admin') throw new Error('Only administrators can review journal submissions.')
    if (!['published', 'rejected'].includes(status)) throw new Error('Choose a valid review decision.')

    const updates = {
      status,
      is_featured: false,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    let saved
    if (user.isDemo) {
      const next = getStoredDemoValue(DEMO_CAMPUS_JOURNAL_KEY, INITIAL_CAMPUS_JOURNAL).map(item => item.id === id ? { ...item, ...updates } : item)
      localStorage.setItem(DEMO_CAMPUS_JOURNAL_KEY, JSON.stringify(next))
      saved = next.find(item => item.id === id)
    } else {
      if (!supabase) throw new Error('Campus Journal requires a configured Supabase connection.')
      const { data, error } = await supabase.from('campus_journal').update(updates).eq('id', id).select().single()
      if (error) throw new Error(`Journal submission could not be reviewed: ${error.message}`)
      saved = data
    }
    setCampusJournalItems(previous => previous.map(item => item.id === id ? saved : item))
    return saved
  }, [user])

  const setCampusJournalFeatured = useCallback(async (id, isFeatured) => {
    if (!user || user.role !== 'admin') throw new Error('Only administrators can feature journal publications.')

    const updates = { is_featured: Boolean(isFeatured), updated_at: new Date().toISOString() }
    let saved
    if (user.isDemo) {
      const next = getStoredDemoValue(DEMO_CAMPUS_JOURNAL_KEY, INITIAL_CAMPUS_JOURNAL).map(item => item.id === id && item.status === 'published' ? { ...item, ...updates } : item)
      localStorage.setItem(DEMO_CAMPUS_JOURNAL_KEY, JSON.stringify(next))
      saved = next.find(item => item.id === id)
    } else {
      if (!supabase) throw new Error('Campus Journal requires a configured Supabase connection.')
      const { data, error } = await supabase.from('campus_journal').update(updates).eq('id', id).eq('status', 'published').select().single()
      if (error) throw new Error(`Featured publication could not be updated: ${error.message}`)
      saved = data
    }
    setCampusJournalItems(previous => previous.map(item => item.id === id ? saved : item))
    return saved
  }, [user])

  // ============================================================
  // MESS FEEDBACK
  // ============================================================

  const addMessFeedback = useCallback(async (data, studentId) => {
    const feedback = {
      student_id: studentId,
      day: data.day,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
    }
    let saved = { ...feedback, id: `mf${Date.now()}` }
    if (!user?.isDemo) {
      if (!supabase || !user) throw new Error('Sign in with a configured campus account to submit feedback.')
      const { data: result, error } = await supabase.from('mess_feedback').insert(feedback).select().single()
      if (error) throw new Error(`Feedback could not be submitted: ${error.message}`)
      saved = result
    }
    setMessFeedback(previous => [saved, ...previous])
    return saved
  }, [user])

  // ============================================================
  // UNREAD NOTIFICATIONS
  // ============================================================

  const unreadCount = notifications.filter(notification =>
    notification.user_id === user?.id && !notification.read && !notification.is_read
  ).length

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AppContext.Provider
      value={{
        busRoutes,
        setBusRoutes,
        updateBusRoute,
        addBusRoute,
        campusRooms,
        setCampusRooms,
        updateCampusRoom,
        addCampusRoom,
        faculty,
        saveFaculty,
        deleteFaculty,
        // Lite mode
        liteMode,
        setLiteMode,

        // Language
        language,
        setLanguage,
        t,

        // Complaints
        complaints: user && !user.isDemo
          ? liveComplaints.userId === user.id ? liveComplaints.items : []
          : complaints,
        submitComplaint,
        updateComplaint,

        // Requests
        requests,
        submitRequest,
        updateRequest,

        // Exam Results
        examResults,
        publishExamResult,

        // Leave / Gate Pass
        leaveRequests,
        submitLeave,
        updateLeave,

        // Notifications
        notifications,
        markRead,
        markAllRead,
        sendStudentMessage,
        unreadCount,

        // Notices
        notices,
        addNotice,

        // Campus Journal
        campusJournalItems,
        campusJournalError,
        submitCampusJournalItem,
        reviewCampusJournalItem,
        setCampusJournalFeatured,

        // Mess
        messFeedback,
        addMessFeedback,
        messMenu,
        updateMessMenu,

        // Dashboard videos
        dashboardVideos,
        addDashboardVideo,
        removeDashboardVideo,

        // Search
        searchQuery,
        setSearchQuery,

        // Students
        students,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// ============================================================
// useApp HOOK
// ============================================================

export const useApp = () =>
  useContext(AppContext)