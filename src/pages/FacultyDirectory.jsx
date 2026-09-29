import { useState } from 'react'
import { BookOpen, GraduationCap, Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { useApp } from '../contexts/AppContext'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../components/ui/Toast'
import Modal from '../components/ui/Modal'

const EMPTY_FORM = {
  name: '',
  qualification: '',
  classes_taught: '',
  subjects: '',
}

const splitValues = value => value.split(',').map(item => item.trim()).filter(Boolean)

export default function FacultyDirectoryPage() {
  const { faculty, saveFaculty, deleteFaculty } = useApp()
  const { user } = useAuth()
  const toast = useToast()
  const [search, setSearch] = useState('')
  const [showEditor, setShowEditor] = useState(false)
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState(EMPTY_FORM)
  const isAdmin = user?.role === 'admin'

  const filteredFaculty = faculty.filter(member => [
    member.name,
    member.qualification,
    ...(member.classes_taught || []),
    ...(member.subjects || []),
  ].join(' ').toLowerCase().includes(search.trim().toLowerCase()))

  const openEditor = member => {
    setDraft(member ? {
      id: member.id,
      name: member.name,
      qualification: member.qualification,
      classes_taught: (member.classes_taught || []).join(', '),
      subjects: (member.subjects || []).join(', '),
    } : EMPTY_FORM)
    setShowEditor(true)
  }

  const handleSave = async event => {
    event.preventDefault()
    const entry = {
      ...draft,
      name: draft.name.trim(),
      qualification: draft.qualification.trim(),
      classes_taught: splitValues(draft.classes_taught),
      subjects: splitValues(draft.subjects),
    }
    if (!entry.name || !entry.qualification || !entry.classes_taught.length || !entry.subjects.length) {
      toast('Complete all faculty details before saving.', 'warning')
      return
    }

    setSaving(true)
    try {
      await saveFaculty(entry)
      setShowEditor(false)
      toast('Faculty details saved.', 'success')
    } catch (error) {
      toast(`Could not save faculty details: ${error.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async member => {
    if (!window.confirm(`Remove ${member.name} from the faculty directory?`)) return
    try {
      await deleteFaculty(member.id)
      toast('Faculty member removed.', 'success')
    } catch (error) {
      toast(`Could not remove faculty member: ${error.message}`, 'error')
    }
  }

  return (
    <div className="min-w-0 space-y-5 sm:space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-cyan-100 text-cyan-700">
            <GraduationCap size={24} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">Faculty Directory</h1>
            <p className="mt-1 text-sm text-gray-500">{faculty.length} faculty member{faculty.length === 1 ? '' : 's'}</p>
          </div>
        </div>
        {isAdmin && (
          <button type="button" onClick={() => openEditor(null)} className="btn-primary">
            <Plus size={17} /> Add faculty
          </button>
        )}
      </div>

      <div className="relative max-w-xl">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={event => setSearch(event.target.value)}
          placeholder="Search faculty, class, or subject"
          aria-label="Search faculty, class, or subject"
          className="input search-input faculty-search-input"
        />
      </div>

      {filteredFaculty.length === 0 ? (
        <div className="card py-12 text-center">
          <Users size={32} className="mx-auto mb-2 text-gray-300" />
          <p className="font-medium text-gray-700">{faculty.length ? 'No matching faculty' : 'No faculty listed yet'}</p>
          <p className="mt-1 text-sm text-gray-500">{faculty.length ? 'Try a different search.' : isAdmin ? 'Add faculty details to publish them for students.' : 'The faculty directory has not been published yet.'}</p>
        </div>
      ) : (
        <div className="grid min-w-0 gap-3 lg:grid-cols-2">
          {filteredFaculty.map(member => (
            <article key={member.id} className="card min-w-0 border border-gray-200 p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                    <GraduationCap size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="wrap-break-word font-semibold text-gray-900">{member.name}</h2>
                    <p className="mt-0.5 wrap-break-word text-sm text-gray-500">{member.qualification}</p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex shrink-0 items-center gap-1">
                    <button type="button" onClick={() => openEditor(member)} aria-label={`Edit ${member.name}`} title="Edit faculty" className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-cyan-700">
                      <Pencil size={16} />
                    </button>
                    <button type="button" onClick={() => handleDelete(member)} aria-label={`Remove ${member.name}`} title="Remove faculty" className="inline-flex items-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-700">
                      <Trash2 size={15} /> <span>Remove</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-4 grid gap-3 border-t border-gray-100 pt-3 sm:grid-cols-2">
                <div className="min-w-0">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-400"><Users size={14} /> Classes taught</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(member.classes_taught || []).map(item => <span key={item} className="max-w-full wrap-break-word rounded-md bg-cyan-50 px-2 py-1 text-xs text-cyan-800">{item}</span>)}
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-400"><BookOpen size={14} /> Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(member.subjects || []).map(item => <span key={item} className="max-w-full wrap-break-word rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-800">{item}</span>)}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={showEditor} onClose={() => setShowEditor(false)} title={draft.id ? 'Edit faculty details' : 'Add faculty'}>
        <form onSubmit={handleSave} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Faculty name
            <input required value={draft.name} onChange={event => setDraft(previous => ({ ...previous, name: event.target.value }))} placeholder="Full name" className="input mt-1.5" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Qualification
            <input required value={draft.qualification} onChange={event => setDraft(previous => ({ ...previous, qualification: event.target.value }))} placeholder="e.g. M.Sc., Ph.D." className="input mt-1.5" />
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Classes taught
            <input required value={draft.classes_taught} onChange={event => setDraft(previous => ({ ...previous, classes_taught: event.target.value }))} placeholder="e.g. B.Sc. Year 2, B.Sc. Year 3" className="input mt-1.5" />
            <span className="mt-1 block text-xs font-normal text-gray-400">Separate multiple classes with commas.</span>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Subjects
            <input required value={draft.subjects} onChange={event => setDraft(previous => ({ ...previous, subjects: event.target.value }))} placeholder="e.g. Biology, Genetics" className="input mt-1.5" />
            <span className="mt-1 block text-xs font-normal text-gray-400">Separate multiple subjects with commas.</span>
          </label>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowEditor(false)} className="btn-secondary flex-1 justify-center">Cancel</button>
            <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center disabled:opacity-60">{saving ? 'Saving...' : 'Save faculty'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
