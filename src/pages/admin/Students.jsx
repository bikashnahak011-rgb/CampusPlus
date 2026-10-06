import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { GraduationCap, MessageSquareText, Search, Send, Users } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { StatusBadge } from '../../components/ui/States'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { useAuth } from '../../contexts/AuthContext'
import DemoDataBanner from '../../components/DemoDataBanner'

const TONE_PALETTE = [
  'lavender',
  'peach',
  'mint',
  'sky',
  'rose',
  'amber'
]

export default function AdminStudents() {
  const { user } = useAuth()
  const { students, sendStudentMessage } = useApp()
  const { pathname } = useLocation()
  const isHostelStudents = pathname.endsWith('/hostel-students')
  const directoryStudents = isHostelStudents ? students.filter(student => student.hostel && student.hostel !== 'Day Scholar') : students
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [deptFilter, setDeptFilter] = useState('All')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [detailsStudent, setDetailsStudent] = useState(null)
  const [draft, setDraft] = useState({ title: '', message: '' })
  const [sending, setSending] = useState(false)

  const depts = ['All', ...new Set(directoryStudents.map(s => s.dept).filter(dept => dept && dept.toLowerCase() !== 'unassigned'))]
  const getDepartmentLabel = department => department?.toLowerCase() === 'unassigned' ? '—' : department
  const filtered = directoryStudents.filter(s => {
    const ms = !search || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.toLowerCase().includes(search.toLowerCase())
    const md = deptFilter === 'All' || s.dept === deptFilter
    return ms && md
  })

  const openMessage = student => {
    setSelectedStudent(student)
    setDraft({ title: '', message: '' })
  }

  const openDetails = student => setDetailsStudent(student)

  const handleRowKeyDown = (event, student) => {
    if (event.target !== event.currentTarget) return
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    openDetails(student)
  }

  const handleSend = async event => {
    event.preventDefault()
    setSending(true)
    try {
      await sendStudentMessage(selectedStudent, draft)
      setSelectedStudent(null)
      toast('Message sent to student.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900">{isHostelStudents ? 'Hostel Students' : 'Students'}</h1><p className="text-gray-500 text-sm mt-1">{isHostelStudents ? `${directoryStudents.length} hostel residents` : `${directoryStudents.length} registered students`}</p></div>
      <DemoDataBanner user={user} students={directoryStudents.length} />

      <div className="card admin-student-filter-panel">
        <div className="admin-student-filter-toolbar flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or roll number..." className="input search-input admin-student-search-input" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {depts.map(d => (
              <button key={d} onClick={() => setDeptFilter(d)} className={`admin-student-filter-chip ${deptFilter === d ? 'is-active' : ''}`}>{d}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="card admin-student-list-shell overflow-x-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-12"><Users size={32} className="text-gray-300 mx-auto mb-2" /><p className="text-gray-400">No students found</p></div>
        ) : (
          <>
            <div className="hidden sm:block">
              <table className="admin-student-table w-full text-sm">
                <thead>
                  <tr>
                    {['Name', 'Roll No', 'Department', 'Year', 'Hostel', 'Status', 'Action'].map(h => (
                      <th key={h} className="admin-student-head-cell">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s, index) => {
                    const tone = TONE_PALETTE[index % TONE_PALETTE.length]
                    return (
                      <tr
                        key={s.id}
                        className={`admin-student-row admin-student-row--${tone}`}
                        onClick={() => openDetails(s)}
                        onKeyDown={event => handleRowKeyDown(event, s)}
                        tabIndex={0}
                        aria-label={`View details for ${s.name}`}
                      >
                        <td className="admin-student-cell">
                          <div className="admin-student-name-wrap">
                            <div className="admin-student-avatar" aria-hidden="true">
                              <GraduationCap size={14} />
                            </div>
                            <span className="admin-student-name">{s.name}</span>
                          </div>
                        </td>
                        <td className="admin-student-cell admin-student-roll">{s.roll}</td>
                        <td className="admin-student-cell admin-student-meta">{getDepartmentLabel(s.dept)}</td>
                        <td className="admin-student-cell admin-student-meta">Year {s.year}</td>
                        <td className="admin-student-cell admin-student-meta">{s.hostel}</td>
                        <td className="admin-student-cell"><StatusBadge status={s.status} /></td>
                        <td className="admin-student-cell admin-student-action-cell">
                          <button type="button" onClick={event => { event.stopPropagation(); openMessage(s) }} className="admin-student-message-btn">
                            <MessageSquareText size={15} />
                            <span>Message</span>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="sm:hidden space-y-2">
              {filtered.map((s, index) => {
                const tone = TONE_PALETTE[index % TONE_PALETTE.length]
                return (
                  <article
                    key={s.id}
                    className={`admin-student-mobile-card admin-student-mobile-card--${tone}`}
                    onClick={() => openDetails(s)}
                    onKeyDown={event => handleRowKeyDown(event, s)}
                    tabIndex={0}
                    aria-label={`View details for ${s.name}`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="admin-student-avatar" aria-hidden="true"><GraduationCap size={14} /></div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">{s.name}</p>
                          <p className="font-mono text-[11px] text-gray-500 truncate">{s.roll}</p>
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 border-t border-gray-200/70 pt-2 text-xs">
                      <div><p className="text-gray-400">Department</p><p className="font-medium text-gray-700 truncate">{getDepartmentLabel(s.dept)}</p></div>
                      <div><p className="text-gray-400">Year</p><p className="font-medium text-gray-700">Year {s.year}</p></div>
                      <div><p className="text-gray-400">Hostel</p><p className="font-medium text-gray-700">{s.hostel}</p></div>
                    </div>
                    <button type="button" onClick={event => { event.stopPropagation(); openMessage(s) }} className="admin-student-message-btn mt-3">
                      <MessageSquareText size={15} />
                      <span>Message student</span>
                    </button>
                  </article>
                )
              })}
            </div>
          </>
        )}
      </div>
      <Modal isOpen={!!detailsStudent} onClose={() => setDetailsStudent(null)} title="Student details" size="lg">
        {detailsStudent && (
          <div className="admin-student-details">
            <div className="admin-student-details-banner">
              <div className="admin-student-avatar admin-student-details-avatar" aria-hidden="true"><GraduationCap size={22} /></div>
              <div className="min-w-0">
                <h3>{detailsStudent.name}</h3>
                <p>{detailsStudent.roll || 'Roll number not assigned'}</p>
              </div>
              <StatusBadge status={detailsStudent.status} />
            </div>
            <div className="admin-student-details-grid">
              <div><span>Department</span><strong>{getDepartmentLabel(detailsStudent.dept) || '—'}</strong></div>
              <div><span>Branch</span><strong>{detailsStudent.branch || '—'}</strong></div>
              <div><span>Year</span><strong>{detailsStudent.year ? `Year ${detailsStudent.year}` : '—'}</strong></div>
              <div><span>Semester</span><strong>{detailsStudent.semester || '—'}</strong></div>
              <div><span>Section</span><strong>{detailsStudent.section || '—'}</strong></div>
              <div><span>Hostel / Room</span><strong>{detailsStudent.hostel || 'Day Scholar'}</strong></div>
              <div><span>Email</span><strong>{detailsStudent.email || '—'}</strong></div>
              <div><span>Phone</span><strong>{detailsStudent.phone || '—'}</strong></div>
            </div>
            <div className="flex justify-end pt-1">
              <button type="button" onClick={() => { const student = detailsStudent; setDetailsStudent(null); openMessage(student) }} className="admin-student-message-btn">
                <MessageSquareText size={15} />
                <span>Message student</span>
              </button>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={!!selectedStudent} onClose={() => setSelectedStudent(null)} title={`Message ${selectedStudent?.name || 'student'}`}>
        <form onSubmit={handleSend} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Title<input required maxLength={160} value={draft.title} onChange={event => setDraft(previous => ({ ...previous, title: event.target.value }))} className="input mt-1" placeholder="Message from Campus Admin" /></label>
          <label className="block text-sm font-medium text-gray-700">Message<textarea required maxLength={1000} rows={4} value={draft.message} onChange={event => setDraft(previous => ({ ...previous, message: event.target.value }))} className="input mt-1 resize-y" placeholder="Write a message for this student..." /></label>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setSelectedStudent(null)} className="btn-secondary">Cancel</button><button type="submit" disabled={sending} className="btn-primary disabled:opacity-60"><Send size={15} />{sending ? 'Sending...' : 'Send message'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
