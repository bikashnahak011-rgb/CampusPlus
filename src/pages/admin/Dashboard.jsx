import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, MessageSquareWarning, ClipboardList, Clock, TrendingUp, AlertCircle, ChevronRight, Calendar } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import DashboardVideoShowcase from '../../components/DashboardVideoShowcase'
import CampusJournalPreview from '../../components/CampusJournalPreview'
import { StatusBadge } from '../../components/ui/States'
import DashboardHero from '../../components/DashboardHero'
import DemoDataBanner from '../../components/DemoDataBanner'
import { ADMIN_ROLE_LABELS } from '../../lib/adminRoles'
import { DEMO_ACADEMIC_RESOURCES, DEMO_EVENTS, DEMO_SUBJECTS, DEMO_TIMETABLE } from '../../data/demoData'
import studentsArt from '../../assets/3d-academic/people.png'
import requestsArt from '../../assets/3d-academic/requests.png'
import complaintsArt from '../../assets/3d-academic/messages.png'
import resolutionArt from '../../assets/3d-academic/chart.png'
import notebookArt from '../../assets/3d-academic/notebook.png'
import pencilArt from '../../assets/3d-academic/pencil.png'
import calendarArt from '../../assets/3d-academic/calendar.png'

export default function AdminDashboard() {
  const { complaints, requests, leaveRequests, students, examResults, dashboardVideos, campusJournalItems } = useApp()
  const { user } = useAuth()
  const navigate = useNavigate()

  const openComplaints = complaints.filter(c => !['Resolved', 'Closed'].includes(c.status))
  const pendingReqs = [...requests.filter(r => !['Approved', 'Rejected', 'Ready'].includes(r.status)), ...leaveRequests.filter(l => l.status === 'Pending')]
  const highPriority = complaints.filter(c => c.priority === 'High' && !['Resolved', 'Closed'].includes(c.status))
  const resolvedComplaints = complaints.filter(c => ['Resolved', 'Closed'].includes(c.status) && c.created_at && c.updated_at)
  const averageResolutionHours = resolvedComplaints.length
    ? (resolvedComplaints.reduce((sum, complaint) => sum + (new Date(complaint.updated_at) - new Date(complaint.created_at)) / 3600000, 0) / resolvedComplaints.length).toFixed(1)
    : null

  const recentComplaints = complaints.slice(0, 5)
  const recentRequests = pendingReqs.slice(0, 5)
  const dashboardSubtitle = user?.admin_role === 'main_administrator'
    ? "Here's what's happening across your campus today."
    : `Your ${ADMIN_ROLE_LABELS[user?.admin_role] || 'administrator'} workspace at a glance.`

  const selectDashboardCard = event => {
    const card = event.target.closest('.card')
    if (!card || !event.currentTarget.contains(card)) return

    event.currentTarget.querySelector('[data-dashboard-selected="true"]')?.removeAttribute('data-dashboard-selected')
    card.setAttribute('data-dashboard-selected', 'true')
  }

  const stats = [
    { label: 'Total Students', value: students.length, icon: Users, art: studentsArt, color: 'text-emerald-700', bg: 'bg-emerald-50', change: 'Registered profiles' },
    { label: 'Pending Requests', value: pendingReqs.length, icon: ClipboardList, art: requestsArt, color: 'text-amber-700', bg: 'bg-amber-50', change: 'Awaiting review' },
    { label: 'Open Complaints', value: openComplaints.length, icon: MessageSquareWarning, art: complaintsArt, color: 'text-red-600', bg: 'bg-red-50', change: `${highPriority.length} high priority` },
    { label: 'Avg Resolution Time', value: averageResolutionHours ? `${averageResolutionHours} hrs` : 'N/A', icon: Clock, art: resolutionArt, color: 'text-teal-700', bg: 'bg-teal-50', change: `${resolvedComplaints.length} resolved records` },
  ]

  return (
    <div className="dashboard-selectable space-y-4 sm:space-y-6" onClick={selectDashboardCard}>
      <DashboardHero
        audience={user?.admin_role || 'main_administrator'}
        eyebrow="YOUR CAMPUS, AT A GLANCE"
        title={`Welcome back, ${ADMIN_ROLE_LABELS[user?.admin_role] || 'Administrator'} 👋`}
        subtitle={dashboardSubtitle}
      />

      <DemoDataBanner user={user} complaints={complaints.length} students={students.length} examResults={examResults.length} />

      <div className="internal-stats-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, value, icon: Icon, art, color, bg, change }) => (
          <div key={label} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center`}><Icon size={20} className={color} /></div>
              <TrendingUp size={14} className="text-gray-300" />
            </div>
            <img className="dashboard-stat-art" src={art} alt="" aria-hidden="true" />
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
            <p className="text-xs text-green-600 mt-1">{change}</p>
          </div>
        ))}
      </div>

      {user?.admin_role === 'main_administrator' && <AcademicResourcesSummary isDemo={user.isDemo} />}

      {user?.admin_role === 'main_administrator' && user.isDemo && <StudentDashboardDemoSummary />}

      {highPriority.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertCircle size={18} className="text-red-600" /><p className="font-semibold text-red-800">🚨 {highPriority.length} High Priority Complaint{highPriority.length > 1 ? 's' : ''} Need Attention</p></div>
          <div className="flex flex-wrap gap-2">
            {highPriority.map(c => (
              <button key={c.id} onClick={() => navigate('/admin/complaints')} className="text-xs bg-red-100 text-red-700 px-3 py-1.5 rounded-xl hover:bg-red-200 transition-colors">{c.id} — {c.category}</button>
            ))}
          </div>
        </div>
      )}

      <div className="admin-dashboard-feed-grid grid lg:grid-cols-2 gap-4 sm:gap-6">
        <section className="card admin-dashboard-feed-panel admin-dashboard-feed-panel--complaints">
          <div className="admin-dashboard-feed-heading">
            <h2 className="font-semibold text-gray-900">Recent Complaints</h2>
            <div className="admin-dashboard-feed-heading-tools">
              <button onClick={() => navigate('/admin/complaints')} className="admin-dashboard-feed-link">View All <ChevronRight size={14} /></button>
              <img className="dashboard-feature-art" src={complaintsArt} alt="" aria-hidden="true" />
            </div>
          </div>
          <div className="admin-dashboard-feed-list">
            {recentComplaints.map(c => (
              <div key={c.id} className="admin-dashboard-feed-row admin-dashboard-feed-row--complaint">
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-mono text-xs text-emerald-700 font-semibold">{c.id}</span>
                    <span className={`badge text-xs ${c.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{c.priority}</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{c.category}</p>
                  <p className="text-xs text-gray-500">{c.student_name}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </div>
        </section>

        <section className="card admin-dashboard-feed-panel admin-dashboard-feed-panel--requests">
          <div className="admin-dashboard-feed-heading">
            <h2 className="font-semibold text-gray-900">Pending Requests</h2>
            <div className="admin-dashboard-feed-heading-tools">
              <button onClick={() => navigate('/admin/requests')} className="admin-dashboard-feed-link">View All <ChevronRight size={14} /></button>
              <img className="dashboard-feature-art" src={requestsArt} alt="" aria-hidden="true" />
            </div>
          </div>
          <div className="admin-dashboard-feed-list">
            {recentRequests.length === 0 ? <p className="admin-dashboard-feed-empty">No pending requests</p> : recentRequests.map(r => (
              <div key={r.id} className="admin-dashboard-feed-row admin-dashboard-feed-row--request">
                <div>
                  <span className="font-mono text-xs text-emerald-700 font-semibold">{r.id}</span>
                  <p className="text-sm font-medium text-gray-900">{r.type}</p>
                  <p className="text-xs text-gray-500">{r.student_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={r.status} />
                  <button onClick={() => navigate('/admin/requests')} className="admin-dashboard-review-button">Review</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <CampusJournalPreview items={campusJournalItems} admin />

      <DashboardVideoShowcase videos={dashboardVideos} />
    </div>
  )
}

function StudentDashboardDemoSummary() {
  const attendance = DEMO_SUBJECTS.reduce(
    (summary, subject) => ({
      total: summary.total + subject.total,
      present: summary.present + subject.present,
    }),
    { total: 0, present: 0 },
  )
  const attendanceRate = attendance.total
    ? Math.round((attendance.present / attendance.total) * 100)
    : 0
  const upcomingEvents = DEMO_EVENTS

  const metrics = [
    { label: 'Average attendance', value: `${attendanceRate}%` },
    { label: 'Subjects', value: DEMO_SUBJECTS.length },
    { label: 'Weekly classes', value: DEMO_TIMETABLE.length },
    { label: 'Upcoming events', value: upcomingEvents.length },
  ]

  return (
    <section className="card">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Student dashboard sample data</h2>
        <p className="mt-1 text-xs text-gray-500">Academic records from the student demo dashboard</p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-violet-50 p-3">
            <p className="text-2xl font-bold text-violet-800">{value}</p>
            <p className="mt-1 text-xs text-gray-600">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 border-t border-gray-100 pt-4">
        <h3 className="mb-3 text-sm font-medium text-gray-800">Upcoming campus events</h3>
        {upcomingEvents.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {upcomingEvents.slice(0, 4).map(event => (
              <div key={event.id} className="flex items-start gap-2 rounded-xl bg-gray-50 p-3">
                <Calendar size={16} className="mt-0.5 shrink-0 text-violet-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{event.title}</p>
                  <p className="text-xs text-gray-500">
                    {new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : <p className="text-sm text-gray-500">No upcoming demo events.</p>}
      </div>
    </section>
  )
}

function AcademicResourcesSummary({ isDemo }) {
  const navigate = useNavigate()
  const [counts, setCounts] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    if (isDemo) return () => { active = false }
    if (!supabase) return () => { active = false }
    const loadCounts = async () => {
      const [syllabus, pyq, materials, timetable] = await Promise.all([
        supabase.from('academic_resources').select('id', { count: 'exact', head: true }).eq('resource_type', 'syllabus'),
        supabase.from('academic_resources').select('id', { count: 'exact', head: true }).eq('resource_type', 'pyq'),
        supabase.from('academic_resources').select('id', { count: 'exact', head: true }).eq('resource_type', 'class_material'),
        supabase.from('timetable').select('id', { count: 'exact', head: true }),
      ])
      const failed = [syllabus, pyq, materials, timetable].find(result => result.error)
      if (!active) return
      if (failed) setError(`Could not load academic resource totals: ${failed.error.message}`)
      else setCounts([syllabus.count || 0, pyq.count || 0, materials.count || 0, timetable.count || 0])
    }
    loadCounts()
    return () => { active = false }
  }, [isDemo])

  const demoCounts = [
    DEMO_ACADEMIC_RESOURCES.filter(resource => resource.resource_type === 'syllabus').length,
    DEMO_ACADEMIC_RESOURCES.filter(resource => resource.resource_type === 'pyq').length,
    DEMO_ACADEMIC_RESOURCES.filter(resource => resource.resource_type === 'class_material').length,
    DEMO_TIMETABLE.length,
  ]
  const visibleCounts = isDemo ? demoCounts : counts
  const visibleError = isDemo ? '' : error || (supabase ? '' : 'Supabase is not configured.')

  return (
    <section className="card">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="font-semibold text-gray-900">Academic Resources</h2><p className="mt-1 text-xs text-gray-500">Published and pending campus resources</p></div>
        <button onClick={() => navigate('/admin/academic-resources')} className="text-xs font-medium text-violet-700 hover:underline">Manage resources <ChevronRight size={14} className="inline" /></button>
      </div>
      {visibleError ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{visibleError}</p> : visibleCounts ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Total Syllabus', art: notebookArt },
            { label: 'Total PYQs', art: requestsArt },
            { label: 'Total Class Materials', art: pencilArt },
            { label: 'Total Timetable Entries', art: calendarArt },
          ].map(({ label, art }, index) => (
            <div key={label} className="dashboard-academic-count-card rounded-xl bg-violet-50 p-3">
              <p className="text-2xl font-bold text-violet-800">{visibleCounts[index]}</p>
              <p className="mt-1 text-xs text-gray-600">{label}</p>
              <img src={art} alt="" aria-hidden="true" />
            </div>
          ))}
        </div>
      ) : <p className="text-sm text-gray-500">Loading academic totals…</p>}
    </section>
  )
}
