import { useNavigate } from 'react-router-dom'
import {
  ClipboardList,
  MessageSquareWarning,
  BookOpen,
  Building2,
  UtensilsCrossed,
  FileText,
  DoorOpen,
  ChevronRight,
  Bell,
  Calendar,
  AlertCircle
} from 'lucide-react'

import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'
import {
  DEMO_SUBJECTS,
  DEMO_TIMETABLE,
  DEMO_MESS_MENU,
  DEMO_HOSTEL,
  DEMO_EVENTS
} from '../../data/demoData'

function getGreeting() {
  const h = new Date().getHours()

  if (h < 12) return 'Good Morning'
  if (h < 17) return 'Good Afternoon'

  return 'Good Evening'
}

function classStatus(time) {
  const now = new Date()
  const [h, m] = time.split(':').map(Number)

  const t = new Date()
  t.setHours(h, m, 0)

  const diff = (t - now) / 60000

  if (diff > 30) {
    return {
      label: 'Upcoming',
      cls: 'bg-blue-100 text-blue-700'
    }
  }

  if (diff >= -60) {
    return {
      label: 'Current',
      cls: 'bg-green-100 text-green-700'
    }
  }

  return {
    label: 'Completed',
    cls: 'bg-gray-100 text-gray-500'
  }
}

