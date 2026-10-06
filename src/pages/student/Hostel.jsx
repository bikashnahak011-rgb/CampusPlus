import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, User, Droplets, Zap, Sparkles, Wrench, AlertCircle, Plus } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useApp } from '../../contexts/AppContext'
import { supabase } from '../../lib/supabase'
import { StatusBadge } from '../../components/ui/States'
import { DEMO_HOSTEL } from '../../data/demoData'

const SERVICES = [
  { icon: Droplets, label: 'Water Supply', status: 'Issue Reported', color: 'text-blue-600', bg: 'bg-blue-50' },
  { icon: Zap, label: 'Electricity', status: 'Working', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  { icon: Sparkles, label: 'Cleaning', status: 'Working', color: 'text-green-600', bg: 'bg-green-50' },
  { icon: Wrench, label: 'Maintenance', status: 'Working', color: 'text-purple-600', bg: 'bg-purple-50' },
]

export default function HostelPage() {
  const { user } = useAuth()
  const { complaints } = useApp()
  const navigate = useNavigate()
  const [hostel, setHostel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [assignmentMessage, setAssignmentMessage] = useState('')
  const [samplePreview, setSamplePreview] = useState(false)

  useEffect(() => {
    if (!user) return
    if (user.isDemo) {
      setHostel(DEMO_HOSTEL)
      setLoading(false)
      setError('')
      setAssignmentMessage('')
      setSamplePreview(false)
      return
    }
    if (!supabase) {
      setHostel({ ...DEMO_HOSTEL, block: user.hostel_block || DEMO_HOSTEL.block, room: user.room_number || DEMO_HOSTEL.room })
      setLoading(false)
      setError('')
      setAssignmentMessage('Showing sample hostel details because live hostel records are unavailable.')
      setSamplePreview(true)
      return
    }
    if (!user.hostel_block) {
      setHostel(DEMO_HOSTEL)
      setLoading(false)
      setError('')
      setAssignmentMessage('Sample hostel details are shown as a preview. They are not assigned to your account. Add your real hostel details in your profile, or contact the hostel office.')
      setSamplePreview(true)
      return
    }

    let active = true
    setLoading(true)
    setError('')
    setAssignmentMessage('')
    setSamplePreview(false)
    const loadHostel = async () => {
      const { data: hostelData, error: hostelError } = await supabase
        .from('hostels')
        .select('id,block,warden_name,warden_phone,total_rooms')
        .eq('block', user.hostel_block)
        .maybeSingle()
      if (!active) return
      if (hostelError) {
        setError(`Could not load hostel information: ${hostelError.message}`)
        setHostel({ ...DEMO_HOSTEL, block: user.hostel_block, room: user.room_number || DEMO_HOSTEL.room })
        setAssignmentMessage('Showing sample warden, roommate, and service details until live hostel records can be loaded. These are not live assignments.')
        setSamplePreview(true)
        setLoading(false)
        return
      }
      if (!hostelData) {
        setHostel({ ...DEMO_HOSTEL, block: user.hostel_block, room: user.room_number || DEMO_HOSTEL.room })
        setAssignmentMessage(`Your profile lists Block ${user.hostel_block}, but its hostel directory is not published. Other details below are sample preview data, not live assignments.`)
        setSamplePreview(true)
        setLoading(false)
        return
      }

      let roomData = null
      if (user.room_number) {
        const { data, error: roomError } = await supabase.from('rooms')
          .select('room_number,floor,capacity')
          .eq('hostel_id', hostelData.id)
          .eq('room_number', user.room_number)
          .maybeSingle()
        if (roomError) {
          setError(`Could not load room information: ${roomError.message}`)
          setHostel({ ...DEMO_HOSTEL, block: hostelData.block, room: user.room_number || DEMO_HOSTEL.room, warden: hostelData.warden_name || DEMO_HOSTEL.warden, warden_phone: hostelData.warden_phone || DEMO_HOSTEL.warden_phone })
          setAssignmentMessage('Room details could not be loaded. Missing details below use sample preview data, not live assignments.')
          setSamplePreview(true)
          setLoading(false)
          return
        }
        roomData = data
      }

      setHostel({
        block: hostelData.block,
        room: roomData?.room_number || user.room_number || '',
        floor: roomData?.floor,
        capacity: roomData?.capacity,
        warden: hostelData.warden_name,
        warden_phone: hostelData.warden_phone,
        roommates: DEMO_HOSTEL.roommates,
      })
      setSamplePreview(true)
      setAssignmentMessage('Room and warden details are from your live profile. Roommates and service statuses below are sample preview data until those live records are available.')
      setLoading(false)
    }

    loadHostel()
    const refreshInterval = window.setInterval(() => {
      if (document.visibilityState === 'visible') loadHostel()
    }, 5000)
    return () => {
      active = false
      window.clearInterval(refreshInterval)
    }
  }, [user])

  const activeComplaints = complaints.filter(c => c.student_id === user?.id && !['Resolved', 'Closed'].includes(c.status))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Hostel</h1><p className="text-gray-500 text-sm mt-1">Your hostel information and services</p></div>
        <button onClick={() => navigate('/student/complaints')} className="btn-primary"><Plus size={18} /> Report Hostel Problem</button>
      </div>

      {loading && <div className="card text-sm text-gray-500">Loading hostel information...</div>}
      {error && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{error}</div>}
      {assignmentMessage && <div role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <span>{assignmentMessage}</span>
        {!user?.isDemo && !user?.hostel_block && <button onClick={() => navigate('/student/profile')} className="font-semibold underline underline-offset-2 self-start sm:self-auto">Update my profile</button>}
      </div>}

      {!loading && hostel && <>
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Room Information</h2>
          <div className="grid grid-cols-2 gap-3">
            {[['Hostel Block', hostel.block ? `Block ${hostel.block}` : 'Not assigned'], ['Room Number', hostel.room || 'Not assigned'], ['Floor', hostel.floor ? `Floor ${hostel.floor}` : 'Not listed'], ['Capacity', hostel.capacity ? `${hostel.capacity} Students` : 'Not listed']].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3"><p className="text-xs text-gray-400 mb-0.5">{l}</p><p className="font-semibold text-gray-900">{v}</p></div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Warden Information</h2>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><User size={22} className="text-blue-600" /></div>
            <div><p className="font-semibold text-gray-900">{hostel.warden || 'Warden not listed'}</p><p className="text-xs text-gray-500">{hostel.block ? `Block ${hostel.block} Warden` : 'Hostel contact'}</p></div>
          </div>
          {hostel.warden_phone && <a href={`tel:${hostel.warden_phone}`} className="flex items-center gap-2 text-blue-600 text-sm hover:underline"><Phone size={15} />{hostel.warden_phone}</a>}
        </div>
      </div>

      {user?.isDemo || samplePreview ? <div className="card">
        <h2 className="font-semibold text-gray-900 mb-1">Roommates</h2>
        {samplePreview && !user?.isDemo && <p className="text-xs text-amber-700 mb-4">Sample preview only · not your assigned roommates</p>}
        {(!samplePreview || user?.isDemo) && <div className="mb-4" />}
        <div className="grid sm:grid-cols-2 gap-3">
          {(hostel.roommates || DEMO_HOSTEL.roommates).map(r => (
            <div key={r.roll} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-sm">{r.name[0]}</div>
              <div><p className="font-medium text-gray-900 text-sm">{r.name}</p><p className="text-xs text-gray-500">{r.roll}</p></div>
              {(!samplePreview || user?.isDemo) && <a href={`tel:${r.phone}`} className="ml-auto text-blue-600"><Phone size={15} /></a>}
            </div>
          ))}
        </div>
      </div> : <div className="card text-sm text-gray-500">Roommate details are not available in the published hostel directory.</div>}

      {user?.isDemo || samplePreview ? <div className="card">
        <h2 className="font-semibold text-gray-900 mb-1">Hostel Services</h2>
        {samplePreview && !user?.isDemo && <p className="text-xs text-amber-700 mb-4">Sample status preview · check with the hostel office for live service status</p>}
        {(!samplePreview || user?.isDemo) && <div className="mb-4" />}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SERVICES.map(({ icon: Icon, label, status, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <Icon size={24} className={`${color} mx-auto mb-2`} />
              <p className="text-sm font-medium text-gray-900">{label}</p>
              <p className={`text-xs mt-1 ${status === 'Working' ? 'text-green-600' : 'text-orange-600'}`}>{status}</p>
            </div>
          ))}
        </div>
      </div> : <div className="card text-sm text-gray-500">Live hostel service statuses are not configured. Use “Report Hostel Problem” to submit a maintenance issue.</div>}
      </>}

      <div className="card">
        <h2 className="font-semibold text-gray-900 mb-4">Active Complaints</h2>
        {activeComplaints.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-4">No active complaints</p>
        ) : (
          <div className="space-y-2">
            {activeComplaints.map(c => (
              <button key={c.id} onClick={() => navigate('/student/complaints')} className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-left transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{c.category} — {c.id}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><AlertCircle size={11} />{c.location}</p>
                </div>
                <StatusBadge status={c.status} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
