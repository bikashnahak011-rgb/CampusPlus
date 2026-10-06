import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BookOpen, FileText, Image, Link as LinkIcon, Search, Download, Eye,
  Upload, Trash2, Pencil, Check, ChevronLeft, ChevronRight, Filter,
  ShieldCheck, ClipboardList, CalendarDays,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/States'
import Modal from '../../components/ui/Modal'
import { supabase } from '../../lib/supabase'
import { DEMO_ACADEMIC_RESOURCES } from '../../data/demoData'
import { isPdfAssignmentFile } from '../../lib/academicResources'
import SamplePreviewNotice from '../../components/ui/SamplePreviewNotice'

const BUCKET = 'academic-resources'
const PAGE_SIZE = 9
const CATEGORIES = {
  syllabus: { title: 'Syllabus', description: 'Find approved course syllabi by department, course, semester, and academic year.', icon: BookOpen },
  pyq: { title: 'Previous Year Questions', description: 'Browse past examination papers and practice by subject and year.', icon: FileText },
  class_material: { title: 'Class Material', description: 'Access lecture notes, presentations, handouts, and useful links.', icon: ClipboardList },
  assignment: { title: 'Assignments', description: 'Browse and publish assignment PDFs organized by subject, course, and semester.', icon: ClipboardList },
}
const YEARS = Array.from({ length: 12 }, (_, i) => String(new Date().getFullYear() - i))
const EMPTY_FORM = {
  title: '', description: '', department: '', course: '', semester: '',
  subject: '', academic_year: '', faculty_id: '', faculty_name: '',
  question_year: '', examination_type: '', link_url: '', file_type: '',
}

function inputClass() {
  return 'w-full rounded-xl border border-violet-100 bg-white px-3 py-2.5 text-sm text-gray-800 outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100'
}

function displayDate(value) {
  return value ? new Date(value).toLocaleDateString() : '—'
}

function fileIcon(resource) {
  if (resource.link_url) return LinkIcon
  if (resource.file_type?.startsWith('image/')) return Image
  return resource.resource_type === 'syllabus' ? BookOpen : FileText
}

function fileExtension(file) {
  return file?.name?.split('.').pop()?.toLowerCase() || ''
}

function safeFileName(name) {
  return name.replace(/[^\w.-]+/g, '-').replace(/-+/g, '-').slice(-120) || 'resource'
}

