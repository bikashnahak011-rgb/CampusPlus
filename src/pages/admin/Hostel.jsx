import { useEffect, useState } from 'react'
import { Building2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { DEMO_HOSTEL_BLOCKS } from '../../data/demoData'

export default function AdminHostel() {
  const { user } = useAuth()
  const [blocks, setBlocks] = useState(() => user?.isDemo ? DEMO_HOSTEL_BLOCKS : [])
  const [loading, setLoading] = useState(!user?.isDemo)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    if (user.isDemo) return
    if (!supabase) {
      setBlocks([])
      setLoading(false)
      setError('Live hostel records are unavailable because Supabase is not configured.')
      return
    }

    let active = true
    setLoading(true)
    setError('')
    Promise.all([
      supabase.from('hostels').select('id,block,total_rooms,rooms(id)'),
      supabase.from('profiles').select('hostel_block').eq('role', 'student').not('hostel_block', 'is', null),
    ]).then(([hostelResult, studentResult]) => {
      if (!active) return
      if (hostelResult.error || studentResult.error) {
        setError(`Could not load hostel occupancy: ${hostelResult.error?.message || studentResult.error?.message}`)
        setBlocks([])
      } else {
        const counts = (studentResult.data || []).reduce((result, student) => ({
          ...result,
          [student.hostel_block]: (result[student.hostel_block] || 0) + 1,
        }), {})
        setBlocks((hostelResult.data || []).map(hostel => ({
          block: hostel.block,
          rooms: hostel.total_rooms || hostel.rooms?.length || 0,
          occupied: counts[hostel.block] || 0,
        })))
      }
      setLoading(false)
    })

    return () => { active = false }
  }, [user])

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">Hostel Management</h1><p className="text-gray-500 text-sm mt-1">Room capacity and occupancy by hostel block</p></div>
      {loading && <div className="card text-sm text-gray-500">Loading hostel occupancy...</div>}
      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
      {!loading && !error && blocks.length === 0 && <div className="card py-10 text-center text-sm text-gray-500">No hostel blocks have been published.</div>}

      {!loading && !error && blocks.length > 0 && <div className="grid sm:grid-cols-3 gap-4">
        {blocks.map(b => {
          return (
            <div key={b.block} className="card">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center"><Building2 size={20} className="text-blue-600" /></div>
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Block {b.block}</h3>
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <div className="flex justify-between"><span>Rooms</span><span className="font-medium text-gray-900">{b.rooms}</span></div>
                <div className="flex justify-between"><span>Occupied</span><span className="font-medium text-gray-900">{b.occupied}</span></div>
                <div className="flex justify-between"><span>Vacant</span><span className="font-medium text-green-600">{b.rooms - b.occupied}</span></div>
              </div>
              <div className="internal-meter-track mt-3 w-full rounded-full h-2" role="progressbar" aria-label={`Block ${b.block} occupancy`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(b.occupied/b.rooms*100)}>
                <div className="internal-meter-fill bg-blue-600 h-2 rounded-full" style={{ width: `${Math.round(b.occupied/b.rooms*100)}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{Math.round(b.occupied/b.rooms*100)}% occupancy</p>
            </div>
          )
        })}
      </div>}
    </div>
  )
}
