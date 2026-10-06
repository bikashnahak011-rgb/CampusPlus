import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { Award, Plus, Search, Send } from 'lucide-react'
import { useApp } from '../../contexts/AppContext'
import { useToast } from '../../components/ui/Toast'
import Modal from '../../components/ui/Modal'
import { EmptyState } from '../../components/ui/States'
import { useAuth } from '../../contexts/AuthContext'
import DemoDataBanner from '../../components/DemoDataBanner'

const EMPTY_FORM = {
  student_id: '',
  result_type: 'SGPA',
  result_value: '',
  academic_year: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
  semester: '1',
}

export default function AdminExamResults() {
  const { user } = useAuth()
  const { pathname } = useLocation()
  const { examResults, students, publishExamResult } = useApp()
  const toast = useToast()
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [form, setForm] = useState(EMPTY_FORM)
  const [publishing, setPublishing] = useState(false)
  const section = pathname.split('/').pop()
  const pageTitle = section === 'examination' ? 'Examination' : section === 'marks' ? 'Student Marks' : 'Exam Results'

  const filteredResults = examResults.filter(result => {
    const student = students.find(item => item.id === result.student_id)
    const searchText = `${student?.name || result.student_name || ''} ${student?.roll || result.student_roll || ''} ${result.result_type || ''} ${result.academic_year}`.toLowerCase()
    return searchText.includes(search.toLowerCase())
  })

  const handlePublish = async event => {
    event.preventDefault()
    setPublishing(true)
    try {
      await publishExamResult(form)
      setForm(EMPTY_FORM)
      setShowForm(false)
      toast('Exam result published and student notified.', 'success')
    } catch (error) {
      toast(error.message, 'error')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700"><Award size={22} /></div>
          <div><h1 className="text-2xl font-bold text-gray-900">{pageTitle}</h1><p className="mt-1 text-sm text-gray-500">Publish SGPA or CGPA for individual students</p></div>
        </div>
        <button type="button" onClick={() => setShowForm(true)} className="btn-primary sm:w-auto!"><Plus size={16} /> Publish result</button>
      </div>

      <DemoDataBanner user={user} examResults={examResults.length} students={students.length} />

      <div className="card">
        <div className="relative max-w-lg">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search student or academic year..." className="input search-input" />
        </div>
      </div>

      {filteredResults.length === 0
        ? <div className="card py-10"><EmptyState message={examResults.length ? 'No results match your search.' : 'No exam results have been published yet.'} icon={Award} /></div>
        : <div className="card overflow-x-auto">
          <table className="hidden w-full text-sm md:table">
            <thead><tr className="border-b border-gray-100">{['Student', 'Result', 'Academic year', 'Semester', 'Published'].map(label => <th key={label} className="px-3 py-3 text-left text-xs font-semibold uppercase text-gray-500">{label}</th>)}</tr></thead>
            <tbody>{filteredResults.map(result => {
              const student = students.find(item => item.id === result.student_id)
              return <tr key={result.id} className="border-b border-gray-50 last:border-0">
                <td className="px-3 py-3"><p className="font-medium text-gray-900">{student?.name || result.student_name || 'Student'}</p><p className="font-mono text-xs text-gray-500">{student?.roll || result.student_roll || ''}</p></td>
                <td className="px-3 py-3 font-semibold text-gray-800">{result.result_type || 'Legacy result'}<p className="text-xs font-normal text-gray-500">{result.result_value == null ? 'GPA unavailable' : `${Number(result.result_value).toFixed(2)} / 10`}</p></td>
                <td className="px-3 py-3 text-gray-600">{result.academic_year}</td>
                <td className="px-3 py-3 text-gray-600">Semester {result.semester}</td>
                <td className="px-3 py-3 text-xs text-gray-500">{result.published_at ? new Date(result.published_at).toLocaleDateString('en-IN') : 'Published'}</td>
              </tr>
            })}</tbody>
          </table>
          <div className="space-y-3 md:hidden">
            {filteredResults.map(result => {
              const student = students.find(item => item.id === result.student_id)
              return <article key={result.id} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold text-gray-900">{student?.name || result.student_name || 'Student'}</p><p className="truncate text-xs text-gray-500">{student?.roll || result.student_roll}</p></div><span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700">{result.result_type || 'Legacy result'}</span></div>
                <div className="mt-3 flex items-end justify-between gap-3 border-t border-gray-200 pt-2"><p className="text-xs text-gray-500">Semester {result.semester} · {result.academic_year}</p><p className="text-right text-sm font-semibold text-gray-800">{result.result_value == null ? 'GPA unavailable' : `${Number(result.result_value).toFixed(2)} / 10`}</p></div>
              </article>
            })}
          </div>
        </div>}

      <Modal isOpen={showForm} onClose={() => setShowForm(false)} title="Publish exam result" size="lg">
        <form onSubmit={handlePublish} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Student<select required value={form.student_id} onChange={event => setForm(previous => ({ ...previous, student_id: event.target.value }))} className="input mt-1"><option value="">Select a student</option>{students.map(student => <option key={student.id} value={student.id}>{student.name} · {student.roll}</option>)}</select></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm font-medium text-gray-700">Result type<select required value={form.result_type} onChange={event => setForm(previous => ({ ...previous, result_type: event.target.value }))} className="input mt-1"><option value="SGPA">SGPA</option><option value="CGPA">CGPA</option></select></label>
            <label className="block text-sm font-medium text-gray-700">Academic year<input required value={form.academic_year} onChange={event => setForm(previous => ({ ...previous, academic_year: event.target.value }))} className="input mt-1" placeholder="2025-2026" /></label>
            <label className="block text-sm font-medium text-gray-700">Semester<input required type="number" min="1" max="12" value={form.semester} onChange={event => setForm(previous => ({ ...previous, semester: event.target.value }))} className="input mt-1" /></label>
            <label className="block text-sm font-medium text-gray-700">{form.result_type}<input required type="number" min="0" max="10" step="0.01" value={form.result_value} onChange={event => setForm(previous => ({ ...previous, result_value: event.target.value }))} className="input mt-1" placeholder="8.50" /></label>
          </div>
          <p className="text-xs text-gray-500">The published GPA is visible only to the selected student.</p>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={publishing || students.length === 0} className="btn-primary disabled:opacity-60"><Send size={15} />{publishing ? 'Publishing...' : 'Publish result'}</button></div>
        </form>
      </Modal>
    </div>
  )
}
