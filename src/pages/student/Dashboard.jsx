import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  MessageSquareWarning,
  BookOpen,
  Building2,
  FileText,
  ChevronRight,
  Calendar,
  AlertCircle,
  Megaphone,
  X,
} from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import DashboardVideoShowcase from '../../components/DashboardVideoShowcase'
import CampusJournalPreview from '../../components/CampusJournalPreview'
import EmailVerificationPrompt from '../../components/EmailVerificationPrompt'
import DashboardHero from '../../components/DashboardHero'
import AssignmentPreview from '../../components/academic/AssignmentPreview'
import { StatusBadge } from '../../components/ui/States'
import attendanceArt from '../../assets/3d-academic/chart.png'
import requestsArt from '../../assets/3d-academic/requests.png'
import complaintsArt from '../../assets/3d-academic/messages.png'
import timetableArt from '../../assets/3d-academic/calendar.png'
import { supabase } from '../../lib/supabase'
import { matchesNoticeTarget } from '../../lib/noticeAudience'
import {
  DEMO_SUBJECTS,
  DEMO_TIMETABLE,
  DEMO_MESS_MENU,
  DEMO_HOSTEL,
  getDemoAttendance,
  getDemoTimetable,
  DEMO_EVENTS,
  INITIAL_COMPLAINTS,
  INITIAL_REQUESTS,
  INITIAL_LEAVE,
} from '../../data/demoData'

function getGreeting(t) {
  const h = new Date().getHours()

  if (h < 12) return t('goodMorning')
  if (h < 17) return t('goodAfternoon')

  return t('goodEvening')
}

function classStatus(time, t) {
  const now = new Date()
  const [h, m] = time.split(':').map(Number)

  const tValue = new Date()
  tValue.setHours(h, m, 0)

  const diff = (tValue - now) / 60000

  if (diff > 30) {
    return {
      label: t('upcoming'),
      cls: 'bg-amber-100 text-amber-700'
    }
  }

  if (diff >= -60) {
    return {
      label: t('current'),
      cls: 'bg-violet-100 text-violet-700'
    }
  }

  return {
    label: t('completed'),
    cls: 'bg-gray-100 text-gray-500'
  }
}

function getDismissedNoticeIds(userId) {
  if (!userId || typeof window === 'undefined') return []
  try {
    const stored = window.localStorage.getItem(`campusplus:dismissed-notices:${userId}`)
    const parsed = stored ? JSON.parse(stored) : []
    return Array.isArray(parsed) ? parsed.map(String) : []
  } catch {
    return []
  }
}