export default function AcademicResources({ resourceType }) {
  const { user } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const isAdmin = user?.admin_role === 'main_administrator'
  const isFaculty = user?.admin_role === 'faculty'
  const canViewSamplePreview = user?.role === 'student' && !user?.isDemo
  const canManage = (isAdmin || isFaculty) && !user?.isDemo
  const overview = !resourceType
  const category = resourceType ? CATEGORIES[resourceType] : null
  const [loadedResources, setLoadedResources] = useState([])
  const [assignments, setAssignments] = useState([])
  const [facultyProfiles, setFacultyProfiles] = useState([])
  const [assignmentError, setAssignmentError] = useState('')
  const [loading, setLoading] = useState(Boolean(supabase) && !user?.isDemo)
  const [forceSamplePreview, setForceSamplePreview] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState({ department: '', course: '', semester: '', subject: '', year: '', examination_type: '', faculty: '' })
  const [page, setPage] = useState(1)
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(null)
  const [permissionForm, setPermissionForm] = useState({ faculty_id: '', department: '', course: '', semester: '', subject: '' })
  const [permissionBusy, setPermissionBusy] = useState(false)
  const sampleResources = useMemo(() => DEMO_ACADEMIC_RESOURCES.filter(resource =>
    (!resourceType || resource.resource_type === resourceType)
    && (user?.isDemo || (canViewSamplePreview && forceSamplePreview)),
  ), [resourceType, user?.isDemo, canViewSamplePreview, forceSamplePreview])
  const resources = useMemo(
    () => user?.isDemo ? sampleResources : [...loadedResources, ...sampleResources],
    [user?.isDemo, loadedResources, sampleResources],
  )

  const load = useCallback(async () => {
    if (user?.isDemo) return
    if (!supabase) {
      setError('')
      setLoadedResources([])
      setLoading(false)
      return
    }
    let query = supabase.from('academic_resources').select('*').order('created_at', { ascending: false })
    if (resourceType) query = query.eq('resource_type', resourceType)
    const { data, error: queryError } = await query
    if (queryError) {
      setError('')
      setLoadedResources([])
    } else {
      setError('')
      setLoadedResources(data || [])
    }
    setLoading(false)
  }, [resourceType, user?.isDemo])

  const loadAssignments = useCallback(async () => {
    if (!canManage || !supabase) return
    const assignmentResult = await supabase.from('faculty_subjects').select('*').order('department').order('subject')
    if (assignmentResult.error) {
      setAssignmentError(`Could not load faculty subject permissions: ${assignmentResult.error.message}`)
      return
    }
    setAssignmentError('')
    setAssignments(assignmentResult.data || [])
    if (isAdmin) {
      const facultyResult = await supabase.from('profiles').select('id,name,email,department').eq('role', 'admin').eq('admin_role', 'faculty').order('name')
      if (facultyResult.error) {
        setAssignmentError(`Could not load faculty accounts: ${facultyResult.error.message}`)
        return
      }
      setAssignmentError('')
      setFacultyProfiles(facultyResult.data || [])
    }
  }, [canManage, isAdmin])

  useEffect(() => { load() }, [load])
  useEffect(() => { loadAssignments() }, [loadAssignments])

  const filtered = useMemo(() => resources.filter(item => {
    const text = `${item.title} ${item.description || ''} ${item.subject || ''} ${item.course || ''}`.toLowerCase()
    return (!search || text.includes(search.toLowerCase()))
      && (!filters.department || item.department === filters.department)
      && (!filters.course || item.course === filters.course)
      && (!filters.semester || String(item.semester) === filters.semester)
      && (!filters.subject || item.subject === filters.subject)
      && (!filters.year || String(item.question_year || '').includes(filters.year))
      && (!filters.examination_type || item.examination_type === filters.examination_type)
      && (!filters.faculty || item.faculty_name === filters.faculty)
  }), [resources, search, filters])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const visibleResources = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
  const distinct = key => [...new Set(resources.map(item => item[key]).filter(value => value !== null && value !== undefined && value !== ''))].sort()

  const showEditor = item => {
    setEditing(item || null)
    setForm(item ? {
      ...EMPTY_FORM,
      title: item.title || '',
      description: item.description || '',
      department: item.department || '',
      course: item.course || '',
      semester: item.semester ? String(item.semester) : '',
      subject: item.subject || '',
      academic_year: item.academic_year || '',
      faculty_id: item.faculty_id || '',
      faculty_name: item.faculty_name || (isFaculty ? user?.name : ''),
      question_year: item.question_year ? String(item.question_year) : '',
      examination_type: item.examination_type || '',
      link_url: item.link_url || '',
      file_type: item.file_type || '',
    } : {
      ...EMPTY_FORM,
      department: user?.department || '',
      course: user?.branch || '',
      semester: user?.semester ? String(user.semester) : '',
      faculty_id: isFaculty ? user.id : '',
      faculty_name: user?.name || '',
    })
    setFile(null)
    setFormOpen(true)
  }

  const updateForm = (key, value) => setForm(current => ({ ...current, [key]: value }))

  const saveResource = async event => {
    event.preventDefault()
    if (!supabase || saving) return
    const targetType = editing?.resource_type || resourceType
    if (!form.title.trim() || !form.department.trim() || !form.semester || !form.subject.trim()) {
      toast('Missing information', 'Title, department, semester, and subject are required.', 'warning')
      return
    }
    if (!editing && !file && !form.link_url.trim() && !(targetType === 'class_material' && form.file_type === 'note')) {
      toast('Add content', 'Choose a file, provide a link, or select Notes as the material type.', 'warning')
      return
    }
    if (targetType === 'assignment' && !isPdfAssignmentFile(
      file || { name: editing?.file_name, type: editing?.file_type },
    )) {
      toast('PDF required', 'Assignments must include a PDF file.', 'warning')
      return
    }

    setSaving(true)
    let uploadedPath = null
    try {
      let nextPath = editing?.file_url || null
      let nextName = editing?.file_name || null
      let nextType = editing?.file_type || (form.file_type === 'note' ? 'note' : null)
      if (file) {
        const path = `${targetType}/${user.id}/${crypto.randomUUID()}-${safeFileName(file.name)}`
        const { error: uploadError } = await supabase.storage.from(BUCKET).upload(path, file, {
          cacheControl: '3600',
          contentType: file.type || undefined,
          upsert: false,
        })
        if (uploadError) throw uploadError
        uploadedPath = path
        nextPath = path
        nextName = file.name
        nextType = file.type || fileExtension(file)
      }

      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        resource_type: targetType,
        department: form.department.trim(),
        course: form.course.trim() || null,
        semester: Number(form.semester),
        subject: form.subject.trim(),
        academic_year: form.academic_year.trim() || null,
        faculty_id: isFaculty ? user.id : form.faculty_id || null,
        faculty_name: form.faculty_name.trim() || (isFaculty ? user.name : null),
        file_url: nextPath,
        file_name: nextName,
        file_type: nextType,
        link_url: form.link_url.trim() || null,
        question_year: targetType === 'pyq' && form.question_year ? Number(form.question_year) : null,
        examination_type: targetType === 'pyq' ? form.examination_type || null : null,
        status: isAdmin ? (editing?.status || 'approved') : 'pending',
        updated_at: new Date().toISOString(),
      }

      const result = editing
        ? await supabase.from('academic_resources').update(payload).eq('id', editing.id).select().single()
        : await supabase.from('academic_resources').insert({ ...payload, uploaded_by: user.id }).select().single()
      if (result.error) throw result.error

      if (uploadedPath && editing?.file_url && editing.file_url !== uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([editing.file_url])
        if (cleanupError) toast('Saved with a cleanup warning', cleanupError.message, 'warning')
      }
      toast(editing ? 'Resource updated' : 'Resource uploaded', isAdmin ? 'Changes are available to students.' : 'The resource is awaiting main administrator approval.', 'success')
      setFormOpen(false)
      await load()
    } catch (saveError) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from(BUCKET).remove([uploadedPath])
        if (cleanupError) console.error('Could not remove unlinked academic resource upload:', cleanupError.message)
      }
      toast('Could not save resource', saveError.message || 'Supabase rejected the operation.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const changeStatus = async (resource, status) => {
    const { error: statusError } = await supabase.from('academic_resources').update({ status, updated_at: new Date().toISOString() }).eq('id', resource.id)
    if (statusError) toast('Could not update approval', statusError.message, 'error')
    else {
      toast(status === 'approved' ? 'Resource approved' : 'Approval updated', resource.title, 'success')
      await load()
    }
  }

  const deleteResource = async resource => {
    if (!window.confirm(`Delete "${resource.title}"? This cannot be undone.`)) return
    if (resource.file_url) {
      const { error: storageError } = await supabase.storage.from(BUCKET).remove([resource.file_url])
      if (storageError) {
        toast('Could not delete file', storageError.message, 'error')
        return
      }
    }
    const { error: deleteError } = await supabase.from('academic_resources').delete().eq('id', resource.id)
    if (deleteError) toast('Could not delete resource', deleteError.message, 'error')
    else {
      toast('Resource deleted', resource.title, 'success')
      await load()
    }
  }

  const getFileBlob = async resource => {
    if (!supabase || !resource.file_url) return null
    const { data, error: downloadError } = await supabase.storage.from(BUCKET).download(resource.file_url)
    if (downloadError) throw downloadError
    return data
  }

  const previewResource = async resource => {
    if (resource.link_url) {
      window.open(resource.link_url, '_blank', 'noopener,noreferrer')
      return
    }
    if (resource.file_type === 'note') {
      setPreview({ resource, note: true })
      return
    }
    try {
      const blob = await getFileBlob(resource)
      if (!blob) {
        toast('Preview unavailable', 'This resource has no attached file.', 'warning')
        return
      }
      const objectUrl = URL.createObjectURL(blob)
      const extension = resource.file_name?.split('.').pop()?.toLowerCase()
      const image = resource.file_type?.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'gif'].includes(extension)
      const pdf = resource.file_type === 'application/pdf' || extension === 'pdf'
      setPreview({ resource, objectUrl, image, pdf })
    } catch (previewError) {
      toast('Could not preview resource', previewError.message, 'error')
    }
  }

  const downloadResource = async resource => {
    if (resource.link_url) {
      window.open(resource.link_url, '_blank', 'noopener,noreferrer')
      return
    }
    try {
      const blob = resource.file_type === 'note'
        ? new Blob([resource.description || ''], { type: 'text/plain;charset=utf-8' })
        : await getFileBlob(resource)
      if (!blob) throw new Error('This resource has no attached file.')
      const objectUrl = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = objectUrl
      link.download = resource.file_type === 'note'
        ? `${resource.title}.txt`
        : resource.file_name || resource.title
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000)
    } catch (downloadError) {
      toast('Could not download resource', downloadError.message, 'error')
    }
  }

  const addFacultyAssignment = async event => {
    event.preventDefault()
    if (!supabase || permissionBusy) return
    setPermissionBusy(true)
    const { error: insertError } = await supabase.from('faculty_subjects').insert({
      faculty_id: permissionForm.faculty_id,
      department: permissionForm.department.trim(),
      course: permissionForm.course.trim(),
      semester: Number(permissionForm.semester),
      subject: permissionForm.subject.trim(),
    })
    if (insertError) toast('Could not assign subject', insertError.message, 'error')
    else {
      toast('Faculty permission assigned', permissionForm.subject, 'success')
      setPermissionForm({ faculty_id: '', department: '', course: '', semester: '', subject: '' })
      await loadAssignments()
    }
    setPermissionBusy(false)
  }

  const removeFacultyAssignment = async assignment => {
    const { error: deleteError } = await supabase.from('faculty_subjects').delete().eq('id', assignment.id)
    if (deleteError) toast('Could not remove permission', deleteError.message, 'error')
    else {
      toast('Faculty permission removed', assignment.subject, 'success')
      await loadAssignments()
    }
  }

  useEffect(() => () => {
    if (preview?.objectUrl) URL.revokeObjectURL(preview.objectUrl)
  }, [preview])

  if (!overview && !category) return <ErrorState message="This academic resource category does not exist." />

  const Icon = category?.icon || BookOpen
  const setFilter = (key, value) => {
    setPage(1)
    setFilters(current => ({ ...current, [key]: value }))
  }
  const selectFilter = (key, label, options) => (
    <select className={inputClass()} aria-label={label} value={filters[key]} onChange={event => setFilter(key, event.target.value)}>
      <option value="">All {label}</option>
      {options.map(value => <option key={value} value={value}>{value}</option>)}
    </select>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700"><Icon size={21} /></span>
            <h1 className="text-2xl font-bold text-gray-900">{category?.title || 'Academic Management'}</h1>
          </div>
          <p className="mt-2 text-sm text-gray-500">{category?.description || 'Manage and review the campus academic resource library.'}</p>
        </div>
        {canManage && !overview && (
          <button onClick={() => showEditor()} className="primary-button">
            <Upload size={16} /> Add {category.title}
          </button>
        )}
        {user?.role === 'student' && (
          <button type="button" onClick={() => navigate('/student/timetable')} className="secondary-button">
            <CalendarDays size={16} /> View timetable
          </button>
        )}
      </div>
      {user?.isDemo && <p className="rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-800">Demo mode · showing sample academic resources. Sample entries do not include downloadable PDFs.</p>}
      {canViewSamplePreview && <div className="flex flex-wrap items-start justify-between gap-3">
        {forceSamplePreview && resources.some(resource => resource.demo_sample) && <SamplePreviewNotice>Examples are shown alongside published campus resources. Sample PDF entries are illustrative only and do not have downloadable files; sample class notes can be previewed and downloaded.</SamplePreviewNotice>}
        <button type="button" onClick={() => setForceSamplePreview(value => !value)} className="shrink-0 rounded-lg border border-violet-300 bg-white px-3 py-2 text-xs font-semibold text-violet-800">
          {forceSamplePreview ? 'Hide sample resources' : 'Show sample resources'}
        </button>
      </div>}

      {overview && isAdmin && (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Object.entries(CATEGORIES).map(([type, item]) => {
            const CategoryIcon = item.icon
            return (
              <button key={type} onClick={() => navigate(type === 'assignment' ? '/admin/assignments' : `/admin/academic-resources/${type === 'class_material' ? 'class-material' : type}`)} className="card flex items-center gap-4 text-left hover:border-violet-200">
                <span className="rounded-xl bg-violet-100 p-3 text-violet-700"><CategoryIcon size={21} /></span>
                <span><strong className="block text-2xl text-gray-900">{resources.filter(resource => resource.resource_type === type).length}</strong><span className="text-sm text-gray-500">Total {item.title}</span></span>
              </button>
            )
          })}
          <button onClick={() => navigate('/admin/timetable')} className="card flex items-center gap-4 text-left hover:border-violet-200">
            <span className="rounded-xl bg-violet-100 p-3 text-violet-700"><CalendarDays size={21} /></span>
            <span><strong className="block text-2xl text-gray-900">Timetable</strong><span className="text-sm text-gray-500">Manage weekly schedule</span></span>
          </button>
        </div>
      )}

      {overview && isAdmin && !user?.isDemo && (
        <section className="card space-y-4">
          <div className="flex items-center gap-2"><ShieldCheck size={19} className="text-violet-700" /><h2 className="font-semibold text-gray-900">Faculty subject permissions</h2></div>
          <p className="text-sm text-gray-500">A faculty member can upload resources and manage timetable entries only for assigned department, course, semester, and subject combinations.</p>
          {assignmentError && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{assignmentError}</p>}
          <form onSubmit={addFacultyAssignment} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <select required className={inputClass()} value={permissionForm.faculty_id} onChange={event => setPermissionForm({ ...permissionForm, faculty_id: event.target.value })}>
              <option value="">Select faculty</option>
              {facultyProfiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name} — {profile.email}</option>)}
            </select>
            {['department', 'course', 'semester', 'subject'].map(key => (
              <input key={key} required className={inputClass()} placeholder={key === 'semester' ? 'Semester' : key[0].toUpperCase() + key.slice(1)} type={key === 'semester' ? 'number' : 'text'} min={key === 'semester' ? 1 : undefined} max={key === 'semester' ? 12 : undefined} value={permissionForm[key]} onChange={event => setPermissionForm({ ...permissionForm, [key]: event.target.value })} />
            ))}
            <button disabled={permissionBusy} className="primary-button justify-center">{permissionBusy ? 'Saving…' : 'Assign subject'}</button>
          </form>
          <div className="space-y-2">
            {assignments.length === 0 ? <EmptyState message="No faculty subject permissions have been assigned." icon={ShieldCheck} /> : assignments.map(assignment => (
              <div key={assignment.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-violet-50 px-3 py-2.5 text-sm">
                <span className="text-gray-700">{facultyProfiles.find(person => person.id === assignment.faculty_id)?.name || 'Faculty'} · {assignment.department} · {assignment.course} · Semester {assignment.semester} · {assignment.subject}</span>
                <button onClick={() => removeFacultyAssignment(assignment)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" aria-label={`Remove ${assignment.subject} permission`}><Trash2 size={15} /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      {!overview && (
        <>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="relative block">
              <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input className={`${inputClass()} search-input`} placeholder="Search by title, subject, or course…" value={search} onChange={event => { setPage(1); setSearch(event.target.value) }} />
            </label>
            <div className="flex items-center gap-2 text-sm text-gray-500"><Filter size={16} />{filtered.length} resource{filtered.length === 1 ? '' : 's'} found</div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {selectFilter('department', 'Departments', distinct('department'))}
            {resourceType === 'syllabus' ? selectFilter('course', 'Courses', distinct('course')) : selectFilter('semester', 'Semesters', distinct('semester'))}
            {resourceType !== 'syllabus' && selectFilter('subject', 'Subjects', distinct('subject'))}
            {resourceType === 'pyq' ? (
              <>
                <select className={inputClass()} aria-label="Examination year" value={filters.year} onChange={event => setFilter('year', event.target.value)}>
                  <option value="">All Years</option>
                  {distinct('question_year').map(value => <option key={value} value={value}>{value}</option>)}
                </select>
                {selectFilter('examination_type', 'Examination types', distinct('examination_type'))}
              </>
            ) : resourceType === 'class_material' ? selectFilter('faculty', 'Faculty', distinct('faculty_name')) : (
              <>
                {selectFilter('semester', 'Semesters', distinct('semester'))}
                {selectFilter('year', 'Academic years', distinct('academic_year'))}
              </>
            )}
          </div>
        </>
      )}

      {loading ? <LoadingState message="Loading academic resources…" /> : error ? <ErrorState message={error} onRetry={load} /> : overview ? (
        <section className="card">
          <h2 className="mb-3 font-semibold text-gray-900">Recent submissions</h2>
          {resources.length === 0 ? <EmptyState message="No academic resources have been uploaded yet." icon={BookOpen} /> : (
            <div className="space-y-2">
              {resources.slice(0, 8).map(resource => (
                <div key={resource.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 p-3">
                  <div className="min-w-0"><p className="font-medium text-gray-900">{resource.title}</p><p className="text-xs text-gray-500">{CATEGORIES[resource.resource_type]?.title} · {resource.department} · {resource.subject || '—'} · {displayDate(resource.created_at)}</p></div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-xs ${resource.status === 'approved' ? 'bg-green-50 text-green-700' : resource.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{resource.status}</span>
                    {canManage && resource.status !== 'approved' && <button onClick={() => changeStatus(resource, 'approved')} className="rounded-lg p-2 text-green-700 hover:bg-green-50" title="Approve"><Check size={16} /></button>}
                    {canManage && (isAdmin || (isFaculty && resource.uploaded_by === user?.id && resource.faculty_id === user?.id)) && <>
                      <button onClick={() => showEditor(resource)} className="rounded-lg p-2 text-violet-700 hover:bg-violet-50" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => deleteResource(resource)} className="rounded-lg p-2 text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                    </>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState message={resources.length ? 'No resources match these filters.' : `No approved ${category.title.toLowerCase()} are available yet.`} icon={Icon} /></div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {visibleResources.map(resource => {
              const ResourceIcon = fileIcon(resource)
              const facultyCanManage = canManage && isFaculty && resource.uploaded_by === user?.id && resource.faculty_id === user?.id
              const adminCanManage = canManage && isAdmin
              return (
                <article key={resource.id} className="card flex h-full flex-col">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <span className="rounded-xl bg-violet-100 p-3 text-violet-700"><ResourceIcon size={20} /></span>
                    <div className="flex items-center gap-2">
                      {resource.demo_sample && <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-800">Sample</span>}
                      {canManage && <span className={`rounded-full px-2.5 py-1 text-xs ${resource.status === 'approved' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>{resource.status}</span>}
                    </div>
                  </div>
                  <h2 className="line-clamp-2 font-semibold text-gray-900">{resource.title}</h2>
                  <p className="mt-1 line-clamp-2 min-h-10 text-sm text-gray-500">{resource.description || resource.file_name || 'Academic resource'}{resource.demo_sample ? ' · Sample record; no real file attached.' : ''}</p>
                  <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                    <div><dt className="text-gray-400">Subject</dt><dd className="mt-0.5 truncate font-medium text-gray-700">{resource.subject || '—'}</dd></div>
                    <div><dt className="text-gray-400">Semester</dt><dd className="mt-0.5 font-medium text-gray-700">{resource.semester || '—'}</dd></div>
                    <div><dt className="text-gray-400">Department</dt><dd className="mt-0.5 truncate font-medium text-gray-700">{resource.department}</dd></div>
                    <div><dt className="text-gray-400">{resourceType === 'pyq' ? 'Exam year' : 'Academic year'}</dt><dd className="mt-0.5 font-medium text-gray-700">{resource.question_year || resource.academic_year || '—'}</dd></div>
                    <div className="col-span-2"><dt className="text-gray-400">Uploaded</dt><dd className="mt-0.5 font-medium text-gray-700">{displayDate(resource.created_at)}</dd></div>
                  </dl>
                  {resourceType === 'pyq' && resource.examination_type && <span className="mt-2 w-fit rounded-full bg-violet-50 px-2.5 py-1 text-xs text-violet-700">{resource.examination_type}</span>}
                  <div className="mt-auto flex flex-wrap gap-2 pt-4">
                    <button onClick={() => previewResource(resource)} disabled={resource.demo_sample && resource.file_type !== 'note'} className="secondary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"><Eye size={15} /> Preview</button>
                    <button onClick={() => downloadResource(resource)} disabled={resource.demo_sample && resource.file_type !== 'note'} className="secondary-button flex-1 justify-center disabled:cursor-not-allowed disabled:opacity-50"><Download size={15} /> Download</button>
                    {(facultyCanManage || adminCanManage) && <>
                      {canManage && isAdmin && resource.status !== 'approved' && <button onClick={() => changeStatus(resource, 'approved')} className="rounded-xl border border-green-200 px-3 py-2 text-sm text-green-700 hover:bg-green-50" title="Approve"><Check size={16} /></button>}
                      <button onClick={() => showEditor(resource)} className="rounded-xl border border-violet-100 px-3 py-2 text-sm text-violet-700 hover:bg-violet-50" title="Edit"><Pencil size={16} /></button>
                      <button onClick={() => deleteResource(resource)} className="rounded-xl border border-red-100 px-3 py-2 text-sm text-red-600 hover:bg-red-50" title="Delete"><Trash2 size={16} /></button>
                    </>}
                  </div>
                </article>
              )
            })}
          </div>
          {pageCount > 1 && <div className="flex items-center justify-center gap-3">
            <button disabled={currentPage <= 1} onClick={() => setPage(currentPage - 1)} className="secondary-button disabled:opacity-40"><ChevronLeft size={16} /> Previous</button>
            <span className="text-sm text-gray-500">Page {currentPage} of {pageCount}</span>
            <button disabled={currentPage >= pageCount} onClick={() => setPage(currentPage + 1)} className="secondary-button disabled:opacity-40">Next <ChevronRight size={16} /></button>
          </div>}
        </>
      )}

      <Modal isOpen={formOpen} onClose={() => setFormOpen(false)} title={`${editing ? 'Edit' : 'Add'} ${category?.title || 'resource'}`} size="lg">
        <form onSubmit={saveResource} className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs text-gray-500 sm:col-span-2">Title<input required className={inputClass()} value={form.title} onChange={event => updateForm('title', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Department<input required className={inputClass()} value={form.department} onChange={event => updateForm('department', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Course<input className={inputClass()} value={form.course} onChange={event => updateForm('course', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Semester<input required className={inputClass()} type="number" min="1" max="12" value={form.semester} onChange={event => updateForm('semester', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500">Subject{isFaculty ? (
            <select required className={inputClass()} value={assignments.find(item => item.department === form.department && item.course === form.course && String(item.semester) === form.semester && item.subject === form.subject)?.id || ''} onChange={event => {
              const assignment = assignments.find(item => item.id === event.target.value)
              if (assignment) setForm(current => ({ ...current, department: assignment.department, course: assignment.course, semester: String(assignment.semester), subject: assignment.subject }))
            }}>
              <option value="">Select an assigned subject</option>
              {assignments.map(item => <option key={item.id} value={item.id}>{item.subject} · {item.department} · {item.course} · Semester {item.semester}</option>)}
            </select>
          ) : <input required className={inputClass()} value={form.subject} onChange={event => updateForm('subject', event.target.value)} />}</label>
          <label className="space-y-1 text-xs text-gray-500">Academic year<input className={inputClass()} placeholder="2026-2027" value={form.academic_year} onChange={event => updateForm('academic_year', event.target.value)} /></label>
          {isAdmin && <label className="space-y-1 text-xs text-gray-500">Assigned faculty<select className={inputClass()} value={form.faculty_id} onChange={event => {
            const faculty = facultyProfiles.find(person => person.id === event.target.value)
            setForm(current => ({ ...current, faculty_id: event.target.value, faculty_name: faculty?.name || '' }))
          }}><option value="">Not assigned</option>{facultyProfiles.map(person => <option key={person.id} value={person.id}>{person.name} · {person.department || person.email}</option>)}</select></label>}
          {isAdmin && <label className="space-y-1 text-xs text-gray-500">Faculty display name<input className={inputClass()} value={form.faculty_name} onChange={event => updateForm('faculty_name', event.target.value)} /></label>}
          {resourceType === 'pyq' && <>
            <label className="space-y-1 text-xs text-gray-500">Examination year<select required className={inputClass()} value={form.question_year} onChange={event => updateForm('question_year', event.target.value)}><option value="">Select year</option>{YEARS.map(year => <option key={year} value={year}>{year}</option>)}</select></label>
            <label className="space-y-1 text-xs text-gray-500">Examination type<select className={inputClass()} value={form.examination_type} onChange={event => updateForm('examination_type', event.target.value)}><option value="">Select type</option>{['Midterm', 'End Semester', 'Supplementary', 'Entrance', 'Other'].map(type => <option key={type} value={type}>{type}</option>)}</select></label>
          </>}
          {resourceType === 'class_material' && <label className="space-y-1 text-xs text-gray-500">Material kind<select className={inputClass()} value={form.file_type === 'note' ? 'note' : 'file'} onChange={event => updateForm('file_type', event.target.value === 'note' ? 'note' : '')}><option value="file">Document or image</option><option value="note">Notes (text)</option></select></label>}
          <label className="space-y-1 text-xs text-gray-500 sm:col-span-2">Description<textarea rows="3" className={inputClass()} value={form.description} onChange={event => updateForm('description', event.target.value)} /></label>
          <label className="space-y-1 text-xs text-gray-500 sm:col-span-2">Attach {resourceType === 'assignment' ? 'PDF file' : 'file'} {editing?.file_name && <span className="text-violet-700">· Current: {editing.file_name}</span>}<input required={resourceType === 'assignment' && !editing?.file_url} className={inputClass()} type="file" accept={resourceType === 'assignment' ? '.pdf,application/pdf' : '.pdf,.ppt,.pptx,.doc,.docx,image/*'} onChange={event => setFile(event.target.files?.[0] || null)} /></label>
          {resourceType === 'class_material' && <label className="space-y-1 text-xs text-gray-500 sm:col-span-2">Or external link<input className={inputClass()} type="url" placeholder="https://…" value={form.link_url} onChange={event => updateForm('link_url', event.target.value)} /></label>}
          <p className="text-xs text-gray-500 sm:col-span-2">{isFaculty ? 'Your submission will be reviewed by a main administrator before students can see it.' : 'Main administrator uploads are immediately approved unless editing a pending submission.'}</p>
          <div className="flex justify-end gap-2 sm:col-span-2"><button type="button" className="secondary-button" onClick={() => setFormOpen(false)}>Cancel</button><button disabled={saving} className="primary-button">{saving ? 'Saving…' : 'Save resource'}</button></div>
        </form>
      </Modal>

      <Modal isOpen={Boolean(preview)} onClose={() => setPreview(null)} title={preview?.resource.title || 'Preview'} size="xl">
        {preview?.note ? <div className="whitespace-pre-wrap rounded-xl bg-violet-50 p-4 text-sm text-gray-700">{preview.resource.description || 'No note content.'}</div>
          : preview?.image ? <img src={preview.objectUrl} alt={preview.resource.title} className="mx-auto max-h-[70vh] max-w-full rounded-xl object-contain" />
            : preview?.pdf ? <iframe title={preview.resource.title} src={preview.objectUrl} className="h-[70vh] w-full rounded-xl border border-gray-200" />
              : preview && <div className="space-y-3 rounded-xl bg-violet-50 p-5 text-center">
                <p className="text-sm text-gray-700">This document format cannot be previewed in the browser. Download it to open the file.</p>
                <button onClick={() => downloadResource(preview.resource)} className="primary-button mx-auto"><Download size={15} /> Download file</button>
              </div>}
      </Modal>
    </div>
  )
}