export default function StudentDashboard() {
  const { user } = useAuth()

  const {
    complaints,
    requests,
    leaveRequests,
    notifications,
    notices
  } = useApp()

  const navigate = useNavigate()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long'
  })

  const todayClasses = DEMO_TIMETABLE
    .filter(t => t.day === today)
    .slice(0, 4)

  const menu =
    DEMO_MESS_MENU[today] ||
    DEMO_MESS_MENU['Monday']

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

  const avgAtt = Math.round(
    DEMO_SUBJECTS.reduce(
      (s, sub) =>
        s + (sub.present / sub.total) * 100,
      0
    ) / DEMO_SUBJECTS.length
  )

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

  return (
    <div className="flex gap-6">

      {/* MAIN CONTENT */}
      <div className="flex-1 min-w-0 space-y-6">

        {/* GREETING */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>

          <p className="text-gray-500 mt-1">
            Here's what's happening on campus today.
          </p>
        </div>


        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">

          {[
            {
              label: 'Attendance',
              value: `${avgAtt}%`,
              icon: ClipboardList,
              color: 'text-blue-600',
              bg: 'bg-blue-50',
              to: '/student/attendance'
            },
            {
              label: 'Pending Requests',
              value: pendingReqs,
              icon: FileText,
              color: 'text-orange-600',
              bg: 'bg-orange-50',
              to: '/student/documents'
            },
            {
              label: 'Open Complaints',
              value: openComplaints,
              icon: MessageSquareWarning,
              color: 'text-red-600',
              bg: 'bg-red-50',
              to: '/student/complaints'
            },
            {
              label: "Today's Classes",
              value: todayClasses.length,
              icon: BookOpen,
              color: 'text-green-600',
              bg: 'bg-green-50',
              to: '/student/timetable'
            }
          ].map(
            ({
              label,
              value,
              icon: Icon,
              color,
              bg,
              to
            }) => (
              <button
                key={label}
                onClick={() => navigate(to)}
                className="card hover:shadow-md transition-all text-left"
              >
                <div
                  className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}
                >
                  <Icon
                    size={20}
                    className={color}
                  />
                </div>

                <p className="text-2xl font-bold text-gray-900">
                  {value}
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  {label}
                </p>
              </button>
            )
          )}

        </div>


        {/* QUICK ACTIONS */}
        <div className="card">

          <h2 className="font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">

            {[
              {
                icon: MessageSquareWarning,
                label: 'Report a Problem',
                color:
                  'bg-red-50 text-red-600 hover:bg-red-100',
                to: '/student/complaints'
              },
              {
                icon: DoorOpen,
                label: 'Apply Leave',
                color:
                  'bg-blue-50 text-blue-600 hover:bg-blue-100',
                to: '/student/leave'
              },
              {
                icon: FileText,
                label: 'Request Document',
                color:
                  'bg-purple-50 text-purple-600 hover:bg-purple-100',
                to: '/student/documents'
              },
              {
                icon: DoorOpen,
                label: 'Apply Gate Pass',
                color:
                  'bg-green-50 text-green-600 hover:bg-green-100',
                to: '/student/leave'
              },
              {
                icon: ClipboardList,
                label: 'View Attendance',
                color:
                  'bg-orange-50 text-orange-600 hover:bg-orange-100',
                to: '/student/attendance'
              },
              {
                icon: UtensilsCrossed,
                label: 'View Mess Menu',
                color:
                  'bg-yellow-50 text-yellow-600 hover:bg-yellow-100',
                to: '/student/mess'
              }
            ].map(
              ({
                icon: Icon,
                label,
                color,
                to
              }) => (
                <button
                  key={label}
                  onClick={() => navigate(to)}
                  className={`${color} rounded-xl p-4 flex flex-col items-center gap-2 text-center transition-colors`}
                >
                  <Icon size={22} />

                  <span className="text-xs font-medium">
                    {label}
                  </span>
                </button>
              )
            )}

          </div>
        </div>


        {/* ATTENDANCE + TODAY'S CLASSES */}
        <div className="grid lg:grid-cols-2 gap-3 sm:gap-4">

          {/* ATTENDANCE CARD */}
          <div className="card">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-semibold text-gray-900">
                Attendance
              </h2>

              <button
                onClick={() =>
                  navigate('/student/attendance')
                }
                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
              >
                View Details
                <ChevronRight size={14} />
              </button>

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
                    stroke="#2563eb"
                    strokeWidth="3"
                    strokeDasharray={`${avgAtt} ${100 - avgAtt}`}
                    strokeLinecap="round"
                  />
                </svg>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-sm font-bold text-gray-900">
                    {avgAtt}%
                  </span>
                </div>

              </div>

              <div className="space-y-1">

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />

                  <span className="text-sm text-gray-600">
                    Present:{' '}
                    {DEMO_SUBJECTS.reduce(
                      (s, sub) =>
                        s + sub.present,
                      0
                    )}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-gray-300 rounded-full" />

                  <span className="text-sm text-gray-600">
                    Absent:{' '}
                    {DEMO_SUBJECTS.reduce(
                      (s, sub) =>
                        s +
                        (sub.total -
                          sub.present),
                      0
                    )}
                  </span>
                </div>

              </div>

            </div>

            <div className="w-full bg-gray-100 rounded-full h-2">

              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{
                  width: `${avgAtt}%`
                }}
              />

            </div>

            {DEMO_SUBJECTS.some(
              s =>
                (s.present / s.total) *
                  100 <
                80
            ) && (
              <div className="mt-3 flex items-center gap-2 text-orange-600 text-xs bg-orange-50 rounded-xl p-2">

                <AlertCircle size={14} />

                Some subjects below 80% — check Attendance page

              </div>
            )}

          </div>


          {/* TODAY'S CLASSES */}
          <div className="card">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-semibold text-gray-900">
                Today's Classes
              </h2>

              <button
                onClick={() =>
                  navigate('/student/timetable')
                }
                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
              >
                Full Timetable
                <ChevronRight size={14} />
              </button>

            </div>

            {todayClasses.length === 0 ? (

              <p className="text-gray-400 text-sm text-center py-6">
                No classes today
              </p>

            ) : (

              <div className="space-y-3">

                {todayClasses.map(cls => {

                  const s =
                    classStatus(cls.time)

                  return (
                    <div
                      key={cls.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
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
                Hostel
              </h2>

              <button
                onClick={() =>
                  navigate('/student/hostel')
                }
                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
              >
                View Hostel
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
                  Block {DEMO_HOSTEL.block},
                  Room {DEMO_HOSTEL.room}
                </p>

                <p className="text-xs text-gray-500">
                  Floor {DEMO_HOSTEL.floor} •{' '}
                  {DEMO_HOSTEL.roommates.length}{' '}
                  roommates
                </p>

              </div>

            </div>

            {openComplaints > 0 && (
              <div className="flex items-center gap-2 text-orange-600 text-xs bg-orange-50 rounded-xl p-2">

                <AlertCircle size={14} />

                Open Complaints: {openComplaints}

              </div>
            )}

          </div>


          {/* MESS MENU CARD */}
          <div className="card">

            <div className="flex items-center justify-between mb-4">

              <h2 className="font-semibold text-gray-900">
                Today's Mess Menu
              </h2>

              <button
                onClick={() =>
                  navigate('/student/mess')
                }
                className="text-blue-600 text-xs hover:underline flex items-center gap-1"
              >
                Full Menu
                <ChevronRight size={14} />
              </button>

            </div>

            <div className="space-y-2">

              {[
                ['🌅', 'Breakfast', menu.breakfast],
                ['☀️', 'Lunch', menu.lunch],
                ['🌙', 'Dinner', menu.dinner]
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

            </div>

          </div>

        </div>


        {/* RECENT REQUESTS */}
        <div className="card">

          <div className="flex items-center justify-between mb-4">

            <h2 className="font-semibold text-gray-900">
              Recent Requests & Complaints
            </h2>

            <button
              onClick={() =>
                navigate('/student/complaints')
              }
              className="text-blue-600 text-xs hover:underline"
            >
              View All
            </button>

          </div>

          {recentItems.length === 0 ? (

            <p className="text-gray-400 text-sm text-center py-4">
              No recent activity
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
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-left"
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

      </div>


      {/* RIGHT SIDEBAR */}
      <div className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">

        {/* NOTIFICATIONS */}
        <div className="card">

          <div className="flex items-center justify-between mb-3">

            <h3 className="font-semibold text-gray-900 text-sm">
              Notifications
            </h3>

            <button
              onClick={() =>
                navigate('/student/notifications')
              }
              className="text-blue-600 text-xs hover:underline"
            >
              All
            </button>

          </div>

          {myNotifs.length === 0 ? (

            <p className="text-gray-400 text-xs text-center py-3">
              No notifications
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
            Upcoming Events
          </h3>

          <div className="space-y-2">

            {DEMO_EVENTS.map(e => (

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
              Important Notices
            </h3>

            <button
              onClick={() =>
                navigate('/student/notifications')
              }
              className="text-blue-600 text-xs hover:underline"
            >
              All
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