export default function StudentDashboard() {
  const { user } = useAuth()

  const {
    complaints,
    requests,
    leaveRequests,
    notifications,
    notices,
    messMenu,
    dashboardVideos,
    campusJournalItems,
    t,
  } = useApp()

  const navigate = useNavigate()
  const [showSamplePreview, setShowSamplePreview] = useState(false)
  const [academicData, setAcademicData] = useState({ subjects: [], classes: [], events: [] })
  const [dismissedNoticeState, setDismissedNoticeState] = useState(() => ({
    userId: user?.id,
    ids: getDismissedNoticeIds(user?.id),
  }))

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long'
  })

  useEffect(() => {
    if (!user) return
    if (user.isDemo) {
      setAcademicData({ subjects: getDemoAttendance(user), classes: getDemoTimetable(user), events: DEMO_EVENTS })
      return
    }
    if (!supabase) {
      setAcademicData({ subjects: [], classes: [], events: [] })
      return
    }

    let active = true
    const loadAcademicData = async () => {
      const loadSchedule = async () => {
        const [departmentResult, personalResult] = await Promise.all([
          user.department
            ? supabase.from('timetable').select('id,day,time,room,subject:subjects(name,faculty)').eq('department', user.department).is('student_id', null).order('time')
            : Promise.resolve({ data: [], error: null }),
          supabase.from('timetable').select('id,day,time,room,subject:subjects(name,faculty)').eq('student_id', user.id).order('time'),
        ])
        return {
          data: [...(departmentResult.data || []), ...(personalResult.data || [])],
          error: departmentResult.error || personalResult.error,
        }
      }
      const [attendanceResult, scheduleResult, eventsResult] = await Promise.all([
        supabase.from('attendance').select('subject_id,total_classes,present_classes,subject:subjects(id,name,code,faculty)').eq('student_id', user.id),
        loadSchedule(),
        supabase.from('events').select('id,title,event_date,type').gte('event_date', new Date().toISOString()).order('event_date').limit(5),
      ])
      if (!active) return
      if (attendanceResult.error) console.error('Failed to load dashboard attendance:', attendanceResult.error.message)
      if (scheduleResult.error) console.error('Failed to load dashboard timetable:', scheduleResult.error.message)
      if (eventsResult.error) console.error('Failed to load campus events:', eventsResult.error.message)
      setAcademicData({
        subjects: (attendanceResult.data || []).map(row => {
          const subject = Array.isArray(row.subject) ? row.subject[0] : row.subject
          return { ...subject, total: Number(row.total_classes) || 0, present: Number(row.present_classes) || 0 }
        }).filter(subject => subject.id),
        classes: (scheduleResult.data || []).map(row => {
          const subject = Array.isArray(row.subject) ? row.subject[0] : row.subject
          return { ...row, subject: subject?.name || 'Subject', faculty: subject?.faculty || 'Faculty not assigned' }
        }),
        events: (eventsResult.data || []).map(event => ({ ...event, date: event.event_date })),
      })
    }

    loadAcademicData()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadAcademicData()
    }, 5000)

    return () => {
      active = false
      window.clearInterval(refreshInterval)
    }
  }, [user])

  const todayClasses = academicData.classes.filter(item => item.day === today).slice(0, 4)
  const menu = user?.isDemo
    ? DEMO_MESS_MENU[today] || DEMO_MESS_MENU.Monday
    : messMenu[today]

  const myComplaints = complaints.filter(
    c => c.student_id === user?.id
  )

  const myRequests = requests.filter(
    r => r.student_id === user?.id
  )

  const myLeave = leaveRequests.filter(
    l => l.student_id === user?.id
  )

  const openComplaints = myComplaints.filter(
    c => !['Resolved', 'Closed'].includes(c.status)
  ).length

  const pendingReqs = [
    ...myRequests.filter(
      r => !['Approved', 'Rejected'].includes(r.status)
    ),
    ...myLeave.filter(
      l => l.status === 'Pending'
    )
  ].length

  const attendanceTotal = academicData.subjects.reduce((sum, subject) => sum + subject.total, 0)
  const attendancePresent = academicData.subjects.reduce((sum, subject) => sum + subject.present, 0)
  const attendanceAbsent = attendanceTotal - attendancePresent
  const avgAtt = attendanceTotal ? Math.round((attendancePresent / attendanceTotal) * 100) : null
  const attendanceGauge = avgAtt ?? 0
  const hasLowAttendance = academicData.subjects.some(subject => subject.total > 0 && (subject.present / subject.total) * 100 < 80)

  const samplePreview = useMemo(() => {
    const attendanceTotal = DEMO_SUBJECTS.reduce((sum, subject) => sum + subject.total, 0)
    const attendancePresent = DEMO_SUBJECTS.reduce((sum, subject) => sum + subject.present, 0)
    const todaySampleClasses = DEMO_TIMETABLE.filter(item => item.day === today).length
    const activeSampleComplaints = INITIAL_COMPLAINTS.filter(complaint =>
      complaint.student_id === 'stu-001' && !['resolved', 'closed'].includes(String(complaint.status).toLowerCase()),
    ).length
    const pendingSampleRequests = INITIAL_REQUESTS.filter(request =>
      request.student_id === 'stu-001' && !['approved', 'rejected'].includes(String(request.status).toLowerCase()),
    ).length + INITIAL_LEAVE.filter(request =>
      request.student_id === 'stu-001' && String(request.status).toLowerCase() === 'pending',
    ).length

    return {
      attendance: attendanceTotal ? `${Math.round((attendancePresent / attendanceTotal) * 100)}%` : '—',
      requests: pendingSampleRequests,
      complaints: activeSampleComplaints,
      classes: todaySampleClasses,
    }
  }, [today])

  const selectDashboardCard = event => {
    const card = event.target.closest('.card')
    if (!card || !event.currentTarget.contains(card)) return

    event.currentTarget.querySelector('[data-dashboard-selected="true"]')?.removeAttribute('data-dashboard-selected')
    card.setAttribute('data-dashboard-selected', 'true')
  }

  const myNotifs = notifications
    .filter(n => n.user_id === user?.id)
    .slice(0, 4)

  const recentItems = [
    ...myComplaints.slice(0, 2),
    ...myRequests.slice(0, 1),
    ...myLeave.slice(0, 1)
  ]
    .sort(
      (a, b) =>
        new Date(b.created_at) -
        new Date(a.created_at)
    )
    .slice(0, 4)

  const importantNotices = notices.filter(notice =>
    (notice.important || ['important', 'critical'].includes(String(notice.priority || '').toLowerCase()))
    && matchesNoticeTarget(notice.target, user)
  )
  const dismissedNoticeIds = dismissedNoticeState.userId === user?.id
    ? dismissedNoticeState.ids
    : getDismissedNoticeIds(user?.id)
  const activeImportantNotice = importantNotices.find(notice => !dismissedNoticeIds.includes(String(notice.id)))

  const dismissImportantNotice = notice => {
    const nextIds = [...new Set([...dismissedNoticeIds, String(notice.id)])]
    setDismissedNoticeState({ userId: user?.id, ids: nextIds })
    try {
      window.localStorage.setItem(`campusplus:dismissed-notices:${user?.id}`, JSON.stringify(nextIds))
    } catch {
      // Keep the dismissal active for this page visit if storage is unavailable.
    }
  }

  useEffect(() => {
    if (!activeImportantNotice || typeof document === 'undefined') return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = event => {
      if (event.key === 'Escape') dismissImportantNotice(activeImportantNotice)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [activeImportantNotice?.id])

  return (
    <div className="dashboard-selectable flex gap-6" onClick={selectDashboardCard}>

      {activeImportantNotice && createPortal(
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
          onMouseDown={event => {
            if (event.target === event.currentTarget) dismissImportantNotice(activeImportantNotice)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="important-notice-title"
            aria-describedby="important-notice-content"
            className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/80 bg-white shadow-2xl shadow-slate-950/30"
          >
            <div className={`h-2 w-full ${String(activeImportantNotice.priority).toLowerCase() === 'critical' ? 'bg-gradient-to-r from-rose-600 to-orange-500' : 'bg-gradient-to-r from-violet-600 to-fuchsia-500'}`} />
            <div className="p-5 sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-center gap-3">
                  <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${String(activeImportantNotice.priority).toLowerCase() === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-700'}`}>
                    <Megaphone size={22} />
                  </span>
                  <div className="min-w-0">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${String(activeImportantNotice.priority).toLowerCase() === 'critical' ? 'bg-rose-100 text-rose-700' : 'bg-violet-100 text-violet-700'}`}>
                      {String(activeImportantNotice.priority || 'important').toLowerCase() === 'critical' ? 'Critical notice' : 'Important notice'}
                    </span>
                    <p className="mt-1 text-xs text-slate-500">For {activeImportantNotice.target || 'All Students'}</p>
                  </div>
                </div>
                <button
                  type="button"
                  autoFocus
                  onClick={() => dismissImportantNotice(activeImportantNotice)}
                  aria-label="Dismiss important notice"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
                ><X size={19} /></button>
              </div>

              <h2 id="important-notice-title" className="mt-5 text-xl font-bold leading-snug text-slate-900 sm:text-2xl">
                {activeImportantNotice.title}
              </h2>
              <p id="important-notice-content" className="mt-3 max-h-[40vh] overflow-y-auto whitespace-pre-wrap text-sm leading-6 text-slate-700 sm:text-base">
                {activeImportantNotice.content}
              </p>
              <p className="mt-4 text-xs text-slate-500">
                {activeImportantNotice.created_at ? new Date(activeImportantNotice.created_at).toLocaleString() : 'Campus announcement'}
                {activeImportantNotice.created_by ? ` · ${activeImportantNotice.created_by}` : ''}
              </p>
              <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => dismissImportantNotice(activeImportantNotice)}
                  className="min-h-11 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >Dismiss</button>
                <button
                  type="button"
                  onClick={() => {
                    dismissImportantNotice(activeImportantNotice)
                    navigate('/student/notifications')
                  }}
                  className="min-h-11 rounded-xl bg-violet-700 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:bg-violet-800"
                >View all notices</button>
              </div>
            </div>
          </section>
        </div>,
        document.body,
      )}

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 space-y-6">

        <EmailVerificationPrompt />

        {importantNotices.length > 0 && (
          <section aria-label="Important campus notices" className="flex min-w-0 items-center gap-3 overflow-hidden rounded-xl border border-violet-200 bg-gradient-to-r from-violet-50 via-white to-pink-50 px-3 py-2.5 shadow-sm sm:px-4">
            <div className="flex shrink-0 items-center gap-2 rounded-lg bg-violet-100 px-2.5 py-2 text-violet-800">
              <Megaphone size={16} />
              <span className="text-xs font-bold">Important</span>
            </div>
            <div className="notice-marquee min-w-0 flex-1" aria-hidden="true">
              <div className="notice-marquee-track">
                {[0, 1].map(copy => (
                  <div key={copy} className="notice-marquee-group">
                    {importantNotices.map(notice => (
                      <span key={`${copy}-${notice.id}`} className="inline-flex items-center gap-2 text-sm text-gray-700">
                        <span className="font-semibold text-violet-800">{notice.title}</span>
                        <span className="text-gray-500">{notice.content}</span>
                        <span className="text-pink-500" aria-hidden="true">•</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <span className="sr-only">{importantNotices.map(notice => `${notice.title}: ${notice.content}`).join('. ')}</span>
          </section>
        )}

        <DashboardHero
          audience="student"
          eyebrow={t('campusToday')}
          title={`${getGreeting(t)}, ${user?.name?.split(' ')[0] || 'Student'} 👋`}
          subtitle={[
            "Let's make today productive.",
            [user?.department, user?.semester ? `Semester ${user.semester}` : null, user?.section ? `Section ${user.section}` : null].filter(Boolean).join(' · '),
          ].filter(Boolean).join('  ·  ')}
        />

        {/* SUMMARY CARDS */}
        {!user?.isDemo && (
          <div className="flex flex-col gap-2 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-950 sm:flex-row sm:items-center sm:justify-between">
            <p>{showSamplePreview
              ? 'Sample preview figures are shown below. They are examples only and are not your campus records.'
              : 'New here? Preview example dashboard figures while your campus records are being added.'}</p>
            <button
              type="button"
              onClick={() => setShowSamplePreview(value => !value)}
              className="shrink-0 rounded-lg border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-800 hover:bg-violet-100"
            >
              {showSamplePreview ? 'Show my live figures' : 'Show sample preview'}
            </button>
          </div>
        )}
        <div className="internal-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {[
            {
              label: t('attendance'),
              value: !user?.isDemo && showSamplePreview ? samplePreview.attendance : avgAtt === null ? 'No data' : `${avgAtt}%`,
              icon: ClipboardList,
              color: 'text-emerald-700',
              bg: 'bg-emerald-50',
              art: attendanceArt,
            },
            {
              label: t('pendingRequests'),
              value: !user?.isDemo && showSamplePreview ? samplePreview.requests : pendingReqs,
              icon: FileText,
              color: 'text-amber-700',
              bg: 'bg-amber-50',
              art: requestsArt,
            },
            {
              label: t('openComplaints'),
              value: !user?.isDemo && showSamplePreview ? samplePreview.complaints : openComplaints,
              icon: MessageSquareWarning,
              color: 'text-red-600',
              bg: 'bg-red-50',
              art: complaintsArt,
            },
            {
              label: t('todaysClasses'),
              value: !user?.isDemo && showSamplePreview ? samplePreview.classes : todayClasses.length,
              icon: BookOpen,
              color: 'text-teal-700',
              bg: 'bg-teal-50',
              art: timetableArt,
            }
          ].map(
            ({
              label,
              value,
              icon: Icon,
              color,
              bg,
              art
            }) => (
              <div
                key={label}
                className="card"
              >
                <div
                  className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon
                    size={20}
                    className={color}
                  />
                </div>
                <img className="dashboard-stat-art" src={art} alt="" aria-hidden="true" />

                <p className="text-2xl font-bold text-gray-900">
                  {value}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  {label}
                </p>
              </div>
            )
          )}

        </div>

        <AssignmentPreview />

        {/* ATTENDANCE + TODAY'S CLASSES */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">

          {/* ATTENDANCE CARD */}
          <div className="card">

            <div className="dashboard-feature-heading flex items-center justify-between gap-2 mb-4">

              <h2 className="font-semibold text-gray-900">
                {t('attendance')}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate('/student/attendance')
                  }
                  className="text-emerald-700 text-xs hover:underline flex items-center gap-1"
                >
                  {t('viewDetails')}
                  <ChevronRight size={14} />
                </button>
                <img className="dashboard-feature-art" src={attendanceArt} alt="" aria-hidden="true" />
              </div>

            </div>

            <div className="flex items-center gap-4 mb-4">

              <div className="relative w-20 h-20 flex-shrink-0">

                <svg
                  className="w-20 h-20 -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="3"
                  />

                  <circle
                    cx="18"
                    cy="18"
                    r="15.9"
                    fill="none"
                    stroke="#0f766e"
                    strokeWidth="3"
                    strokeDasharray={`${attendanceGauge} ${100 - attendanceGauge}`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">
                    {avgAtt === null ? '—' : `${avgAtt}%`}
                  </span>
                </div>

              </div>

              <div className="space-y-1">

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-600 rounded-full" />

                  <span className="text-sm text-gray-600">
                    {t('present')}:{' '}
                    {attendancePresent}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />

                  <span className="text-sm text-gray-600">
                    {t('absent')}:{' '}
                    {attendanceAbsent}
                  </span>
                </div>

              </div>

            </div>

            <div className="internal-meter-track w-full rounded-full h-2" role="progressbar" aria-label={t('attendance')} aria-valuemin={0} aria-valuemax={100} aria-valuenow={attendanceGauge}>

              <div
                className="internal-meter-fill bg-gradient-to-r from-emerald-600 to-amber-500 h-2 rounded-full"
                style={{
                  width: `${attendanceGauge}%`
                }}
              />

            </div>

            {hasLowAttendance && (
              <div className="mt-3 flex items-center gap-2 text-orange-600 text-xs bg-orange-50 rounded-xl p-2">

                <AlertCircle size={14} />

                {t('someSubjectsBelow')}

              </div>
            )}

          </div>


          {/* TODAY'S CLASSES */}
          <div className="card">

            <div className="dashboard-feature-heading flex items-center justify-between gap-2 mb-4">

              <h2 className="font-semibold text-gray-900">
                {t('todaysClasses')}
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    navigate('/student/timetable')
                  }
                  className="text-emerald-700 text-xs hover:underline flex items-center gap-1"
                >
                  {t('fullTimetable')}
                  <ChevronRight size={14} />
                </button>
                <img className="dashboard-feature-art" src={timetableArt} alt="" aria-hidden="true" />
              </div>

            </div>

            {todayClasses.length === 0 ? (

              <p className="text-gray-400 text-sm text-center py-6">
                {user?.department ? `${t('noClassesScheduled')} ${today}.` : t('addDepartmentToProfile')}
              </p>

            ) : (

              <div className="space-y-3">

                {todayClasses.map(cls => {

                  const s =
                    classStatus(cls.time, t)

                  return (
                    <div
                      key={cls.id}
                      className="dashboard-class-row flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                    >

                      <div className="text-center min-w-[50px]">
                        <p className="text-xs font-bold text-gray-900">
                          {cls.time}
                        </p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {cls.subject}
                        </p>

                        <p className="text-xs text-gray-500">
                          {cls.room}
                        </p>
                      </div>

                      <span
                        className={`badge ${s.cls} text-xs`}
                      >
                        {s.label}
                      </span>

                    </div>
                  )
                })}

              </div>

            )}

          </div>

        </div>


        {/* HOSTEL + MESS MENU */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">

          {/* HOSTEL CARD */}
          <div className="card">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-semibold text-gray-900">
                {t('hostel')}
              </h2>

              <button
                onClick={() =>
                  navigate('/student/hostel')
                }
                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
              >
                {t('viewHostel')}
                <ChevronRight size={14} />
              </button>

            </div>

            <div className="flex items-center gap-3 mb-3">

              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">

                <Building2
                  size={20}
                  className="text-blue-600"
                />

              </div>

              <div>

                <p className="font-semibold text-gray-900">
                  {t('blockRoom', '', {
                    block: user?.hostel_block || t('notAssigned'),
                    room: user?.room_number || t('notAssigned'),
                  })}
                </p>

                <p className="text-xs text-gray-500">
                  {user?.isDemo ? `${t('floor')} ${DEMO_HOSTEL.floor} • ${t('roommates', { count: DEMO_HOSTEL.roommates.length })}` : t('currentAssignment')}
                </p>

              </div>

            </div>

            {openComplaints > 0 && (
              <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 rounded-xl p-2">

                <AlertCircle size={14} />

                {t('openComplaintsLabel')}: {openComplaints}

              </div>
            )}

          </div>


          {/* MESS MENU CARD */}
          <div className="card">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-semibold text-gray-900">
                {t('todayMessMenu')}
              </h2>

              <button
                onClick={() =>
                  navigate('/student/mess')
                }
                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
              >
                {t('fullMenu')}
                <ChevronRight size={14} />
              </button>

            </div>

            {menu ? <div className="space-y-2">

              {[
                ['🌅', t('breakfast'), menu.breakfast],
                ['☀️', t('lunch'), menu.lunch],
                ['🌙', t('dinner'), menu.dinner]
              ].map(
                ([emoji, meal, item]) => (
                  <div
                    key={meal}
                    className="flex gap-2 text-sm"
                  >

                    <span>{emoji}</span>

                    <div>
                      <span className="font-medium text-gray-700">
                        {meal}:{' '}
                      </span>

                      <span className="text-gray-500 text-xs">
                        {item}
                      </span>
                    </div>

                  </div>
                )
              )}

            </div> : <p className="py-3 text-sm text-gray-500">{t('noMenu')}</p>}

          </div>

        </div>


        {/* RECENT REQUESTS */}
        <div className="card">

          <div className="dashboard-feature-heading flex items-center justify-between gap-2 mb-4">

            <h2 className="font-semibold text-gray-900">
              {t('recentRequestsComplaints')}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  navigate('/student/complaints')
                }
                className="text-blue-600 text-xs hover:underline"
              >
                {t('viewAll')}
              </button>
              <img className="dashboard-feature-art" src={requestsArt} alt="" aria-hidden="true" />
            </div>

          </div>

          {recentItems.length === 0 ? (

            <p className="text-gray-400 text-sm text-center py-4">
              {t('noRecentActivity')}
            </p>

          ) : (

            <div className="space-y-2">

              {recentItems.map((item, i) => (

                <button
                  key={i}
                  onClick={() =>
                    navigate(
                      item.category
                        ? '/student/complaints'
                        : item.type === 'Gate Pass' ||
                          item.type === 'Leave'
                        ? '/student/leave'
                        : '/student/documents'
                    )
                  }
                  className="dashboard-request-row w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
                >

                  <div>

                    <p className="text-sm font-medium text-gray-900">
                      {item.type || item.category} —{' '}
                      {item.id}
                    </p>

                    <p className="text-xs text-gray-500 truncate max-w-xs">
                      {item.description ||
                        item.reason ||
                        ''}
                    </p>

                  </div>

                  <StatusBadge
                    status={item.status}
                  />

                </button>

              ))}

            </div>

          )}

        </div>

        <CampusJournalPreview items={campusJournalItems} />
        <DashboardVideoShowcase videos={dashboardVideos} />

      </div>


      {/* RIGHT SIDEBAR */}
      <div className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">

        {/* NOTIFICATIONS */}
        <div className="card">

          <div className="flex items-center justify-between mb-3">

            <h3 className="font-semibold text-gray-900 text-sm">
              {t('notificationsCard')}
            </h3>

            <button
              onClick={() =>
                navigate('/student/notifications')
              }
              className="text-blue-600 text-xs hover:underline"
            >
              {t('all')}
            </button>

          </div>

          {myNotifs.length === 0 ? (

            <p className="text-gray-400 text-xs text-center py-3">
              {t('noNotificationsLabel')}
            </p>

          ) : (

            <div className="space-y-2">

              {myNotifs.map(n => (

                <div
                  key={n.id}
                  className={`p-2.5 rounded-xl text-xs cursor-pointer hover:bg-gray-50 ${
                    !n.read
                      ? 'bg-blue-50/50'
                      : ''
                  }`}
                  onClick={() =>
                    navigate(
                      n.link ||
                        '/student/notifications'
                    )
                  }
                >

                  <p className="font-medium text-gray-800">
                    {n.title}
                  </p>

                  <p className="text-gray-500 mt-0.5 line-clamp-2">
                    {n.message}
                  </p>

                </div>

              ))}

            </div>

          )}

        </div>


        {/* UPCOMING EVENTS */}
        <div className="card">

          <h3 className="font-semibold text-gray-900 text-sm mb-3">
            {t('upcomingEvents')}
          </h3>

          <div className="space-y-2">

            {academicData.events.length === 0 ? <p className="py-3 text-xs text-gray-500">{t('noUpcomingEvents')}</p> : academicData.events.map(e => (

              <div
                key={e.id}
                className="flex gap-2 items-start"
              >

                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">

                  <Calendar
                    size={14}
                    className="text-blue-600"
                  />

                </div>

                <div>

                  <p className="text-xs font-medium text-gray-800">
                    {e.title}
                  </p>

                  <p className="text-xs text-gray-400">
                    {new Date(
                      e.date
                    ).toLocaleDateString(
                      'en-IN',
                      {
                        day: 'numeric',
                        month: 'short'
                      }
                    )}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>


        {/* IMPORTANT NOTICES */}
        <div className="card">

          <div className="flex items-center justify-between mb-3">

            <h3 className="font-semibold text-gray-900 text-sm">
              {t('importantNotices')}
            </h3>

            <button
              onClick={() =>
                navigate('/student/notifications')
              }
                  className="text-blue-600 text-xs hover:underline"
            >
              {t('all')}
            </button>

          </div>

          <div className="space-y-2">

            {notices
              .filter(n => n.important)
              .slice(0, 3)
              .map(n => (

                <div
                  key={n.id}
                  className="p-2.5 bg-yellow-50 rounded-xl border border-yellow-100"
                >

                  <p className="text-xs font-medium text-gray-800">
                    {n.title}
                  </p>

                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {n.content}
                  </p>

                </div>

              ))}

          </div>

        </div>

      </div>

    </div>
  )
}
