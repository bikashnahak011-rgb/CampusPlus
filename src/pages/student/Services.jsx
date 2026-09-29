import { useNavigate } from 'react-router-dom'
import { ClipboardList, Calendar, Building2, UtensilsCrossed, BusFront, MapPinned, MessageSquareWarning, DoorOpen, FileText, CreditCard, Bell, Megaphone } from 'lucide-react'

const SERVICES = [
  { icon: ClipboardList, label: 'Attendance', desc: 'View subject-wise attendance and warnings', to: '/student/attendance', color: 'bg-blue-50 text-blue-600', border: 'border-blue-100' },
  { icon: Calendar, label: 'Timetable', desc: 'Check your weekly class schedule', to: '/student/timetable', color: 'bg-indigo-50 text-indigo-600', border: 'border-indigo-100' },
  { icon: Building2, label: 'Hostel', desc: 'Room info, roommates and warden details', to: '/student/hostel', color: 'bg-purple-50 text-purple-600', border: 'border-purple-100' },
  { icon: UtensilsCrossed, label: 'Mess', desc: 'Weekly menu and meal feedback', to: '/student/mess', color: 'bg-yellow-50 text-yellow-600', border: 'border-yellow-100' },
  { icon: BusFront, label: 'Bus Routes', desc: 'Check stops and campus bus timings', to: '/student/bus-routes', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
  { icon: MapPinned, label: 'Room Finder', desc: 'Find classrooms, labs, library and faculty chambers', to: '/student/room-finder', color: 'bg-cyan-50 text-cyan-600', border: 'border-cyan-100' },
  { icon: MessageSquareWarning, label: 'Complaints', desc: 'Report and track campus issues', to: '/student/complaints', color: 'bg-red-50 text-red-600', border: 'border-red-100' },
  { icon: DoorOpen, label: 'Leave', desc: 'Apply for leave requests', to: '/student/leave', color: 'bg-green-50 text-green-600', border: 'border-green-100' },
  { icon: DoorOpen, label: 'Gate Pass', desc: 'Apply for gate pass permissions', to: '/student/leave', color: 'bg-teal-50 text-teal-600', border: 'border-teal-100' },
  { icon: FileText, label: 'Documents', desc: 'Request certificates and documents', to: '/student/documents', color: 'bg-orange-50 text-orange-600', border: 'border-orange-100' },
  { icon: CreditCard, label: 'Fees', desc: 'View fee details and payment status', to: '/student/fees', color: 'bg-pink-50 text-pink-600', border: 'border-pink-100' },
  { icon: Megaphone, label: 'Notices', desc: 'Important campus announcements', to: '/student/notifications', color: 'bg-cyan-50 text-cyan-600', border: 'border-cyan-100' },
]

export default function ServicesPage() {
  const navigate = useNavigate()
  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">My Services</h1><p className="text-gray-500 text-sm mt-1">All campus services in one place</p></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {SERVICES.map(({ icon: Icon, label, desc, to, color, border }) => (
          <button key={label} onClick={() => navigate(to)} className={`card border ${border} hover:shadow-md transition-all text-left group`}>
            <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}><Icon size={24} /></div>
            <h3 className="font-semibold text-gray-900 mb-1">{label}</h3>
            <p className="text-xs text-gray-500">{desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}
