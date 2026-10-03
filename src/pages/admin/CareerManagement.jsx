import { useCallback, useEffect, useState } from 'react'
import {
  Award, BookOpen, BriefcaseBusiness, Building2, CalendarDays, Check,
  CheckCircle2, FileText, GraduationCap, LoaderCircle, Plus, ShieldCheck,
  Users, XCircle,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../components/ui/Toast'
import { supabase } from '../../lib/supabase'
import { CAREER_CATALOG, OPPORTUNITY_TYPES } from '../../lib/careerHub'

const DEMO_ADMIN_KEY = 'campusplus_career_hub_admin'
const COLLABORATION_TYPES = ['Internship', 'Workshop', 'Training', 'Placement drive', 'Mentorship', 'Industry project', 'Hackathon', 'Guest lecture']
const CONTENT_TABS = [
  { id: 'overview', label: 'Overview', icon: GraduationCap },
  { id: 'companies', label: 'Company verification', icon: Building2 },
  { id: 'opportunities', label: 'Opportunities', icon: BriefcaseBusiness },
  { id: 'workshops', label: 'Workshops', icon: CalendarDays },
  { id: 'content', label: 'Career content', icon: BookOpen },
  { id: 'reviews', label: 'Reviews', icon: ShieldCheck },
]

function readDemo() {
  try {
    return JSON.parse(localStorage.getItem(DEMO_ADMIN_KEY) || 'null') || {}
  } catch {
    return {}
  }
}

function slugify(value) {
  return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function demoCatalog() {
  const paths = CAREER_CATALOG.map(path => ({ id: path.slug, slug: path.slug, title: path.title, category: path.category, summary: path.summary, description: path.description, roadmap: path.roadmap, is_active: true }))
  const skills = CAREER_CATALOG.flatMap(path => path.skills.map((skill, index) => ({ id: `${path.slug}:${skill.slug}`, career_path_id: path.slug, name: skill.name, slug: skill.slug, category: 'technical', why_it_matters: skill.why, topics: skill.topics, sort_order: index + 1 })))
  const projects = CAREER_CATALOG.flatMap(path => path.projects.map(project => ({ ...project, id: `${path.slug}:project:${slugify(project.title)}`, career_path_id: path.slug, description: project.description })))
  return { paths, skills, projects }
}

const EMPTY = { paths: [], skills: [], resources: [], projects: [], companies: [], collaborations: [], opportunities: [], workshops: [], registrations: [], certifications: [], articles: [], studentProfiles: [] }

function AdminStat({ icon: Icon, label, value, tone = 'green' }) {
  return <article className="border border-gray-200 bg-white p-4"><div className={`mb-3 grid h-9 w-9 place-items-center rounded-md ${tone === 'amber' ? 'bg-amber-50 text-amber-700' : tone === 'blue' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}><Icon size={18} /></div><strong className="block text-2xl font-bold text-gray-900">{value}</strong><span className="mt-1 block text-xs text-gray-500">{label}</span></article>
}

function FormField({ label, children, wide = false }) {
  return <label className={`block min-w-0 text-xs font-semibold text-gray-600 ${wide ? 'sm:col-span-2' : ''}`}><span className="mb-1 block">{label}</span>{children}</label>
}

export default function CareerManagement() {
  const { user } = useAuth()
  const toast = useToast()
  const [data, setData] = useState(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tab, setTab] = useState('overview')
  const [busy, setBusy] = useState('')
  const [companyForm, setCompanyForm] = useState({ name: '', website: '', industry: '', description: '', contact_name: '', contact_email: '', collaboration_types: ['Internship'] })
  const [opportunityForm, setOpportunityForm] = useState({ title: '', role: '', opportunity_type: 'Internship', company_id: '', description: '', required_skills: '', eligibility: '', location: '', mode: 'on_campus', deadline: '', application_method: '', application_url: '' })
  const [workshopForm, setWorkshopForm] = useState({ title: '', organizer: 'Campus', company_id: '', description: '', topics: '', starts_at: '', ends_at: '', location: '', registration_deadline: '', capacity: '', certificate_available: false })
  const [pathForm, setPathForm] = useState({ title: '', category: 'Software', summary: '', description: '', roadmap: '' })
  const [skillForm, setSkillForm] = useState({ career_path_id: '', name: '', why_it_matters: '', topics: '' })
  const [resourceForm, setResourceForm] = useState({ career_skill_id: '', title: '', resource_type: 'Documentation', url: '' })
  const [projectForm, setProjectForm] = useState({ career_path_id: '', title: '', difficulty: 'Beginner', description: '', requirements: '' })

  const loadData = useCallback(async () => {
    setError('')
    if (user?.isDemo) {
      const catalog = demoCatalog()
      const saved = readDemo()
      setData({ ...EMPTY, ...catalog, ...saved, studentProfiles: saved.studentProfiles || [] })
      setLoading(false)
      return
    }
    if (!supabase) {
      setError('Career Management requires a configured Supabase connection.')
      setLoading(false)
      return
    }
    try {
      const responses = await Promise.all([
        supabase.from('career_paths').select('*').order('title'),
        supabase.from('career_skills').select('*').order('sort_order'),
        supabase.from('skill_resources').select('*').order('sort_order'),
        supabase.from('career_projects').select('*').order('created_at', { ascending: false }),
        supabase.from('companies').select('*').order('created_at', { ascending: false }),
        supabase.from('company_collaborations').select('*').order('created_at', { ascending: false }),
        supabase.from('career_opportunities').select('*').order('created_at', { ascending: false }),
        supabase.from('workshops').select('*').order('starts_at', { ascending: false }),
        supabase.from('workshop_registrations').select('*').order('registered_at', { ascending: false }),
        supabase.from('certifications').select('*').order('created_at', { ascending: false }),
        supabase.from('career_articles').select('*').order('created_at', { ascending: false }),
        supabase.from('student_career_profiles').select('user_id'),
      ])
      const failed = responses.find(response => response.error)
      if (failed) throw new Error(failed.error.message)
      const [paths, skills, resources, projects, companies, collaborations, opportunities, workshops, registrations, certifications, articles, studentProfiles] = responses.map(response => response.data || [])
      setData({ paths, skills, resources, projects, companies, collaborations, opportunities, workshops, registrations, certifications, articles, studentProfiles })
    } catch (requestError) {
      setError(`Career Management could not load its Supabase data. Apply supabase/career_hub.sql after production_hardening.sql. ${requestError.message}`)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    const timer = setTimeout(() => { void loadData() }, 0)
    return () => clearTimeout(timer)
  }, [loadData])

  function commitDemo(patch) {
    setData(previous => {
      const next = { ...previous, ...patch }
      localStorage.setItem(DEMO_ADMIN_KEY, JSON.stringify(next))
      return next
    })
  }

  async function createCompany(event) {
    event.preventDefault()
    if (!companyForm.collaboration_types.length) { toast('Choose at least one collaboration type.', 'warning'); return }
    setBusy('company-create')
    const company = { ...companyForm, verification_status: 'pending', created_by: user.id, created_at: new Date().toISOString(), id: crypto.randomUUID() }
    delete company.collaboration_types
    const collaborations = companyForm.collaboration_types.map(type => ({ id: crypto.randomUUID(), company_id: company.id, collaboration_type: type, description: '', verification_status: 'pending', created_at: new Date().toISOString() }))
    if (user?.isDemo) {
      commitDemo({ companies: [company, ...data.companies], collaborations: [...collaborations, ...data.collaborations] })
    } else {
      const { data: saved, error: companyError } = await supabase.from('companies').insert(company).select().single()
      if (companyError) { setBusy(''); toast(companyError.message, 'error'); return }
      const collabRows = collaborations.map(item => ({ ...item, company_id: saved.id }))
      const { error: collabError } = await supabase.from('company_collaborations').insert(collabRows)
      if (collabError) { setBusy(''); toast(`Company added, but collaborations need attention: ${collabError.message}`, 'error'); await loadData(); return }
      await loadData()
    }
    setCompanyForm({ name: '', website: '', industry: '', description: '', contact_name: '', contact_email: '', collaboration_types: ['Internship'] })
    setBusy('')
    toast('Company submitted for verification. It is hidden from students until verified.', 'success')
  }

  async function setCompanyStatus(company, status) {
    setBusy(`company-${company.id}`)
    if (user?.isDemo) {
      const companies = data.companies.map(item => item.id === company.id ? { ...item, verification_status: status, verified_by: status === 'verified' ? user.id : null, verified_at: status === 'verified' ? new Date().toISOString() : null } : item)
      const collaborations = data.collaborations.map(item => item.company_id === company.id ? { ...item, verification_status: status } : item)
      commitDemo({ companies, collaborations })
    } else {
      const { error: companyError } = await supabase.from('companies').update({ verification_status: status, verified_by: status === 'verified' ? user.id : null, verified_at: status === 'verified' ? new Date().toISOString() : null, updated_at: new Date().toISOString() }).eq('id', company.id)
      if (companyError) { setBusy(''); toast(companyError.message, 'error'); return }
      const { error: collaborationError } = await supabase.from('company_collaborations').update({ verification_status: status, verified_by: status === 'verified' ? user.id : null, verified_at: status === 'verified' ? new Date().toISOString() : null }).eq('company_id', company.id)
      if (collaborationError) { setBusy(''); toast(collaborationError.message, 'error'); await loadData(); return }
      await loadData()
    }
    setBusy('')
    toast(status === 'verified' ? 'Company and its listed collaborations are verified.' : 'Company visibility has been removed.', 'success')
  }

  async function createOpportunity(event) {
    event.preventDefault()
    setBusy('opportunity-create')
    const opportunity = {
      ...opportunityForm,
      company_id: opportunityForm.company_id || null,
      required_skills: opportunityForm.required_skills.split(',').map(skill => skill.trim()).filter(Boolean),
      deadline: opportunityForm.deadline || null,
      status: 'published',
      created_by: user.id,
      created_at: new Date().toISOString(),
      id: crypto.randomUUID(),
    }
    if (user?.isDemo) commitDemo({ opportunities: [opportunity, ...data.opportunities] })
    else {
      const { error: saveError } = await supabase.from('career_opportunities').insert(opportunity)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setOpportunityForm({ title: '', role: '', opportunity_type: 'Internship', company_id: '', description: '', required_skills: '', eligibility: '', location: '', mode: 'on_campus', deadline: '', application_method: '', application_url: '' })
    setBusy('')
    toast('Opportunity published to the campus board.', 'success')
  }

  async function createWorkshop(event) {
    event.preventDefault()
    setBusy('workshop-create')
    const workshop = {
      ...workshopForm,
      company_id: workshopForm.company_id || null,
      topics: workshopForm.topics.split(',').map(topic => topic.trim()).filter(Boolean),
      starts_at: new Date(workshopForm.starts_at).toISOString(),
      ends_at: workshopForm.ends_at ? new Date(workshopForm.ends_at).toISOString() : null,
      registration_deadline: workshopForm.registration_deadline ? new Date(workshopForm.registration_deadline).toISOString() : null,
      capacity: workshopForm.capacity ? Number(workshopForm.capacity) : null,
      status: 'published',
      created_by: user.id,
      created_at: new Date().toISOString(),
      id: crypto.randomUUID(),
    }
    if (user?.isDemo) commitDemo({ workshops: [workshop, ...data.workshops] })
    else {
      const { error: saveError } = await supabase.from('workshops').insert(workshop)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setWorkshopForm({ title: '', organizer: 'Campus', company_id: '', description: '', topics: '', starts_at: '', ends_at: '', location: '', registration_deadline: '', capacity: '', certificate_available: false })
    setBusy('')
    toast('Workshop published. Students can register from Career Hub.', 'success')
  }

  async function createPath(event) {
    event.preventDefault()
    setBusy('path-create')
    const path = { id: crypto.randomUUID(), slug: slugify(pathForm.title), title: pathForm.title.trim(), category: pathForm.category.trim(), summary: pathForm.summary.trim(), description: pathForm.description.trim(), roadmap: pathForm.roadmap.split('\n').map(stage => stage.trim()).filter(Boolean), is_active: true, created_by: user.id }
    if (!path.slug) { setBusy(''); toast('Add a career title first.', 'warning'); return }
    if (user?.isDemo) commitDemo({ paths: [path, ...data.paths] })
    else {
      const { error: saveError } = await supabase.from('career_paths').insert(path)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setPathForm({ title: '', category: 'Software', summary: '', description: '', roadmap: '' })
    setBusy('')
    toast('Career path added.', 'success')
  }

  async function createSkill(event) {
    event.preventDefault()
    if (!skillForm.career_path_id) { toast('Choose the career path for this skill.', 'warning'); return }
    setBusy('skill-create')
    const skill = { id: crypto.randomUUID(), career_path_id: skillForm.career_path_id, slug: slugify(skillForm.name), name: skillForm.name.trim(), category: 'technical', why_it_matters: skillForm.why_it_matters.trim(), topics: skillForm.topics.split(',').map(topic => topic.trim()).filter(Boolean), sort_order: data.skills.filter(item => item.career_path_id === skillForm.career_path_id).length + 1 }
    if (user?.isDemo) commitDemo({ skills: [skill, ...data.skills] })
    else {
      const { error: saveError } = await supabase.from('career_skills').insert(skill)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setSkillForm({ career_path_id: '', name: '', why_it_matters: '', topics: '' })
    setBusy('')
    toast('Skill added to the career path.', 'success')
  }

  async function createResource(event) {
    event.preventDefault()
    setBusy('resource-create')
    const resource = { id: crypto.randomUUID(), career_skill_id: resourceForm.career_skill_id, title: resourceForm.title.trim(), resource_type: resourceForm.resource_type, url: resourceForm.url.trim(), sort_order: 1 }
    if (user?.isDemo) commitDemo({ resources: [resource, ...data.resources] })
    else {
      const { error: saveError } = await supabase.from('skill_resources').insert(resource)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setResourceForm({ career_skill_id: '', title: '', resource_type: 'Documentation', url: '' })
    setBusy('')
    toast('Learning resource added.', 'success')
  }

  async function createProject(event) {
    event.preventDefault()
    setBusy('project-create')
    const project = { id: crypto.randomUUID(), career_path_id: projectForm.career_path_id, title: projectForm.title.trim(), difficulty: projectForm.difficulty, description: projectForm.description.trim(), requirements: projectForm.requirements.split('\n').map(item => item.trim()).filter(Boolean), created_by: user.id }
    if (user?.isDemo) commitDemo({ projects: [project, ...data.projects] })
    else {
      const { error: saveError } = await supabase.from('career_projects').insert(project)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setProjectForm({ career_path_id: '', title: '', difficulty: 'Beginner', description: '', requirements: '' })
    setBusy('')
    toast('Project brief added.', 'success')
  }

  async function changeListingStatus(table, item, status) {
    setBusy(`${table}-${item.id}`)
    if (user?.isDemo) commitDemo({ [table]: data[table].map(row => row.id === item.id ? { ...row, status } : row) })
    else {
      const { error: saveError } = await supabase.from(table === 'opportunities' ? 'career_opportunities' : table).update({ status, updated_at: new Date().toISOString() }).eq('id', item.id)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setBusy('')
    toast(`Listing ${status}.`, 'success')
  }

  async function setAttendance(registration, status) {
    setBusy(`registration-${registration.id}`)
    if (user?.isDemo) commitDemo({ registrations: data.registrations.map(item => item.id === registration.id ? { ...item, status } : item) })
    else {
      const { error: saveError } = await supabase.from('workshop_registrations').update({ status }).eq('id', registration.id)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setBusy('')
    toast(status === 'attended' ? 'Attendance recorded.' : 'Attendance status updated.', 'success')
  }

  async function reviewRecord(table, item, status) {
    setBusy(`${table}-${item.id}`)
    const values = table === 'certifications'
      ? { verification_status: status, verified_by: user.id, verified_at: new Date().toISOString() }
      : { status, published_at: status === 'published' ? new Date().toISOString() : null }
    if (user?.isDemo) commitDemo({ [table]: data[table].map(row => row.id === item.id ? { ...row, ...values } : row) })
    else {
      const { error: saveError } = await supabase.from(table).update(values).eq('id', item.id)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setBusy('')
    toast(status === 'verified' || status === 'published' ? 'Record approved.' : 'Record rejected.', 'success')
  }

  async function changePathStatus(path) {
    const next = !path.is_active
    setBusy(`path-${path.id}`)
    if (user?.isDemo) commitDemo({ paths: data.paths.map(item => item.id === path.id ? { ...item, is_active: next } : item) })
    else {
      const { error: saveError } = await supabase.from('career_paths').update({ is_active: next, updated_at: new Date().toISOString() }).eq('id', path.id)
      if (saveError) { setBusy(''); toast(saveError.message, 'error'); return }
      await loadData()
    }
    setBusy('')
    toast(next ? 'Career path activated.' : 'Career path hidden from students.', 'success')
  }

  const verifiedCompanies = data.companies.filter(company => company.verification_status === 'verified')
  const pendingCompanies = data.companies.filter(company => company.verification_status === 'pending')
  const pendingCertifications = data.certifications.filter(item => item.verification_status === 'pending')
  const pendingArticles = data.articles.filter(item => item.status === 'pending')
  const activePaths = data.paths.filter(path => path.is_active)

  if (loading) return <div className="flex min-h-64 items-center justify-center gap-2 text-sm text-gray-500"><LoaderCircle size={18} className="animate-spin" />Loading Career Management…</div>
  if (error) return <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><strong>Career Management unavailable.</strong><p className="mt-1">{error}</p></div>

  return (
    <div className="space-y-5">
      <header className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-widest text-emerald-700">CampusOne · Admin</p><h1 className="mt-1 text-2xl font-bold text-gray-900">Career Management</h1><p className="mt-1 max-w-2xl text-sm text-gray-500">Publish campus opportunities, verify partners, and maintain career learning content.</p></div><button type="button" onClick={loadData} className="btn-secondary">Refresh data</button></header>
      <nav className="flex gap-1 overflow-x-auto border-b border-gray-200" aria-label="Career management sections">{CONTENT_TABS.map(({ id, label, icon: Icon }) => <button type="button" key={id} onClick={() => setTab(id)} className={`inline-flex min-h-10 shrink-0 items-center gap-2 border-b-2 px-3 text-xs font-semibold ${tab === id ? 'border-emerald-700 text-emerald-800' : 'border-transparent text-gray-500 hover:text-gray-800'}`}><Icon size={15} />{label}</button>)}</nav>

      {tab === 'overview' && <section className="space-y-4"><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><AdminStat icon={Users} label="Students using Career Hub" value={data.studentProfiles.length} /><AdminStat icon={GraduationCap} label="Active career paths" value={activePaths.length} tone="blue" /><AdminStat icon={CalendarDays} label="Workshop registrations" value={data.registrations.filter(item => item.status === 'registered').length} tone="amber" /><AdminStat icon={BriefcaseBusiness} label="Published opportunities" value={data.opportunities.filter(item => item.status === 'published').length} /><AdminStat icon={Building2} label="Verified campus partners" value={verifiedCompanies.length} tone="blue" /></div><div className="grid gap-3 lg:grid-cols-2"><article className="card"><div className="flex items-center justify-between"><h2 className="font-semibold text-gray-900">Needs review</h2><ShieldCheck size={18} className="text-amber-600" /></div><div className="mt-3 grid grid-cols-3 gap-2 text-center"><div className="rounded-md bg-amber-50 p-3"><strong className="block text-xl">{pendingCompanies.length}</strong><span className="text-xs text-gray-500">companies</span></div><div className="rounded-md bg-amber-50 p-3"><strong className="block text-xl">{pendingCertifications.length}</strong><span className="text-xs text-gray-500">certifications</span></div><div className="rounded-md bg-amber-50 p-3"><strong className="block text-xl">{pendingArticles.length}</strong><span className="text-xs text-gray-500">stories</span></div></div><button type="button" onClick={() => setTab(pendingCompanies.length ? 'companies' : 'reviews')} className="career-text-button mt-4">Open review queue <span aria-hidden="true">→</span></button></article><article className="card"><h2 className="font-semibold text-gray-900">Publishing integrity</h2><p className="mt-2 text-sm leading-6 text-gray-600">Company cards are visible to students only after verification. Linked opportunities and workshops also require the linked company to be verified. Campus listings can be published without claiming an industry partnership.</p><p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><CheckCircle2 size={14} />Verification is administrator-controlled</p></article></div></section>}

      {tab === 'companies' && <section className="grid gap-4 xl:grid-cols-[minmax(280px,0.8fr)_minmax(0,1.4fr)]"><form onSubmit={createCompany} className="card space-y-3"><div><p className="text-xs font-bold uppercase text-emerald-700">Company verification</p><h2 className="mt-1 font-semibold text-gray-900">Add a campus collaborator</h2><p className="mt-1 text-xs leading-5 text-gray-500">New records stay hidden from students until you verify them.</p></div><FormField label="Company name"><input required className="input" value={companyForm.name} onChange={event => setCompanyForm({ ...companyForm, name: event.target.value })} /></FormField><div className="grid gap-3 sm:grid-cols-2"><FormField label="Website"><input type="url" className="input" value={companyForm.website} onChange={event => setCompanyForm({ ...companyForm, website: event.target.value })} placeholder="https://" /></FormField><FormField label="Industry"><input className="input" value={companyForm.industry} onChange={event => setCompanyForm({ ...companyForm, industry: event.target.value })} placeholder="Software / IT" /></FormField><FormField label="Contact name"><input className="input" value={companyForm.contact_name} onChange={event => setCompanyForm({ ...companyForm, contact_name: event.target.value })} /></FormField><FormField label="Contact email"><input type="email" className="input" value={companyForm.contact_email} onChange={event => setCompanyForm({ ...companyForm, contact_email: event.target.value })} /></FormField></div><FormField label="Company description"><textarea rows="3" className="input resize-y" value={companyForm.description} onChange={event => setCompanyForm({ ...companyForm, description: event.target.value })} /></FormField><fieldset><legend className="mb-2 text-xs font-semibold text-gray-600">Campus collaboration types</legend><div className="grid grid-cols-2 gap-2">{COLLABORATION_TYPES.map(type => <label key={type} className="flex items-center gap-2 text-xs text-gray-600"><input type="checkbox" checked={companyForm.collaboration_types.includes(type)} onChange={event => setCompanyForm({ ...companyForm, collaboration_types: event.target.checked ? [...companyForm.collaboration_types, type] : companyForm.collaboration_types.filter(item => item !== type) })} />{type}</label>)}</div></fieldset><button type="submit" disabled={busy === 'company-create'} className="btn-primary w-full justify-center"><Plus size={15} />Submit for verification</button></form><div className="space-y-3">{data.companies.length ? data.companies.map(company => <article className="card" key={company.id}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-gray-900">{company.name}</h3><span className={`rounded px-2 py-1 text-[11px] font-bold capitalize ${company.verification_status === 'verified' ? 'bg-emerald-50 text-emerald-700' : company.verification_status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{company.verification_status}</span></div><p className="mt-1 text-xs text-gray-500">{company.industry || 'Industry not listed'}{company.website ? ` · ${company.website}` : ''}</p><p className="mt-2 text-sm text-gray-600">{company.description}</p><div className="mt-3 flex flex-wrap gap-1.5">{data.collaborations.filter(item => item.company_id === company.id).map(item => <span className="rounded border border-gray-200 px-2 py-1 text-[11px] text-gray-600" key={item.id}>{item.collaboration_type} · {item.verification_status}</span>)}</div>{company.contact_email && <p className="mt-2 text-xs text-gray-500">Contact: {company.contact_name} · {company.contact_email}</p>}</div><div className="flex shrink-0 gap-2">{company.verification_status !== 'verified' && <button type="button" disabled={busy === `company-${company.id}`} onClick={() => setCompanyStatus(company, 'verified')} className="btn-primary min-h-8! w-auto! px-2.5 text-xs"><Check size={13} />Verify</button>}{company.verification_status !== 'rejected' && <button type="button" disabled={busy === `company-${company.id}`} onClick={() => setCompanyStatus(company, 'rejected')} className="btn-secondary min-h-8! w-auto! px-2.5 text-xs text-red-700"><XCircle size={13} />Reject</button>}</div></div></article>) : <div className="card py-12 text-center"><Building2 size={27} className="mx-auto text-gray-300" /><p className="mt-3 text-sm font-semibold text-gray-700">No companies added</p><p className="mt-1 text-xs text-gray-500">Add organizations only when there is a real campus collaboration to verify.</p></div>}</div></section>}

      {tab === 'opportunities' && <section className="space-y-4"><form onSubmit={createOpportunity} className="card"><div className="mb-4"><p className="text-xs font-bold uppercase text-emerald-700">Campus opportunity board</p><h2 className="mt-1 font-semibold text-gray-900">Publish an opportunity</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><FormField label="Title"><input required className="input" value={opportunityForm.title} onChange={event => setOpportunityForm({ ...opportunityForm, title: event.target.value })} /></FormField><FormField label="Role"><input className="input" value={opportunityForm.role} onChange={event => setOpportunityForm({ ...opportunityForm, role: event.target.value })} placeholder="Frontend intern" /></FormField><FormField label="Type"><select className="input" value={opportunityForm.opportunity_type} onChange={event => setOpportunityForm({ ...opportunityForm, opportunity_type: event.target.value })}>{OPPORTUNITY_TYPES.map(type => <option key={type}>{type}</option>)}</select></FormField><FormField label="Verified company (optional)"><select className="input" value={opportunityForm.company_id} onChange={event => setOpportunityForm({ ...opportunityForm, company_id: event.target.value })}><option value="">Campus listing</option>{verifiedCompanies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></FormField><FormField label="Location"><input className="input" value={opportunityForm.location} onChange={event => setOpportunityForm({ ...opportunityForm, location: event.target.value })} placeholder="Campus / City" /></FormField><FormField label="Mode"><select className="input" value={opportunityForm.mode} onChange={event => setOpportunityForm({ ...opportunityForm, mode: event.target.value })}><option value="on_campus">On campus</option><option value="remote">Remote</option><option value="hybrid">Hybrid</option></select></FormField><FormField label="Deadline"><input type="date" className="input" value={opportunityForm.deadline} onChange={event => setOpportunityForm({ ...opportunityForm, deadline: event.target.value })} /></FormField><FormField label="Required skills"><input className="input" value={opportunityForm.required_skills} onChange={event => setOpportunityForm({ ...opportunityForm, required_skills: event.target.value })} placeholder="React, JavaScript, Git" /></FormField><FormField label="Eligibility"><input className="input" value={opportunityForm.eligibility} onChange={event => setOpportunityForm({ ...opportunityForm, eligibility: event.target.value })} /></FormField><FormField label="Application method"><input className="input" value={opportunityForm.application_method} onChange={event => setOpportunityForm({ ...opportunityForm, application_method: event.target.value })} placeholder="Apply through campus placement cell" /></FormField><FormField label="Official application URL"><input type="url" className="input" value={opportunityForm.application_url} onChange={event => setOpportunityForm({ ...opportunityForm, application_url: event.target.value })} placeholder="https://" /></FormField><FormField label="Description" wide><textarea rows="3" className="input resize-y" value={opportunityForm.description} onChange={event => setOpportunityForm({ ...opportunityForm, description: event.target.value })} /></FormField></div><button type="submit" disabled={busy === 'opportunity-create'} className="btn-primary mt-4"><Plus size={15} />Publish opportunity</button></form><div className="space-y-2">{data.opportunities.map(item => <article key={item.id} className="card flex flex-wrap items-center justify-between gap-3"><div><div className="flex flex-wrap items-center gap-2"><strong className="text-sm text-gray-900">{item.title}</strong><span className="badge bg-blue-50 text-blue-700">{item.opportunity_type}</span></div><p className="mt-1 text-xs text-gray-500">{data.companies.find(company => company.id === item.company_id)?.name || 'Campus listing'} · {item.status}</p></div><div className="flex gap-2">{item.status !== 'published' && <button type="button" onClick={() => changeListingStatus('opportunities', item, 'published')} className="btn-primary min-h-8! w-auto! px-2.5 text-xs">Publish</button>}{item.status === 'published' && <button type="button" onClick={() => changeListingStatus('opportunities', item, 'closed')} className="btn-secondary min-h-8! w-auto! px-2.5 text-xs">Close</button>}</div></article>)}{!data.opportunities.length && <p className="card py-6 text-center text-sm text-gray-500">No opportunities have been created.</p>}</div></section>}

      {tab === 'workshops' && <section className="space-y-4"><form onSubmit={createWorkshop} className="card"><div className="mb-4"><p className="text-xs font-bold uppercase text-emerald-700">Campus workshops</p><h2 className="mt-1 font-semibold text-gray-900">Publish a learning session</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3"><FormField label="Workshop title"><input required className="input" value={workshopForm.title} onChange={event => setWorkshopForm({ ...workshopForm, title: event.target.value })} /></FormField><FormField label="Organizer"><input required className="input" value={workshopForm.organizer} onChange={event => setWorkshopForm({ ...workshopForm, organizer: event.target.value })} /></FormField><FormField label="Verified company (optional)"><select className="input" value={workshopForm.company_id} onChange={event => setWorkshopForm({ ...workshopForm, company_id: event.target.value })}><option value="">Campus only</option>{verifiedCompanies.map(company => <option key={company.id} value={company.id}>{company.name}</option>)}</select></FormField><FormField label="Starts"><input required type="datetime-local" className="input" value={workshopForm.starts_at} onChange={event => setWorkshopForm({ ...workshopForm, starts_at: event.target.value })} /></FormField><FormField label="Ends"><input type="datetime-local" className="input" value={workshopForm.ends_at} onChange={event => setWorkshopForm({ ...workshopForm, ends_at: event.target.value })} /></FormField><FormField label="Registration deadline"><input type="datetime-local" className="input" value={workshopForm.registration_deadline} onChange={event => setWorkshopForm({ ...workshopForm, registration_deadline: event.target.value })} /></FormField><FormField label="Location"><input className="input" value={workshopForm.location} onChange={event => setWorkshopForm({ ...workshopForm, location: event.target.value })} placeholder="Room / link" /></FormField><FormField label="Capacity"><input type="number" min="1" className="input" value={workshopForm.capacity} onChange={event => setWorkshopForm({ ...workshopForm, capacity: event.target.value })} /></FormField><FormField label="Topics"><input className="input" value={workshopForm.topics} onChange={event => setWorkshopForm({ ...workshopForm, topics: event.target.value })} placeholder="React, REST APIs, SQL" /></FormField><FormField label="Description" wide><textarea rows="3" className="input resize-y" value={workshopForm.description} onChange={event => setWorkshopForm({ ...workshopForm, description: event.target.value })} /></FormField><label className="flex items-center gap-2 text-xs font-semibold text-gray-600"><input type="checkbox" checked={workshopForm.certificate_available} onChange={event => setWorkshopForm({ ...workshopForm, certificate_available: event.target.checked })} />Certificate offered</label></div><button type="submit" disabled={busy === 'workshop-create'} className="btn-primary mt-4"><Plus size={15} />Publish workshop</button></form><div className="grid gap-3 xl:grid-cols-2">{data.workshops.map(workshop => <article key={workshop.id} className="card"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-gray-900">{workshop.title}</h3><p className="mt-1 text-xs text-gray-500">{new Date(workshop.starts_at).toLocaleString()} · {workshop.location || 'Location not set'}</p><p className="mt-1 text-xs text-gray-500">{data.registrations.filter(item => item.workshop_id === workshop.id && item.status === 'registered').length} registered · {data.registrations.filter(item => item.workshop_id === workshop.id && item.status === 'attended').length} attended</p></div><span className="badge bg-emerald-50 text-emerald-700">{workshop.status}</span></div><div className="mt-3 space-y-1.5">{data.registrations.filter(item => item.workshop_id === workshop.id).map(registration => <div key={registration.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-gray-100 pt-2 text-xs"><span className="text-gray-600">{registration.student_name || `Student ${String(registration.user_id).slice(0, 8)}`} · {registration.status}</span>{registration.status === 'registered' && <button type="button" disabled={busy === `registration-${registration.id}`} onClick={() => setAttendance(registration, 'attended')} className="career-text-button"><Check size={13} />Mark attended</button>}</div>)}</div><div className="mt-3 flex gap-2">{workshop.status !== 'published' && <button type="button" onClick={() => changeListingStatus('workshops', workshop, 'published')} className="btn-primary min-h-8! w-auto! px-2.5 text-xs">Publish</button>}{workshop.status === 'published' && <button type="button" onClick={() => changeListingStatus('workshops', workshop, 'closed')} className="btn-secondary min-h-8! w-auto! px-2.5 text-xs">Close registration</button>}</div></article>)}{!data.workshops.length && <p className="card py-6 text-center text-sm text-gray-500">No workshops have been scheduled.</p>}</div></section>}

      {tab === 'content' && <section className="space-y-4"><div className="grid gap-3 xl:grid-cols-2"><form className="card space-y-3" onSubmit={createPath}><div><p className="text-xs font-bold uppercase text-emerald-700">Career paths</p><h2 className="mt-1 font-semibold text-gray-900">Add a path</h2></div><div className="grid gap-3 sm:grid-cols-2"><FormField label="Title"><input required className="input" value={pathForm.title} onChange={event => setPathForm({ ...pathForm, title: event.target.value })} /></FormField><FormField label="Category"><input required className="input" value={pathForm.category} onChange={event => setPathForm({ ...pathForm, category: event.target.value })} /></FormField></div><FormField label="Summary"><input required className="input" value={pathForm.summary} onChange={event => setPathForm({ ...pathForm, summary: event.target.value })} /></FormField><FormField label="Description"><textarea rows="2" className="input resize-y" value={pathForm.description} onChange={event => setPathForm({ ...pathForm, description: event.target.value })} /></FormField><FormField label="Roadmap stages, one per line"><textarea rows="4" className="input resize-y" value={pathForm.roadmap} onChange={event => setPathForm({ ...pathForm, roadmap: event.target.value })} /></FormField><button type="submit" disabled={busy === 'path-create'} className="btn-primary"><Plus size={14} />Add path</button><div className="max-h-48 space-y-1 overflow-auto">{data.paths.map(path => <div key={path.id} className="flex items-center justify-between gap-2 border-t border-gray-100 py-2 text-xs"><span className="truncate">{path.title} · {path.category}</span><button type="button" onClick={() => changePathStatus(path)} className="career-text-button">{path.is_active ? 'Hide' : 'Activate'}</button></div>)}</div></form>
        <div className="space-y-3"><form className="card space-y-3" onSubmit={createSkill}><div><p className="text-xs font-bold uppercase text-emerald-700">Skills</p><h2 className="mt-1 font-semibold text-gray-900">Add skill details</h2></div><FormField label="Career path"><select required className="input" value={skillForm.career_path_id} onChange={event => setSkillForm({ ...skillForm, career_path_id: event.target.value })}><option value="">Choose path</option>{data.paths.map(path => <option key={path.id} value={path.id}>{path.title}</option>)}</select></FormField><FormField label="Skill"><input required className="input" value={skillForm.name} onChange={event => setSkillForm({ ...skillForm, name: event.target.value })} /></FormField><FormField label="Why it matters"><textarea rows="2" className="input resize-y" value={skillForm.why_it_matters} onChange={event => setSkillForm({ ...skillForm, why_it_matters: event.target.value })} /></FormField><FormField label="Topics, comma-separated"><input className="input" value={skillForm.topics} onChange={event => setSkillForm({ ...skillForm, topics: event.target.value })} /></FormField><button type="submit" disabled={busy === 'skill-create'} className="btn-primary"><Plus size={14} />Add skill</button></form>
          <form className="card space-y-3" onSubmit={createResource}><div><p className="text-xs font-bold uppercase text-emerald-700">Learning resources</p><h2 className="mt-1 font-semibold text-gray-900">Add a resource</h2></div><FormField label="Skill"><select required className="input" value={resourceForm.career_skill_id} onChange={event => setResourceForm({ ...resourceForm, career_skill_id: event.target.value })}><option value="">Choose skill</option>{data.skills.map(skill => <option key={skill.id} value={skill.id}>{data.paths.find(path => path.id === skill.career_path_id)?.title || 'Professional'} · {skill.name}</option>)}</select></FormField><div className="grid gap-3 sm:grid-cols-2"><FormField label="Title"><input required className="input" value={resourceForm.title} onChange={event => setResourceForm({ ...resourceForm, title: event.target.value })} /></FormField><FormField label="Type"><select className="input" value={resourceForm.resource_type} onChange={event => setResourceForm({ ...resourceForm, resource_type: event.target.value })}><option>Documentation</option><option>Tutorial</option><option>Practice</option><option>Project</option></select></FormField></div><FormField label="URL"><input required type="url" className="input" value={resourceForm.url} onChange={event => setResourceForm({ ...resourceForm, url: event.target.value })} placeholder="https://" /></FormField><button type="submit" disabled={busy === 'resource-create'} className="btn-primary"><Plus size={14} />Add resource</button></form></div></div>
        <form className="card space-y-3" onSubmit={createProject}><div><p className="text-xs font-bold uppercase text-emerald-700">Project briefs</p><h2 className="mt-1 font-semibold text-gray-900">Add a practical project</h2></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><FormField label="Career path"><select required className="input" value={projectForm.career_path_id} onChange={event => setProjectForm({ ...projectForm, career_path_id: event.target.value })}><option value="">Choose path</option>{data.paths.map(path => <option value={path.id} key={path.id}>{path.title}</option>)}</select></FormField><FormField label="Title"><input required className="input" value={projectForm.title} onChange={event => setProjectForm({ ...projectForm, title: event.target.value })} /></FormField><FormField label="Difficulty"><select className="input" value={projectForm.difficulty} onChange={event => setProjectForm({ ...projectForm, difficulty: event.target.value })}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></FormField><FormField label="Description"><input className="input" value={projectForm.description} onChange={event => setProjectForm({ ...projectForm, description: event.target.value })} /></FormField><FormField label="Requirements, one per line" wide><textarea rows="3" className="input resize-y" value={projectForm.requirements} onChange={event => setProjectForm({ ...projectForm, requirements: event.target.value })} /></FormField></div><button type="submit" disabled={busy === 'project-create'} className="btn-primary"><Plus size={14} />Add project</button></form></section>}

      {tab === 'reviews' && <section className="grid gap-4 xl:grid-cols-2"><div className="space-y-3"><div className="flex items-center gap-2"><Award size={18} className="text-emerald-700" /><h2 className="font-semibold text-gray-900">Certification review</h2><span className="badge bg-amber-50 text-amber-700">{pendingCertifications.length} pending</span></div>{pendingCertifications.map(certification => <article key={certification.id} className="card flex flex-wrap items-center justify-between gap-3"><div><strong className="text-sm text-gray-900">{certification.name}</strong><p className="mt-1 text-xs text-gray-500">{certification.provider || 'Provider not listed'} · {certification.user_id.slice(0, 8)}</p>{certification.credential_url && <a href={certification.credential_url} target="_blank" rel="noreferrer" className="career-text-button mt-2">Credential link</a>}</div><div className="flex gap-2"><button type="button" disabled={busy === `certifications-${certification.id}`} onClick={() => reviewRecord('certifications', certification, 'verified')} className="btn-primary min-h-8! w-auto! px-2.5 text-xs"><Check size={13} />Verify</button><button type="button" disabled={busy === `certifications-${certification.id}`} onClick={() => reviewRecord('certifications', certification, 'rejected')} className="btn-secondary min-h-8! w-auto! px-2.5 text-xs text-red-700">Reject</button></div></article>)}{!pendingCertifications.length && <p className="card py-6 text-center text-sm text-gray-500">No certifications waiting for review.</p>}</div><div className="space-y-3"><div className="flex items-center gap-2"><FileText size={18} className="text-emerald-700" /><h2 className="font-semibold text-gray-900">Career stories</h2><span className="badge bg-amber-50 text-amber-700">{pendingArticles.length} pending</span></div>{pendingArticles.map(article => <article key={article.id} className="card"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-gray-900">{article.title}</h3><p className="mt-1 text-xs text-gray-500">{article.author_display} · {article.skills_learned?.join(', ')}</p></div><span className="badge bg-gray-100 text-gray-600">{article.project_count} projects</span></div><p className="mt-3 text-sm text-gray-600">{article.summary}</p><details className="mt-2"><summary className="cursor-pointer text-xs font-semibold text-emerald-700">Read submission</summary><p className="mt-2 whitespace-pre-line text-sm leading-6 text-gray-600">{article.content}</p></details><div className="mt-3 flex gap-2"><button type="button" disabled={busy === `career_articles-${article.id}`} onClick={() => reviewRecord('career_articles', article, 'published')} className="btn-primary min-h-8! w-auto! px-2.5 text-xs"><Check size={13} />Publish</button><button type="button" disabled={busy === `career_articles-${article.id}`} onClick={() => reviewRecord('career_articles', article, 'rejected')} className="btn-secondary min-h-8! w-auto! px-2.5 text-xs text-red-700">Reject</button></div></article>)}{!pendingArticles.length && <p className="card py-6 text-center text-sm text-gray-500">No career stories waiting for review.</p>}</div></section>}
    </div>
  )
}